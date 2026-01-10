"""Unit tests for balatrobench.cli module."""

from pathlib import Path

from balatrobench.cli import (
    VERSION_PARTS_PATTERN,
    VERSION_PATTERN,
    _find_versions,
    _version_sort_key,
    create_parser,
    infer_version,
)


class TestVersionPattern:
    """Tests for VERSION_PATTERN regex."""

    def test_version_pattern_matches(self) -> None:
        """VERSION_PATTERN matches valid semantic version strings."""
        valid_versions = [
            "v1.0.0",
            "v0.0.1",
            "v10.20.30",
            "v999.999.999",
            "v2.1.0",
        ]
        for version in valid_versions:
            assert VERSION_PATTERN.match(version) is not None, f"{version} should match"

    def test_version_pattern_rejects(self) -> None:
        """VERSION_PATTERN rejects malformed version strings."""
        invalid_versions = [
            "1.0.0",  # Missing 'v' prefix
            "v1.0",  # Missing patch version
            "v1",  # Missing minor and patch
            "v1.0.0.0",  # Extra version component
            "v1.0.0-beta",  # Has suffix
            "version1.0.0",  # Wrong prefix
            "V1.0.0",  # Uppercase V
            "v1.0.0 ",  # Trailing space
            " v1.0.0",  # Leading space
            "v1.a.0",  # Non-numeric component
            "",  # Empty string
        ]
        for version in invalid_versions:
            assert VERSION_PATTERN.match(version) is None, f"{version} should not match"


class TestVersionPartsPattern:
    """Tests for VERSION_PARTS_PATTERN regex."""

    def test_version_parts_pattern_extracts_groups(self) -> None:
        """VERSION_PARTS_PATTERN extracts major, minor, patch groups."""
        match = VERSION_PARTS_PATTERN.match("v1.2.3")
        assert match is not None
        assert match.group(1) == "1"
        assert match.group(2) == "2"
        assert match.group(3) == "3"

    def test_version_parts_pattern_multi_digit(self) -> None:
        """VERSION_PARTS_PATTERN handles multi-digit version numbers."""
        match = VERSION_PARTS_PATTERN.match("v10.200.3000")
        assert match is not None
        assert match.group(1) == "10"
        assert match.group(2) == "200"
        assert match.group(3) == "3000"


class TestInferVersion:
    """Tests for infer_version function."""

    def test_infer_version_valid(self) -> None:
        """Extracts version from path ending with version directory."""
        path = Path("/path/to/v1.0.0")
        assert infer_version(path) == "v1.0.0"

    def test_infer_version_nested(self, tmp_path: Path) -> None:
        """Returns default when path has version in parent but not leaf."""
        # Path like /path/to/v1.0.0/subdir - the leaf is "subdir" not the version
        path = tmp_path / "v1.0.0" / "subdir"
        # Since the function only checks .name (the leaf), this returns default
        assert infer_version(path) == "v1.0.0"  # Default fallback

    def test_infer_version_invalid(self) -> None:
        """Returns default for non-versioned paths."""
        invalid_paths = [
            Path("/path/to/runs"),
            Path("/some/other/directory"),
            Path("relative/path"),
            Path("1.0.0"),  # No 'v' prefix
        ]
        for path in invalid_paths:
            assert infer_version(path) == "v1.0.0", f"{path} should return default"


class TestVersionSortKey:
    """Tests for _version_sort_key function."""

    def test_version_sort_key(self) -> None:
        """Converts 'v1.2.3' to (1, 2, 3) tuple."""
        assert _version_sort_key("v1.2.3") == (1, 2, 3)
        assert _version_sort_key("v0.0.0") == (0, 0, 0)
        assert _version_sort_key("v10.20.30") == (10, 20, 30)

    def test_version_sort_key_invalid_returns_zeros(self) -> None:
        """Invalid version strings return (0, 0, 0)."""
        assert _version_sort_key("invalid") == (0, 0, 0)
        assert _version_sort_key("1.0.0") == (0, 0, 0)  # Missing 'v'
        assert _version_sort_key("") == (0, 0, 0)

    def test_version_sort_key_enables_sorting(self) -> None:
        """Version sort key enables correct version ordering."""
        versions = ["v1.0.0", "v2.0.0", "v1.10.0", "v1.2.0", "v10.0.0"]
        sorted_versions = sorted(versions, key=_version_sort_key)
        assert sorted_versions == ["v1.0.0", "v1.2.0", "v1.10.0", "v2.0.0", "v10.0.0"]


class TestFindVersions:
    """Tests for _find_versions function."""

    def test_find_versions_empty_dir(self, tmp_path: Path) -> None:
        """Returns empty list for directory with no version subdirs."""
        assert _find_versions(tmp_path) == []

    def test_find_versions_nonexistent_dir(self, tmp_path: Path) -> None:
        """Returns empty list for nonexistent directory."""
        nonexistent = tmp_path / "does_not_exist"
        assert _find_versions(nonexistent) == []

    def test_find_versions_finds_version_dirs(self, tmp_path: Path) -> None:
        """Finds version directories matching pattern."""
        # Create version directories
        (tmp_path / "v1.0.0").mkdir()
        (tmp_path / "v2.0.0").mkdir()
        (tmp_path / "v1.5.3").mkdir()
        # Create non-version items
        (tmp_path / "other").mkdir()
        (tmp_path / "file.txt").touch()

        versions = _find_versions(tmp_path)
        assert set(versions) == {"v1.0.0", "v2.0.0", "v1.5.3"}

    def test_find_versions_ignores_files(self, tmp_path: Path) -> None:
        """Only finds directories, not files matching pattern."""
        (tmp_path / "v1.0.0").mkdir()
        (tmp_path / "v2.0.0").touch()  # File, not directory

        versions = _find_versions(tmp_path)
        assert versions == ["v1.0.0"]


class TestCreateParser:
    """Tests for create_parser function."""

    def test_create_parser(self) -> None:
        """Parser has expected arguments."""
        parser = create_parser()

        # Check parser metadata
        assert parser.prog == "balatrobench"

        # Parse with no arguments to check defaults
        args = parser.parse_args([])
        assert args.input_dir is None
        assert args.output_dir == Path("site/benchmarks")
        assert args.version is None
        assert args.webp is False

    def test_create_parser_with_arguments(self) -> None:
        """Parser correctly parses all arguments."""
        parser = create_parser()

        args = parser.parse_args(
            [
                "--input-dir",
                "/path/to/runs/v1.0.0",
                "--output-dir",
                "/custom/output",
                "--version",
                "v2.0.0",
                "--webp",
            ]
        )

        assert args.input_dir == Path("/path/to/runs/v1.0.0")
        assert args.output_dir == Path("/custom/output")
        assert args.version == "v2.0.0"
        assert args.webp is True

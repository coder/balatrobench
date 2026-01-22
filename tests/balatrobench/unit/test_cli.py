"""Unit tests for balatrobench.cli module."""

from pathlib import Path

import pytest

from balatrobench import __version__
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
        assert infer_version(path) == f"v{__version__}"  # Default fallback

    def test_infer_version_invalid(self) -> None:
        """Returns default for non-versioned paths."""
        invalid_paths = [
            Path("/path/to/runs"),
            Path("/some/other/directory"),
            Path("relative/path"),
            Path("1.0.0"),  # No 'v' prefix
        ]
        for path in invalid_paths:
            assert infer_version(path) == f"v{__version__}", (
                f"{path} should return default"
            )


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

        # Parse with required argument to check defaults
        args = parser.parse_args(["--input-dir", "/some/path"])
        assert args.input_dir == Path("/some/path")
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


# =============================================================================
# main() tests
# =============================================================================


class TestMain:
    """Tests for main() entry point."""

    def test_main_requires_input_dir(
        self,
        tmp_path: Path,
        monkeypatch: pytest.MonkeyPatch,
        capsys: pytest.CaptureFixture,
    ) -> None:
        """main() exits with error when --input-dir is missing."""
        import sys

        from balatrobench.cli import main

        monkeypatch.setattr(sys, "argv", ["balatrobench"])

        with pytest.raises(SystemExit) as exc_info:
            main()

        assert exc_info.value.code == 2
        captured = capsys.readouterr()
        assert "required" in captured.err

    def test_main_exits_when_input_dir_not_found(
        self,
        tmp_path: Path,
        monkeypatch: pytest.MonkeyPatch,
        capsys: pytest.CaptureFixture,
    ) -> None:
        """main() exits with error when input directory doesn't exist."""
        import sys

        from balatrobench.cli import main

        nonexistent = tmp_path / "does_not_exist"
        monkeypatch.setattr(
            sys, "argv", ["balatrobench", "--input-dir", str(nonexistent)]
        )

        with pytest.raises(SystemExit) as exc_info:
            main()

        assert exc_info.value.code == 1
        captured = capsys.readouterr()
        assert "Error: Input directory not found" in captured.out

    def test_main_creates_output_directory(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """main() creates output directory structure."""
        import sys

        from balatrobench.cli import main

        # Create minimal input structure: runs/v1.0.0/strategy/vendor/model/
        input_dir = tmp_path / "runs" / "v1.0.0"
        input_dir.mkdir(parents=True)

        output_dir = tmp_path / "output"
        monkeypatch.setattr(
            sys,
            "argv",
            [
                "balatrobench",
                "--input-dir",
                str(input_dir),
                "--output-dir",
                str(output_dir),
            ],
        )

        # Should not raise - handles empty input gracefully
        main()

        # Output directory should exist (models and strategies subdirs)
        assert output_dir.exists()
        assert (output_dir / "models").exists()
        assert (output_dir / "strategies").exists()

    def test_main_version_normalization(
        self,
        tmp_path: Path,
        monkeypatch: pytest.MonkeyPatch,
        capsys: pytest.CaptureFixture,
    ) -> None:
        """main() normalizes version by adding 'v' prefix if missing."""
        import sys

        from balatrobench.cli import main

        input_dir = tmp_path / "runs" / "1.0.0"  # No 'v' prefix
        input_dir.mkdir(parents=True)

        output_dir = tmp_path / "output"
        monkeypatch.setattr(
            sys,
            "argv",
            [
                "balatrobench",
                "--input-dir",
                str(input_dir),
                "--output-dir",
                str(output_dir),
                "--version",
                "1.2.3",  # No 'v' prefix
            ],
        )

        main()

        captured = capsys.readouterr()
        # Version should be normalized to v1.2.3
        assert "Version: v1.2.3" in captured.out

    def test_main_infers_version_from_path(
        self,
        tmp_path: Path,
        monkeypatch: pytest.MonkeyPatch,
        capsys: pytest.CaptureFixture,
    ) -> None:
        """main() infers version from input-dir path when not specified."""
        import sys

        from balatrobench.cli import main

        input_dir = tmp_path / "runs" / "v2.5.0"
        input_dir.mkdir(parents=True)

        output_dir = tmp_path / "output"
        monkeypatch.setattr(
            sys,
            "argv",
            [
                "balatrobench",
                "--input-dir",
                str(input_dir),
                "--output-dir",
                str(output_dir),
            ],
        )

        main()

        captured = capsys.readouterr()
        assert "Version: v2.5.0" in captured.out

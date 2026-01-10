"""Integration tests for the full benchmark pipeline.

Tests the complete CLI → BenchmarkAnalyzer → BenchmarkWriter output flow.
"""

import json
from pathlib import Path

import pytest

from balatrobench.analyzer import BenchmarkAnalyzer
from balatrobench.writer import BenchmarkWriter


@pytest.mark.integration
class TestBenchmarkOutputStructure:
    """Test that the analyzer+writer produces correct output directory structure."""

    def test_benchmark_output_structure(
        self, version_dir: Path, temp_output_dir: Path
    ) -> None:
        """Run analyzer+writer, verify output directory structure."""
        # Arrange
        analyzer = BenchmarkAnalyzer(
            runs_dir=version_dir.parent, output_dir=temp_output_dir
        )
        writer = BenchmarkWriter(output_dir=temp_output_dir)

        # Act - analyze models and write output
        models_data = analyzer.analyze_models(version_dir)

        version = version_dir.name  # "v1.0.0"

        for strategy_name, runs_list in models_data.items():
            # Write leaderboard
            if runs_list:
                leaderboard = analyzer.create_models_leaderboard(
                    runs_list[0].strategy, runs_list
                )
                writer.write_models_leaderboard(leaderboard, version, strategy_name)

                # Write runs files
                for runs in runs_list:
                    writer.write_runs(runs, version, strategy_name)

        # Assert - verify directory structure
        assert temp_output_dir.exists(), "Output directory should exist"

        # Check version directory
        version_output = temp_output_dir / version
        assert version_output.exists(), f"Version directory {version} should exist"

        # Check strategy directories
        strategy_dirs = list(version_output.iterdir())
        assert len(strategy_dirs) >= 1, "Should have at least one strategy directory"

        # Check that leaderboard.json exists in strategy directory
        for strategy_dir in strategy_dirs:
            if strategy_dir.is_dir():
                leaderboard_file = strategy_dir / "leaderboard.json"
                assert leaderboard_file.exists(), (
                    f"leaderboard.json should exist in {strategy_dir.name}"
                )

                # Check vendor directories exist
                vendor_dirs = [d for d in strategy_dir.iterdir() if d.is_dir()]
                assert len(vendor_dirs) >= 1, (
                    "Should have at least one vendor directory"
                )

                # Check model JSON files exist
                for vendor_dir in vendor_dirs:
                    model_files = list(vendor_dir.glob("*.json"))
                    assert len(model_files) >= 1, (
                        f"Should have model JSON files in {vendor_dir.name}"
                    )


@pytest.mark.integration
class TestManifestGeneration:
    """Test manifest.json generation."""

    def test_manifest_generation(self, temp_output_dir: Path) -> None:
        """Generated manifest.json has correct versions."""
        # Arrange
        writer = BenchmarkWriter(output_dir=temp_output_dir)
        versions = ["v1.0.0", "v0.16.0"]
        latest = "v1.0.0"

        # Act
        manifest_path = writer.write_manifest(versions, latest)

        # Assert
        assert manifest_path.exists(), "manifest.json should be created"
        assert manifest_path.name == "manifest.json"

        with manifest_path.open() as f:
            manifest = json.load(f)

        assert "versions" in manifest, "Manifest should have 'versions' key"
        assert len(manifest["versions"]) == 2, "Should have 2 versions"

        # Check version entries
        version_map = {v["version"]: v["latest"] for v in manifest["versions"]}
        assert "v1.0.0" in version_map, "Should contain v1.0.0"
        assert "v0.16.0" in version_map, "Should contain v0.16.0"
        assert version_map["v1.0.0"] is True, "v1.0.0 should be marked as latest"
        assert version_map["v0.16.0"] is False, "v0.16.0 should not be latest"

    def test_manifest_single_version(self, temp_output_dir: Path) -> None:
        """Manifest works with a single version."""
        # Arrange
        writer = BenchmarkWriter(output_dir=temp_output_dir)

        # Act
        manifest_path = writer.write_manifest(["v1.0.0"], "v1.0.0")

        # Assert
        with manifest_path.open() as f:
            manifest = json.load(f)

        assert len(manifest["versions"]) == 1
        assert manifest["versions"][0]["version"] == "v1.0.0"
        assert manifest["versions"][0]["latest"] is True


@pytest.mark.integration
class TestLeaderboardJsonValid:
    """Test leaderboard.json generation and validity."""

    def test_leaderboard_json_valid(
        self, version_dir: Path, temp_output_dir: Path
    ) -> None:
        """Generated leaderboard.json is valid JSON with expected keys."""
        # Arrange
        analyzer = BenchmarkAnalyzer(
            runs_dir=version_dir.parent, output_dir=temp_output_dir
        )
        writer = BenchmarkWriter(output_dir=temp_output_dir)

        # Act
        models_data = analyzer.analyze_models(version_dir)
        version = version_dir.name

        leaderboard_paths: list[Path] = []
        for strategy_name, runs_list in models_data.items():
            if runs_list:
                leaderboard = analyzer.create_models_leaderboard(
                    runs_list[0].strategy, runs_list
                )
                path = writer.write_models_leaderboard(
                    leaderboard, version, strategy_name
                )
                leaderboard_paths.append(path)

        # Assert
        assert len(leaderboard_paths) >= 1, "Should generate at least one leaderboard"

        for leaderboard_path in leaderboard_paths:
            assert leaderboard_path.exists()

            with leaderboard_path.open() as f:
                data = json.load(f)

            # Check top-level keys
            assert "generated_at" in data, "Should have 'generated_at' timestamp"
            assert "strategy" in data, "Should have 'strategy' object"
            assert "entries" in data, "Should have 'entries' list"

            # Check strategy structure
            strategy = data["strategy"]
            assert "name" in strategy, "Strategy should have 'name'"
            assert "version" in strategy, "Strategy should have 'version'"

            # Check entries structure
            assert isinstance(data["entries"], list), "entries should be a list"
            for entry in data["entries"]:
                # Check leaderboard entry keys
                assert "run_count" in entry, "Entry should have 'run_count'"
                assert "run_wins" in entry, "Entry should have 'run_wins'"
                assert "run_completed" in entry, "Entry should have 'run_completed'"
                assert "avg_round" in entry, "Entry should have 'avg_round'"
                assert "std_round" in entry, "Entry should have 'std_round'"
                assert "stats" in entry, "Entry should have 'stats'"
                assert "model" in entry, "Entry should have 'model'"

                # Check model structure
                model = entry["model"]
                assert "vendor" in model, "Model should have 'vendor'"
                assert "name" in model, "Model should have 'name'"

                # Check stats structure
                stats = entry["stats"]
                assert "calls_total" in stats, "Stats should have 'calls_total'"
                assert "tokens_in_total" in stats, "Stats should have 'tokens_in_total'"
                assert "cost_total" in stats, "Stats should have 'cost_total'"

    def test_leaderboard_entries_sorted_by_avg_round(
        self, version_dir: Path, temp_output_dir: Path
    ) -> None:
        """Leaderboard entries are sorted by avg_round descending."""
        # Arrange
        analyzer = BenchmarkAnalyzer(
            runs_dir=version_dir.parent, output_dir=temp_output_dir
        )
        writer = BenchmarkWriter(output_dir=temp_output_dir)

        # Act
        models_data = analyzer.analyze_models(version_dir)
        version = version_dir.name

        for strategy_name, runs_list in models_data.items():
            if runs_list:
                leaderboard = analyzer.create_models_leaderboard(
                    runs_list[0].strategy, runs_list
                )
                path = writer.write_models_leaderboard(
                    leaderboard, version, strategy_name
                )

                with path.open() as f:
                    data = json.load(f)

                # Check sorting (descending by avg_round)
                entries = data["entries"]
                if len(entries) > 1:
                    avg_rounds = [e["avg_round"] for e in entries]
                    assert avg_rounds == sorted(avg_rounds, reverse=True), (
                        "Entries should be sorted by avg_round descending"
                    )


@pytest.mark.integration
class TestRunsJsonContent:
    """Test generated {model}.json runs files."""

    def test_runs_json_content(self, version_dir: Path, temp_output_dir: Path) -> None:
        """Generated {model}.json has runs with expected fields."""
        # Arrange
        analyzer = BenchmarkAnalyzer(
            runs_dir=version_dir.parent, output_dir=temp_output_dir
        )
        writer = BenchmarkWriter(output_dir=temp_output_dir)

        # Act
        models_data = analyzer.analyze_models(version_dir)
        version = version_dir.name

        runs_paths: list[Path] = []
        for strategy_name, runs_list in models_data.items():
            for runs in runs_list:
                path = writer.write_runs(runs, version, strategy_name)
                runs_paths.append(path)

        # Assert
        assert len(runs_paths) >= 1, "Should generate at least one runs file"

        for runs_path in runs_paths:
            assert runs_path.exists()
            assert runs_path.suffix == ".json"

            with runs_path.open() as f:
                data = json.load(f)

            # Check top-level structure
            assert "generated_at" in data, "Should have 'generated_at' timestamp"
            assert "model" in data, "Should have 'model' object"
            assert "strategy" in data, "Should have 'strategy' object"
            assert "runs" in data, "Should have 'runs' list"

            # Check model structure
            model = data["model"]
            assert "vendor" in model
            assert "name" in model

            # Check strategy structure
            strategy = data["strategy"]
            assert "name" in strategy
            assert "version" in strategy

            # Check runs list
            assert isinstance(data["runs"], list)
            assert len(data["runs"]) >= 1, "Should have at least one run"

            for run in data["runs"]:
                # Run identification
                assert "id" in run, "Run should have 'id'"
                assert "model" in run, "Run should have 'model'"
                assert "strategy" in run, "Run should have 'strategy'"
                assert "config" in run, "Run should have 'config'"

                # Run outcome
                assert "run_won" in run, "Run should have 'run_won'"
                assert "run_completed" in run, "Run should have 'run_completed'"
                assert "final_ante" in run, "Run should have 'final_ante'"
                assert "final_round" in run, "Run should have 'final_round'"

                # Providers
                assert "providers" in run, "Run should have 'providers'"

                # Stats
                assert "stats" in run, "Run should have 'stats'"
                stats = run["stats"]
                assert "calls_total" in stats
                assert "calls_success" in stats
                assert "tokens_in_total" in stats
                assert "tokens_out_total" in stats
                assert "time_total_ms" in stats
                assert "cost_total" in stats

                # Check config structure
                config = run["config"]
                assert "seed" in config, "Config should have 'seed'"
                assert "deck" in config, "Config should have 'deck'"
                assert "stake" in config, "Config should have 'stake'"

    def test_runs_json_values_match_source(
        self, version_dir: Path, temp_output_dir: Path
    ) -> None:
        """Runs data correctly reflects source stats.json values."""
        # Arrange
        analyzer = BenchmarkAnalyzer(
            runs_dir=version_dir.parent, output_dir=temp_output_dir
        )
        writer = BenchmarkWriter(output_dir=temp_output_dir)

        # Act
        models_data = analyzer.analyze_models(version_dir)
        version = version_dir.name

        for strategy_name, runs_list in models_data.items():
            for runs in runs_list:
                path = writer.write_runs(runs, version, strategy_name)

                with path.open() as f:
                    data = json.load(f)

                # For the known fixture run, verify values match
                for run in data["runs"]:
                    if run["id"] == "20260109_165752_472_RED_WHITE_BBBBBBB":
                        # Values from the fixture stats.json
                        assert run["run_won"] is False
                        assert run["run_completed"] is True
                        assert run["final_ante"] == 2
                        assert run["final_round"] == 4

                        stats = run["stats"]
                        assert stats["calls_total"] == 34
                        assert stats["calls_success"] == 34
                        assert stats["tokens_in_total"] == 455289

                        config = run["config"]
                        assert config["seed"] == "BBBBBBB"
                        assert config["deck"] == "RED"
                        assert config["stake"] == "WHITE"

                        # Model from task.json
                        model = run["model"]
                        assert model["vendor"] == "openai"
                        assert model["name"] == "gpt-oss-120b"

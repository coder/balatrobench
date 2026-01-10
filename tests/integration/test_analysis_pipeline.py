"""Integration tests for the BenchmarkAnalyzer pipeline.

Tests analyzer with real fixture data to verify the full analysis pipeline
produces correct output structures.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from balatrobench.analyzer import BenchmarkAnalyzer
from balatrobench.enums import Deck, Stake
from balatrobench.models import (
    Model,
    ModelsLeaderboard,
    ModelsLeaderboardEntry,
    Run,
    Runs,
    Stats,
    StrategiesLeaderboard,
    StrategiesLeaderboardEntry,
    Strategy,
)


@pytest.mark.integration
class TestAnalyzeModels:
    """Tests for analyze_models() with fixture data."""

    def test_analyze_models_from_fixture(self, version_dir: Path) -> None:
        """Run analyze_models on fixture and verify structure."""
        analyzer = BenchmarkAnalyzer()

        result = analyzer.analyze_models(version_dir)

        # Should return dict mapping strategy names to list of Runs
        assert isinstance(result, dict)
        assert "default" in result

        # Each strategy should have a list of Runs objects
        runs_list = result["default"]
        assert isinstance(runs_list, list)
        assert len(runs_list) >= 1

        # Each item should be a Runs object
        for runs in runs_list:
            assert isinstance(runs, Runs)
            assert runs.generated_at > 0
            assert isinstance(runs.model, Model)
            assert isinstance(runs.strategy, Strategy)
            assert isinstance(runs.runs, tuple)
            assert len(runs.runs) >= 1

    def test_analyze_models_raises_on_missing_dir(self, tmp_path: Path) -> None:
        """analyze_models raises FileNotFoundError for missing directory."""
        analyzer = BenchmarkAnalyzer()
        missing_dir = tmp_path / "nonexistent"

        with pytest.raises(FileNotFoundError, match="Version directory not found"):
            analyzer.analyze_models(missing_dir)


@pytest.mark.integration
class TestAnalyzeStrategies:
    """Tests for analyze_strategies() with fixture data."""

    def test_analyze_strategies_from_fixture(self, version_dir: Path) -> None:
        """Run analyze_strategies on fixture and verify structure."""
        analyzer = BenchmarkAnalyzer()

        result = analyzer.analyze_strategies(version_dir)

        # Should return dict mapping "vendor/model" to list of Runs
        assert isinstance(result, dict)
        assert "openai/gpt-oss-120b" in result

        # Each model should have a list of Runs (one per strategy)
        runs_list = result["openai/gpt-oss-120b"]
        assert isinstance(runs_list, list)
        assert len(runs_list) >= 1

        # Verify each Runs object structure
        for runs in runs_list:
            assert isinstance(runs, Runs)
            assert runs.model.vendor == "openai"
            assert runs.model.name == "gpt-oss-120b"


@pytest.mark.integration
class TestComputeRuns:
    """Tests for Run objects produced by the analyzer."""

    def test_compute_runs_produces_run_objects(self, version_dir: Path) -> None:
        """Verify Run objects have correct fields from fixture data."""
        analyzer = BenchmarkAnalyzer()

        result = analyzer.analyze_models(version_dir)
        runs_obj = result["default"][0]  # First Runs for 'default' strategy
        run = runs_obj.runs[0]  # First Run

        # Verify Run identity
        assert isinstance(run, Run)
        assert run.id == "20260109_165752_472_RED_WHITE_BBBBBBB"

        # Verify Model
        assert run.model.vendor == "openai"
        assert run.model.name == "gpt-oss-120b"

        # Verify Strategy
        assert run.strategy.name == "Default"
        assert run.strategy.version == "1.0.0"
        assert run.strategy.author == "BalatroLLM"

        # Verify Config
        assert run.config.seed == "BBBBBBB"
        assert run.config.deck == Deck.RED
        assert run.config.stake == Stake.WHITE

        # Verify run outcome
        assert run.run_won is False
        assert run.run_completed is True
        assert run.final_ante == 2
        assert run.final_round == 4

        # Verify providers tuple
        assert isinstance(run.providers, tuple)
        providers_dict = dict(run.providers)
        assert providers_dict.get("Groq") == 25
        assert providers_dict.get("Cerebras") == 9

        # Verify Stats
        assert isinstance(run.stats, Stats)
        assert run.stats.calls_total == 34
        assert run.stats.calls_success == 34
        assert run.stats.tokens_in_total == 455289
        assert run.stats.cost_total == pytest.approx(0.1022712, rel=1e-5)


@pytest.mark.integration
class TestLeaderboards:
    """Tests for leaderboard creation from fixture data."""

    def test_leaderboard_has_expected_entry(self, version_dir: Path) -> None:
        """Leaderboard contains expected model entry with correct stats."""
        analyzer = BenchmarkAnalyzer()

        # Analyze models and create leaderboard
        result = analyzer.analyze_models(version_dir)
        runs_list = result["default"]

        # Get the strategy from the first Runs object
        strategy = runs_list[0].strategy

        leaderboard = analyzer.create_models_leaderboard(strategy, runs_list)

        # Verify leaderboard structure
        assert isinstance(leaderboard, ModelsLeaderboard)
        assert leaderboard.generated_at > 0
        assert leaderboard.strategy.name == "Default"
        assert isinstance(leaderboard.entries, tuple)
        assert len(leaderboard.entries) >= 1

        # Find entry for openai/gpt-oss-120b
        entry = next(
            (e for e in leaderboard.entries if e.model.name == "gpt-oss-120b"),
            None,
        )
        assert entry is not None
        assert isinstance(entry, ModelsLeaderboardEntry)

        # Verify entry fields
        assert entry.model.vendor == "openai"
        assert entry.run_count >= 1
        assert entry.run_wins == 0  # No wins in fixture
        assert entry.run_completed >= 1
        assert entry.avg_round == pytest.approx(4.0, rel=1e-2)
        assert isinstance(entry.stats, Stats)
        assert entry.stats.calls_total == 34

    def test_strategies_leaderboard_from_fixture(self, version_dir: Path) -> None:
        """StrategiesLeaderboard is created correctly from fixture data."""
        analyzer = BenchmarkAnalyzer()

        result = analyzer.analyze_strategies(version_dir)
        runs_list = result["openai/gpt-oss-120b"]

        # Get the model from first Runs object
        model = runs_list[0].model

        leaderboard = analyzer.create_strategies_leaderboard(model, runs_list)

        # Verify leaderboard structure
        assert isinstance(leaderboard, StrategiesLeaderboard)
        assert leaderboard.model.vendor == "openai"
        assert leaderboard.model.name == "gpt-oss-120b"
        assert isinstance(leaderboard.entries, tuple)
        assert len(leaderboard.entries) >= 1

        # Verify entry is a StrategiesLeaderboardEntry
        entry = leaderboard.entries[0]
        assert isinstance(entry, StrategiesLeaderboardEntry)
        assert isinstance(entry.strategy, Strategy)
        assert entry.strategy.name == "Default"

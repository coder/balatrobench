"""Unit tests for balatrobench.analyzer module."""

from pathlib import Path
from unittest.mock import patch

import pytest

from balatrobench.analyzer import BenchmarkAnalyzer, _subdirs
from balatrobench.enums import Deck, Stake
from balatrobench.models import (
    Config,
    Model,
    Run,
    Runs,
    Stats,
    Strategy,
)

# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def analyzer() -> BenchmarkAnalyzer:
    """Create a BenchmarkAnalyzer instance."""
    return BenchmarkAnalyzer()


@pytest.fixture
def simple_strategy() -> Strategy:
    """Simple Strategy for local tests (distinct from conftest.sample_strategy)."""
    return Strategy(
        name="Default",
        key="default",
        description="Test strategy",
        author="Test",
        version="1.0.0",
        tags=("test",),
    )


@pytest.fixture
def sample_model_a() -> Model:
    """Sample Model A for tests."""
    return Model(vendor="openai", name="gpt-4o")


@pytest.fixture
def sample_model_b() -> Model:
    """Sample Model B for tests."""
    return Model(vendor="anthropic", name="claude-4")


def make_stats(
    calls_total: int = 100,
    tokens_in_total: int = 10000,
    tokens_out_total: int = 2000,
    tokens_in_avg: float = 100.0,
    tokens_out_avg: float = 20.0,
    tokens_in_std: float = 10.0,
    tokens_out_std: float = 5.0,
    time_total_ms: int = 50000,
    time_avg_ms: float = 500.0,
    time_std_ms: float = 100.0,
    cost_total: float = 1.0,
    cost_avg: float = 0.01,
    cost_std: float = 0.002,
) -> Stats:
    """Create a Stats object with customizable values."""
    return Stats(
        calls_total=calls_total,
        calls_success=calls_total - 5,
        calls_error=3,
        calls_failed=2,
        tokens_in_total=tokens_in_total,
        tokens_out_total=tokens_out_total,
        tokens_in_avg=tokens_in_avg,
        tokens_out_avg=tokens_out_avg,
        tokens_in_std=tokens_in_std,
        tokens_out_std=tokens_out_std,
        time_total_ms=time_total_ms,
        time_avg_ms=time_avg_ms,
        time_std_ms=time_std_ms,
        cost_total=cost_total,
        cost_avg=cost_avg,
        cost_std=cost_std,
    )


def make_run(
    run_id: str,
    model: Model,
    strategy: Strategy,
    final_round: int = 10,
    run_won: bool = False,
    run_completed: bool = True,
    stats: Stats | None = None,
) -> Run:
    """Create a Run object with customizable values."""
    return Run(
        id=run_id,
        model=model,
        strategy=strategy,
        config=Config(seed="AAAAAAA", deck=Deck.RED, stake=Stake.WHITE),
        run_won=run_won,
        run_completed=run_completed,
        final_ante=3,
        final_round=final_round,
        providers=(("OpenAI", 100),),
        stats=stats or make_stats(),
    )


# =============================================================================
# _subdirs helper tests
# =============================================================================


def test_subdirs_helper(tmp_path: Path) -> None:
    """_subdirs correctly lists only directories, not files."""
    # Create some directories
    (tmp_path / "dir1").mkdir()
    (tmp_path / "dir2").mkdir()
    (tmp_path / "dir3").mkdir()

    # Create some files
    (tmp_path / "file1.txt").touch()
    (tmp_path / "file2.json").touch()

    # Get subdirs
    result = list(_subdirs(tmp_path))

    # Should only contain directories
    assert len(result) == 3
    result_names = {p.name for p in result}
    assert result_names == {"dir1", "dir2", "dir3"}


def test_subdirs_empty_directory(tmp_path: Path) -> None:
    """_subdirs returns empty iterator for empty directory."""
    result = list(_subdirs(tmp_path))
    assert result == []


def test_subdirs_only_files(tmp_path: Path) -> None:
    """_subdirs returns empty iterator when only files exist."""
    (tmp_path / "file1.txt").touch()
    (tmp_path / "file2.json").touch()

    result = list(_subdirs(tmp_path))
    assert result == []


# =============================================================================
# _pooled_std_dev_from_runs tests
# =============================================================================


def test_pooled_std_dev_single_run(
    analyzer: BenchmarkAnalyzer,
    sample_model_a: Model,
    simple_strategy: Strategy,
) -> None:
    """Single run with any calls_total <= 1 returns 0 for pooled std dev."""
    # Create a single run with calls_total = 1
    stats = make_stats(calls_total=1, tokens_in_std=10.0, tokens_in_avg=100.0)
    run = make_run("run-1", sample_model_a, simple_strategy, stats=stats)
    runs = (run,)

    result = analyzer._pooled_std_dev_from_runs(
        runs,
        std_attr="tokens_in_std",
        avg_attr="tokens_in_avg",
        overall_mean=100.0,
        total_n=1,
    )

    assert result == pytest.approx(0.0)


def test_pooled_std_dev_zero_total_n(
    analyzer: BenchmarkAnalyzer,
    sample_model_a: Model,
    simple_strategy: Strategy,
) -> None:
    """total_n = 0 returns 0 for pooled std dev."""
    stats = make_stats(calls_total=0, tokens_in_std=0.0, tokens_in_avg=0.0)
    run = make_run("run-1", sample_model_a, simple_strategy, stats=stats)
    runs = (run,)

    result = analyzer._pooled_std_dev_from_runs(
        runs,
        std_attr="tokens_in_std",
        avg_attr="tokens_in_avg",
        overall_mean=0.0,
        total_n=0,
    )

    assert result == pytest.approx(0.0)


def test_pooled_std_dev_multiple_runs(
    analyzer: BenchmarkAnalyzer,
    sample_model_a: Model,
    simple_strategy: Strategy,
) -> None:
    """Pooled std dev is calculated correctly for multiple runs.

    Using the formula:
    pooled_var = sum((n_i - 1) * s_i^2 + n_i * (mean_i - overall_mean)^2) / (total_n - 1)

    Example with known values:
    - Run 1: n=10, mean=100, std=5
    - Run 2: n=10, mean=110, std=5
    - Overall mean = (10*100 + 10*110) / 20 = 105
    - Numerator = (10-1)*25 + 10*(100-105)^2 + (10-1)*25 + 10*(110-105)^2
                = 9*25 + 10*25 + 9*25 + 10*25
                = 225 + 250 + 225 + 250 = 950
    - Pooled var = 950 / 19 = 50
    - Pooled std = sqrt(50) ≈ 7.071
    """
    # Run 1: n=10, mean=100, std=5
    stats1 = make_stats(calls_total=10, tokens_in_std=5.0, tokens_in_avg=100.0)
    run1 = make_run("run-1", sample_model_a, simple_strategy, stats=stats1)

    # Run 2: n=10, mean=110, std=5
    stats2 = make_stats(calls_total=10, tokens_in_std=5.0, tokens_in_avg=110.0)
    run2 = make_run("run-2", sample_model_a, simple_strategy, stats=stats2)

    runs = (run1, run2)
    overall_mean = 105.0
    total_n = 20

    result = analyzer._pooled_std_dev_from_runs(
        runs,
        std_attr="tokens_in_std",
        avg_attr="tokens_in_avg",
        overall_mean=overall_mean,
        total_n=total_n,
    )

    # Expected: sqrt(950/19) ≈ 7.071
    expected = (950 / 19) ** 0.5
    assert abs(result - expected) < 0.001


# =============================================================================
# _compute_leaderboard_entry tests
# =============================================================================


def test_compute_leaderboard_entry_single_run(
    analyzer: BenchmarkAnalyzer,
    sample_model_a: Model,
    simple_strategy: Strategy,
) -> None:
    """Single run should have std_round = 0."""
    run = make_run(
        "run-1",
        sample_model_a,
        simple_strategy,
        final_round=10,
        run_won=True,
        run_completed=True,
    )
    runs = (run,)

    entry = analyzer._compute_leaderboard_entry(runs)

    assert entry.run_count == 1
    assert entry.run_wins == 1
    assert entry.run_completed == 1
    assert entry.avg_round == pytest.approx(10.0)
    assert entry.std_round == pytest.approx(0.0)  # Single run = no variance


def test_compute_leaderboard_entry_aggregates(
    analyzer: BenchmarkAnalyzer,
    sample_model_a: Model,
    simple_strategy: Strategy,
) -> None:
    """Correctly sums/averages stats across multiple runs."""
    # Run 1: rounds=8, won=False, completed=True
    stats1 = make_stats(
        calls_total=50,
        tokens_in_total=5000,
        tokens_out_total=1000,
        time_total_ms=25000,
        cost_total=0.5,
    )
    run1 = make_run(
        "run-1",
        sample_model_a,
        simple_strategy,
        final_round=8,
        run_won=False,
        run_completed=True,
        stats=stats1,
    )

    # Run 2: rounds=12, won=True, completed=True
    stats2 = make_stats(
        calls_total=50,
        tokens_in_total=5000,
        tokens_out_total=1000,
        time_total_ms=25000,
        cost_total=0.5,
    )
    run2 = make_run(
        "run-2",
        sample_model_a,
        simple_strategy,
        final_round=12,
        run_won=True,
        run_completed=True,
        stats=stats2,
    )

    # Run 3: rounds=10, won=False, completed=False
    stats3 = make_stats(
        calls_total=50,
        tokens_in_total=5000,
        tokens_out_total=1000,
        time_total_ms=25000,
        cost_total=0.5,
    )
    run3 = make_run(
        "run-3",
        sample_model_a,
        simple_strategy,
        final_round=10,
        run_won=False,
        run_completed=False,
        stats=stats3,
    )

    runs = (run1, run2, run3)
    entry = analyzer._compute_leaderboard_entry(runs)

    # Run summary
    assert entry.run_count == 3
    assert entry.run_wins == 1  # Only run2 won
    assert entry.run_completed == 2  # run1 and run2 completed

    # Round statistics
    assert entry.avg_round == pytest.approx(10.0)  # (8 + 12 + 10) / 3 = 10
    # std_round for [8, 12, 10] = statistics.stdev([8, 12, 10])
    import statistics

    assert entry.std_round == pytest.approx(statistics.stdev([8, 12, 10]))

    # Aggregated stats
    assert entry.stats.calls_total == 150  # 50 * 3
    assert entry.stats.tokens_in_total == 15000  # 5000 * 3
    assert entry.stats.tokens_out_total == 3000  # 1000 * 3
    assert entry.stats.time_total_ms == 75000  # 25000 * 3
    assert entry.stats.cost_total == pytest.approx(1.5)  # 0.5 * 3

    # Per-call averages
    assert entry.stats.tokens_in_avg == pytest.approx(100.0)  # 15000 / 150
    assert entry.stats.tokens_out_avg == pytest.approx(20.0)  # 3000 / 150
    assert entry.stats.cost_avg == pytest.approx(0.01)  # 1.5 / 150


def test_compute_leaderboard_entry_zero_calls(
    analyzer: BenchmarkAnalyzer,
    sample_model_a: Model,
    simple_strategy: Strategy,
) -> None:
    """Zero calls_total handles division by zero correctly."""
    stats = make_stats(
        calls_total=0,
        tokens_in_total=0,
        tokens_out_total=0,
        tokens_in_avg=0.0,
        tokens_out_avg=0.0,
        time_total_ms=0,
        time_avg_ms=0.0,
        cost_total=0.0,
        cost_avg=0.0,
    )
    run = make_run("run-1", sample_model_a, simple_strategy, stats=stats)
    runs = (run,)

    # Should not raise ZeroDivisionError
    entry = analyzer._compute_leaderboard_entry(runs)

    # Averages should all be 0
    assert entry.stats.tokens_in_avg == pytest.approx(0.0)
    assert entry.stats.tokens_out_avg == pytest.approx(0.0)
    assert entry.stats.time_avg_ms == pytest.approx(0.0)
    assert entry.stats.cost_avg == pytest.approx(0.0)


# =============================================================================
# create_models_leaderboard tests
# =============================================================================


def test_leaderboard_sorting(
    analyzer: BenchmarkAnalyzer,
    simple_strategy: Strategy,
    sample_model_a: Model,
    sample_model_b: Model,
) -> None:
    """Leaderboard entries are sorted by avg_round descending."""
    # Model A: low avg_round (8)
    run_a = make_run("run-a", sample_model_a, simple_strategy, final_round=8)
    runs_a = Runs(
        generated_at=0,
        model=sample_model_a,
        strategy=simple_strategy,
        runs=(run_a,),
    )

    # Model B: high avg_round (15)
    run_b = make_run("run-b", sample_model_b, simple_strategy, final_round=15)
    runs_b = Runs(
        generated_at=0,
        model=sample_model_b,
        strategy=simple_strategy,
        runs=(run_b,),
    )

    # Create leaderboard (pass in unsorted order: A first, B second)
    with patch("time.time", return_value=1234567890):
        leaderboard = analyzer.create_models_leaderboard(
            simple_strategy, [runs_a, runs_b]
        )

    # Entries should be sorted by avg_round descending (B first, A second)
    assert len(leaderboard.entries) == 2
    assert leaderboard.entries[0].model == sample_model_b  # Higher avg_round
    assert leaderboard.entries[0].avg_round == pytest.approx(15.0)
    assert leaderboard.entries[1].model == sample_model_a  # Lower avg_round
    assert leaderboard.entries[1].avg_round == pytest.approx(8.0)

    # Verify leaderboard metadata
    assert leaderboard.strategy == simple_strategy
    assert leaderboard.generated_at == 1234567890


def test_create_models_leaderboard_empty_list(
    analyzer: BenchmarkAnalyzer,
    simple_strategy: Strategy,
) -> None:
    """Empty runs list creates leaderboard with no entries."""
    with patch("time.time", return_value=1234567890):
        leaderboard = analyzer.create_models_leaderboard(simple_strategy, [])

    assert len(leaderboard.entries) == 0
    assert leaderboard.strategy == simple_strategy


def test_create_models_leaderboard_ties(
    analyzer: BenchmarkAnalyzer,
    simple_strategy: Strategy,
    sample_model_a: Model,
    sample_model_b: Model,
) -> None:
    """Leaderboard handles ties in avg_round (order is stable)."""
    # Both models have same avg_round
    run_a = make_run("run-a", sample_model_a, simple_strategy, final_round=10)
    runs_a = Runs(
        generated_at=0,
        model=sample_model_a,
        strategy=simple_strategy,
        runs=(run_a,),
    )

    run_b = make_run("run-b", sample_model_b, simple_strategy, final_round=10)
    runs_b = Runs(
        generated_at=0,
        model=sample_model_b,
        strategy=simple_strategy,
        runs=(run_b,),
    )

    leaderboard = analyzer.create_models_leaderboard(simple_strategy, [runs_a, runs_b])

    # Both should be present with same avg_round
    assert len(leaderboard.entries) == 2
    assert leaderboard.entries[0].avg_round == pytest.approx(10.0)
    assert leaderboard.entries[1].avg_round == pytest.approx(10.0)

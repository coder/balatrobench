"""Benchmark analysis for BalatroLLM runs."""

import json
import statistics
import time
from collections import defaultdict
from collections.abc import Iterator
from pathlib import Path

from .enums import Deck, Stake
from .models import (
    Config,
    LeaderboardEntry,
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
from .source import SourceStats, SourceStrategy, SourceTask


def _subdirs(path: Path) -> Iterator[Path]:
    """Yield only subdirectories of a path."""
    return (p for p in path.iterdir() if p.is_dir())


class BenchmarkAnalyzer:
    """Analyzes BalatroLLM runs and generates benchmark data."""

    def __init__(
        self,
        runs_dir: Path = Path("runs"),
        output_dir: Path = Path("site/benchmarks"),
    ) -> None:
        self.runs_dir = runs_dir
        self.output_dir = output_dir

    def analyze_models(self, version_dir: Path) -> dict[str, list[Runs]]:
        """Analyze a version by comparing models within each strategy.

        Returns a dict mapping strategy_name to list of Runs.
        """
        if not version_dir.is_dir():
            raise FileNotFoundError(f"Version directory not found: {version_dir}")

        result: dict[str, list[Runs]] = {}
        for strategy_dir in _subdirs(version_dir):
            result[strategy_dir.name] = self._analyze_strategy(strategy_dir)

        return result

    def analyze_strategies(self, version_dir: Path) -> dict[str, list[Runs]]:
        """Analyze a version by comparing strategies for each model.

        Returns a dict mapping "vendor/model" to list of Runs (one per strategy).
        """
        if not version_dir.is_dir():
            raise FileNotFoundError(f"Version directory not found: {version_dir}")

        # Collect all model directories with their strategies
        models_by_key: defaultdict[str, list[Path]] = defaultdict(list)

        for strategy_dir in _subdirs(version_dir):
            for vendor_dir in _subdirs(strategy_dir):
                for model_dir in _subdirs(vendor_dir):
                    model_key = f"{vendor_dir.name}/{model_dir.name}"
                    models_by_key[model_key].append(model_dir)

        # Analyze each model across strategies
        result: dict[str, list[Runs]] = {}
        for model_key, model_dirs in models_by_key.items():
            runs_list = []
            for model_dir in model_dirs:
                runs = self._compute_runs(model_dir)
                if runs:
                    runs_list.append(runs)
            result[model_key] = runs_list

        return result

    def _analyze_strategy(self, strategy_dir: Path) -> list[Runs]:
        """Analyze all models within a strategy directory."""
        runs_list: list[Runs] = []

        for vendor_dir in _subdirs(strategy_dir):
            for model_dir in _subdirs(vendor_dir):
                runs = self._compute_runs(model_dir)
                if runs:
                    runs_list.append(runs)

        return runs_list

    def _compute_runs(self, model_dir: Path) -> Runs | None:
        """Compute Runs from a model's run directories."""
        run_list: list[Run] = []
        strategy_obj: Strategy | None = None
        model_obj: Model | None = None

        for run_dir in _subdirs(model_dir):
            stats_file = run_dir / "stats.json"
            task_file = run_dir / "task.json"
            strategy_file = run_dir / "strategy.json"

            if not stats_file.exists() or not task_file.exists():
                print(f"Skipping incomplete run: {run_dir.name}")
                continue

            # Load source files
            with stats_file.open() as f:
                source_stats: SourceStats = json.load(f)
            with task_file.open() as f:
                source_task: SourceTask = json.load(f)

            # Model from structured object (direct mapping)
            if model_obj is None:
                model_obj = Model(
                    vendor=source_task["model"]["vendor"],
                    name=source_task["model"]["name"],
                )

            # Load strategy (once)
            if strategy_obj is None:
                if strategy_file.exists():
                    with strategy_file.open() as f:
                        source_strategy: SourceStrategy = json.load(f)
                    strategy_obj = Strategy(
                        name=source_strategy["name"],
                        description=source_strategy["description"],
                        author=source_strategy["author"],
                        version=source_strategy["version"],
                        tags=tuple(source_strategy["tags"]),
                    )
                else:
                    strategy_obj = Strategy(
                        name=source_task["strategy"],
                        description="",
                        author="",
                        version="",
                        tags=(),
                    )

            # Create Config for this run
            config = Config(
                seed=source_task["seed"],
                deck=Deck(source_task["deck"]),
                stake=Stake(source_task["stake"]),
            )

            # Stats - direct 1:1 mapping (no flattening needed)
            stats = Stats(
                calls_total=source_stats["calls_total"],
                calls_success=source_stats["calls_success"],
                calls_error=source_stats["calls_error"],
                calls_failed=source_stats["calls_failed"],
                tokens_in_total=source_stats["tokens_in_total"],
                tokens_out_total=source_stats["tokens_out_total"],
                tokens_in_avg=source_stats["tokens_in_avg"],
                tokens_out_avg=source_stats["tokens_out_avg"],
                tokens_in_std=source_stats["tokens_in_std"],
                tokens_out_std=source_stats["tokens_out_std"],
                time_total_ms=source_stats["time_total_ms"],
                time_avg_ms=source_stats["time_avg_ms"],
                time_std_ms=source_stats["time_std_ms"],
                cost_total=source_stats["cost_total"],
                cost_avg=source_stats["cost_avg"],
                cost_std=source_stats["cost_std"],
            )

            # Run - direct field mapping
            run = Run(
                id=run_dir.name,
                model=model_obj,
                strategy=strategy_obj,
                config=config,
                run_won=source_stats["run_won"],
                run_completed=source_stats["run_completed"],
                final_ante=source_stats["final_ante"],
                final_round=source_stats["final_round"],
                providers=tuple(source_stats["providers"].items()),
                stats=stats,
            )
            run_list.append(run)

        if not run_list:
            return None

        # model_obj and strategy_obj are guaranteed non-None when run_list is populated
        assert model_obj is not None
        assert strategy_obj is not None

        return Runs(
            generated_at=int(time.time()),
            model=model_obj,
            strategy=strategy_obj,
            runs=tuple(run_list),
        )

    def _compute_leaderboard_entry(self, runs: tuple[Run, ...]) -> LeaderboardEntry:
        """Aggregate Runs into a LeaderboardEntry (base stats only)."""
        n_runs = len(runs)

        # Round statistics
        rounds = [r.final_round for r in runs]
        avg_round = sum(rounds) / n_runs
        std_round = statistics.stdev(rounds) if n_runs > 1 else 0.0

        # Call statistics (sum across runs)
        calls_total = sum(r.stats.calls_total for r in runs)
        calls_success = sum(r.stats.calls_success for r in runs)
        calls_error = sum(r.stats.calls_error for r in runs)
        calls_failed = sum(r.stats.calls_failed for r in runs)

        # Token totals
        tokens_in_total = sum(r.stats.tokens_in_total for r in runs)
        tokens_out_total = sum(r.stats.tokens_out_total for r in runs)

        # Time and cost totals
        time_total_ms = sum(r.stats.time_total_ms for r in runs)
        cost_total = sum(r.stats.cost_total for r in runs)

        # Per-call averages (pooled across all runs)
        if calls_total > 0:
            tokens_in_avg = tokens_in_total / calls_total
            tokens_out_avg = tokens_out_total / calls_total
            time_avg_ms = time_total_ms / calls_total
            cost_avg = cost_total / calls_total
        else:
            tokens_in_avg = tokens_out_avg = time_avg_ms = cost_avg = 0.0

        # Pooled standard deviations (computed from per-run stats)
        tokens_in_std = self._pooled_std_dev_from_runs(
            runs, "tokens_in_std", "tokens_in_avg", tokens_in_avg, calls_total
        )
        tokens_out_std = self._pooled_std_dev_from_runs(
            runs, "tokens_out_std", "tokens_out_avg", tokens_out_avg, calls_total
        )
        time_std_ms = self._pooled_std_dev_from_runs(
            runs, "time_std_ms", "time_avg_ms", time_avg_ms, calls_total
        )
        cost_std = self._pooled_std_dev_from_runs(
            runs, "cost_std", "cost_avg", cost_avg, calls_total
        )

        # Create aggregated Stats
        aggregated_stats = Stats(
            calls_total=calls_total,
            calls_success=calls_success,
            calls_error=calls_error,
            calls_failed=calls_failed,
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

        return LeaderboardEntry(
            run_count=n_runs,
            run_wins=sum(1 for r in runs if r.run_won),
            run_completed=sum(1 for r in runs if r.run_completed),
            avg_round=avg_round,
            std_round=std_round,
            stats=aggregated_stats,
        )

    def _pooled_std_dev_from_runs(
        self,
        runs: tuple[Run, ...],
        std_attr: str,
        avg_attr: str,
        overall_mean: float,
        total_n: int,
    ) -> float:
        """Compute pooled standard deviation across multiple runs.

        Uses the formula for pooled variance when combining samples with
        different means and standard deviations.

        Args:
            runs: Tuple of Run objects
            std_attr: Attribute name for std dev on Run.stats (e.g., "tokens_in_std")
            avg_attr: Attribute name for average on Run.stats (e.g., "tokens_in_avg")
            overall_mean: The overall mean across all runs
            total_n: Total number of observations (calls) across all runs
        """
        if total_n <= 1:
            return 0.0

        numerator = 0.0
        for run in runs:
            s_i = getattr(run.stats, std_attr)
            mean_i = getattr(run.stats, avg_attr)
            n_i = run.stats.calls_total

            numerator += (n_i - 1) * (s_i**2) + n_i * ((mean_i - overall_mean) ** 2)

        pooled_var = numerator / (total_n - 1)
        return pooled_var**0.5

    def create_models_leaderboard(
        self, strategy: Strategy, runs_list: list[Runs]
    ) -> ModelsLeaderboard:
        """Create a ModelsLeaderboard from Runs list.

        Compares different models using the same strategy.
        """
        # Compute leaderboard entry for each Runs and pair with model
        entries_with_avg: list[tuple[ModelsLeaderboardEntry, float]] = []
        for runs in runs_list:
            entry = self._compute_leaderboard_entry(runs.runs)
            model_entry = ModelsLeaderboardEntry(
                run_count=entry.run_count,
                run_wins=entry.run_wins,
                run_completed=entry.run_completed,
                avg_round=entry.avg_round,
                std_round=entry.std_round,
                stats=entry.stats,
                model=runs.model,
            )
            entries_with_avg.append((model_entry, entry.avg_round))

        # Sort by avg_round descending
        entries_with_avg.sort(key=lambda x: x[1], reverse=True)

        return ModelsLeaderboard(
            generated_at=int(time.time()),
            strategy=strategy,
            entries=tuple(e[0] for e in entries_with_avg),
        )

    def create_strategies_leaderboard(
        self, model: Model, runs_list: list[Runs]
    ) -> StrategiesLeaderboard:
        """Create a StrategiesLeaderboard from Runs list.

        Compares different strategies for the same model.
        """
        # Compute leaderboard entry for each Runs and pair with strategy
        entries_with_avg: list[tuple[StrategiesLeaderboardEntry, float]] = []
        for runs in runs_list:
            entry = self._compute_leaderboard_entry(runs.runs)
            strategy_entry = StrategiesLeaderboardEntry(
                run_count=entry.run_count,
                run_wins=entry.run_wins,
                run_completed=entry.run_completed,
                avg_round=entry.avg_round,
                std_round=entry.std_round,
                stats=entry.stats,
                strategy=runs.strategy,
            )
            entries_with_avg.append((strategy_entry, entry.avg_round))

        # Sort by avg_round descending
        entries_with_avg.sort(key=lambda x: x[1], reverse=True)

        return StrategiesLeaderboard(
            generated_at=int(time.time()),
            model=model,
            entries=tuple(e[0] for e in entries_with_avg),
        )

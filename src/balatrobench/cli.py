"""CLI entry point for balatrobench command."""

import argparse
import re
import sys
from pathlib import Path

from . import __version__
from .analyzer import BenchmarkAnalyzer
from .models import Model
from .writer import BenchmarkWriter

# Module-level compiled regex patterns for version strings
VERSION_PATTERN = re.compile(r"^v\d+\.\d+\.\d+$")
VERSION_PARTS_PATTERN = re.compile(r"^v(\d+)\.(\d+)\.(\d+)$")


def create_parser() -> argparse.ArgumentParser:
    """Create the argument parser."""
    parser = argparse.ArgumentParser(
        prog="balatrobench",
        description="Analyze BalatroLLM runs and generate benchmark data",
    )

    parser.add_argument(
        "--input-dir",
        type=Path,
        required=True,
        help="Input directory with run data (e.g., runs/v1.0.0)",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("site/benchmarks"),
        help="Base output directory for benchmark results (default: site/benchmarks)",
    )
    parser.add_argument(
        "--version",
        type=str,
        help="Version string for output paths (default: inferred from input-dir)",
    )
    parser.add_argument(
        "--webp",
        action="store_true",
        help="Enable PNG to WebP conversion",
    )

    return parser


def infer_version(input_dir: Path) -> str:
    """Infer version from input directory name.

    Returns v{__version__} if version cannot be inferred from the path.
    """
    # Try to extract version from path like runs/v1.0.0
    name = input_dir.name
    if VERSION_PATTERN.match(name):
        return name
    return f"v{__version__}"


def main() -> None:
    """Main entry point for balatrobench command."""
    parser = create_parser()
    args = parser.parse_args()

    # Determine input directory
    input_dir = args.input_dir.resolve()

    if not input_dir.exists():
        print(f"Error: Input directory not found: {input_dir}")
        sys.exit(1)

    # Determine version
    version = args.version or infer_version(input_dir)
    if not version.startswith("v"):
        version = f"v{version}"

    output_dir = args.output_dir.resolve()
    print(f"Analyzing runs from: {input_dir}")
    print(f"Output directory: {output_dir}")
    print(f"Version: {version}")

    try:
        analyzer = BenchmarkAnalyzer(runs_dir=input_dir.parent, output_dir=output_dir)

        # --- Models analysis ---
        print("\n=== Analyzing models within strategies ===")
        models_output_dir = output_dir / "models"
        models_writer = BenchmarkWriter(models_output_dir)

        models_by_strategy = analyzer.analyze_models(input_dir)

        for strategy_name, runs_list in models_by_strategy.items():
            print(f"  Strategy '{strategy_name}': {len(runs_list)} models")

            if not runs_list:
                continue

            # Get strategy from first Runs
            strategy = runs_list[0].strategy

            # Write leaderboard
            leaderboard = analyzer.create_models_leaderboard(strategy, runs_list)
            models_writer.write_models_leaderboard(leaderboard, version, strategy_name)

            # Write model runs and request files
            for runs in runs_list:
                models_writer.write_runs(runs, version, strategy_name)

                # Write per-request files for each run
                for run in runs.runs:
                    run_dir = (
                        input_dir
                        / strategy_name
                        / runs.model.vendor
                        / runs.model.name
                        / run.id
                    )
                    if run_dir.exists():
                        output_base = (
                            models_output_dir
                            / version
                            / strategy_name
                            / runs.model.vendor
                            / runs.model.name
                        )
                        models_writer.write_request_files(run_dir, output_base)

        # --- Strategies analysis ---
        print("\n=== Analyzing strategies for each model ===")
        strategies_output_dir = output_dir / "strategies"
        strategies_writer = BenchmarkWriter(strategies_output_dir)

        strategies_by_model = analyzer.analyze_strategies(input_dir)

        for model_key, runs_list in strategies_by_model.items():
            print(f"  Model '{model_key}': {len(runs_list)} strategies")

            if not runs_list:
                continue

            vendor, model_name = model_key.split("/", 1)
            model = Model(vendor=vendor, name=model_name)

            # Create leaderboard for this model (comparing strategies)
            leaderboard = analyzer.create_strategies_leaderboard(model, runs_list)
            strategies_writer.write_strategies_leaderboard(
                leaderboard, version, model_key
            )

            # Write strategy runs
            for runs in runs_list:
                strategies_writer.write_strategy_runs(runs, version, vendor, model_name)

        # Convert PNGs to WebP if enabled
        if args.webp:
            print("\nConverting PNG screenshots to WebP format...")
            models_writer.convert_pngs_to_webp(models_output_dir / version)
            strategies_writer.convert_pngs_to_webp(strategies_output_dir / version)

        # Generate manifests
        print("\nGenerating manifests...")
        existing_versions = _find_versions(models_output_dir)
        if version not in existing_versions:
            existing_versions.append(version)
        existing_versions.sort(key=_version_sort_key, reverse=True)

        models_writer.write_manifest(existing_versions, version)
        strategies_writer.write_manifest(existing_versions, version)

        print(f"\nBenchmark analysis complete. Results saved to {output_dir}")

    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Benchmark analysis failed: {e}")
        raise


def _find_versions(base_dir: Path) -> list[str]:
    """Find existing version directories."""
    if not base_dir.exists():
        return []

    return [
        item.name
        for item in base_dir.iterdir()
        if item.is_dir() and VERSION_PATTERN.match(item.name)
    ]


def _version_sort_key(version: str) -> tuple[int, int, int]:
    """Convert version string to sortable tuple."""
    match = VERSION_PARTS_PATTERN.match(version)
    if match:
        return (int(match.group(1)), int(match.group(2)), int(match.group(3)))
    return (0, 0, 0)


if __name__ == "__main__":
    main()

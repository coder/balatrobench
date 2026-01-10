"""File I/O for BalatroBench output."""

import json
import subprocess
from concurrent.futures import ThreadPoolExecutor
from dataclasses import asdict
from pathlib import Path
from typing import Any

from tqdm import tqdm

from .extractor import (
    extract_request_content,
    extract_request_metadata,
    extract_response_data,
)
from .models import (
    Manifest,
    ModelsLeaderboard,
    Runs,
    StrategiesLeaderboard,
    Version,
)


class BenchmarkWriter:
    """Writes benchmark data to files."""

    def __init__(self, output_dir: Path) -> None:
        self.output_dir = output_dir

    def write_manifest(self, versions: list[str], latest_version: str) -> Path:
        """Write manifest.json to base directory.

        Args:
            versions: List of version strings (e.g., ["v1.0.0", "v0.16.0"])
            latest_version: The version to mark as latest

        Returns the path to the written file.
        """
        version_entries = []
        for v in versions:
            entry = Version(version=v, latest=(v == latest_version))
            version_entries.append(entry)

        manifest = Manifest(versions=tuple(version_entries))

        manifest_path = self.output_dir / "manifest.json"
        manifest_path.parent.mkdir(parents=True, exist_ok=True)

        with manifest_path.open("w") as f:
            json.dump(self._to_dict(manifest), f, indent=2)

        return manifest_path

    def write_models_leaderboard(
        self, leaderboard: ModelsLeaderboard, version: str, strategy: str
    ) -> Path:
        """Write models leaderboard.json for a strategy.

        Output: {version}/{strategy}/leaderboard.json

        Returns the path to the written file.
        """
        output_path = self.output_dir / version / strategy / "leaderboard.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with output_path.open("w") as f:
            json.dump(self._to_dict(leaderboard), f, indent=2)

        return output_path

    def write_strategies_leaderboard(
        self, leaderboard: StrategiesLeaderboard, version: str, model_key: str
    ) -> Path:
        """Write strategies leaderboard.json for a model.

        Output: {version}/{vendor}/{model}/leaderboard.json

        Returns the path to the written file.
        """
        output_path = self.output_dir / version / model_key / "leaderboard.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with output_path.open("w") as f:
            json.dump(self._to_dict(leaderboard), f, indent=2)

        return output_path

    def write_runs(self, runs: Runs, version: str, strategy: str) -> Path:
        """Write {model}.json for a model.

        Returns the path to the written file.
        """
        output_path = (
            self.output_dir
            / version
            / strategy
            / runs.model.vendor
            / f"{runs.model.name}.json"
        )
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with output_path.open("w") as f:
            json.dump(self._to_dict(runs), f, indent=2)

        return output_path

    def write_strategy_runs(
        self, runs: Runs, version: str, vendor: str, model_name: str
    ) -> Path:
        """Write runs.json for a strategy (when analyzing strategies per model).

        Returns the path to the written file.
        """
        output_path = (
            self.output_dir
            / version
            / vendor
            / model_name
            / runs.strategy.name
            / "runs.json"
        )
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with output_path.open("w") as f:
            json.dump(self._to_dict(runs), f, indent=2)

        return output_path

    def write_request_files(
        self,
        run_dir: Path,
        output_base: Path,
    ) -> None:
        """Extract and write per-request files from a run directory.

        Creates directories like: {output_base}/{run_id}/{request_id}/
        Each containing: reasoning.md, tool_call.json, strategy.md, gamestate.md,
        memory.md, metadata.json, and screenshot.webp (if available).
        """
        run_id = run_dir.name
        requests_file = run_dir / "requests.jsonl"
        responses_file = run_dir / "responses.jsonl"
        screenshots_dir = run_dir / "screenshots"

        # Extract data
        request_content = extract_request_content(requests_file)
        response_data = extract_response_data(responses_file)
        requests_by_id = extract_request_metadata(responses_file)

        all_custom_ids = set(request_content.keys()) | set(response_data.keys())

        for custom_id in all_custom_ids:
            # Convert "request-00042" to "00042"
            request_id = custom_id.replace("request-", "")
            request_dir = output_base / run_id / request_id
            request_dir.mkdir(parents=True, exist_ok=True)

            # Write request content
            if custom_id in request_content:
                content = request_content[custom_id]
                (request_dir / "strategy.md").write_text(content["strategy"])
                (request_dir / "gamestate.md").write_text(content["gamestate"])
                (request_dir / "memory.md").write_text(content["memory"])

            # Write response data
            if custom_id in response_data:
                data = response_data[custom_id]
                (request_dir / "reasoning.md").write_text(data["reasoning"])

                # Strip reasoning from tool_call arguments before writing
                tool_calls = data["tool_call"]
                cleaned_tool_calls = self._strip_reasoning_from_tool_calls(tool_calls)
                with (request_dir / "tool_call.json").open("w") as f:
                    json.dump(cleaned_tool_calls, f, indent=2)

            # Write metadata
            if custom_id in requests_by_id:
                request = requests_by_id[custom_id]
                with (request_dir / "metadata.json").open("w") as f:
                    json.dump(self._to_dict(request), f, indent=2)

            # Copy screenshot if exists
            png_file = screenshots_dir / f"{custom_id}.png"
            if png_file.exists():
                (request_dir / "screenshot.png").write_bytes(png_file.read_bytes())

    @staticmethod
    def _strip_reasoning_from_tool_calls(tool_calls: list[dict]) -> list[dict]:
        """Remove reasoning field from tool call arguments."""
        result = []
        for tc in tool_calls:
            tc_copy = tc.copy()
            if "function" in tc_copy:
                func = tc_copy["function"].copy()
                if "arguments" in func:
                    try:
                        args = json.loads(func["arguments"])
                        args.pop("reasoning", None)
                        func["arguments"] = json.dumps(args)
                    except (json.JSONDecodeError, TypeError):
                        pass
                tc_copy["function"] = func
            result.append(tc_copy)
        return result

    def convert_pngs_to_webp(self, directory: Path) -> None:
        """Convert all screenshot.png files in directory to WebP.

        Requires cwebp to be installed.
        """
        try:
            png_files = list(directory.rglob("screenshot.png"))
            if not png_files:
                return

            with ThreadPoolExecutor() as executor:
                list(
                    tqdm(
                        executor.map(self._convert_single_png_to_webp, png_files),
                        total=len(png_files),
                        desc="Converting to WebP",
                    )
                )
        except FileNotFoundError:
            print("Warning: cwebp not found, keeping PNG format")
        except Exception as e:
            print(f"Warning: cwebp conversion error: {e}")

    def _convert_single_png_to_webp(self, png_file: Path) -> None:
        """Convert a single PNG file to WebP."""
        try:
            webp_file = png_file.with_suffix(".webp")
            subprocess.run(
                ["cwebp", "-q", "80", "-quiet", str(png_file), "-o", str(webp_file)],
                capture_output=True,
                text=True,
                check=True,
            )
            png_file.unlink()
        except subprocess.CalledProcessError as e:
            print(f"Warning: cwebp conversion failed for {png_file}: {e.stderr}")
        except OSError as e:
            print(f"Warning: Could not remove {png_file}: {e}")

    @staticmethod
    def _to_dict(obj: object) -> Any:
        """Convert dataclass to dict, handling nested dataclasses and tuples."""
        if hasattr(obj, "__dataclass_fields__"):
            return {
                k: BenchmarkWriter._to_dict(v)
                for k, v in asdict(obj).items()  # type: ignore[arg-type]
            }
        elif isinstance(obj, dict):
            return {k: BenchmarkWriter._to_dict(v) for k, v in obj.items()}
        elif isinstance(obj, (list, tuple)):
            return [BenchmarkWriter._to_dict(item) for item in obj]
        else:
            return obj

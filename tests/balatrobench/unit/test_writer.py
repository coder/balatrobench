"""Unit tests for balatrobench.writer module."""

import json
from pathlib import Path

import pytest

from balatrobench.enums import Deck, Stake
from balatrobench.models import (
    Config,
    Model,
    ModelsLeaderboardEntry,
    Runs,
    Stats,
    StrategiesLeaderboard,
    Strategy,
)
from balatrobench.writer import BenchmarkWriter


def test_to_dict_simple_dataclass(sample_model: Model) -> None:
    """Converts Model dataclass to dict."""
    result = BenchmarkWriter._to_dict(sample_model)

    assert isinstance(result, dict)
    assert result == {"vendor": "openai", "name": "gpt-oss-120b"}


def test_to_dict_nested_dataclass(sample_stats: Stats, sample_model: Model) -> None:
    """Handles nested dataclasses (Stats inside LeaderboardEntry)."""
    entry = ModelsLeaderboardEntry(
        run_count=5,
        run_wins=2,
        run_completed=4,
        avg_round=8.5,
        std_round=2.1,
        stats=sample_stats,
        model=sample_model,
    )

    result = BenchmarkWriter._to_dict(entry)

    assert isinstance(result, dict)
    # Check top-level fields
    assert result["run_count"] == 5
    assert result["run_wins"] == 2
    assert result["avg_round"] == 8.5

    # Check nested Stats is converted to dict
    assert isinstance(result["stats"], dict)
    assert result["stats"]["calls_total"] == 87
    assert result["stats"]["tokens_in_avg"] == 13709.48

    # Check nested Model is converted to dict
    assert isinstance(result["model"], dict)
    assert result["model"]["vendor"] == "openai"
    assert result["model"]["name"] == "gpt-oss-120b"


def test_to_dict_enum() -> None:
    """Converts Deck/Stake enums to string values."""

    config = Config(seed="AAAAAAA", deck=Deck.RED, stake=Stake.WHITE)

    result = BenchmarkWriter._to_dict(config)

    assert isinstance(result, dict)
    assert result["seed"] == "AAAAAAA"
    # StrEnums compare equal to their string values
    assert result["deck"] == "RED"
    assert result["stake"] == "WHITE"
    # StrEnums are subclasses of str, so they serialize correctly in JSON
    serialized = json.dumps(result)
    assert '"deck": "RED"' in serialized
    assert '"stake": "WHITE"' in serialized


def test_to_dict_tuple_to_list(sample_strategy: Strategy) -> None:
    """Converts tuples (like Strategy.tags) to lists."""
    result = BenchmarkWriter._to_dict(sample_strategy)

    assert isinstance(result, dict)
    assert result["name"] == "Default"
    assert result["description"] == "The default BalatroLLM strategy"

    # Tags tuple should be converted to list
    assert isinstance(result["tags"], list)
    assert result["tags"] == ["conservative", "financial"]


def test_strip_reasoning_valid_json() -> None:
    """Strips reasoning key from tool_call arguments."""
    tool_calls = [
        {
            "id": "call_123",
            "type": "function",
            "function": {
                "name": "select_hand",
                "arguments": '{"reasoning": "I should play this hand", "cards": [1, 2, 3]}',
            },
        }
    ]

    result = BenchmarkWriter._strip_reasoning_from_tool_calls(tool_calls)

    # Should return a new list (not modify original)
    assert result is not tool_calls
    assert len(result) == 1

    # Reasoning should be stripped from arguments

    args = json.loads(result[0]["function"]["arguments"])
    assert "reasoning" not in args
    assert args["cards"] == [1, 2, 3]

    # Original should be unchanged
    original_func = tool_calls[0]["function"]
    assert isinstance(original_func, dict)
    original_args = json.loads(original_func["arguments"])
    assert "reasoning" in original_args


def test_strip_reasoning_invalid_json() -> None:
    """Returns original on JSON parse error."""
    tool_calls = [
        {
            "id": "call_456",
            "type": "function",
            "function": {
                "name": "select_hand",
                "arguments": "not valid json {{{",
            },
        }
    ]

    result = BenchmarkWriter._strip_reasoning_from_tool_calls(tool_calls)

    # Should return without error, keeping original arguments
    assert len(result) == 1
    assert result[0]["function"]["arguments"] == "not valid json {{{"


def test_strip_reasoning_no_reasoning_key() -> None:
    """No-op when reasoning not present."""
    tool_calls = [
        {
            "id": "call_789",
            "type": "function",
            "function": {
                "name": "play_cards",
                "arguments": '{"cards": [4, 5, 6], "action": "play"}',
            },
        }
    ]

    result = BenchmarkWriter._strip_reasoning_from_tool_calls(tool_calls)

    # Should return cleaned copy with same arguments
    args = json.loads(result[0]["function"]["arguments"])
    assert args == {"cards": [4, 5, 6], "action": "play"}


# =============================================================================
# write_request_files tests
# =============================================================================


class TestWriteRequestFiles:
    """Tests for write_request_files() method."""

    @pytest.fixture
    def mock_run_dir(self, tmp_path: Path) -> Path:
        """Create a minimal mock run directory with JSONL files."""
        run_dir = tmp_path / "20260109_165752_472_RED_WHITE_BBBBBBB"
        run_dir.mkdir()

        # Create minimal requests.jsonl
        requests_data = {
            "custom_id": "request-00001",
            "body": {
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Strategy prompt here"},
                            {"type": "text", "text": "Gamestate info"},
                            {"type": "text", "text": "Memory content"},
                        ],
                    }
                ]
            },
        }
        (run_dir / "requests.jsonl").write_text(json.dumps(requests_data))

        # Create minimal responses.jsonl
        responses_data = {
            "id": "1000",
            "custom_id": "request-00001",
            "response": {
                "request_id": "900",
                "status_code": 200,
                "body": {
                    "provider": "TestProvider",
                    "choices": [
                        {
                            "message": {
                                "reasoning": "My reasoning here",
                                "tool_calls": [
                                    {
                                        "id": "call_1",
                                        "type": "function",
                                        "function": {
                                            "name": "play",
                                            "arguments": '{"cards": [1, 2], "reasoning": "embedded"}',
                                        },
                                    }
                                ],
                            }
                        }
                    ],
                    "usage": {
                        "prompt_tokens": 100,
                        "completion_tokens": 50,
                    },
                },
            },
        }
        (run_dir / "responses.jsonl").write_text(json.dumps(responses_data))

        # Create screenshots directory (empty)
        (run_dir / "screenshots").mkdir()

        return run_dir

    def test_write_request_files_creates_directory_structure(
        self, mock_run_dir: Path, tmp_path: Path
    ) -> None:
        """Creates proper directory structure for requests."""
        output_base = tmp_path / "output"
        writer = BenchmarkWriter(output_dir=tmp_path)

        writer.write_request_files(mock_run_dir, output_base)

        # Check directory structure: output_base / run_id / request_id
        run_id = mock_run_dir.name
        request_dir = output_base / run_id / "00001"
        assert request_dir.exists()
        assert request_dir.is_dir()

    def test_write_request_files_writes_strategy_md(
        self, mock_run_dir: Path, tmp_path: Path
    ) -> None:
        """Writes strategy.md with extracted content."""
        output_base = tmp_path / "output"
        writer = BenchmarkWriter(output_dir=tmp_path)

        writer.write_request_files(mock_run_dir, output_base)

        run_id = mock_run_dir.name
        strategy_file = output_base / run_id / "00001" / "strategy.md"
        assert strategy_file.exists()
        assert strategy_file.read_text() == "Strategy prompt here"

    def test_write_request_files_writes_gamestate_md(
        self, mock_run_dir: Path, tmp_path: Path
    ) -> None:
        """Writes gamestate.md with extracted content."""
        output_base = tmp_path / "output"
        writer = BenchmarkWriter(output_dir=tmp_path)

        writer.write_request_files(mock_run_dir, output_base)

        run_id = mock_run_dir.name
        gamestate_file = output_base / run_id / "00001" / "gamestate.md"
        assert gamestate_file.exists()
        assert gamestate_file.read_text() == "Gamestate info"

    def test_write_request_files_writes_memory_md(
        self, mock_run_dir: Path, tmp_path: Path
    ) -> None:
        """Writes memory.md with extracted content."""
        output_base = tmp_path / "output"
        writer = BenchmarkWriter(output_dir=tmp_path)

        writer.write_request_files(mock_run_dir, output_base)

        run_id = mock_run_dir.name
        memory_file = output_base / run_id / "00001" / "memory.md"
        assert memory_file.exists()
        assert memory_file.read_text() == "Memory content"

    def test_write_request_files_writes_reasoning_md(
        self, mock_run_dir: Path, tmp_path: Path
    ) -> None:
        """Writes reasoning.md with extracted reasoning."""
        output_base = tmp_path / "output"
        writer = BenchmarkWriter(output_dir=tmp_path)

        writer.write_request_files(mock_run_dir, output_base)

        run_id = mock_run_dir.name
        reasoning_file = output_base / run_id / "00001" / "reasoning.md"
        assert reasoning_file.exists()
        assert reasoning_file.read_text() == "My reasoning here"

    def test_write_request_files_writes_tool_call_json(
        self, mock_run_dir: Path, tmp_path: Path
    ) -> None:
        """Writes tool_call.json with reasoning stripped from arguments."""
        output_base = tmp_path / "output"
        writer = BenchmarkWriter(output_dir=tmp_path)

        writer.write_request_files(mock_run_dir, output_base)

        run_id = mock_run_dir.name
        tool_call_file = output_base / run_id / "00001" / "tool_call.json"
        assert tool_call_file.exists()

        tool_calls = json.loads(tool_call_file.read_text())
        assert len(tool_calls) == 1
        assert tool_calls[0]["function"]["name"] == "play"

        # Reasoning should be stripped from arguments
        args = json.loads(tool_calls[0]["function"]["arguments"])
        assert "reasoning" not in args
        assert args["cards"] == [1, 2]

    def test_write_request_files_writes_metadata_json(
        self, mock_run_dir: Path, tmp_path: Path
    ) -> None:
        """Writes metadata.json with request metadata."""
        output_base = tmp_path / "output"
        writer = BenchmarkWriter(output_dir=tmp_path)

        writer.write_request_files(mock_run_dir, output_base)

        run_id = mock_run_dir.name
        metadata_file = output_base / run_id / "00001" / "metadata.json"
        assert metadata_file.exists()

        metadata = json.loads(metadata_file.read_text())
        assert metadata["id"] == "request-00001"
        assert metadata["status"] == "success"
        assert metadata["provider"] == "TestProvider"
        assert metadata["tokens_in"] == 100
        assert metadata["tokens_out"] == 50

    def test_write_request_files_copies_screenshot(
        self, mock_run_dir: Path, tmp_path: Path
    ) -> None:
        """Copies screenshot.png if it exists."""
        # Create a mock screenshot
        screenshots_dir = mock_run_dir / "screenshots"
        png_content = b"fake png data"
        (screenshots_dir / "request-00001.png").write_bytes(png_content)

        output_base = tmp_path / "output"
        writer = BenchmarkWriter(output_dir=tmp_path)

        writer.write_request_files(mock_run_dir, output_base)

        run_id = mock_run_dir.name
        screenshot_file = output_base / run_id / "00001" / "screenshot.png"
        assert screenshot_file.exists()
        assert screenshot_file.read_bytes() == png_content

    def test_write_request_files_handles_missing_screenshot(
        self, mock_run_dir: Path, tmp_path: Path
    ) -> None:
        """Handles missing screenshot gracefully (no screenshot.png written)."""
        output_base = tmp_path / "output"
        writer = BenchmarkWriter(output_dir=tmp_path)

        writer.write_request_files(mock_run_dir, output_base)

        run_id = mock_run_dir.name
        screenshot_file = output_base / run_id / "00001" / "screenshot.png"
        assert not screenshot_file.exists()

    def test_write_request_files_handles_empty_files(self, tmp_path: Path) -> None:
        """Handles empty/missing JSONL files gracefully."""
        run_dir = tmp_path / "empty_run"
        run_dir.mkdir()
        (run_dir / "requests.jsonl").write_text("")
        (run_dir / "responses.jsonl").write_text("")
        (run_dir / "screenshots").mkdir()

        output_base = tmp_path / "output"
        writer = BenchmarkWriter(output_dir=tmp_path)

        # Should not raise
        writer.write_request_files(run_dir, output_base)

        # No request directories should be created
        assert not (output_base / run_dir.name).exists()


# =============================================================================
# write_strategies_leaderboard and write_strategy_runs tests
# =============================================================================


class TestWriteStrategiesLeaderboard:
    """Tests for write_strategies_leaderboard method."""

    @pytest.fixture
    def sample_strategies_leaderboard(
        self, sample_model: Model, sample_strategy: Strategy, sample_stats: Stats
    ) -> "StrategiesLeaderboard":
        """Create a sample StrategiesLeaderboard for testing."""
        from balatrobench.models import (
            StrategiesLeaderboard,
            StrategiesLeaderboardEntry,
        )

        entry = StrategiesLeaderboardEntry(
            run_count=3,
            run_wins=1,
            run_completed=2,
            avg_round=10.5,
            std_round=2.0,
            stats=sample_stats,
            strategy=sample_strategy,
        )
        return StrategiesLeaderboard(
            generated_at=1234567890,
            model=sample_model,
            entries=(entry,),
        )

    def test_write_strategies_leaderboard_creates_file(
        self, tmp_path: Path, sample_strategies_leaderboard: "StrategiesLeaderboard"
    ) -> None:
        """write_strategies_leaderboard creates the leaderboard.json file."""
        writer = BenchmarkWriter(output_dir=tmp_path)

        result = writer.write_strategies_leaderboard(
            sample_strategies_leaderboard, "v1.0.0", "openai/gpt-4o"
        )

        # Should return the path to written file
        expected_path = tmp_path / "v1.0.0" / "openai/gpt-4o" / "leaderboard.json"
        assert result == expected_path
        assert result.exists()

    def test_write_strategies_leaderboard_content(
        self, tmp_path: Path, sample_strategies_leaderboard: "StrategiesLeaderboard"
    ) -> None:
        """write_strategies_leaderboard writes correct JSON content."""
        writer = BenchmarkWriter(output_dir=tmp_path)

        result = writer.write_strategies_leaderboard(
            sample_strategies_leaderboard, "v1.0.0", "openai/gpt-4o"
        )

        content = json.loads(result.read_text())

        # Check structure
        assert content["generated_at"] == 1234567890
        assert content["model"]["vendor"] == "openai"
        assert content["model"]["name"] == "gpt-oss-120b"
        assert len(content["entries"]) == 1
        assert content["entries"][0]["strategy"]["name"] == "Default"
        assert content["entries"][0]["avg_round"] == 10.5


class TestWriteStrategyRuns:
    """Tests for write_strategy_runs method."""

    @pytest.fixture
    def sample_runs(
        self, sample_model: Model, sample_strategy: Strategy, sample_stats: Stats
    ) -> "Runs":
        """Create a sample Runs object for testing."""
        from balatrobench.enums import Deck, Stake
        from balatrobench.models import Config, Run, Runs

        run = Run(
            id="20260109_165752_472_RED_WHITE_BBBBBBB",
            model=sample_model,
            strategy=sample_strategy,
            config=Config(seed="BBBBBBB", deck=Deck.RED, stake=Stake.WHITE),
            run_won=False,
            run_completed=True,
            final_ante=3,
            final_round=10,
            providers=(("OpenAI", 50),),
            stats=sample_stats,
        )
        return Runs(
            generated_at=1234567890,
            model=sample_model,
            strategy=sample_strategy,
            runs=(run,),
        )

    def test_write_strategy_runs_creates_file(
        self, tmp_path: Path, sample_runs: "Runs"
    ) -> None:
        """write_strategy_runs creates the runs.json file."""
        writer = BenchmarkWriter(output_dir=tmp_path)

        result = writer.write_strategy_runs(sample_runs, "v1.0.0", "openai", "gpt-4o")

        # Should return the path to written file
        expected_path = (
            tmp_path / "v1.0.0" / "openai" / "gpt-4o" / "Default" / "runs.json"
        )
        assert result == expected_path
        assert result.exists()

    def test_write_strategy_runs_content(
        self, tmp_path: Path, sample_runs: "Runs"
    ) -> None:
        """write_strategy_runs writes correct JSON content."""
        writer = BenchmarkWriter(output_dir=tmp_path)

        result = writer.write_strategy_runs(sample_runs, "v1.0.0", "openai", "gpt-4o")

        content = json.loads(result.read_text())

        # Check structure
        assert content["generated_at"] == 1234567890
        assert content["model"]["vendor"] == "openai"
        assert content["model"]["name"] == "gpt-oss-120b"
        assert content["strategy"]["name"] == "Default"
        assert len(content["runs"]) == 1
        assert content["runs"][0]["id"] == "20260109_165752_472_RED_WHITE_BBBBBBB"
        assert content["runs"][0]["final_round"] == 10


# =============================================================================
# convert_pngs_to_webp tests
# =============================================================================


class TestConvertPngsToWebp:
    """Tests for convert_pngs_to_webp method."""

    def test_convert_pngs_to_webp_empty_directory(
        self, tmp_path: Path, capsys: pytest.CaptureFixture
    ) -> None:
        """convert_pngs_to_webp does nothing for empty directory."""
        writer = BenchmarkWriter(output_dir=tmp_path)

        # Should not raise and should return early
        writer.convert_pngs_to_webp(tmp_path)

        # No warnings should be printed
        captured = capsys.readouterr()
        assert "Warning" not in captured.out

    def test_convert_pngs_to_webp_nonexistent_directory(
        self, tmp_path: Path, capsys: pytest.CaptureFixture
    ) -> None:
        """convert_pngs_to_webp handles nonexistent directory gracefully."""
        writer = BenchmarkWriter(output_dir=tmp_path)
        nonexistent = tmp_path / "does_not_exist"

        # Should not raise (rglob returns empty on nonexistent)
        writer.convert_pngs_to_webp(nonexistent)


class TestStripReasoningEdgeCases:
    """Additional edge cases for _strip_reasoning_from_tool_calls."""

    def test_strip_reasoning_no_function_key(self) -> None:
        """Handles tool call without 'function' key."""
        tool_calls = [{"id": "call_1", "type": "function"}]

        result = BenchmarkWriter._strip_reasoning_from_tool_calls(tool_calls)

        assert len(result) == 1
        assert result[0] == {"id": "call_1", "type": "function"}

    def test_strip_reasoning_no_arguments_key(self) -> None:
        """Handles tool call without 'arguments' key in function."""
        tool_calls = [
            {"id": "call_1", "type": "function", "function": {"name": "play"}}
        ]

        result = BenchmarkWriter._strip_reasoning_from_tool_calls(tool_calls)

        assert len(result) == 1
        assert result[0]["function"]["name"] == "play"

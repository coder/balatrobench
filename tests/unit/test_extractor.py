"""Unit tests for balatrobench.extractor module."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from balatrobench.extractor import (
    _extract_reasoning_from_tool_calls,
    _iter_jsonl,
    extract_request_content,
    extract_request_metadata,
    extract_response_data,
)


@pytest.mark.unit
class TestIterJsonl:
    """Tests for _iter_jsonl function."""

    def test_iter_jsonl_valid(self, sample_run_dir: Path) -> None:
        """Parses valid JSONL, yields tuples with custom_id."""
        requests_file = sample_run_dir / "requests.jsonl"
        results = list(_iter_jsonl(requests_file))

        assert len(results) >= 1
        # Each result is a tuple of (custom_id, data)
        for custom_id, data in results:
            assert isinstance(custom_id, str)
            assert custom_id.startswith("request-")
            assert isinstance(data, dict)
            assert data["custom_id"] == custom_id

    def test_iter_jsonl_missing_file(self, tmp_path: Path) -> None:
        """Returns empty iterator for non-existent file."""
        non_existent = tmp_path / "does_not_exist.jsonl"
        results = list(_iter_jsonl(non_existent))

        assert results == []

    def test_iter_jsonl_empty_file(self, tmp_path: Path) -> None:
        """Returns empty iterator for empty file."""
        empty_file = tmp_path / "empty.jsonl"
        empty_file.write_text("")
        results = list(_iter_jsonl(empty_file))

        assert results == []

    def test_iter_jsonl_skips_entries_without_custom_id(self, tmp_path: Path) -> None:
        """Skips entries that don't have a custom_id field."""
        jsonl_file = tmp_path / "mixed.jsonl"
        lines = [
            json.dumps({"custom_id": "valid-001", "data": "test1"}),
            json.dumps({"no_custom_id": "invalid", "data": "test2"}),
            json.dumps({"custom_id": "valid-002", "data": "test3"}),
        ]
        jsonl_file.write_text("\n".join(lines))

        results = list(_iter_jsonl(jsonl_file))

        assert len(results) == 2
        assert results[0][0] == "valid-001"
        assert results[1][0] == "valid-002"


@pytest.mark.unit
class TestExtractRequestContent:
    """Tests for extract_request_content function."""

    def test_extract_request_content_from_fixture(self, sample_run_dir: Path) -> None:
        """Test with actual fixture file - extracts strategy/gamestate/memory."""
        requests_file = sample_run_dir / "requests.jsonl"
        content_by_id = extract_request_content(requests_file)

        # Should have entries for the requests
        assert len(content_by_id) >= 1
        assert "request-00001" in content_by_id

        # Each entry should have strategy, gamestate, and memory
        entry = content_by_id["request-00001"]
        assert "strategy" in entry
        assert "gamestate" in entry
        assert "memory" in entry

        # Strategy should contain the Balatro guide text
        assert "Balatro" in entry["strategy"]
        assert len(entry["strategy"]) > 0

        # Gamestate should have content (based on fixture with 3 text parts)
        assert len(entry["gamestate"]) > 0

        # Memory should have content
        assert len(entry["memory"]) > 0

    def test_extract_request_content_missing_file(self, tmp_path: Path) -> None:
        """Returns empty dict for non-existent file."""
        non_existent = tmp_path / "missing.jsonl"
        result = extract_request_content(non_existent)

        assert result == {}

    def test_extract_request_content_string_content(self, tmp_path: Path) -> None:
        """Handles string content (not array) in messages."""
        jsonl_file = tmp_path / "string_content.jsonl"
        line = json.dumps(
            {
                "custom_id": "request-001",
                "body": {"messages": [{"role": "user", "content": "Simple string"}]},
            }
        )
        jsonl_file.write_text(line)

        result = extract_request_content(jsonl_file)

        assert "request-001" in result
        assert result["request-001"]["strategy"] == "Simple string"
        assert result["request-001"]["gamestate"] == ""
        assert result["request-001"]["memory"] == ""


@pytest.mark.unit
class TestExtractResponseData:
    """Tests for extract_response_data function."""

    def test_extract_response_data_from_fixture(self, sample_run_dir: Path) -> None:
        """Test reasoning and tool_calls extraction from fixture."""
        responses_file = sample_run_dir / "responses.jsonl"
        response_by_id = extract_response_data(responses_file)

        # Should have entries for the responses
        assert len(response_by_id) >= 1
        assert "request-00001" in response_by_id

        entry = response_by_id["request-00001"]
        # Should have reasoning and tool_call keys
        assert "reasoning" in entry
        assert "tool_call" in entry

        # Fixture has reasoning in message.reasoning field
        assert len(entry["reasoning"]) > 0
        assert "We need to decide" in entry["reasoning"]

        # Fixture has tool_calls
        assert isinstance(entry["tool_call"], list)
        assert len(entry["tool_call"]) >= 1

        # Tool call should have function with name
        tool_call = entry["tool_call"][0]
        assert "function" in tool_call
        assert tool_call["function"]["name"] == "play"

    def test_extract_response_data_missing_file(self, tmp_path: Path) -> None:
        """Returns empty dict for non-existent file."""
        non_existent = tmp_path / "missing.jsonl"
        result = extract_response_data(non_existent)

        assert result == {}


@pytest.mark.unit
class TestExtractReasoningFromToolCalls:
    """Tests for _extract_reasoning_from_tool_calls function."""

    def test_extracts_reasoning_from_arguments_string(self) -> None:
        """Extracts reasoning when arguments is a JSON string."""
        tool_calls = [
            {
                "function": {
                    "name": "play",
                    "arguments": json.dumps(
                        {"cards": [1, 2], "reasoning": "My reasoning here"}
                    ),
                }
            }
        ]
        result = _extract_reasoning_from_tool_calls(tool_calls)

        assert result == "My reasoning here"

    def test_extracts_reasoning_from_arguments_dict(self) -> None:
        """Extracts reasoning when arguments is already a dict."""
        tool_calls = [
            {
                "function": {
                    "name": "play",
                    "arguments": {"cards": [1, 2], "reasoning": "Dict reasoning"},
                }
            }
        ]
        result = _extract_reasoning_from_tool_calls(tool_calls)

        assert result == "Dict reasoning"

    def test_returns_empty_string_when_no_reasoning(self) -> None:
        """Returns empty string when no reasoning in tool calls."""
        tool_calls = [
            {"function": {"name": "play", "arguments": json.dumps({"cards": [1, 2]})}}
        ]
        result = _extract_reasoning_from_tool_calls(tool_calls)

        assert result == ""

    def test_returns_empty_string_for_empty_list(self) -> None:
        """Returns empty string for empty tool_calls list."""
        result = _extract_reasoning_from_tool_calls([])

        assert result == ""

    def test_handles_invalid_json_gracefully(self) -> None:
        """Handles invalid JSON in arguments without crashing."""
        tool_calls = [{"function": {"name": "play", "arguments": "not valid json"}}]
        result = _extract_reasoning_from_tool_calls(tool_calls)

        assert result == ""


@pytest.mark.unit
class TestExtractRequestMetadata:
    """Tests for extract_request_metadata function."""

    def test_extract_request_metadata_from_fixture(self, sample_run_dir: Path) -> None:
        """Test metadata extraction (status, tokens, timing) from fixture."""
        responses_file = sample_run_dir / "responses.jsonl"
        requests_by_id = extract_request_metadata(responses_file)

        # Should have entries for the responses
        assert len(requests_by_id) >= 1
        assert "request-00001" in requests_by_id

        req = requests_by_id["request-00001"]

        # Check id and status
        assert req.id == "request-00001"
        assert req.status == "success"

        # Check provider
        assert req.provider == "Groq"

        # Check tokens
        assert req.tokens_in == 12742
        assert req.tokens_out == 780

        # Check cost fields
        assert req.cost_in == pytest.approx(0.0018729, rel=1e-4)
        assert req.cost_out == pytest.approx(0.000468, rel=1e-4)
        assert req.cost_total == pytest.approx(0.0023409, rel=1e-4)

    def test_extract_request_metadata_computes_time(self, sample_run_dir: Path) -> None:
        """Verify time_ms is calculated from timestamps."""
        responses_file = sample_run_dir / "responses.jsonl"
        requests_by_id = extract_request_metadata(responses_file)

        req = requests_by_id["request-00001"]

        # time_ms = id (response timestamp) - request_id (request timestamp)
        # From fixture: id=1767974279186, request_id=1767974273970
        expected_time_ms = 1767974279186 - 1767974273970
        assert req.time_ms == expected_time_ms
        assert req.time_ms == 5216

    def test_extract_request_metadata_missing_file(self, tmp_path: Path) -> None:
        """Returns empty dict for non-existent file."""
        non_existent = tmp_path / "missing.jsonl"
        result = extract_request_metadata(non_existent)

        assert result == {}

    def test_extract_request_metadata_error_status(self, tmp_path: Path) -> None:
        """Sets status to 'error' when status_code is not 200."""
        jsonl_file = tmp_path / "error_response.jsonl"
        line = json.dumps(
            {
                "id": "1000",
                "custom_id": "request-error",
                "response": {
                    "request_id": "900",
                    "status_code": 500,
                    "body": {"choices": [{}]},
                },
            }
        )
        jsonl_file.write_text(line)

        result = extract_request_metadata(jsonl_file)

        assert result["request-error"].status == "error"

    def test_extract_request_metadata_with_error_field(self, tmp_path: Path) -> None:
        """Sets status to 'error' when error field is present."""
        jsonl_file = tmp_path / "error_field.jsonl"
        line = json.dumps(
            {
                "id": "1000",
                "custom_id": "request-with-error",
                "error": {"message": "Something went wrong"},
                "response": {
                    "request_id": "900",
                    "status_code": 200,
                    "body": {"choices": [{}]},
                },
            }
        )
        jsonl_file.write_text(line)

        result = extract_request_metadata(jsonl_file)

        assert result["request-with-error"].status == "error"

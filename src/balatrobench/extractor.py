"""Extract data from requests/responses JSONL files."""

import json
from collections.abc import Iterator
from pathlib import Path
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from typing import Literal

from .models import Request


def _iter_jsonl(file: Path) -> Iterator[tuple[str, dict[str, Any]]]:
    """Yield (custom_id, data) pairs from a JSONL file.

    Skips entries without a custom_id.
    """
    if not file.exists():
        return
    with file.open() as f:
        for line in f:
            data = json.loads(line.strip())
            if custom_id := data.get("custom_id"):
                yield custom_id, data


def extract_request_content(requests_file: Path) -> dict[str, dict[str, str]]:
    """Extract strategy/gamestate/memory from requests.jsonl.

    Returns a dict mapping custom_id to content dict with keys:
    - strategy: The strategy prompt text
    - gamestate: The gamestate prompt text
    - memory: The memory prompt text
    """
    content_by_id: dict[str, dict[str, str]] = {}

    for custom_id, data in _iter_jsonl(requests_file):
        body = data.get("body", {})
        messages = body.get("messages", [])
        if not messages:
            continue

        content = messages[0].get("content", "")
        if isinstance(content, list):
            # Content is array of text parts
            text_parts = [item.get("text", "") for item in content if "text" in item]
            content_by_id[custom_id] = {
                "strategy": text_parts[0] if len(text_parts) > 0 else "",
                "gamestate": text_parts[1] if len(text_parts) > 1 else "",
                "memory": text_parts[2] if len(text_parts) > 2 else "",
            }
        else:
            # Content is a single string
            content_by_id[custom_id] = {
                "strategy": content or "",
                "gamestate": "",
                "memory": "",
            }

    return content_by_id


def extract_response_data(responses_file: Path) -> dict[str, dict[str, Any]]:
    """Extract reasoning and tool_call from responses.jsonl.

    Returns a dict mapping custom_id to:
    - reasoning: The LLM's reasoning text
    - tool_call: The tool calls array
    """
    response_by_id: dict[str, dict[str, Any]] = {}

    for custom_id, data in _iter_jsonl(responses_file):
        response = data.get("response") or {}
        body = response.get("body") or {}
        choices = body.get("choices", [])
        if not choices:
            continue

        message = choices[0].get("message", {})
        tool_calls = message.get("tool_calls") or []

        # Try to get reasoning from message field first, then from tool calls
        reasoning = message.get("reasoning", "") or _extract_reasoning_from_tool_calls(
            tool_calls
        )

        response_by_id[custom_id] = {
            "reasoning": reasoning,
            "tool_call": tool_calls,
        }

    return response_by_id


def _extract_reasoning_from_tool_calls(tool_calls: list[dict]) -> str:
    """Extract reasoning from tool call arguments if present."""
    for tool_call in tool_calls:
        function = tool_call.get("function", {})
        arguments = function.get("arguments")
        if arguments:
            try:
                args = (
                    json.loads(arguments) if isinstance(arguments, str) else arguments
                )
                if "reasoning" in args and args["reasoning"]:
                    return args["reasoning"]
            except (json.JSONDecodeError, TypeError):
                continue
    return ""


def extract_request_metadata(responses_file: Path) -> dict[str, Request]:
    """Extract Request metadata from responses.jsonl.

    Returns a dict mapping custom_id to Request.
    """
    requests_by_id: dict[str, Request] = {}

    for custom_id, data in _iter_jsonl(responses_file):
        response = data.get("response") or {}
        body = response.get("body") or {}
        usage = body.get("usage") or {}
        cost_details = usage.get("cost_details", {})

        # Determine status
        status_code = response.get("status_code")
        has_error = data.get("error") is not None
        status: Literal["success", "error"] = (
            "success" if status_code == 200 and not has_error else "error"
        )

        # Calculate time from timestamps if available
        # response_id and request_id are timestamps in the data
        response_ts = int(data.get("id", 0))
        request_ts = int(response.get("request_id", 0))
        time_ms = response_ts - request_ts if response_ts and request_ts else 0

        # Get provider (default to "unknown" if not available)
        provider = body.get("provider") or "unknown"

        requests_by_id[custom_id] = Request(
            id=custom_id,
            status=status,
            provider=provider,
            tokens_in=usage.get("prompt_tokens", 0),
            tokens_out=usage.get("completion_tokens", 0),
            time_ms=time_ms,
            cost_in=cost_details.get("upstream_inference_prompt_cost", 0) or 0,
            cost_out=cost_details.get("upstream_inference_completions_cost", 0) or 0,
            cost_total=usage.get("cost", 0) or 0,
        )

    return requests_by_id

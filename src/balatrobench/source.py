"""Source data models for reading runs/ files.

These TypedDicts mirror the JSON structure written by balatrollm.
They are used for parsing source files, not for output.
"""

from typing import TypedDict


class SourceModel(TypedDict):
    """Model identification in task.json."""

    vendor: str
    name: str


class SourceTask(TypedDict):
    """task.json structure."""

    model: SourceModel
    seed: str
    deck: str  # JSON contains string like "RED", not Deck enum
    stake: str  # JSON contains string like "WHITE", not Stake enum
    strategy: str


class SourceStrategy(TypedDict):
    """strategy.json structure."""

    name: str
    description: str
    author: str
    version: str
    tags: list[str]


class SourceStats(TypedDict):
    """stats.json structure (flat)."""

    # Outcome
    run_won: bool
    run_completed: bool
    final_ante: int
    final_round: int

    # Providers
    providers: dict[str, int]

    # Calls
    calls_total: int
    calls_success: int
    calls_error: int
    calls_failed: int

    # Tokens
    tokens_in_total: int
    tokens_out_total: int
    tokens_in_avg: float
    tokens_out_avg: float
    tokens_in_std: float
    tokens_out_std: float

    # Timing
    time_total_ms: int
    time_avg_ms: float
    time_std_ms: float

    # Cost
    cost_total: float
    cost_avg: float
    cost_std: float

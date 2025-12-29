"""Output data models for benchmark files.

================================================================================
Output Directory Structure
================================================================================

site/benchmarks/
│
├── models/                                         # Compare MODELS (same strategy)
│   ├── manifest.json                               → Manifest
│   └── {version}/{strategy}/
│       ├── leaderboard.json                        → ModelsLeaderboard
│       └── {vendor}/
│           ├── {model}.json                        → Runs
│           └── {model}/{run}/{request}/
│               └── metadata.json                   → Request
│
└── strategies/                                     # Compare STRATEGIES (same model)
    ├── manifest.json                               → Manifest
    └── {version}/{vendor}/{model}/
        ├── leaderboard.json                        → StrategiesLeaderboard
        └── {strategy}/
            ├── runs.json                           → Runs
            └── {run}/{request}/
                └── metadata.json                   → Request

================================================================================
Dataclass Hierarchy
================================================================================

Building Blocks (reusable components):
    Strategy    - Strategy metadata (name, description, author, version, tags)
    Model       - Model identification (vendor, name)
    Config      - Run configuration (seed, deck, stake)
    Stats       - Call/token/time/cost statistics (total, avg, std)

Output Files:
    Manifest                        - List of available versions
    │
    ├── ModelsLeaderboard           - Ranking models for a strategy
    │   └── ModelsLeaderboardEntry
    │       ├── LeaderboardEntry    - run counts, round stats, Stats
    │       └── model: Model
    │
    ├── StrategiesLeaderboard       - Ranking strategies for a model
    │   └── StrategiesLeaderboardEntry
    │       ├── LeaderboardEntry    - run counts, round stats, Stats
    │       └── strategy: Strategy
    │
    ├── Runs                        - Collection of benchmark runs
    │   └── Run                     - Single run with Model, Strategy, Config, Stats
    │
    └── Request                     - Single LLM API call metadata

"""

from dataclasses import dataclass
from typing import Literal

from balatrobench.enums import Deck, Stake

################################################################################
# Version, Manifest, Strategy, Model & Config
################################################################################


@dataclass(frozen=True)
class Version:
    """A version entry in manifest.json."""

    version: str
    latest: bool = False


@dataclass(frozen=True)
class Manifest:
    """manifest.json structure."""

    versions: tuple[Version, ...]


@dataclass(frozen=True)
class Strategy:
    """Strategy metadata."""

    name: str
    description: str
    author: str
    version: str
    tags: tuple[str, ...]


@dataclass(frozen=True)
class Model:
    """Model identification."""

    vendor: str
    name: str


@dataclass(frozen=True)
class Config:
    """Run configuration (Balatro game settings)."""

    seed: str
    deck: Deck
    stake: Stake


################################################################################
# Stats
################################################################################


@dataclass(frozen=True)
class Stats:
    """Statistics computed for a single run or aggregated across runs."""

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


################################################################################
# Leaderboards
################################################################################


@dataclass(frozen=True)
class LeaderboardEntry:
    """Base stats for leaderboard entries (inherited by specific entry types)."""

    # Run summary
    run_count: int
    run_wins: int
    run_completed: int

    # Round statistics
    avg_round: float
    std_round: float

    # Stats
    stats: Stats


@dataclass(frozen=True)
class ModelsLeaderboardEntry(LeaderboardEntry):
    """Entry in models leaderboard - identifies a model."""

    model: Model


@dataclass(frozen=True)
class StrategiesLeaderboardEntry(LeaderboardEntry):
    """Entry in strategies leaderboard - identifies a strategy."""

    strategy: Strategy


@dataclass(frozen=True)
class ModelsLeaderboard:
    """Models leaderboard - comparing models using the same strategy."""

    generated_at: int  # Unix timestamp
    strategy: Strategy
    entries: tuple[ModelsLeaderboardEntry, ...]


@dataclass(frozen=True)
class StrategiesLeaderboard:
    """Strategies leaderboard - comparing strategies for the same model."""

    generated_at: int  # Unix timestamp
    model: Model
    entries: tuple[StrategiesLeaderboardEntry, ...]


################################################################################
# Runs
################################################################################


@dataclass(frozen=True)
class Run:
    """Statistics for a single benchmark run."""

    # Run identification (directory name)
    id: str
    model: Model
    strategy: Strategy
    config: Config

    # Run outcome
    run_won: bool
    run_completed: bool

    # Final game state
    final_ante: int
    final_round: int

    # Provider usage distribution
    providers: dict[str, int]  # provider_name -> call count

    # Per-call statistics within this run
    stats: Stats


@dataclass(frozen=True)
class Runs:
    """Collection of runs for a model+strategy combination."""

    generated_at: int  # Unix timestamp
    model: Model
    strategy: Strategy
    runs: tuple[Run, ...]


################################################################################
# Request
################################################################################


@dataclass(frozen=True)
class Request:
    """Metadata for a single LLM API request."""

    id: str  # Request identifier (e.g., "00042")
    status: Literal["success", "error"]
    provider: str  # LLM provider (e.g., "openai", "azure", "groq")

    # Token usage
    tokens_in: int
    tokens_out: int

    # Timing
    time_ms: int

    # Cost breakdown
    cost_in: float
    cost_out: float
    cost_total: float

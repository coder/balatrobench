"""Unit tests for balatrobench.models module."""

from dataclasses import FrozenInstanceError, fields

import pytest

from balatrobench.enums import Deck, Stake
from balatrobench.models import (
    Config,
    LeaderboardEntry,
    Model,
    ModelsLeaderboardEntry,
    Stats,
)


@pytest.mark.unit
def test_model_frozen(sample_model: Model) -> None:
    """Model dataclass is immutable (raises FrozenInstanceError)."""
    with pytest.raises(FrozenInstanceError):
        sample_model.vendor = "anthropic"  # type: ignore[misc]

    with pytest.raises(FrozenInstanceError):
        sample_model.name = "claude-4"  # type: ignore[misc]


@pytest.mark.unit
def test_model_equality(sample_model: Model) -> None:
    """Two Models with same vendor/name are equal."""
    identical = Model(vendor="openai", name="gpt-oss-120b")
    different_vendor = Model(vendor="anthropic", name="gpt-oss-120b")
    different_name = Model(vendor="openai", name="gpt-4o")

    assert sample_model == identical
    assert sample_model != different_vendor
    assert sample_model != different_name
    # Verify hash equality for use in sets/dicts
    assert hash(sample_model) == hash(identical)


@pytest.mark.unit
def test_stats_fields(sample_stats: Stats) -> None:
    """Stats has all expected fields with correct types."""
    # Expected fields grouped by category
    expected_fields = {
        # Calls (all int)
        "calls_total": int,
        "calls_success": int,
        "calls_error": int,
        "calls_failed": int,
        # Tokens (int for totals, float for avg/std)
        "tokens_in_total": int,
        "tokens_out_total": int,
        "tokens_in_avg": float,
        "tokens_out_avg": float,
        "tokens_in_std": float,
        "tokens_out_std": float,
        # Timing (int for total, float for avg/std)
        "time_total_ms": int,
        "time_avg_ms": float,
        "time_std_ms": float,
        # Cost (all float)
        "cost_total": float,
        "cost_avg": float,
        "cost_std": float,
    }

    # Verify all expected fields exist
    actual_field_names = {f.name for f in fields(Stats)}
    assert actual_field_names == set(expected_fields.keys())

    # Verify field types match
    for field in fields(Stats):
        assert field.type == expected_fields[field.name], (
            f"Field {field.name} has type {field.type}, expected {expected_fields[field.name]}"
        )

    # Verify actual values have correct types
    assert isinstance(sample_stats.calls_total, int)
    assert isinstance(sample_stats.tokens_in_avg, float)
    assert isinstance(sample_stats.time_total_ms, int)
    assert isinstance(sample_stats.cost_total, float)


@pytest.mark.unit
def test_leaderboard_entry_inheritance(
    sample_model: Model, sample_stats: Stats
) -> None:
    """ModelsLeaderboardEntry extends LeaderboardEntry."""
    entry = ModelsLeaderboardEntry(
        run_count=5,
        run_wins=2,
        run_completed=4,
        avg_round=8.5,
        std_round=2.1,
        stats=sample_stats,
        model=sample_model,
    )

    # Verify inheritance
    assert isinstance(entry, LeaderboardEntry)

    # Verify base class fields are accessible
    assert entry.run_count == 5
    assert entry.run_wins == 2
    assert entry.run_completed == 4
    assert entry.avg_round == 8.5
    assert entry.std_round == 2.1
    assert entry.stats is sample_stats

    # Verify subclass field
    assert entry.model is sample_model

    # Verify it's also frozen
    with pytest.raises(FrozenInstanceError):
        entry.run_count = 10  # type: ignore[misc]


@pytest.mark.unit
def test_config_with_enums() -> None:
    """Config correctly uses Deck/Stake enums from strings."""
    # Create config using enum values directly
    config = Config(seed="AAAAAAA", deck=Deck.RED, stake=Stake.WHITE)

    assert config.seed == "AAAAAAA"
    assert config.deck == Deck.RED
    assert config.stake == Stake.WHITE

    # Enums are StrEnums, so they compare equal to their string values
    assert config.deck == "RED"
    assert config.stake == "WHITE"

    # Verify they are actual enum instances
    assert isinstance(config.deck, Deck)
    assert isinstance(config.stake, Stake)

    # Can create from enum members
    config2 = Config(seed="BBBBBBB", deck=Deck.BLUE, stake=Stake.GOLD)
    assert config2.deck == Deck.BLUE
    assert config2.stake == Stake.GOLD

    # Config is also frozen
    with pytest.raises(FrozenInstanceError):
        config.seed = "CCCCCCC"  # type: ignore[misc]

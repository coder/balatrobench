"""Unit tests for balatrobench.enums module."""

import pytest

from balatrobench.enums import Deck, Stake

# All valid deck values
DECK_VALUES = [
    "RED",
    "BLUE",
    "YELLOW",
    "GREEN",
    "BLACK",
    "MAGIC",
    "NEBULA",
    "GHOST",
    "ABANDONED",
    "CHECKERED",
    "ZODIAC",
    "PAINTED",
    "ANAGLYPH",
    "PLASMA",
    "ERRATIC",
]

# All valid stake values
STAKE_VALUES = [
    "WHITE",
    "RED",
    "GREEN",
    "BLACK",
    "BLUE",
    "PURPLE",
    "ORANGE",
    "GOLD",
]


class TestDeck:
    """Tests for Deck enum."""

    def test_deck_count(self) -> None:
        """Verify Deck has exactly 15 members."""
        assert len(Deck) == 15

    @pytest.mark.parametrize("value", DECK_VALUES)
    def test_deck_valid_value(self, value: str) -> None:
        """Each deck type parses correctly from string value."""
        deck = Deck(value)
        assert deck.value == value

    @pytest.mark.parametrize("value", DECK_VALUES)
    def test_deck_str_representation(self, value: str) -> None:
        """Deck enum string representation matches its value."""
        assert str(Deck(value)) == value

    @pytest.mark.parametrize("invalid", ["INVALID", "red", "Red", "", "DIAMOND"])
    def test_deck_invalid_raises(self, invalid: str) -> None:
        """Invalid deck string raises ValueError."""
        with pytest.raises(ValueError, match="is not a valid Deck"):
            Deck(invalid)


class TestStake:
    """Tests for Stake enum."""

    def test_stake_count(self) -> None:
        """Verify Stake has exactly 8 members."""
        assert len(Stake) == 8

    @pytest.mark.parametrize("value", STAKE_VALUES)
    def test_stake_valid_value(self, value: str) -> None:
        """Each stake level parses correctly from string value."""
        stake = Stake(value)
        assert stake.value == value

    @pytest.mark.parametrize("value", STAKE_VALUES)
    def test_stake_str_representation(self, value: str) -> None:
        """Stake enum string representation matches its value."""
        assert str(Stake(value)) == value

    @pytest.mark.parametrize("invalid", ["INVALID", "white", "White", "", "DIAMOND"])
    def test_stake_invalid_raises(self, invalid: str) -> None:
        """Invalid stake string raises ValueError."""
        with pytest.raises(ValueError, match="is not a valid Stake"):
            Stake(invalid)

"""Enums for Balatro game configuration."""

from enum import StrEnum


class Deck(StrEnum):
    """Balatro deck types with their special abilities."""

    RED = "RED"  # +1 discard every round
    BLUE = "BLUE"  # +1 hand every round
    YELLOW = "YELLOW"  # Start with extra $10
    GREEN = "GREEN"  # At end of each Round, $2 per remaining Hand $1 per remaining Discard Earn no Interest
    BLACK = "BLACK"  # +1 Joker slot -1 hand every round
    MAGIC = "MAGIC"  # Start run with the Crystal Ball voucher and 2 copies of The Fool
    NEBULA = "NEBULA"  # Start run with the Telescope voucher and -1 consumable slot
    GHOST = "GHOST"  # Spectral cards may appear in the shop. Start with a Hex card
    ABANDONED = "ABANDONED"  # Start run with no Face Cards in your deck
    CHECKERED = "CHECKERED"  # Start run with 26 Spades and 26 Hearts in deck
    ZODIAC = "ZODIAC"  # Start run with Tarot Merchant, Planet Merchant, and Overstock
    PAINTED = "PAINTED"  # +2 hand size, -1 Joker slot
    ANAGLYPH = "ANAGLYPH"  # After defeating each Boss Blind, gain a Double Tag
    PLASMA = "PLASMA"  # Balanced Chips and Mult when calculating score for played hand X2 base Blind size
    ERRATIC = "ERRATIC"  # All Ranks and Suits in deck are randomized


class Stake(StrEnum):
    """Balatro stake (difficulty) levels."""

    WHITE = "WHITE"  # 1. Base Difficulty
    RED = "RED"  # 2. Small Blind gives no reward money. Applies all previous Stakes
    GREEN = "GREEN"  # 3. Required scores scales faster for each Ante. Applies all previous Stakes
    BLACK = "BLACK"  # 4. Shop can have Eternal Jokers. Applies all previous Stakes
    BLUE = "BLUE"  # 5. -1 Discard. Applies all previous Stakes
    PURPLE = "PURPLE"  # 6. Required score scales faster for each Ante. Applies all previous Stakes
    ORANGE = "ORANGE"  # 7. Shop can have Perishable Jokers. Applies all previous Stakes
    GOLD = "GOLD"  # 8. Shop can have Rental Jokers. Applies all previous Stakes

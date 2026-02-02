"""Shared pytest fixtures for balatrobench tests."""

from pathlib import Path

import pytest

from balatrobench.models import Model, Stats, Strategy


@pytest.fixture
def fixtures_dir() -> Path:
    """Root fixtures directory."""
    return Path(__file__).parent / "fixtures"


@pytest.fixture
def sample_run_dir(fixtures_dir: Path) -> Path:
    """Path to sample run directory."""
    return (
        fixtures_dir
        / "runs/v1.0.0/default/openai/gpt-oss-120b/20260109_165752_472_RED_WHITE_BBBBBBB"
    )


@pytest.fixture
def sample_model() -> Model:
    """Sample Model instance."""
    return Model(vendor="openai", name="gpt-oss-120b")


@pytest.fixture
def sample_strategy() -> Strategy:
    """Sample Strategy instance."""
    return Strategy(
        name="Default",
        key="default",
        description="The default BalatroLLM strategy",
        author="BalatroLLM",
        version="1.0.0",
        tags=("conservative", "financial"),
    )


@pytest.fixture
def sample_stats() -> Stats:
    """Sample Stats instance with realistic values."""
    return Stats(
        calls_total=87,
        calls_success=80,
        calls_error=4,
        calls_failed=3,
        tokens_in_total=1192725,
        tokens_out_total=113174,
        tokens_in_avg=13709.48,
        tokens_out_avg=1300.85,
        tokens_in_std=339.62,
        tokens_out_std=656.66,
        time_total_ms=365282,
        time_avg_ms=4198.64,
        time_std_ms=1867.97,
        cost_total=0.172,
        cost_avg=0.00198,
        cost_std=0.000465,
    )


@pytest.fixture
def temp_output_dir(tmp_path: Path) -> Path:
    """Temporary output directory for integration tests."""
    return tmp_path / "output"


@pytest.fixture
def version_dir(fixtures_dir: Path) -> Path:
    """Path to the version directory containing runs."""
    return fixtures_dir / "runs" / "v1.0.0"


def pytest_collection_modifyitems(items):
    """Auto-assign unit/integration markers based on test path."""
    for item in items:
        if "/unit/" in item.nodeid:
            item.add_marker(pytest.mark.unit)
        elif "/integration/" in item.nodeid:
            item.add_marker(pytest.mark.integration)

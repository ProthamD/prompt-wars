"""
Tests for /api/v1/nudge (Grid Carbon Nudge) endpoint.
Runs in demo mode (no WattTime API key required).
"""
from unittest.mock import patch
from tests.conftest import *


def test_nudge_returns_grid_zone(client):
    """Demo mode should echo back the grid zone."""
    with patch("core.config.settings.WATTTIME_API_KEY", ""):
        response = client.get("/api/v1/nudge/CAISO_NORTH")
    assert response.status_code == 200
    data = response.json()
    assert data["grid_zone"] == "CAISO_NORTH"


def test_nudge_returns_required_fields(client):
    """All required GridNudgeResponse fields must be present."""
    with patch("core.config.settings.WATTTIME_API_KEY", ""):
        response = client.get("/api/v1/nudge/PJM")
    assert response.status_code == 200
    data = response.json()
    for field in ["grid_zone", "is_good_time", "forecast_clean_hours", "message", "source"]:
        assert field in data, f"Missing field: {field}"


def test_nudge_demo_source(client):
    """Demo mode should report source as 'demo'."""
    with patch("core.config.settings.WATTTIME_API_KEY", ""):
        response = client.get("/api/v1/nudge/MISO")
    assert response.status_code == 200
    assert response.json()["source"] == "demo"


def test_nudge_message_is_non_empty(client):
    """Message should always be a non-empty string."""
    with patch("core.config.settings.WATTTIME_API_KEY", ""):
        response = client.get("/api/v1/nudge/ERCOT")
    assert response.status_code == 200
    assert len(response.json()["message"]) > 0


def test_nudge_is_good_time_is_boolean(client):
    """is_good_time must be a boolean."""
    with patch("core.config.settings.WATTTIME_API_KEY", ""):
        response = client.get("/api/v1/nudge/NYISO")
    assert response.status_code == 200
    assert isinstance(response.json()["is_good_time"], bool)


def test_nudge_forecast_hours_non_negative(client):
    """forecast_clean_hours must be >= 0."""
    with patch("core.config.settings.WATTTIME_API_KEY", ""):
        response = client.get("/api/v1/nudge/SPP")
    assert response.status_code == 200
    assert response.json()["forecast_clean_hours"] >= 0

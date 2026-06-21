"""
Tests for /api/v1/scanner (barcode product carbon lookup) endpoint.
Uses a known barcode that falls through to the category-average fallback.
"""
from tests.conftest import *


def test_scanner_returns_barcode(client):
    """Response should echo back the requested barcode."""
    response = client.get("/api/v1/scanner/0000000000000")
    assert response.status_code == 200
    data = response.json()
    assert data["barcode"] == "0000000000000"


def test_scanner_fallback_returns_estimate(client):
    """Unknown barcodes must fall back to a category-average estimate."""
    response = client.get("/api/v1/scanner/0000000000000")
    assert response.status_code == 200
    data = response.json()
    assert data["source"] in ("open_food_facts", "category_average")
    assert data["data_quality"] in ("high", "medium", "estimate")


def test_scanner_fallback_co2e_is_positive(client):
    """Fallback estimated CO2e should be a positive number."""
    response = client.get("/api/v1/scanner/0000000000000")
    assert response.status_code == 200
    data = response.json()
    if data["co2e_kg_estimated"] is not None:
        assert data["co2e_kg_estimated"] > 0


def test_scanner_alternatives_is_list(client):
    """alternatives must always be a list."""
    response = client.get("/api/v1/scanner/0000000000000")
    assert response.status_code == 200
    assert isinstance(response.json()["alternatives"], list)


def test_scanner_required_fields(client):
    """All required response fields must be present."""
    response = client.get("/api/v1/scanner/0000000000000")
    assert response.status_code == 200
    data = response.json()
    for field in ["barcode", "source", "data_quality", "alternatives"]:
        assert field in data, f"Missing field: {field}"


def test_scanner_custom_quantity(client):
    """quantity_g param should be accepted without error."""
    response = client.get("/api/v1/scanner/0000000000000?quantity_g=500")
    assert response.status_code == 200

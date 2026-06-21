"""
Tests for /api/v1/footprint endpoints.
"""
from tests.conftest import *


def test_create_record_returns_id(client):
    payload = {
        "user_id": "test_user_123",
        "category": "transport",
        "sub_category": "Gas Station",
        "co2e_kg": 12.4,
        "source": "manual",
        "label": "Fill-up",
        "date": "2024-06-01",
    }
    response = client.post("/api/v1/footprint/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["id"].startswith("rec_")


def test_create_record_returns_status(client):
    payload = {
        "user_id": "test_user_123",
        "category": "food",
        "sub_category": "Groceries",
        "co2e_kg": 0.8,
        "source": "manual",
        "label": "Weekly shop",
        "date": "2024-06-01",
    }
    response = client.post("/api/v1/footprint/", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "created"


def test_create_record_optional_fields(client):
    """amount_usd and transaction_id are optional."""
    payload = {
        "user_id": "test_user_123",
        "category": "energy",
        "sub_category": "Electricity",
        "co2e_kg": 38.2,
        "source": "manual",
        "label": "Monthly bill",
        "date": "2024-06-01",
        "amount_usd": 85.50,
        "transaction_id": "txn_abc123",
    }
    response = client.post("/api/v1/footprint/", json=payload)
    assert response.status_code == 200


def test_get_summary_returns_user_id(client):
    response = client.get("/api/v1/footprint/summary/user_123")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "user_123"


def test_get_summary_returns_categories(client):
    response = client.get("/api/v1/footprint/summary/user_123")
    assert response.status_code == 200
    data = response.json()
    assert "categories" in data
    assert "total_co2e_kg" in data


def test_get_summary_custom_months(client):
    response = client.get("/api/v1/footprint/summary/user_123?months=3")
    assert response.status_code == 200
    data = response.json()
    assert data["period_months"] == 3


def test_list_records_returns_empty(client):
    response = client.get("/api/v1/footprint/records/new_user_xyz")
    assert response.status_code == 200
    data = response.json()
    assert "records" in data
    assert isinstance(data["records"], list)


def test_create_record_missing_required_field(client):
    """co2e_kg is required — should return 422."""
    payload = {
        "user_id": "test_user",
        "category": "food",
        "sub_category": "Groceries",
        # missing co2e_kg
        "source": "manual",
        "label": "test",
        "date": "2024-06-01",
    }
    response = client.post("/api/v1/footprint/", json=payload)
    assert response.status_code == 422

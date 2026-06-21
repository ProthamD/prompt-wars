"""
Tests for /api/v1/marketplace and /api/v1/ingestion endpoints.
"""
from tests.conftest import *


# ─── Marketplace ──────────────────────────────────────────────────────────────

def test_marketplace_list_actions_returns_200(client):
    """GET /api/v1/marketplace/actions should return 200."""
    response = client.get("/api/v1/marketplace/actions?user_id=test_user")
    assert response.status_code == 200


def test_marketplace_list_actions_returns_actions_key(client):
    """Response must contain an 'actions' key with a list."""
    response = client.get("/api/v1/marketplace/actions?user_id=test_user")
    assert response.status_code == 200
    data = response.json()
    assert "actions" in data
    assert isinstance(data["actions"], list)


def test_marketplace_actions_with_category_filter(client):
    """Category filter param should be accepted without error."""
    response = client.get("/api/v1/marketplace/actions?user_id=test_user&category=energy")
    assert response.status_code == 200


def test_marketplace_actions_missing_user_id(client):
    """user_id is required — missing it should return 422."""
    response = client.get("/api/v1/marketplace/actions")
    assert response.status_code == 422


# ─── Ingestion ────────────────────────────────────────────────────────────────

def test_ingestion_webhook_returns_queued(client):
    """Plaid webhook should accept any payload and return queued status."""
    response = client.post("/api/v1/ingestion/plaid/webhook", json={
        "webhook_type": "TRANSACTIONS",
        "webhook_code": "SYNC_UPDATES_AVAILABLE",
        "item_id": "item_abc123",
    })
    assert response.status_code == 200
    assert response.json()["status"] == "queued"


def test_ingestion_webhook_empty_payload(client):
    """Webhook should accept empty payloads without crashing."""
    response = client.post("/api/v1/ingestion/plaid/webhook", json={})
    assert response.status_code == 200

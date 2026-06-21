"""
Tests for the /health endpoint.
"""
from tests.conftest import *


def test_health_returns_ok(client):
    response = client.get("/health")
    assert response.status_code == 200


def test_health_response_structure(client):
    data = response = client.get("/health").json()
    assert "status" in data
    assert data["status"] == "ok"


def test_health_returns_version(client):
    data = client.get("/health").json()
    assert "version" in data
    assert isinstance(data["version"], str)
    assert len(data["version"]) > 0

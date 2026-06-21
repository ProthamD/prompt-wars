"""
Tests for /api/v1/coach endpoint (demo mode — no Groq API key required).
"""
from unittest.mock import patch
from tests.conftest import *


def test_coach_demo_mode_returns_reply(client):
    """Without a Groq key, the coach should return a rule-based reply."""
    with patch("core.config.settings.GROQ_API_KEY", ""):
        response = client.post("/api/v1/coach/", json={
            "user_id": "test_user",
            "message": "What should I do about my food choices?",
        })
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 0


def test_coach_returns_sources(client):
    with patch("core.config.settings.GROQ_API_KEY", ""):
        response = client.post("/api/v1/coach/", json={
            "user_id": "test_user",
            "message": "How can I reduce my transport emissions?",
        })
    assert response.status_code == 200
    data = response.json()
    assert "sources" in data
    assert isinstance(data["sources"], list)


def test_coach_returns_confidence(client):
    with patch("core.config.settings.GROQ_API_KEY", ""):
        response = client.post("/api/v1/coach/", json={
            "user_id": "test_user",
            "message": "Tell me about energy usage.",
        })
    assert response.status_code == 200
    data = response.json()
    assert "confidence" in data
    assert 0.0 <= data["confidence"] <= 1.0


def test_coach_food_message(client):
    with patch("core.config.settings.GROQ_API_KEY", ""):
        response = client.post("/api/v1/coach/", json={
            "user_id": "test_user",
            "message": "I eat meat every day, how bad is it?",
        })
    assert response.status_code == 200
    reply = response.json()["reply"]
    # Food-related reply should mention food-related terms
    assert any(word in reply.lower() for word in ["food", "meat", "beef", "plant", "diet"])


def test_coach_transport_message(client):
    with patch("core.config.settings.GROQ_API_KEY", ""):
        response = client.post("/api/v1/coach/", json={
            "user_id": "test_user",
            "message": "I drive my car to work every day.",
        })
    assert response.status_code == 200
    reply = response.json()["reply"]
    assert any(word in reply.lower() for word in ["transport", "car", "flight", "train", "rail", "driving"])


def test_coach_missing_user_id(client):
    """user_id is required."""
    response = client.post("/api/v1/coach/", json={
        "message": "Tell me something.",
    })
    assert response.status_code == 422


def test_coach_missing_message(client):
    """message is required."""
    response = client.post("/api/v1/coach/", json={
        "user_id": "test_user",
    })
    assert response.status_code == 422


def test_coach_with_conversation_history(client):
    with patch("core.config.settings.GROQ_API_KEY", ""):
        response = client.post("/api/v1/coach/", json={
            "user_id": "test_user",
            "message": "What about my energy usage?",
            "conversation_history": [
                {"role": "user", "content": "How do I reduce my footprint?"},
                {"role": "assistant", "content": "Great question!"},
            ],
        })
    assert response.status_code == 200

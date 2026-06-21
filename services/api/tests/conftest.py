"""
Shared test fixtures for the Terraprint FastAPI test suite.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
import sys
import os

# Make sure the app root is on the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app


@pytest.fixture(scope="module")
def client():
    """Return a synchronous test client for the FastAPI app."""
    with TestClient(app) as c:
        yield c

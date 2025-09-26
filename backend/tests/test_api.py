from __future__ import annotations

import os
import tempfile
from contextlib import contextmanager

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.settings import get_settings, Settings


@pytest.fixture(autouse=True)
def temp_db(monkeypatch):
    # use a temp sqlite file to avoid threading issues with in-memory db + TestClient
    tmp = tempfile.NamedTemporaryFile(delete=False)
    tmp.close()
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{tmp.name}")
    # refresh settings cache
    get_settings.cache_clear()  # type: ignore[attr-defined]
    yield
    os.unlink(tmp.name)


def test_health():
    client = TestClient(app)
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_crud_and_vote_flow():
    client = TestClient(app)

    # create idea
    res = client.post("/api/v1/ideas", json={"title": "Dark Mode", "description": "Add dark theme"})
    assert res.status_code == 201, res.text
    idea = res.json()

    # get idea
    res = client.get(f"/api/v1/ideas/{idea['id']}")
    assert res.status_code == 200
    assert res.json()["title"] == "Dark Mode"

    # list ideas
    res = client.get("/api/v1/ideas")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1

    # vote
    res = client.post(f"/api/v1/ideas/{idea['id']}/vote", json={"voter": "alice"})
    assert res.status_code == 204
    # duplicate vote -> 409
    res = client.post(f"/api/v1/ideas/{idea['id']}/vote", json={"voter": "alice"})
    assert res.status_code == 409

    # count
    res = client.get(f"/api/v1/ideas/{idea['id']}/votes_count")
    assert res.status_code == 200
    assert res.json()["votes_count"] == 1

    # update
    res = client.put(f"/api/v1/ideas/{idea['id']}", json={"description": "Add dark theme site-wide"})
    assert res.status_code == 200
    assert res.json()["description"].startswith("Add dark theme")

    # delete
    res = client.delete(f"/api/v1/ideas/{idea['id']}")
    assert res.status_code == 204

    # not found
    res = client.get(f"/api/v1/ideas/{idea['id']}")
    assert res.status_code == 404


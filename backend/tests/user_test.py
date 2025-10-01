# backend/test_get_users.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.models.models import Base
from get_users import router
from fastapi import FastAPI
from app.core.db import get_db

# Create a test database and session (shared in-memory SQLite)
TEST_DATABASE_URL = "sqlite://"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,  # keep one connection for the in-memory DB
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency override
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Setup FastAPI app for testing
app = FastAPI()
app.include_router(router)
app.dependency_overrides = {}
# Use the actual dependency function object as the key
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_create_user_success():
    response = client.post("/users", json={"username": "alice", "password": "secret"})
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "alice"

def test_create_user_duplicate():
    client.post("/users", json={"username": "bob", "password": "pw"})
    response = client.post("/users", json={"username": "bob", "password": "pw2"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already exists"

def test_get_user_success():
    client.post("/users", json={"username": "carol", "password": "pw"})
    response = client.get("/users/carol")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "carol"

def test_get_user_not_found():
    response = client.get("/users/notfound")
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"

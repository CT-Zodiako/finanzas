from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app


engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def setup_module():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    app.router.on_startup.clear()


def teardown_module():
    app.dependency_overrides.clear()


def test_register_login_logout_and_me_flow():
    client = TestClient(app)

    register_res = client.post(
        "/api/v1/auth/register",
        json={"nombre": "Ana", "email": "ana@test.dev", "password": "secreta123"},
    )
    assert register_res.status_code == 200

    duplicate_res = client.post(
        "/api/v1/auth/register",
        json={"nombre": "Ana", "email": "ana@test.dev", "password": "secreta123"},
    )
    assert duplicate_res.status_code == 409

    me_res = client.get("/api/v1/auth/me")
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "ana@test.dev"

    logout_res = client.post("/api/v1/auth/logout")
    assert logout_res.status_code == 200

    me_after_logout = client.get("/api/v1/auth/me")
    assert me_after_logout.status_code == 401


def test_login_invalid_credentials_returns_401():
    client = TestClient(app)

    client.post(
        "/api/v1/auth/register",
        json={"nombre": "Pepe", "email": "pepe@test.dev", "password": "secreta123"},
    )

    invalid_login = client.post(
        "/api/v1/auth/login",
        json={"email": "pepe@test.dev", "password": "incorrecta"},
    )
    assert invalid_login.status_code == 401

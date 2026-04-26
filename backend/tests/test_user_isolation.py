from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.core.security import hash_password
from app.models.user import User
from app.schemas.income import IncomeCreate
from app.schemas.income import IncomeUpdate
from app.services.income_service import IncomeService


def test_income_isolation_between_users():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        user_a = User(nombre="A", email="a@test.dev", password_hash=hash_password("12345678"), rol="usuario")
        user_b = User(nombre="B", email="b@test.dev", password_hash=hash_password("12345678"), rol="usuario")
        db.add_all([user_a, user_b])
        db.commit()
        db.refresh(user_a)
        db.refresh(user_b)

        service = IncomeService(db)
        created = service.create(
            IncomeCreate(name="Sueldo", amount=1000, is_recurring=True, category="Trabajo", date=None),
            user_a.id,
        )

        list_a = service.get_all(user_a.id)
        list_b = service.get_all(user_b.id)
        assert len(list_a) == 1
        assert len(list_b) == 0

        update_cross = service.update(created.id, IncomeUpdate(name="Hack"), user_b.id)
        assert update_cross is None

        deleted_cross = service.delete(created.id, user_b.id)
        assert deleted_cross is False
    finally:
        db.close()

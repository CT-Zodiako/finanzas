from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email.lower()).first()

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def create_user(self, nombre: str, email: str, password_hash: str, rol: str = "usuario") -> User:
        user = User(
            nombre=nombre,
            email=email.lower(),
            password_hash=password_hash,
            rol=rol,
            is_active=True,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User) -> User:
        self.db.commit()
        self.db.refresh(user)
        return user

    def reset_failed_attempts(self, user: User) -> User:
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login_at = datetime.now(timezone.utc)
        return self.update(user)

    def register_failed_attempt(self, user: User, lock_until: datetime | None = None) -> User:
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        if lock_until is not None:
            user.locked_until = lock_until
        return self.update(user)

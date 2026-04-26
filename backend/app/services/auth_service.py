from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest


class AuthService:
    MAX_FAILED_ATTEMPTS = 5
    LOCK_MINUTES = 15

    def __init__(self, db: Session):
        self.repository = UserRepository(db)

    def register(self, payload: RegisterRequest) -> tuple[User, str]:
        existing = self.repository.get_by_email(payload.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        user = self.repository.create_user(
            nombre=payload.nombre,
            email=payload.email,
            password_hash=hash_password(payload.password),
        )
        token = create_access_token(user.id)
        return user, token

    def login(self, payload: LoginRequest) -> tuple[User, str]:
        user = self.repository.get_by_email(payload.email)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        now = datetime.now(timezone.utc)
        if user.locked_until and user.locked_until > now:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is temporarily locked")

        if not verify_password(payload.password, user.password_hash):
            attempts = (user.failed_login_attempts or 0) + 1
            lock_until = None
            if attempts >= self.MAX_FAILED_ATTEMPTS:
                lock_until = now + timedelta(minutes=self.LOCK_MINUTES)
            self.repository.register_failed_attempt(user, lock_until)
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        self.repository.reset_failed_attempts(user)
        token = create_access_token(user.id)
        return user, token

    def me(self, user_id: int) -> User:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")
        return user

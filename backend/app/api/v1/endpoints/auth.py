from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import clear_auth_cookie, get_current_user, set_auth_cookie
from app.models.user import User
from app.schemas.auth import LoginRequest, MeResponse, RegisterRequest
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=MeResponse)
def register(payload: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    service = AuthService(db)
    user, token = service.register(payload)
    set_auth_cookie(response, token)
    return MeResponse.model_validate(user)


@router.post("/login", response_model=MeResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    service = AuthService(db)
    user, token = service.login(payload)
    set_auth_cookie(response, token)
    return MeResponse.model_validate(user)


@router.post("/logout")
def logout(response: Response):
    clear_auth_cookie(response)
    return {"message": "Logged out"}


@router.get("/me", response_model=MeResponse)
def me(current_user: User = Depends(get_current_user)):
    return MeResponse.model_validate(current_user)

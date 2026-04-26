from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    nombre: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class MeResponse(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    rol: str

    model_config = ConfigDict(from_attributes=True)


class AuthError(BaseModel):
    detail: str

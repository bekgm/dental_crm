"""Auth endpoints — register, login, refresh, me."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, DBSession
from app.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserRead,
)
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: RegisterRequest, session: DBSession):
    service = AuthService(session)
    return await service.register(data)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, session: DBSession):
    service = AuthService(session)
    return await service.login(data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, session: DBSession):
    service = AuthService(session)
    return await service.refresh(data.refresh_token)


@router.get("/me", response_model=UserRead)
async def me(current_user: CurrentUser):
    return current_user

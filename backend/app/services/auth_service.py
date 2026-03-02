"""Authentication service."""

from __future__ import annotations

from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, ConflictException, NotFoundException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.repositories.user_repo import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = UserRepository(session)

    async def register(self, data: RegisterRequest) -> TokenResponse:
        existing = await self.repo.get_by_email(data.email)
        if existing:
            raise ConflictException("Email already registered")

        user = await self.repo.create(
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
            phone=data.phone,
            role="patient",
        )

        return TokenResponse(
            access_token=create_access_token(user.id, user.role),
            refresh_token=create_refresh_token(user.id),
        )

    async def login(self, data: LoginRequest) -> TokenResponse:
        user = await self.repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise BadRequestException("Invalid email or password")
        if not user.is_active:
            raise BadRequestException("Account is deactivated")

        return TokenResponse(
            access_token=create_access_token(user.id, user.role),
            refresh_token=create_refresh_token(user.id),
        )

    async def refresh(self, refresh_token: str) -> TokenResponse:
        try:
            payload = decode_token(refresh_token)
        except JWTError:
            raise BadRequestException("Invalid refresh token")

        if payload.get("type") != "refresh":
            raise BadRequestException("Invalid token type")

        user_id = payload.get("sub")
        if not user_id:
            raise BadRequestException("Invalid refresh token")

        user = await self.repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise NotFoundException("User")

        return TokenResponse(
            access_token=create_access_token(user.id, user.role),
            refresh_token=create_refresh_token(user.id),
        )

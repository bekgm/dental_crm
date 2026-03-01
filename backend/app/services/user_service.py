"""User management service."""

from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.core.security import hash_password
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.auth import UserCreate, UserRead, UserUpdate


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = UserRepository(session)

    async def list_users(
        self,
        page: int = 1,
        per_page: int = 20,
        sort_by: str | None = None,
        sort_order: str = "asc",
        search: str | None = None,
        role: str | None = None,
    ) -> dict[str, Any]:
        filters = []
        if search:
            filters.append(User.full_name.ilike(f"%{search}%"))
        if role:
            filters.append(User.role == role)

        return await self.repo.paginate(
            page=page,
            per_page=per_page,
            sort_by=sort_by,
            sort_order=sort_order,
            filters=filters or None,
        )

    async def get_user(self, user_id: str) -> User:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("User")
        return user

    async def create_user(self, data: UserCreate) -> User:
        existing = await self.repo.get_by_email(data.email)
        if existing:
            raise ConflictException("Email already registered")
        return await self.repo.create(
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
            role=data.role,
            phone=data.phone,
        )

    async def update_user(self, user_id: str, data: UserUpdate) -> User:
        user = await self.repo.update(
            user_id, **data.model_dump(exclude_unset=True)
        )
        if not user:
            raise NotFoundException("User")
        return user

    async def delete_user(self, user_id: str) -> None:
        deleted = await self.repo.delete(user_id)
        if not deleted:
            raise NotFoundException("User")

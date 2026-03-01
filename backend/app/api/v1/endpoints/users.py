"""User management endpoints (admin only)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.core.deps import CurrentUser, DBSession, require_admin
from app.schemas.auth import UserCreate, UserRead, UserUpdate
from app.schemas.common import MessageResponse, PaginatedResponse
from app.services.user_service import UserService

router = APIRouter()


@router.get("", response_model=PaginatedResponse[UserRead])
async def list_users(
    session: DBSession,
    _admin: CurrentUser = Depends(require_admin),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    sort_by: str | None = None,
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    search: str | None = None,
    role: str | None = None,
):
    service = UserService(session)
    result = await service.list_users(
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        sort_order=sort_order,
        search=search,
        role=role,
    )
    result["items"] = [UserRead.model_validate(u) for u in result["items"]]
    return result


@router.get("/{user_id}", response_model=UserRead)
async def get_user(
    user_id: str,
    session: DBSession,
    _admin: CurrentUser = Depends(require_admin),
):
    service = UserService(session)
    return await service.get_user(user_id)


@router.post("", response_model=UserRead, status_code=201)
async def create_user(
    data: UserCreate,
    session: DBSession,
    _admin: CurrentUser = Depends(require_admin),
):
    service = UserService(session)
    return await service.create_user(data)


@router.patch("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: str,
    data: UserUpdate,
    session: DBSession,
    _admin: CurrentUser = Depends(require_admin),
):
    service = UserService(session)
    return await service.update_user(user_id, data)


@router.delete("/{user_id}", response_model=MessageResponse)
async def delete_user(
    user_id: str,
    session: DBSession,
    _admin: CurrentUser = Depends(require_admin),
):
    service = UserService(session)
    await service.delete_user(user_id)
    return MessageResponse(detail="User deleted")

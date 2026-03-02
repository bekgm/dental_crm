"""Service catalog endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.core.deps import CurrentUser, DBSession, require_admin
from app.models.user import User
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.service import ServiceCreate, ServiceRead, ServiceUpdate
from app.services.service_catalog_service import ServiceCatalogService

router = APIRouter()


@router.get("", response_model=PaginatedResponse[ServiceRead])
async def list_services(
    session: DBSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    sort_by: str | None = None,
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    category: str | None = None,
):
    svc = ServiceCatalogService(session)
    result = await svc.list_services(
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        sort_order=sort_order,
        category=category,
    )
    result["items"] = [ServiceRead.model_validate(s) for s in result["items"]]
    return result


@router.get("/{service_id}", response_model=ServiceRead)
async def get_service(
    service_id: str,
    session: DBSession,
    current_user: CurrentUser,
):
    svc = ServiceCatalogService(session)
    return await svc.get_service(service_id)


@router.post("", response_model=ServiceRead, status_code=201)
async def create_service(
    data: ServiceCreate,
    session: DBSession,
    _admin: User = Depends(require_admin),
):
    svc = ServiceCatalogService(session)
    return await svc.create_service(data)


@router.patch("/{service_id}", response_model=ServiceRead)
async def update_service(
    service_id: str,
    data: ServiceUpdate,
    session: DBSession,
    _admin: User = Depends(require_admin),
):
    svc = ServiceCatalogService(session)
    return await svc.update_service(service_id, data)


@router.delete("/{service_id}", response_model=MessageResponse)
async def delete_service(
    service_id: str,
    session: DBSession,
    _admin: User = Depends(require_admin),
):
    svc = ServiceCatalogService(session)
    await svc.delete_service(service_id)
    return MessageResponse(detail="Service deleted")

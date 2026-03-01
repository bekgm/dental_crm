"""Service catalog service."""

from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.models.service import Service
from app.repositories.service_repo import ServiceRepository
from app.schemas.service import ServiceCreate, ServiceUpdate


class ServiceCatalogService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = ServiceRepository(session)

    async def list_services(
        self,
        page: int = 1,
        per_page: int = 20,
        sort_by: str | None = None,
        sort_order: str = "asc",
        category: str | None = None,
        active_only: bool = True,
    ) -> dict[str, Any]:
        filters = []
        if active_only:
            filters.append(Service.is_active == True)  # noqa: E712
        if category:
            filters.append(Service.category == category)
        return await self.repo.paginate(
            page=page,
            per_page=per_page,
            sort_by=sort_by or "name",
            sort_order=sort_order,
            filters=filters or None,
        )

    async def get_service(self, service_id: str) -> Service:
        service = await self.repo.get_by_id(service_id)
        if not service:
            raise NotFoundException("Service")
        return service

    async def create_service(self, data: ServiceCreate) -> Service:
        return await self.repo.create(**data.model_dump())

    async def update_service(self, service_id: str, data: ServiceUpdate) -> Service:
        service = await self.repo.update(
            service_id, **data.model_dump(exclude_unset=True)
        )
        if not service:
            raise NotFoundException("Service")
        return service

    async def delete_service(self, service_id: str) -> None:
        deleted = await self.repo.delete(service_id)
        if not deleted:
            raise NotFoundException("Service")

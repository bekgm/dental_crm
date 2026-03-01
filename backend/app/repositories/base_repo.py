"""Generic async repository with CRUD + pagination."""

from __future__ import annotations

import math
from typing import Any, Generic, List, Optional, Sequence, Type, TypeVar

from sqlalchemy import func, select, asc, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    """Reusable repository providing standard CRUD operations."""

    def __init__(self, model: Type[ModelT], session: AsyncSession) -> None:
        self.model = model
        self.session = session

    async def get_by_id(self, entity_id: str) -> Optional[ModelT]:
        return await self.session.get(self.model, entity_id)

    async def get_all(self) -> Sequence[ModelT]:
        result = await self.session.execute(select(self.model))
        return result.scalars().all()

    async def create(self, **kwargs: Any) -> ModelT:
        instance = self.model(**kwargs)
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def update(self, entity_id: str, **kwargs: Any) -> Optional[ModelT]:
        instance = await self.get_by_id(entity_id)
        if instance is None:
            return None
        for key, value in kwargs.items():
            if value is not None:
                setattr(instance, key, value)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def delete(self, entity_id: str) -> bool:
        instance = await self.get_by_id(entity_id)
        if instance is None:
            return False
        await self.session.delete(instance)
        await self.session.flush()
        return True

    async def paginate(
        self,
        page: int = 1,
        per_page: int = 20,
        sort_by: Optional[str] = None,
        sort_order: str = "asc",
        filters: Optional[List[Any]] = None,
    ) -> dict[str, Any]:
        query = select(self.model)
        count_query = select(func.count()).select_from(self.model)

        if filters:
            for f in filters:
                query = query.where(f)
                count_query = count_query.where(f)

        # Sorting
        if sort_by and hasattr(self.model, sort_by):
            col = getattr(self.model, sort_by)
            query = query.order_by(desc(col) if sort_order == "desc" else asc(col))
        elif hasattr(self.model, "created_at"):
            query = query.order_by(desc(self.model.created_at))

        # Count
        total_result = await self.session.execute(count_query)
        total = total_result.scalar() or 0

        # Paginate
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)
        result = await self.session.execute(query)
        items = result.scalars().all()

        return {
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": math.ceil(total / per_page) if per_page else 1,
        }

    async def count(self, filters: Optional[List[Any]] = None) -> int:
        query = select(func.count()).select_from(self.model)
        if filters:
            for f in filters:
                query = query.where(f)
        result = await self.session.execute(query)
        return result.scalar() or 0

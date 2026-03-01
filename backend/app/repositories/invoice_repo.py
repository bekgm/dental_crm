"""Invoice repository."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.invoice import Invoice
from app.repositories.base_repo import BaseRepository


class InvoiceRepository(BaseRepository[Invoice]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Invoice, session)

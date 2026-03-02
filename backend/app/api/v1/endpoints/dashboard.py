"""Dashboard analytics endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.deps import DBSession, require_admin
from app.models.user import User
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import DashboardService

router = APIRouter()


@router.get("", response_model=DashboardResponse)
async def get_dashboard(
    session: DBSession,
    _admin: User = Depends(require_admin),
):
    svc = DashboardService(session)
    return await svc.get_dashboard()

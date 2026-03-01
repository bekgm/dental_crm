"""Dashboard analytics schemas."""

from __future__ import annotations

from typing import List

from pydantic import BaseModel


class AppointmentStats(BaseModel):
    scheduled: int
    confirmed: int
    completed: int
    cancelled: int
    no_show: int


class MonthlyRevenue(BaseModel):
    month: str
    revenue: float


class DashboardResponse(BaseModel):
    total_patients: int
    total_doctors: int
    total_appointments: int
    total_revenue: float
    monthly_revenue: List[MonthlyRevenue]
    appointment_stats: AppointmentStats
    upcoming_appointments: int
    pending_invoices: int

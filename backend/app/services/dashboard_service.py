"""Dashboard analytics service."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.invoice import Invoice
from app.models.patient import Patient
from app.schemas.dashboard import (
    AppointmentStats,
    DashboardResponse,
    MonthlyRevenue,
)


class DashboardService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_dashboard(self) -> DashboardResponse:
        now = datetime.now(timezone.utc)
        current_year = now.year

        # Total counts
        patients_q = await self.session.execute(
            select(func.count()).select_from(Patient)
        )
        total_patients = patients_q.scalar() or 0

        doctors_q = await self.session.execute(
            select(func.count()).select_from(Doctor)
        )
        total_doctors = doctors_q.scalar() or 0

        appts_q = await self.session.execute(
            select(func.count()).select_from(Appointment)
        )
        total_appointments = appts_q.scalar() or 0

        # Revenue
        revenue_q = await self.session.execute(
            select(func.coalesce(func.sum(Invoice.total), 0.0)).where(
                Invoice.status == "paid"
            )
        )
        total_revenue = float(revenue_q.scalar() or 0)

        # Monthly revenue for current year
        monthly_q = await self.session.execute(
            select(
                extract("month", Invoice.paid_at).label("month"),
                func.coalesce(func.sum(Invoice.total), 0.0).label("revenue"),
            )
            .where(
                Invoice.status == "paid",
                extract("year", Invoice.paid_at) == current_year,
            )
            .group_by(extract("month", Invoice.paid_at))
            .order_by(extract("month", Invoice.paid_at))
        )
        monthly_rows = monthly_q.all()
        month_names = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ]
        monthly_map = {int(r.month): float(r.revenue) for r in monthly_rows}
        monthly_revenue = [
            MonthlyRevenue(month=month_names[i], revenue=monthly_map.get(i + 1, 0.0))
            for i in range(12)
        ]

        # Appointment stats
        stats_q = await self.session.execute(
            select(
                Appointment.status,
                func.count().label("cnt"),
            ).group_by(Appointment.status)
        )
        stats_map = {r.status: r.cnt for r in stats_q.all()}
        appointment_stats = AppointmentStats(
            scheduled=stats_map.get("scheduled", 0),
            confirmed=stats_map.get("confirmed", 0),
            completed=stats_map.get("completed", 0),
            cancelled=stats_map.get("cancelled", 0),
            no_show=stats_map.get("no_show", 0),
        )

        # Upcoming appointments
        upcoming_q = await self.session.execute(
            select(func.count())
            .select_from(Appointment)
            .where(
                Appointment.scheduled_at > now,
                Appointment.status.in_(["scheduled", "confirmed"]),
            )
        )
        upcoming_appointments = upcoming_q.scalar() or 0

        # Pending invoices
        pending_q = await self.session.execute(
            select(func.count())
            .select_from(Invoice)
            .where(Invoice.status == "pending")
        )
        pending_invoices = pending_q.scalar() or 0

        return DashboardResponse(
            total_patients=total_patients,
            total_doctors=total_doctors,
            total_appointments=total_appointments,
            total_revenue=total_revenue,
            monthly_revenue=monthly_revenue,
            appointment_stats=appointment_stats,
            upcoming_appointments=upcoming_appointments,
            pending_invoices=pending_invoices,
        )

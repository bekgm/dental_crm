"""Appointment model."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class Appointment(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "appointments"

    patient_id: Mapped[str] = mapped_column(
        ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True,
    )
    doctor_id: Mapped[str] = mapped_column(
        ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False, index=True,
    )
    service_id: Mapped[str | None] = mapped_column(
        ForeignKey("services.id", ondelete="SET NULL"), nullable=True,
    )
    scheduled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True,
    )
    duration_minutes: Mapped[int] = mapped_column(default=30, nullable=False)
    status: Mapped[str] = mapped_column(
        String(30), default="scheduled", nullable=False, index=True,
    )  # scheduled | confirmed | in_progress | completed | cancelled | no_show
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    cancellation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    patient: Mapped["Patient"] = relationship("Patient", back_populates="appointments", lazy="selectin")  # type: ignore[name-defined]
    doctor: Mapped["Doctor"] = relationship("Doctor", back_populates="appointments", lazy="selectin")  # type: ignore[name-defined]
    service: Mapped["Service | None"] = relationship("Service", lazy="selectin")  # type: ignore[name-defined]
    medical_records: Mapped[list["MedicalRecord"]] = relationship(  # type: ignore[name-defined]
        "MedicalRecord", back_populates="appointment", lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Appointment {self.id} status={self.status}>"

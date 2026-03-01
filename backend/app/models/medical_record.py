"""MedicalRecord model."""

from __future__ import annotations

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class MedicalRecord(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "medical_records"

    patient_id: Mapped[str] = mapped_column(
        ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True,
    )
    doctor_id: Mapped[str] = mapped_column(
        ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False, index=True,
    )
    appointment_id: Mapped[str | None] = mapped_column(
        ForeignKey("appointments.id", ondelete="SET NULL"), nullable=True,
    )
    diagnosis: Mapped[str] = mapped_column(Text, nullable=False)
    treatment: Mapped[str] = mapped_column(Text, nullable=False)
    prescription: Mapped[str | None] = mapped_column(Text, nullable=True)
    tooth_number: Mapped[str | None] = mapped_column(String(10), nullable=True)
    xray_file: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    patient: Mapped["Patient"] = relationship("Patient", back_populates="medical_records", lazy="selectin")  # type: ignore[name-defined]
    doctor: Mapped["Doctor"] = relationship("Doctor", back_populates="medical_records", lazy="selectin")  # type: ignore[name-defined]
    appointment: Mapped["Appointment | None"] = relationship("Appointment", back_populates="medical_records", lazy="selectin")  # type: ignore[name-defined]

    def __repr__(self) -> str:
        return f"<MedicalRecord {self.id}>"

"""Patient model."""

from __future__ import annotations

from datetime import date

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class Patient(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "patients"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False,
    )
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(10), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    insurance_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    emergency_contact: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="patient_profile", lazy="selectin")  # type: ignore[name-defined]
    appointments: Mapped[list["Appointment"]] = relationship(  # type: ignore[name-defined]
        "Appointment", back_populates="patient", lazy="selectin",
    )
    medical_records: Mapped[list["MedicalRecord"]] = relationship(  # type: ignore[name-defined]
        "MedicalRecord", back_populates="patient", lazy="selectin",
    )
    invoices: Mapped[list["Invoice"]] = relationship(  # type: ignore[name-defined]
        "Invoice", back_populates="patient", lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Patient user_id={self.user_id}>"

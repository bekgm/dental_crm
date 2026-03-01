"""Doctor model."""

from __future__ import annotations

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class Doctor(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "doctors"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False,
    )
    specialization: Mapped[str] = mapped_column(String(255), nullable=False)
    license_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    years_of_experience: Mapped[int | None] = mapped_column(nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="doctor_profile", lazy="selectin")  # type: ignore[name-defined]
    appointments: Mapped[list["Appointment"]] = relationship(  # type: ignore[name-defined]
        "Appointment", back_populates="doctor", lazy="selectin",
    )
    medical_records: Mapped[list["MedicalRecord"]] = relationship(  # type: ignore[name-defined]
        "MedicalRecord", back_populates="doctor", lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Doctor user_id={self.user_id} spec={self.specialization}>"

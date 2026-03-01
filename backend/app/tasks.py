"""Background tasks — email reminder simulation."""

from __future__ import annotations

import logging
from datetime import datetime

logger = logging.getLogger("dentalcrm.tasks")


async def send_appointment_reminder(
    patient_email: str,
    patient_name: str,
    doctor_name: str,
    scheduled_at: datetime,
) -> None:
    """Simulate sending an appointment reminder email.

    In production, integrate with SendGrid / SES / SMTP.
    """
    logger.info(
        "📧 REMINDER → %s (%s): Your appointment with Dr. %s is on %s",
        patient_name,
        patient_email,
        doctor_name,
        scheduled_at.strftime("%B %d, %Y at %I:%M %p"),
    )


async def send_invoice_notification(
    patient_email: str,
    patient_name: str,
    amount: float,
    due_date: datetime | None,
) -> None:
    """Simulate sending an invoice notification."""
    logger.info(
        "📧 INVOICE → %s (%s): New invoice for $%.2f due %s",
        patient_name,
        patient_email,
        amount,
        due_date.strftime("%B %d, %Y") if due_date else "upon receipt",
    )

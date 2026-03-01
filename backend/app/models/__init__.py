"""Models package — import all models so Alembic can discover them."""

from app.models.user import User  # noqa: F401
from app.models.patient import Patient  # noqa: F401
from app.models.doctor import Doctor  # noqa: F401
from app.models.appointment import Appointment  # noqa: F401
from app.models.medical_record import MedicalRecord  # noqa: F401
from app.models.invoice import Invoice  # noqa: F401
from app.models.service import Service  # noqa: F401

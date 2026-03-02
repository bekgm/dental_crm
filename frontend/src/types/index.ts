
export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'patient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ── User ────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

// ── Patient ─────────────────────────────────────────────────────
export interface Patient {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  insurance_number?: string;
  emergency_contact?: string;
  notes?: string;
  created_at: string;
}

export interface PatientCreate {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  insurance_number?: string;
  emergency_contact?: string;
  notes?: string;
}

// ── Doctor ──────────────────────────────────────────────────────
export interface Doctor {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  specialization: string;
  license_number: string;
  bio?: string;
  years_of_experience?: number;
  created_at: string;
}

export interface DoctorCreate {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  specialization: string;
  license_number: string;
  bio?: string;
  years_of_experience?: number;
}

// ── Appointment ─────────────────────────────────────────────────
export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  service_id?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  notes?: string;
  cancellation_reason?: string;
  patient_name?: string;
  doctor_name?: string;
  service_name?: string;
  created_at: string;
}

export interface AppointmentCreate {
  patient_id: string;
  doctor_id: string;
  service_id?: string;
  scheduled_at: string;
  duration_minutes: number;
  notes?: string;
}

// ── Medical Record ──────────────────────────────────────────────
export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  diagnosis: string;
  treatment: string;
  prescription?: string;
  tooth_number?: string;
  xray_file?: string;
  notes?: string;
  patient_name?: string;
  doctor_name?: string;
  created_at: string;
}

export interface MedicalRecordCreate {
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  diagnosis: string;
  treatment: string;
  prescription?: string;
  tooth_number?: string;
  notes?: string;
}

// ── Invoice ─────────────────────────────────────────────────────
export type InvoiceStatus = 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  patient_id: string;
  appointment_id?: string;
  amount: number;
  tax: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  payment_method?: string;
  description?: string;
  due_date?: string;
  paid_at?: string;
  patient_name?: string;
  created_at: string;
}

export interface InvoiceCreate {
  patient_id: string;
  appointment_id?: string;
  amount: number;
  tax?: number;
  discount?: number;
  description?: string;
  due_date?: string;
  payment_method?: string;
}

// ── Service ─────────────────────────────────────────────────────
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  category?: string;
  is_active: boolean;
  created_at: string;
}

export interface ServiceCreate {
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  category: string;
  is_active: boolean;
}

// ── Dashboard ───────────────────────────────────────────────────
export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface AppointmentStats {
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  no_show: number;
}

export interface DashboardData {
  total_patients: number;
  total_doctors: number;
  total_appointments: number;
  total_revenue: number;
  monthly_revenue: MonthlyRevenue[];
  appointment_stats: AppointmentStats;
  upcoming_appointments: number;
  pending_invoices: number;
}

// ── Pagination ──────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

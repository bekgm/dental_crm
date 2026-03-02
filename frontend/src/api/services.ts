/** API service functions. */

import api from './client';
import type {
  Appointment,
  AppointmentCreate,
  DashboardData,
  Doctor,
  DoctorCreate,
  Invoice,
  InvoiceCreate,
  LoginRequest,
  MedicalRecord,
  MedicalRecordCreate,
  PaginatedResponse,
  Patient,
  PatientCreate,
  RegisterRequest,
  Service,
  ServiceCreate,
  TokenResponse,
  User,
} from '@/types';

// ── Auth ────────────────────────────────────────────────────────
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<TokenResponse>('/auth/login', data),
  register: (data: RegisterRequest) =>
    api.post<TokenResponse>('/auth/register', data),
  refresh: (refresh_token: string) =>
    api.post<TokenResponse>('/auth/refresh', { refresh_token }),
  me: () => api.get<User>('/auth/me'),
};

// ── Users ───────────────────────────────────────────────────────
export const usersApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<User>>('/users', { params }),
  get: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: Partial<User> & { password: string }) =>
    api.post<User>('/users', data),
  update: (id: string, data: Partial<User>) =>
    api.patch<User>(`/users/${id}`, data),
  changePassword: (id: string, password: string) =>
    api.patch<User>(`/users/${id}`, { password }),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// ── Patients ────────────────────────────────────────────────────
export const patientsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Patient>>('/patients', { params }),
  get: (id: string) => api.get<Patient>(`/patients/${id}`),
  create: (data: PatientCreate) =>
    api.post<Patient>('/patients', data),
  update: (id: string, data: Partial<PatientCreate>) =>
    api.patch<Patient>(`/patients/${id}`, data),
  delete: (id: string) => api.delete(`/patients/${id}`),
};

// ── Doctors ─────────────────────────────────────────────────────
export const doctorsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Doctor>>('/doctors', { params }),
  get: (id: string) => api.get<Doctor>(`/doctors/${id}`),
  create: (data: DoctorCreate) =>
    api.post<Doctor>('/doctors', data),
  update: (id: string, data: Partial<DoctorCreate>) =>
    api.patch<Doctor>(`/doctors/${id}`, data),
  delete: (id: string) => api.delete(`/doctors/${id}`),
};

// ── Appointments ────────────────────────────────────────────────
export const appointmentsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Appointment>>('/appointments', { params }),
  get: (id: string) => api.get<Appointment>(`/appointments/${id}`),
  create: (data: AppointmentCreate) =>
    api.post<Appointment>('/appointments', data),
  update: (id: string, data: Partial<Appointment>) =>
    api.patch<Appointment>(`/appointments/${id}`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

// ── Medical Records ─────────────────────────────────────────────
export const medicalRecordsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<MedicalRecord>>('/medical-records', { params }),
  get: (id: string) => api.get<MedicalRecord>(`/medical-records/${id}`),
  create: (data: MedicalRecordCreate) =>
    api.post<MedicalRecord>('/medical-records', data),
  update: (id: string, data: Partial<MedicalRecord>) =>
    api.patch<MedicalRecord>(`/medical-records/${id}`, data),
  delete: (id: string) => api.delete(`/medical-records/${id}`),
};

// ── Invoices ────────────────────────────────────────────────────
export const invoicesApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Invoice>>('/invoices', { params }),
  get: (id: string) => api.get<Invoice>(`/invoices/${id}`),
  create: (data: InvoiceCreate) =>
    api.post<Invoice>('/invoices', data),
  update: (id: string, data: Partial<Invoice>) =>
    api.patch<Invoice>(`/invoices/${id}`, data),
  delete: (id: string) => api.delete(`/invoices/${id}`),
};

// ── Services ────────────────────────────────────────────────────
export const servicesApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Service>>('/services', { params }),
  get: (id: string) => api.get<Service>(`/services/${id}`),
  create: (data: ServiceCreate) =>
    api.post<Service>('/services', data),
  update: (id: string, data: Partial<Service>) =>
    api.patch<Service>(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
};

// ── Dashboard ───────────────────────────────────────────────────
export const dashboardApi = {
  get: () => api.get<DashboardData>('/dashboard'),
};

// ── Upload ──────────────────────────────────────────────────────
export const uploadApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ filename: string; url: string }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

/** Appointments page. */

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Loading from '@/components/Loading';
import ConfirmDialog from '@/components/ConfirmDialog';
import { appointmentsApi, patientsApi, doctorsApi } from '@/api/services';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuth } from '@/hooks';
import type { Appointment, AppointmentCreate, AppointmentStatus, Doctor, Patient } from '@/types';

const STATUS_COLORS: Record<AppointmentStatus, 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'> = {
  scheduled: 'info',
  confirmed: 'primary',
  in_progress: 'secondary',
  completed: 'success',
  cancelled: 'error',
  no_show: 'warning',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<AppointmentCreate>({
    patient_id: '',
    doctor_id: '',
    scheduled_at: '',
    duration_minutes: 30,
    notes: '',
  });
  const addNotification = useNotificationStore((s) => s.addNotification);
  const { isStaff, isPatient } = useAuth();

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentsApi.list({
        page: page + 1,
        per_page: perPage,
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      setAppointments(res.data.items);
      setTotal(res.data.total);
    } catch {
      addNotification('Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, statusFilter, addNotification]);

  useEffect(() => {
    fetchAppointments();
    // Load patients and doctors for create form
    patientsApi.list({ per_page: 100 }).then((r) => setPatients(r.data.items)).catch(() => {});
    doctorsApi.list({ per_page: 100 }).then((r) => setDoctors(r.data.items)).catch(() => {});
  }, [fetchAppointments]);

  const handleCreate = async () => {
    try {
      await appointmentsApi.create(form);
      addNotification('Appointment created', 'success');
      setDialogOpen(false);
      fetchAppointments();
    } catch {
      addNotification('Failed to create appointment', 'error');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updateData: Partial<Appointment> = { status: status as AppointmentStatus };
      if (status === 'cancelled') {
        updateData.cancellation_reason = 'Cancelled by staff';
      }
      await appointmentsApi.update(id, updateData);
      addNotification('Status updated', 'success');
      fetchAppointments();
    } catch {
      addNotification('Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await appointmentsApi.delete(deleteId);
      addNotification('Appointment deleted', 'success');
      setDeleteId(null);
      fetchAppointments();
    } catch {
      addNotification('Failed to delete appointment', 'error');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Appointments</Typography>
        {(isStaff || isPatient) && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            New Appointment
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Box mb={2} display="flex" gap={2}>
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ width: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="scheduled">Scheduled</MenuItem>
          <MenuItem value="confirmed">Confirmed</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
          <MenuItem value="no_show">No Show</MenuItem>
        </TextField>
      </Box>

      {loading ? (
        <Loading />
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  {isStaff && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((appt) => (
                  <TableRow key={appt.id} hover>
                    <TableCell>
                      {new Date(appt.scheduled_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{appt.patient_name ?? '-'}</TableCell>
                    <TableCell>{appt.doctor_name ?? '-'}</TableCell>
                    <TableCell>{appt.service_name ?? '-'}</TableCell>
                    <TableCell>{appt.duration_minutes} min</TableCell>
                    <TableCell>
                      {isStaff ? (
                        <TextField
                          select
                          size="small"
                          value={appt.status}
                          onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                          sx={{ minWidth: 130 }}
                        >
                          <MenuItem value="scheduled">Scheduled</MenuItem>
                          <MenuItem value="confirmed">Confirmed</MenuItem>
                          <MenuItem value="in_progress">In Progress</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                          <MenuItem value="no_show">No Show</MenuItem>
                        </TextField>
                      ) : (
                        <Chip
                          label={appt.status.replace('_', ' ')}
                          color={STATUS_COLORS[appt.status]}
                          size="small"
                        />
                      )}
                    </TableCell>
                    {isStaff && (
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => setDeleteId(appt.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {appointments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No appointments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={perPage}
            onRowsPerPageChange={(e) => {
              setPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Appointment</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              select
              label="Patient"
              required
              value={form.patient_id}
              onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
            >
              {patients.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Doctor"
              required
              value={form.doctor_id}
              onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
            >
              {doctors.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.full_name}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Date & Time"
              type="datetime-local"
              required
              InputLabelProps={{ shrink: true }}
              value={form.scheduled_at}
              onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value, 10) || 30 })}
            />
            <TextField
              label="Notes"
              multiline
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}

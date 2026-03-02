/** Patients list page. */

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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import Loading from '@/components/Loading';
import ConfirmDialog from '@/components/ConfirmDialog';
import { patientsApi } from '@/api/services';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuth } from '@/hooks';
import type { Patient, PatientCreate } from '@/types';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<PatientCreate>({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    insurance_number: '',
    emergency_contact: '',
    notes: '',
  });
  const addNotification = useNotificationStore((s) => s.addNotification);
  const { isStaff } = useAuth();

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await patientsApi.list({
        page: page + 1,
        per_page: perPage,
        ...(search ? { search } : {}),
      });
      setPatients(res.data.items);
      setTotal(res.data.total);
    } catch {
      addNotification('Failed to load patients', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, addNotification]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleCreate = async () => {
    try {
      await patientsApi.create(form);
      addNotification('Patient created', 'success');
      setDialogOpen(false);
      setForm({ email: '', password: '', full_name: '', phone: '', date_of_birth: '', gender: '', address: '', insurance_number: '', emergency_contact: '', notes: '' });
      fetchPatients();
    } catch {
      addNotification('Failed to create patient', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await patientsApi.delete(deleteId);
      addNotification('Patient deleted', 'success');
      setDeleteId(null);
      fetchPatients();
    } catch {
      addNotification('Failed to delete patient', 'error');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Patients</Typography>
        {isStaff && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Add Patient
          </Button>
        )}
      </Box>

      {/* Search */}
      <Box mb={2}>
        <TextField
          placeholder="Search patients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
          sx={{ width: 300 }}
        />
      </Box>

      {loading ? (
        <Loading />
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Insurance</TableCell>
                  {isStaff && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id} hover>
                    <TableCell>{patient.full_name}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phone ?? '-'}</TableCell>
                    <TableCell>
                      {patient.gender ? (
                        <Chip label={patient.gender} size="small" />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{patient.insurance_number ?? '-'}</TableCell>
                    {isStaff && (
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => setDeleteId(patient.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {patients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No patients found
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
        <DialogTitle>Add New Patient</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField label="Full Name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            <TextField label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <TextField label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
            <TextField select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <MenuItem value="">-</MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <TextField label="Address" multiline rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <TextField label="Insurance Number" value={form.insurance_number} onChange={(e) => setForm({ ...form, insurance_number: e.target.value })} />
            <TextField label="Emergency Contact" value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Patient"
        message="Are you sure you want to delete this patient? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}

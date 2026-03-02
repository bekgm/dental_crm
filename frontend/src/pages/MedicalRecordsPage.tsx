/** Medical Records page. */

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Description as DescIcon,
} from '@mui/icons-material';
import Loading from '@/components/Loading';
import ConfirmDialog from '@/components/ConfirmDialog';
import { medicalRecordsApi, patientsApi, doctorsApi } from '@/api/services';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuth } from '@/hooks';
import type { MedicalRecord, MedicalRecordCreate, Patient, Doctor } from '@/types';

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [perPage] = useState(12);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<MedicalRecordCreate>({
    patient_id: '',
    doctor_id: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    tooth_number: '',
    notes: '',
  });
  const addNotification = useNotificationStore((s) => s.addNotification);
  const { isDoctor, isAdmin } = useAuth();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await medicalRecordsApi.list({
        page: page + 1,
        per_page: perPage,
        ...(search ? { search } : {}),
      });
      setRecords(res.data.items);
      setTotal(res.data.total);
    } catch {
      addNotification('Failed to load medical records', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, addNotification]);

  useEffect(() => {
    fetchRecords();
    patientsApi.list({ per_page: 100 }).then((r) => setPatients(r.data.items)).catch(() => {});
    doctorsApi.list({ per_page: 100 }).then((r) => setDoctors(r.data.items)).catch(() => {});
  }, [fetchRecords]);

  const handleCreate = async () => {
    try {
      await medicalRecordsApi.create(form);
      addNotification('Record created', 'success');
      setDialogOpen(false);
      setForm({ patient_id: '', doctor_id: '', diagnosis: '', treatment: '', prescription: '', tooth_number: '', notes: '' });
      fetchRecords();
    } catch {
      addNotification('Failed to create record', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await medicalRecordsApi.delete(deleteId);
      addNotification('Record deleted', 'success');
      setDeleteId(null);
      fetchRecords();
    } catch {
      addNotification('Failed to delete record', 'error');
    }
  };

  const hasMore = (page + 1) * perPage < total;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Medical Records</Typography>
        {(isDoctor || isAdmin) && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            New Record
          </Button>
        )}
      </Box>

      <Box mb={2}>
        <TextField
          label="Search records..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ width: 320 }}
        />
      </Box>

      {loading ? (
        <Loading />
      ) : (
        <>
          <Grid container spacing={2}>
            {records.map((rec) => (
              <Grid item xs={12} md={6} lg={4} key={rec.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box display="flex" gap={1} alignItems="center" mb={1}>
                        <DescIcon color="primary" />
                        <Typography variant="subtitle1" fontWeight={600}>
                          {rec.patient_name ?? 'Patient'}
                        </Typography>
                      </Box>
                      {(isDoctor || isAdmin) && (
                        <IconButton size="small" color="error" onClick={() => setDeleteId(rec.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Doctor: {rec.doctor_name ?? '-'}
                    </Typography>
                    {rec.tooth_number && (
                      <Chip label={`Tooth #${rec.tooth_number}`} size="small" sx={{ mb: 1 }} />
                    )}
                    <Typography variant="body2" fontWeight={600} mt={1}>
                      Diagnosis
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {rec.diagnosis || '-'}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      Treatment
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {rec.treatment || '-'}
                    </Typography>
                    {rec.prescription && (
                      <>
                        <Typography variant="body2" fontWeight={600}>
                          Prescription
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {rec.prescription}
                        </Typography>
                      </>
                    )}
                    <Typography variant="caption" color="text.disabled" display="block" mt={1}>
                      {new Date(rec.created_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {records.length === 0 && (
            <Typography textAlign="center" color="text.secondary" mt={4}>
              No medical records found
            </Typography>
          )}
          {(hasMore || page > 0) && (
            <Box display="flex" justifyContent="center" gap={2} mt={3}>
              <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Typography alignSelf="center">Page {page + 1}</Typography>
              <Button disabled={!hasMore} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Medical Record</DialogTitle>
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
              label="Diagnosis"
              required
              multiline
              rows={2}
              value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
            />
            <TextField
              label="Treatment"
              multiline
              rows={2}
              value={form.treatment}
              onChange={(e) => setForm({ ...form, treatment: e.target.value })}
            />
            <TextField
              label="Prescription"
              multiline
              rows={2}
              value={form.prescription}
              onChange={(e) => setForm({ ...form, prescription: e.target.value })}
            />
            <TextField
              label="Tooth Number"
              value={form.tooth_number}
              onChange={(e) => setForm({ ...form, tooth_number: e.target.value })}
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
        title="Delete Medical Record"
        message="Are you sure you want to delete this medical record?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}

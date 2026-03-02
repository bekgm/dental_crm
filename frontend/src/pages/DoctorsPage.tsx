/** Doctors list page. */

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
  TextField,
  Typography,
  Avatar,
} from '@mui/material';
import { Add as AddIcon, LocalHospital } from '@mui/icons-material';
import Loading from '@/components/Loading';
import { doctorsApi } from '@/api/services';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuth } from '@/hooks';
import type { Doctor, DoctorCreate } from '@/types';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<DoctorCreate>({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    specialization: '',
    license_number: '',
    bio: '',
    years_of_experience: 0,
  });
  const addNotification = useNotificationStore((s) => s.addNotification);
  const { isAdmin } = useAuth();

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await doctorsApi.list({ per_page: 50 });
      setDoctors(res.data.items);
    } catch {
      addNotification('Failed to load doctors', 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleCreate = async () => {
    try {
      await doctorsApi.create(form);
      addNotification('Doctor created', 'success');
      setDialogOpen(false);
      fetchDoctors();
    } catch {
      addNotification('Failed to create doctor', 'error');
    }
  };

  if (loading) return <Loading />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Doctors</Typography>
        {isAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Add Doctor
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {doctors.map((doctor) => (
          <Grid item xs={12} sm={6} md={4} key={doctor.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    <LocalHospital />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{doctor.full_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {doctor.email}
                    </Typography>
                  </Box>
                </Box>
                <Chip label={doctor.specialization} color="primary" size="small" sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary" mt={1}>
                  License: {doctor.license_number}
                </Typography>
                {doctor.years_of_experience != null && (
                  <Typography variant="body2" color="text.secondary">
                    {doctor.years_of_experience} years experience
                  </Typography>
                )}
                {doctor.bio && (
                  <Typography variant="body2" mt={1} sx={{ fontStyle: 'italic' }}>
                    {doctor.bio}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
        {doctors.length === 0 && (
          <Grid item xs={12}>
            <Typography color="text.secondary" textAlign="center" py={4}>
              No doctors found
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Doctor</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField label="Full Name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            <TextField label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <TextField label="Specialization" required value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
            <TextField label="License Number" required value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })} />
            <TextField label="Years of Experience" type="number" value={form.years_of_experience} onChange={(e) => setForm({ ...form, years_of_experience: parseInt(e.target.value, 10) || 0 })} />
            <TextField label="Bio" multiline rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

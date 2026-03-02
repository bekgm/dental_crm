/** Services catalog management page. */

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
  Switch,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import Loading from '@/components/Loading';
import ConfirmDialog from '@/components/ConfirmDialog';
import { servicesApi } from '@/api/services';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuth } from '@/hooks';
import type { Service, ServiceCreate } from '@/types';

const CATEGORIES = [
  'General',
  'Cosmetic',
  'Orthodontics',
  'Surgery',
  'Endodontics',
  'Periodontics',
  'Pediatric',
  'Prosthodontics',
  'Preventive',
  'Diagnostic',
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceCreate>({
    name: '',
    description: '',
    price: 0,
    duration_minutes: 30,
    category: 'General',
    is_active: true,
  });
  const addNotification = useNotificationStore((s) => s.addNotification);
  const { isAdmin } = useAuth();

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await servicesApi.list({ per_page: 100 });
      setServices(res.data.items);
    } catch {
      addNotification('Failed to load services', 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', description: '', price: 0, duration_minutes: 30, category: 'General', is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (svc: Service) => {
    setEditId(svc.id);
    setForm({
      name: svc.name,
      description: svc.description ?? '',
      price: svc.price,
      duration_minutes: svc.duration_minutes,
      category: svc.category ?? 'General',
      is_active: svc.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await servicesApi.update(editId, form);
        addNotification('Service updated', 'success');
      } else {
        await servicesApi.create(form);
        addNotification('Service created', 'success');
      }
      setDialogOpen(false);
      fetchServices();
    } catch {
      addNotification('Failed to save service', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await servicesApi.delete(deleteId);
      addNotification('Service deleted', 'success');
      setDeleteId(null);
      fetchServices();
    } catch {
      addNotification('Failed to delete service', 'error');
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Services</Typography>
        {isAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            New Service
          </Button>
        )}
      </Box>

      {loading ? (
        <Loading />
      ) : (
        <Grid container spacing={2}>
          {services.map((svc) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={svc.id}>
              <Card sx={{ height: '100%', opacity: svc.is_active ? 1 : 0.6 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" gutterBottom>
                      {svc.name}
                    </Typography>
                    {isAdmin && (
                      <Box>
                        <IconButton size="small" onClick={() => openEdit(svc)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => setDeleteId(svc.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  <Chip label={svc.category} size="small" color="primary" variant="outlined" sx={{ mb: 1 }} />
                  {!svc.is_active && (
                    <Chip label="Inactive" size="small" color="warning" sx={{ ml: 1, mb: 1 }} />
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                    {svc.description || 'No description'}
                  </Typography>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6" color="primary">
                      {formatCurrency(svc.price)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" alignSelf="center">
                      {svc.duration_minutes} min
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {services.length === 0 && (
            <Grid item xs={12}>
              <Typography textAlign="center" color="text.secondary" mt={4}>
                No services found
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Service' : 'New Service'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Service Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              label="Description"
              multiline
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <TextField
              select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Price"
              type="number"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value, 10) || 30 })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Service"
        message="Are you sure you want to delete this service?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}

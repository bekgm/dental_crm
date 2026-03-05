/** Invoices page. */

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
  Payment as PaymentIcon,
} from '@mui/icons-material';
import Loading from '@/components/Loading';
import ConfirmDialog from '@/components/ConfirmDialog';
import { invoicesApi, patientsApi } from '@/api/services';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuth } from '@/hooks';
import type { Invoice, InvoiceCreate, InvoiceStatus, Patient } from '@/types';

const STATUS_COLORS: Record<InvoiceStatus, 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info'> = {
  draft: 'default',
  sent: 'info',
  pending: 'primary',
  paid: 'success',
  overdue: 'error',
  cancelled: 'warning',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<InvoiceCreate>({
    patient_id: '',
    amount: 0,
    tax: 0,
    discount: 0,
    description: '',
    due_date: '',
  });
  const addNotification = useNotificationStore((s) => s.addNotification);
  const { isAdmin, isStaff } = useAuth();

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await invoicesApi.list({
        page: page + 1,
        per_page: perPage,
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      setInvoices(res.data.items);
      setTotal(res.data.total);
    } catch {
      addNotification('Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, statusFilter, addNotification]);

  useEffect(() => {
    fetchInvoices();
    patientsApi.list({ per_page: 100 }).then((r) => setPatients(r.data.items)).catch(() => {});
  }, [fetchInvoices]);

  const handleCreate = async () => {
    try {
      await invoicesApi.create(form);
      addNotification('Invoice created', 'success');
      setDialogOpen(false);
      setForm({ patient_id: '', amount: 0, tax: 0, discount: 0, description: '', due_date: '' });
      fetchInvoices();
    } catch {
      addNotification('Failed to create invoice', 'error');
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await invoicesApi.update(id, { status: 'paid' as InvoiceStatus, payment_method: 'card' });
      addNotification('Invoice marked as paid', 'success');
      fetchInvoices();
    } catch {
      addNotification('Failed to update invoice', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await invoicesApi.delete(deleteId);
      addNotification('Invoice deleted', 'success');
      setDeleteId(null);
      fetchInvoices();
    } catch {
      addNotification('Failed to delete invoice', 'error');
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={{ xs: 2, sm: 3 }} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: '1.3rem', sm: '1.75rem' } }}>Invoices</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>Billing and payment tracking</Typography>
        </Box>
        {isStaff && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ borderRadius: 3, px: { xs: 2, sm: 3 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            New Invoice
          </Button>
        )}
      </Box>

      <Box mb={2} display="flex" gap={2}>
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ width: { xs: '100%', sm: 200 } }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="sent">Sent</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
          <MenuItem value="overdue">Overdue</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </TextField>
      </Box>

      {loading ? (
        <Loading />
      ) : (
        <Card>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due Date</TableCell>
                  {isStaff && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id} hover>
                    <TableCell>
                      {new Date(inv.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{inv.patient_name ?? '-'}</TableCell>
                    <TableCell>{inv.description || '-'}</TableCell>
                    <TableCell align="right">{formatCurrency(inv.amount)}</TableCell>
                    <TableCell align="right">{formatCurrency(inv.total)}</TableCell>
                    <TableCell>
                      <Chip
                        label={inv.status}
                        color={STATUS_COLORS[inv.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}
                    </TableCell>
                    {isStaff && (
                      <TableCell align="right">
                        {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                          <IconButton
                            size="small"
                            color="success"
                            title="Mark as paid"
                            onClick={() => handleMarkPaid(inv.id)}
                          >
                            <PaymentIcon />
                          </IconButton>
                        )}
                        {isAdmin && (
                          <IconButton size="small" color="error" onClick={() => setDeleteId(inv.id)}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {invoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No invoices found
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
        <DialogTitle>New Invoice</DialogTitle>
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
              label="Amount"
              type="number"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
            />
            <TextField
              label="Tax"
              type="number"
              value={form.tax}
              onChange={(e) => setForm({ ...form, tax: parseFloat(e.target.value) || 0 })}
            />
            <TextField
              label="Discount"
              type="number"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })}
            />
            <TextField
              label="Description"
              multiline
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <TextField
              label="Due Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
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
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}

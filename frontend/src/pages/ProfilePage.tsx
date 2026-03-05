/** User profile page. */

import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { usersApi } from '@/api/services';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name ?? '',
    phone: user?.phone ?? '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await usersApi.update(user.id, form);
      await fetchUser();
      addNotification('Profile updated', 'success');
      setEditing(false);
    } catch {
      addNotification('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      addNotification('Passwords do not match', 'error');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      addNotification('Password must be at least 8 characters', 'error');
      return;
    }
    setSaving(true);
    try {
      await usersApi.changePassword(user.id, passwordForm.new_password);
      addNotification('Password changed successfully', 'success');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch {
      addNotification('Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Box maxWidth={800} mx="auto" px={{ xs: 0, sm: 0 }}>
      <Typography variant="h4" fontWeight={800} mb={0.5} sx={{ fontSize: { xs: '1.3rem', sm: '1.75rem' } }}>
        My Profile
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={{ xs: 2, sm: 3 }}>
        Manage your account information
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={{ xs: 2, sm: 3 }} mb={3} flexDirection={{ xs: 'column', sm: 'row' }} textAlign={{ xs: 'center', sm: 'left' }}>
            <Avatar
              sx={{
                width: { xs: 64, sm: 80 },
                height: { xs: 64, sm: 80 },
                fontSize: { xs: 24, sm: 32 },
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6C63FF 0%, #00D9A6 100%)',
                boxShadow: '0 8px 24px rgba(108,99,255,0.3)',
              }}
            >
              {initials || <PersonIcon fontSize="large" />}
            </Avatar>
            <Box>
              <Typography variant="h5">{user.full_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Chip
                label={user.role}
                size="small"
                sx={{
                  mt: 0.5,
                  textTransform: 'capitalize',
                  fontWeight: 700,
                  bgcolor: 'rgba(108,99,255,0.1)',
                  color: '#6C63FF',
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {editing ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  fullWidth
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  fullWidth
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" gap={1}>
                  <Button variant="contained" onClick={handleSaveProfile} disabled={saving}>
                    Save
                  </Button>
                  <Button onClick={() => setEditing(false)}>Cancel</Button>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Full Name</Typography>
                  <Typography>{user.full_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography>{user.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography>{user.phone || 'Not set'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Role</Typography>
                  <Typography sx={{ textTransform: 'capitalize' }}>{user.role}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Member Since</Typography>
                  <Typography>{new Date(user.created_at).toLocaleDateString()}</Typography>
                </Grid>
              </Grid>
              <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Change Password
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Current Password"
                type="password"
                fullWidth
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, current_password: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="New Password"
                type="password"
                fullWidth
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, new_password: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Confirm New Password"
                type="password"
                fullWidth
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleChangePassword}
                disabled={saving || !passwordForm.new_password}
              >
                Change Password
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

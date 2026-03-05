/** Registration page — modern split-screen design. */

import { useState, type FormEvent } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Stack,
} from '@mui/material';
import { LocalHospital } from '@mui/icons-material';
import { useAuth } from '@/hooks';
import { useNotificationStore } from '@/store/notificationStore';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register({ email, password, full_name: fullName, phone: phone || undefined });
      addNotification('Account created successfully', 'success');
      navigate('/dashboard');
    } catch {
      // Error handled by store
    }
  };

  return (
    <Box display="flex" minHeight="100vh">
      {/* Left — Branding Panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          background: 'linear-gradient(135deg, #00D9A6 0%, #6C63FF 100%)',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -120,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -100,
            right: -120,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          },
        }}
      >
        <LocalHospital sx={{ fontSize: 72, color: 'white', mb: 3, zIndex: 1 }} />
        <Typography variant="h3" fontWeight={800} color="white" mb={1} zIndex={1}>
          Join DentalCRM
        </Typography>
        <Typography variant="h6" color="rgba(255,255,255,0.85)" fontWeight={400} textAlign="center" maxWidth={360} zIndex={1}>
          Book appointments, view records, and manage your dental health — all in one place.
        </Typography>
      </Box>

      {/* Right — Register Form */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 520px' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 2.5, sm: 6 },
          bgcolor: 'background.default',
        }}
      >
        <Box width="100%" maxWidth={380}>
          <Box display={{ xs: 'flex', md: 'none' }} flexDirection="column" alignItems="center" mb={4}>
            <LocalHospital sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          </Box>

          <Typography variant="h4" fontWeight={800} mb={0.5} sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
            Create account
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Register as a patient to get started
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Full Name"
                fullWidth
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <TextField
                label="Email address"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Phone (optional)"
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                inputProps={{ minLength: 8 }}
                helperText="At least 8 characters"
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isLoading}
                sx={{ py: 1.5, fontSize: '1rem', borderRadius: 3 }}
              >
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" textAlign="center" mt={4} color="text.secondary">
            Already have an account?{' '}
            <Typography
              component={RouterLink}
              to="/login"
              variant="body2"
              color="primary"
              sx={{ textDecoration: 'none', fontWeight: 700 }}
            >
              Sign in
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

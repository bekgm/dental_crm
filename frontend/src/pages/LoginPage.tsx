/** Login page — modern split-screen design. */

import { useState, type FormEvent } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LocalHospital,
} from '@mui/icons-material';
import { useAuth } from '@/hooks';
import { useNotificationStore } from '@/store/notificationStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      addNotification('Login successful', 'success');
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
          background: 'linear-gradient(135deg, #6C63FF 0%, #928DFF 50%, #00D9A6 100%)',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -150,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          },
        }}
      >
        <LocalHospital sx={{ fontSize: 72, color: 'white', mb: 3, zIndex: 1 }} />
        <Typography variant="h3" fontWeight={800} color="white" mb={1} zIndex={1}>
          DentalCRM
        </Typography>
        <Typography variant="h6" color="rgba(255,255,255,0.85)" fontWeight={400} textAlign="center" maxWidth={360} zIndex={1}>
          Modern dental clinic management. Streamline your practice with ease.
        </Typography>
      </Box>

      {/* Right — Login Form */}
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
            Welcome back
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Sign in to continue to your dashboard
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Email address"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isLoading}
                sx={{ py: 1.5, fontSize: '1rem', borderRadius: 3 }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" textAlign="center" mt={4} color="text.secondary">
            Don&apos;t have an account?{' '}
            <Typography
              component={RouterLink}
              to="/register"
              variant="body2"
              color="primary"
              sx={{ textDecoration: 'none', fontWeight: 700 }}
            >
              Create account
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

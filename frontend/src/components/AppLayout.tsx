/** Main application layout with sidebar navigation. */

import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocalHospital as DoctorIcon,
  CalendarMonth as CalendarIcon,
  Receipt as InvoiceIcon,
  MedicalServices as MedicalIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks';
import type { UserRole } from '@/types';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
    roles: ['admin'],
  },
  {
    label: 'Patients',
    path: '/patients',
    icon: <PeopleIcon />,
    roles: ['admin', 'doctor', 'receptionist'],
  },
  {
    label: 'Doctors',
    path: '/doctors',
    icon: <DoctorIcon />,
    roles: ['admin', 'receptionist', 'patient'],
  },
  {
    label: 'Appointments',
    path: '/appointments',
    icon: <CalendarIcon />,
    roles: ['admin', 'doctor', 'receptionist', 'patient'],
  },
  {
    label: 'Medical Records',
    path: '/medical-records',
    icon: <MedicalIcon />,
    roles: ['admin', 'doctor', 'patient'],
  },
  {
    label: 'Invoices',
    path: '/invoices',
    icon: <InvoiceIcon />,
    roles: ['admin', 'receptionist', 'patient'],
  },
  {
    label: 'Services',
    path: '/services',
    icon: <SettingsIcon />,
    roles: ['admin'],
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: <ProfileIcon />,
    roles: ['admin', 'doctor', 'receptionist', 'patient'],
  },
];

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();

  const filteredNav = navItems.filter((item) =>
    item.roles.some((role) => hasRole(role)),
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <DoctorIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h6" color="primary" fontWeight={700}>
          DentalCRM
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1, px: 1 }}>
        {filteredNav.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setDrawerOpen(false);
              }}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '& .MuiListItemIcon-root': { color: 'white' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {user?.role?.toUpperCase()}
        </Typography>
        <Typography variant="body2" fontWeight={600} noWrap>
          {user?.full_name}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" onClick={() => setDrawerOpen(!drawerOpen)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box flex={1} />
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              {user?.full_name?.charAt(0) ?? 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate('/profile');
              }}
            >
              <ProfileIcon sx={{ mr: 1 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          bgcolor: 'background.default',
          minHeight: '100vh',
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

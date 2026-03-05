/** Main application layout with modern sidebar navigation. */

import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Chip,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
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
  MoreHoriz as MoreIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks';
import type { UserRole } from '@/types';

const DRAWER_WIDTH = 270;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, roles: ['admin'] },
  { label: 'Patients', path: '/patients', icon: <PeopleIcon />, roles: ['admin', 'doctor', 'receptionist'] },
  { label: 'Doctors', path: '/doctors', icon: <DoctorIcon />, roles: ['admin', 'receptionist', 'patient'] },
  { label: 'Appointments', path: '/appointments', icon: <CalendarIcon />, roles: ['admin', 'doctor', 'receptionist', 'patient'] },
  { label: 'Medical Records', path: '/medical-records', icon: <MedicalIcon />, roles: ['admin', 'doctor', 'patient'] },
  { label: 'Invoices', path: '/invoices', icon: <InvoiceIcon />, roles: ['admin', 'receptionist', 'patient'] },
  { label: 'Services', path: '/services', icon: <SettingsIcon />, roles: ['admin'] },
  { label: 'Profile', path: '/profile', icon: <ProfileIcon />, roles: ['admin', 'doctor', 'receptionist', 'patient'] },
];

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();

  const filteredNav = navItems.filter((item) =>
    item.roles.some((role) => hasRole(role)),
  );

  // Bottom nav shows first 4 items + "More" on phones
  const bottomNavItems = filteredNav.slice(0, 4);
  const bottomNavHasMore = filteredNav.length > 4;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColor = (role?: string) => {
    switch (role) {
      case 'admin': return '#FF5C5C';
      case 'doctor': return '#6C63FF';
      case 'receptionist': return '#FFB547';
      default: return '#00D9A6';
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #6C63FF 0%, #00D9A6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <DoctorIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={800} color="text.primary" lineHeight={1.2}>
            DentalCRM
          </Typography>
          <Typography variant="caption" color="text.secondary" lineHeight={1}>
            Management Suite
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, mt: 1 }}>
        {filteredNav.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selected}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setDrawerOpen(false);
                }}
                sx={{
                  borderRadius: 3,
                  py: 1.2,
                  transition: 'all 0.2s ease',
                  ...(selected
                    ? {
                        background: 'linear-gradient(135deg, #6C63FF 0%, #928DFF 100%)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(108,99,255,0.35)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5B54E0 0%, #8278FF 100%)',
                        },
                        '& .MuiListItemIcon-root': { color: 'white' },
                      }
                    : {
                        color: 'text.secondary',
                        '&:hover': {
                          bgcolor: 'rgba(108,99,255,0.06)',
                          color: 'text.primary',
                          '& .MuiListItemIcon-root': { color: 'primary.main' },
                        },
                      }),
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: selected ? 'white' : 'text.disabled' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: selected ? 700 : 500, fontSize: '0.9rem' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User info footer */}
      <Box
        sx={{
          m: 1.5,
          p: 2,
          borderRadius: 3,
          bgcolor: 'rgba(108,99,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: roleColor(user?.role),
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          {user?.full_name?.charAt(0) ?? 'U'}
        </Avatar>
        <Box flex={1} overflow="hidden">
          <Typography variant="body2" fontWeight={700} noWrap>
            {user?.full_name}
          </Typography>
          <Chip
            label={user?.role?.toUpperCase()}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: `${roleColor(user?.role)}18`,
              color: roleColor(user?.role),
              mt: 0.3,
            }}
          />
        </Box>
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
          bgcolor: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 2 } }}>
          {isMobile && !isPhone && (
            <IconButton edge="start" onClick={() => setDrawerOpen(!drawerOpen)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          {isPhone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 'auto' }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #6C63FF 0%, #00D9A6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DoctorIcon sx={{ color: 'white', fontSize: 18 }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                DentalCRM
              </Typography>
            </Box>
          )}
          {!isPhone && (
            <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ flex: 1 }}>
              {filteredNav.find((n) => n.path === location.pathname)?.label ?? ''}
            </Typography>
          )}
          {isPhone && <Box flex={1} />}
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar
              sx={{
                bgcolor: roleColor(user?.role),
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {user?.full_name?.charAt(0) ?? 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            slotProps={{ paper: { sx: { mt: 1, borderRadius: 3, minWidth: 160 } } }}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate('/profile');
              }}
            >
              <ProfileIcon sx={{ mr: 1.5, color: 'text.secondary' }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <LogoutIcon sx={{ mr: 1.5 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer — hidden on phones, temporary on tablets, permanent on desktop */}
      {!isPhone && (
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? drawerOpen : true}
          onClose={() => setDrawerOpen(false)}
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
              bgcolor: 'background.paper',
              boxShadow: '4px 0 24px rgba(0,0,0,0.04)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          mt: { xs: 7, sm: 8 },
          mb: { xs: isPhone ? 8 : 0, sm: 0 },
          bgcolor: 'background.default',
          minHeight: '100vh',
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          overflow: 'hidden',
        }}
      >
        <Outlet />
      </Box>

      {/* Bottom Navigation — phones only */}
      {isPhone && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            pb: 'env(safe-area-inset-bottom)',
          }}
          elevation={8}
        >
          <BottomNavigation
            value={
              bottomNavItems.findIndex((n) => n.path === location.pathname) >= 0
                ? bottomNavItems.findIndex((n) => n.path === location.pathname)
                : bottomNavHasMore ? 4 : -1
            }
            onChange={(_, idx) => {
              const item = bottomNavItems[idx];
              if (item) {
                navigate(item.path);
              } else {
                setDrawerOpen(true);
              }
            }}
            showLabels
            sx={{
              height: 60,
              bgcolor: 'transparent',
              '& .MuiBottomNavigationAction-root': {
                minWidth: 0,
                py: 0.5,
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.65rem',
                mt: 0.3,
                '&.Mui-selected': {
                  fontSize: '0.65rem',
                  fontWeight: 700,
                },
              },
            }}
          >
            {bottomNavItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                icon={item.icon}
              />
            ))}
            {bottomNavHasMore && (
              <BottomNavigationAction label="More" icon={<MoreIcon />} />
            )}
          </BottomNavigation>
        </Paper>
      )}

      {/* "More" drawer for phone — shows remaining nav items */}
      {isPhone && (
        <Drawer
          anchor="bottom"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '60vh',
              pb: 'env(safe-area-inset-bottom)',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 4,
                borderRadius: 2,
                bgcolor: 'divider',
                mx: 'auto',
                mb: 2,
              }}
            />
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1} px={1}>
              MENU
            </Typography>
            <List>
              {filteredNav.map((item) => {
                const selected = location.pathname === item.path;
                return (
                  <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={selected}
                      onClick={() => {
                        navigate(item.path);
                        setDrawerOpen(false);
                      }}
                      sx={{
                        borderRadius: 3,
                        py: 1.2,
                        ...(selected
                          ? {
                              background: 'linear-gradient(135deg, #6C63FF 0%, #928DFF 100%)',
                              color: 'white',
                              '& .MuiListItemIcon-root': { color: 'white' },
                            }
                          : {}),
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 38, color: selected ? 'white' : 'text.disabled' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ fontWeight: selected ? 700 : 500 }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
            {/* User info */}
            <Box
              sx={{
                mt: 1,
                p: 2,
                borderRadius: 3,
                bgcolor: 'rgba(108,99,255,0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Avatar sx={{ width: 36, height: 36, bgcolor: roleColor(user?.role), fontWeight: 700, fontSize: '0.85rem' }}>
                {user?.full_name?.charAt(0) ?? 'U'}
              </Avatar>
              <Box flex={1} overflow="hidden">
                <Typography variant="body2" fontWeight={700} noWrap>
                  {user?.full_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.role?.toUpperCase()}
                </Typography>
              </Box>
              <IconButton size="small" onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Drawer>
      )}
    </Box>
  );
}

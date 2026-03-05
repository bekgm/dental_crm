/** MUI theme configuration — modern glassmorphism-inspired dental theme. */

import { createTheme } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';

const customShadows: Shadows = [
  'none',
  '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
  '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)',
  '0 10px 15px -3px rgba(0,0,0,0.06), 0 4px 6px -4px rgba(0,0,0,0.05)',
  '0 20px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.04)',
  ...Array(20).fill('0 25px 50px -12px rgba(0,0,0,0.12)'),
] as Shadows;

const theme = createTheme({
  palette: {
    primary: {
      main: '#6C63FF',
      light: '#928DFF',
      dark: '#4B44CC',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00D9A6',
      light: '#33E1B8',
      dark: '#00B389',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F0F2F8',
      paper: '#FFFFFF',
    },
    error: {
      main: '#FF5C5C',
      light: '#FF8A80',
    },
    warning: {
      main: '#FFB547',
      light: '#FFD180',
    },
    success: {
      main: '#00D9A6',
      light: '#69F0AE',
    },
    info: {
      main: '#6C63FF',
    },
    text: {
      primary: '#1A1D2E',
      secondary: '#6B7280',
    },
    divider: 'rgba(107, 114, 128, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, "Segoe UI", "Roboto", sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.75rem' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em', fontSize: '1.05rem' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, color: '#6B7280' },
    body2: { color: '#6B7280' },
    button: { fontWeight: 600, letterSpacing: '0.01em' },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: customShadows,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 3,
            backgroundColor: 'rgba(107,114,128,0.2)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          background: 'linear-gradient(135deg, #6C63FF 0%, #928DFF 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5B53EE 0%, #7D77F0 100%)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': { borderWidth: 1.5 },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid rgba(107, 114, 128, 0.08)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)',
          },
          '@media (max-width: 600px)': {
            borderRadius: 14,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#F8F9FC',
            '&:hover': { backgroundColor: '#F0F2F8' },
            '&.Mui-focused': { backgroundColor: '#FFFFFF' },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#6B7280',
            backgroundColor: '#F8F9FC',
            borderBottom: '2px solid rgba(107, 114, 128, 0.08)',
            padding: '14px 16px',
            whiteSpace: 'nowrap',
            '@media (max-width: 600px)': {
              padding: '10px 8px',
              fontSize: '0.65rem',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(107, 114, 128, 0.06)',
          padding: '14px 16px',
          '@media (max-width: 600px)': {
            padding: '10px 8px',
            fontSize: '0.8rem',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(108, 99, 255, 0.03) !important',
          },
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        fullWidth: true,
      },
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
          margin: 16,
          '@media (max-width: 600px)': {
            borderRadius: 16,
            margin: 8,
            maxHeight: 'calc(100% - 16px)',
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '1.15rem',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          marginBottom: 2,
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, #6C63FF 0%, #928DFF 100%)',
            color: '#FFFFFF',
            '&:hover': {
              background: 'linear-gradient(135deg, #5B53EE 0%, #7D77F0 100%)',
            },
            '& .MuiListItemIcon-root': { color: '#FFFFFF' },
            '& .MuiTypography-root': { fontWeight: 600 },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;

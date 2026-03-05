/** Protected route wrapper — redirects to login if not authenticated. */

import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Box, CircularProgress } from '@mui/material';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, fetchUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && !user && !isLoading) {
      fetchUser();
    }
  }, [isAuthenticated, user, isLoading, fetchUser]);

  if (isLoading || (isAuthenticated && !user)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

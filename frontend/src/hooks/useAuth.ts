/** Convenience hook that exposes auth store selectors. */

import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';

export function useAuth() {
  const { user, isAuthenticated, isLoading, error, login, logout, register, fetchUser, clearError } =
    useAuthStore();

  const hasRole = (...roles: UserRole[]): boolean =>
    !!user && roles.includes(user.role);

  const isAdmin = hasRole('admin');
  const isDoctor = hasRole('doctor');
  const isReceptionist = hasRole('receptionist');
  const isPatient = hasRole('patient');
  const isStaff = hasRole('admin', 'doctor', 'receptionist');

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    fetchUser,
    clearError,
    hasRole,
    isAdmin,
    isDoctor,
    isReceptionist,
    isPatient,
    isStaff,
  };
}

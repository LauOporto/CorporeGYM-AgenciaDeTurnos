import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children, requireAdmin = false }: { children: ReactNode, requireAdmin?: boolean }) {
  const { token, user } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.rol !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

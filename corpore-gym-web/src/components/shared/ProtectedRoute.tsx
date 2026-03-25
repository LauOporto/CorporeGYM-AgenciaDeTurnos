import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function ProtectedRoute({ children, requireAdmin = false }: { children: JSX.Element, requireAdmin?: boolean }) {
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

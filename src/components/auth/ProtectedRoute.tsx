import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <p className="protected-route__loading" role="status">
        Verificando sessão…
      </p>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

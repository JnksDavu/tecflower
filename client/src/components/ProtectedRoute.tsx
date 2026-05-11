import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FullPagePurpleLoader } from '@/components/AppLoaders';

export const ProtectedRoute = () => {
  const { isLoading, session } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPagePurpleLoader/>;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const PublicRoute = () => {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ed] text-sm font-medium text-[#5b437f]">
        Carregando sessão...
      </div>
    );
  }

  if (session) {
    return <Navigate to="/vendas" replace />;
  }

  return <Outlet />;
};

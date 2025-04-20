
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log("PrivateRoute - Auth state:", { 
    isAuthenticated, 
    userId: user?.id,
    currentPath: location.pathname 
  });

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("PrivateRoute - User not authenticated, redirecting to /auth");
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}


import { useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface PrivateRouteProps {
  children: ReactNode | (({ hasRole, hasPermission }: { 
    hasRole: (role: string) => boolean; 
    hasPermission: (permission: string) => boolean 
  }) => ReactNode);
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, isAuthenticated, hasRole, hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  // If children is a function, call it with roles and permissions
  if (typeof children === 'function') {
    return <>{children({ hasRole, hasPermission })}</>;
  }

  return <>{children}</>;
}

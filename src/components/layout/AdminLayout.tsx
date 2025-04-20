
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AdminLayoutProps {
  children?: ReactNode;
  requiredRoles?: string[];
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  requiredRoles = ['admin', 'owner'] 
}) => {
  // Use the real authentication context instead of mocked values
  const { isAuthenticated, hasRole } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  // Check if user has required role
  const hasRequiredRole = requiredRoles.some(role => hasRole(role));
  if (!hasRequiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="admin-layout">
      {children}
    </div>
  );
};

export default AdminLayout;

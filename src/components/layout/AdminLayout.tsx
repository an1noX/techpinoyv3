
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
  const { isAuthenticated, hasRole, user } = useAuth();
  const location = useLocation();

  console.log("AdminLayout - Auth state:", { isAuthenticated, user, currentPath: location.pathname });

  // Check if user is authenticated
  if (!isAuthenticated) {
    console.log("AdminLayout - User not authenticated, redirecting to /auth");
    return <Navigate to="/auth" />;
  }

  // Check if user has required role
  const hasRequiredRole = requiredRoles.some(role => hasRole(role));
  
  console.log("AdminLayout - Role check:", { 
    requiredRoles, 
    hasRequiredRole, 
    userMetadata: user?.user_metadata 
  });
  
  if (!hasRequiredRole) {
    console.log("AdminLayout - User lacks required role, redirecting to /dashboard");
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="admin-layout">
      {children}
    </div>
  );
};

export default AdminLayout;


import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface AdminLayoutProps {
  children?: ReactNode;
  requiredRoles?: string[];
}

// Note: This is a placeholder until we properly implement auth context
const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  requiredRoles = ['admin', 'owner'] 
}) => {
  // Temporarily mock authentication until we implement the proper AuthContext
  const isAuthenticated = true;
  const hasRole = (role: string) => true;

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
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

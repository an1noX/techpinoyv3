
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

interface AdminLayoutProps {
  requiredRoles?: string[];
}

// Note: This is a placeholder until we properly implement auth context
const AdminLayout: React.FC<AdminLayoutProps> = ({ requiredRoles = ['admin', 'owner'] }) => {
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
      <Outlet />
    </div>
  );
};

export default AdminLayout;

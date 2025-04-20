
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

interface AdminLayoutProps {
  requiredRoles?: string[];
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ requiredRoles = ['admin', 'owner'] }) => {
  const { isAuthenticated, hasRole } = useAuth();

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

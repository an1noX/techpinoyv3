import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, User, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function BottomNavigation() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary' : 'text-muted-foreground';
  };

  const isAuthPage = location.pathname.startsWith('/auth');

  if (isAuthPage) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 bg-background border-t z-50">
      <div className="max-w-md mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex flex-col items-center justify-center">
          <Home className={`h-5 w-5 ${isActive('/')}`} />
          <span className="text-xs">Home</span>
        </Link>
        <Link to="/store" className="flex flex-col items-center justify-center">
          <Search className={`h-5 w-5 ${isActive('/store')}`} />
          <span className="text-xs">Store</span>
        </Link>
        <Link to="/maintenance" className="flex flex-col items-center justify-center">
          <SlidersHorizontal className={`h-5 w-5 ${isActive('/maintenance')}`} />
          <span className="text-xs">Maintenance</span>
        </Link>
        {isAuthenticated && (
          <Link to="/printers/new" className="flex flex-col items-center justify-center">
            <Plus className={`h-5 w-5 ${isActive('/printers/new')}`} />
            <span className="text-xs">Add</span>
          </Link>
        )}
        {isAuthenticated ? (
          <Link to="/profile" className="flex flex-col items-center justify-center">
            <User className={`h-5 w-5 ${isActive('/profile')}`} />
            <span className="text-xs">Profile</span>
          </Link>
        ) : (
          <Link to="/auth" className="flex flex-col items-center justify-center">
            <User className={`h-5 w-5 ${isActive('/auth')}`} />
            <span className="text-xs">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

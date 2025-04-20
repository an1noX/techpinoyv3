import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function BottomNavigation() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary' : 'text-muted-foreground';
  };

  const isAuthPage = location.pathname.startsWith('/auth');

  // Hide the bottom navigation on authentication pages
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
        {user && (
          <Link to="/printers/new" className="flex flex-col items-center justify-center">
            <Plus className={`h-5 w-5 ${isActive('/printers/new')}`} />
            <span className="text-xs">Add</span>
          </Link>
        )}
        {user && (
          <Link to="/profile" className="flex flex-col items-center justify-center">
            <User className={`h-5 w-5 ${isActive('/profile')}`} />
            <span className="text-xs">Profile</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

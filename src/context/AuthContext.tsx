
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  signOut: async () => {},
  hasRole: () => false,
  hasPermission: () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (role: string) => {
    // Check if user has specific role
    const userRole = user?.user_metadata?.role;
    return userRole === role;
  };

  const hasPermission = (permission: string) => {
    // Simple implementation - could be more sophisticated
    const userRole = user?.user_metadata?.role;

    // Admin has all permissions
    if (userRole === 'admin') return true;

    // Check specific permissions
    const permissionMap: Record<string, string[]> = {
      'manager': ['read:printers', 'update:printers', 'create:printers', 'transfer:printers', 'read:maintenance', 'update:maintenance', 'create:maintenance'],
      'technician': ['read:printers', 'update:printers', 'read:maintenance', 'update:maintenance', 'create:maintenance'],
      'client': ['read:printers'],
    };

    return permissionMap[userRole as string]?.includes(permission) || false;
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user,
    signOut,
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

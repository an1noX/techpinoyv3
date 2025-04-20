
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<{ error: Error | null }>;
  signUp: (credentials: { 
    email: string; 
    password: string;
    options?: { data: { first_name: string; last_name: string } }
  }) => Promise<{ error: Error | null }>;
}

// Export the AuthContext so it can be imported in other files
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  signOut: async () => {},
  hasRole: () => false,
  hasPermission: () => false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
});

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

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async ({ email, password, options }: { 
    email: string; 
    password: string;
    options?: { data: { first_name: string; last_name: string } }
  }) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: options?.data
      }
    });
    return { error };
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
    signIn,
    signUp,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

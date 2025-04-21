
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'technician' | 'client';

// Define the permissions by role
const ROLE_PERMISSIONS = {
  admin: [
    'read:printers', 'update:printers', 'create:printers', 'delete:printers',
    'read:maintenance', 'update:maintenance', 'create:maintenance', 'delete:maintenance',
    'read:clients', 'update:clients', 'create:clients', 'delete:clients',
    'read:wiki', 'update:wiki', 'create:wiki', 'delete:wiki', 'approve:wiki',
    'read:users', 'update:users', 'create:users', 'delete:users',
    'read:settings', 'update:settings',
    'transfer:printers', 'assign:printers'
  ],
  technician: [
    'read:printers', 'update:printers',
    'read:maintenance', 'update:maintenance', 'create:maintenance',
    'read:clients',
    'read:wiki', 'create:wiki', 'update:own:wiki'
  ],
  client: [
    'read:printers',
    'read:wiki'
  ]
};

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<{ error: Error | null }>;
  signUp: (credentials: { 
    email: string; 
    password: string;
    options?: { data: { first_name: string; last_name: string; role?: UserRole } }
  }) => Promise<{ error: Error | null }>;
}

// Export the AuthContext so it can be imported in other files
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  role: null,
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
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchUserRole(session.user.id);
        } else {
          setRole(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
        return;
      }

      setRole(data.role as UserRole);
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setRole(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
  };

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async ({ email, password, options }: { 
    email: string; 
    password: string;
    options?: { data: { first_name: string; last_name: string; role?: UserRole } }
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

  const hasRole = (checkRole: UserRole) => {
    return role === checkRole;
  };

  const hasPermission = (permission: string) => {
    if (!role) return false;
    
    // Admin role has all permissions
    return ROLE_PERMISSIONS[role]?.includes(permission) || false;
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user,
    role,
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

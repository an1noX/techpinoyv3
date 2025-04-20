import React, { createContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<{ error: Error | null }>;
  signUp: (credentials: { email: string; password: string; options?: { data: { first_name: string; last_name: string } } }) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        // Update state with initial session
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    );

    // Initialize
    initAuth();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      navigate('/');
    }
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
    if (!error) {
      navigate('/auth');
    }
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      isAuthenticated: !!session,
      signIn, 
      signUp, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

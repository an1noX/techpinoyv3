
import React, { createContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signIn: (credentials: { email: string; password: string }) => Promise<{ error: Error | null }>;
  signUp: (credentials: { email: string; password: string; options?: { data: { first_name: string; last_name: string } } }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Retrieved session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

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

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    // You could return a loading spinner or null here
    return null;
  }

  return (
    <AuthContext.Provider value={{ session, user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

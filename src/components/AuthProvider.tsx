
import React, { createContext, useEffect, useState } from 'react';
import { Session, User, getSession, signIn, signOut, signUp } from '@/services/auth';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signUp: (data: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<{ error: Error | null }>;
  signIn: (data: { email: string; password: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const fetchSession = async () => {
      const { session, error } = await getSession();
      
      if (error) {
        console.error('Error fetching session:', error);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    fetchSession();
  }, []);

  // Custom sign up function
  const handleSignUp = async ({ 
    email, 
    password, 
    firstName, 
    lastName 
  }: { 
    email: string; 
    password: string; 
    firstName?: string; 
    lastName?: string 
  }) => {
    const { error } = await signUp({ email, password, firstName, lastName });
    return { error };
  };

  // Custom sign in function
  const handleSignIn = async ({ email, password }: { email: string; password: string }) => {
    const { session: newSession, error } = await signIn({ email, password });
    
    if (newSession && !error) {
      setSession(newSession);
      setUser(newSession.user);
    }
    
    return { error };
  };

  // Custom sign out function
  const handleSignOut = async () => {
    const { error } = await signOut();
    
    if (!error) {
      setSession(null);
      setUser(null);
    }
    
    return { error };
  };

  const value = {
    session,
    user,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

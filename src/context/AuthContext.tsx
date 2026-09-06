import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

import { sanitizeBrowserStorage } from '../lib/safeStorage';

interface DemoUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | DemoUser | null;
  session: Session | null;
  loading: boolean;
  isDemoUser: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    // Purge any unauthorized or sensitive legacy items from browser storage
    sanitizeBrowserStorage();

    if (isSupabaseConfigured && supabase) {
      // Check active Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsDemoUser(false);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsDemoUser(false);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Local demo mode: user starts unauthenticated in-memory.
      // No sensitive user credentials or data are stored in localStorage or sessionStorage.
      setUser(null);
      setIsDemoUser(false);
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? new Error(error.message) : null };
    }

    // In-memory local sign-in (NO localStorage/sessionStorage persistence)
    const demo = { id: 'demo-user', email };
    setUser(demo);
    setIsDemoUser(true);
    return { error: null };
  };

  const signUp = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error: error ? new Error(error.message) : null };
    }

    // In-memory local sign-up (NO localStorage/sessionStorage persistence)
    const demo = { id: 'demo-user', email };
    setUser(demo);
    setIsDemoUser(true);
    return { error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    // Purge any storage and reset in-memory state
    sanitizeBrowserStorage();
    setUser(null);
    setSession(null);
    setIsDemoUser(false);
  };

  const loginAsDemo = () => {
    // In-memory demo workspace access (NO localStorage/sessionStorage persistence)
    const demo = { id: 'demo-user', email: 'demo@dynamic-qr.com' };
    setUser(demo);
    setIsDemoUser(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isDemoUser,
        signIn,
        signUp,
        signOut,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

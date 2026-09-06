import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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

const DEMO_USER_KEY = 'dynamic_qr_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
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
      // Local demo mode: check if saved demo user exists
      const savedDemo = localStorage.getItem(DEMO_USER_KEY);
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo);
          setUser(parsed);
          setIsDemoUser(true);
        } catch {
          // ignore
        }
      } else {
        // Auto-login as demo user so dashboard works right away
        const defaultDemo = { id: 'demo-user', email: 'demo@dynamic-qr.com' };
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(defaultDemo));
        setUser(defaultDemo);
        setIsDemoUser(true);
      }
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? new Error(error.message) : null };
    }

    // Mock local sign-in
    const demo = { id: 'demo-user', email };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demo));
    setUser(demo);
    setIsDemoUser(true);
    return { error: null };
  };

  const signUp = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error: error ? new Error(error.message) : null };
    }

    // Mock local sign-up
    const demo = { id: 'demo-user', email };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demo));
    setUser(demo);
    setIsDemoUser(true);
    return { error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(DEMO_USER_KEY);
    setUser(null);
    setSession(null);
    setIsDemoUser(false);
  };

  const loginAsDemo = () => {
    const demo = { id: 'demo-user', email: 'demo@dynamic-qr.com' };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demo));
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

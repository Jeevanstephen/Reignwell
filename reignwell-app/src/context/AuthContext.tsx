import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

interface LocalUser {
  id: string;
  email: string;
  user_metadata: { full_name: string };
}

interface AuthContextType {
  session: Session | null;
  user: User | LocalUser | null;
  loading: boolean;
  supabaseReady: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'rw_local_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      // Load local user from AsyncStorage
      AsyncStorage.getItem(LOCAL_USER_KEY).then((raw) => {
        if (raw) setLocalUser(JSON.parse(raw));
        setLoading(false);
      });
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    if (!supabase) {
      // Local sign-up: store in AsyncStorage
      const existing = await AsyncStorage.getItem(LOCAL_USER_KEY);
      if (existing) {
        const u = JSON.parse(existing);
        if (u.email === email) return { error: new Error('Account already exists. Please sign in.') };
      }
      const user: LocalUser = {
        id: Date.now().toString(),
        email,
        user_metadata: { full_name: name },
      };
      await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      setLocalUser(user);
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      const raw = await AsyncStorage.getItem(LOCAL_USER_KEY);
      if (!raw) return { error: new Error('No account found. Please create one first.') };
      const user: LocalUser = JSON.parse(raw);
      if (user.email !== email) return { error: new Error('Email not found.') };
      // Local auth doesn't store passwords — just check email matches
      setLocalUser(user);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    if (!supabase) {
      setLocalUser(null);
      return;
    }
    await supabase.auth.signOut();
  };

  const user = supabase ? (session?.user ?? null) : localUser;
  const isLoggedIn = supabase ? !!session : !!localUser;

  return (
    <AuthContext.Provider value={{
      session: isLoggedIn && !supabase ? ({ user } as any) : session,
      user: user as any,
      loading,
      supabaseReady: !!supabase,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

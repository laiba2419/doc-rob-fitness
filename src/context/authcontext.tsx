import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;

  // Email / password
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;

  // Phone OTP (register / login with phone)
  sendPhoneOtp: (phone: string) => Promise<{ error: string | null }>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<{ error: string | null }>;

  // Forgot password via email OTP
  sendPasswordResetOtp: (email: string) => Promise<{ error: string | null }>;
  verifyPasswordResetOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;

  // Email signup verification
  verifySignupOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  resendSignupOtp: (email: string) => Promise<{ error: string | null }>;

  // Debug/test helper
  testRawPasswordReset: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const sendPhoneOtp = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    return { error: error?.message ?? null };
  };

  const verifyPhoneOtp = async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    return { error: error?.message ?? null };
  };

  const sendPasswordResetOtp = async (email: string) => {
    console.log('[DEBUG] sendPasswordResetOtp called with email:', email);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        console.log('[DEBUG] sendPasswordResetOtp SDK error name:', error.name);
        console.log('[DEBUG] sendPasswordResetOtp SDK error message:', error.message);
        console.log('[DEBUG] sendPasswordResetOtp SDK error status:', error.status);
        console.log('[DEBUG] sendPasswordResetOtp SDK full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        return { error: error.message ?? 'Unknown error sending reset code' };
      }

      console.log('[DEBUG] sendPasswordResetOtp SUCCESS, data:', JSON.stringify(data, null, 2));
      return { error: null };
    } catch (err: any) {
      console.log('[DEBUG] sendPasswordResetOtp THREW an exception:', err);
      console.log('[DEBUG] sendPasswordResetOtp exception message:', err?.message);
      return { error: err?.message ?? 'Unexpected error sending reset code' };
    }
  };

  const testRawPasswordReset = async (email: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ email }),
      });
      const text = await response.text();
      console.log('[RAW RESET TEST] Status:', response.status);
      console.log('[RAW RESET TEST] Body:', text);
    } catch (e) {
      console.log('[RAW RESET TEST] Fetch threw:', e);
    }
  };

  const verifyPasswordResetOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
    return { error: error?.message ?? null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message ?? null };
  };

  const verifySignupOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
    return { error: error?.message ?? null };
  };

  const resendSignupOtp = async (email: string) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    return { error: error?.message ?? null };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signIn,
        signUp,
        signOut,
        sendPhoneOtp,
        verifyPhoneOtp,
        sendPasswordResetOtp,
        testRawPasswordReset,
        verifyPasswordResetOtp,
        updatePassword,
        verifySignupOtp,
        resendSignupOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
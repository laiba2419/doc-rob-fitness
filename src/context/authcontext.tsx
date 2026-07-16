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

  // Forgot password via email OTP (custom Brevo-based flow)
  sendPasswordResetOtp: (email: string) => Promise<{ error: string | null }>;
  verifyPasswordResetOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  resetPasswordWithOtp: (email: string, token: string, newPassword: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;

  // Email signup verification
  verifySignupOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  resendSignupOtp: (email: string) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[DEBUG] AuthProvider mounted, checking existing session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[DEBUG] getSession resolved. session exists:', !!session, 'user:', session?.user?.email);
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[DEBUG] onAuthStateChange fired. event:', _event, 'session exists:', !!session);
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('[DEBUG] signIn called with email:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.log('[DEBUG] signIn error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } else {
      console.log('[DEBUG] signIn SUCCESS. user:', data?.user?.email);
    }
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    console.log('[DEBUG] signUp called with email:', email);
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.log('[DEBUG] signUp SDK error name:', error.name);
      console.log('[DEBUG] signUp SDK error message:', error.message);
      console.log('[DEBUG] signUp SDK error status:', error.status);
      console.log('[DEBUG] signUp SDK full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      return { error: error.message ?? 'Unknown error signing up' };
    }

    console.log('[DEBUG] signUp SUCCESS. user:', JSON.stringify(data?.user, null, 2));
    console.log('[DEBUG] signUp — identities length (0 means "user already exists"):', data?.user?.identities?.length);
    return { error: null };
  };

  const signOut = async () => {
    console.log('[DEBUG] signOut called');
    await supabase.auth.signOut();
    console.log('[DEBUG] signOut completed');
  };

  const sendPhoneOtp = async (phone: string) => {
    console.log('[DEBUG] sendPhoneOtp called with phone:', phone);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      console.log('[DEBUG] sendPhoneOtp error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } else {
      console.log('[DEBUG] sendPhoneOtp SUCCESS');
    }
    return { error: error?.message ?? null };
  };

  const verifyPhoneOtp = async (phone: string, token: string) => {
    console.log('[DEBUG] verifyPhoneOtp called with phone:', phone, 'token:', token);
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) {
      console.log('[DEBUG] verifyPhoneOtp error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } else {
      console.log('[DEBUG] verifyPhoneOtp SUCCESS');
    }
    return { error: error?.message ?? null };
  };

  // ---- NEW: Custom OTP password reset flow (Edge Functions + Brevo) ----

  const sendPasswordResetOtp = async (email: string) => {
    console.log('[DEBUG] sendPasswordResetOtp called with email:', email);
    try {
      const { data, error } = await supabase.functions.invoke('send-reset-otp', {
        body: { email },
      });

      if (error) {
        console.log('[DEBUG] sendPasswordResetOtp error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        return { error: error.message ?? 'Failed to send reset code' };
      }

      if (data?.error) {
        console.log('[DEBUG] sendPasswordResetOtp function returned error:', data.error);
        return { error: typeof data.error === 'string' ? data.error : 'Failed to send reset code' };
      }

      console.log('[DEBUG] sendPasswordResetOtp SUCCESS, data:', JSON.stringify(data, null, 2));
      return { error: null };
    } catch (err: any) {
      console.log('[DEBUG] sendPasswordResetOtp THREW an exception:', err);
      return { error: err?.message ?? 'Unexpected error sending reset code' };
    }
  };

  // Verifies the OTP only (does not change password). Useful if you want a
  // separate "enter code" screen before the "set new password" screen.
  const verifyPasswordResetOtp = async (email: string, token: string) => {
    console.log('[DEBUG] verifyPasswordResetOtp called with email:', email, 'token:', token);
    try {
      const { data, error } = await supabase.functions.invoke('verify-reset-otp', {
        body: { email, otp: token },
      });

      if (error) {
        console.log('[DEBUG] verifyPasswordResetOtp error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        return { error: error.message ?? 'Invalid or expired code' };
      }

      if (data?.error) {
        console.log('[DEBUG] verifyPasswordResetOtp function returned error:', data.error);
        return { error: typeof data.error === 'string' ? data.error : 'Invalid or expired code' };
      }

      console.log('[DEBUG] verifyPasswordResetOtp SUCCESS');
      return { error: null };
    } catch (err: any) {
      console.log('[DEBUG] verifyPasswordResetOtp THREW an exception:', err);
      return { error: err?.message ?? 'Unexpected error verifying code' };
    }
  };

  // Verifies the OTP AND sets the new password in a single call.
  // Use this on the "set new password" screen after the user enters the OTP.
  const resetPasswordWithOtp = async (email: string, token: string, newPassword: string) => {
    console.log('[DEBUG] resetPasswordWithOtp called with email:', email);
    try {
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { email, otp: token, newPassword },
      });

      if (error) {
        console.log('[DEBUG] resetPasswordWithOtp error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        return { error: error.message ?? 'Failed to reset password' };
      }

      if (data?.error) {
        console.log('[DEBUG] resetPasswordWithOtp function returned error:', data.error);
        return { error: typeof data.error === 'string' ? data.error : 'Failed to reset password' };
      }

      console.log('[DEBUG] resetPasswordWithOtp SUCCESS');
      return { error: null };
    } catch (err: any) {
      console.log('[DEBUG] resetPasswordWithOtp THREW an exception:', err);
      return { error: err?.message ?? 'Unexpected error resetting password' };
    }
  };

  // Kept for use while the user IS logged in and wants to change their own password
  // (e.g. from a "Settings" screen). Not used by the forgot-password flow anymore.
  const updatePassword = async (newPassword: string) => {
    console.log('[DEBUG] updatePassword called');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      console.log('[DEBUG] updatePassword error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } else {
      console.log('[DEBUG] updatePassword SUCCESS');
    }
    return { error: error?.message ?? null };
  };

  const verifySignupOtp = async (email: string, token: string) => {
    console.log('[DEBUG] verifySignupOtp called with email:', email, 'token:', token);
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
    if (error) {
      console.log('[DEBUG] verifySignupOtp SDK error name:', error.name);
      console.log('[DEBUG] verifySignupOtp SDK error message:', error.message);
      console.log('[DEBUG] verifySignupOtp SDK error status:', error.status);
      console.log('[DEBUG] verifySignupOtp SDK full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } else {
      console.log('[DEBUG] verifySignupOtp SUCCESS. session exists:', !!data?.session, 'user:', data?.user?.email);
    }
    return { error: error?.message ?? null };
  };

  const resendSignupOtp = async (email: string) => {
    console.log('[DEBUG] resendSignupOtp called with email:', email);
    const { data, error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
      console.log('[DEBUG] resendSignupOtp SDK error name:', error.name);
      console.log('[DEBUG] resendSignupOtp SDK error message:', error.message);
      console.log('[DEBUG] resendSignupOtp SDK error status:', error.status);
      console.log('[DEBUG] resendSignupOtp SDK full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } else {
      console.log('[DEBUG] resendSignupOtp SUCCESS, data:', JSON.stringify(data, null, 2));
    }
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
        verifyPasswordResetOtp,
        resetPasswordWithOtp,
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

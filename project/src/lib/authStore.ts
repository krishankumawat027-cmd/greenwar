import { create } from 'zustand';
import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: { id: string; username: string; avatar_url?: string } | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// Password validation rules
export const PASSWORD_RULES = {
  minLength: 8,
  requireNumber: true,
  requireSpecialChar: true,
  requireUppercase: false,
};

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters`);
  }

  if (PASSWORD_RULES.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_RULES.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  return { valid: errors.length === 0, errors };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true });

    // Get initial session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Session error:', error);
      set({ isLoading: false, isInitialized: true });
      return;
    }

    if (session?.user) {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      set({
        user: session.user,
        session,
        profile: profile as AuthState['profile'],
        isLoading: false,
        isInitialized: true,
      });
    } else {
      set({ isLoading: false, isInitialized: true });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({
          user: session.user,
          session,
          profile: profile as AuthState['profile'],
        });
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, session: null, profile: null });
      }
    });
  },

  signUp: async (email, password, username) => {
    set({ isLoading: true, error: null });

    // Validate password on client side
    const validation = validatePassword(password);
    if (!validation.valid) {
      set({ isLoading: false, error: validation.errors[0] });
      return { success: false, error: validation.errors[0] };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Create profile
      await supabase.from('profiles').insert({
        id: data.user.id,
        username,
      });

      set({ user: data.user, session: data.session, isLoading: false });
      return { success: true };
    }

    set({ isLoading: false });
    return { success: false, error: 'Registration failed' };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  signIn: async (email, password, _rememberMe) => {
    set({ isLoading: true, error: null });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      set({
        user: data.user,
        session: data.session,
        profile: profile as AuthState['profile'],
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }

    return { success: true };
  },

  signOut: async () => {
    set({ isLoading: true });

    await supabase.auth.signOut();

    // Clear all state
    set({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

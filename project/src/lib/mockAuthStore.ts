import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface MockUser {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface MockAuthState {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;

  // Actions
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

  return { valid: errors.length === 0, errors };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Simulated user storage
const STORAGE_KEY = 'mock_users_db';
const getMockUsers = (): Map<string, { email: string; password: string; username: string; id: string }> => {
  const isLocalStorageAvailable = typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function';
  const stored = isLocalStorageAvailable ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored) {
    try {
      return new Map(JSON.parse(stored));
    } catch (e) {
      console.error('Error parsing mock users from localStorage', e);
    }
  }
  
  const initial = new Map();
  initial.set('demo@ecowarrior.com', {
    email: 'demo@ecowarrior.com',
    password: 'Demo@123',
    username: 'eco_champion',
    id: 'demo-user-001',
  });
  if (isLocalStorageAvailable) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(initial.entries())));
  }
  return initial;
};

const mockUsers = getMockUsers();

const saveMockUsers = (users: Map<string, { email: string; password: string; username: string; id: string }>) => {
  if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(users.entries())));
  }
};

export const useMockAuthStore = create<MockAuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      rememberMe: true,
      currentGreenWar: {
        id: 'war-123',
        title: 'Green Sprints Battle',
        description: 'Reduce CO2 emissions',
        room_code: 'WAR-DEMO',
        is_active: true,
      },
      signUp: async (email, password, username) => {
        set({ isLoading: true, error: null });

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Validate email
        if (!validateEmail(email)) {
          set({ isLoading: false, error: 'Please enter a valid email address' });
          return { success: false, error: 'Please enter a valid email address' };
        }

        // Validate password
        const validation = validatePassword(password);
        if (!validation.valid) {
          set({ isLoading: false, error: validation.errors[0] });
          return { success: false, error: validation.errors[0] };
        }

        // Check if user already exists
        if (mockUsers.has(email.toLowerCase())) {
          set({ isLoading: false, error: 'An account with this email already exists' });
          return { success: false, error: 'An account with this email already exists' };
        }

        // Create new user
        const newUser: MockUser = {
          id: `user-${Date.now()}`,
          email: email.toLowerCase(),
          username,
          created_at: new Date().toISOString(),
        };

        // Store in mock database
        mockUsers.set(email.toLowerCase(), {
          email: email.toLowerCase(),
          password,
          username,
          id: newUser.id,
        });
        saveMockUsers(mockUsers);

        set({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      },

      signIn: async (email, password, rememberMe) => {
        set({ isLoading: true, error: null });

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const normalizedEmail = email.toLowerCase();
        const storedUser = mockUsers.get(normalizedEmail);

        if (!storedUser) {
          set({ isLoading: false, error: 'No account found with this email' });
          return { success: false, error: 'No account found with this email' };
        }

        if (storedUser.password !== password) {
          set({ isLoading: false, error: 'Incorrect password' });
          return { success: false, error: 'Incorrect password' };
        }

        const user: MockUser = {
          id: storedUser.id,
          email: storedUser.email,
          username: storedUser.username,
          created_at: new Date().toISOString(),
        };

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          rememberMe,
        });

        return { success: true };
      },

      signOut: async () => {
        set({ isLoading: true });

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'caremitra-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.rememberMe ? state.user : null,
        isAuthenticated: state.rememberMe ? state.isAuthenticated : false,
        rememberMe: state.rememberMe,
      }),
    }
  )
);

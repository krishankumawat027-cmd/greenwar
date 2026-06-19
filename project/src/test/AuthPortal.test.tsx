/**
 * Tests for the AuthPortal component.
 * Covers sign-in, sign-up, form validation, and demo credentials.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthPortal } from '../components/AuthPortal';

const mockClearError = vi.fn();
const mockSignIn = vi.fn().mockResolvedValue({ success: true });
const mockSignUp = vi.fn().mockResolvedValue({ success: true });
const mockAuthStoreState = {
  signIn: mockSignIn,
  signUp: mockSignUp,
  error: null,
  clearError: mockClearError,
  isLoading: false,
};

// Mock the auth store to control behavior
vi.mock('../lib/mockAuthStore', () => {
  return {
    validateEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    validatePassword: (password: string) => {
      const errors: string[] = [];
      if (password.length < 8) errors.push('Password must be at least 8 characters');
      if (!/\d/.test(password)) errors.push('Password must contain at least one number');
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
      }
      return { valid: errors.length === 0, errors };
    },
    useMockAuthStore: vi.fn(() => mockAuthStoreState),
  };
});

describe('AuthPortal – Rendering', () => {
  it('renders the app logo and brand name', () => {
    render(<AuthPortal />);
    expect(screen.getByText('EcoWarrior')).toBeInTheDocument();
    expect(screen.getByText(/carbon footprint tracker/i)).toBeInTheDocument();
  });

  it('renders Sign In and Create Account tabs', () => {
    render(<AuthPortal />);
    expect(screen.getByRole('tab', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows sign-in form by default', () => {
    render(<AuthPortal />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it('does not show username or confirm password in sign-in mode', () => {
    render(<AuthPortal />);
    expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^confirm password$/i)).not.toBeInTheDocument();
  });
});

describe('AuthPortal – Sign Up mode', () => {
  beforeEach(() => {
    render(<AuthPortal />);
    fireEvent.click(screen.getByRole('tab', { name: /create account/i }));
  });

  it('shows username field in sign-up mode', () => {
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  });

  it('shows confirm password field in sign-up mode', () => {
    expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument();
  });

  it('does not show Demo Credentials button in sign-up mode', () => {
    expect(screen.queryByRole('button', { name: /demo credentials/i })).not.toBeInTheDocument();
  });
});

describe('AuthPortal – Form Validation', () => {
  it('shows email error when form submitted with empty email', async () => {
    render(<AuthPortal />);
    fireEvent.click(screen.getByRole('button', { name: /sign in to your account/i }));
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('shows password error when form submitted with empty password', async () => {
    render(<AuthPortal />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in to your account/i }));
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows email format error for invalid email', async () => {
    render(<AuthPortal />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'notanemail' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in to your account/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    render(<AuthPortal />);
    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    const toggleBtn = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});

describe('AuthPortal – Demo Credentials', () => {
  it('fills demo credentials when button is clicked', async () => {
    render(<AuthPortal />);
    fireEvent.click(screen.getByRole('button', { name: /demo credentials/i }));
    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toHaveValue('demo@ecowarrior.com');
    });
  });
});

describe('AuthPortal – Accessibility', () => {
  it('all form inputs have associated labels', () => {
    render(<AuthPortal />);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it('error messages have role alert', async () => {
    render(<AuthPortal />);
    fireEvent.click(screen.getByRole('button', { name: /sign in to your account/i }));
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });
  });
});

/**
 * Tests for the mock authentication store.
 * Covers validatePassword, validateEmail, signIn, signUp, signOut.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validatePassword, validateEmail, useMockAuthStore } from '../lib/mockAuthStore';

// ---- Pure utility function tests (no store needed) ----

describe('validateEmail', () => {
  it('returns true for valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('returns true for email with subdomain', () => {
    expect(validateEmail('user@mail.example.co.uk')).toBe(true);
  });

  it('returns false for email without @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('returns false for email without domain', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('returns false for email with spaces', () => {
    expect(validateEmail('user @example.com')).toBe(false);
  });

  it('returns true for demo email', () => {
    expect(validateEmail('demo@ecowarrior.com')).toBe(true);
  });
});

describe('validatePassword', () => {
  it('returns valid for strong password', () => {
    const result = validatePassword('SecurePass@1');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns invalid for short password', () => {
    const result = validatePassword('Ab@1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters');
  });

  it('returns invalid when no number present', () => {
    const result = validatePassword('SecurePass@');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('number'))).toBe(true);
  });

  it('returns invalid when no special character present', () => {
    const result = validatePassword('SecurePass1');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('special'))).toBe(true);
  });

  it('returns multiple errors for weak password', () => {
    const result = validatePassword('abc');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });

  it('accepts demo password Demo@123', () => {
    const result = validatePassword('Demo@123');
    expect(result.valid).toBe(true);
  });

  it('returns invalid for empty string', () => {
    const result = validatePassword('');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('accepts passwords with various special characters', () => {
    const specials = ['!', '@', '#', '$', '%', '^', '&', '*'];
    specials.forEach(char => {
      const result = validatePassword(`Password${char}1`);
      expect(result.valid).toBe(true);
    });
  });
});

describe('useMockAuthStore actions', () => {
  beforeEach(() => {
    // Reset state before each test
    useMockAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      rememberMe: true,
    });
  });

  it('signs up a new user successfully', async () => {
    vi.useFakeTimers();
    const email = `newuser_${Date.now()}@example.com`;
    const promise = useMockAuthStore.getState().signUp(email, 'Demo@123', 'newuser');
    
    // Fast-forward delay
    vi.advanceTimersByTime(850);
    const res = await promise;
    
    expect(res.success).toBe(true);
    expect(useMockAuthStore.getState().isAuthenticated).toBe(true);
    expect(useMockAuthStore.getState().user?.email).toBe(email);
    vi.useRealTimers();
  });

  it('fails to sign up with invalid email', async () => {
    vi.useFakeTimers();
    const promise = useMockAuthStore.getState().signUp('invalid-email', 'Demo@123', 'newuser');
    vi.advanceTimersByTime(850);
    const res = await promise;
    
    expect(res.success).toBe(false);
    expect(res.error).toBe('Please enter a valid email address');
    expect(useMockAuthStore.getState().isAuthenticated).toBe(false);
    vi.useRealTimers();
  });

  it('fails to sign up with weak password', async () => {
    vi.useFakeTimers();
    const promise = useMockAuthStore.getState().signUp('user@example.com', 'weak', 'newuser');
    vi.advanceTimersByTime(850);
    const res = await promise;
    
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
    expect(useMockAuthStore.getState().isAuthenticated).toBe(false);
    vi.useRealTimers();
  });

  it('fails to sign up if email already exists', async () => {
    vi.useFakeTimers();
    // demo@ecowarrior.com already exists in the mock DB
    const promise = useMockAuthStore.getState().signUp('demo@ecowarrior.com', 'Demo@1234', 'demo2');
    vi.advanceTimersByTime(850);
    const res = await promise;
    
    expect(res.success).toBe(false);
    expect(res.error).toContain('exists');
    vi.useRealTimers();
  });

  it('signs in successfully with valid credentials', async () => {
    vi.useFakeTimers();
    // demo@ecowarrior.com with password Demo@123 is seeded by default
    const promise = useMockAuthStore.getState().signIn('demo@ecowarrior.com', 'Demo@123', true);
    vi.advanceTimersByTime(850);
    const res = await promise;
    
    expect(res.success).toBe(true);
    expect(useMockAuthStore.getState().isAuthenticated).toBe(true);
    expect(useMockAuthStore.getState().user?.username).toBe('eco_champion');
    vi.useRealTimers();
  });

  it('fails to sign in with incorrect password', async () => {
    vi.useFakeTimers();
    const promise = useMockAuthStore.getState().signIn('demo@ecowarrior.com', 'WrongPass123', true);
    vi.advanceTimersByTime(850);
    const res = await promise;
    
    expect(res.success).toBe(false);
    expect(res.error).toBe('Incorrect password');
    expect(useMockAuthStore.getState().isAuthenticated).toBe(false);
    vi.useRealTimers();
  });

  it('fails to sign in with non-existent email', async () => {
    vi.useFakeTimers();
    const promise = useMockAuthStore.getState().signIn('nonexistent@example.com', 'Demo@123', true);
    vi.advanceTimersByTime(850);
    const res = await promise;
    
    expect(res.success).toBe(false);
    expect(res.error).toBe('No account found with this email');
    vi.useRealTimers();
  });

  it('signs out successfully', async () => {
    vi.useFakeTimers();
    // Mock user is signed in first
    useMockAuthStore.setState({
      user: { id: 'demo-user-001', email: 'demo@ecowarrior.com', username: 'eco_champion', created_at: '' },
      isAuthenticated: true,
    });
    
    const promise = useMockAuthStore.getState().signOut();
    vi.advanceTimersByTime(350);
    await promise;
    
    expect(useMockAuthStore.getState().isAuthenticated).toBe(false);
    expect(useMockAuthStore.getState().user).toBeNull();
    vi.useRealTimers();
  });

  it('clears error state', () => {
    useMockAuthStore.setState({ error: 'Some error' });
    useMockAuthStore.getState().clearError();
    expect(useMockAuthStore.getState().error).toBeNull();
  });
});

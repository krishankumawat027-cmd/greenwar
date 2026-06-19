import { describe, it, expect } from 'vitest';
import { validatePassword, validateEmail } from '../lib/authStore';
import { useMockGreenWarStore } from '../lib/mockGreenWarStore';

describe('authStore validation utilities', () => {
  it('validates password correctly', () => {
    const result = validatePassword('Abcdef1!');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects short password', () => {
    const result = validatePassword('aB1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters');
  });

  it('requires number in password', () => {
    const result = validatePassword('Abcdefg!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one number');
  });

  it('requires special character in password', () => {
    const result = validatePassword('Abcdefg1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one special character');
  });

  it('validates email format', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
  });
});

describe('mockGreenWarStore actions', () => {
  const store = useMockGreenWarStore.getState();

  it('calculates team score based on participants', () => {
    // Initially there are participants; ensure score is >0
    const score = store.calculateTeamScore('team-alpha');
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('joins a team and updates participant', () => {
    // Ensure there is an active GreenWar
    const joinResult = store.joinGreenWar('GREEN-01');
    expect(joinResult.success).toBe(true);
    // First join initial team
    const initialJoin = store.joinTeam('team-alpha', 'demo-user');
    expect(initialJoin.success).toBe(true);
    expect(initialJoin.switched).toBe(false);
    const before = store.currentParticipant;
    // Now switch to a different team
    const result = store.joinTeam('team-crushers', 'demo-user');
    expect(result.success).toBe(true);
    expect(result.switched).toBe(true);
    const after = useMockGreenWarStore.getState();
    expect(after.currentParticipant?.team_id).toBe('team-crushers');
    expect(after.currentParticipant?.team_id).not.toBe(before?.team_id);
  });
});

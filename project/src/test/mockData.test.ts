/**
 * Tests for mock data store — activity submission, room management, leaderboard.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useMockStore } from '../lib/mockData';

// Reset store state before each test
beforeEach(() => {
  useMockStore.setState({
    userId: 'demo-user',
    username: 'eco_champion',
    currentRoom: null,
    leaderboard: [],
  });
});

describe('useMockStore – submitActivity', () => {
  it('successfully logs a valid car activity', () => {
    const { submitActivity } = useMockStore.getState();
    const result = submitActivity({
      category: 'transport',
      activityType: 'car',
      value: 20,
      unit: 'km',
    });
    expect(result.success).toBe(true);
  });

  it('prepends new log to the front of logs list', () => {
    const { submitActivity } = useMockStore.getState();
    const before = useMockStore.getState().logs.length;
    submitActivity({ category: 'transport', activityType: 'bus', value: 10, unit: 'km' });
    const after = useMockStore.getState().logs.length;
    expect(after).toBe(before + 1);
  });

  it('returns error for invalid value (zero)', () => {
    const { submitActivity } = useMockStore.getState();
    const result = submitActivity({ category: 'transport', activityType: 'car', value: 0, unit: 'km' });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('calculates and stores carbon_kg correctly', () => {
    const { submitActivity } = useMockStore.getState();
    submitActivity({ category: 'transport', activityType: 'car', value: 100, unit: 'km' });
    const newLog = useMockStore.getState().logs[0];
    expect(newLog.carbon_kg).toBe(18); // 0.18 * 100
  });

  it('stores all log fields', () => {
    const { submitActivity } = useMockStore.getState();
    submitActivity({ category: 'food', activityType: 'vegan', value: 2, unit: 'meals' });
    const log = useMockStore.getState().logs[0];
    expect(log.category).toBe('food');
    expect(log.activity_type).toBe('vegan');
    expect(log.value).toBe(2);
    expect(log.unit).toBe('meals');
    expect(log.user_id).toBe('demo-user');
    expect(log.logged_at).toBeDefined();
  });

  it('returns error for walking over daily limit', () => {
    const { submitActivity } = useMockStore.getState();
    const result = submitActivity({ category: 'transport', activityType: 'walking', value: 100, unit: 'km' });
    expect(result.success).toBe(false);
  });
});

describe('useMockStore – createRoom', () => {
  it('creates a room and returns success with code', () => {
    const { createRoom } = useMockStore.getState();
    const result = createRoom('Test Room', 'A test challenge');
    expect(result.success).toBe(true);
    expect(result.code).toMatch(/^WAR-/);
  });

  it('sets the new room as currentRoom', () => {
    const { createRoom } = useMockStore.getState();
    createRoom('My Room');
    const { currentRoom } = useMockStore.getState();
    expect(currentRoom).not.toBeNull();
    expect(currentRoom?.name).toBe('My Room');
  });

  it('adds room to rooms array', () => {
    const { createRoom } = useMockStore.getState();
    const before = useMockStore.getState().rooms.length;
    createRoom('Another Room');
    const after = useMockStore.getState().rooms.length;
    expect(after).toBe(before + 1);
  });

  it('room code starts with WAR-', () => {
    const { createRoom } = useMockStore.getState();
    const result = createRoom('WAR Room');
    expect(result.code?.startsWith('WAR-')).toBe(true);
  });

  it('generates unique codes for multiple rooms', () => {
    const { createRoom } = useMockStore.getState();
    const codes = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const result = createRoom(`Room ${i}`);
      if (result.code) codes.add(result.code);
    }
    expect(codes.size).toBe(5);
  });
});

describe('useMockStore – joinRoom', () => {
  it('joins existing demo room successfully', () => {
    const { joinRoom } = useMockStore.getState();
    const result = joinRoom('WAR-DEMO');
    expect(result.success).toBe(true);
  });

  it('sets currentRoom on successful join', () => {
    const { joinRoom } = useMockStore.getState();
    joinRoom('WAR-DEMO');
    const { currentRoom } = useMockStore.getState();
    expect(currentRoom?.code).toBe('WAR-DEMO');
  });

  it('returns error for non-existent room', () => {
    const { joinRoom } = useMockStore.getState();
    const result = joinRoom('WAR-NOPE');
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('is case-insensitive for room codes', () => {
    const { joinRoom } = useMockStore.getState();
    const result = joinRoom('war-demo');
    expect(result.success).toBe(true);
  });
});

describe('useMockStore – loadLeaderboard', () => {
  it('loads demo leaderboard for demo room', () => {
    const { loadLeaderboard } = useMockStore.getState();
    loadLeaderboard('demo-room');
    const { leaderboard } = useMockStore.getState();
    expect(leaderboard.length).toBeGreaterThan(0);
  });

  it('leaderboard entries have required fields', () => {
    const { loadLeaderboard } = useMockStore.getState();
    loadLeaderboard('demo-room');
    const { leaderboard } = useMockStore.getState();
    leaderboard.forEach(entry => {
      expect(entry.user_id).toBeDefined();
      expect(entry.username).toBeDefined();
      expect(typeof entry.total_carbon).toBe('number');
      expect(typeof entry.rank_position).toBe('number');
    });
  });

  it('generates single-user leaderboard for custom room', () => {
    const { loadLeaderboard } = useMockStore.getState();
    loadLeaderboard('custom-room-xyz');
    const { leaderboard } = useMockStore.getState();
    expect(leaderboard.length).toBe(1);
    expect(leaderboard[0].user_id).toBe('demo-user');
  });
});

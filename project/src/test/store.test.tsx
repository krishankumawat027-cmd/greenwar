import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';

// Mock supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      rpc: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}));

describe('store functionality', () => {
  beforeEach(() => {
    // reset store state before each test
    useStore.setState({
      userId: null,
      username: '',
      isInitialized: false,
      logs: [],
      totalCarbon: 0,
      categoryTotals: { transport: 0, food: 0, energy: 0 },
      currentRoom: null,
      leaderboard: [],
      activeView: 'dashboard',
      isLogging: false,
      error: null,
    });
  });

  it('loadLogs populates logs and totals', async () => {
    // set a userId to trigger loadLogs
    useStore.setState({ userId: 'test-user', isInitialized: true });
    await useStore.getState().loadLogs();
    const { logs, totalCarbon, categoryTotals } = useStore.getState();
    expect(logs).toEqual([]);
    expect(totalCarbon).toBe(0);
    expect(categoryTotals).toEqual({ transport: 0, food: 0, energy: 0 });
    expect(supabase.from).toHaveBeenCalledWith('activity_logs');
  });

  it('submitActivity returns error when not initialized', async () => {
    const result = await useStore.getState().submitActivity({
      category: 'transport',
      activityType: 'car',
      value: 10,
      unit: 'km',
      verificationTicket: false,
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe('User not initialized');
  });

  it('submitActivity succeeds when valid', async () => {
    // set user and mock calculateCarbon to deterministic value
    vi.mock('../lib/calculations', async () => ({
      ...await vi.importActual('../lib/calculations'),
      calculateCarbon: vi.fn(() => ({ carbonKg: 5 })),
      validateActivityInput: vi.fn(() => ({ valid: true })),
    }));
    useStore.setState({ userId: 'uid', isInitialized: true });
    const result = await useStore.getState().submitActivity({
      category: 'transport',
      activityType: 'car',
      value: 10,
      unit: 'km',
      verificationTicket: false,
    });
    expect(result.success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('activity_logs');
  });
});

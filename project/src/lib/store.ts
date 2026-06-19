import { create } from 'zustand';
import { supabase, type ActivityLog, type ChallengeRoom, type LeaderboardEntry } from './supabase';
import { calculateCarbon, validateActivityInput, type ActivityInput } from './calculations';

interface AppState {
  // User state
  userId: string | null;
  username: string;
  isInitialized: boolean;

  // Activity logs
  logs: ActivityLog[];
  totalCarbon: number;
  categoryTotals: { transport: number; food: number; energy: number };

  // Challenge rooms
  currentRoom: ChallengeRoom | null;
  leaderboard: LeaderboardEntry[];

  // UI state
  activeView: 'dashboard' | 'log' | 'challenges' | 'profile';
  isLogging: boolean;
  error: string | null;

  // Actions
  initUser: (id: string, username: string) => Promise<void>;
  loadLogs: () => Promise<void>;
  submitActivity: (input: ActivityInput) => Promise<{ success: boolean; error?: string }>;
  joinRoom: (code: string) => Promise<{ success: boolean; error?: string }>;
  createRoom: (name: string, description?: string) => Promise<{ success: boolean; code?: string; error?: string }>;
  loadLeaderboard: (roomId: string) => Promise<void>;
  setActiveView: (view: 'dashboard' | 'log' | 'challenges' | 'profile') => void;
  clearError: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
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

  // Initialize user
  initUser: async (id: string, username: string) => {
    set({ userId: id, username, isInitialized: true });
    await get().loadLogs();
  },

  // Load logs from database
  loadLogs: async () => {
    const { userId } = get();
    if (!userId) return;

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })
      .limit(30);

    if (error) {
      set({ error: error.message });
      return;
    }

    const logs = (data as ActivityLog[]) || [];
    const totalCarbon = logs.reduce((sum, log) => sum + log.carbon_kg, 0);
    const categoryTotals = logs.reduce(
      (acc, log) => {
        if (log.category in acc) {
          acc[log.category as keyof typeof acc] += log.carbon_kg;
        }
        return acc;
      },
      { transport: 0, food: 0, energy: 0 }
    );

    set({ logs, totalCarbon, categoryTotals });
  },

  // Submit new activity
  submitActivity: async (input: ActivityInput) => {
    const { userId, isLogging } = get();
    if (!userId) return { success: false, error: 'User not initialized' };
    if (isLogging) return { success: false, error: 'Already logging activity' };

    // Validate input on client side
    const validation = validateActivityInput(input);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    set({ isLogging: true, error: null });

    // Calculate carbon on client for preview (server will validate again)
    const result = calculateCarbon(input);

    const { error: insertError } = await supabase.from('activity_logs').insert({
      user_id: userId,
      category: input.category,
      activity_type: input.activityType,
      value: input.value,
      unit: input.unit,
      carbon_kg: result.carbonKg,
      verification_ticket: input.verificationTicket || false,
    });

    set({ isLogging: false });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // Reload logs to get server-calculated values
    await get().loadLogs();

    return { success: true };
  },

  // Join a challenge room
  joinRoom: async (code: string) => {
    const { userId } = get();
    if (!userId) return { success: false, error: 'User not initialized' };

    // Find room by code
    const { data: room, error: roomError } = await supabase
      .from('challenge_rooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (roomError || !room) {
      return { success: false, error: 'Room not found or inactive' };
    }

    // Check if already joined
    const { data: existing } = await supabase
      .from('room_participants')
      .select('*')
      .eq('room_id', room.id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      set({ currentRoom: room as ChallengeRoom });
      await get().loadLeaderboard(room.id);
      return { success: true };
    }

    // Check participant count
    const { count } = await supabase
      .from('room_participants')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', room.id);

    if (count && count >= room.max_participants) {
      return { success: false, error: 'Room is full' };
    }

    // Join room
    const { error: joinError } = await supabase.from('room_participants').insert({
      room_id: room.id,
      user_id: userId,
    });

    if (joinError) {
      return { success: false, error: joinError.message };
    }

    set({ currentRoom: room as ChallengeRoom });
    await get().loadLeaderboard(room.id);

    return { success: true };
  },

  // Create a new challenge room
  createRoom: async (name: string, description?: string) => {
    const { userId } = get();
    if (!userId) return { success: false, error: 'User not initialized' };

    // Generate room code
    const code = 'WAR-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    const { data: room, error: createError } = await supabase
      .from('challenge_rooms')
      .insert({
        code,
        name,
        description,
        creator_id: userId,
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select()
      .single();

    if (createError) {
      return { success: false, error: createError.message };
    }

    // Auto-join as creator
    await supabase.from('room_participants').insert({
      room_id: room.id,
      user_id: userId,
    });

    set({ currentRoom: room as ChallengeRoom });
    await get().loadLeaderboard(room.id);

    return { success: true, code };
  },

  // Load leaderboard for a room
  loadLeaderboard: async (roomId: string) => {
    const { data, error } = await supabase.rpc('get_room_leaderboard', { p_room_id: roomId });

    if (error) {
      console.error('Leaderboard error:', error);
      return;
    }

    set({ leaderboard: (data as LeaderboardEntry[]) || [] });
  },

  // Set active view
  setActiveView: (view) => set({ activeView: view }),

  // Clear error
  clearError: () => set({ error: null }),
}));

// Local mock mode for development without Supabase connection
export const useMockMode = () => {
  return import.meta.env.VITE_SUPABASE_URL === undefined || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';
};

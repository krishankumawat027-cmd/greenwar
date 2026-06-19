import { create } from 'zustand';
import { calculateCarbon, validateActivityInput, type ActivityInput } from './calculations';

export type MockActivityLog = {
  id: string;
  user_id: string;
  category: 'transport' | 'food' | 'energy';
  activity_type: string;
  value: number;
  unit: string;
  carbon_kg: number;
  verification_ticket: boolean;
  logged_at: string;
  created_at: string;
};

export type MockLeaderboardEntry = {
  user_id: string;
  username: string;
  total_carbon: number;
  rank_position: number;
};

export type MockChallengeRoom = {
  id: string;
  code: string;
  name: string;
  description?: string;
  creator_id: string;
  start_date: string;
  end_date?: string;
  max_participants: number;
  is_active: boolean;
  participants: string[];
};

interface MockState {
  userId: string;
  username: string;
  logs: MockActivityLog[];
  rooms: MockChallengeRoom[];
  currentRoom: MockChallengeRoom | null;
  leaderboard: MockLeaderboardEntry[];

  initUser: (id: string, username: string) => void;
  submitActivity: (input: ActivityInput) => { success: boolean; error?: string };
  loadLogs: () => void;
  createRoom: (name: string, description?: string) => { success: boolean; code?: string; error?: string };
  joinRoom: (code: string) => { success: boolean; error?: string };
  loadLeaderboard: (roomId: string) => void;
}

// Pre-populated demo data
const demoLogs: MockActivityLog[] = [
  {
    id: '1',
    user_id: 'demo-user',
    category: 'transport',
    activity_type: 'car',
    value: 25,
    unit: 'km',
    carbon_kg: 4.5,
    verification_ticket: false,
    logged_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    user_id: 'demo-user',
    category: 'food',
    activity_type: 'vegan',
    value: 2,
    unit: 'meals',
    carbon_kg: 1.0,
    verification_ticket: false,
    logged_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    user_id: 'demo-user',
    category: 'energy',
    activity_type: 'electricity',
    value: 8,
    unit: 'kWh',
    carbon_kg: 6.8,
    verification_ticket: false,
    logged_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    user_id: 'demo-user',
    category: 'transport',
    activity_type: 'bus',
    value: 15,
    unit: 'km',
    carbon_kg: 1.2,
    verification_ticket: false,
    logged_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    user_id: 'demo-user',
    category: 'food',
    activity_type: 'meat_medium',
    value: 1,
    unit: 'meals',
    carbon_kg: 1.5,
    verification_ticket: false,
    logged_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
];

const demoRoom: MockChallengeRoom = {
  id: 'demo-room',
  code: 'WAR-DEMO',
  name: 'Eco Champions League',
  description: 'Weekly carbon footprint challenge - lowest emissions wins!',
  creator_id: 'demo-user',
  start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
  max_participants: 10,
  is_active: true,
  participants: ['demo-user', 'eco-warrior', 'green-panda', 'carbon-slayer'],
};

const demoLeaderboard: MockLeaderboardEntry[] = [
  { user_id: 'eco-warrior', username: 'eco_warrior', total_carbon: 8.2, rank_position: 1 },
  { user_id: 'green-panda', username: 'green_panda', total_carbon: 12.5, rank_position: 2 },
  { user_id: 'demo-user', username: 'eco_champion', total_carbon: 14.5, rank_position: 3 },
  { user_id: 'carbon-slayer', username: 'carbon_slayer', total_carbon: 18.7, rank_position: 4 },
];

export const useMockStore = create<MockState>((set, get) => ({
  userId: 'demo-user',
  username: 'eco_champion',
  logs: demoLogs,
  rooms: [demoRoom],
  currentRoom: null,
  leaderboard: [],

  initUser: (id, username) => set({ userId: id, username }),

  submitActivity: (input) => {
    const validation = validateActivityInput(input);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const result = calculateCarbon(input);
    const newLog: MockActivityLog = {
      id: Math.random().toString(36).substring(7),
      user_id: get().userId,
      category: input.category,
      activity_type: input.activityType,
      value: input.value,
      unit: input.unit,
      carbon_kg: result.carbonKg,
      verification_ticket: input.verificationTicket || false,
      logged_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    set((state) => ({ logs: [newLog, ...state.logs] }));
    return { success: true };
  },

  loadLogs: () => {
    // Already loaded
  },

  createRoom: (name, description) => {
    const code = 'WAR-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newRoom: MockChallengeRoom = {
      id: Math.random().toString(36).substring(7),
      code,
      name,
      description,
      creator_id: get().userId,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      max_participants: 10,
      is_active: true,
      participants: [get().userId],
    };

    set((state) => ({ rooms: [...state.rooms, newRoom], currentRoom: newRoom }));
    return { success: true, code };
  },

  joinRoom: (code) => {
    const room = get().rooms.find((r) => r.code === code.toUpperCase());
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    set({ currentRoom: room });
    get().loadLeaderboard(room.id);
    return { success: true };
  },

  loadLeaderboard: (roomId) => {
    if (roomId === 'demo-room') {
      set({ leaderboard: demoLeaderboard });
    } else {
      // Generate mock leaderboard for new room
      set({
        leaderboard: [
          { user_id: get().userId, username: get().username, total_carbon: get().logs.reduce((s, l) => s + l.carbon_kg, 0), rank_position: 1 },
        ],
      });
    }
  },
}));

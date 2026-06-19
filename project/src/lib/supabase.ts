import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type ActivityLog = {
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

export type ChallengeRoom = {
  id: string;
  code: string;
  name: string;
  description?: string;
  creator_id: string;
  start_date: string;
  end_date?: string;
  max_participants: number;
  is_active: boolean;
  created_at: string;
};

export type RoomParticipant = {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
};

export type LeaderboardEntry = {
  user_id: string;
  username: string;
  total_carbon: number;
  rank_position: number;
};

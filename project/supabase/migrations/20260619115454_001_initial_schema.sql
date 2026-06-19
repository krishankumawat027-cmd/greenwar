-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('transport', 'food', 'energy')),
  activity_type TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL CHECK (value > 0),
  unit TEXT NOT NULL,
  carbon_kg DECIMAL(10,3) NOT NULL,
  verification_ticket BOOLEAN DEFAULT FALSE,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge rooms table
CREATE TABLE challenge_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  max_participants INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room participants table
CREATE TABLE room_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES challenge_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Activity logs policies
CREATE POLICY "select_own_logs" ON activity_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_logs" ON activity_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_logs" ON activity_logs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_logs" ON activity_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Challenge rooms policies (public read, authenticated create)
CREATE POLICY "select_active_rooms" ON challenge_rooms FOR SELECT
  TO authenticated USING (is_active = TRUE OR auth.uid() = creator_id);
CREATE POLICY "insert_own_room" ON challenge_rooms FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "update_own_room" ON challenge_rooms FOR UPDATE
  TO authenticated USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "delete_own_room" ON challenge_rooms FOR DELETE
  TO authenticated USING (auth.uid() = creator_id);

-- Room participants policies
CREATE POLICY "select_room_participants" ON room_participants FOR SELECT
  TO authenticated USING (
    room_id IN (SELECT id FROM challenge_rooms WHERE is_active = TRUE)
    OR auth.uid() IN (SELECT user_id FROM room_participants WHERE room_id = room_participants.room_id)
  );
CREATE POLICY "insert_room_participant" ON room_participants FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_participation" ON room_participants FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_logged ON activity_logs(logged_at DESC);
CREATE INDEX idx_challenge_rooms_code ON challenge_rooms(code);
CREATE INDEX idx_room_participants_room ON room_participants(room_id);
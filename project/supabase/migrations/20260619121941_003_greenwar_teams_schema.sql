-- GreenWar rooms table
CREATE TABLE greenwars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(10) UNIQUE NOT NULL,
    title VARCHAR(100) DEFAULT 'GreenWar',
    description TEXT,
    creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    max_teams INTEGER DEFAULT 5,
    max_participants_per_team INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams inside a specific GreenWar
CREATE TABLE greenwar_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    greenwar_id UUID NOT NULL REFERENCES greenwars(id) ON DELETE CASCADE,
    team_name VARCHAR(50) NOT NULL,
    team_color VARCHAR(50) DEFAULT 'from-emerald-500 to-teal-600',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(greenwar_id, team_name)
);

-- Participants mapping with UPSERT support
CREATE TABLE greenwar_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    greenwar_id UUID NOT NULL REFERENCES greenwars(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES greenwar_teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    -- Constraint: user can only be on ONE team per GreenWar
    CONSTRAINT unique_user_per_war UNIQUE (greenwar_id, user_id)
);

-- Enable RLS
ALTER TABLE greenwars ENABLE ROW LEVEL SECURITY;
ALTER TABLE greenwar_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE greenwar_participants ENABLE ROW LEVEL SECURITY;

-- GreenWars policies
CREATE POLICY "select_active_greenwars" ON greenwars FOR SELECT
  TO authenticated USING (is_active = TRUE OR auth.uid() = creator_id);
CREATE POLICY "insert_greenwar" ON greenwars FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "update_own_greenwar" ON greenwars FOR UPDATE
  TO authenticated USING (auth.uid() = creator_id);

-- Teams policies (public read for active wars)
CREATE POLICY "select_teams" ON greenwar_teams FOR SELECT
  TO authenticated USING (
    greenwar_id IN (SELECT id FROM greenwars WHERE is_active = TRUE)
    OR greenwar_id IN (SELECT id FROM greenwars WHERE creator_id = auth.uid())
  );
CREATE POLICY "insert_team" ON greenwar_teams FOR INSERT
  TO authenticated WITH CHECK (
    greenwar_id IN (SELECT id FROM greenwars WHERE creator_id = auth.uid())
  );

-- Participants policies
CREATE POLICY "select_participants" ON greenwar_participants FOR SELECT
  TO authenticated USING (
    greenwar_id IN (SELECT id FROM greenwars WHERE is_active = TRUE)
  );
CREATE POLICY "insert_participant" ON greenwar_participants FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_participation" ON greenwar_participants FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_participation" ON greenwar_participants FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Function to calculate team score
CREATE OR REPLACE FUNCTION calculate_team_score(p_team_id UUID)
RETURNS DECIMAL(10,3) AS $$
DECLARE
  team_score DECIMAL(10,3);
BEGIN
  -- Sum carbon_kg from activity_logs for all team members
  -- Lower carbon = better score, so we use inverse for "points"
  SELECT COALESCE(SUM(
    CASE 
      WHEN al.carbon_kg < 5 THEN 100 - (al.carbon_kg * 10)
      WHEN al.carbon_kg < 10 THEN 50 - (al.carbon_kg * 5)
      ELSE 10
    END
  ), 0)
  INTO team_score
  FROM activity_logs al
  JOIN greenwar_participants gp ON al.user_id = gp.user_id
  WHERE gp.team_id = p_team_id;
  
  RETURN team_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get GreenWar leaderboard
CREATE OR REPLACE FUNCTION get_greenwar_leaderboard(p_greenwar_id UUID)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  team_color TEXT,
  member_count BIGINT,
  team_score DECIMAL(10,3),
  rank_position INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH team_stats AS (
    SELECT 
      gt.id as team_id,
      gt.team_name,
      gt.team_color,
      COUNT(gp.id) as member_count,
      calculate_team_score(gt.id) as score
    FROM greenwar_teams gt
    LEFT JOIN greenwar_participants gp ON gt.id = gp.team_id
    WHERE gt.greenwar_id = p_greenwar_id
    GROUP BY gt.id, gt.team_name, gt.team_color
  )
  SELECT 
    ts.team_id,
    ts.team_name::TEXT,
    ts.team_color::TEXT,
    ts.member_count,
    ts.score as team_score,
    RANK() OVER (ORDER BY ts.score DESC) as rank_position
  FROM team_stats ts
  ORDER BY ts.score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX idx_greenwars_code ON greenwars(room_code);
CREATE INDEX idx_greenwar_teams_war ON greenwar_teams(greenwar_id);
CREATE INDEX idx_greenwar_participants_war ON greenwar_participants(greenwar_id);
CREATE INDEX idx_greenwar_participants_user ON greenwar_participants(user_id);
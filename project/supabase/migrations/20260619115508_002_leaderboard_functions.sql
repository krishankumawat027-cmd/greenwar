-- Function to calculate user's total carbon footprint
CREATE OR REPLACE FUNCTION calculate_user_carbon(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS DECIMAL(10,3) AS $$
DECLARE
  total_carbon DECIMAL(10,3);
BEGIN
  SELECT COALESCE(SUM(carbon_kg), 0)
  INTO total_carbon
  FROM activity_logs
  WHERE user_id = p_user_id
    AND (p_start_date IS NULL OR logged_at >= p_start_date)
    AND (p_end_date IS NULL OR logged_at <= p_end_date);
  
  RETURN total_carbon;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get leaderboard for a room
CREATE OR REPLACE FUNCTION get_room_leaderboard(p_room_id UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  total_carbon DECIMAL(10,3),
  rank_position INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH user_totals AS (
    SELECT 
      p.id as user_id,
      p.username,
      COALESCE(SUM(a.carbon_kg), 0) as total_carbon
    FROM profiles p
    JOIN room_participants rp ON p.id = rp.user_id
    LEFT JOIN activity_logs a ON p.id = a.user_id
      AND a.logged_at >= (SELECT start_date FROM challenge_rooms WHERE id = p_room_id)
    WHERE rp.room_id = p_room_id
    GROUP BY p.id, p.username
  )
  SELECT 
    ut.user_id,
    ut.username,
    ut.total_carbon,
    RANK() OVER (ORDER BY ut.total_carbon ASC) as rank_position
  FROM user_totals ut
  ORDER BY ut.total_carbon ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
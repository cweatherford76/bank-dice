-- Bank Dice Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Games table: Core game state
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  join_code VARCHAR(8) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'setup' CHECK (status IN ('setup', 'active', 'completed')),
  current_round INT DEFAULT 1,
  bank_total INT DEFAULT 0,
  roll_count INT DEFAULT 0,
  consecutive_doubles INT DEFAULT 0,
  banker_session_token VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Game Options
  opt_round_count INT DEFAULT 20,
  opt_single_bank_per_roll BOOLEAN DEFAULT FALSE,
  opt_escalating_bank BOOLEAN DEFAULT FALSE,
  opt_double_each_lap BOOLEAN DEFAULT FALSE,
  opt_snake_eyes_bonus BOOLEAN DEFAULT FALSE,
  opt_lucky_11 BOOLEAN DEFAULT FALSE,
  opt_escalating_doubles BOOLEAN DEFAULT FALSE,
  opt_minimum_bank INT DEFAULT 0,
  opt_bank_delay BOOLEAN DEFAULT FALSE,
  opt_safe_zone_rolls INT DEFAULT 3,
  opt_double_down BOOLEAN DEFAULT FALSE
);

-- Players table: Game participants (entered by Banker)
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_order INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  total_score INT DEFAULT 0,
  current_round_banked INT,
  has_banked BOOLEAN DEFAULT FALSE,
  bank_pending BOOLEAN DEFAULT FALSE,
  has_used_double_down BOOLEAN DEFAULT FALSE,
  double_down_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rolls table: Dice roll history
CREATE TABLE rolls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  roll_number INT NOT NULL,
  die_1 INT NOT NULL CHECK (die_1 BETWEEN 1 AND 6),
  die_2 INT NOT NULL CHECK (die_2 BETWEEN 1 AND 6),
  result_type VARCHAR(20) CHECK (result_type IN ('normal', 'double', 'seven', 'bust')),
  bank_after INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Round History table: Score progression per round
CREATE TABLE round_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  points_earned INT DEFAULT 0,
  banked_at_roll INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_games_join_code ON games(join_code);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_rolls_game_id ON rolls(game_id);
CREATE INDEX idx_rolls_game_round ON rolls(game_id, round_number);
CREATE INDEX idx_round_history_game_id ON round_history(game_id);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all operations for now (no auth required)
-- Games: Anyone can read, create, and update
CREATE POLICY "Games are viewable by everyone" ON games FOR SELECT USING (true);
CREATE POLICY "Games can be created by anyone" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Games can be updated by anyone" ON games FOR UPDATE USING (true);

-- Players: Same as games
CREATE POLICY "Players are viewable by everyone" ON players FOR SELECT USING (true);
CREATE POLICY "Players can be created by anyone" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Players can be updated by anyone" ON players FOR UPDATE USING (true);
CREATE POLICY "Players can be deleted by anyone" ON players FOR DELETE USING (true);

-- Rolls: Same as games
CREATE POLICY "Rolls are viewable by everyone" ON rolls FOR SELECT USING (true);
CREATE POLICY "Rolls can be created by anyone" ON rolls FOR INSERT WITH CHECK (true);

-- Round History: Same as games
CREATE POLICY "Round history is viewable by everyone" ON round_history FOR SELECT USING (true);
CREATE POLICY "Round history can be created by anyone" ON round_history FOR INSERT WITH CHECK (true);

-- Enable Realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE rolls;
ALTER PUBLICATION supabase_realtime ADD TABLE round_history;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for games updated_at
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

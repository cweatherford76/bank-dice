-- Add theme option to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS opt_theme VARCHAR(20) DEFAULT 'modern';

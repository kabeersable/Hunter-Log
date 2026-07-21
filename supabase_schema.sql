-- ==========================================
-- HUNTER LOG: SUPABASE POSTGRES SCHEMA & RLS
-- Run this SQL script in your Supabase SQL Editor
-- ==========================================

-- Clean up existing tables to prevent schema conflicts
DROP TABLE IF EXISTS public.milestones CASCADE;
DROP TABLE IF EXISTS public.daily_log_entries CASCADE;
DROP TABLE IF EXISTS public.routine_tasks CASCADE;
DROP TABLE IF EXISTS public.hunters CASCADE;

-- 1. HUNTERS TABLE
CREATE TABLE public.hunters (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  level INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  xp_to_next_level INT NOT NULL DEFAULT 120,
  rank TEXT NOT NULL DEFAULT 'E',
  streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  coins INT NOT NULL DEFAULT 0,
  stats JSONB NOT NULL DEFAULT '{"STR": 10, "VIT": 10, "INT": 10, "PER": 10, "WIL": 10}'::jsonb,
  smoke_free_streak INT NOT NULL DEFAULT 0,
  smoke_free_longest INT NOT NULL DEFAULT 0,
  penalty_zone_active BOOLEAN NOT NULL DEFAULT FALSE,
  penalty_zone_expires_at TEXT,
  rank_frozen_until TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ROUTINE TASKS TABLE
CREATE TABLE public.routine_tasks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'main',
  schedule_days JSONB NOT NULL DEFAULT '"everyday"'::jsonb,
  stat TEXT,
  difficulty TEXT NOT NULL DEFAULT 'E',
  target TEXT NOT NULL,
  time_slot TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TEXT NOT NULL
);

-- 3. DAILY LOG ENTRIES TABLE
CREATE TABLE public.daily_log_entries (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  routine_task_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  proof TEXT,
  completed_at TEXT
);

-- 4. MILESTONES TABLE
CREATE TABLE public.milestones (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  cadence TEXT NOT NULL DEFAULT 'monthly',
  stat TEXT,
  xp_reward INT DEFAULT 50,
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  unlocks_after_milestone_id TEXT,
  "order" INT
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Only matching auth.uid() = user_id can read/write
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.hunters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for matching auth.uid() = user_id
CREATE POLICY "Hunters user isolation policy" ON public.hunters
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Routine tasks user isolation policy" ON public.routine_tasks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Daily log entries user isolation policy" ON public.daily_log_entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Milestones user isolation policy" ON public.milestones
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

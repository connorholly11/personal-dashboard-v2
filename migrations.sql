-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habits table
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  purpose TEXT,
  history JSONB
);

-- Workouts table
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  exercises JSONB
);

-- DailyFoods table
CREATE TABLE daily_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  foods JSONB
);

-- MeditationSessions table
CREATE TABLE meditation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  duration INTEGER NOT NULL,
  type TEXT NOT NULL,
  notes TEXT
);

-- Relationships table
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recordings table
CREATE TABLE recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  audio_url TEXT,
  transcript TEXT
);

-- LinksPapers table
CREATE TABLE links_papers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  url TEXT,
  attachment_url TEXT,
  description TEXT,
  categories TEXT[]
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE links_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for each table
CREATE POLICY "Users can only access their own data" ON habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own data" ON workouts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own data" ON daily_foods FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own data" ON meditation_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own data" ON relationships FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own data" ON recordings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own data" ON links_papers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own data" ON categories FOR ALL USING (auth.uid() = user_id);
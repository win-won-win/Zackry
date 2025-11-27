/*
  # Create Year Forecast Schema

  ## Overview
  This migration creates the database structure for the year forecast feature.
  Users can project their budget over 12 months and add future events (one-time expenses).

  ## New Tables

  ### `year_forecasts`
  Stores the base forecast information for each user.
  
  Columns:
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `current_balance` (integer) - Current total balance in JPY
  - `base_income` (integer) - Monthly income from budget
  - `base_fixed_total` (integer) - Monthly fixed costs from budget
  - `forecast_months` (integer) - Number of months to forecast (default 12)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `future_events`
  Stores one-time future expenses for specific months.
  
  Columns:
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `year_forecast_id` (uuid, foreign key) - References year_forecasts
  - `label` (text) - Event name (e.g., "旅行", "プレゼント")
  - `year` (integer) - Year of the event
  - `month` (integer) - Month of the event (1-12)
  - `amount` (integer) - Cost in JPY
  - `category` (text) - Event category: 'travel', 'gift', 'hobby', 'life', 'other'
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Row Level Security (RLS) enabled on both tables
  - Users can only access their own forecast data
  - Authenticated users only

  ## Policies
  ### year_forecasts table
  1. SELECT: Users can view their own forecasts
  2. INSERT: Users can create their own forecasts
  3. UPDATE: Users can update their own forecasts
  4. DELETE: Users can delete their own forecasts

  ### future_events table
  1. SELECT: Users can view their own events
  2. INSERT: Users can create their own events
  3. UPDATE: Users can update their own events
  4. DELETE: Users can delete their own events
*/

-- Create year_forecasts table
CREATE TABLE IF NOT EXISTS year_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_balance integer NOT NULL DEFAULT 0,
  base_income integer NOT NULL DEFAULT 0,
  base_fixed_total integer NOT NULL DEFAULT 0,
  forecast_months integer NOT NULL DEFAULT 12,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create future_events table
CREATE TABLE IF NOT EXISTS future_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year_forecast_id uuid NOT NULL REFERENCES year_forecasts(id) ON DELETE CASCADE,
  label text NOT NULL,
  year integer NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  amount integer NOT NULL,
  category text NOT NULL DEFAULT 'other',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE year_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE future_events ENABLE ROW LEVEL SECURITY;

-- year_forecasts policies
CREATE POLICY "Users can view own forecasts"
  ON year_forecasts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own forecasts"
  ON year_forecasts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forecasts"
  ON year_forecasts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own forecasts"
  ON year_forecasts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- future_events policies
CREATE POLICY "Users can view own events"
  ON future_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own events"
  ON future_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON future_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON future_events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX year_forecasts_user_id_idx ON year_forecasts(user_id);
CREATE INDEX future_events_user_id_idx ON future_events(user_id);
CREATE INDEX future_events_year_forecast_id_idx ON future_events(year_forecast_id);
CREATE INDEX future_events_year_month_idx ON future_events(year, month);

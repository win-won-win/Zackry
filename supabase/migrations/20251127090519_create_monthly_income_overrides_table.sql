/*
  # Create monthly income overrides table

  1. New Tables
    - `monthly_income_overrides`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `year` (integer, the year for this income override)
      - `month` (integer, the month 1-12 for this income override)
      - `income` (integer, the income amount for this specific month)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, update timestamp)

  2. Security
    - Enable RLS on `monthly_income_overrides` table
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to insert their own data
    - Add policy for authenticated users to update their own data
    - Add policy for authenticated users to delete their own data

  3. Constraints
    - Unique constraint on (user_id, year, month) to prevent duplicates
    - Check constraint to ensure month is between 1 and 12
*/

CREATE TABLE IF NOT EXISTS monthly_income_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year integer NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  income integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, year, month)
);

ALTER TABLE monthly_income_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own monthly income overrides"
  ON monthly_income_overrides
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monthly income overrides"
  ON monthly_income_overrides
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly income overrides"
  ON monthly_income_overrides
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own monthly income overrides"
  ON monthly_income_overrides
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
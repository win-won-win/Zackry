/*
  # Create Household Budget Schema

  ## Overview
  This migration creates the database structure for the "2-minute household budget" feature.
  Users answer 10 questions to quickly understand their income vs. fixed costs balance.

  ## New Tables

  ### `household_budgets`
  Stores user's monthly budget breakdown including income and fixed costs.
  
  Columns:
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `monthly_income` (integer) - Monthly take-home income in JPY
  - `rent` (integer) - Rent or mortgage payment per month
  - `utilities` (integer) - Electricity, gas, water per month
  - `internet` (integer) - Home internet/WiFi per month
  - `mobile` (integer) - Mobile phone costs per month
  - `car` (integer) - Car-related costs (loan, parking, gas) per month
  - `insurance` (integer) - Life/health insurance per month
  - `kids` (integer) - Kids-related costs (school, daycare, etc) per month
  - `savings` (integer) - Automatic savings/investments per month
  - `subscriptions_total` (integer) - Total subscription costs per month
  - `mobile_carriers` (text[]) - Array of mobile carrier IDs used
  - `has_car` (boolean) - Whether user has a car
  - `has_kids` (boolean) - Whether user has kids
  - `subscriptions_mode` (text) - 'rough' or 'detailed'
  - `completed_wizard` (boolean) - Whether initial 10-question flow is completed
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Row Level Security (RLS) enabled
  - Users can only access their own budget data
  - Authenticated users only

  ## Policies
  1. SELECT: Users can view their own budget
  2. INSERT: Users can create their own budget
  3. UPDATE: Users can update their own budget
  4. DELETE: Users can delete their own budget
*/

-- Create household_budgets table
CREATE TABLE IF NOT EXISTS household_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_income integer NOT NULL DEFAULT 0,
  rent integer NOT NULL DEFAULT 0,
  utilities integer NOT NULL DEFAULT 0,
  internet integer NOT NULL DEFAULT 0,
  mobile integer NOT NULL DEFAULT 0,
  car integer NOT NULL DEFAULT 0,
  insurance integer NOT NULL DEFAULT 0,
  kids integer NOT NULL DEFAULT 0,
  savings integer NOT NULL DEFAULT 0,
  subscriptions_total integer NOT NULL DEFAULT 0,
  mobile_carriers text[] DEFAULT '{}',
  has_car boolean NOT NULL DEFAULT false,
  has_kids boolean NOT NULL DEFAULT false,
  subscriptions_mode text NOT NULL DEFAULT 'rough',
  completed_wizard boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE household_budgets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own budget"
  ON household_budgets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own budget"
  ON household_budgets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget"
  ON household_budgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget"
  ON household_budgets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX household_budgets_user_id_idx ON household_budgets(user_id);

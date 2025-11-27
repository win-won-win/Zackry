/*
  # Create Subscription Tracking Schema

  ## Overview
  This migration creates the core database structure for tracking user subscriptions
  and Gmail-scanned subscription candidates.

  ## New Tables
  
  ### `subscriptions`
  Stores confirmed subscription records that users are actively tracking.
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `name` (text) - Service name (e.g., "ChatGPT", "Netflix")
  - `category` (text) - Classification: 'work', 'personal', 'other'
  - `amount` (integer) - Cost in smallest currency unit (e.g., yen)
  - `currency` (text) - Currency code, default 'JPY'
  - `cycle` (text) - Billing frequency: 'monthly', 'yearly', 'one_time', 'other'
  - `first_billing_date` (date) - Initial charge date
  - `next_billing_date` (date) - Next expected charge date
  - `is_active` (boolean) - Active status, default true
  - `source` (text) - Origin: 'gmail' or 'manual'
  - `notes` (text) - User notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `subscription_candidates`
  Stores potential subscriptions extracted from Gmail for user review.
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `gmail_message_id` (text) - Gmail message identifier
  - `from_address` (text) - Email sender address
  - `subject` (text) - Email subject line
  - `detected_amount` (integer) - Extracted amount
  - `detected_currency` (text) - Extracted currency
  - `detected_cycle` (text) - Detected billing cycle
  - `status` (text) - Review status: 'pending', 'accepted', 'rejected'
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Row Level Security (RLS) enabled on both tables
  - Users can only access their own subscription data
  - Authenticated users only

  ## Policies
  ### subscriptions table
  1. SELECT: Users can view their own subscriptions
  2. INSERT: Users can create their own subscriptions
  3. UPDATE: Users can update their own subscriptions
  4. DELETE: Users can delete their own subscriptions

  ### subscription_candidates table
  1. SELECT: Users can view their own candidates
  2. INSERT: Users can create their own candidates
  3. UPDATE: Users can update their own candidates
  4. DELETE: Users can delete their own candidates
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'JPY',
  cycle text NOT NULL DEFAULT 'monthly',
  first_billing_date date NOT NULL,
  next_billing_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  source text NOT NULL DEFAULT 'manual',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create subscription_candidates table
CREATE TABLE IF NOT EXISTS subscription_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gmail_message_id text NOT NULL,
  from_address text NOT NULL,
  subject text NOT NULL,
  detected_amount integer,
  detected_currency text DEFAULT 'JPY',
  detected_cycle text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_candidates ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Subscription candidates policies
CREATE POLICY "Users can view own candidates"
  ON subscription_candidates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own candidates"
  ON subscription_candidates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own candidates"
  ON subscription_candidates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own candidates"
  ON subscription_candidates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_next_billing_date_idx ON subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS subscription_candidates_user_id_idx ON subscription_candidates(user_id);
CREATE INDEX IF NOT EXISTS subscription_candidates_status_idx ON subscription_candidates(status);
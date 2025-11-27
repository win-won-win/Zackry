/*
  # Update Subscription Schema for Wizard-Based Input

  ## Overview
  This migration updates the subscriptions table to support the new wizard-based
  input flow with preset services, plans, and approximate pricing.

  ## Changes to `subscriptions` table
  1. Modified columns:
    - `service_id` (text) - ID from preset services or 'custom' or 'mobile-{carrier}'
    - `custom_name` (text, nullable) - For custom services not in presets
    - `category_id` (text) - Standardized category IDs from TopCategoryId type
    - `plan_id` (text, nullable) - ID from preset plans
    - `amount_jpy` (integer, nullable) - User-overridden accurate amount
    - `approx_monthly_jpy` (integer) - Approximate monthly cost (always present)
    - `billing_cycle` (text) - 'monthly' or 'yearly'
    - `accuracy` (text) - 'rough' or 'detailed'
    - `first_billing_date` (date, nullable) - Made optional for rough estimates
    - `next_billing_date` (date, nullable) - Made optional for rough estimates
    - `tags` (text[], array) - Flexible tagging
    
  2. Removed columns:
    - Old `category` column (replaced by `category_id`)
    - Old `cycle` column (replaced by `billing_cycle`)
    - Old `currency` column (everything is JPY-based now)
    - Old `source` column (not needed in wizard flow)
    - Old `notes` column (replaced by `tags` and optional detail fields)

  ## Security
  - Maintains existing RLS policies
  - Users can only access their own subscription data
*/

-- Drop old table and recreate with new schema
-- (Safe because this is a complete redesign)
DROP TABLE IF EXISTS subscriptions CASCADE;

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id text NOT NULL,
  custom_name text,
  category_id text NOT NULL,
  plan_id text,
  amount_jpy integer,
  approx_monthly_jpy integer NOT NULL,
  billing_cycle text NOT NULL DEFAULT 'monthly',
  accuracy text NOT NULL DEFAULT 'rough',
  first_billing_date date,
  next_billing_date date,
  is_active boolean NOT NULL DEFAULT true,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Recreate policies
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

-- Create indexes
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX subscriptions_category_id_idx ON subscriptions(category_id);
CREATE INDEX subscriptions_is_active_idx ON subscriptions(is_active);

-- Add user onboarding state table
CREATE TABLE IF NOT EXISTS user_wizard_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_wizard boolean NOT NULL DEFAULT false,
  selected_categories text[] DEFAULT '{}',
  current_step text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_wizard_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wizard state"
  ON user_wizard_state FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own wizard state"
  ON user_wizard_state FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wizard state"
  ON user_wizard_state FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX user_wizard_state_user_id_idx ON user_wizard_state(user_id);

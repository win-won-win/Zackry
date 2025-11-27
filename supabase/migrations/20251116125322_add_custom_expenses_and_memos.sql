/*
  # Add custom expenses and memo fields

  1. New Tables
    - `custom_expenses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text) - Name of the custom expense
      - `amount` (integer) - Monthly amount in JPY
      - `memo` (text, nullable) - Optional note/description
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to existing tables
    - Add memo columns to `household_budgets` for each category:
      - `rent_memo`, `utilities_memo`, `internet_memo`, `mobile_memo`
      - `car_memo`, `insurance_memo`, `kids_memo`, `savings_memo`, `subscriptions_memo`

  3. Security
    - Enable RLS on `custom_expenses` table
    - Add policies for authenticated users to manage their own expenses
*/

-- Create custom_expenses table
CREATE TABLE IF NOT EXISTS custom_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  memo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE custom_expenses ENABLE ROW LEVEL SECURITY;

-- Policies for custom_expenses
CREATE POLICY "Users can view own expenses"
  ON custom_expenses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON custom_expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON custom_expenses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON custom_expenses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add memo fields to household_budgets
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_budgets' AND column_name = 'rent_memo') THEN
    ALTER TABLE household_budgets ADD COLUMN rent_memo text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_budgets' AND column_name = 'utilities_memo') THEN
    ALTER TABLE household_budgets ADD COLUMN utilities_memo text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_budgets' AND column_name = 'internet_memo') THEN
    ALTER TABLE household_budgets ADD COLUMN internet_memo text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_budgets' AND column_name = 'mobile_memo') THEN
    ALTER TABLE household_budgets ADD COLUMN mobile_memo text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_budgets' AND column_name = 'car_memo') THEN
    ALTER TABLE household_budgets ADD COLUMN car_memo text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_budgets' AND column_name = 'insurance_memo') THEN
    ALTER TABLE household_budgets ADD COLUMN insurance_memo text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_budgets' AND column_name = 'kids_memo') THEN
    ALTER TABLE household_budgets ADD COLUMN kids_memo text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_budgets' AND column_name = 'savings_memo') THEN
    ALTER TABLE household_budgets ADD COLUMN savings_memo text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_budgets' AND column_name = 'subscriptions_memo') THEN
    ALTER TABLE household_budgets ADD COLUMN subscriptions_memo text;
  END IF;
END $$;
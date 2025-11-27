/*
  # Add reset count to household budgets

  1. Changes
    - Add `reset_count` column to `household_budgets` table
      - Tracks how many times a user has reset their budget
      - Defaults to 0
      - Will be used for free tier limits (e.g., max 3 resets)
  
  2. Notes
    - This is preparation for future free tier restrictions
    - Currently only tracking the count, no enforcement yet
*/

-- Add reset_count column to household_budgets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_budgets' AND column_name = 'reset_count'
  ) THEN
    ALTER TABLE household_budgets ADD COLUMN reset_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;
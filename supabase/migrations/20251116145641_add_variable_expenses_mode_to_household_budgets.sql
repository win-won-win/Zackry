/*
  # Add variable expenses mode to household budgets

  1. Changes
    - Add `variable_expenses_mode` column to `household_budgets` table
      - Values: 'rough' (default) or 'detailed'
      - When 'detailed', the system will use individual expense items instead of the total

  2. Notes
    - This allows users to choose between quick estimation or detailed tracking
    - Similar to subscriptions_mode functionality
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_budgets' AND column_name = 'variable_expenses_mode'
  ) THEN
    ALTER TABLE household_budgets ADD COLUMN variable_expenses_mode text DEFAULT 'rough';
  END IF;
END $$;
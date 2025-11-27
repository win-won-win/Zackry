/*
  # Add mode fields for all budget categories

  1. Changes
    - Add mode columns for each budget category to `household_budgets` table
    - Each column stores 'rough' (default) or 'detailed'
    - When 'detailed', the system will use individual items from category_expense_items

  2. New Columns
    - rent_mode
    - utilities_mode
    - internet_mode
    - mobile_mode
    - car_mode
    - insurance_mode
    - kids_mode
    - savings_mode
    - debt_repayment_mode
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_budgets' AND column_name = 'rent_mode'
  ) THEN
    ALTER TABLE household_budgets ADD COLUMN rent_mode text DEFAULT 'rough';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_budgets' AND column_name = 'utilities_mode'
  ) THEN
    ALTER TABLE household_budgets ADD COLUMN utilities_mode text DEFAULT 'rough';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_budgets' AND column_name = 'internet_mode'
  ) THEN
    ALTER TABLE household_budgets ADD COLUMN internet_mode text DEFAULT 'rough';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_budgets' AND column_name = 'mobile_mode'
  ) THEN
    ALTER TABLE household_budgets ADD COLUMN mobile_mode text DEFAULT 'rough';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_budgets' AND column_name = 'car_mode'
  ) THEN
    ALTER TABLE household_budgets ADD COLUMN car_mode text DEFAULT 'rough';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_budgets' AND column_name = 'insurance_mode'
  ) THEN
    ALTER TABLE household_budgets ADD COLUMN insurance_mode text DEFAULT 'rough';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_budgets' AND column_name = 'kids_mode'
  ) THEN
    ALTER TABLE household_budgets ADD COLUMN kids_mode text DEFAULT 'rough';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_budgets' AND column_name = 'savings_mode'
  ) THEN
    ALTER TABLE household_budgets ADD COLUMN savings_mode text DEFAULT 'rough';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_budgets' AND column_name = 'debt_repayment_mode'
  ) THEN
    ALTER TABLE household_budgets ADD COLUMN debt_repayment_mode text DEFAULT 'rough';
  END IF;
END $$;
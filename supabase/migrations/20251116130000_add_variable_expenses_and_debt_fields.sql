/*
  # Add Variable Expenses and Debt Repayment Fields

  ## Overview
  This migration adds fields for tracking variable expenses (food, entertainment, games, etc.)
  and debt repayment (student loans, personal loans, etc.) to the household budget.

  ## Changes to `household_budgets` table

  ### New Columns
  1. `variable_expenses` (integer) - Monthly variable costs like food, entertainment, subscriptions, gaming, etc.
     - Default: 0
     - Represents flexible spending that varies month to month

  2. `variable_expenses_memo` (text, nullable) - Optional notes about variable expenses

  3. `debt_repayment` (integer) - Monthly debt payments like student loans, personal loans, car loans, etc.
     - Default: 0
     - Fixed monthly payment obligations

  4. `debt_repayment_memo` (text, nullable) - Optional notes about debt repayments

  ## Notes
  - These fields help users get a more complete picture of their monthly spending
  - Variable expenses represent flexible costs that can be adjusted
  - Debt repayment represents fixed obligations that must be paid
*/

-- Add variable expenses field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_budgets' AND column_name = 'variable_expenses'
  ) THEN
    ALTER TABLE household_budgets ADD COLUMN variable_expenses integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add variable expenses memo field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_budgets' AND column_name = 'variable_expenses_memo'
  ) THEN
    ALTER TABLE household_budgets ADD COLUMN variable_expenses_memo text;
  END IF;
END $$;

-- Add debt repayment field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_budgets' AND column_name = 'debt_repayment'
  ) THEN
    ALTER TABLE household_budgets ADD COLUMN debt_repayment integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add debt repayment memo field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_budgets' AND column_name = 'debt_repayment_memo'
  ) THEN
    ALTER TABLE household_budgets ADD COLUMN debt_repayment_memo text;
  END IF;
END $$;

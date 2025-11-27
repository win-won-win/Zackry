/*
  # Add type field to future_events table

  1. Changes
    - Add `type` column to `future_events` table with values 'income' or 'expense'
    - Default value is 'expense' for backward compatibility
    
  2. Security
    - No RLS changes needed - existing policies cover the new column
*/ 

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'future_events' AND column_name = 'type'
  ) THEN
    ALTER TABLE future_events ADD COLUMN type text NOT NULL DEFAULT 'expense' CHECK (type IN ('income', 'expense'));
  END IF;
END $$;
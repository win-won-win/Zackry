/*
  # Create category expense items table

  1. New Tables
    - `category_expense_items`
      - `id` (uuid, primary key) - Unique identifier for the expense item
      - `user_id` (uuid, foreign key) - References auth.users
      - `category` (text) - Category name (rent, utilities, internet, mobile, car, insurance, kids, savings, debt_repayment)
      - `title` (text) - Name/description of the item
      - `amount` (integer) - Amount in JPY
      - `created_at` (timestamptz) - When the item was created
      - `updated_at` (timestamptz) - When the item was last updated

  2. Security
    - Enable RLS on `category_expense_items` table
    - Add policies for authenticated users to manage their own items

  3. Notes
    - This allows all budget categories to have detailed item breakdowns
    - Similar to variable_expense_items but more generic
*/

CREATE TABLE IF NOT EXISTS category_expense_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE category_expense_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own category expense items"
  ON category_expense_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own category expense items"
  ON category_expense_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own category expense items"
  ON category_expense_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own category expense items"
  ON category_expense_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS category_expense_items_user_id_idx ON category_expense_items(user_id);
CREATE INDEX IF NOT EXISTS category_expense_items_category_idx ON category_expense_items(category);
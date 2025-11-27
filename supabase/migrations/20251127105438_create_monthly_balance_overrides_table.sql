/*
  # 月別残高上書きテーブルの作成

  1. 新しいテーブル
    - `monthly_balance_overrides`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `year` (integer) - 年
      - `month` (integer) - 月
      - `balance` (integer) - 上書きする残高
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. セキュリティ
    - RLSを有効化
    - ユーザーは自分のデータのみアクセス可能
    -ユーザーは自分のデータの作成、読み取り、更新、削除が可能
*/

CREATE TABLE IF NOT EXISTS monthly_balance_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year integer NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  balance integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, year, month)
);

ALTER TABLE monthly_balance_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own balance overrides"
  ON monthly_balance_overrides
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own balance overrides"
  ON monthly_balance_overrides
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own balance overrides"
  ON monthly_balance_overrides
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own balance overrides"
  ON monthly_balance_overrides
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_monthly_balance_overrides_user_year_month 
  ON monthly_balance_overrides(user_id, year, month);

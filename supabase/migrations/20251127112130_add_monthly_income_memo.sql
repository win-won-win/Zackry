/*
  # 平均手取りメモフィールドの追加

  1. 変更内容
    - `household_budgets` テーブルに `monthly_income_memo` カラムを追加
      - テキスト型、NULL許可
      - ユーザーが平均手取りに関するメモを保存できるようにする

  2. セキュリティ
    - 既存のRLSポリシーが適用される
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_budgets' AND column_name = 'monthly_income_memo'
  ) THEN
    ALTER TABLE household_budgets ADD COLUMN monthly_income_memo text;
  END IF;
END $$;

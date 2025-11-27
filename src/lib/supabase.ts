import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

import { TopCategoryId } from '../data/presets';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Subscription = {
  id: string;
  user_id: string;
  service_id: string;
  custom_name: string | null;
  category_id: TopCategoryId;
  plan_id: string | null;
  amount_jpy: number | null;
  approx_monthly_jpy: number;
  billing_cycle: 'monthly' | 'yearly';
  accuracy: 'rough' | 'detailed';
  first_billing_date: string | null;
  next_billing_date: string | null;
  is_active: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type SubscriptionCandidate = {
  id: string;
  user_id: string;
  gmail_message_id: string;
  from_address: string;
  subject: string;
  detected_amount: number | null;
  detected_currency: string | null;
  detected_cycle: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
};

export type UserWizardState = {
  id: string;
  user_id: string;
  completed_wizard: boolean;
  selected_categories: string[];
  current_step: string | null;
  created_at: string;
  updated_at: string;
};

export type HouseholdBudget = {
  id: string;
  user_id: string;
  monthly_income: number;
  rent: number;
  utilities: number;
  internet: number;
  mobile: number;
  car: number;
  insurance: number;
  kids: number;
  savings: number;
  subscriptions_total: number;
  variable_expenses: number;
  debt_repayment: number;
  mobile_carriers: string[];
  has_car: boolean;
  has_kids: boolean;
  subscriptions_mode: 'rough' | 'detailed';
  variable_expenses_mode: 'rough' | 'detailed';
  rent_mode: 'rough' | 'detailed';
  utilities_mode: 'rough' | 'detailed';
  internet_mode: 'rough' | 'detailed';
  mobile_mode: 'rough' | 'detailed';
  car_mode: 'rough' | 'detailed';
  insurance_mode: 'rough' | 'detailed';
  kids_mode: 'rough' | 'detailed';
  savings_mode: 'rough' | 'detailed';
  debt_repayment_mode: 'rough' | 'detailed';
  completed_wizard: boolean;
  reset_count: number;
  rent_memo: string | null;
  utilities_memo: string | null;
  internet_memo: string | null;
  mobile_memo: string | null;
  car_memo: string | null;
  insurance_memo: string | null;
  kids_memo: string | null;
  savings_memo: string | null;
  subscriptions_memo: string | null;
  variable_expenses_memo: string | null;
  debt_repayment_memo: string | null;
  created_at: string;
  updated_at: string;
};

export type YearForecast = {
  id: string;
  user_id: string;
  current_balance: number;
  base_income: number;
  base_fixed_total: number;
  forecast_months: number;
  created_at: string;
  updated_at: string;
};

export type FutureEventCategory = 'travel' | 'gift' | 'hobby' | 'life' | 'other';

export type FutureEvent = {
  id: string;
  user_id: string;
  year_forecast_id: string;
  label: string;
  year: number;
  month: number;
  amount: number;
  category: FutureEventCategory;
  created_at: string;
  updated_at: string;
};

export interface MonthlySnapshot {
  monthIndex: number;
  year: number;
  month: number;
  income: number;
  fixedTotal: number;
  eventTotal: number;
  startBalance: number;
  endBalance: number;
  events: FutureEvent[];
}

export type CustomExpense = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export type VariableExpenseItem = {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  created_at: string;
  updated_at: string;
};

export type CategoryExpenseItem = {
  id: string;
  user_id: string;
  category: string;
  title: string;
  amount: number;
  created_at: string;
  updated_at: string;
};

export type MonthlyIncomeOverride = {
  id: string;
  user_id: string;
  year: number;
  month: number;
  income: number;
  created_at: string;
  updated_at: string;
};

export type MonthlyBalanceOverride = {
  id: string;
  user_id: string;
  year: number;
  month: number;
  balance: number;
  created_at: string;
  updated_at: string;
};

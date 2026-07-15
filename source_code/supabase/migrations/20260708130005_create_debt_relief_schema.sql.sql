/*
# Debt Relief AI — Core Schema

## Summary
Creates the full data model for the AI Powered Debt Relief & Financial Recovery Platform.
Every table is multi-tenant (owner-scoped to the authenticated user via `auth.uid()`).
All tables enable Row Level Security with per-owner CRUD policies.

## New Tables

1. `profiles` — extends auth.users with full_name, phone, occupation, monthly_income, avatar_url.
2. `loans` — user loan portfolio (loan_name, bank_name, loan_type, outstanding_amount, emi, interest_rate, overdue_months, monthly_income, status, due_date).
3. `financial_profile` — single per-user financial snapshot (monthly_income, monthly_expenses, savings, occupation).
4. `settlement_recommendations` — AI-generated settlement recommendations (recommendation, settlement_percentage, settlement_amount, financial_score, stress_level, risk_analysis, repayment_strategy, negotiation_points, priority_score, advice, input_summary jsonb).
5. `negotiation_history` — AI-generated negotiation letters and strategy.

## Security
- RLS enabled on every table.
- 4 CRUD policies per table (select/insert/update/delete), scoped `TO authenticated` with `auth.uid() = user_id` (or `auth.uid() = id` for profiles).
- `user_id` columns default to `auth.uid()` so client inserts that omit `user_id` still satisfy WITH CHECK.

## Notes
- Idempotent: IF NOT EXISTS for tables, DROP POLICY IF EXISTS (no FOR clause) before re-creating.
*/

-- ---------- profiles ----------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  occupation text,
  monthly_income numeric DEFAULT 0,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ---------- loans ----------
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_name text NOT NULL,
  bank_name text NOT NULL,
  loan_type text NOT NULL DEFAULT 'Personal',
  outstanding_amount numeric NOT NULL DEFAULT 0,
  emi numeric NOT NULL DEFAULT 0,
  interest_rate numeric NOT NULL DEFAULT 0,
  overdue_months integer NOT NULL DEFAULT 0,
  monthly_income numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_loans" ON loans;
CREATE POLICY "select_own_loans" ON loans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_loans" ON loans;
CREATE POLICY "insert_own_loans" ON loans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_loans" ON loans;
CREATE POLICY "update_own_loans" ON loans FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_loans" ON loans;
CREATE POLICY "delete_own_loans" ON loans FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS loans_user_id_idx ON loans(user_id);

-- ---------- financial_profile ----------
CREATE TABLE IF NOT EXISTS financial_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_income numeric NOT NULL DEFAULT 0,
  monthly_expenses numeric NOT NULL DEFAULT 0,
  savings numeric NOT NULL DEFAULT 0,
  occupation text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE financial_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_financial_profile" ON financial_profile;
CREATE POLICY "select_own_financial_profile" ON financial_profile FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_financial_profile" ON financial_profile;
CREATE POLICY "insert_own_financial_profile" ON financial_profile FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_financial_profile" ON financial_profile;
CREATE POLICY "update_own_financial_profile" ON financial_profile FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_financial_profile" ON financial_profile;
CREATE POLICY "delete_own_financial_profile" ON financial_profile FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- settlement_recommendations ----------
CREATE TABLE IF NOT EXISTS settlement_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_id uuid REFERENCES loans(id) ON DELETE SET NULL,
  recommendation text,
  settlement_percentage numeric DEFAULT 0,
  settlement_amount numeric DEFAULT 0,
  financial_score numeric DEFAULT 0,
  stress_level text,
  risk_analysis text,
  repayment_strategy text,
  negotiation_points text,
  priority_score numeric DEFAULT 0,
  advice text,
  input_summary jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE settlement_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_settlement_recommendations" ON settlement_recommendations;
CREATE POLICY "select_own_settlement_recommendations" ON settlement_recommendations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_settlement_recommendations" ON settlement_recommendations;
CREATE POLICY "insert_own_settlement_recommendations" ON settlement_recommendations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_settlement_recommendations" ON settlement_recommendations;
CREATE POLICY "update_own_settlement_recommendations" ON settlement_recommendations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_settlement_recommendations" ON settlement_recommendations;
CREATE POLICY "delete_own_settlement_recommendations" ON settlement_recommendations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS settlement_recs_user_id_idx ON settlement_recommendations(user_id);

-- ---------- negotiation_history ----------
CREATE TABLE IF NOT EXISTS negotiation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_id uuid REFERENCES loans(id) ON DELETE SET NULL,
  loan_name text,
  generated_letter text,
  settlement_email text,
  lender_letter text,
  negotiation_strategy text,
  reason text,
  financial_condition text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE negotiation_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_negotiation_history" ON negotiation_history;
CREATE POLICY "select_own_negotiation_history" ON negotiation_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_negotiation_history" ON negotiation_history;
CREATE POLICY "insert_own_negotiation_history" ON negotiation_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_negotiation_history" ON negotiation_history;
CREATE POLICY "update_own_negotiation_history" ON negotiation_history FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_negotiation_history" ON negotiation_history;
CREATE POLICY "delete_own_negotiation_history" ON negotiation_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS negotiation_history_user_id_idx ON negotiation_history(user_id);

-- ---------- updated_at trigger ----------
CREATE OR REPLACE FUNCTION refresh_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION refresh_updated_at();

DROP TRIGGER IF EXISTS loans_updated_at ON loans;
CREATE TRIGGER loans_updated_at BEFORE UPDATE ON loans
  FOR EACH ROW EXECUTE FUNCTION refresh_updated_at();

DROP TRIGGER IF EXISTS financial_profile_updated_at ON financial_profile;
CREATE TRIGGER financial_profile_updated_at BEFORE UPDATE ON financial_profile
  FOR EACH ROW EXECUTE FUNCTION refresh_updated_at();

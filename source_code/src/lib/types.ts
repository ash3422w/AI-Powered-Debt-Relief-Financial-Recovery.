export interface DatabaseLoan {
  id: string;
  user_id: string;
  loan_name: string;
  bank_name: string;
  loan_type: string;
  outstanding_amount: number;
  emi: number;
  interest_rate: number;
  overdue_months: number;
  monthly_income: number;
  status: 'active' | 'overdue' | 'settled' | 'closed';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseFinancialProfile {
  id: string;
  user_id: string;
  monthly_income: number;
  monthly_expenses: number;
  savings: number;
  occupation: string | null;
  updated_at: string;
}

export interface DatabaseSettlementRecommendation {
  id: string;
  user_id: string;
  loan_id: string | null;
  recommendation: string;
  settlement_percentage: number;
  settlement_amount: number;
  financial_score: number;
  stress_level: string;
  risk_analysis: string;
  repayment_strategy: string;
  negotiation_points: string;
  priority_score: number;
  advice: string;
  input_summary: Record<string, unknown>;
  created_at: string;
}

export interface DatabaseNegotiationHistory {
  id: string;
  user_id: string;
  loan_id: string | null;
  loan_name: string;
  generated_letter: string;
  settlement_email: string;
  lender_letter: string;
  negotiation_strategy: string;
  reason: string;
  financial_condition: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  occupation: string | null;
  monthly_income: number | null;
  avatar_url: string | null;
}

export interface SettlementInput {
  outstanding_amount: number;
  monthly_income: number;
  monthly_expenses: number;
  emi: number;
  overdue_duration: number;
  interest_rate: number;
  loan_type: string;
}

export interface SettlementResult {
  settlement_percentage: number;
  settlement_amount: number;
  debt_stress_level: string;
  financial_health_score: number;
  repayment_strategy: string;
  negotiation_points: string[];
  priority_score: number;
  risk_analysis: string;
  advice: string;
  recommendation: string;
}

export interface LetterInput {
  loan_name: string;
  bank_name: string;
  outstanding_amount: number;
  financial_condition: string;
  monthly_income: number;
  reason: string;
}

export interface LetterResult {
  negotiation_letter: string;
  settlement_email: string;
  lender_letter: string;
  negotiation_strategy: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DashboardStats {
  totalLoans: number;
  totalOutstanding: number;
  monthlyEmi: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  debtStressLevel: string;
  financialHealthScore: number;
  emiDistribution: { name: string; value: number }[];
  settlementPercentage: number;
  incomeVsExpenses: { name: string; income: number; expenses: number }[];
}

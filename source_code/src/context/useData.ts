import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { DatabaseLoan, DatabaseFinancialProfile, DatabaseSettlementRecommendation, DatabaseNegotiationHistory } from '../lib/types';
import { useCallback, useEffect, useState } from 'react';
import { computeHealthScore, emiIncomeRatio, stressLevelFromRatio } from '../lib/format';

export function useLoans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<DatabaseLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setLoans((data ?? []) as DatabaseLoan[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const create = async (loan: Omit<DatabaseLoan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('loans').insert(loan).select().single();
    if (error) throw error;
    await load();
    return data;
  };

  const update = async (id: string, updates: Partial<DatabaseLoan>) => {
    const { error } = await supabase.from('loans').update(updates).eq('id', id);
    if (error) throw error;
    await load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('loans').delete().eq('id', id);
    if (error) throw error;
    await load();
  };

  return { loans, loading, error, reload: load, create, update, remove };
}

export function useFinancialProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DatabaseFinancialProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('financial_profile')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    setProfile(data as DatabaseFinancialProfile | null);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const upsert = async (opts: { monthly_income: number; monthly_expenses: number; savings: number; occupation?: string }) => {
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('financial_profile')
      .upsert({ user_id: user.id, ...opts })
      .select()
      .maybeSingle();
    if (error) throw error;
    setProfile(data as DatabaseFinancialProfile);
    return data;
  };

  return { profile, loading, upsert, reload: load };
}

export function useSettlementRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<DatabaseSettlementRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('settlement_recommendations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setRecommendations((data ?? []) as DatabaseSettlementRecommendation[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async (rec: Omit<DatabaseSettlementRecommendation, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('settlement_recommendations')
      .insert({ user_id: user.id, ...rec })
      .select()
      .single();
    if (error) throw error;
    await load();
    return data;
  };

  return { recommendations, loading, save, reload: load };
}

export function useNegotiationHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<DatabaseNegotiationHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('negotiation_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setHistory((data ?? []) as DatabaseNegotiationHistory[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async (item: Omit<DatabaseNegotiationHistory, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('negotiation_history')
      .insert({ user_id: user.id, ...item })
      .select()
      .single();
    if (error) throw error;
    await load();
    return data;
  };

  return { history, loading, save, reload: load };
}

/** Aggregated dashboard stats derived from loans + financial profile. */
export function useDashboardStats() {
  const { loans, loading: loansLoading } = useLoans();
  const { profile, loading: profileLoading } = useFinancialProfile();

  const loading = loansLoading || profileLoading;

  const totalOutstanding = loans.reduce((s, l) => s + Number(l.outstanding_amount), 0);
  const monthlyEmi = loans.reduce((s, l) => s + Number(l.emi), 0);
  const monthlyIncome = profile ? Number(profile.monthly_income) : loans.reduce((s, l) => s + Number(l.monthly_income), 0) / Math.max(loans.length, 1);
  const monthlyExpenses = profile ? Number(profile.monthly_expenses) : 0;
  const savings = profile ? Number(profile.savings) : Math.max(0, monthlyIncome - monthlyExpenses - monthlyEmi);

  const ratio = emiIncomeRatio(monthlyEmi, monthlyIncome);
  const stress = stressLevelFromRatio(ratio);
  const healthScore = computeHealthScore({ monthlyIncome, monthlyExpenses, monthlyEmi });

  const emiDistribution = loans.map((l) => ({ name: l.loan_name, value: Number(l.emi) }));
  const loanTypeDistribution = loans.reduce<Record<string, number>>((acc, l) => {
    acc[l.loan_type] = (acc[l.loan_type] || 0) + Number(l.outstanding_amount);
    return acc;
  }, {});
  const debtAnalysis = Object.entries(loanTypeDistribution).map(([name, value]) => ({ name, value }));

  const settledCount = loans.filter((l) => l.status === 'settled').length;
  const settlementPercentage = loans.length ? (settledCount / loans.length) * 100 : 0;

  const incomeVsExpenses = [
    { name: 'Income', income: monthlyIncome, expenses: 0 },
    { name: 'Expenses', income: 0, expenses: monthlyExpenses },
    { name: 'EMI', income: 0, expenses: monthlyEmi },
    { name: 'Savings', income: savings, expenses: 0 },
  ];

  return {
    loading,
    totalLoans: loans.length,
    totalOutstanding,
    monthlyEmi,
    monthlyIncome,
    monthlyExpenses,
    savings,
    debtStressLevel: stress.label,
    stressColor: stress.color,
    financialHealthScore: healthScore,
    emiDistribution,
    debtAnalysis,
    settlementPercentage,
    incomeVsExpenses,
    loans,
  };
}

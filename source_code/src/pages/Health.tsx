import { useState, useEffect } from 'react';
import {
  Wallet, PiggyBank, Percent,
  Sparkles, Lightbulb, Target, TrendingDown, Save,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, LineChart, Line, RadialBarChart, RadialBar,
} from 'recharts';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/layout/DashboardLayout';
import SummaryCard from '../components/SummaryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { EmptyState, PageHeader } from '../components/PageHeader';
import { useDashboardStats, useFinancialProfile } from '../context/useData';
import { callEdgeFunction } from '../lib/supabase';
import { formatCurrency, emiIncomeRatio, debtToIncomeRatio, creditHealthIndicator } from '../lib/format';
import { CHART_COLORS, useChartTheme, numFormatter } from '../lib/chartTheme';

interface HealthAdvice {
  suggestions: string[];
  debt_reduction_advice: string[];
  budget_suggestions: string[];
  summary: string;
}

export default function Health() {
  const stats = useDashboardStats();
  const { profile, upsert } = useFinancialProfile();
  const chart = useChartTheme();
  const [editMode, setEditMode] = useState(false);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [savings, setSavings] = useState(0);
  const [advice, setAdvice] = useState<HealthAdvice | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    if (profile) {
      setIncome(Number(profile.monthly_income));
      setExpenses(Number(profile.monthly_expenses));
      setSavings(Number(profile.savings));
    } else if (stats.monthlyIncome) {
      setIncome(stats.monthlyIncome);
      setExpenses(stats.monthlyExpenses);
    }
  }, [profile, stats.monthlyIncome, stats.monthlyExpenses]);

  const emiRatio = emiIncomeRatio(stats.monthlyEmi, income || stats.monthlyIncome);
  const dtiRatio = debtToIncomeRatio(stats.totalOutstanding, income || stats.monthlyIncome);
  const stressScore = Math.min(100, Math.round(emiRatio + dtiRatio / 4));
  const credit = creditHealthIndicator(stats.financialHealthScore);

  const cashFlow = [
    { name: 'Income', value: income || stats.monthlyIncome },
    { name: 'Expenses', value: expenses || stats.monthlyExpenses },
    { name: 'EMI', value: stats.monthlyEmi },
    { name: 'Savings', value: savings || Math.max(0, (income || stats.monthlyIncome) - (expenses || stats.monthlyExpenses) - stats.monthlyEmi) },
  ];

  const trendData = [
    { month: 'Jan', score: Math.max(0, stats.financialHealthScore - 15) },
    { month: 'Feb', score: Math.max(0, stats.financialHealthScore - 10) },
    { month: 'Mar', score: Math.max(0, stats.financialHealthScore - 8) },
    { month: 'Apr', score: Math.max(0, stats.financialHealthScore - 5) },
    { month: 'May', score: Math.max(0, stats.financialHealthScore - 2) },
    { month: 'Jun', score: stats.financialHealthScore },
  ];

  const barData = [
    { name: 'EMI Ratio', value: Number(emiRatio.toFixed(1)), fill: CHART_COLORS.warning },
    { name: 'DTI Ratio', value: Number(dtiRatio.toFixed(1)), fill: CHART_COLORS.danger },
    { name: 'Savings %', value: Number(((savings || Math.max(0, (income || stats.monthlyIncome) - (expenses || stats.monthlyExpenses) - stats.monthlyEmi)) / (income || stats.monthlyIncome || 1) * 100).toFixed(1)), fill: CHART_COLORS.success },
  ];

  const handleSave = async () => {
    try {
      await upsert({ monthly_income: income, monthly_expenses: expenses, savings });
      toast.success('Financial profile saved');
      setEditMode(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const generateAdvice = async () => {
    setLoadingAdvice(true);
    setAdvice(null);
    try {
      const res = await callEdgeFunction<HealthAdvice>('gemini-ai', {
        action: 'health',
        monthly_income: income || stats.monthlyIncome,
        monthly_expenses: expenses || stats.monthlyExpenses,
        savings: savings,
        emi: stats.monthlyEmi,
        total_outstanding: stats.totalOutstanding,
      });
      setAdvice(res);
      toast.success('AI suggestions generated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to get advice');
    } finally {
      setLoadingAdvice(false);
    }
  };

  if (stats.loading) {
    return <DashboardLayout><LoadingSpinner label="Loading financial health..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Financial Health Analysis"
        subtitle="Comprehensive view of your financial wellbeing"
        action={
          <button onClick={() => setEditMode((e) => !e)} className="btn-secondary">
            {editMode ? 'Cancel' : 'Update Profile'}
          </button>
        }
      />

      {/* Editable financial inputs */}
      {editMode && (
        <div className="card mb-6 animate-fade-in">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Update Your Financial Profile</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Monthly Income</label>
              <input type="number" value={income || ''} onChange={(e) => setIncome(Number(e.target.value))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Monthly Expenses</label>
              <input type="number" value={expenses || ''} onChange={(e) => setExpenses(Number(e.target.value))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Savings</label>
              <input type="number" value={savings || ''} onChange={(e) => setSavings(Number(e.target.value))} className="input-field" />
            </div>
          </div>
          <button onClick={handleSave} className="btn-primary mt-4"><Save size={16} /> Save Profile</button>
        </div>
      )}

      {/* Summary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Monthly Income" value={formatCurrency(income || stats.monthlyIncome)} icon={Wallet} color="success" />
        <SummaryCard label="Monthly Expenses" value={formatCurrency(expenses || stats.monthlyExpenses)} icon={TrendingDown} color="warning" />
        <SummaryCard label="Savings" value={formatCurrency(savings || stats.savings)} icon={PiggyBank} color="accent" />
        <SummaryCard label="EMI Ratio" value={`${emiRatio.toFixed(1)}%`} icon={Percent} color={emiRatio > 50 ? 'danger' : 'primary'} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart — cash flow */}
        <div className="card animate-fade-in-up">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Cash Flow Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Income, expenses, EMI, savings</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={cashFlow} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e) => e.name}>
                {cashFlow.map((_, i) => <Cell key={i} fill={CHART_COLORS.palette[i % CHART_COLORS.palette.length]} />)}
              </Pie>
              <Tooltip {...chart.tooltip} formatter={numFormatter(formatCurrency)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart — ratios */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Key Ratios (%)</h3>
          <p className="text-xs text-slate-400 mb-4">EMI, DTI, and savings ratios</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} vertical={false} />
              <XAxis dataKey="name" {...chart.axis} />
              <YAxis {...chart.axis} unit="%" />
              <Tooltip {...chart.tooltip} formatter={numFormatter((v) => `${v}%`)} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart — trend */}
        <div className="card animate-fade-in-up">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Health Score Trend</h3>
          <p className="text-xs text-slate-400 mb-4">Last 6 months (estimated)</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} vertical={false} />
              <XAxis dataKey="month" {...chart.axis} />
              <YAxis {...chart.axis} domain={[0, 100]} />
              <Tooltip {...chart.tooltip} />
              <Line type="monotone" dataKey="score" stroke={CHART_COLORS.primary} strokeWidth={3} dot={{ r: 4, fill: CHART_COLORS.primary }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Progress Circle — health score */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Financial Health Score</h3>
          <p className="text-xs text-slate-400 mb-4">Overall credit health</p>
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart innerRadius="65%" outerRadius="100%" data={[{ name: 'Score', value: stats.financialHealthScore, fill: CHART_COLORS.primary }]} startAngle={90} endAngle={-270}>
                <RadialBar background={{ fill: chart.isDark ? '#1e293b' : '#f1f5f9' }} dataKey="value" cornerRadius={12} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="-mt-32 text-center pointer-events-none">
              <p className="text-4xl font-bold font-display text-slate-900 dark:text-white">{stats.financialHealthScore}</p>
              <p className={`text-sm font-semibold text-${credit.color}-500 mt-1`}>{credit.label}</p>
            </div>
          </div>
          <div className="mt-20 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-slate-50/60 dark:bg-slate-800/40 p-3">
              <p className="text-xs text-slate-400">DTI Ratio</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{dtiRatio.toFixed(1)}%</p>
            </div>
            <div className="rounded-xl bg-slate-50/60 dark:bg-slate-800/40 p-3">
              <p className="text-xs text-slate-400">Stress Score</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{stressScore}/100</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="card animate-fade-in-up">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-700 flex items-center justify-center shadow-lg">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">AI Suggestions</h2>
              <p className="text-xs text-slate-400">Personalized tips from Gemini</p>
            </div>
          </div>
          <button onClick={generateAdvice} disabled={loadingAdvice} className="btn-primary">
            {loadingAdvice ? <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <><Sparkles size={16} /> Get Advice</>}
          </button>
        </div>

        {loadingAdvice ? (
          <LoadingSpinner label="Gemini is analyzing your finances..." />
        ) : advice ? (
          <div className="space-y-5">
            {advice.summary && (
              <div className="rounded-xl bg-primary-50/60 dark:bg-primary-500/10 p-4">
                <p className="text-sm text-slate-700 dark:text-slate-200">{advice.summary}</p>
              </div>
            )}
            <div className="grid md:grid-cols-3 gap-4">
              <AdviceList icon={Lightbulb} title="Financial Tips" items={advice.suggestions} color="text-primary-600" />
              <AdviceList icon={TrendingDown} title="Debt Reduction" items={advice.debt_reduction_advice} color="text-danger-600" />
              <AdviceList icon={Target} title="Budget Suggestions" items={advice.budget_suggestions} color="text-success-600" />
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="No suggestions yet"
            description="Click 'Get Advice' to receive AI-powered financial tips tailored to your situation"
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function AdviceList({ icon: Icon, title, items, color }: { icon: React.ElementType; title: string; items: string[]; color: string }) {
  return (
    <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={color} />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      </div>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex gap-2">
              <span className={`flex-shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full ${color.replace('text', 'bg')}`} />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-400">No suggestions available.</p>
      )}
    </div>
  );
}

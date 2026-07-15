import { Link } from 'react-router-dom';
import {
  Wallet, TrendingDown, CalendarClock, AlertTriangle, DollarSign, HeartPulse,
  Sparkles, FileText, BarChart3, Plus, ArrowRight, Landmark, Activity,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, AreaChart, Area, RadialBarChart, RadialBar,
} from 'recharts';
import DashboardLayout from '../components/layout/DashboardLayout';
import SummaryCard from '../components/SummaryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { EmptyState, PageHeader } from '../components/PageHeader';
import { useDashboardStats, useSettlementRecommendations } from '../context/useData';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, timeAgo, creditHealthIndicator } from '../lib/format';
import { CHART_COLORS, useChartTheme, numFormatter } from '../lib/chartTheme';

const quickActions = [
  { to: '/loans', label: 'Add Loan', icon: Plus, color: 'from-primary-500 to-primary-700' },
  { to: '/settlement', label: 'AI Recommendation', icon: Sparkles, color: 'from-secondary-500 to-secondary-700' },
  { to: '/letter', label: 'Generate Letter', icon: FileText, color: 'from-accent-500 to-accent-700' },
  { to: '/reports', label: 'View Reports', icon: BarChart3, color: 'from-success-500 to-success-700' },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const stats = useDashboardStats();
  const { recommendations, loading: recLoading } = useSettlementRecommendations();
  const chart = useChartTheme();

  if (stats.loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner label="Loading your dashboard..." />
      </DashboardLayout>
    );
  }

  const credit = creditHealthIndicator(stats.financialHealthScore);
  const healthData = [{ name: 'Score', value: stats.financialHealthScore, fill: CHART_COLORS.primary }];

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome, ${profile?.full_name?.split(' ')[0] || 'there'} 👋`}
        subtitle="Here's your financial recovery overview"
        action={<Link to="/settlement" className="btn-primary"><Sparkles size={16} /> Get AI Recommendation</Link>}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <SummaryCard label="Total Loans" value={stats.totalLoans} icon={Landmark} color="primary" />
        <SummaryCard label="Outstanding" value={formatCurrency(stats.totalOutstanding)} icon={TrendingDown} color="danger" />
        <SummaryCard label="Monthly EMI" value={formatCurrency(stats.monthlyEmi)} icon={CalendarClock} color="warning" />
        <SummaryCard label="Debt Stress" value={stats.debtStressLevel} icon={AlertTriangle} color={stats.stressColor as 'primary'|'secondary'|'accent'|'success'|'warning'|'danger'} />
        <SummaryCard label="Monthly Income" value={formatCurrency(stats.monthlyIncome)} icon={DollarSign} color="success" />
        <SummaryCard label="Health Score" value={stats.financialHealthScore} icon={HeartPulse} color="accent" subtitle={credit.label} />
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* EMI Distribution */}
        <div className="card animate-fade-in-up">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">EMI Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Monthly EMI by loan</p>
          {stats.emiDistribution.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.emiDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {stats.emiDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS.palette[i % CHART_COLORS.palette.length]} />)}
                </Pie>
                <Tooltip {...chart.tooltip} formatter={numFormatter(formatCurrency)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState icon={Wallet} title="No loans yet" description="Add a loan to see EMI distribution" />}
        </div>

        {/* Debt Analysis */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Debt Analysis</h3>
          <p className="text-xs text-slate-400 mb-4">Outstanding by loan type</p>
          {stats.debtAnalysis.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.debtAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} vertical={false} />
                <XAxis dataKey="name" {...chart.axis} />
                <YAxis {...chart.axis} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...chart.tooltip} formatter={numFormatter(formatCurrency)} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {stats.debtAnalysis.map((_, i) => <Cell key={i} fill={CHART_COLORS.palette[i % CHART_COLORS.palette.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState icon={BarChart3} title="No debt data" />}
        </div>

        {/* Financial Health Score — radial */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '160ms' }}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Financial Health</h3>
          <p className="text-xs text-slate-400 mb-4">Overall score (0-100)</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart innerRadius="60%" outerRadius="100%" data={healthData} startAngle={90} endAngle={-270}>
              <RadialBar background={{ fill: chart.isDark ? '#1e293b' : '#f1f5f9' }} dataKey="value" cornerRadius={12} fill={CHART_COLORS.primary} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="-mt-32 text-center pointer-events-none">
            <p className="text-4xl font-bold font-display text-slate-900 dark:text-white">{stats.financialHealthScore}</p>
            <p className={`text-xs font-semibold text-${credit.color}-500 mt-1`}>{credit.label}</p>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Settlement Percentage */}
        <div className="card animate-fade-in-up">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Settlement Progress</h3>
          <p className="text-xs text-slate-400 mb-4">Percentage of loans settled</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={[{ name: 'Settled', value: stats.settlementPercentage }, { name: 'Remaining', value: 100 - stats.settlementPercentage }]}
                  dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} startAngle={90} endAngle={-270}
                >
                  <Cell fill={CHART_COLORS.success} />
                  <Cell fill={chart.isDark ? '#1e293b' : '#e2e8f0'} />
                </Pie>
                <Tooltip {...chart.tooltip} formatter={numFormatter((v) => `${v.toFixed(0)}%`)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold font-display text-slate-900 dark:text-white">{stats.settlementPercentage.toFixed(0)}%</p>
                <p className="text-xs text-slate-400">of loans settled</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs"><span className="h-2.5 w-2.5 rounded-full bg-success-500" />Settled</div>
                <div className="flex items-center gap-2 text-xs"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" />Remaining</div>
              </div>
            </div>
          </div>
        </div>

        {/* Income vs Expenses */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Income vs Expenses</h3>
          <p className="text-xs text-slate-400 mb-4">Monthly cash flow breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.incomeVsExpenses}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.success} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={CHART_COLORS.success} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.danger} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={CHART_COLORS.danger} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} vertical={false} />
              <XAxis dataKey="name" {...chart.axis} />
              <YAxis {...chart.axis} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...chart.tooltip} formatter={numFormatter(formatCurrency)} />
              <Area type="monotone" dataKey="income" stroke={CHART_COLORS.success} strokeWidth={2} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="expenses" stroke={CHART_COLORS.danger} strokeWidth={2} fill="url(#expenseGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions + Recent Activities */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card animate-fade-in-up lg:col-span-1">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <Link key={a.label} to={a.to} className="group rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4 hover:shadow-glass transition-all hover:-translate-y-0.5">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform`}>
                  <a.icon size={18} className="text-white" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{a.label}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="card animate-fade-in-up lg:col-span-2" style={{ animationDelay: '80ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Recent AI Recommendations</h3>
            <Link to="/settlement" className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recLoading ? (
            <LoadingSpinner size={20} />
          ) : recommendations.length ? (
            <div className="space-y-3">
              {recommendations.slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-start gap-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 p-3.5">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-secondary-500 to-secondary-700 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-1">{r.recommendation || 'AI Recommendation'}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>Settlement: {Number(r.settlement_percentage).toFixed(0)}%</span>
                      <span>Score: {Number(r.financial_score).toFixed(0)}</span>
                      <span className="flex items-center gap-1"><Activity size={11} /> {timeAgo(r.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="No recommendations yet"
              description="Generate your first AI settlement recommendation"
              action={<Link to="/settlement" className="btn-primary"><Sparkles size={16} /> Get Started</Link>}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

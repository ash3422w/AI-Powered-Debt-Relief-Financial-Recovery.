import {
  FileText, FileSpreadsheet, Landmark, Sparkles,
  HeartPulse, Mail, History,
} from 'lucide-react';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/layout/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { useLoans, useSettlementRecommendations, useNegotiationHistory, useDashboardStats } from '../context/useData';
import { useAuth } from '../context/AuthContext';
import { downloadPDF, downloadCSV } from '../lib/export';
import { formatCurrency, formatDateTime } from '../lib/format';

export default function Reports() {
  const { loans, loading: loansLoading } = useLoans();
  const { recommendations, loading: recLoading } = useSettlementRecommendations();
  const { history, loading: histLoading } = useNegotiationHistory();
  const stats = useDashboardStats();
  const { profile } = useAuth();

  const loading = loansLoading || recLoading || histLoading || stats.loading;

  const reportCards = [
    {
      id: 'loan-summary',
      icon: Landmark,
      title: 'Loan Summary Report',
      desc: 'Complete overview of all your loans',
      color: 'from-primary-500 to-primary-700',
      onPDF: () => {
        downloadPDF({
          title: 'Loan Summary Report',
          subtitle: `${profile?.full_name || 'User'} — ${new Date().toLocaleDateString()}`,
          filename: `loan-summary-${Date.now()}.pdf`,
          sections: loans.length ? loans.map((l) => ({
            heading: `${l.loan_name} — ${l.bank_name}`,
            body: `Type: ${l.loan_type}\nOutstanding: ${formatCurrency(Number(l.outstanding_amount))}\nEMI: ${formatCurrency(Number(l.emi))}\nInterest: ${Number(l.interest_rate).toFixed(2)}%\nOverdue: ${l.overdue_months} months\nStatus: ${l.status}`,
          })) : [{ heading: 'No Loans', body: 'You have no loans recorded.' }],
        });
        toast.success('Loan summary PDF downloaded');
      },
      onCSV: () => {
        downloadCSV(`loan-summary-${Date.now()}.csv`, loans.map((l) => ({
          Loan: l.loan_name, Bank: l.bank_name, Type: l.loan_type,
          Outstanding: l.outstanding_amount, EMI: l.emi, Interest: l.interest_rate,
          Overdue: l.overdue_months, Status: l.status,
        })));
        toast.success('Loan summary CSV downloaded');
      },
    },
    {
      id: 'settlement',
      icon: Sparkles,
      title: 'Settlement Report',
      desc: 'All AI-generated settlement recommendations',
      color: 'from-secondary-500 to-secondary-700',
      onPDF: () => {
        downloadPDF({
          title: 'Settlement Recommendations Report',
          subtitle: `${profile?.full_name || 'User'} — ${new Date().toLocaleDateString()}`,
          filename: `settlement-report-${Date.now()}.pdf`,
          sections: recommendations.length ? recommendations.map((r) => ({
            heading: `Recommendation — ${formatDateTime(r.created_at)}`,
            body: `Settlement: ${Number(r.settlement_percentage).toFixed(0)}% (${formatCurrency(Number(r.settlement_amount))})\nHealth Score: ${Number(r.financial_score).toFixed(0)}/100\nStress: ${r.stress_level}\nPriority: ${Number(r.priority_score).toFixed(0)}/100\n\n${r.recommendation}\n\nStrategy: ${r.repayment_strategy}\n\nAdvice: ${r.advice}`,
          })) : [{ heading: 'No Recommendations', body: 'You have no settlement recommendations yet.' }],
        });
        toast.success('Settlement PDF downloaded');
      },
      onCSV: () => {
        downloadCSV(`settlement-report-${Date.now()}.csv`, recommendations.map((r) => ({
          Date: formatDateTime(r.created_at),
          SettlementPercent: r.settlement_percentage,
          SettlementAmount: r.settlement_amount,
          HealthScore: r.financial_score,
          StressLevel: r.stress_level,
          PriorityScore: r.priority_score,
          Recommendation: (r.recommendation || '').slice(0, 200),
        })));
        toast.success('Settlement CSV downloaded');
      },
    },
    {
      id: 'financial',
      icon: HeartPulse,
      title: 'Financial Report',
      desc: 'Complete financial health snapshot',
      color: 'from-accent-500 to-accent-700',
      onPDF: () => {
        downloadPDF({
          title: 'Financial Health Report',
          subtitle: `${profile?.full_name || 'User'} — ${new Date().toLocaleDateString()}`,
          filename: `financial-report-${Date.now()}.pdf`,
          sections: [
            { heading: 'Summary', body: `Total Loans: ${stats.totalLoans}\nTotal Outstanding: ${formatCurrency(stats.totalOutstanding)}\nMonthly EMI: ${formatCurrency(stats.monthlyEmi)}\nMonthly Income: ${formatCurrency(stats.monthlyIncome)}\nMonthly Expenses: ${formatCurrency(stats.monthlyExpenses)}\nSavings: ${formatCurrency(stats.savings)}\nDebt Stress: ${stats.debtStressLevel}\nFinancial Health Score: ${stats.financialHealthScore}/100\nSettlement Progress: ${stats.settlementPercentage.toFixed(0)}%` },
            { heading: 'Loan Breakdown', body: stats.loans.map((l) => `${l.loan_name} (${l.bank_name}): ${formatCurrency(Number(l.outstanding_amount))} — ${l.status}`).join('\n') },
          ],
        });
        toast.success('Financial PDF downloaded');
      },
      onCSV: () => {
        downloadCSV(`financial-report-${Date.now()}.csv`, [{
          TotalLoans: stats.totalLoans,
          TotalOutstanding: stats.totalOutstanding,
          MonthlyEMI: stats.monthlyEmi,
          MonthlyIncome: stats.monthlyIncome,
          MonthlyExpenses: stats.monthlyExpenses,
          Savings: stats.savings,
          DebtStress: stats.debtStressLevel,
          HealthScore: stats.financialHealthScore,
          SettlementPercent: stats.settlementPercentage.toFixed(0),
        }]);
        toast.success('Financial CSV downloaded');
      },
    },
    {
      id: 'negotiation',
      icon: History,
      title: 'Negotiation History',
      desc: 'All AI-generated letters and strategies',
      color: 'from-success-500 to-success-700',
      onPDF: () => {
        downloadPDF({
          title: 'Negotiation History Report',
          subtitle: `${profile?.full_name || 'User'} — ${new Date().toLocaleDateString()}`,
          filename: `negotiation-history-${Date.now()}.pdf`,
          sections: history.length ? history.map((h) => ({
            heading: `${h.loan_name} — ${formatDateTime(h.created_at)}`,
            body: `Reason: ${h.reason}\nCondition: ${h.financial_condition}\n\nStrategy: ${h.negotiation_strategy}\n\nNegotiation Letter:\n${h.generated_letter}`,
          })) : [{ heading: 'No History', body: 'You have no negotiation letters yet.' }],
        });
        toast.success('Negotiation PDF downloaded');
      },
      onCSV: () => {
        downloadCSV(`negotiation-history-${Date.now()}.csv`, history.map((h) => ({
          Date: formatDateTime(h.created_at),
          Loan: h.loan_name,
          Reason: h.reason,
          Condition: h.financial_condition,
          Strategy: (h.negotiation_strategy || '').slice(0, 200),
        })));
        toast.success('Negotiation CSV downloaded');
      },
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Reports" subtitle="Generate and download financial reports" />

      {/* Quick stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Loans', value: stats.totalLoans, icon: Landmark, color: 'text-primary-600' },
          { label: 'Recommendations', value: recommendations.length, icon: Sparkles, color: 'text-secondary-600' },
          { label: 'Letters Generated', value: history.length, icon: Mail, color: 'text-accent-600' },
          { label: 'Health Score', value: stats.financialHealthScore, icon: HeartPulse, color: 'text-success-600' },
        ].map((s) => (
          <div key={s.label} className="card animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-xs text-slate-400">{s.label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading reports..." />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {reportCards.map((r, i) => (
            <div key={r.id} className="card card-hover group animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <r.icon size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{r.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{r.desc}</p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={r.onPDF} className="btn-secondary !py-2.5 flex-1"><FileText size={15} /> PDF</button>
                    <button onClick={r.onCSV} className="btn-secondary !py-2.5 flex-1"><FileSpreadsheet size={15} /> CSV</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent history preview */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="card animate-fade-in-up">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Settlement Recommendations</h3>
          {recommendations.length ? (
            <div className="space-y-2">
              {recommendations.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 p-3">
                  <Sparkles size={16} className="text-secondary-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-1">{r.recommendation || 'Recommendation'}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(r.created_at)}</p>
                  </div>
                  <span className="badge bg-secondary-100 text-secondary-700 dark:bg-secondary-500/15 dark:text-secondary-300">{Number(r.settlement_percentage).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400 py-6 text-center">No recommendations yet</p>}
        </div>

        <div className="card animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Negotiation Letters</h3>
          {history.length ? (
            <div className="space-y-2">
              {history.slice(0, 5).map((h) => (
                <div key={h.id} className="flex items-center gap-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 p-3">
                  <Mail size={16} className="text-accent-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-1">{h.loan_name}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(h.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400 py-6 text-center">No letters yet</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useState } from 'react';
import {
  Sparkles, TrendingDown, HeartPulse, Target, ShieldAlert, Lightbulb,
  ListChecks, Gauge, DollarSign, Save, Download, Wand2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/layout/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { EmptyState, PageHeader } from '../components/PageHeader';
import { useSettlementRecommendations } from '../context/useData';
import { callEdgeFunction } from '../lib/supabase';
import { SettlementResult } from '../lib/types';
import { formatCurrency } from '../lib/format';
import { downloadPDF } from '../lib/export';

const loanTypes = ['Personal', 'Home', 'Car', 'Education', 'Credit Card', 'Business', 'Gold', 'Other'];

export default function Settlement() {
  const { save } = useSettlementRecommendations();
  const [form, setForm] = useState({
    outstanding_amount: 0,
    monthly_income: 0,
    monthly_expenses: 0,
    emi: 0,
    overdue_duration: 0,
    interest_rate: 0,
    loan_type: 'Personal',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SettlementResult | null>(null);

  const set = (k: keyof typeof form, v: number | string) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.outstanding_amount <= 0 || form.monthly_income <= 0) {
      toast.error('Outstanding amount and monthly income are required');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await callEdgeFunction<SettlementResult>('gemini-ai', { action: 'settlement', ...form });
      setResult(res);
      toast.success('AI recommendation generated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate recommendation');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await save({
        loan_id: null,
        recommendation: result.recommendation,
        settlement_percentage: result.settlement_percentage,
        settlement_amount: result.settlement_amount,
        financial_score: result.financial_health_score,
        stress_level: result.debt_stress_level,
        risk_analysis: result.risk_analysis,
        repayment_strategy: result.repayment_strategy,
        negotiation_points: Array.isArray(result.negotiation_points) ? result.negotiation_points.join('\n') : String(result.negotiation_points),
        priority_score: result.priority_score,
        advice: result.advice,
        input_summary: form as unknown as Record<string, unknown>,
      });
      toast.success('Recommendation saved to history');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleDownload = () => {
    if (!result) return;
    downloadPDF({
      title: 'AI Settlement Recommendation',
      subtitle: `Generated ${new Date().toLocaleDateString()}`,
      filename: `settlement-recommendation-${Date.now()}.pdf`,
      sections: [
        { heading: 'Executive Summary', body: result.recommendation },
        { heading: 'Settlement Percentage', body: `${result.settlement_percentage}% — Recommended amount: ${formatCurrency(result.settlement_amount)}` },
        { heading: 'Debt Stress Level', body: result.debt_stress_level },
        { heading: 'Financial Health Score', body: `${result.financial_health_score} / 100` },
        { heading: 'Priority Score', body: `${result.priority_score} / 100` },
        { heading: 'Repayment Strategy', body: result.repayment_strategy },
        { heading: 'Negotiation Points', body: Array.isArray(result.negotiation_points) ? result.negotiation_points.map((p) => `• ${p}`).join('\n') : String(result.negotiation_points) },
        { heading: 'Risk Analysis', body: result.risk_analysis },
        { heading: 'Advice', body: result.advice },
      ],
    });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="AI Settlement Recommendation"
        subtitle="Get intelligent settlement strategies powered by Google Gemini"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="card animate-fade-in-up">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-700 flex items-center justify-center shadow-lg">
              <Wand2 size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Your Financial Details</h2>
              <p className="text-xs text-slate-400">Enter your loan and income details</p>
            </div>
          </div>

          <form onSubmit={generate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Outstanding Amount">
                <input type="number" value={form.outstanding_amount || ''} onChange={(e) => set('outstanding_amount', Number(e.target.value))} className="input-field" placeholder="25000" min={0} />
              </Field>
              <Field label="Monthly Income">
                <input type="number" value={form.monthly_income || ''} onChange={(e) => set('monthly_income', Number(e.target.value))} className="input-field" placeholder="5000" min={0} />
              </Field>
              <Field label="Monthly Expenses">
                <input type="number" value={form.monthly_expenses || ''} onChange={(e) => set('monthly_expenses', Number(e.target.value))} className="input-field" placeholder="2000" min={0} />
              </Field>
              <Field label="Monthly EMI">
                <input type="number" value={form.emi || ''} onChange={(e) => set('emi', Number(e.target.value))} className="input-field" placeholder="800" min={0} />
              </Field>
              <Field label="Overdue Duration (months)">
                <input type="number" value={form.overdue_duration || ''} onChange={(e) => set('overdue_duration', Number(e.target.value))} className="input-field" placeholder="3" min={0} />
              </Field>
              <Field label="Interest Rate (%)">
                <input type="number" step="0.1" value={form.interest_rate || ''} onChange={(e) => set('interest_rate', Number(e.target.value))} className="input-field" placeholder="14.5" min={0} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Loan Type">
                  <select value={form.loan_type} onChange={(e) => set('loan_type', e.target.value)} className="input-field">
                    {loanTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
              {loading ? <><span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Analyzing with Gemini...</> : <><Sparkles size={18} /> Generate AI Recommendation</>}
            </button>
          </form>
        </div>

        {/* Output */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">AI Analysis</h2>
                <p className="text-xs text-slate-400">Recommendation results</p>
              </div>
            </div>
            {result && (
              <div className="flex gap-2">
                <button onClick={handleSave} className="btn-ghost !p-2.5" title="Save"><Save size={16} /></button>
                <button onClick={handleDownload} className="btn-ghost !p-2.5" title="Download PDF"><Download size={16} /></button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-16">
              <LoadingSpinner label="Gemini is analyzing your financial data..." />
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-3">
                <Metric icon={Target} label="Settlement %" value={`${Number(result.settlement_percentage).toFixed(0)}%`} color="text-primary-600" />
                <Metric icon={DollarSign} label="Settlement Amount" value={formatCurrency(Number(result.settlement_amount))} color="text-success-600" />
                <Metric icon={TrendingDown} label="Stress Level" value={result.debt_stress_level} color="text-warning-600" />
                <Metric icon={HeartPulse} label="Health Score" value={`${Number(result.financial_health_score).toFixed(0)}/100`} color="text-accent-600" />
                <Metric icon={Gauge} label="Priority Score" value={`${Number(result.priority_score).toFixed(0)}/100`} color="text-secondary-600" />
                <Metric icon={ShieldAlert} label="Risk Analysis" value={result.risk_analysis ? 'Available' : '—'} color="text-danger-600" />
              </div>

              <ResultBlock icon={Lightbulb} title="Recommendation" body={result.recommendation} />
              <ResultBlock icon={ListChecks} title="Repayment Strategy" body={result.repayment_strategy} />
              <ResultBlock
                icon={Target}
                title="Negotiation Points"
                body={Array.isArray(result.negotiation_points) ? result.negotiation_points.map((p) => `• ${p}`).join('\n') : String(result.negotiation_points)}
              />
              <ResultBlock icon={ShieldAlert} title="Risk Analysis" body={result.risk_analysis} />
              <ResultBlock icon={Lightbulb} title="Advice" body={result.advice} />
            </div>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="No recommendation yet"
              description="Fill in your financial details and click Generate to get an AI-powered settlement recommendation"
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Metric({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl bg-slate-50/60 dark:bg-slate-800/40 p-3.5">
      <Icon size={16} className={color} />
      <p className="text-xs text-slate-400 mt-1.5">{label}</p>
      <p className={`text-sm font-bold ${color} mt-0.5`}>{value}</p>
    </div>
  );
}

function ResultBlock({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  if (!body) return null;
  return (
    <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-secondary-600" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{body}</p>
    </div>
  );
}

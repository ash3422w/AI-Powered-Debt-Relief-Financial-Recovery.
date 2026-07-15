import { useState } from 'react';
import {
  FileText, Sparkles, Copy, Download, RefreshCw, Mail, ScrollText, Send, Save,
} from 'lucide-react';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/layout/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { EmptyState, PageHeader } from '../components/PageHeader';
import { useLoans, useNegotiationHistory } from '../context/useData';
import { callEdgeFunction } from '../lib/supabase';
import { LetterResult } from '../lib/types';
import { copyToClipboard, downloadPDF } from '../lib/export';
import { useAuth } from '../context/AuthContext';

export default function Letter() {
  const { loans } = useLoans();
  const { save } = useNegotiationHistory();
  const { profile } = useAuth();
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [form, setForm] = useState({
    outstanding_amount: 0,
    financial_condition: '',
    monthly_income: 0,
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LetterResult | null>(null);
  const [tab, setTab] = useState<'negotiation_letter' | 'settlement_email' | 'lender_letter'>('negotiation_letter');

  const selectedLoan = loans.find((l) => l.id === selectedLoanId);

  const onLoanChange = (id: string) => {
    setSelectedLoanId(id);
    const loan = loans.find((l) => l.id === id);
    if (loan) {
      setForm((f) => ({
        ...f,
        outstanding_amount: Number(loan.outstanding_amount),
        monthly_income: Number(loan.monthly_income),
      }));
    }
  };

  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.outstanding_amount || !form.financial_condition || !form.reason) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await callEdgeFunction<LetterResult>('gemini-ai', {
        action: 'letter',
        loan_name: selectedLoan?.loan_name || 'My Loan',
        bank_name: selectedLoan?.bank_name || 'Lender',
        outstanding_amount: form.outstanding_amount,
        financial_condition: form.financial_condition,
        monthly_income: form.monthly_income,
        reason: form.reason,
        borrower_name: profile?.full_name || 'Borrower',
      });
      setResult(res);
      toast.success('Letter generated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate letter');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await copyToClipboard(result[tab] || '');
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    if (!result) return;
    downloadPDF({
      title: tab === 'settlement_email' ? 'Settlement Email' : tab === 'lender_letter' ? 'Lender Request Letter' : 'Negotiation Letter',
      subtitle: `${selectedLoan?.loan_name || 'Loan'} — ${selectedLoan?.bank_name || 'Lender'}`,
      filename: `${tab}-${Date.now()}.pdf`,
      sections: [{ heading: 'Document', body: result[tab] || '' }],
    });
  };

  const handleSave = async () => {
    if (!result || !selectedLoan) return;
    try {
      await save({
        loan_id: selectedLoan.id,
        loan_name: selectedLoan.loan_name,
        generated_letter: result.negotiation_letter,
        settlement_email: result.settlement_email,
        lender_letter: result.lender_letter,
        negotiation_strategy: result.negotiation_strategy,
        reason: form.reason,
        financial_condition: form.financial_condition,
      });
      toast.success('Letter saved to history');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const tabs = [
    { key: 'negotiation_letter' as const, label: 'Negotiation Letter', icon: FileText },
    { key: 'settlement_email' as const, label: 'Settlement Email', icon: Mail },
    { key: 'lender_letter' as const, label: 'Lender Letter', icon: ScrollText },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="AI Negotiation Letter Generator" subtitle="Generate professional settlement letters with Gemini AI" />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card animate-fade-in-up">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-lg">
              <FileText size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Letter Details</h2>
              <p className="text-xs text-slate-400">Select a loan and describe your situation</p>
            </div>
          </div>

          <form onSubmit={generate} className="space-y-4">
            <Field label="Select Loan">
              <select value={selectedLoanId} onChange={(e) => onLoanChange(e.target.value)} className="input-field">
                <option value="">— Select a loan —</option>
                {loans.map((l) => (
                  <option key={l.id} value={l.id}>{l.loan_name} — {l.bank_name}</option>
                ))}
              </select>
              {loans.length === 0 && <p className="text-xs text-slate-400 mt-1.5">Add a loan first, or fill the fields manually below.</p>}
            </Field>

            <Field label="Outstanding Amount">
              <input type="number" value={form.outstanding_amount || ''} onChange={(e) => set('outstanding_amount', Number(e.target.value))} className="input-field" placeholder="25000" min={0} />
            </Field>

            <Field label="Monthly Income">
              <input type="number" value={form.monthly_income || ''} onChange={(e) => set('monthly_income', Number(e.target.value))} className="input-field" placeholder="5000" min={0} />
            </Field>

            <Field label="Financial Condition">
              <textarea value={form.financial_condition} onChange={(e) => set('financial_condition', e.target.value)} rows={3} className="input-field resize-none" placeholder="Describe your current financial situation, e.g. lost job, medical emergency..." />
            </Field>

            <Field label="Reason for Settlement">
              <textarea value={form.reason} onChange={(e) => set('reason', e.target.value)} rows={2} className="input-field resize-none" placeholder="Why are you requesting a settlement?" />
            </Field>

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
              {loading ? <><span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Generating with Gemini...</> : <><Sparkles size={18} /> Generate Letter</>}
            </button>
          </form>
        </div>

        {/* Output */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
                <Send size={18} className="text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">Generated Documents</h2>
                <p className="text-xs text-slate-400">Three letter formats</p>
              </div>
            </div>
            {result && (
              <div className="flex gap-1">
                <button onClick={handleSave} className="btn-ghost !p-2.5" title="Save"><Save size={15} /></button>
                <button onClick={generate} className="btn-ghost !p-2.5" title="Regenerate"><RefreshCw size={15} /></button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-16"><LoadingSpinner label="Gemini is writing your letter..." /></div>
          ) : result ? (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-1 p-1 rounded-xl bg-slate-100/70 dark:bg-slate-800/60">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all ${
                      tab === t.key ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <t.icon size={13} /> {t.label}
                  </button>
                ))}
              </div>

              {/* Letter content */}
              <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-5 bg-slate-50/40 dark:bg-slate-800/30 max-h-[400px] overflow-y-auto">
                <pre className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">{result[tab]}</pre>
              </div>

              {/* Strategy */}
              {result.negotiation_strategy && (
                <div className="rounded-xl bg-secondary-50/60 dark:bg-secondary-500/10 p-4">
                  <p className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1">Negotiation Strategy</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{result.negotiation_strategy}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={handleCopy} className="btn-secondary flex-1"><Copy size={15} /> Copy</button>
                <button onClick={handleDownload} className="btn-primary flex-1"><Download size={15} /> Download PDF</button>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No letter generated yet"
              description="Select a loan, describe your situation, and generate a professional negotiation letter"
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

import { useState, useMemo } from 'react';
import {
  Plus, Search, Pencil, Trash2, Eye, Landmark, Filter,
} from 'lucide-react';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/layout/DashboardLayout';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { EmptyState, PageHeader } from '../components/PageHeader';
import { useLoans } from '../context/useData';
import { DatabaseLoan } from '../lib/types';
import { formatCurrency, formatDate } from '../lib/format';

type Status = DatabaseLoan['status'];
type FormState = Omit<DatabaseLoan, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

const emptyForm: FormState = {
  loan_name: '', bank_name: '', loan_type: 'Personal', outstanding_amount: 0,
  emi: 0, interest_rate: 0, overdue_months: 0, monthly_income: 0, status: 'active', due_date: null,
};

const loanTypes = ['Personal', 'Home', 'Car', 'Education', 'Credit Card', 'Business', 'Gold', 'Other'];
const statuses: Status[] = ['active', 'overdue', 'settled', 'closed'];

export default function Loans() {
  const { loans, loading, create, update, remove } = useLoans();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewLoan, setViewLoan] = useState<DatabaseLoan | null>(null);
  const [editing, setEditing] = useState<DatabaseLoan | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return loans.filter((l) => {
      const matchesSearch =
        l.loan_name.toLowerCase().includes(search.toLowerCase()) ||
        l.bank_name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      const matchesType = typeFilter === 'all' || l.loan_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [loans, search, statusFilter, typeFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (loan: DatabaseLoan) => {
    setEditing(loan);
    setForm({ ...loan });
    setModalOpen(true);
  };

  const set = (k: keyof FormState, v: string | number | null) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.loan_name || !form.bank_name) {
      toast.error('Loan name and bank name are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await update(editing.id, form);
        toast.success('Loan updated');
      } else {
        await create(form);
        toast.success('Loan added');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save loan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await remove(deleteId);
      toast.success('Loan deleted');
      setDeleteId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Loan Management"
        subtitle="Track and manage all your loans in one place"
        action={<button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Loan</button>}
      />

      {/* Filters */}
      <div className="card mb-6 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by loan name or bank..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field pl-9 pr-8 appearance-none">
                <option value="all">All Status</option>
                {statuses.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field pl-9 pr-8 appearance-none">
                <option value="all">All Types</option>
                {loanTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden animate-fade-in-up">
        {loading ? (
          <LoadingSpinner label="Loading loans..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Landmark}
            title={loans.length === 0 ? 'No loans yet' : 'No matching loans'}
            description={loans.length === 0 ? 'Add your first loan to start tracking your debt' : 'Try adjusting your filters'}
            action={loans.length === 0 ? <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Loan</button> : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-700/60 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3.5 font-semibold">Loan Name</th>
                  <th className="px-5 py-3.5 font-semibold">Bank</th>
                  <th className="px-5 py-3.5 font-semibold">Type</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Outstanding</th>
                  <th className="px-5 py-3.5 font-semibold text-right">EMI</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Interest</th>
                  <th className="px-5 py-3.5 font-semibold">Due Date</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-100">{loan.loan_name}</td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{loan.bank_name}</td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{loan.loan_type}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(Number(loan.outstanding_amount))}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600 dark:text-slate-300">{formatCurrency(Number(loan.emi))}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600 dark:text-slate-300">{Number(loan.interest_rate).toFixed(1)}%</td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{loan.due_date ? formatDate(loan.due_date) : '—'}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={loan.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewLoan(loan)} className="btn-ghost !p-2" title="View"><Eye size={15} /></button>
                        <button onClick={() => openEdit(loan)} className="btn-ghost !p-2" title="Edit"><Pencil size={15} /></button>
                        <button onClick={() => setDeleteId(loan.id)} className="btn-ghost !p-2 text-slate-400 hover:text-danger-500" title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Loan' : 'Add New Loan'}
        subtitle="Enter the loan details below"
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Loan Name *">
              <input value={form.loan_name} onChange={(e) => set('loan_name', e.target.value)} className="input-field" placeholder="e.g. HDFC Personal Loan" required />
            </Field>
            <Field label="Bank Name *">
              <input value={form.bank_name} onChange={(e) => set('bank_name', e.target.value)} className="input-field" placeholder="e.g. HDFC Bank" required />
            </Field>
            <Field label="Loan Type">
              <select value={form.loan_type} onChange={(e) => set('loan_type', e.target.value)} className="input-field">
                {loanTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Loan Status">
              <select value={form.status} onChange={(e) => set('status', e.target.value as Status)} className="input-field">
                {statuses.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Outstanding Amount">
              <input type="number" value={form.outstanding_amount || ''} onChange={(e) => set('outstanding_amount', Number(e.target.value))} className="input-field" placeholder="0" min={0} />
            </Field>
            <Field label="Monthly EMI">
              <input type="number" value={form.emi || ''} onChange={(e) => set('emi', Number(e.target.value))} className="input-field" placeholder="0" min={0} />
            </Field>
            <Field label="Interest Rate (%)">
              <input type="number" step="0.1" value={form.interest_rate || ''} onChange={(e) => set('interest_rate', Number(e.target.value))} className="input-field" placeholder="0" min={0} />
            </Field>
            <Field label="Overdue Months">
              <input type="number" value={form.overdue_months || ''} onChange={(e) => set('overdue_months', Number(e.target.value))} className="input-field" placeholder="0" min={0} />
            </Field>
            <Field label="Monthly Income">
              <input type="number" value={form.monthly_income || ''} onChange={(e) => set('monthly_income', Number(e.target.value))} className="input-field" placeholder="0" min={0} />
            </Field>
            <Field label="Due Date">
              <input type="date" value={form.due_date ?? ''} onChange={(e) => set('due_date', e.target.value || null)} className="input-field" />
            </Field>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <>{editing ? 'Update' : 'Save'} Loan</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewLoan} onClose={() => setViewLoan(null)} title="Loan Details" size="md">
        {viewLoan && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Detail label="Loan Name" value={viewLoan.loan_name} />
              <Detail label="Bank" value={viewLoan.bank_name} />
              <Detail label="Type" value={viewLoan.loan_type} />
              <Detail label="Status" value={<StatusBadge status={viewLoan.status} />} />
              <Detail label="Outstanding" value={formatCurrency(Number(viewLoan.outstanding_amount))} />
              <Detail label="Monthly EMI" value={formatCurrency(Number(viewLoan.emi))} />
              <Detail label="Interest Rate" value={`${Number(viewLoan.interest_rate).toFixed(2)}%`} />
              <Detail label="Overdue Months" value={String(viewLoan.overdue_months)} />
              <Detail label="Monthly Income" value={formatCurrency(Number(viewLoan.monthly_income))} />
              <Detail label="Due Date" value={viewLoan.due_date ? formatDate(viewLoan.due_date) : '—'} />
            </div>
            <div className="flex gap-3 pt-3">
              <button onClick={() => { openEdit(viewLoan); setViewLoan(null); }} className="btn-secondary flex-1"><Pencil size={15} /> Edit</button>
              <button onClick={() => setViewLoan(null)} className="btn-primary flex-1">Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Loan?" size="sm">
        <p className="text-sm text-slate-600 dark:text-slate-300">This action cannot be undone. The loan and its related data will be permanently removed.</p>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleDelete} className="btn-primary flex-1 !bg-danger-600 !from-danger-600 !to-danger-700 hover:!shadow-danger-600/40"><Trash2 size={15} /> Delete</button>
        </div>
      </Modal>
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

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50/60 dark:bg-slate-800/40 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{value}</p>
    </div>
  );
}

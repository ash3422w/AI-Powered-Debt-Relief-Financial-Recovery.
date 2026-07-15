import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Briefcase, DollarSign, Pencil, LogOut, Camera,
  Lock, Eye, EyeOff, Save, ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/layout/DashboardLayout';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/format';

export default function Profile() {
  const { profile, user, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    occupation: profile?.occupation || '',
    monthly_income: profile?.monthly_income || 0,
  });
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });

  const openEdit = () => {
    setForm({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      occupation: profile?.occupation || '',
      monthly_income: profile?.monthly_income || 0,
    });
    setEditOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateProfile({
      full_name: form.full_name,
      phone: form.phone,
      occupation: form.occupation,
      monthly_income: form.monthly_income,
    });
    setSaving(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Profile updated');
    setEditOpen(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.next.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pwd.next !== pwd.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwd.next });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Password updated');
    setPwdOpen(false);
    setPwd({ current: '', next: '', confirm: '' });
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/');
  };

  if (!profile) {
    return <DashboardLayout><LoadingSpinner label="Loading profile..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <PageHeader title="User Profile" subtitle="Manage your account and preferences" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="card animate-fade-in-up text-center lg:col-span-1">
          <div className="relative inline-block">
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 flex items-center justify-center text-white text-4xl font-bold font-display shadow-glow mx-auto">
              {(profile.full_name || 'U').charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-slate-500 hover:text-primary-600 ring-2 ring-slate-100 dark:ring-slate-700">
              <Camera size={14} />
            </button>
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white mt-4">{profile.full_name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>

          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-success-100 dark:bg-success-500/15 px-3 py-1.5 text-xs font-semibold text-success-700 dark:text-success-300">
            <ShieldCheck size={13} /> Verified Account
          </div>

          <div className="mt-6 space-y-2">
            <button onClick={openEdit} className="btn-primary w-full"><Pencil size={15} /> Edit Profile</button>
            <button onClick={() => setPwdOpen(true)} className="btn-secondary w-full"><Lock size={15} /> Change Password</button>
            <button onClick={handleLogout} className="btn-ghost w-full text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10"><LogOut size={15} /> Logout</button>
          </div>
        </div>

        {/* Details */}
        <div className="card animate-fade-in-up lg:col-span-2" style={{ animationDelay: '80ms' }}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-5">Account Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Detail icon={User} label="Full Name" value={profile.full_name || '—'} />
            <Detail icon={Mail} label="Email" value={profile.email} />
            <Detail icon={Phone} label="Phone" value={profile.phone || '—'} />
            <Detail icon={Briefcase} label="Occupation" value={profile.occupation || '—'} />
            <Detail icon={DollarSign} label="Monthly Income" value={profile.monthly_income ? formatCurrency(Number(profile.monthly_income)) : '—'} />
            <Detail icon={ShieldCheck} label="User ID" value={user?.id.slice(0, 8) + '...'} />
          </div>

          <div className="mt-6 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-500/10 dark:to-secondary-500/10 p-5">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Account Security</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your account is protected with JWT authentication and row-level security. Your financial data is encrypted and only accessible to you.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" subtitle="Update your personal information" size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
            <input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Occupation</label>
            <input value={form.occupation} onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))} className="input-field" placeholder="e.g. Software Engineer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Monthly Income</label>
            <input type="number" value={form.monthly_income || ''} onChange={(e) => setForm((f) => ({ ...f, monthly_income: Number(e.target.value) }))} className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setEditOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <><Save size={15} /> Save Changes</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal open={pwdOpen} onClose={() => setPwdOpen(false)} title="Change Password" subtitle="Update your account password" size="sm">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
            <div className="relative">
              <input type={showPwd.next ? 'text' : 'password'} value={pwd.next} onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))} className="input-field pr-10" required />
              <button type="button" onClick={() => setShowPwd((s) => ({ ...s, next: !s.next }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPwd.next ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
            <div className="relative">
              <input type={showPwd.confirm ? 'text' : 'password'} value={pwd.confirm} onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))} className="input-field pr-10" required />
              <button type="button" onClick={() => setShowPwd((s) => ({ ...s, confirm: !s.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPwd.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setPwdOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

function Detail({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50/60 dark:bg-slate-800/40 p-4">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
        <Icon size={14} /> {label}
      </div>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{value}</p>
    </div>
  );
}

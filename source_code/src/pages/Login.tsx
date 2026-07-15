import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Welcome back!');
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen mesh-bg grid lg:grid-cols-2">
      {/* Left — brand panel */}
      <div className="hidden lg:flex relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg-animated" />
        <div className="relative flex flex-col justify-between p-12 text-white w-full">
          <Link to="/"><Logo showText={false} size="lg" /></Link>
          <div>
            <h2 className="text-4xl font-bold font-display leading-tight text-balance">
              Welcome back to your financial recovery
            </h2>
            <p className="mt-4 text-white/80 text-lg max-w-md">
              Sign in to access your AI-powered debt dashboard, settlement recommendations, and negotiation letters.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { icon: Sparkles, text: 'AI settlement recommendations in seconds' },
                { icon: ShieldCheck, text: 'Bank-grade security with JWT authentication' },
                { icon: ArrowRight, text: 'Track every loan in one dashboard' },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur">
                    <f.icon size={17} className="text-white" />
                  </div>
                  <span className="text-white/90 text-sm">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-white/60 text-sm">© {new Date().getFullYear()} DebtRelief AI</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="lg:hidden mb-8"><Logo /></div>
          <div className="glass-card p-8">
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Sign in</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter your credentials to access your dashboard</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-10"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
                {loading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                ) : (
                  <><LogIn size={18} /> Login</>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
                Register
              </Link>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">
            <Link to="/" className="hover:text-primary-600">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

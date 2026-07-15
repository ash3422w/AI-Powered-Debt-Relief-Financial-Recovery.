import { Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, ShieldCheck, Zap, Brain, Smartphone, MousePointerClick,
  Landmark, HeartPulse, FileText, BarChart3, Lock, Github, Linkedin, Mail, Twitter,
  CheckCircle2, TrendingDown, Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import Logo from '../components/Logo';

const features = [
  { icon: Sparkles, title: 'AI Settlement Recommendation', desc: 'Gemini-powered analysis of your debt profile with realistic settlement percentages, risk assessment, and negotiation priorities.', color: 'from-primary-500 to-primary-700' },
  { icon: HeartPulse, title: 'Financial Health Analysis', desc: 'Real-time scoring of your debt-to-income ratio, EMI burden, savings rate, and credit health with visual dashboards.', color: 'from-secondary-500 to-secondary-700' },
  { icon: FileText, title: 'AI Negotiation Letter Generator', desc: 'Generate professional settlement letters, emails, and hardship letters tailored to your lender in seconds.', color: 'from-accent-500 to-accent-700' },
  { icon: Landmark, title: 'Loan Management', desc: 'Track every loan — bank, type, outstanding balance, EMI, interest rate, overdue status — in one organized dashboard.', color: 'from-success-500 to-success-700' },
  { icon: BarChart3, title: 'Dashboard Analytics', desc: 'Interactive charts for EMI distribution, debt breakdown, settlement progress, and income vs expenses.', color: 'from-warning-500 to-warning-700' },
  { icon: Lock, title: 'Secure Authentication', desc: 'JWT-based login with row-level security. Your financial data is encrypted and isolated to your account.', color: 'from-danger-500 to-danger-700' },
];

const benefits = [
  { icon: Brain, title: 'AI Powered', desc: 'Google Gemini drives every recommendation, letter, and analysis.' },
  { icon: ShieldCheck, title: 'Secure', desc: 'Row-level security, JWT auth, encrypted at rest.' },
  { icon: Zap, title: 'Fast', desc: 'Instant insights. Generate letters in under 10 seconds.' },
  { icon: Sparkles, title: 'Intelligent', desc: 'Context-aware advice that learns from your loan portfolio.' },
  { icon: Smartphone, title: 'Responsive', desc: 'Pixel-perfect on mobile, tablet, and desktop.' },
  { icon: MousePointerClick, title: 'Easy to Use', desc: 'No financial jargon. Clean, guided workflows.' },
];

const steps = [
  { icon: Wallet, title: 'Add Your Loans', desc: 'Enter your outstanding debts, EMIs, and income.' },
  { icon: Sparkles, title: 'Get AI Analysis', desc: 'Gemini computes your settlement options and health score.' },
  { icon: FileText, title: 'Generate Letters', desc: 'Produce professional negotiation letters instantly.' },
  { icon: TrendingDown, title: 'Recover Financially', desc: 'Follow the strategy and track your progress.' },
];

export default function Home() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen mesh-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-40 glass border-b border-white/20 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
            <a href="#benefits" className="hover:text-primary-600 transition-colors">Benefits</a>
            <a href="#how" className="hover:text-primary-600 transition-colors">How it Works</a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="btn-ghost !p-2.5">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {user ? (
              <Link to="/dashboard" className="btn-primary !py-2.5">Dashboard <ArrowRight size={16} /></Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Login</Link>
                <Link to="/register" className="btn-primary !py-2.5">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-20 -right-20 h-72 w-72 rounded-full bg-secondary-500/20 blur-3xl animate-pulse-slow" />
        <div className="absolute top-40 -left-20 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-28 grid lg:grid-cols-2 gap-12 items-center relative">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 dark:bg-primary-500/15 px-3 py-1.5 text-xs font-semibold text-primary-700 dark:text-primary-300 mb-5">
              <Sparkles size={14} /> Powered by Google Gemini AI
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold font-display tracking-tight text-slate-900 dark:text-white text-balance leading-[1.1]">
              AI-Powered <span className="gradient-text">Debt Relief</span> & Financial Recovery
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-xl">
              Get intelligent settlement recommendations, AI-generated negotiation letters, and a complete
              financial health dashboard. Take control of your debt with the power of artificial intelligence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary text-base !px-7 !py-3.5">
                Get Started <ArrowRight size={18} />
              </Link>
              <a href="#features" className="btn-secondary text-base !px-7 !py-3.5">
                Learn More
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-success-500" /> No credit card</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-success-500" /> Bank-grade security</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-success-500" /> AI-powered</div>
            </div>
          </div>

          {/* AI Illustration */}
          <div className="relative animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="relative aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 gradient-bg-animated rounded-[2.5rem] opacity-90 shadow-2xl shadow-primary-600/40" />
              <div className="absolute inset-2 glass rounded-[2.25rem] flex flex-col p-6 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center"><Sparkles size={16} className="text-white" /></div>
                    <span className="font-semibold text-slate-800 dark:text-white text-sm">AI Analysis</span>
                  </div>
                  <span className="badge bg-success-100 text-success-700 dark:bg-success-500/15 dark:text-success-300">Live</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Health Score', value: '72', color: 'text-success-500', icon: HeartPulse },
                    { label: 'Stress Level', value: 'Moderate', color: 'text-warning-500', icon: TrendingDown },
                    { label: 'Settlement', value: '45%', color: 'text-primary-600', icon: Sparkles },
                    { label: 'Outstanding', value: '$24K', color: 'text-secondary-600', icon: Wallet },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl bg-white/60 dark:bg-slate-800/60 p-3">
                      <m.icon size={16} className={m.color} />
                      <p className="text-xs text-slate-400 mt-1.5">{m.label}</p>
                      <p className={`text-base font-bold ${m.color}`}>{m.value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-white/60 dark:bg-slate-800/60 p-3 flex-1">
                  <div className="flex items-end gap-1.5 h-20">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary-500 to-secondary-500" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Monthly EMI trend</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 h-20 w-20 rounded-2xl glass flex items-center justify-center shadow-glass animate-float">
                <Brain size={28} className="text-secondary-600" />
              </div>
              <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-2xl glass flex items-center justify-center shadow-glass animate-float" style={{ animationDelay: '3s' }}>
                <ShieldCheck size={24} className="text-success-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold font-display text-slate-900 dark:text-white">
            Everything you need to <span className="gradient-text">recover financially</span>
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Six powerful AI-driven modules working together to get you out of debt faster.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="card card-hover group animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon size={22} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold font-display text-slate-900 dark:text-white">
            How it <span className="gradient-text">works</span>
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Four simple steps from debt to recovery.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="relative animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="card text-center h-full">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg mx-auto mb-4">
                  <s.icon size={22} className="text-white" />
                </div>
                <div className="absolute top-4 right-4 h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5">{s.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose / Benefits */}
      <section id="benefits" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-bg-animated opacity-95" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold font-display text-white">
              Why choose our platform
            </h2>
            <p className="mt-4 text-white/80">Built for speed, security, and intelligence.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div
                key={b.title}
                className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 text-white hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <b.icon size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-1.5">{b.title}</h3>
                <p className="text-sm text-white/80">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 lg:px-8 py-20">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 gradient-bg-animated" />
          <div className="relative px-6 py-16 lg:py-20 text-center">
            <h2 className="text-3xl lg:text-5xl font-bold font-display text-white text-balance">
              Ready to take control of your debt?
            </h2>
            <p className="mt-4 text-white/85 text-lg max-w-xl mx-auto">
              Join thousands using AI to negotiate better settlements and rebuild their financial health.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 mt-8 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-primary-700 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all">
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Logo />
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                AI-powered debt relief and financial recovery platform. Intelligent settlement recommendations,
                negotiation letters, and financial health analysis — all in one place.
              </p>
              <div className="flex items-center gap-3 mt-5">
                {[
                  { icon: Github, href: 'https://github.com', label: 'GitHub' },
                  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
                  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
                  { icon: Mail, href: 'mailto:hello@debtrelief.ai', label: 'Email' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all"
                    aria-label={s.label}
                  >
                    <s.icon size={17} />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><a href="#features" className="hover:text-primary-600">Features</a></li>
                <li><Link to="/register" className="hover:text-primary-600">Get Started</Link></li>
                <li><Link to="/login" className="hover:text-primary-600">Login</Link></li>
                <li><a href="#how" className="hover:text-primary-600">How it Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-primary-600">About</a></li>
                <li><a href="#" className="hover:text-primary-600">Contact</a></li>
                <li><a href="#" className="hover:text-primary-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-600">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-400">© {new Date().getFullYear()} DebtRelief AI. All rights reserved.</p>
            <p className="text-xs text-slate-400">Built with React, Supabase & Google Gemini</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

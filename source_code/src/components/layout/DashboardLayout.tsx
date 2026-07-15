import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Landmark, Sparkles, FileText, HeartPulse, BarChart3,
  User, LogOut, Menu, X, Moon, Sun, Bell, Search, MessageSquareText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../Logo';
import AIChatDrawer from '../AIChatDrawer';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/loans', label: 'Loan Management', icon: Landmark },
  { to: '/settlement', label: 'AI Settlement', icon: Sparkles },
  { to: '/letter', label: 'AI Letter Generator', icon: FileText },
  { to: '/health', label: 'Financial Health', icon: HeartPulse },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const current = nav.find((n) => location.pathname.startsWith(n.to));

  return (
    <div className="min-h-screen mesh-bg">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col glass border-r border-white/20 dark:border-white/5">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/60 dark:border-slate-700/60">
            <Logo size="sm" />
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden btn-ghost !p-2">
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg shadow-primary-600/30'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-200/60 dark:border-slate-700/60 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 p-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold text-sm">
                {(profile?.full_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate">{profile?.email}</p>
              </div>
              <button onClick={handleSignOut} className="btn-ghost !p-2 text-slate-400 hover:text-danger-500" title="Sign out">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 glass border-b border-white/20 dark:border-white/5">
          <div className="flex items-center justify-between px-4 lg:px-8 py-3.5">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost !p-2">
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white font-display">
                  {current?.label || 'Dashboard'}
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/loans')}
                className="hidden md:flex items-center gap-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 px-3 py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Search size={16} />
                <span>Search loans...</span>
              </button>
              <button onClick={() => setChatOpen(true)} className="btn-ghost !p-2.5" title="AI Assistant">
                <MessageSquareText size={18} />
              </button>
              <button className="btn-ghost !p-2.5 relative" title="Notifications">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white dark:ring-slate-900" />
              </button>
              <button onClick={toggleTheme} className="btn-ghost !p-2.5" title="Toggle theme">
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 lg:px-8 py-6 max-w-[1600px] mx-auto page-enter">{children}</main>
      </div>

      {chatOpen && <AIChatDrawer onClose={() => setChatOpen(false)} />}
    </div>
  );
}

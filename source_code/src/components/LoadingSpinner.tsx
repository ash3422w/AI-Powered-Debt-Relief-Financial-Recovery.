import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 24, label }: { size?: number; label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <Loader2 size={size} className="animate-spin text-primary-600" />
      {label && <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );
}

export function FullPageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center mesh-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-2xl gradient-bg-animated flex items-center justify-center shadow-glow">
          <Loader2 size={32} className="animate-spin text-white" />
        </div>
        <p className="text-slate-600 dark:text-slate-300 font-medium">{label}</p>
      </div>
    </div>
  );
}

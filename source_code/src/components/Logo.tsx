import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Logo({ size = 'md', showText = true }: { size?: 'sm' | 'md' | 'lg'; showText?: boolean }) {
  const dims = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14' };
  const iconSize = { sm: 18, md: 22, lg: 30 };
  const textSize = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl' };

  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className={`${dims[size]} rounded-xl bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-600/30 group-hover:shadow-primary-600/50 transition-all duration-300 group-hover:scale-105`}>
        <Sparkles size={iconSize[size]} className="text-white" />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`${textSize[size]} font-bold font-display tracking-tight text-slate-900 dark:text-white`}>
            DebtRelief<span className="gradient-text"> AI</span>
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-medium">
              Financial Recovery
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

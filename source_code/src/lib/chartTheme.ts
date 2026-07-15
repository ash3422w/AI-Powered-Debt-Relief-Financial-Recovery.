import { useTheme } from '../context/ThemeContext';

export const CHART_COLORS = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  accent: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  palette: ['#2563eb', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#a78bfa'],
};

export function useChartTheme() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return {
    axis: { stroke: isDark ? '#475569' : '#94a3b8', fontSize: 12 },
    gridStroke: isDark ? '#1e293b' : '#e2e8f0',
    tooltip: {
      contentStyle: {
        backgroundColor: isDark ? 'rgba(17,25,40,0.95)' : 'rgba(255,255,255,0.95)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(226,232,240,0.8)'}`,
        borderRadius: '12px',
        fontSize: '12px',
        color: isDark ? '#e2e8f0' : '#1e293b',
        backdropFilter: 'blur(8px)',
      },
      labelStyle: { color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 },
    },
    isDark,
  };
}

// Recharts formatter helper — accepts the ValueType (which may be undefined) and coerces to number.
export const numFormatter = (fn: (v: number) => string) => (value: unknown) => fn(Number(value) || 0);

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatCurrencyDetailed(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function timeAgo(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/** EMI / income ratio — core debt stress metric. */
export function emiIncomeRatio(emi: number, income: number): number {
  if (income <= 0) return 0;
  return (emi / income) * 100;
}

/** Debt-to-income ratio including outstanding principal weighting. */
export function debtToIncomeRatio(totalOutstanding: number, monthlyIncome: number, months = 12): number {
  if (monthlyIncome <= 0) return 0;
  return ((totalOutstanding / months) / monthlyIncome) * 100;
}

export function stressLevelFromRatio(ratio: number): { label: string; color: string } {
  if (ratio < 30) return { label: 'Low', color: 'success' };
  if (ratio < 50) return { label: 'Moderate', color: 'warning' };
  if (ratio < 70) return { label: 'High', color: 'danger' };
  return { label: 'Critical', color: 'danger' };
}

/**
 * Financial Health Score — heuristic (0-100).
 * Higher savings and lower EMI burden produce a higher score.
 */
export function computeHealthScore(opts: {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyEmi: number;
}): number {
  const { monthlyIncome, monthlyExpenses, monthlyEmi } = opts;
  if (monthlyIncome <= 0) return 0;
  const savingsRate = Math.max(0, (monthlyIncome - monthlyExpenses - monthlyEmi) / monthlyIncome);
  const emiRatio = monthlyEmi / monthlyIncome;
  const burdenPenalty = Math.min(40, emiRatio * 80);
  const savingsBonus = Math.min(40, savingsRate * 100);
  const score = 50 + savingsBonus - burdenPenalty;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function creditHealthIndicator(score: number): { label: string; color: string } {
  if (score >= 75) return { label: 'Excellent', color: 'success' };
  if (score >= 60) return { label: 'Good', color: 'success' };
  if (score >= 40) return { label: 'Fair', color: 'warning' };
  if (score >= 20) return { label: 'Poor', color: 'danger' };
  return { label: 'Critical', color: 'danger' };
}

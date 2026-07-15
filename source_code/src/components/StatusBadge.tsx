type Status = 'active' | 'overdue' | 'settled' | 'closed';

const styles: Record<Status, string> = {
  active: 'bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300',
  overdue: 'bg-danger-100 text-danger-700 dark:bg-danger-500/15 dark:text-danger-300',
  settled: 'bg-success-100 text-success-700 dark:bg-success-500/15 dark:text-success-300',
  closed: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`badge ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

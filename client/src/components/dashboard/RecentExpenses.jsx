import { format } from 'date-fns';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function RecentExpenses({ expenses, users }) {
  const userMap = Object.fromEntries(users.map(u => [u._id, u.name]));
  userMap['wallet'] = 'Wallet';

  if (!expenses.length) return <p className="py-6 text-center text-sm text-gray-600">No expenses yet.</p>;

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
      {expenses.slice(0, 8).map(e => (
        <div key={e._id} className="flex items-center justify-between rounded-xl bg-gray-800/30 px-3 py-2.5 transition-colors hover:bg-gray-800/50">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-200">{e.description}</p>
            <p className="text-xs text-gray-500">{userMap[e.payerId] || 'Unknown'} · {format(new Date(e.date), 'dd MMM')}</p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-gray-300">{fmt(e.amount)}</span>
        </div>
      ))}
    </div>
  );
}

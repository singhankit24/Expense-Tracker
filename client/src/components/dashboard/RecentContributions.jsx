import { format } from 'date-fns';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function RecentContributions({ contributions, users }) {
  const userMap = Object.fromEntries(users.map(u => [u._id, u.name]));

  if (!contributions.length) return <p className="py-6 text-center text-sm text-gray-600">No contributions yet.</p>;

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
      {contributions.slice(0, 8).map(c => (
        <div key={c._id} className="flex items-center justify-between rounded-xl bg-gray-800/30 px-3 py-2.5 transition-colors hover:bg-gray-800/50">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-200">{userMap[c.contributorId] || 'Unknown'}</p>
            <p className="text-xs text-gray-500">{format(new Date(c.date), 'dd MMM yyyy')}</p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-emerald-400">+{fmt(c.amount)}</span>
        </div>
      ))}
    </div>
  );
}

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function ContributionChart({ contributions, users, expenses }) {
  const userMap = Object.fromEntries(users.map(u => [u._id, u.name]));

  // Compute total contribution per user (wallet contributions + personal payments)
  const dataMap = {};
  users.forEach(u => { dataMap[u._id] = { name: u.name, amount: 0 }; });

  contributions.forEach(c => {
    if (dataMap[c.contributorId]) dataMap[c.contributorId].amount += c.amount;
  });

  expenses.forEach(e => {
    if (e.payerId !== 'wallet' && dataMap[e.payerId]) dataMap[e.payerId].amount += e.amount;
  });

  const data = Object.values(dataMap).sort((a, b) => b.amount - a.amount);

  if (!data.length) return <p className="py-8 text-center text-sm text-gray-600">No data yet.</p>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '₹' + v.toLocaleString('en-IN')} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(75,85,99,0.4)', borderRadius: '12px', color: '#f3f4f6' }}
          formatter={(v) => ['₹' + Number(v).toLocaleString('en-IN'), 'Total']}
        />
        <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

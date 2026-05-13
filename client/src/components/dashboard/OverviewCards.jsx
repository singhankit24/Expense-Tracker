import { IndianRupee, Wallet, Users, PiggyBank, TrendingUp, TrendingDown } from 'lucide-react';

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const gradients = [
  'from-brand-600/20 to-purple-600/20',
  'from-cyan-600/20 to-blue-600/20',
  'from-amber-600/20 to-orange-600/20',
  'from-emerald-600/20 to-teal-600/20',
];
const iconColors = ['text-brand-400', 'text-cyan-400', 'text-amber-400', 'text-emerald-400'];

export default function OverviewCards({ expenses, contributions, users, currentUser, isAdmin }) {
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalContributions = contributions.reduce((s, c) => s + c.amount, 0);

  const walletExpenses = expenses.filter(e => e.payerId === 'wallet').reduce((s, e) => s + e.amount, 0);
  const walletBalance = totalContributions - walletExpenses;

  const myContribs = contributions.filter(c => c.contributorId === currentUser?._id).reduce((s, c) => s + c.amount, 0);
  const myPaid = expenses.filter(e => e.payerId === currentUser?._id).reduce((s, e) => s + e.amount, 0);
  const myContribution = myContribs + myPaid;

  const myShare = currentUser
    ? expenses.reduce((s, e) => {
        const p = e.participants?.find(p => p.userId === currentUser._id);
        return p ? s + p.share : s;
      }, 0)
    : 0;

  const cards = [
    { title: 'Total Expenses', value: fmt(totalExpenses), detail: 'This cycle spending', icon: IndianRupee, positive: true },
    { title: 'Group Wallet', value: fmt(walletBalance), detail: walletBalance >= 0 ? 'Healthy balance' : 'Deficit alert', icon: Wallet, positive: walletBalance >= 0 },
    { title: isAdmin ? 'Avg. per Member' : 'My Expense', value: fmt(isAdmin ? (users.length ? totalExpenses / users.length : 0) : myShare), detail: isAdmin ? 'Average burden' : 'Your share', icon: Users, positive: true },
    { title: 'My Contributions', value: fmt(myContribution), detail: 'Wallet + personal payments', icon: PiggyBank, positive: true },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={c.title} className="glass-card-hover p-4 animate-fade-up">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{c.title}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${gradients[i]}`}>
                <Icon size={16} className={iconColors[i]} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold font-display text-gray-100">{c.value}</p>
            <div className="mt-2 flex items-center gap-1 text-xs">
              {c.positive ? <TrendingUp size={12} className="text-emerald-400" /> : <TrendingDown size={12} className="text-red-400" />}
              <span className={c.positive ? 'text-gray-500' : 'text-red-400'}>{c.detail}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

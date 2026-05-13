import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import OverviewCards from '../components/dashboard/OverviewCards';
import RecentExpenses from '../components/dashboard/RecentExpenses';
import RecentContributions from '../components/dashboard/RecentContributions';
import ContributionChart from '../components/dashboard/ContributionChart';
import { CalendarDays, Plus, Wallet, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, group, isAdmin } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showContribForm, setShowContribForm] = useState(false);

  // Expense form
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expPayer, setExpPayer] = useState('wallet');
  const [expParticipants, setExpParticipants] = useState([]);
  const [expTags, setExpTags] = useState('');
  const [expBusy, setExpBusy] = useState(false);

  // Contribution form
  const [contribUser, setContribUser] = useState('');
  const [contribAmount, setContribAmount] = useState('');
  const [contribBusy, setContribBusy] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [e, c, u] = await Promise.all([
        api.get('/expenses?limit=10'),
        api.get('/contributions?limit=10'),
        api.get('/users'),
      ]);
      setExpenses(e.data.expenses);
      setContributions(c.data.contributions);
      setUsers(u.data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Initialize participants once users load
  useEffect(() => {
    if (users.length && expParticipants.length === 0) {
      setExpParticipants(users.map(u => u._id));
    }
  }, [users, expParticipants.length]);

  const addExpense = async (e) => {
    e.preventDefault();
    setExpBusy(true);
    try {
      await api.post('/expenses', {
        description: expDesc, amount: Number(expAmount), payerId: expPayer,
        tags: expTags.split(',').map(t => t.trim()).filter(Boolean),
        participants: expParticipants,
      });
      setExpDesc(''); setExpAmount(''); setExpTags(''); setShowExpenseForm(false);
      fetchData();
    } catch { /* ignore */ }
    setExpBusy(false);
  };

  const addContribution = async (e) => {
    e.preventDefault();
    setContribBusy(true);
    try {
      await api.post('/contributions', { contributorId: contribUser, amount: Number(contribAmount) });
      setContribUser(''); setContribAmount(''); setShowContribForm(false);
      fetchData();
    } catch { /* ignore */ }
    setContribBusy(false);
  };

  const toggleParticipant = (id) => {
    setExpParticipants(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-gray-500">Loading dashboard…</div>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayLabel = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-up">
      {/* Welcome banner */}
      <div className="glass-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-gray-500">{group?.groupName || 'Expense Tracker'}</p>
            <h2 className="mt-1 text-2xl font-bold font-display text-gray-100 sm:text-3xl">
              {greeting}, <span className="gradient-text">{user?.name}</span>
            </h2>
            <p className="mt-1 text-sm text-gray-500">Track group spending and monitor wallet performance.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge bg-brand-500/15 text-brand-400 border border-brand-500/20">{isAdmin ? 'Admin' : 'Member'}</span>
            <span className="badge bg-gray-800 text-gray-400 border border-gray-700/50 gap-1">
              <CalendarDays size={12} /> {todayLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons (admin only) */}
      {isAdmin && (
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setShowContribForm(!showContribForm)} className="btn-brand flex items-center gap-2 text-sm py-2.5">
            <Wallet size={16} /> Add Contribution
          </button>
          <button onClick={() => setShowExpenseForm(!showExpenseForm)} className="btn-outline flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Expense
          </button>
        </div>
      )}

      {/* Contribution form */}
      {showContribForm && (
        <form onSubmit={addContribution} className="glass-card p-5 animate-fade-in space-y-4">
          <h3 className="text-sm font-semibold text-gray-300">New Contribution</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select value={contribUser} onChange={e => setContribUser(e.target.value)} className="glass-input" required>
              <option value="">Select member</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <input type="number" value={contribAmount} onChange={e => setContribAmount(e.target.value)} placeholder="Amount (₹)" className="glass-input" required />
            <button type="submit" className="btn-brand flex items-center justify-center gap-2" disabled={contribBusy}>
              {contribBusy ? <Loader2 size={16} className="animate-spin" /> : null} Save
            </button>
          </div>
        </form>
      )}

      {/* Expense form */}
      {showExpenseForm && (
        <form onSubmit={addExpense} className="glass-card p-5 animate-fade-in space-y-4">
          <h3 className="text-sm font-semibold text-gray-300">New Expense</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="Description" className="glass-input" required />
            <input type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="Amount (₹)" className="glass-input" required />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select value={expPayer} onChange={e => setExpPayer(e.target.value)} className="glass-input">
              <option value="wallet">Wallet</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <input value={expTags} onChange={e => setExpTags(e.target.value)} placeholder="Tags (comma-separated)" className="glass-input" />
          </div>
          {/* Participants */}
          <div>
            <p className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Split between</p>
            <div className="flex flex-wrap gap-2">
              {users.map(u => (
                <button key={u._id} type="button" onClick={() => toggleParticipant(u._id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all
                    ${expParticipants.includes(u._id)
                      ? 'border-brand-500/40 bg-brand-500/15 text-brand-400'
                      : 'border-gray-700 bg-gray-800/40 text-gray-500 hover:border-gray-600'}`}>
                  {u.name}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-brand flex items-center justify-center gap-2" disabled={expBusy}>
            {expBusy ? <Loader2 size={16} className="animate-spin" /> : null} Add Expense
          </button>
        </form>
      )}

      {/* Overview cards */}
      <OverviewCards expenses={expenses} contributions={contributions} users={users} currentUser={user} isAdmin={isAdmin} />

      {/* Chart */}
      <div className="glass-card p-5">
        <h3 className="mb-4 text-lg font-semibold text-gray-200 font-display">Member Contributions</h3>
        <ContributionChart contributions={contributions} users={users} expenses={expenses} />
      </div>

      {/* Recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="mb-4 text-lg font-semibold text-gray-200 font-display">Recent Expenses</h3>
          <RecentExpenses expenses={expenses} users={users} />
        </div>
        <div className="glass-card p-5">
          <h3 className="mb-4 text-lg font-semibold text-gray-200 font-display">Recent Contributions</h3>
          <RecentContributions contributions={contributions} users={users} />
        </div>
      </div>
    </div>
  );
}

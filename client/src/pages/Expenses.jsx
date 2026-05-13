import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { format } from 'date-fns';
import { Pencil, Trash2, Loader2, X } from 'lucide-react';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function Expenses() {
  const { isAdmin } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);

  // Edit state
  const [editing, setEditing] = useState(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editPayer, setEditPayer] = useState('');
  const [editDate, setEditDate] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchExpenses = useCallback(async (s = 0) => {
    const [e, u] = await Promise.all([api.get(`/expenses?limit=20&skip=${s}`), api.get('/users')]);
    if (s === 0) setExpenses(e.data.expenses);
    else setExpenses(prev => [...prev, ...e.data.expenses]);
    setHasMore(e.data.hasMore);
    setUsers(u.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchExpenses(0); }, [fetchExpenses]);

  const loadMore = () => { const next = skip + 20; setSkip(next); fetchExpenses(next); };

  const userMap = Object.fromEntries(users.map(u => [u._id, u.name]));
  userMap['wallet'] = 'Wallet';

  const openEdit = (e) => {
    setEditing(e); setEditDesc(e.description); setEditAmount(String(e.amount));
    setEditPayer(e.payerId); setEditDate(format(new Date(e.date), 'yyyy-MM-dd'));
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/expenses/${editing._id}`, { description: editDesc, amount: Number(editAmount), payerId: editPayer, date: editDate });
      setEditing(null); setSkip(0); fetchExpenses(0);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const deleteExpense = async (id) => {
    if (!confirm('Delete this expense?')) return;
    await api.delete(`/expenses/${id}`);
    setSkip(0); fetchExpenses(0);
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-gray-500">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-100">Expense History</h1>
        <p className="text-sm text-gray-500">All recorded group expenses</p>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-800/50">
          {expenses.map(e => (
            <div key={e._id} className="p-4 space-y-2">
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-200">{e.description}</p>
                  <p className="text-xs text-gray-500">{userMap[e.payerId] || '?'} · {format(new Date(e.date), 'dd/MM/yyyy')}</p>
                </div>
                <span className="shrink-0 font-semibold text-gray-300">{fmt(e.amount)}</span>
              </div>
              {e.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {e.tags.map(t => <span key={t} className="badge bg-gray-800 text-gray-400 text-[10px] border border-gray-700/50">{t}</span>)}
                </div>
              )}
              {isAdmin && (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => openEdit(e)} className="btn-outline py-1.5 px-3 text-xs flex items-center gap-1"><Pencil size={12}/>Edit</button>
                  <button onClick={() => deleteExpense(e._id)} className="btn-danger py-1.5 px-3 text-xs flex items-center gap-1"><Trash2 size={12}/>Delete</button>
                </div>
              )}
            </div>
          ))}
          {!expenses.length && <p className="p-8 text-center text-gray-600">No expenses found.</p>}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-800/50 text-left text-xs uppercase tracking-wider text-gray-500">
              <th className="px-5 py-3">Description</th><th className="px-5 py-3">Paid by</th>
              <th className="px-5 py-3">Date</th><th className="px-5 py-3 text-right">Amount</th>
              {isAdmin && <th className="px-5 py-3 text-right">Actions</th>}
            </tr></thead>
            <tbody className="divide-y divide-gray-800/30">
              {expenses.map(e => (
                <tr key={e._id} className="transition-colors hover:bg-gray-800/20">
                  <td className="px-5 py-3">
                    <span className="font-medium text-gray-200">{e.description}</span>
                    {e.tags?.length > 0 && <div className="mt-1 flex flex-wrap gap-1">{e.tags.map(t => <span key={t} className="badge bg-gray-800 text-gray-400 text-[10px] border border-gray-700/50">{t}</span>)}</div>}
                  </td>
                  <td className="px-5 py-3 text-gray-400">{userMap[e.payerId] || '?'}</td>
                  <td className="px-5 py-3 text-gray-500">{format(new Date(e.date), 'dd MMM yyyy')}</td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-300">{fmt(e.amount)}</td>
                  {isAdmin && <td className="px-5 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(e)} className="btn-outline py-1 px-2 text-xs"><Pencil size={12}/></button>
                    <button onClick={() => deleteExpense(e._id)} className="btn-danger py-1 px-2 text-xs"><Trash2 size={12}/></button>
                  </td>}
                </tr>
              ))}
              {!expenses.length && <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-600">No expenses.</td></tr>}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="border-t border-gray-800/40 p-4 text-center">
            <button onClick={loadMore} className="btn-outline">Load More</button>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setEditing(null)}>
          <div className="glass-card w-full max-w-md p-6 space-y-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-200">Edit Expense</h3>
              <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-300"><X size={20}/></button>
            </div>
            <input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="glass-input" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} className="glass-input" />
              <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="glass-input" />
            </div>
            <select value={editPayer} onChange={e => setEditPayer(e.target.value)} className="glass-input">
              <option value="wallet">Wallet</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setEditing(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={saveEdit} className="btn-brand flex-1 flex items-center justify-center gap-2" disabled={saving}>
                {saving && <Loader2 size={14} className="animate-spin"/>} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

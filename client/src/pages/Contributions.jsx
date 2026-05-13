import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function Contributions() {
  const { isAdmin } = useAuth();
  const [contributions, setContributions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);

  const fetchData = useCallback(async (s = 0) => {
    const [c, u] = await Promise.all([api.get(`/contributions?limit=20&skip=${s}`), api.get('/users')]);
    if (s === 0) setContributions(c.data.contributions);
    else setContributions(prev => [...prev, ...c.data.contributions]);
    setHasMore(c.data.hasMore);
    setUsers(u.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(0); }, [fetchData]);

  const loadMore = () => { const next = skip + 20; setSkip(next); fetchData(next); };

  const userMap = Object.fromEntries(users.map(u => [u._id, u.name]));

  const deleteContrib = async (id) => {
    if (!confirm('Delete this contribution?')) return;
    await api.delete(`/contributions/${id}`);
    setSkip(0); fetchData(0);
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-gray-500">Loading…</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-100">Contribution History</h1>
        <p className="text-sm text-gray-500">All wallet contributions</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-gray-800/50">
          {contributions.map(c => (
            <div key={c._id} className="flex items-center justify-between p-4 transition-colors hover:bg-gray-800/20">
              <div className="min-w-0">
                <p className="font-medium text-gray-200">{userMap[c.contributorId] || 'Unknown'}</p>
                <p className="text-xs text-gray-500">{format(new Date(c.date), 'dd MMM yyyy, h:mm a')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-emerald-400">+{fmt(c.amount)}</span>
                {isAdmin && (
                  <button onClick={() => deleteContrib(c._id)} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                )}
              </div>
            </div>
          ))}
          {!contributions.length && <p className="p-8 text-center text-gray-600">No contributions yet.</p>}
        </div>
        {hasMore && (
          <div className="border-t border-gray-800/40 p-4 text-center">
            <button onClick={loadMore} className="btn-outline">Load More</button>
          </div>
        )}
      </div>
    </div>
  );
}

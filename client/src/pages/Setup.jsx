import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react';

export default function Setup() {
  const { setup } = useAuth();
  const navigate = useNavigate();
  const [groupId, setGroupId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [members, setMembers] = useState([]);
  const [memberName, setMemberName] = useState('');
  const [memberPin, setMemberPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const addMember = () => {
    if (!memberName.trim()) return;
    setMembers([...members, { name: memberName.trim(), pin: memberPin || '123456' }]);
    setMemberName('');
    setMemberPin('');
  };

  const removeMember = (i) => setMembers(members.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await setup({ groupId, groupName: groupName || groupId, adminName, adminPassword, members });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Setup failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[100px]" />

      <div className="w-full max-w-lg animate-fade-up">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 shadow-xl shadow-brand-500/25">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-display gradient-text">Create New Group</h1>
          <p className="mt-1 text-sm text-gray-500">Set up your shared expense tracker</p>
        </div>

        <div className="glass-card p-6 sm:p-8">
          {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400 uppercase tracking-wider">Group ID</label>
                <input value={groupId} onChange={e => setGroupId(e.target.value)} placeholder="my-home" className="glass-input" required />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400 uppercase tracking-wider">Group Name</label>
                <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="My Home" className="glass-input" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400 uppercase tracking-wider">Admin Name</label>
                <input value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="Your name" className="glass-input" required />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400 uppercase tracking-wider">Admin Password</label>
                <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Min 6 chars" className="glass-input" required />
              </div>
            </div>

            {/* Add members */}
            <div className="rounded-xl border border-gray-800/50 bg-gray-900/30 p-4">
              <p className="mb-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Members (optional)</p>
              {members.length > 0 && (
                <div className="mb-3 space-y-2">
                  {members.map((m, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-gray-800/40 px-3 py-2">
                      <span className="text-sm text-gray-300">{m.name}</span>
                      <button type="button" onClick={() => removeMember(i)} className="text-gray-500 hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input value={memberName} onChange={e => setMemberName(e.target.value)} placeholder="Member name" className="glass-input flex-1" />
                <input value={memberPin} onChange={e => setMemberPin(e.target.value)} placeholder="PIN" className="glass-input w-24" />
                <button type="button" onClick={addMember} className="btn-outline px-3"><Plus size={16} /></button>
              </div>
            </div>

            <button type="submit" className="btn-brand w-full flex items-center justify-center gap-2" disabled={busy}>
              {busy ? <Loader2 size={18} className="animate-spin" /> : null}
              {busy ? 'Creating…' : 'Create Group'}
            </button>
          </form>

          <div className="mt-5 border-t border-gray-800/60 pt-4">
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-brand-400 transition-colors">
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

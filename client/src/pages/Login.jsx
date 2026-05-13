import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');         // 'login' | 'register'
  const [groupId, setGroupId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(groupId, name, password);
      } else {
        await register(groupId, name, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-600/20 blur-[120px] animate-pulse" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-brand-500/10 blur-[100px]" />

      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 shadow-2xl shadow-brand-500/30">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display gradient-text">Expense Tracker</h1>
          <p className="mt-2 text-sm text-gray-500">Track group spending effortlessly</p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8">
          {/* Mode tabs */}
          <div className="mb-6 flex rounded-xl bg-gray-800/50 p-1">
            <button onClick={() => setMode('login')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${mode === 'login' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-gray-400 hover:text-gray-200'}`}>
              Sign In
            </button>
            <button onClick={() => setMode('register')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${mode === 'register' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-gray-400 hover:text-gray-200'}`}>
              Join Group
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400 uppercase tracking-wider">Group ID</label>
              <input value={groupId} onChange={e => setGroupId(e.target.value)} placeholder="e.g. my-home"
                className="glass-input" required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400 uppercase tracking-wider">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                className="glass-input" required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400 uppercase tracking-wider">
                {mode === 'login' ? 'Password / PIN' : 'Create PIN (min 4 chars)'}
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'login' ? 'Enter password or PIN' : 'Create a PIN'}
                className="glass-input" required />
            </div>

            <button type="submit" className="btn-brand w-full flex items-center justify-center gap-2" disabled={busy}>
              {busy ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Join Group'}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-800/60 pt-4">
            <Link to="/setup" className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-brand-400 transition-colors">
              Create a new group <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">Made with ❤ by Ankit</p>
      </div>
    </div>
  );
}

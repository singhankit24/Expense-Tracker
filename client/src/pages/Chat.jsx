import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { format } from 'date-fns';
import { Send, Loader2 } from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await api.get('/messages?limit=100');
      setMessages(data);
      setLoading(false);
      // Mark as read
      api.put('/messages/read').catch(() => {});
    } catch { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 4000);   // poll every 4s
    return () => clearInterval(intervalRef.current);
  }, [fetchMessages]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { text: text.trim() });
      setText('');
      fetchMessages();
    } catch { /* ignore */ }
    setSending(false);
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-gray-500">Loading chat…</div>;

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col animate-fade-up">
      {/* Messages */}
      <div className="glass-card flex-1 overflow-y-auto p-4 space-y-4 mb-4">
        {messages.map(m => {
          const isOwn = m.userId === user?._id;
          return (
            <div key={m._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isOwn
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-br-sm'
                : 'bg-gray-800/60 text-gray-200 rounded-bl-sm'}`}>
                {!isOwn && <p className="mb-0.5 text-xs font-semibold text-brand-400">{m.userName}</p>}
                <p className="text-sm leading-relaxed">{m.text}</p>
                <p className={`mt-1 text-[10px] ${isOwn ? 'text-white/60' : 'text-gray-500'}`}>
                  {m.createdAt ? format(new Date(m.createdAt), 'h:mm a') : ''}
                </p>
              </div>
            </div>
          );
        })}
        {!messages.length && <p className="py-12 text-center text-gray-600">No messages yet. Say hi! 👋</p>}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="glass-card flex items-center gap-2 p-3">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message…"
          className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-200 outline-none placeholder-gray-600" disabled={sending} />
        <button type="submit" className="btn-brand py-2.5 px-4 flex items-center gap-2" disabled={sending || !text.trim()}>
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          <span className="hidden sm:inline">{sending ? 'Sending' : 'Send'}</span>
        </button>
      </form>
    </div>
  );
}

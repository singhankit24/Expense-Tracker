import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  // restore session from stored token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    api.get('/auth/me')
      .then(({ data }) => { setUser(data.user); setGroup(data.group); })
      .catch(() => { localStorage.removeItem('token'); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (groupId, name, password) => {
    const { data } = await api.post('/auth/login', { groupId, name, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setGroup(data.group);
    return data;
  }, []);

  const setup = useCallback(async (payload) => {
    const { data } = await api.post('/auth/setup', payload);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setGroup(data.group);
    return data;
  }, []);

  const register = useCallback(async (groupId, name, pin) => {
    const { data } = await api.post('/auth/register', { groupId, name, pin });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setGroup(data.group);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setGroup(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setGroup(data.group);
    } catch { /* ignore */ }
  }, []);

  return (
    <AuthContext.Provider value={{ user, group, isAdmin, loading, login, setup, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

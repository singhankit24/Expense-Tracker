import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Loader2, Shield, User, Image } from 'lucide-react';

export default function Settings() {
  const { user, isAdmin, logout, refreshUser, group } = useAuth();

  // Password change
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  // Profile
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profBusy, setProfBusy] = useState(false);
  const [profMsg, setProfMsg] = useState('');

  // Group image (admin)
  const [groupImage, setGroupImage] = useState(group?.groupImage || '');
  const [imgBusy, setImgBusy] = useState(false);
  const [imgMsg, setImgMsg] = useState('');

  const handlePassword = async (e) => {
    e.preventDefault();
    setPwMsg('');
    if (newPw.length < 4) { setPwMsg('Password must be at least 4 characters.'); return; }
    if (newPw !== confirmPw) { setPwMsg('Passwords do not match.'); return; }
    setPwBusy(true);
    try {
      await api.put('/users/password', { newPassword: newPw });
      setPwMsg('✓ Password updated successfully!');
      setNewPw(''); setConfirmPw('');
    } catch (err) { setPwMsg(err.response?.data?.message || 'Failed to update.'); }
    setPwBusy(false);
  };

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfMsg('');
    setProfBusy(true);
    try {
      await api.put('/users/profile', { name: profileName, phone: profilePhone });
      setProfMsg('✓ Profile updated!');
      refreshUser();
    } catch (err) { setProfMsg(err.response?.data?.message || 'Failed.'); }
    setProfBusy(false);
  };

  const handleGroupImage = async (e) => {
    e.preventDefault();
    setImgMsg('');
    setImgBusy(true);
    try {
      await api.put('/users/group-image', { groupImage });
      setImgMsg('✓ Group image updated!');
    } catch (err) { setImgMsg(err.response?.data?.message || 'Failed.'); }
    setImgBusy(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account and group</p>
      </div>

      {/* Edit Profile */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
          <User size={16} className="text-brand-400" /> Edit Profile
        </div>
        <form onSubmit={handleProfile} className="space-y-3">
          <input value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Your name" className="glass-input" required />
          <input value={profilePhone} onChange={e => setProfilePhone(e.target.value)} placeholder="Phone number" className="glass-input" />
          <button type="submit" className="btn-brand w-full flex items-center justify-center gap-2" disabled={profBusy}>
            {profBusy && <Loader2 size={14} className="animate-spin" />} Save Profile
          </button>
          {profMsg && <p className={`text-xs ${profMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{profMsg}</p>}
        </form>
      </div>

      {/* Change Password */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
          <Shield size={16} className="text-amber-400" /> Change Password
        </div>
        <form onSubmit={handlePassword} className="space-y-3">
          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password" className="glass-input" required />
          <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirm password" className="glass-input" required />
          <button type="submit" className="btn-brand w-full flex items-center justify-center gap-2" disabled={pwBusy}>
            {pwBusy && <Loader2 size={14} className="animate-spin" />} Update Password
          </button>
          {pwMsg && <p className={`text-xs ${pwMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{pwMsg}</p>}
        </form>
      </div>

      {/* Group Image (Admin) */}
      {isAdmin && (
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
            <Image size={16} className="text-purple-400" /> Group Picture
          </div>
          <form onSubmit={handleGroupImage} className="space-y-3">
            {groupImage && (
              <div className="flex items-center gap-3">
                <img src={groupImage} alt="Group" className="h-12 w-12 rounded-xl object-cover border border-gray-700" />
                <span className="text-xs text-gray-500">Preview</span>
              </div>
            )}
            <input value={groupImage} onChange={e => setGroupImage(e.target.value)} placeholder="Image URL (https://...)" className="glass-input" />
            <div className="flex gap-2">
              <button type="submit" className="btn-brand flex-1 flex items-center justify-center gap-2" disabled={imgBusy}>
                {imgBusy && <Loader2 size={14} className="animate-spin" />} Save
              </button>
              <button type="button" onClick={() => setGroupImage('')} className="btn-outline flex-1">Clear</button>
            </div>
            {imgMsg && <p className={`text-xs ${imgMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{imgMsg}</p>}
          </form>
        </div>
      )}

      {/* Logout */}
      <div className="glass-card p-5">
        <button onClick={logout} className="w-full rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20">
          Sign Out
        </button>
      </div>

      <p className="text-center text-xs text-gray-700 pb-4">Made with ❤ by Ankit</p>
    </div>
  );
}

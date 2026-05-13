import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, PiggyBank, MessageSquare, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/expenses', icon: ReceiptText, label: 'Expenses' },
  { to: '/contributions', icon: PiggyBank, label: 'Contributions' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, group, logout } = useAuth();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-gray-800/60 bg-gray-950/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-gray-800/50">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 text-sm font-bold text-white shadow-lg shadow-brand-500/20">
          {(group?.groupName || 'E')[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-100">{group?.groupName || 'Expense Tracker'}</p>
          <p className="text-xs text-gray-500">Group</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-brand-600/15 text-brand-400 shadow-sm'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`
            }>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-800/50 p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-200">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <button onClick={logout} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-800 hover:text-red-400" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

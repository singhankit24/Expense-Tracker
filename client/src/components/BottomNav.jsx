import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, MessageSquare, Settings } from 'lucide-react';

const items = [
  { to: '/', icon: LayoutDashboard, label: 'Home', end: true },
  { to: '/expenses', icon: ReceiptText, label: 'Expenses' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden px-3 pb-3">
      <nav className="flex items-center justify-around rounded-2xl border border-gray-800/60 bg-gray-950/90 py-2 backdrop-blur-xl shadow-2xl">
        {items.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] font-medium transition-all
              ${isActive ? 'text-brand-400 -translate-y-0.5' : 'text-gray-500'}`
            }>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

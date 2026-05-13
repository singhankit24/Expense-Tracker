import { useLocation } from 'react-router-dom';

const titles = {
  '/': 'Dashboard',
  '/expenses': 'Expense History',
  '/contributions': 'Contributions',
  '/chat': 'Chat',
  '/settings': 'Settings',
};

export default function Header() {
  const { pathname } = useLocation();
  const title = titles[pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 border-b border-gray-800/40 bg-gray-950/70 backdrop-blur-xl">
      <div className="flex h-14 items-center px-4 md:px-6">
        <h1 className="text-lg font-semibold text-gray-100 font-display">{title}</h1>
      </div>
    </header>
  );
}

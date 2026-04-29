import { NavLink, useNavigate } from 'react-router-dom';
import tecflowerLogo from '@/assets/tecflowerLogo.png';
import { useAuth } from '@/contexts/AuthContext';

const items = [
  { to: '/vendas', label: 'Vendas', icon: 'sales' },
  { to: '/produtos', label: 'Produtos', icon: 'products' },
  { to: '/financeiro', label: 'Financeiro', icon: 'finance' },
  { to: '/configuracoes', label: 'Configurações', icon: 'settings' },
];

const iconMap = {
  sales: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M5 7h14M7 7l1.2 10h7.6L17 7M9 10h6M10 13h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M6 5h12v14H6zM9 9h6M9 13h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  finance: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M5 7h14v10H5zM8 12h8M8 9h2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Z" />
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7.7 7.7 0 0 0-1.8-1l-.3-2.5h-4l-.3 2.5a7.7 7.7 0 0 0-1.8 1l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7.7 7.7 0 0 0 1.8 1l.3 2.5h4l.3-2.5a7.7 7.7 0 0 0 1.8-1l2.3 1 2-3.4-2-1.5c.1-.3.1-.6.1-1Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export const Sidebar = () => {
  const navigate = useNavigate();
  const { account, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="flex w-[236px] flex-col border-r border-white/15 bg-[linear-gradient(160deg,rgba(56,18,93,0.98)_0%,rgba(102,45,170,0.96)_54%,rgba(166,116,255,0.92)_100%)]">
      <div className="border-b border-white/15 px-4 py-3">
        <div className="flex h-[64px] items-center justify-start overflow-hidden">
          <img
            src={tecflowerLogo}
            alt="TecFlower"
            className="h-auto w-full max-w-[200px] object-contain object-left"
          />
        </div>
      </div>

      <nav className="flex-1 px-3 py-8">
        <div className="space-y-1.5">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex h-11 items-center gap-3 rounded-full px-5 text-[18px] font-semibold tracking-[0.01em] transition ${
                  isActive ? 'bg-white/10 text-white backdrop-blur-sm' : 'text-white hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="text-current">{iconMap[item.icon as keyof typeof iconMap]}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="px-6 py-5">
        <div className="text-white">
          <div>
            <p className="text-[16px] font-semibold tracking-[0.01em]">{account?.name || 'Conta'}</p>
            <p className="mt-1 text-sm text-white/72">{profile?.username || 'Usuário'}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M15 7.5V5.75A1.75 1.75 0 0 0 13.25 4h-5.5A1.75 1.75 0 0 0 6 5.75v12.5C6 19.22 6.78 20 7.75 20h5.5A1.75 1.75 0 0 0 15 18.25V16.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 12h10m0 0-3-3m3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

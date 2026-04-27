import { NavLink } from 'react-router-dom';
import { sidebarUser } from '@/mocks/data';
import tecflowerLogo from '@/assets/tecflowerLogo.png';

const items = [
  { to: '/vendas', label: 'Vendas', icon: 'sales' },
  { to: '/produtos', label: 'Produtos', icon: 'products' },
  { to: '/financeiro', label: 'Financeiro', icon: 'finance' },
  { to: '/configuracoes', label: 'Configuracoes', icon: 'settings' },
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
  return (
    <aside className="flex w-[236px] flex-col border-r border-white/15 bg-[#7B5CE6]">
      <div className="border-b border-white/15 px-4 py-5">
        <div className="flex h-[52px] items-center justify-start overflow-hidden">
          <img
            src={tecflowerLogo}
            alt="TecFlower"
            className="w-[150px] max-w-none translate-x-6 scale-[1.72] object-contain brightness-0 invert"
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
                  isActive ? 'bg-[#6A4BD5] text-white' : 'text-white hover:bg-[#6A4BD5] hover:text-white'
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
        <div className="flex items-end justify-between text-white">
          <div>
            <p className="text-[16px] font-semibold tracking-[0.01em]">{sidebarUser.name}</p>
            <p className="mt-1 text-sm text-white/72">{sidebarUser.email}</p>
          </div>
          <svg viewBox="0 0 20 20" className="mb-1 h-4 w-4 text-white/68" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </aside>
  );
};

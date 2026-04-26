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
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 7h14M7 7l1.2 10h7.6L17 7M9 10h6M10 13h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 5h12v14H6zM9 9h6M9 13h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  finance: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 7h14v10H5zM8 12h8M8 9h2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Z" />
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7.7 7.7 0 0 0-1.8-1l-.3-2.5h-4l-.3 2.5a7.7 7.7 0 0 0-1.8 1l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7.7 7.7 0 0 0 1.8 1l.3 2.5h4l.3-2.5a7.7 7.7 0 0 0 1.8-1l2.3 1 2-3.4-2-1.5c.1-.3.1-.6.1-1Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export const Sidebar = () => {
  return (
    <aside className="flex w-[224px] flex-col border-r border-[#d9d6cf] bg-[#efefec]">
      <div className="border-b border-[#d9d6cf] px-5 py-5">
        <div className="flex h-[44px] items-center justify-center overflow-hidden">
          <img
            src={tecflowerLogo}
            alt="TecFlower"
            className="w-[132px] max-w-none scale-[1.55] object-contain"
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
                `flex h-9 items-center gap-3 rounded-full px-4 text-[15px] font-medium tracking-[0.01em] transition ${
                  isActive ? 'bg-[#d8d8d5] text-brand-bark' : 'text-[#7a7973] hover:bg-[#e7e7e2]'
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
        <div className="flex items-end justify-between text-brand-bark">
          <div>
            <p className="text-[15px] font-semibold tracking-[0.01em]">{sidebarUser.name}</p>
            <p className="mt-1 text-sm text-[#8d8b84]">{sidebarUser.email}</p>
          </div>
          <svg viewBox="0 0 20 20" className="mb-1 h-4 w-4 text-[#9a988f]" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </aside>
  );
};

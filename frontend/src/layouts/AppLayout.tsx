import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <div className="flex min-h-screen min-w-[1280px] overflow-hidden bg-white">
        <Sidebar />
        <main className="flex-1 bg-[#fffdf9] px-4 py-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

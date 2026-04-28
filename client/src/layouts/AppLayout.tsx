import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <div className="flex min-h-screen overflow-x-auto bg-white lg:min-w-[1280px]">
        <Sidebar />
        <main className="flex-1 bg-[#fffdf9] px-4 py-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

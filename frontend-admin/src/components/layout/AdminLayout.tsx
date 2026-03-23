import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-main-bg text-dark-text font-sans selection:bg-primary selection:text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto w-full">
            <div className="mx-auto w-full max-w-[1600px] p-6">
                <Outlet />
            </div>
        </main>
      </div>
    </div>
  );
}

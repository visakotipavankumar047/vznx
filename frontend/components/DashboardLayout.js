import Sidebar from './SidebarNav';
import Header from './Header';

export function DashboardLayout({ children, showHeader = true }) {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-white">
      <Sidebar />
      <div className="ml-[280px] flex flex-col min-h-screen">
        {showHeader && <Header />}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;

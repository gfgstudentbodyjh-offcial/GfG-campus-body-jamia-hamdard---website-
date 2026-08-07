import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { AdminThemeProvider, useAdminTheme } from '../../context/AdminThemeContext';

function AdminLayoutInner() {
  const location = useLocation();
  const { isLight, toggleTheme } = useAdminTheme();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard Overview';
    if (path.includes('users')) return 'User Directory';
    if (path.includes('events')) return 'Events Management';
    if (path.includes('announcements')) return 'Latest Announcements';
    if (path.includes('feed-moderation')) return 'Community Moderation Queue';
    return 'Admin Console';
  };

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-200 ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#0d1117] text-gray-100'
    }`}>
      <AdminSidebar isLight={isLight} toggleTheme={toggleTheme} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title={getPageTitle()} isLight={isLight} toggleTheme={toggleTheme} />
        <main className="flex-1 p-5 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet context={{ isLight }} />
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner />
    </AdminThemeProvider>
  );
}

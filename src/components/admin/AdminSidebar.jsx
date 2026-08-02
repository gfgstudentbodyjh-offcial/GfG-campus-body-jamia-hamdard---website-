import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Image as ImageIcon,
  BookOpen,
  Bell,
  Users,
  Award,
  Shield,
  Layers,
  FolderOpen,
  FileText,
  BarChart3,
  Sliders,
  LogOut,
  Sparkles,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard }
      ]
    },
    {
      group: 'Content',
      items: [
        { name: 'Hero & Site Copy', path: '/admin/hero-settings', icon: Sliders },
        { name: 'Events', path: '/admin/events', icon: Calendar },
        { name: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
        { name: 'Resources', path: '/admin/resources', icon: BookOpen },
        { name: 'Announcements', path: '/admin/announcements', icon: Bell }
      ]
    },
    {
      group: 'Community & Feed',
      items: [
        { name: 'Feed Moderation', path: '/admin/feed-moderation', icon: MessageSquare },
        { name: 'Faculty Advisors', path: '/admin/faculty', icon: Award },
        { name: 'Campus Mantri', path: '/admin/mantri', icon: Shield },
        { name: 'Teams', path: '/admin/teams', icon: Layers },
        { name: 'Members Directory', path: '/admin/members', icon: Users }
      ]
    },
    {
      group: 'Assets & Forms',
      items: [
        { name: 'Media Library', path: '/admin/media', icon: FolderOpen },
        { name: 'Dynamic Forms', path: '/admin/forms', icon: FileText }
      ]
    },
    {
      group: 'System',
      items: [
        { name: 'Analytics & Settings', path: '/admin/analytics-settings', icon: BarChart3 }
      ]
    }
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-[#0d1117] border-r border-[#30363d] flex flex-col h-screen sticky top-0 z-40">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-[#30363d] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1b5e20] to-[#2f9e44] p-0.5 shadow-md">
            <div className="w-full h-full bg-[#0d1117] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#2f9e44]" />
            </div>
          </div>
          <div>
            <h2 className="font-extrabold text-white text-sm tracking-wide">Community OS</h2>
            <p className="text-[10px] text-[#2f9e44] font-semibold">Super Admin SaaS</p>
          </div>
        </div>
      </div>

      {/* Nav Menu Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
              {group.group}
            </h3>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#2f9e44] text-white shadow-md shadow-green-900/30'
                      : 'text-gray-400 hover:text-white hover:bg-[#161b22]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Admin User Footer */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22] flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-[#2f9e44]/20 border border-[#2f9e44] flex items-center justify-center text-xs font-bold text-[#2f9e44]">
            {user?.username?.charAt(0) || 'A'}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">{user?.username || 'Super Admin'}</p>
            <p className="text-[10px] text-gray-400 truncate">{user?.email || 'admin@gfgcampus.org'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-[#21262d] transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

    </aside>
  );
}

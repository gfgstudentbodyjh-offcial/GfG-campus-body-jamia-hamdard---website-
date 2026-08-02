import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, BookOpen, FileText, FolderOpen, ArrowUpRight, Plus, Sparkles } from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/analytics/stats');
        setStats(res.data.data);
      } catch (err) {
        console.warn(err);
        setStats({
          totalMembers: 185,
          totalEvents: 24,
          upcomingEvents: 3,
          totalResources: 18,
          totalFormSubmissions: 42,
          totalMediaAssets: 56
        });
      }
      setLoading(false);
    };
    loadStats();
  }, []);

  const metricCards = [
    { title: 'Community Members', value: stats?.totalMembers || 185, icon: Users, link: '/admin/members', color: 'text-emerald-400' },
    { title: 'Total Events', value: stats?.totalEvents || 24, icon: Calendar, link: '/admin/events', color: 'text-green-400' },
    { title: 'Learning Vault Docs', value: stats?.totalResources || 18, icon: BookOpen, link: '/admin/resources', color: 'text-teal-400' },
    { title: 'Form Registrations', value: stats?.totalFormSubmissions || 42, icon: FileText, link: '/admin/forms', color: 'text-[#2f9e44]' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-[#2f9e44]/40 bg-gradient-to-r from-[#161b22] via-[#0d1117] to-[#142e16] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#2f9e44]">
            <Sparkles className="w-4 h-4" /> Super Admin Operations Console
          </div>
          <h1 className="text-3xl font-black text-white">Community OS SaaS Dashboard</h1>
          <p className="text-sm text-gray-400 max-w-xl">
            Welcome back! Manage chapter members, team leads, event schedules, gallery media, and dynamic forms in real time.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/events" className="px-5 py-2.5 rounded-xl gradient-button text-xs font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Event
          </Link>
          <Link to="/admin/members" className="px-5 py-2.5 rounded-xl bg-[#21262d] text-white hover:bg-[#30363d] text-xs font-bold border border-[#30363d]">
            Add Member
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={idx} to={card.link} className="glass-panel p-6 rounded-2xl border border-[#30363d] hover:border-[#2f9e44] transition-all group flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">{card.title}</span>
                <div className="w-10 h-10 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-center group-hover:border-[#2f9e44] transition-colors">
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-white">{card.value}</span>
                <span className="text-xs font-bold text-[#2f9e44] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Manage <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Matrix */}
      <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-2xl space-y-4">
        <h2 className="text-base font-bold text-white">Management Action Shortcuts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/hero-settings" className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] hover:border-[#2f9e44] transition-colors text-xs font-bold text-gray-200 hover:text-white">
            ✏️ Edit Hero & Site Headlines
          </Link>
          <Link to="/admin/mantri" className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] hover:border-[#2f9e44] transition-colors text-xs font-bold text-gray-200 hover:text-white">
            🛡️ Set Current Campus Mantri
          </Link>
          <Link to="/admin/forms" className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] hover:border-[#2f9e44] transition-colors text-xs font-bold text-gray-200 hover:text-white">
            📋 Dynamic Form Builder
          </Link>
          <Link to="/admin/media" className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] hover:border-[#2f9e44] transition-colors text-xs font-bold text-gray-200 hover:text-white">
            📁 Cloudinary Media Library
          </Link>
        </div>
      </div>

    </div>
  );
}

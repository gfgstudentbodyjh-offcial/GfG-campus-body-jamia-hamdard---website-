import React from 'react';
import { Search, Bell, ExternalLink, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminHeader({ title = 'Dashboard Overview' }) {
  return (
    <header className="h-16 bg-[#161b22] border-b border-[#30363d] px-8 flex items-center justify-between sticky top-0 z-30">
      
      {/* Search or Title */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
        <span className="hidden sm:inline-block text-[11px] px-2.5 py-0.5 rounded-full bg-[#2f9e44]/20 text-[#2f9e44] font-semibold border border-[#2f9e44]/30">
          Tenant: Jamia Hamdard
        </span>
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0d1117] text-gray-300 hover:text-white border border-[#30363d] hover:border-[#2f9e44] transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-[#2f9e44]" />
          View Live Website <ExternalLink className="w-3 h-3 text-gray-400" />
        </Link>
      </div>

    </header>
  );
}

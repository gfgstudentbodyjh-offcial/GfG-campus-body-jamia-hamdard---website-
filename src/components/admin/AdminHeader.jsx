import React from 'react';
import { ExternalLink, Globe, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminHeader({ title = 'Dashboard Overview', isLight, toggleTheme }) {
  return (
    <header className={`h-16 border-b px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors ${
      isLight ? 'bg-white border-gray-200' : 'bg-[#161b22] border-[#30363d]'
    }`}>
      
      {/* Title & Tenant Tag */}
      <div className="flex items-center gap-3">
        <h2 className={`text-base sm:text-lg font-extrabold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
          {title}
        </h2>
        <span className="hidden sm:inline-block text-[11px] px-2.5 py-0.5 rounded-full bg-[#2f9e44]/15 text-[#2f9e44] font-bold border border-[#2f9e44]/30 font-mono">
          Jamia Hamdard Chapter
        </span>
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
            isLight
              ? 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
              : 'bg-[#0d1117] text-gray-200 border-[#30363d] hover:bg-[#18202c]'
          }`}
          title="Toggle Light/Dark Theme"
        >
          {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          <span className="hidden md:inline font-mono">{isLight ? 'Dark Mode' : 'Light Mode'}</span>
        </button>

        <Link
          to="/"
          target="_blank"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            isLight
              ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              : 'bg-[#0d1117] text-gray-300 border-[#30363d] hover:border-[#2f9e44] hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-[#2f9e44]" />
          <span className="hidden sm:inline">Live Website</span>
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </Link>
      </div>

    </header>
  );
}

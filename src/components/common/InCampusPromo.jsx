import React from 'react';
import { ExternalLink, Sparkles, Compass } from 'lucide-react';
import TechCard from './TechCard';

export default function InCampusPromo({ variant = 'feed', className = '' }) {
  const INCAMPUS_URL = 'https://incampus.online/';

  if (variant === 'sidebar') {
    return (
      <TechCard cornerAccents={false} className={`p-4 bg-gradient-to-br from-[#121721] via-[#161226] to-[#1e1338] border-[#7c3aed]/40 hover:border-[#8b5cf6]/70 transition-all space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-[#a78bfa] uppercase tracking-wider block">
            06 // EXPLORE
          </span>
          <span className="text-[9px] font-mono font-bold text-[#c4b5fd] bg-[#7c3aed]/20 px-2 py-0.5 rounded border border-[#7c3aed]/30">
            CAMPUS NETWORK
          </span>
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-white flex items-center justify-between">
            <span>InCampus</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#a78bfa]" />
          </h4>
          <p className="text-[11px] text-gray-300 leading-snug">
            Your campus network. Connect beyond GFG with verified students across universities.
          </p>
        </div>

        <a
          href={INCAMPUS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md transition-colors"
        >
          <span>Visit InCampus</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </TechCard>
    );
  }

  // Default: Feed Variant (~160-180px banner in Center Feed)
  return (
    <TechCard
      cornerAccents={true}
      className={`p-5 sm:p-6 bg-gradient-to-r from-[#121721] via-[#1a152e] to-[#121721] border-[#7c3aed]/50 hover:border-[#8b5cf6]/80 transition-all shadow-2xl relative overflow-hidden group ${className}`}
    >
      {/* Background Subtle Ambient Purple Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#7c3aed]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[9px] sm:text-[10px] font-mono font-extrabold text-[#a78bfa] bg-[#7c3aed]/20 px-2.5 py-0.5 rounded border border-[#7c3aed]/40 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#c4b5fd]" /> FEATURED COMMUNITY PLATFORM
            </span>
          </div>

          <h3 className="text-base sm:text-xl font-extrabold text-white leading-tight">
            InCampus — Your Campus. One Private Digital Space.
          </h3>

          <p className="text-xs text-gray-300 leading-relaxed">
            Connect with verified students, discover campus conversations, share insights, and build meaningful cross-campus networks.
          </p>
        </div>

        <a
          href={INCAMPUS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#8b5cf6] hover:to-[#7c3aed] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40 transition-all flex-shrink-0 w-full sm:w-auto"
        >
          <span>Visit InCampus</span>
          <ExternalLink className="w-4 h-4" />
        </a>

      </div>
    </TechCard>
  );
}

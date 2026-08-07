import React from 'react';
import { ShieldCheck, Award, Sparkles, UserCheck } from 'lucide-react';

export default function RoleBadge({ role = 'Member', className = '' }) {
  const normalized = (role || 'Member').trim();

  let colorClasses = 'bg-[#18202c] text-gray-300 border-[#30363d]';
  let Icon = UserCheck;

  if (normalized.includes('Campus Mantri')) {
    colorClasses = 'bg-[#2f9e44]/15 text-[#2f9e44] border-[#2f9e44]/40 shadow-sm';
    Icon = ShieldCheck;
  } else if (normalized.includes('Faculty') || normalized.includes('Coordinator')) {
    colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/40';
    Icon = Award;
  } else if (normalized.includes('Ambassador')) {
    colorClasses = 'bg-purple-500/15 text-purple-300 border-purple-500/40';
    Icon = Sparkles;
  } else if (normalized.includes('Lead') || normalized.includes('Core')) {
    colorClasses = 'bg-sky-500/15 text-sky-400 border-sky-500/40';
    Icon = ShieldCheck;
  }

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${colorClasses} ${className}`}>
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span className="whitespace-nowrap">{normalized}</span>
    </span>
  );
}

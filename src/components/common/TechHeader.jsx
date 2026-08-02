import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * TechHeader — Unified developer-style hero header for inner pages
 */
export default function TechHeader({ tag, title, description, count, countLabel = 'Items', children, className = '' }) {
  return (
    <section className={`glass-panel p-8 sm:p-12 rounded-3xl border border-[#30363d]/80 bg-gradient-to-br from-[#121721] via-[#0a0d12] to-[#142e16]/40 flex flex-col md:flex-row md:items-end justify-between gap-6 tech-corner ${className}`}>
      <div className="space-y-3 max-w-2xl">
        {tag && (
          <span className="tech-eyebrow">
            <Sparkles className="w-3.5 h-3.5" /> {tag}
          </span>
        )}
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            {description}
          </p>
        )}
        {children && <div className="pt-2">{children}</div>}
      </div>

      {count !== undefined && count !== null && (
        <div className="flex-shrink-0 bg-[#0a0d12]/90 px-6 py-4 rounded-2xl border border-[#30363d] text-center md:text-right">
          <div className="text-3xl sm:text-4xl font-black text-[#2f9e44] tracking-tight font-mono">
            {count}
          </div>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
            {countLabel}
          </div>
        </div>
      )}
    </section>
  );
}

import React, { useRef } from 'react';

/**
 * TechCard — Reusable developer-grade surface card with cursor-tracking light & corner details
 */
export default function TechCard({ children, className = '', cornerAccents = true, onClick }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const hasCustomBg = /\bbg-/.test(className);
  const hasCustomBorder = /\bborder-/.test(className);

  const defaultBg = hasCustomBg ? '' : 'bg-[#121721]/90';
  const defaultBorder = hasCustomBorder ? '' : 'border border-[#30363d]';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`relative glass-panel ${defaultBg} ${defaultBorder} rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#2f9e44]/60 hover:-translate-y-1 shadow-xl group ${
        cornerAccents ? 'tech-corner' : ''
      } ${className}`}
      style={{
        backgroundImage: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(47, 158, 68, 0.12), transparent 40%)'
      }}
    >
      {children}
    </div>
  );
}

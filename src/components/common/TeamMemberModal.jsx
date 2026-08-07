import React, { useEffect } from 'react';
import { X, Mail, Linkedin, Github, Instagram, ShieldCheck, Award } from 'lucide-react';

export default function TeamMemberModal({ member, teamName, isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !member) return null;

  const roleTitle = member.title || member.role || 'Team Member';
  const displayTeam = teamName || member.teamName || member.department || 'GFG Campus Body';
  const bio = member.message || member.bio || member.description || member.about;
  const socials = member.socials || {};

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-modal-name"
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-[#0a0d12] border border-[#2f9e44]/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 text-center max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#18202c] text-gray-400 hover:text-white border border-[#30363d] transition-colors focus:outline-none"
          aria-label="Close details"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Member Photo */}
        <div className="flex justify-center pt-2">
          <img
            src={member.photo}
            alt={member.name}
            style={{ objectPosition: member.imagePosition || 'center 50%' }}
            className="w-32 h-36 sm:w-36 sm:h-44 rounded-2xl object-cover border-2 border-[#2f9e44] shadow-xl"
          />
        </div>

        {/* Name, Role & Team Badges */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white bg-[#2f9e44] px-2.5 py-0.5 rounded-full inline-block shadow-sm">
            {roleTitle}
          </span>
          <h3 id="member-modal-name" className="text-xl sm:text-2xl font-black text-white leading-tight">
            {member.name}
          </h3>
          <p className="text-xs font-mono font-semibold text-[#2f9e44]">
            {displayTeam}
          </p>
        </div>

        {/* Full Bio / Message */}
        {bio && (
          <div className="text-left bg-[#121721] p-4 rounded-2xl border border-[#30363d] space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
              About & Vision
            </span>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed italic">
              "{bio}"
            </p>
          </div>
        )}

        {/* Social Links */}
        {(socials.email || socials.linkedin || socials.github || socials.instagram) && (
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#30363d]">
            {socials.email && (
              <a
                href={`mailto:${socials.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-[#18202c] text-gray-300 hover:text-white hover:bg-[#2f9e44] transition-all border border-[#30363d] flex items-center justify-center"
                title="Email"
                onClick={(e) => e.stopPropagation()}
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-[#18202c] text-gray-300 hover:text-white hover:bg-[#0077b5] transition-all border border-[#30363d] flex items-center justify-center"
                title="LinkedIn"
                onClick={(e) => e.stopPropagation()}
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {socials.github && (
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-[#18202c] text-gray-300 hover:text-white hover:bg-gray-700 transition-all border border-[#30363d] flex items-center justify-center"
                title="GitHub"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {socials.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-[#18202c] text-gray-300 hover:text-white hover:bg-[#e1306c] transition-all border border-[#30363d] flex items-center justify-center"
                title="Instagram"
                onClick={(e) => e.stopPropagation()}
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

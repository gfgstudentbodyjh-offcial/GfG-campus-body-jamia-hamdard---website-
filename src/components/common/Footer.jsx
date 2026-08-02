import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Github, Linkedin, Instagram, Youtube, Mail, Heart, ExternalLink, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0d1117] border-t border-[#30363d] pt-16 pb-12 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#30363d]">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="h-11 bg-white px-2.5 py-1 rounded-xl flex items-center justify-center border border-[#2f9e44]/40 shadow-md flex-shrink-0">
                <img
                  src="/assets/gfg-official-logo.png"
                  alt="GeeksforGeeks Campus Body Jamia Hamdard"
                  className="h-8 w-auto object-contain"
                />
              </div>
              <span className="font-bold text-white text-lg">GeeksforGeeks</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Official GeeksforGeeks Student Chapter Community Management Platform for Jamia Hamdard. Fully data-driven Community OS.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-[#21262d] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#30363d] transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-[#21262d] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#30363d] transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-[#21262d] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#30363d] transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-[#21262d] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#30363d] transition-all">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/teams" className="hover:text-white transition-colors">Core Teams</Link></li>
              <li><Link to="/events" className="hover:text-white transition-colors">Upcoming Events</Link></li>
              <li><Link to="/gallery" className="hover:text-white transition-colors">Photo & Video Gallery</Link></li>
              <li><Link to="/resources" className="hover:text-white transition-colors">Resource Repository</Link></li>
              <li><Link to="/mantri-history" className="hover:text-white transition-colors">Campus Mantri Hall of Fame</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Learning Tracks</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/resources?category=DSA" className="hover:text-white transition-colors">Data Structures & Algorithms</a></li>
              <li><a href="/resources?category=Development" className="hover:text-white transition-colors">Full-Stack Development</a></li>
              <li><a href="/resources?category=CP" className="hover:text-white transition-colors">Competitive Programming</a></li>
              <li><a href="/resources?category=Placement" className="hover:text-white transition-colors">Placement Preparation</a></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Support & Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#2f9e44]" />
                <a href="mailto:gfg.chapter@jamiahamdard.ac.in" className="hover:text-white">gfg.chapter@jamiahamdard.ac.in</a>
              </div>
              <p className="text-xs text-gray-500">
                Official student developer community portal at Jamia Hamdard, New Delhi.
              </p>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex flex-wrap items-center gap-3">
            <p>© {new Date().getFullYear()} GeeksforGeeks Campus Body · Jamia Hamdard</p>
            <span className="hidden sm:inline">·</span>
            <Link to="/admin/login" className="text-gray-500 hover:text-gray-300 transition-colors">
              Admin Login
            </Link>
          </div>
          <p className="flex items-center gap-1 font-mono text-[11px] text-gray-400">
            <Terminal className="w-3.5 h-3.5 text-[#2f9e44]" /> BUILD // LEARN // COLLABORATE
          </p>
        </div>
      </div>
    </footer>
  );
}

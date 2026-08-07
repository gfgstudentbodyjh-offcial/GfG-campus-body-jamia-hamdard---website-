import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Sparkles, ChevronRight, Mail, Linkedin, Instagram, Github,
  ShieldCheck, Users, Palette, Calendar, Megaphone, Share2, Terminal,
  Image as ImageIcon, Trophy, Code2, Bell, Pin, CheckCircle2
} from 'lucide-react';

import api from '../../services/api';

// Shared Single Source of Truth Data Modules
import { MOCK_FACULTY } from '../../data/faculty';
import { MOCK_MANTRI_LIST } from '../../data/leadership';
import { MOCK_TEAMS } from '../../data/teams';
import { MOCK_EVENTS } from '../../data/events';
import { MOCK_GALLERY } from '../../data/gallery';

import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import InfiniteMarquee from '../../components/common/InfiniteMarquee';
import Hero3DVisual from '../../components/common/Hero3DVisual';
import GalleryLightbox from '../../components/common/GalleryLightbox';
import TechCard from '../../components/common/TechCard';

// Team Icon Mapper
const getTeamIcon = (iconName) => {
  switch (iconName) {
    case 'Users': return Users;
    case 'Palette': return Palette;
    case 'Calendar': return Calendar;
    case 'Megaphone': return Megaphone;
    case 'Share2': return Share2;
    case 'Terminal': return Terminal;
    default: return Users;
  }
};

export default function Home() {
  const facultyList = MOCK_FACULTY;

  // Sort Campus Mantris by tenure (newest first: 2025–26 -> Ali Raza)
  const sortedMantris = [...MOCK_MANTRI_LIST].sort((a, b) => {
    const getStartYear = (item) => {
      const str = item.tenure || item.session || '';
      const match = str.match(/\d{4}/);
      return match ? parseInt(match[0], 10) : 0;
    };
    return getStartYear(b) - getStartYear(a);
  });
  const currentMantri = sortedMantris[0];
  const teamsList = MOCK_TEAMS;

  const [liveEvents, setLiveEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [evRes, annRes] = await Promise.all([
          api.get('/events'),
          api.get('/announcements')
        ]);
        if (evRes.data?.data) setLiveEvents(evRes.data.data);
        if (annRes.data?.data) setAnnouncements(annRes.data.data);
      } catch (err) {
        console.warn('Home data fetch error:', err);
      }
    };
    loadHomeData();
  }, []);

  const upcomingEvents = (liveEvents.length > 0 ? liveEvents : MOCK_EVENTS).filter((e) => e.status !== 'Completed');
  const pastEvents = (liveEvents.length > 0 ? liveEvents : MOCK_EVENTS).filter((e) => e.status === 'Completed');
  const galleryList = MOCK_GALLERY;

  const now = new Date();
  const isPublishedAndNotExpired = (a) => {
    const isPub = a.status === 'Published' || a.status === 'Active' || !a.status;
    const notExpired = !a.expiryDate && !a.expiresAt ? true : new Date(a.expiryDate || a.expiresAt) > now;
    return isPub && notExpired;
  };

  const activeAnnouncements = announcements.filter(isPublishedAndNotExpired);
  const pinnedAnnouncement = activeAnnouncements.find(a => a.isPinned);
  const latestAnnouncement = activeAnnouncements[0];

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const openLightbox = (index) => {
    setActiveImageIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-100 flex flex-col font-sans overflow-x-hidden">
      <Navbar />

      <main className="flex-1">

        {/* ─── 1. HERO SECTION (2-COLUMN WITH 3D DEVELOPER SCENE) ───────────── */}
        <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[#30363d]/50">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-[#2f9e44]/16 rounded-full blur-[140px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Left Column: Content & Identity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#121721] border border-[#2f9e44]/40 text-[#2f9e44] text-xs sm:text-sm font-bold tracking-wide shadow-lg shadow-green-950/40 tech-corner">
                <div className="h-6 bg-white px-2 py-0.5 rounded-lg flex items-center justify-center border border-[#2f9e44]/30 flex-shrink-0">
                  <img
                    src="/assets/gfg-official-logo.png"
                    alt="GeeksforGeeks Campus Body Logo"
                    style={{ height: '18px', width: 'auto' }}
                    className="h-4.5 max-h-5 w-auto object-contain"
                  />
                </div>
                <span className="font-mono">GeeksforGeeks Campus Body • Jamia Hamdard</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                Empowering Innovators, Coders & Tech Leaders
              </h1>

              <p className="text-lg sm:text-xl text-gray-400 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Master Data Structures, Full-Stack Web Dev, Artificial Intelligence & Competitive Programming with Jamia Hamdard’s official GFG Campus Body.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/events" className="w-full sm:w-auto px-8 py-4 rounded-xl gradient-button font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-[#2f9e44]/25">
                  Explore Events <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/community" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#121721] border border-[#30363d] hover:border-[#2f9e44]/60 font-semibold text-base text-gray-200 hover:text-white flex items-center justify-center gap-2 transition-all">
                  Join Community
                </Link>
              </div>
            </motion.div>

            {/* Right Column: 3D Tech Ecosystem Scene */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="hidden lg:flex lg:col-span-5 items-center justify-center"
            >
              <Hero3DVisual />
            </motion.div>

          </div>
        </section>

        {/* ─── 1.5. TOP PINNED ANNOUNCEMENT STRIP (HERO AREA) ────────────────────── */}
        {pinnedAnnouncement && (
          <section className="bg-gradient-to-r from-[#0a0d12] via-[#142e16] to-[#0a0d12] border-y border-[#2f9e44]/40 py-3 px-4 sm:px-6 lg:px-8 shadow-xl relative z-20">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <span className="flex items-center gap-1.5 bg-[#2f9e44] text-white text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex-shrink-0">
                  <Pin className="w-3 h-3 fill-white" /> Pinned Bulletin
                </span>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1">
                    {pinnedAnnouncement.title}
                  </h4>
                  <span className="hidden md:inline text-gray-300 text-xs truncate max-w-md">
                    — {pinnedAnnouncement.description}
                  </span>
                </div>
              </div>

              {pinnedAnnouncement.linkUrl ? (
                <a
                  href={pinnedAnnouncement.linkUrl}
                  target={pinnedAnnouncement.linkUrl.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-bold text-xs text-[#2f9e44] hover:text-white flex-shrink-0 bg-white/10 hover:bg-[#2f9e44] px-3.5 py-1.5 rounded-lg border border-[#2f9e44]/40 transition-all shadow-sm"
                >
                  {pinnedAnnouncement.linkLabel || 'Apply Now'} <ArrowRight className="w-3.5 h-3.5" />
                </a>
              ) : (
                <Link
                  to="/community"
                  className="flex items-center gap-1.5 font-bold text-xs text-[#2f9e44] hover:text-white flex-shrink-0 bg-white/10 hover:bg-[#2f9e44] px-3.5 py-1.5 rounded-lg border border-[#2f9e44]/40 transition-all shadow-sm"
                >
                  View Community <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </section>
        )}

        {/* ─── 2. FACULTY COORDINATORS (STATIC) ───────────────────────────── */}
        <section className="py-12 bg-[#121721]/60 border-b border-[#30363d] px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="tech-eyebrow">
                01 // ACADEMIC MENTORSHIP
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Faculty Coordinators</h2>
              <p className="text-sm text-gray-400">Guiding light and academic leadership at Jamia Hamdard.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {facultyList.map((f) => (
                <TechCard key={f._id} className="p-6 flex items-center gap-6">
                  <img
                    src={f.photo}
                    alt={`${f.name}, Faculty Coordinator`}
                    loading="lazy"
                    style={{ objectPosition: f.imagePosition || 'top' }}
                    className="w-28 h-32 sm:w-32 sm:h-36 rounded-2xl object-cover border-2 border-[#2f9e44] flex-shrink-0 shadow-md"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#2f9e44] bg-[#2f9e44]/10 px-2.5 py-0.5 rounded border border-[#2f9e44]/30 inline-block">
                      Faculty Coordinator
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white truncate">{f.name}</h3>
                    <p className="text-xs font-semibold text-gray-300">{f.designation}</p>
                    <p className="text-xs text-gray-400 line-clamp-2">{f.department || f.institution}</p>
                    {f.email && (
                      <a href={`mailto:${f.email}`} className="text-[11px] text-[#2f9e44] hover:underline flex items-center gap-1 pt-1 truncate">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{f.email}</span>
                      </a>
                    )}
                  </div>
                </TechCard>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 3. CAMPUS MANTRI (STATIC) ──────────────────────────────────── */}
        {currentMantri && (
          <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <TechCard className="p-8 sm:p-12 border-[#2f9e44]/50 bg-gradient-to-br from-[#121721] via-[#0a0d12] to-[#142e16]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  
                  {/* Photo & Badge */}
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={currentMantri.photo}
                      alt={`${currentMantri.name}, Campus Mantri`}
                      loading="lazy"
                      style={{ objectPosition: currentMantri.imagePosition || 'center top' }}
                      className="w-36 h-40 sm:w-40 sm:h-44 rounded-2xl object-cover border-2 border-[#2f9e44] shadow-xl"
                    />
                    <h3 className="text-2xl font-extrabold text-white mt-4">{currentMantri.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-mono font-bold text-[#2f9e44] uppercase tracking-wider bg-[#2f9e44]/15 border border-[#2f9e44]/30 px-3 py-1 rounded-md flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> 02 // Campus Mantri • Session {currentMantri.tenure || currentMantri.session}
                      </span>
                    </div>
                  </div>

                  {/* Vision & Links */}
                  <div className="md:col-span-2 space-y-5 text-center md:text-left">
                    <div>
                      <h4 className="text-xl font-bold text-white">Campus Mantri Vision</h4>
                      <p className="text-sm sm:text-base text-gray-300 leading-relaxed italic mt-2 bg-[#0a0d12]/80 p-4 rounded-2xl border border-[#30363d]">
                        "{currentMantri.about}"
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#30363d]">
                      {currentMantri.socials && (
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                          {currentMantri.socials.email && (
                            <a href={`mailto:${currentMantri.socials.email}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-300 hover:text-white flex items-center gap-1.5 bg-[#18202c] px-3 py-1.5 rounded-lg border border-[#30363d]">
                              <Mail className="w-3.5 h-3.5 text-[#2f9e44]" /> Email
                            </a>
                          )}
                          {currentMantri.socials.linkedin && (
                            <a href={currentMantri.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-300 hover:text-white flex items-center gap-1.5 bg-[#18202c] px-3 py-1.5 rounded-lg border border-[#30363d]">
                              <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" /> LinkedIn
                            </a>
                          )}
                          {currentMantri.socials.instagram && (
                            <a href={currentMantri.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-300 hover:text-white flex items-center gap-1.5 bg-[#18202c] px-3 py-1.5 rounded-lg border border-[#30363d]">
                              <Instagram className="w-3.5 h-3.5 text-[#e1306c]" /> Instagram
                            </a>
                          )}
                        </div>
                      )}

                      <Link
                        to="/campus-mantri"
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#2f9e44] hover:text-white transition-colors bg-[#2f9e44]/10 hover:bg-[#2f9e44] px-4 py-2 rounded-xl border border-[#2f9e44]/30"
                      >
                        <span>View Campus Mantri History</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                </div>
              </TechCard>
            </div>
          </section>
        )}

        {/* ─── 4. MEET OUR TEAMS (TECH SHOWCASE STRIP: RIGHT → LEFT) ──────── */}
        {teamsList && teamsList.length > 0 && (
          <section className="py-12 bg-[#121721]/40 border-y border-[#30363d] px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div>
                <span className="tech-eyebrow">03 // COMMUNITY MODULES</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Meet Our Teams</h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Student leaders driving technical, creative, and operational excellence.</p>
              </div>
              <Link to="/teams" className="text-xs font-bold text-[#2f9e44] hover:underline flex items-center gap-1 flex-shrink-0">
                Meet the Full Team <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Marquee Container: RIGHT → LEFT */}
            <InfiniteMarquee direction="left" duration={35} gapClass="gap-4 sm:gap-5">
              {teamsList.map((t) => {
                const IconComponent = getTeamIcon(t.icon);
                const lead = t.lead;
                const coLead = t.coLead;

                return (
                  <TechCard
                    key={t._id}
                    className="w-[82vw] sm:w-80 flex-shrink-0 snap-start p-4 sm:p-5 bg-[#0a0d12] border-[#30363d] hover:border-[#2f9e44]/60 flex flex-col justify-between space-y-3 shadow-lg"
                  >
                    {/* Team Header */}
                    <div className="flex items-center gap-3 pb-2 border-b border-[#30363d]/60">
                      <div className="p-2 rounded-xl bg-[#2f9e44]/15 text-[#2f9e44] border border-[#2f9e44]/30 flex-shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">{t.name}</h3>
                    </div>

                    {/* Member Entries (Simple Clean Rows) */}
                    <div className="space-y-2">
                      {lead && (
                        <div className="flex items-center gap-3 py-0.5">
                          <img
                            src={lead.photo}
                            alt={lead.name}
                            loading="lazy"
                            style={{ objectPosition: lead.imagePosition || 'top' }}
                            className="w-9 h-11 sm:w-10 sm:h-12 rounded-lg object-cover border border-[#2f9e44] flex-shrink-0 shadow-sm"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{lead.name}</p>
                            <p className="text-[10px] text-[#2f9e44] font-semibold truncate">{lead.title || 'Lead'}</p>
                          </div>
                        </div>
                      )}

                      {coLead && (
                        <div className="flex items-center gap-3 py-0.5">
                          <img
                            src={coLead.photo}
                            alt={coLead.name}
                            loading="lazy"
                            style={{ objectPosition: coLead.imagePosition || 'top' }}
                            className="w-9 h-11 sm:w-10 sm:h-12 rounded-lg object-cover border border-[#30363d] flex-shrink-0 shadow-sm"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{coLead.name}</p>
                            <p className="text-[10px] text-gray-400 font-semibold truncate">{coLead.title || 'Co-Lead'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TechCard>
                );
              })}
            </InfiniteMarquee>
          </section>
        )}

        {/* ─── 5. UPCOMING EVENTS (LIVE TECH SESSIONS) ────────────────────── */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <span className="tech-eyebrow">04 // UPCOMING SESSIONS</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Upcoming Events</h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Register for upcoming hackathons, bootcamps, and technical workshops.</p>
              </div>
              <Link to="/events" className="text-xs font-bold text-[#2f9e44] hover:underline flex items-center gap-1 flex-shrink-0">
                View All Events <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Marquee Container: LEFT → RIGHT */}
            <InfiniteMarquee direction="right" duration={30} gapClass="gap-4 sm:gap-6">
              {upcomingEvents.map((ev) => (
                <TechCard
                  key={ev._id}
                  className="w-[84vw] sm:w-[350px] flex-shrink-0 snap-start border-[#30363d] hover:border-[#2f9e44] flex flex-col justify-between group bg-[#121721] shadow-xl"
                >
                  <div>
                    <div className="h-36 sm:h-44 relative overflow-hidden">
                      <img src={ev.banner} alt={ev.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      
                      {/* Live Registration Badge */}
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-[#0a0d12]/90 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>{ev.status || 'REGISTRATION OPEN'}</span>
                      </span>
                    </div>

                    <div className="p-4 sm:p-5 space-y-1.5 sm:space-y-2">
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#2f9e44] transition-colors truncate">{ev.title}</h3>
                      <p className="text-xs text-[#2f9e44] font-semibold">{ev.date}</p>
                      {ev.partner && (
                        <p className="text-[11px] text-gray-300 font-medium truncate">Partner: {ev.partner}</p>
                      )}
                      {ev.prizePool && (
                        <p className="text-[11px] text-yellow-400 font-bold flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> Prize Pool: {ev.prizePool}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 pt-0">
                    <Link to="/events" className="w-full py-2 sm:py-2.5 rounded-xl bg-[#18202c] text-white hover:bg-[#2f9e44] transition-colors text-xs font-bold flex items-center justify-center gap-2 border border-[#30363d]">
                      Event Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </TechCard>
              ))}
            </InfiniteMarquee>
          </section>
        )}

        {/* ─── 6. PAST EVENTS (DIGITAL ARCHIVE AUTO-SCROLL WITH THUMBNAILS) ── */}
        {pastEvents && pastEvents.length > 0 && (
          <section className="py-10 sm:py-12 bg-[#121721]/30 border-t border-[#30363d] px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <span className="tech-eyebrow">05 // DIGITAL ARCHIVE</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Past Events Archive</h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Highlights from our successfully conducted technical sessions and workshops.</p>
              </div>
              <Link to="/events" className="text-xs font-bold text-[#2f9e44] hover:underline flex items-center gap-1 flex-shrink-0">
                Explore Past Events <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Auto-Scroll Marquee Container: RIGHT → LEFT */}
            <InfiniteMarquee direction="left" duration={35} gapClass="gap-4 sm:gap-6">
              {pastEvents.map((ev) => {
                const thumbUrl = ev.thumbnail?.url || ev.thumbnailUrl || ev.banner || ev.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80';

                return (
                  <TechCard
                    key={ev._id}
                    className="w-[84vw] sm:w-[350px] flex-shrink-0 snap-start p-0 bg-[#0a0d12] border-[#30363d] overflow-hidden rounded-2xl flex flex-col justify-between group shadow-xl hover:border-[#2f9e44]/60 transition-all duration-300"
                  >
                    <div>
                      {/* 16:9 Thumbnail Image Container */}
                      <div className="h-40 sm:h-48 relative overflow-hidden bg-[#18202c]">
                        <img
                          src={thumbUrl}
                          alt={ev.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />

                        {/* Completed Badge */}
                        <span className="absolute top-3 right-3 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#2f9e44] text-white px-2.5 py-0.5 rounded-md shadow-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>

                        {ev.category && (
                          <span className="absolute top-3 left-3 text-[10px] font-mono uppercase font-bold text-gray-200 bg-[#0a0d12]/80 backdrop-blur-md px-2.5 py-0.5 rounded border border-gray-700/50">
                            {ev.category}
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="p-4 sm:p-5 space-y-2">
                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#2f9e44] transition-colors truncate">
                          {ev.title}
                        </h3>

                        <div className="flex items-center gap-2 text-xs font-mono text-[#2f9e44] font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{ev.date}</span>
                        </div>

                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {ev.description || 'Successfully conducted technical session organized by GeeksforGeeks Campus Body.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 pt-0">
                      <Link
                        to="/events"
                        className="w-full py-2 sm:py-2.5 rounded-xl bg-[#18202c] text-white hover:bg-[#2f9e44] transition-colors text-xs font-bold flex items-center justify-center gap-2 border border-[#30363d]"
                      >
                        View Event <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </TechCard>
                );
              })}
            </InfiniteMarquee>
          </section>
        )}

        {/* ─── 7. GALLERY (SPATIAL TECH MARQUEE + LIGHTBOX) ───────────────── */}
        {galleryList && galleryList.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#30363d] space-y-6 relative overflow-hidden bg-gradient-to-b from-[#0a0d12] via-[#121721]/40 to-[#0a0d12]">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <span className="tech-eyebrow">06 // COMMUNITY SHOWCASE</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Community Gallery</h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Moments from workshops, hackathons, sessions and our campus community.</p>
              </div>
              <Link to="/gallery" className="text-xs font-bold text-[#2f9e44] hover:underline flex items-center gap-1">
                View Full Gallery ({galleryList.length} Unique Photos) <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-5">
              {/* Row 1 Marquee: RIGHT → LEFT */}
              <InfiniteMarquee direction="left" duration={45} gapClass="gap-5">
                {galleryList.slice(0, 24).map((g, idx) => {
                  const widths = ['w-64', 'w-80', 'w-72', 'w-84'];
                  const cardWidth = widths[idx % widths.length];

                  return (
                    <div
                      key={g._id}
                      onClick={() => openLightbox(idx)}
                      className={`${cardWidth} h-44 rounded-2xl overflow-hidden border border-[#30363d] group flex-shrink-0 shadow-lg relative cursor-pointer card-3d-hover tech-corner`}
                    >
                      <img
                        src={g.url}
                        alt={g.title || 'Community Moment'}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                        <span className="text-xs font-bold text-white truncate">{g.title || 'GFG Campus Moment'}</span>
                        <span className="text-[10px] text-[#2f9e44] font-semibold">{g.album || 'Jamia Hamdard'}</span>
                      </div>
                    </div>
                  );
                })}
              </InfiniteMarquee>

              {/* Row 2 Marquee: LEFT → RIGHT */}
              <InfiniteMarquee direction="right" duration={52} gapClass="gap-5" className="opacity-95">
                {galleryList.slice(24, 48).map((g, idx) => {
                  const realIdx = idx + 24;
                  const widths = ['w-72', 'w-64', 'w-84', 'w-80'];
                  const cardWidth = widths[idx % widths.length];

                  return (
                    <div
                      key={g._id}
                      onClick={() => openLightbox(realIdx)}
                      className={`${cardWidth} h-44 rounded-2xl overflow-hidden border border-[#30363d] group flex-shrink-0 shadow-lg relative cursor-pointer card-3d-hover tech-corner`}
                    >
                      <img
                        src={g.url}
                        alt={g.title || 'Community Moment'}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                        <span className="text-xs font-bold text-white truncate">{g.title || 'GFG Campus Moment'}</span>
                        <span className="text-[10px] text-[#2f9e44] font-semibold">{g.album || 'Jamia Hamdard'}</span>
                      </div>
                    </div>
                  );
                })}
              </InfiniteMarquee>
            </div>
          </section>
        )}

        {/* ─── 8. LATEST ANNOUNCEMENTS BANNER (DYNAMIC BULLETIN) ─────────── */}
        {latestAnnouncement && (
          <section className="py-8 bg-gradient-to-r from-[#1b5e20] via-[#0d2e10] to-[#0a0d12] border-y border-[#2f9e44]/40 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="p-3 rounded-2xl bg-[#2f9e44] text-white hidden sm:block">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#2f9e44] bg-white/10 px-2.5 py-0.5 rounded uppercase tracking-widest border border-white/20">
                    {latestAnnouncement.type || 'Latest Bulletin'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-1">{latestAnnouncement.title}</h3>
                  <p className="text-xs text-gray-300 font-medium max-w-2xl">{latestAnnouncement.description}</p>
                </div>
              </div>
              {latestAnnouncement.linkUrl ? (
                <a
                  href={latestAnnouncement.linkUrl}
                  target={latestAnnouncement.linkUrl.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-white text-[#0a0d12] hover:bg-[#2f9e44] hover:text-white font-bold text-xs flex items-center gap-2 transition-all flex-shrink-0"
                >
                  {latestAnnouncement.linkLabel || 'Learn More'} <ArrowRight className="w-4 h-4" />
                </a>
              ) : (
                <Link to="/community" className="px-5 py-2.5 rounded-xl bg-white text-[#0a0d12] hover:bg-[#2f9e44] hover:text-white font-bold text-xs flex items-center gap-2 transition-all flex-shrink-0">
                  Explore Community <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </section>
        )}

        {/* ─── 9. JOIN COMMUNITY (HIGH-IMPACT DEVELOPER CTA) ──────────────── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <TechCard className="max-w-5xl mx-auto p-10 sm:p-14 border-[#2f9e44]/50 bg-gradient-to-br from-[#121721] via-[#0a0d12] to-[#142e16] text-center space-y-6 shadow-2xl">
            <span className="tech-eyebrow font-mono">
              <Code2 className="w-3.5 h-3.5" /> READY_TO_BUILD<span className="animate-cursor text-[#2f9e44]">_</span>
            </span>
            
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Join the GFG Campus Body Community
            </h2>
            
            <p className="text-lg font-bold text-[#2f9e44] font-mono">
              BUILD // LEARN // COLLABORATE // GROW
            </p>

            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Connect with fellow student developers, participate in hands-on workshops, hackathons, and competitive coding activities at Jamia Hamdard.
            </p>

            <div className="pt-4 flex justify-center">
              <Link to="/community" className="px-8 py-4 rounded-xl gradient-button font-bold text-base flex items-center gap-3 shadow-xl shadow-[#2f9e44]/30">
                Join Community <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </TechCard>
        </section>

      </main>

      {/* Lightbox Modal */}
      <GalleryLightbox
        images={galleryList}
        currentIndex={activeImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryList.length - 1))}
        onNext={() => setActiveImageIndex((prev) => (prev < galleryList.length - 1 ? prev + 1 : 0))}
      />

      {/* ─── 10. FOOTER (STATIC) ────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}

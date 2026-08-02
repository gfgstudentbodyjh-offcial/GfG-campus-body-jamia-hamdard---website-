import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import { MOCK_FACULTY } from '../../data/faculty';
import { Users, Code2, Palette, Calendar, Megaphone, Share2, Mail, Linkedin, Github, Instagram, Award, GraduationCap } from 'lucide-react';
import TechHeader from '../../components/common/TechHeader';
import TechCard from '../../components/common/TechCard';

const ICON_MAP = {
  Users,
  Code2,
  Palette,
  Calendar,
  Megaphone,
  Share2
};

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [teamsRes, facultyRes] = await Promise.all([
          api.get('/teams'),
          api.get('/faculty').catch(() => ({ data: { data: MOCK_FACULTY } }))
        ]);
        setTeams(teamsRes.data.data || []);
        setFaculty(facultyRes.data?.data?.length ? facultyRes.data.data : MOCK_FACULTY);
      } catch (err) {
        console.warn('Failed fetching teams data:', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0d12] text-gray-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 sm:space-y-12">
        
        {/* Page Header */}
        <TechHeader
          tag="02 // COMMUNITY MODULES"
          title="Faculty Advisors & Team Leads"
          description="Meet the esteemed faculty mentors and dedicated student leaders behind GeeksforGeeks Campus Body, Jamia Hamdard."
          count={teams.length}
          countLabel="Active Modules"
        />

        {/* ─── Faculty Coordinators Section (2-Col Grid on Mobile) ─────────── */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3 border-b border-[#30363d] pb-3 sm:pb-4">
            <div className="p-2 rounded-xl bg-[#2f9e44]/20 text-[#2f9e44] border border-[#2f9e44]/30 flex-shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#2f9e44] uppercase tracking-wider font-bold block">01 // ACADEMIC MENTORSHIP</span>
              <h2 className="text-lg sm:text-xl font-bold text-white">Faculty Coordinators</h2>
            </div>
          </div>

          {/* 2-Column Mobile Grid for Faculty */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {faculty.map((f, idx) => (
              <TechCard
                key={f._id || idx}
                className="p-3.5 sm:p-6 border-[#30363d] bg-gradient-to-br from-[#121721] to-[#0a0d12] flex flex-col justify-between space-y-3 sm:space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-6">
                  <img
                    src={f.photo || f.memberRef?.photo}
                    alt={`${f.name || f.memberRef?.name}, Faculty Coordinator`}
                    loading="lazy"
                    style={{ objectPosition: f.imagePosition || 'top' }}
                    className="w-full h-32 sm:w-36 sm:h-40 rounded-xl object-cover border-2 border-[#2f9e44] shadow-md flex-shrink-0"
                  />
                  <div className="space-y-1 sm:space-y-2 text-center sm:text-left min-w-0 w-full">
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#2f9e44] uppercase tracking-wider bg-[#2f9e44]/15 border border-[#2f9e44]/30 px-2 py-0.5 rounded inline-block">
                      Faculty Coordinator
                    </span>
                    <h3 className="text-xs sm:text-2xl font-bold text-white leading-tight truncate">{f.name || f.memberRef?.name}</h3>
                    <p className="text-[10px] sm:text-sm font-semibold text-gray-300 line-clamp-1">{f.designation}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-1">{f.department || f.institution}</p>
                    
                    {f.email && (
                      <a
                        href={`mailto:${f.email}`}
                        className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-[#2f9e44] hover:underline pt-0.5 truncate"
                      >
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{f.email}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Awards & Recognition */}
                {f.awards && f.awards.length > 0 && (
                  <div className="hidden sm:block pt-4 border-t border-[#30363d]/60 space-y-2">
                    <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#2f9e44]" /> Awards & Honors
                    </span>
                    <div className="space-y-1.5">
                      {f.awards.map((award, aIdx) => (
                        <div key={aIdx} className="text-xs text-gray-300 bg-[#0a0d12] p-2 rounded-lg border border-[#30363d] flex items-start gap-2">
                          <span className="text-[#2f9e44] font-bold">•</span>
                          <span>{award}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TechCard>
            ))}
          </div>
        </section>

        {/* ─── Student Teams & Leads (2-Col Mobile Grid per Team) ─────────── */}
        <section className="space-y-6 sm:space-y-8">
          <div className="flex items-center gap-3 border-b border-[#30363d] pb-3 sm:pb-4">
            <div className="p-2 rounded-xl bg-[#2f9e44]/20 text-[#2f9e44] border border-[#2f9e44]/30 flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#2f9e44] uppercase tracking-wider font-bold block">02 // STUDENT LEADERSHIP</span>
              <h2 className="text-lg sm:text-xl font-bold text-white">Student Teams & Leads</h2>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400 font-mono">Loading Teams...</div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {teams.map((t, idx) => {
                const IconComponent = ICON_MAP[t.icon] || Users;
                const lead = t.lead || t.leadRef;
                const coLead = t.coLead || t.coLeadRef;

                return (
                  <TechCard
                    key={t._id}
                    className="p-4 sm:p-8 border-[#30363d] bg-[#121721] space-y-4 sm:space-y-6"
                  >
                    {/* Team Module Header */}
                    <div className="flex items-center gap-3 pb-3 sm:pb-5 border-b border-[#30363d]">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#2f9e44]/20 border border-[#2f9e44]/40 flex items-center justify-center text-[#2f9e44] flex-shrink-0">
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#2f9e44] uppercase tracking-wider block">
                          MODULE 0{idx + 1}
                        </span>
                        <h3 className="text-lg sm:text-2xl font-bold text-white truncate">{t.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">{t.description}</p>
                      </div>
                    </div>

                    {/* Member Cards (Lead & Co-Lead Paired 2-Col Grid on Mobile) */}
                    <div className={coLead ? "grid grid-cols-2 gap-3 sm:gap-6" : "grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6"}>
                      {lead && (
                        <div className="bg-[#0a0d12] p-3.5 sm:p-6 rounded-2xl border border-[#2f9e44]/40 space-y-2.5 sm:space-y-4 flex flex-col justify-between tech-corner">
                          <div className="space-y-2.5">
                            <img
                              src={lead.photo}
                              alt={`${lead.name}, ${lead.title || 'Lead'}`}
                              loading="lazy"
                              style={{ objectPosition: lead.imagePosition || 'top' }}
                              className="w-full h-40 sm:h-44 rounded-xl object-cover border-2 border-[#2f9e44] flex-shrink-0 shadow-md"
                            />
                            <div className="space-y-1 min-w-0">
                              <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-white bg-[#2f9e44] px-2 py-0.5 rounded inline-block">
                                {lead.title || 'Lead'}
                              </span>
                              <h4 className="font-bold text-white text-xs sm:text-lg leading-tight truncate">{lead.name}</h4>
                            </div>

                            {lead.message && (
                              <p className="text-[10px] sm:text-xs text-gray-300 italic leading-relaxed pt-1.5 border-t border-[#30363d]/60 line-clamp-3 sm:line-clamp-none">
                                "{lead.message}"
                              </p>
                            )}
                          </div>

                          {/* Social Links */}
                          {lead.socials && (
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2 border-t border-[#30363d]">
                              {lead.socials.email && (
                                <a href={`mailto:${lead.socials.email}`} target="_blank" rel="noreferrer" className="p-1.5 sm:p-2 rounded-lg bg-[#18202c] text-gray-300 hover:text-white hover:bg-[#2f9e44] transition-colors border border-[#30363d]" title="Email">
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {lead.socials.linkedin && (
                                <a href={lead.socials.linkedin} target="_blank" rel="noreferrer" className="p-1.5 sm:p-2 rounded-lg bg-[#18202c] text-gray-300 hover:text-white hover:bg-[#0077b5] transition-colors border border-[#30363d]" title="LinkedIn">
                                  <Linkedin className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {lead.socials.github && (
                                <a href={lead.socials.github} target="_blank" rel="noreferrer" className="p-1.5 sm:p-2 rounded-lg bg-[#18202c] text-gray-300 hover:text-white hover:bg-gray-700 transition-colors border border-[#30363d]" title="GitHub">
                                  <Github className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {lead.socials.instagram && (
                                <a href={lead.socials.instagram} target="_blank" rel="noreferrer" className="p-1.5 sm:p-2 rounded-lg bg-[#18202c] text-gray-300 hover:text-white hover:bg-[#e1306c] transition-colors border border-[#30363d]" title="Instagram">
                                  <Instagram className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {coLead && (
                        <div className="bg-[#0a0d12] p-3.5 sm:p-6 rounded-2xl border border-[#30363d] space-y-2.5 sm:space-y-4 flex flex-col justify-between tech-corner">
                          <div className="space-y-2.5">
                            <img
                              src={coLead.photo}
                              alt={`${coLead.name}, ${coLead.title || 'Co-Lead'}`}
                              loading="lazy"
                              style={{ objectPosition: coLead.imagePosition || 'top' }}
                              className="w-full h-40 sm:h-44 rounded-xl object-cover border-2 border-[#30363d] flex-shrink-0 shadow-md"
                            />
                            <div className="space-y-1 min-w-0">
                              <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-gray-300 bg-[#18202c] border border-[#30363d] px-2 py-0.5 rounded inline-block">
                                {coLead.title || 'Co-Lead'}
                              </span>
                              <h4 className="font-bold text-white text-xs sm:text-lg leading-tight truncate">{coLead.name}</h4>
                            </div>

                            {coLead.message && (
                              <p className="text-[10px] sm:text-xs text-gray-300 italic leading-relaxed pt-1.5 border-t border-[#30363d]/60 line-clamp-3 sm:line-clamp-none">
                                "{coLead.message}"
                              </p>
                            )}
                          </div>

                          {/* Social Links */}
                          {coLead.socials && (
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2 border-t border-[#30363d]">
                              {coLead.socials.email && (
                                <a href={`mailto:${coLead.socials.email}`} target="_blank" rel="noreferrer" className="p-1.5 sm:p-2 rounded-lg bg-[#18202c] text-gray-300 hover:text-white hover:bg-[#2f9e44] transition-colors border border-[#30363d]" title="Email">
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {coLead.socials.linkedin && (
                                <a href={coLead.socials.linkedin} target="_blank" rel="noreferrer" className="p-1.5 sm:p-2 rounded-lg bg-[#18202c] text-gray-300 hover:text-white hover:bg-[#0077b5] transition-colors border border-[#30363d]" title="LinkedIn">
                                  <Linkedin className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {coLead.socials.github && (
                                <a href={coLead.socials.github} target="_blank" rel="noreferrer" className="p-1.5 sm:p-2 rounded-lg bg-[#18202c] text-gray-300 hover:text-white hover:bg-gray-700 transition-colors border border-[#30363d]" title="GitHub">
                                  <Github className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {coLead.socials.instagram && (
                                <a href={coLead.socials.instagram} target="_blank" rel="noreferrer" className="p-1.5 sm:p-2 rounded-lg bg-[#18202c] text-gray-300 hover:text-white hover:bg-[#e1306c] transition-colors border border-[#30363d]" title="Instagram">
                                  <Instagram className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TechCard>
                );
              })}
            </div>
          )}
        </section>

      </main>
      <Footer />
    </div>
  );
}

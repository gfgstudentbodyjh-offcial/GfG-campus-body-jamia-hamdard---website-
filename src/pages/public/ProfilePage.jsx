import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { Award, CheckCircle2, ShieldCheck } from 'lucide-react';
import TechHeader from '../../components/common/TechHeader';
import TechCard from '../../components/common/TechCard';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProfile({
      name: 'Saquib Sarfaraz',
      email: 'saquib.mantri@gfgcampus.org',
      role: 'Campus Mantri',
      teamName: 'Executive Team',
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      bio: 'Spearheading GeeksforGeeks chapter operations, organizing flagship hackathons, and fostering developer engagement at Jamia Hamdard.',
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'System Design'],
      badges: ['🏆 Chapter Champion', '⭐ Top Contributor', '🛡️ Serving Campus Mantri'],
      stats: {
        postsCount: 14,
        bookmarksCount: 32,
        contributorRank: '#1'
      }
    });
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0d12] text-gray-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-12">
        
        <TechHeader
          tag="08 // DEVELOPER PROFILE"
          title="Student Developer Identity"
          description="View your active chapter credentials, community rank, and academic contributions."
        />

        {loading ? (
          <div className="text-center py-16 text-gray-400 font-mono">Loading Profile...</div>
        ) : (
          <div className="space-y-8">
            
            {/* Profile Header Card */}
            <TechCard className="p-8 sm:p-10 border-[#2f9e44]/40 bg-gradient-to-br from-[#121721] via-[#0a0d12] to-[#142e16]/40 space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-[#2f9e44] shadow-xl"
                />
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-3xl font-extrabold text-white">{profile.name}</h1>
                    <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-[#2f9e44] text-white flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> {profile.role}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-gray-300">{profile.email} • {profile.teamName}</p>
                  <p className="text-xs text-gray-400 italic leading-relaxed pt-1">"{profile.bio}"</p>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="pt-4 border-t border-[#30363d] space-y-2">
                <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Technical Skills & Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-[#18202c] text-gray-200 text-xs font-mono font-semibold border border-[#30363d]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </TechCard>

            {/* Achievements & Activity Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TechCard className="p-6 bg-[#121721] text-center space-y-2">
                <span className="text-3xl font-black font-mono text-[#2f9e44]">{profile.stats.contributorRank}</span>
                <p className="text-xs text-gray-400 font-semibold">Campus Leaderboard Rank</p>
              </TechCard>
              <TechCard className="p-6 bg-[#121721] text-center space-y-2">
                <span className="text-3xl font-black font-mono text-white">{profile.stats.postsCount}</span>
                <p className="text-xs text-gray-400 font-semibold">Community Posts Shared</p>
              </TechCard>
              <TechCard className="p-6 bg-[#121721] text-center space-y-2">
                <span className="text-3xl font-black font-mono text-[#2f9e44]">{profile.stats.bookmarksCount}</span>
                <p className="text-xs text-gray-400 font-semibold">Saved Study Notes</p>
              </TechCard>
            </div>

            {/* Member Badges */}
            <TechCard className="p-6 bg-[#121721] space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-[#2f9e44]" /> Community Honor Badges
              </h3>
              <div className="flex flex-wrap gap-3">
                {profile.badges.map((b, i) => (
                  <span key={i} className="px-4 py-2 rounded-xl bg-[#0a0d12] text-white text-xs font-mono font-bold border border-[#2f9e44]/40 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2f9e44]" /> {b}
                  </span>
                ))}
              </div>
            </TechCard>

          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}

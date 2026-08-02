import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import { Trophy } from 'lucide-react';
import TechHeader from '../../components/common/TechHeader';
import TechCard from '../../components/common/TechCard';

export default function LeaderboardPage() {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/leaderboard');
        setBoard(res.data.data || []);
      } catch (err) {
        console.warn(err);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0d12] text-gray-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        
        <TechHeader
          tag="07 // COMPETITIVE RANKINGS"
          title="Community Contributor Leaderboard"
          description="Recognizing top student scholars sharing notes, answering questions, and building open-source projects."
          count={board.length}
          countLabel="Ranked Scholars"
        />

        {loading ? (
          <div className="text-center py-16 text-gray-400 font-mono">Loading Contributor Leaderboard...</div>
        ) : (
          <div className="space-y-8 max-w-4xl mx-auto">
            
            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {board.slice(0, 3).map((item) => (
                <TechCard
                  key={item.rank}
                  className={`p-6 text-center space-y-4 relative bg-[#121721] ${
                    item.rank === 1 ? 'border-[#2f9e44] bg-gradient-to-b from-[#121721] to-[#142e16] scale-105 shadow-xl shadow-green-950/40' : 'border-[#30363d]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#2f9e44] text-white font-black font-mono text-sm flex items-center justify-center mx-auto shadow-md">
                    #{item.rank}
                  </div>
                  <img
                    src={item.member?.photo}
                    alt={item.member?.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#2f9e44] mx-auto shadow-md"
                  />
                  <div>
                    <h3 className="font-bold text-white text-base">{item.member?.name}</h3>
                    <p className="text-xs text-[#2f9e44] font-semibold">{item.badge}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.member?.role}</p>
                  </div>
                  <div className="pt-2 border-t border-[#30363d] flex justify-between text-xs text-gray-300 font-mono">
                    <span>Points: <strong className="text-white">{item.points}</strong></span>
                    <span>Notes: <strong className="text-white">{item.notesUploaded}</strong></span>
                  </div>
                </TechCard>
              ))}
            </div>

            {/* Complete Leaderboard Table */}
            <div className="bg-[#121721] border border-[#30363d] rounded-2xl overflow-hidden shadow-xl tech-corner">
              <div className="p-6 border-b border-[#30363d] flex items-center justify-between">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#2f9e44]" /> Full Contributor Ranks
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-[#0a0d12] text-xs font-mono uppercase text-gray-400 border-b border-[#30363d]">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Rank</th>
                      <th className="px-6 py-4 font-semibold">Contributor Profile</th>
                      <th className="px-6 py-4 font-semibold">Badge Honor</th>
                      <th className="px-6 py-4 font-semibold">Study Notes Shared</th>
                      <th className="px-6 py-4 font-semibold text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363d]">
                    {board.map((item) => (
                      <tr key={item.rank} className="hover:bg-[#0a0d12]/60 transition-colors">
                        <td className="px-6 py-4 font-black font-mono text-[#2f9e44] text-base">#{item.rank}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={item.member?.photo} alt={item.member?.name} className="w-10 h-10 rounded-full object-cover border border-[#2f9e44]" />
                            <div>
                              <p className="font-bold text-white text-sm">{item.member?.name}</p>
                              <p className="text-[10px] text-gray-400">{item.member?.teamName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-gray-200">{item.badge}</td>
                        <td className="px-6 py-4 text-xs text-gray-300 font-bold font-mono">{item.notesUploaded} Notes</td>
                        <td className="px-6 py-4 text-right font-black font-mono text-white text-base">{item.points} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import { MOCK_EVENTS } from '../../data/events';
import { Calendar, UserCheck, Handshake, Trophy, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import TechHeader from '../../components/common/TechHeader';
import TechCard from '../../components/common/TechCard';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Upcoming', 'Past'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/events');
        setEvents(res.data.data?.length ? res.data.data : MOCK_EVENTS);
      } catch (err) {
        console.warn(err);
        setEvents(MOCK_EVENTS);
      }
      setLoading(false);
    };
    load();
  }, []);

  const upcomingEvents = events.filter((e) => e.status !== 'Completed' && e.status !== 'Archived' && e.isUpcoming !== false);
  const pastEvents = events.filter((e) => e.status === 'Completed' || e.status === 'Archived' || e.isUpcoming === false);

  const displayedEvents = activeTab === 'Upcoming'
    ? upcomingEvents
    : activeTab === 'Past'
    ? pastEvents
    : events;

  return (
    <div className="min-h-screen bg-transparent text-gray-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        
        {/* Header */}
        <TechHeader
          tag="04 // EVENT COMMAND CENTER"
          title="Events & Technical Workshops"
          description={`Explore ${pastEvents.length} past technical events & ${upcomingEvents.length} upcoming initiatives organized by GeeksforGeeks Campus Body Jamia Hamdard.`}
          count={events.length}
          countLabel="Total Sessions"
        >
          {/* Segmented Control Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
            {[
              { id: 'All', label: `All (${events.length})` },
              { id: 'Upcoming', label: `Upcoming (${upcomingEvents.length})` },
              { id: 'Past', label: `Past (${pastEvents.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-[#2f9e44] text-white shadow-lg shadow-[#2f9e44]/25 border border-[#2f9e44]'
                    : 'bg-[#121721] text-gray-300 border border-[#30363d] hover:border-[#2f9e44]/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </TechHeader>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400 font-mono">Loading Events...</div>
        ) : displayedEvents.length === 0 ? (
          <div className="text-center py-16 text-gray-500 font-mono">No events found for "{activeTab}"</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedEvents.map((ev) => {
              const isUpcoming = upcomingEvents.includes(ev);

              return (
                <TechCard
                  key={ev._id}
                  className="flex flex-col justify-between group bg-[#121721]"
                >
                  <div>
                    <div className="h-48 relative overflow-hidden">
                      <img
                        src={ev.banner}
                        alt={ev.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Status Badge */}
                      {isUpcoming ? (
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#0a0d12]/90 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>{ev.status || 'REGISTRATION OPEN'}</span>
                        </span>
                      ) : (
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#18202c]/90 text-gray-400 border border-[#30363d]">
                          {ev.category || 'Completed'}
                        </span>
                      )}
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-[#2f9e44] transition-colors leading-snug">
                        {ev.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs font-mono text-[#2f9e44] font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{ev.date}</span>
                      </div>

                      {ev.speaker && (
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                          <span>Speaker: {ev.speaker}</span>
                        </div>
                      )}

                      {ev.partner && (
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <Handshake className="w-3.5 h-3.5 text-[#06b6d4]" />
                          <span>Partner: {ev.partner}</span>
                        </div>
                      )}

                      {ev.prizePool && (
                        <div className="flex items-center gap-2 text-xs text-yellow-400 font-bold">
                          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                          <span>Prize Pool: {ev.prizePool}</span>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 line-clamp-2 pt-1">{ev.description}</p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    {ev.registrationFormRef ? (
                      <Link
                        to={`/forms/${ev.registrationFormRef}`}
                        className="w-full py-2.5 rounded-xl gradient-button text-xs font-bold flex items-center justify-center gap-2 shadow-md"
                      >
                        <span>Register Now</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <div className="w-full py-2.5 rounded-xl bg-[#18202c] text-gray-300 text-xs font-bold flex items-center justify-center gap-2 border border-[#30363d]">
                        <span>Session Complete</span>
                      </div>
                    )}
                  </div>
                </TechCard>
              );
            })}
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}

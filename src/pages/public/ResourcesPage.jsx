import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import { Download } from 'lucide-react';
import TechHeader from '../../components/common/TechHeader';
import TechCard from '../../components/common/TechCard';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'DSA', 'Development', 'Placement', 'CP', 'Others'];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/resources', { params: { category } });
        setResources(res.data.data || []);
      } catch (err) {
        console.warn(err);
      }
      setLoading(false);
    };
    load();
  }, [category]);

  const handleDownload = async (id, fileUrl) => {
    try {
      await api.patch(`/resources/${id}/download`);
    } catch (err) {
      console.warn(err);
    }
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a0d12] text-gray-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        
        <TechHeader
          tag="05 // KNOWLEDGE REPOSITORY"
          title="Curated Learning Vault"
          description="Download DSA cheat sheets, full-stack roadmaps, and interview preparation guides created by GFG Campus Body."
          count={resources.length}
          countLabel="Available Resources"
        >
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  category === cat
                    ? 'bg-[#2f9e44] text-white shadow-lg shadow-[#2f9e44]/25 border border-[#2f9e44]'
                    : 'bg-[#121721] text-gray-300 border border-[#30363d] hover:border-[#2f9e44]/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </TechHeader>

        {loading ? (
          <div className="text-center py-16 text-gray-400 font-mono">Loading Resources...</div>
        ) : resources.length === 0 ? (
          <div className="text-center py-16 text-gray-500 font-mono">No resources found under "{category}"</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((r, idx) => (
              <TechCard key={r._id} className="p-6 bg-[#121721] flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-[#2f9e44]/15 text-[#2f9e44] border border-[#2f9e44]/30 uppercase">
                      0{idx + 1} // {r.category}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{r.downloadsCount || 0} Downloads</span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug">{r.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-3">{r.description}</p>
                </div>

                <button
                  onClick={() => handleDownload(r._id, r.fileUrl)}
                  className="w-full py-3 rounded-xl gradient-button text-xs font-bold flex items-center justify-center gap-2 shadow-md"
                >
                  <Download className="w-4 h-4" /> Download Material
                </button>
              </TechCard>
            ))}
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import { Download, ExternalLink, AlertTriangle, Eye } from 'lucide-react';
import TechHeader from '../../components/common/TechHeader';
import TechCard from '../../components/common/TechCard';
import PdfPreviewModal from '../../components/common/PdfPreviewModal';

import cacheService from '../../services/cacheService';
import { getStreamPdfUrl } from '../../utils/mediaResolver';

/**
 * Robust extraction of resource URL across production MongoDB schemas.
 */
const getResourceUrl = (resource) =>
  resource?.fileUrl ||
  resource?.url ||
  resource?.resourceUrl ||
  resource?.pdfUrl ||
  resource?.file?.url ||
  resource?.media?.url ||
  '';

/**
 * Robust PDF detection across stored fields.
 */
const checkIsPdf = (resource) => {
  const url = getResourceUrl(resource);
  return (
    resource?.mimeType === 'application/pdf' ||
    resource?.format?.toLowerCase() === 'pdf' ||
    resource?.resourceType?.toLowerCase().includes('pdf') ||
    resource?.resourceType === 'PDF' ||
    /\.pdf(?:$|\?)/i.test(url)
  );
};

/**
 * Determines if a stored resource URL is a valid permanent delivery URL.
 */
const isValidPdfUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('blob:')) return false;
  if (url.startsWith('file:')) return false;
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) return false;
  if (url.includes('localhost') && !url.startsWith('http://localhost')) return false;
  return true;
};

export default function ResourcesPage() {
  const [category, setCategory] = useState('All');
  const cacheKey = `resources_${category}`;

  const [previewResource, setPreviewResource] = useState(null);

  const [resources, setResources] = useState(() => {
    const cached = cacheService.get(cacheKey);
    return cached?.data || [];
  });
  const [loading, setLoading] = useState(() => {
    const cached = cacheService.get(cacheKey);
    return !(cached && cached.data && cached.data.length > 0);
  });

  const categories = ['All', 'DSA', 'Development', 'Placement', 'CP', 'Others'];

  useEffect(() => {
    const cached = cacheService.get(cacheKey);
    if (cached && cached.data) {
      setResources(cached.data);
      setLoading(false);
    } else {
      setLoading(true);
    }

    const unsub = cacheService.subscribe('resources', () => {
      cacheService.dedupe(cacheKey, () => api.get('/resources', { params: { category } }))
        .then((res) => {
          const data = res.data.data || [];
          setResources(data);
          cacheService.set(cacheKey, data);
        });
    });

    cacheService.dedupe(cacheKey, () => api.get('/resources', { params: { category } }))
      .then((res) => {
        const data = res.data.data || [];
        setResources(data);
        cacheService.set(cacheKey, data);
      })
      .catch((err) => console.warn(err))
      .finally(() => setLoading(false));

    return unsub;
  }, [category]);

  const handleDownload = async (id, fileUrl, title) => {
    try {
      if (id) await api.patch(`/resources/${id}/download`);
    } catch (err) {
      console.warn(err);
    }

    const targetUrl = getStreamPdfUrl(fileUrl, { download: true, filename: title });
    window.open(targetUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        
        <TechHeader
          tag="LEARNING RESOURCES"
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
            {resources.map((r, idx) => {
              const resUrl = getResourceUrl(r);
              const isPdf = checkIsPdf(r);
              const isValid = isValidPdfUrl(resUrl);

              return (
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

                  {/* Actions Section */}
                  {!isValid ? (
                    <div className="w-full py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      PDF unavailable — needs re-upload
                    </div>
                  ) : isPdf ? (
                    <div className="flex items-center gap-2 w-full pt-1">
                      <button
                        type="button"
                        onClick={() => setPreviewResource(r)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#2f9e44] hover:bg-[#258337] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#2f9e44]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Preview PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(r._id, resUrl)}
                        className="px-3.5 py-2.5 rounded-xl bg-[#1c2128] hover:bg-[#2d333b] text-gray-200 text-xs font-bold border border-[#30363d] flex items-center justify-center gap-1.5 transition-colors"
                        title="Download Material"
                      >
                        <Download className="w-4 h-4 text-gray-400" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDownload(r._id, resUrl)}
                      className="w-full py-3 rounded-xl gradient-button text-xs font-bold flex items-center justify-center gap-2 shadow-md"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Resource</span>
                    </button>
                  )}
                </TechCard>
              );
            })}
          </div>
        )}

      </main>
      <Footer />

      {/* PDF Preview Modal */}
      {previewResource && (
        <PdfPreviewModal
          isOpen={!!previewResource}
          url={getResourceUrl(previewResource)}
          title={previewResource.title}
          onClose={() => setPreviewResource(null)}
          onDownload={() => handleDownload(previewResource._id, getResourceUrl(previewResource))}
        />
      )}
    </div>
  );
}

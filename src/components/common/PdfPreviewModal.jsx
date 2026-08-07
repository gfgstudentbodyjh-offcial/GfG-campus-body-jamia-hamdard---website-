import React, { useEffect } from 'react';
import { X, ExternalLink, Download, FileText, Loader2 } from 'lucide-react';
import { getStreamPdfUrl } from '../../utils/mediaResolver';

export default function PdfPreviewModal({ isOpen, url, title, onClose, onDownload }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !url) return null;

  // Resolve target stream URL safely for production delivery
  const streamUrl = getStreamPdfUrl(url, { filename: title });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-5xl h-[85vh] sm:h-[90vh] bg-[#121721] border border-[#30363d] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#0d1117] border-b border-[#30363d] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="p-2 rounded-lg bg-[#2f9e44]/15 border border-[#2f9e44]/30 text-[#2f9e44] flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                {title || 'PDF Document Viewer'}
              </h3>
              <p className="text-[10px] font-mono text-gray-400">Public Document Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#1c2128] hover:bg-[#2d333b] text-gray-200 text-xs font-mono font-bold border border-[#30363d] flex items-center gap-1.5 transition-colors hidden sm:flex"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              <span>Open in Tab</span>
            </a>

            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="px-3 py-1.5 rounded-xl bg-[#2f9e44] hover:bg-[#258337] text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-[#2f9e44]/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#1c2128] hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-[#30363d] transition-colors"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-[#090d13] relative overflow-hidden flex flex-col">
          <iframe
            src={streamUrl}
            title={title || 'PDF Document Preview'}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}

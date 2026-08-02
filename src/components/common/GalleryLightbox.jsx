import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, ZoomIn, ZoomOut } from 'lucide-react';

export default function GalleryLightbox({ images = [], currentIndex = 0, isOpen = false, onClose, onPrev, onNext }) {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setIsZoomed(false);
  }, [currentIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];
  const formattedIndex = (currentIndex + 1).toString().padStart(2, '0');
  const formattedTotal = images.length.toString().padStart(2, '0');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050a0f]/94 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Container Box */}
      <div
        className="relative max-w-6xl w-full max-h-[92vh] flex flex-col items-center justify-between space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar Controls */}
        <div className="w-full flex items-center justify-between px-2 text-white">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-[#2f9e44] bg-[#161b22] px-3.5 py-1.5 rounded-full border border-[#30363d] tracking-wider">
              {formattedIndex} / {formattedTotal}
            </span>
            <span className="text-xs text-gray-400 font-medium hidden sm:inline">
              {currentImage.album || 'Community Moment'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 rounded-full bg-[#161b22] text-gray-300 hover:text-white border border-[#30363d] transition-all hidden sm:flex items-center gap-1.5 px-3 text-xs font-semibold"
              title="Toggle Zoom"
            >
              {isZoomed ? <ZoomOut className="w-4 h-4 text-[#2f9e44]" /> : <ZoomIn className="w-4 h-4 text-[#2f9e44]" />}
              <span>{isZoomed ? 'Reset Zoom' : 'Zoom'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#161b22] text-gray-300 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 border border-[#30363d] transition-all"
              aria-label="Close Lightbox (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Image Stage */}
        <div className="relative w-full max-h-[76vh] flex items-center justify-center overflow-auto rounded-2xl border border-[#30363d]/80 bg-[#0d1117] shadow-2xl group py-2 px-4">
          <img
            src={currentImage.url}
            alt={currentImage.title || 'Community Moment'}
            onClick={() => setIsZoomed(!isZoomed)}
            className={`max-h-[74vh] w-auto object-contain rounded-xl select-none transition-transform duration-300 cursor-zoom-in ${
              isZoomed ? 'scale-125 cursor-zoom-out' : 'scale-100'
            }`}
          />

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#161b22]/90 text-white hover:bg-[#2f9e44] border border-[#30363d] shadow-2xl transition-all"
              aria-label="Previous Image (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#161b22]/90 text-white hover:bg-[#2f9e44] border border-[#30363d] shadow-2xl transition-all"
              aria-label="Next Image (Right Arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Caption */}
        <div className="text-center space-y-1">
          <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">
            {currentImage.title || 'GeeksforGeeks Campus Body Moment'}
          </h4>
          <p className="text-[11px] text-gray-400">
            Use ESC key to close • Left/Right Arrow keys to navigate • Click image to zoom
          </p>
        </div>
      </div>
    </div>
  );
}

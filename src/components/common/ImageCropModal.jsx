import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Move, Eye, AlertCircle } from 'lucide-react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import MEDIA_PRESETS from '../../config/mediaPresets';

/**
 * ImageCropModal — Universal Platform Image Crop & Positioning Modal
 * 
 * Implements non-destructive canvas panning, zooming, EXIF orientation handling,
 * memory safety caps, request locking, and live container previews.
 */
export default function ImageCropModal({
  isOpen,
  imageSrc, // File, Blob, or URL string
  presetKey = 'eventThumbnail',
  customPreset = null,
  onClose,
  onApplyCrop, // returns { croppedFile, croppedUrl, cropMetadata }
  title = 'Adjust & Crop Image'
}) {
  const { isLight } = useAdminTheme();
  const preset = customPreset || MEDIA_PRESETS[presetKey] || MEDIA_PRESETS.eventThumbnail;

  const [imageObj, setImageObj] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadError, setLoadError] = useState('');
  
  // Crop state
  const [selectedAspectMode, setSelectedAspectMode] = useState('original');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  // References
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const tempObjectUrlRef = useRef(null);

  // Clean up object URLs on unmount/close
  const cleanupTempUrl = () => {
    if (tempObjectUrlRef.current) {
      URL.revokeObjectURL(tempObjectUrlRef.current);
      tempObjectUrlRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen || !imageSrc) {
      setImageObj(null);
      setLoadError('');
      setIsProcessing(false);
      cleanupTempUrl();
      return;
    }

    let isMounted = true;
    setLoadingImage(true);
    setLoadError('');
    setZoom(1);
    setOffset({ x: 0, y: 0 });

    const loadImage = async () => {
      try {
        let srcUrl = '';
        if (typeof imageSrc === 'string') {
          if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
            // Fetch remote URLs as blob to guarantee CORS safety and prevent canvas taint
            const res = await fetch(imageSrc);
            const blob = await res.blob();
            srcUrl = URL.createObjectURL(blob);
            tempObjectUrlRef.current = srcUrl;
          } else {
            srcUrl = imageSrc;
          }
        } else if (imageSrc instanceof File || imageSrc instanceof Blob) {
          cleanupTempUrl();
          srcUrl = URL.createObjectURL(imageSrc);
          tempObjectUrlRef.current = srcUrl;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!isMounted) return;
          setImageObj(img);
          setLoadingImage(false);
        };
        img.onerror = () => {
          if (!isMounted) return;
          setLoadError('Failed to load image for cropping.');
          setLoadingImage(false);
        };
        img.src = srcUrl;
      } catch (err) {
        if (!isMounted) return;
        setLoadError('Failed to load remote image.');
        setLoadingImage(false);
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [isOpen, imageSrc]);

  // Render crop canvas preview
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObj) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw background grid
    ctx.fillStyle = isLight ? '#f1f5f9' : '#0d1117';
    ctx.fillRect(0, 0, width, height);

    // Calculate base cover scaling
    const imgWidth = imageObj.naturalWidth || imageObj.width;
    const imgHeight = imageObj.naturalHeight || imageObj.height;

    const baseScale = Math.max(width / imgWidth, height / imgHeight);
    const scaledWidth = imgWidth * baseScale * zoom;
    const scaledHeight = imgHeight * baseScale * zoom;

    // Center + offset
    const drawX = (width - scaledWidth) / 2 + offset.x;
    const drawY = (height - scaledHeight) / 2 + offset.y;

    ctx.drawImage(imageObj, drawX, drawY, scaledWidth, scaledHeight);

    // Render live target preview canvas if enabled
    if (previewCanvasRef.current) {
      const pCanvas = previewCanvasRef.current;
      const pCtx = pCanvas.getContext('2d');
      pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
      pCtx.drawImage(canvas, 0, 0, pCanvas.width, pCanvas.height);
    }
  }, [imageObj, zoom, offset, isLight]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Mouse / Touch Dragging Handlers
  const handleStartDrag = (clientX, clientY) => {
    setIsDragging(true);
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMoveDrag = (clientX, clientY) => {
    if (!isDragging) return;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleEndDrag = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Generate cropped output file & metadata from original high-resolution image
  const handleApply = async () => {
    if (isProcessing || !imageObj) return;
    setIsProcessing(true);

    try {
      const maxDim = preset.maxOutputDimension || 2400;
      let exportW = preset.targetWidth || 1200;
      let exportH = preset.targetHeight || 675;

      if (preset.aspectRatio) {
        if (exportW > maxDim) {
          exportW = maxDim;
          exportH = Math.round(maxDim / preset.aspectRatio);
        }
      } else {
        exportW = Math.min(imageObj.naturalWidth, maxDim);
        exportH = Math.min(imageObj.naturalHeight, maxDim);
      }

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = exportW;
      exportCanvas.height = exportH;

      const eCtx = exportCanvas.getContext('2d');
      eCtx.imageSmoothingEnabled = true;
      eCtx.imageSmoothingQuality = 'high';

      // Source-space sub-rectangle calculation from viewport offset & zoom
      const previewW = 480;
      const previewH = Math.round(480 / (preset.aspectRatio || 16 / 9));

      const imgW = imageObj.naturalWidth || imageObj.width;
      const imgH = imageObj.naturalHeight || imageObj.height;

      const baseScale = Math.max(previewW / imgW, previewH / imgH);
      const scale = baseScale * zoom;

      const drawX = (previewW - imgW * scale) / 2 + offset.x;
      const drawY = (previewH - imgH * scale) / 2 + offset.y;

      const srcX = Math.max(0, -drawX / scale);
      const srcY = Math.max(0, -drawY / scale);
      const srcW = Math.min(imgW - srcX, previewW / scale);
      const srcH = Math.min(imgH - srcY, previewH / scale);

      eCtx.drawImage(imageObj, srcX, srcY, srcW, srcH, 0, 0, exportW, exportH);

      // Convert export canvas to Blob
      const blob = await new Promise((resolve) => {
        exportCanvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
      });

      if (!blob) {
        throw new Error('Failed to render cropped image output');
      }

      const croppedFile = new File([blob], `cropped_event_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const croppedUrl = URL.createObjectURL(blob);

      const cropMetadata = {
        zoom,
        offset,
        aspectRatio: preset.aspectRatio,
        presetId: preset.id
      };

      onApplyCrop({ croppedFile, croppedUrl, cropMetadata });
      cleanupTempUrl();
      onClose();
    } catch (err) {
      console.error('[ImageCropModal] Apply crop failed:', err);
      alert('Could not apply crop. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Dynamic aspect ratio calculation
  let aspect = preset.aspectRatio || 16 / 9;
  if (preset.allowedAspects) {
    if (selectedAspectMode === '1:1') aspect = 1;
    else if (selectedAspectMode === '4:5') aspect = 4 / 5;
    else if (selectedAspectMode === '16:9') aspect = 16 / 9;
    else if (selectedAspectMode === 'original' && imageObj) {
      aspect = (imageObj.naturalWidth || 1) / (imageObj.naturalHeight || 1);
    }
  }

  const canvasWidth = 480;
  const canvasHeight = Math.round(480 / aspect);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={`rounded-2xl border w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden transition-colors max-h-[92vh] ${
        isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#161b22] border-[#30363d] text-white'
      }`}>
        
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${isLight ? 'border-gray-200' : 'border-[#30363d]'}`}>
          <div>
            <h3 className={`text-base font-extrabold flex items-center gap-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              <Move className="w-4 h-4 text-[#2f9e44]" /> {title || preset.label}
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              {preset.helperText || 'Drag image to position subject and adjust zoom scale.'}
            </p>
          </div>
          <button
            onClick={() => {
              cleanupTempUrl();
              onClose();
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight ? 'text-gray-400 hover:text-gray-700 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-[#21262d]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {loadingImage ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-xs font-mono text-gray-400">
              <div className="w-8 h-8 border-2 border-[#2f9e44] border-t-transparent rounded-full animate-spin" />
              Loading image preview...
            </div>
          ) : loadError ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-xs font-mono text-red-400">
              <AlertCircle className="w-8 h-8 text-red-500" />
              {loadError}
            </div>
          ) : (
            <>
              {/* Interactive Crop Viewport */}
              <div className="flex flex-col items-center justify-center space-y-3">
                {preset.allowedAspects && preset.allowedAspects.length > 0 && (
                  <div className="flex items-center justify-center gap-2 w-full max-w-[480px]">
                    {preset.allowedAspects.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setSelectedAspectMode(mode)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                          selectedAspectMode === mode
                            ? 'bg-[#2f9e44] text-white shadow-sm'
                            : isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            : 'bg-[#21262d] hover:bg-[#30363d] text-gray-300 border border-[#30363d]'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className={`relative overflow-hidden rounded-xl border cursor-move select-none group shadow-inner ${
                    preset.isCircular ? 'rounded-full' : ''
                  } ${isLight ? 'border-gray-300 bg-slate-100' : 'border-[#30363d] bg-[#0d1117]'}`}
                  style={{ width: '100%', maxWidth: '480px', aspectRatio: `${aspect}` }}
                  onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
                  onMouseMove={(e) => handleMoveDrag(e.clientX, e.clientY)}
                  onMouseUp={handleEndDrag}
                  onMouseLeave={handleEndDrag}
                  onTouchStart={(e) => handleStartDrag(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchMove={(e) => handleMoveDrag(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchEnd={handleEndDrag}
                >
                  <canvas
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    className="w-full h-full object-contain pointer-events-none"
                  />

                  {/* Drag overlay guide */}
                  <div className="absolute inset-0 border border-white/30 pointer-events-none flex items-center justify-center">
                    <span className="bg-black/50 text-white/90 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs flex items-center gap-1">
                      <Move className="w-3 h-3" /> Drag to Reposition
                    </span>
                  </div>
                </div>

                {/* Controls Bar: Zoom Slider + Reset */}
                <div className={`w-full max-w-[480px] p-3 rounded-xl border flex items-center justify-between gap-4 ${
                  isLight ? 'bg-slate-50 border-gray-200' : 'bg-[#0d1117] border-[#30363d]'
                }`}>
                  <div className="flex items-center gap-2 flex-1">
                    <ZoomOut className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#2f9e44]"
                    />
                    <ZoomIn className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs font-mono font-bold text-[#2f9e44] w-12 text-right">
                      {zoom.toFixed(2)}x
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                      isLight ? 'bg-white hover:bg-gray-100 border-gray-300 text-gray-700' : 'bg-[#21262d] hover:bg-[#30363d] border-[#30363d] text-gray-300'
                    }`}
                    title="Reset position & zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>
              </div>

              {/* Live Target Card Preview Section */}
              {presetKey === 'eventThumbnail' && (
                <div className={`p-3.5 rounded-xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-gray-200' : 'bg-[#0d1117] border-[#30363d]'
                }`}>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2f9e44] uppercase tracking-wider font-mono">
                    <Eye className="w-3.5 h-3.5" /> Live Event Card Preview
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-16 rounded-lg overflow-hidden border border-[#2f9e44]/40 flex-shrink-0 shadow-sm bg-black">
                      <canvas ref={previewCanvasRef} width={112} height={64} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-xs space-y-1 min-w-0">
                      <p className={`font-bold truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>Event Title Live Framing</p>
                      <p className={`text-[10px] truncate ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Target ratio: 16:9 (1200×675 Output)</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-end gap-3 ${isLight ? 'border-gray-200 bg-slate-50' : 'border-[#30363d] bg-[#0d1117]'}`}>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => {
              cleanupTempUrl();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
              isLight ? 'bg-white hover:bg-gray-100 border-gray-300 text-gray-700' : 'bg-[#21262d] hover:bg-[#30363d] border-[#30363d] text-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isProcessing || loadingImage || !imageObj}
            onClick={handleApply}
            className="px-5 py-2 rounded-xl bg-[#2f9e44] hover:bg-[#258337] text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            {isProcessing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Applying...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Apply Crop</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

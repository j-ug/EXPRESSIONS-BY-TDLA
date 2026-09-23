import React, { useState } from 'react';
import { BotanicalArtwork } from '../types';
import { Sparkles, Maximize2, Layers, ChevronDown, ChevronUp, Focus } from 'lucide-react';

interface AboutArtOverlayProps {
  artwork: BotanicalArtwork;
  artworkIndex: number;
  totalArtworks: number;
  scrollProgress: number;
  isInGallery: boolean;
  onInspect: (artwork: BotanicalArtwork) => void;
}

export const AboutArtOverlay: React.FC<AboutArtOverlayProps> = ({
  artwork,
  artworkIndex,
  totalArtworks,
  scrollProgress,
  isInGallery,
  onInspect,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!artwork || !isInGallery || scrollProgress >= 0.88) {
    return null;
  }

  // Calculate how squarely this canvas is kept in the viewer's frame (0.0 to 1.0)
  const galleryT = Math.max(0, Math.min(1, (scrollProgress - 0.14) / (0.88 - 0.14)));
  const rawPos = totalArtworks > 1 ? galleryT * (totalArtworks - 1) : 0;
  // Proximity to the current camera stop for this active canvas
  const distFromCenter = Math.abs(rawPos - Math.round(rawPos));
  const inFrameRatio = Math.max(0.2, Math.min(1, 1 - distFromCenter / 0.48));
  const inFramePercent = Math.round(inFrameRatio * 100);

  // Responsive down-to-up vertical translation offset (in pixels)
  // As the canvas is kept more in the frame, offset shrinks to 0, sliding details up
  const baseOffset = (1 - inFrameRatio) * 28;

  // Positioning classes: gracefully placed to the side to keep 3D center view completely clear
  const getPositionClasses = () => {
    switch (artwork.panelPosition) {
      case 'right':
        return 'bottom-20 sm:bottom-8 right-4 sm:right-8 max-w-sm sm:max-w-md items-end';
      case 'left':
      default:
        return 'bottom-20 sm:bottom-8 left-4 sm:left-8 max-w-sm sm:max-w-md items-start';
    }
  };

  return (
    <div
      key={artwork.id}
      className={`pointer-events-none absolute z-20 flex flex-col transition-all duration-300 ease-out ${getPositionClasses()}`}
      style={{
        transform: `translateY(${Math.round((1 - inFrameRatio) * 14)}px)`,
        opacity: Math.min(1, Math.max(0.1, inFrameRatio * 1.3)),
      }}
    >
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#fffdf9]/95 backdrop-blur-md border border-[#ded0be] text-[#2d1f14] shadow-lg text-xs hover:bg-[#faf4ec] hover:border-[#bfa78f] transition-all cursor-pointer group"
          title="Expand artwork details"
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: artwork.biasLightColor }} />
          <span className="font-serif font-medium text-sm text-[#3b281b]">{artwork.title}</span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#826750]">
            0{artworkIndex + 1}/0{totalArtworks}
          </span>
          <ChevronUp className="w-3.5 h-3.5 text-[#85582f] group-hover:-translate-y-0.5 transition-transform" />
        </button>
      ) : (
        <div className="pointer-events-auto bg-[#fffdf9]/95 backdrop-blur-md border border-[#ded0be] p-4 sm:p-5 rounded-2xl shadow-xl transition-all duration-300 hover:border-[#bfa78f] text-left overflow-hidden">
          {/* Viewfinder Frame Focus Status & Header */}
          <div
            className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#ebdccb] animate-down-to-up stagger-1 transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${Math.round(baseOffset * 0.5)}px)`,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#7d5f44]">
                Exhibit 0{artworkIndex + 1} / 0{totalArtworks}
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: artwork.biasLightColor }} />
              {artwork.frameShape && (
                <span className="text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#f4ebe0] text-[#6b4f36] border border-[#ded0bd]">
                  {artwork.frameShape} frame
                </span>
              )}
            </div>

            {/* Real-time in-frame tracking feedback */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors ${
                  inFrameRatio > 0.8
                    ? 'bg-[#edf6ee] text-[#2c6e3b] border border-[#c4e3c9]'
                    : 'bg-[#f7f0e6] text-[#85582f] border border-[#ebdccb]'
                }`}
                title="How squarely the canvas is positioned in your frame"
              >
                <Focus className="w-2.5 h-2.5" />
                <span>{inFrameRatio > 0.85 ? 'In Frame' : `${inFramePercent}% Frame`}</span>
              </div>

              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1 rounded-md text-[#85582f] hover:bg-[#eedfcb]/50 transition-colors cursor-pointer"
                title="Minimize panel for clear 3D walk view"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Artwork Title with down-to-up stagger */}
          <div
            className="overflow-hidden animate-down-to-up stagger-2 transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${Math.round(baseOffset * 0.8)}px)`,
            }}
          >
            <h2 className="font-serif text-xl sm:text-2xl text-[#2d1f14] tracking-wide leading-tight mb-0.5">
              {artwork.title}
            </h2>
          </div>

          {/* Tamil Title with down-to-up stagger */}
          {artwork.tamilTitle && (
            <div
              className="overflow-hidden animate-down-to-up stagger-3 transition-transform duration-300 ease-out"
              style={{
                transform: `translateY(${Math.round(baseOffset * 1.0)}px)`,
              }}
            >
              <p className="text-xs text-[#73543b] font-serif tracking-wider mb-2">
                {artwork.tamilTitle}
              </p>
            </div>
          )}

          {/* Medium & Dimensions with down-to-up stagger */}
          <div
            className="flex items-center gap-2 text-xs text-[#5c4634] mb-2.5 pb-2 border-b border-[#eadecc] animate-down-to-up stagger-4 transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${Math.round(baseOffset * 1.2)}px)`,
            }}
          >
            <Layers className="w-3 h-3 text-[#8c5e34] shrink-0" />
            <span className="italic font-serif text-xs truncate max-w-[210px]">{artwork.medium}</span>
            <span className="text-[#bda893]">•</span>
            <span className="font-mono text-[10px] text-[#7d6148] shrink-0">{artwork.dimensions}</span>
          </div>

          {/* Botanical Species Tags with down-to-up stagger */}
          <div
            className="flex flex-wrap gap-1 mb-2.5 animate-down-to-up stagger-5 transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${Math.round(baseOffset * 1.4)}px)`,
            }}
          >
            {artwork.botanicalSpecies.map((sp, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#f5ecdf] text-[#594230] border border-[#ded0be]"
              >
                <Sparkles className="w-2 h-2 text-[#8c5e34]" />
                {sp}
              </span>
            ))}
          </div>

          {/* Artwork Curatorial Description with down-to-up stagger */}
          <div
            className="animate-down-to-up stagger-6 transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${Math.round(baseOffset * 1.6)}px)`,
            }}
          >
            <p className="text-xs text-[#574232] leading-relaxed mb-3 line-clamp-2 sm:line-clamp-3">
              {artwork.description}
            </p>
          </div>

          {/* Action Row with Price and Inspect Button with down-to-up stagger */}
          <div
            className="flex items-center justify-between gap-3 pt-1 border-t border-[#f0e4d5] animate-down-to-up stagger-7 transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${Math.round(baseOffset * 1.8)}px)`,
            }}
          >
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] font-mono uppercase text-[#7d6148]">Price:</span>
              <span className="font-serif font-bold text-sm text-[#85582f]">
                {artwork.price || 'Price on request'}
              </span>
            </div>

            <button
              onClick={() => onInspect(artwork)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#85582f] hover:bg-[#6e4622] active:scale-95 text-[#fffdfa] text-xs font-medium border border-[#9e6d3d] transition-all shadow-sm cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              Zoom & Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

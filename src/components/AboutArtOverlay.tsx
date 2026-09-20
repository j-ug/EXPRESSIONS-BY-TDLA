import React from 'react';
import { BotanicalArtwork } from '../types';
import { Sparkles, Maximize2, Compass, Layers } from 'lucide-react';

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
  if (!isInGallery || scrollProgress >= 0.88) {
    return null;
  }

  // Positioning classes based on artwork's panelPosition requirement
  // artwork 1: below
  // artwork 2: left
  // artwork 3: above
  // artwork 4: right
  // artwork 5: below
  const getPositionClasses = () => {
    switch (artwork.panelPosition) {
      case 'left':
        return 'top-1/2 -translate-y-1/2 left-6 sm:left-12 max-w-sm sm:max-w-md text-left';
      case 'right':
        return 'top-1/2 -translate-y-1/2 right-6 sm:right-12 max-w-sm sm:max-w-md text-right items-end';
      case 'above':
        return 'top-20 sm:top-24 left-1/2 -translate-x-1/2 max-w-lg text-center items-center';
      case 'below':
      default:
        return 'bottom-10 sm:bottom-14 left-1/2 -translate-x-1/2 max-w-xl text-center items-center';
    }
  };

  return (
    <div
      key={artwork.id}
      className={`pointer-events-none absolute z-20 flex flex-col transition-all duration-700 ease-out ${getPositionClasses()}`}
    >
      <div className="pointer-events-auto bg-[#fffdf9]/92 backdrop-blur-md border border-[#ded0be] p-5 sm:p-6 rounded-2xl shadow-2xl transition-transform duration-500 hover:border-[#bfa78f]">
        {/* Gallery sequence indicator */}
        <div className="flex items-center gap-2 mb-2 justify-inherit">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#7d5f44]">
            Exhibit 0{artworkIndex + 1} / 0{totalArtworks}
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: artwork.biasLightColor }} />
          {artwork.frameShape && (
            <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#f4ebe0] text-[#6b4f36] border border-[#ded0bd]">
              {artwork.frameShape} framing
            </span>
          )}
        </div>

        {/* Artwork Titles */}
        <h2 className="font-serif text-2xl sm:text-3xl text-[#2d1f14] tracking-wide leading-tight mb-1">
          {artwork.title}
        </h2>
        {artwork.tamilTitle && (
          <p className="text-xs text-[#73543b] font-serif tracking-wider mb-3">
            {artwork.tamilTitle}
          </p>
        )}

        {/* Medium & Dimensions */}
        <div className="flex items-center gap-2 text-xs text-[#5c4634] mb-3 pb-2.5 border-b border-[#eadecc]">
          <Layers className="w-3.5 h-3.5 text-[#8c5e34] shrink-0" />
          <span className="italic font-serif text-sm">{artwork.medium}</span>
          <span className="text-[#bda893]">•</span>
          <span className="font-mono text-[11px] text-[#7d6148]">{artwork.dimensions}</span>
        </div>

        {/* Botanical Species Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3.5 justify-inherit">
          {artwork.botanicalSpecies.map((sp, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#f5ecdf] text-[#594230] border border-[#ded0be]"
            >
              <Sparkles className="w-2.5 h-2.5 text-[#8c5e34]" />
              {sp}
            </span>
          ))}
        </div>

        {/* Artwork Description */}
        <p className="text-xs sm:text-sm text-[#574232] leading-relaxed mb-4 line-clamp-3 sm:line-clamp-none">
          {artwork.description}
        </p>

        {/* Inspiration & Action */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[#7d634c]">
            <Compass className="w-3 h-3 text-[#8c5e34]" />
            <span className="truncate max-w-[220px]">Tiruchy, Tamil Nadu</span>
          </div>

          <button
            onClick={() => onInspect(artwork)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#85582f] hover:bg-[#6e4622] active:scale-95 text-[#fffdfa] text-xs font-medium border border-[#9e6d3d] transition-all shadow-sm cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" />
            Inspect Work
          </button>
        </div>
      </div>
    </div>
  );
};

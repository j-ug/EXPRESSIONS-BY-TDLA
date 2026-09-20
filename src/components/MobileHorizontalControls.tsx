import React from 'react';
import { ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { BotanicalArtwork } from '../types';

interface MobileHorizontalControlsProps {
  scrollProgress: number;
  onProgressChange?: (progress: number) => void;
  onScrollProgressChange?: (progress: number) => void;
  artworks: BotanicalArtwork[];
  activeArtworkIndex: number;
  onSelectArtworkIndex?: (index: number) => void;
  isInGallery?: boolean;
}

export const MobileHorizontalControls: React.FC<MobileHorizontalControlsProps> = ({
  scrollProgress,
  onProgressChange,
  onScrollProgressChange,
  artworks,
  activeArtworkIndex,
  onSelectArtworkIndex,
  isInGallery = true,
}) => {
  const handleProgress = (p: number) => {
    if (onScrollProgressChange) onScrollProgressChange(p);
    else if (onProgressChange) onProgressChange(p);
  };

  const handleSelect = (index: number) => {
    if (onSelectArtworkIndex) {
      onSelectArtworkIndex(index);
    } else {
      const targetP = 0.14 + (index / Math.max(1, artworks.length - 1)) * 0.74;
      handleProgress(targetP);
    }
  };

  const handlePrev = () => {
    if (activeArtworkIndex > 0) {
      handleSelect(activeArtworkIndex - 1);
    } else {
      handleProgress(Math.max(0, scrollProgress - 0.15));
    }
  };

  const handleNext = () => {
    if (activeArtworkIndex < artworks.length - 1) {
      handleSelect(activeArtworkIndex + 1);
    } else {
      handleProgress(Math.min(1, scrollProgress + 0.15));
    }
  };

  const currentArt = artworks[activeArtworkIndex] || artworks[0];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-[#fffdf9]/95 backdrop-blur-lg border-t border-[#ded0be] shadow-2xl transition-all md:hidden">
      {/* Top micro status bar: current artwork name & swipe tip */}
      <div className="flex items-center justify-between text-[11px] mb-2 px-1 text-[#6e543f]">
        <div className="flex items-center gap-1.5 font-serif truncate max-w-[210px]">
          <Compass className="w-3.5 h-3.5 text-[#85582f] shrink-0" />
          <span className="font-semibold text-[#2d1f14] truncate">
            {isInGallery ? `Plate 0${activeArtworkIndex + 1}: ${currentArt.title}` : 'Gallery Vestibule'}
          </span>
        </div>
        <div className="text-[10px] font-mono text-[#8c6f55] uppercase tracking-wider animate-pulse flex items-center gap-1">
          <span>← Swipe horizontal →</span>
        </div>
      </div>

      {/* Horizontal Scrubber Track with Left / Right Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          className="p-2 rounded-xl bg-[#f5ecdf] active:bg-[#ede0ce] text-[#5e4530] border border-[#ded0be] transition-colors cursor-pointer shrink-0"
          title="Step Backward (Left)"
          aria-label="Previous artwork"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Custom artisanal range scrubber */}
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.002"
            value={scrollProgress}
            onChange={(e) => handleProgress(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#ecdccb] rounded-lg appearance-none cursor-pointer accent-[#85582f]"
            aria-label="Horizontal gallery progress scrubber"
          />
        </div>

        <button
          onClick={handleNext}
          className="p-2 rounded-xl bg-[#f5ecdf] active:bg-[#ede0ce] text-[#5e4530] border border-[#ded0be] transition-colors cursor-pointer shrink-0"
          title="Step Forward (Right)"
          aria-label="Next artwork"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal Specimen Dots / Quick-Jumps */}
      <div className="flex items-center justify-center gap-1.5 mt-2 overflow-x-auto py-1">
        {artworks.map((art, idx) => {
          const isActive = idx === activeArtworkIndex && isInGallery;
          return (
            <button
              key={art.id}
              onClick={() => handleSelect(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                isActive ? 'w-6 bg-[#85582f]' : 'w-2 bg-[#dcc9b4] hover:bg-[#bfa78f]'
              }`}
              title={`Jump to ${art.title}`}
            />
          );
        })}
      </div>
    </div>
  );
};

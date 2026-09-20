import React from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroEntryProps {
  scrollProgress: number;
  onEnterGallery: () => void;
}

export const HeroEntry: React.FC<HeroEntryProps> = ({ scrollProgress, onEnterGallery }) => {
  // Fade out as scroll begins entering the gallery room
  const opacity = Math.max(0, 1 - scrollProgress * 12);
  const translateY = scrollProgress * 100;

  if (opacity <= 0.01) {
    return null;
  }

  return (
    <div
      style={{
        opacity,
        transform: `translate3d(0, -${translateY}px, 0)`,
        pointerEvents: opacity < 0.2 ? 'none' : 'auto',
      }}
      className="fixed inset-0 z-30 flex flex-col items-center justify-center px-6 text-center transition-opacity duration-300"
    >
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        {/* Subtle decorative emblem */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fffdf9]/90 backdrop-blur-md border border-[#ded0be] text-[#78573a] text-xs uppercase tracking-widest mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#9e6d3d]" />
          <span>Tiruchirappalli • Tamil Nadu</span>
        </div>

        {/* Hero Title */}
        <div className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal text-[#2d1f14] tracking-tight leading-[1.1] mb-4 flex flex-col items-center">
          <div className="flex justify-center flex-wrap">
            {"Dr. G. Ophylia".split("").map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                animate={{
                  opacity: Math.max(0, 1 - scrollProgress * 20),
                  x: scrollProgress * (Math.random() - 0.5) * 1000,
                  y: scrollProgress * (Math.random() - 0.5) * 1000,
                  rotate: scrollProgress * 720,
                }}
                className="inline-block"
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </div>
          <div className="flex justify-center flex-wrap">
            {"Vinodhini".split("").map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                animate={{
                  opacity: Math.max(0, 1 - scrollProgress * 20),
                  x: scrollProgress * (Math.random() - 0.5) * 1000,
                  y: scrollProgress * (Math.random() - 0.5) * 1000,
                  rotate: scrollProgress * 720,
                }}
                className="inline-block"
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Subline */}
        <p className="font-serif italic text-xl sm:text-2xl text-[#6e5138] mb-3">
          Botanical Artist – Leaves & Flowers
        </p>

        {/* Poetic description */}
        <p className="text-sm sm:text-base text-[#634d3a] max-w-lg mx-auto leading-relaxed mb-8">
          A scroll-driven 3D walk through organic botanical landscapes — sculpted from rain-skeletonized leaves, sun-cured temple lotus petals, and natural Kaveri basin pigments.
        </p>

        {/* Subtle CTA: Enter the Gallery */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onEnterGallery}
            className="group px-7 py-3 rounded-full bg-[#85582f] hover:bg-[#6e4622] text-[#fffdfa] text-sm font-medium border border-[#9e6d3d] shadow-xl hover:shadow-[#9e6d3d]/30 transition-all duration-300 flex items-center gap-3 cursor-pointer hover:scale-105"
          >
            <span>Enter the Gallery</span>
            <ArrowDown className="w-4 h-4 text-[#edd5be] group-hover:translate-y-1 transition-transform" />
          </button>

          <span className="text-[11px] uppercase tracking-widest text-[#8c6f55] font-mono animate-pulse">
            Scroll down to step inside
          </span>
        </div>
      </div>
    </div>
  );
};

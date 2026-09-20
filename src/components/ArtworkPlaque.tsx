import React from 'react';
import { BotanicalArtwork } from '../types';

interface PlaqueProps {
  artwork: BotanicalArtwork;
}

export const ArtworkPlaque: React.FC<PlaqueProps> = ({ artwork }) => {
  return (
    <div className="absolute z-20 flex flex-col items-center bg-[#fffbf9]/80 backdrop-blur-sm p-3 rounded-sm border border-[#e0d0c0] shadow-md pointer-events-none transform -translate-x-1/2">
      <h4 className="font-serif text-sm font-bold text-[#2d1f14] mb-0.5">{artwork.title}</h4>
      <p className="text-[10px] text-[#5c4a3a] uppercase tracking-wide">{artwork.tamilTitle}</p>
      <div className="w-full h-[1px] bg-[#d0c0b0] my-1.5" />
      <p className="text-[10px] text-[#4a3a2a]">{artwork.medium}</p>
    </div>
  );
};

import React, { useMemo } from 'react';
import { BOTANICAL_ARTWORKS } from '../data/artworks';
import { BotanicalArtwork } from '../types';
import { createArtworkTexture } from '../utils/textureGenerator';
import { Sparkles, Layers, Maximize2, Mail } from 'lucide-react';
import { ARTIST_INFO } from '../data/artworks';

interface Accessible2DGalleryProps {
  onInspect: (artwork: BotanicalArtwork) => void;
  onJumpToArtist: () => void;
  artworks?: BotanicalArtwork[];
}

export const Accessible2DGallery: React.FC<Accessible2DGalleryProps> = ({
  onInspect,
  onJumpToArtist,
  artworks = BOTANICAL_ARTWORKS,
}) => {
  const artworkImages = useMemo(() => {
    return artworks.map((artwork) => {
      try {
        const tex = createArtworkTexture(artwork.textureTheme, artwork.customImageData);
        const canvas = tex.image as HTMLCanvasElement;
        return canvas ? canvas.toDataURL() : '';
      } catch {
        return '';
      }
    });
  }, [artworks]);
  return (
    <div className="min-h-screen bg-[#f7f2eb] text-[#2d1f14] pt-24 pb-20 px-4 sm:px-8 max-w-6xl mx-auto">
      {/* Introduction */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5ecdf] border border-[#ded0be] text-[#78573a] text-xs uppercase tracking-widest mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#9e6d3d]" />
          <span>Curated Exhibition Catalog • 2D Perspective</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#2d1f14] tracking-tight mb-3">
          Dr. G. Ophylia Vinodhini
        </h1>
        <p className="font-serif italic text-xl text-[#6e5138] mb-4">
          Botanical Artist – Leaves & Flowers • Tiruchy, Tamil Nadu
        </p>
        <p className="text-sm text-[#614934] leading-relaxed max-w-2xl mx-auto">
          An intimate series of botanical landscape works constructed from pressed leaves, cellular venation lattices, and dawn-harvested lotus petals rooted in the riverbanks and sacred groves of Tamil Nadu.
        </p>
      </div>

      {artworks.length === 0 && <p role="status" className="text-center py-12">No canvases are currently on display.</p>}
      {/* Artworks List */}
      <div className="grid grid-cols-2 gap-4 mb-20">
        {artworks.map((artwork, idx) => {
          const canvasDataUrl = artworkImages[idx] || '';

          return (
            <div
              key={artwork.id}
              className="flex flex-col gap-6 items-center bg-[#fffdf9] border border-[#ded0be] rounded-3xl p-6 sm:p-8 shadow-xl"
            >
              {/* Image Frame with Bias Lighting effect */}
              <div className="w-full flex justify-center">
                <div
                  className="relative p-2 rounded-2xl transition-transform duration-500 hover:scale-[1.02]"
                  style={{
                    boxShadow: `0 0 15px ${artwork.biasLightColor}1c`,
                    border: `1px solid ${artwork.biasLightColor}33`,
                  }}
                >
                  <img
                    src={artwork.customImageData || canvasDataUrl}
                    alt={artwork.title}
                    className="w-full max-w-sm h-auto rounded-lg shadow-md bg-[#fbf7f1] object-contain"
                  />
                  <div className="text-center mt-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#7d6148]">
                      Plate 0{idx + 1} • {artwork.frameShape} framing
                    </span>
                  </div>
                </div>
              </div>

              {/* Description & Botanical Annotation */}
              <div className="w-full flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: artwork.biasLightColor }}
                  />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#78573a]">
                    Exhibit 0{idx + 1}
                  </span>
                </div>

                <h2 className="font-serif text-xl font-bold text-[#1a140e] tracking-wide mb-1">
                  {artwork.title}
                </h2>
                {artwork.tamilTitle && (
                  <p className="font-serif text-xs font-bold text-[#4a3a2d] mb-2">
                    {artwork.tamilTitle}
                  </p>
                )}

                <div className="flex items-center gap-2 text-[10px] text-[#5c4634] mb-3 pb-2 border-b border-[#eadecc]">
                  <Layers className="w-3 h-3 text-[#8c5e34] shrink-0" />
                  <span className="italic font-serif">{artwork.medium}</span>
                </div>

                <p className="text-xs text-[#574232] leading-relaxed mb-3 line-clamp-3">
                  {artwork.description}
                </p>

                <div className="p-2 rounded-lg bg-[#f8f2e7] border border-[#dfd2c1] text-[10px] text-[#594432] leading-relaxed mb-4">
                  <span className="font-medium text-[#2d1f14] block mb-0.5">Inspiration:</span>
                  {artwork.inspiration}
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#f5ece0]/70 border border-[#ded0be] mb-4">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#7d6148] block">Price</span>
                    <span className="font-serif text-sm font-bold text-[#85582f]">{artwork.price || 'Price on request'}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8c6f55] px-2 py-0.5 rounded-full bg-[#fdfaf6] border border-[#e4d6c5]">
                    {artwork.dimensions}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onInspect(artwork)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#85582f] hover:bg-[#6e4622] text-[#fffefa] text-[10px] font-semibold border border-[#9e6d3d] transition-all cursor-pointer shadow-sm"
                  >
                    <Maximize2 className="w-3 h-3" />
                    Inspect
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* About the Artist CTA at bottom */}
      <div className="bg-[#fffdf9] border border-[#ded0be] rounded-3xl p-8 text-center max-w-2xl mx-auto shadow-sm">
        <h3 className="font-serif text-2xl text-[#2d1f14] mb-2">About Dr. G. Ophylia Vinodhini</h3>
        <p className="text-xs text-[#6e543f] mb-4">
          Botanical artist based in Tiruchy, Tamil Nadu. Creating contemplative pressed leaf compositions and environmental installations.
        </p>
        <button
          onClick={onJumpToArtist}
          className="px-6 py-2.5 rounded-full bg-[#85582f] hover:bg-[#6e4622] text-[#fffefa] text-xs font-semibold border border-[#9e6d3d] transition-all cursor-pointer"
        >
          View Artist Profile & Contact
        </button>
      </div>
    </div>
  );
};

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

      {/* Artworks List */}
      <div className="space-y-20 mb-20">
        {artworks.map((artwork, idx) => {
          const canvasDataUrl = artworkImages[idx] || '';

          return (
            <div
              key={artwork.id}
              className={`flex flex-col ${
                idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-8 lg:gap-14 items-center bg-[#fffdf9] border border-[#ded0be] rounded-3xl p-6 sm:p-10 shadow-xl`}
            >
              {/* Image Frame with Bias Lighting effect */}
              <div className="w-full lg:w-1/2 flex justify-center">
                <div
                  className="relative p-2.5 rounded-2xl transition-transform duration-500 hover:scale-[1.02]"
                  style={{
                    boxShadow: `0 0 45px ${artwork.biasLightColor}38`,
                    border: `1.5px solid ${artwork.biasLightColor}66`,
                  }}
                >
                  <img
                    src={canvasDataUrl}
                    alt={artwork.title}
                    className="w-full max-w-md h-auto rounded-xl shadow-lg bg-[#fbf7f1] object-contain"
                  />
                  <div className="text-center mt-2.5">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#7d6148]">
                      Plate 0{idx + 1} • {artwork.frameShape} framing
                    </span>
                  </div>
                </div>
              </div>

              {/* Description & Botanical Annotation */}
              <div className="w-full lg:w-1/2 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: artwork.biasLightColor }}
                  />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#78573a]">
                    Exhibit 0{idx + 1}
                  </span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl text-[#2d1f14] tracking-wide mb-1">
                  {artwork.title}
                </h2>
                {artwork.tamilTitle && (
                  <p className="font-serif text-sm text-[#73543b] mb-4">
                    {artwork.tamilTitle}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-[#5c4634] mb-4 pb-3 border-b border-[#eadecc]">
                  <Layers className="w-4 h-4 text-[#8c5e34] shrink-0" />
                  <span className="italic font-serif text-sm">{artwork.medium}</span>
                </div>

                <p className="text-sm text-[#574232] leading-relaxed mb-4">
                  {artwork.description}
                </p>

                <div className="p-3 rounded-xl bg-[#f8f2e7] border border-[#dfd2c1] text-xs text-[#594432] leading-relaxed mb-6">
                  <span className="font-medium text-[#2d1f14] block mb-1">Ecological & Cultural Inspiration:</span>
                  {artwork.inspiration}
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#f5ece0]/70 border border-[#ded0be] mb-6">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#7d6148] block">Acquisition Value</span>
                    <span className="font-serif text-xl font-bold text-[#85582f]">{artwork.price || '₹18,500'}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#8c6f55] px-2.5 py-1 rounded-full bg-[#fdfaf6] border border-[#e4d6c5]">
                    {artwork.dimensions}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onInspect(artwork)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#85582f] hover:bg-[#6e4622] text-[#fffefa] text-xs font-semibold border border-[#9e6d3d] transition-all cursor-pointer shadow-sm"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    Inspect Details & Reviews
                  </button>

                  <a
                    href={`mailto:${ARTIST_INFO.email}?subject=Inquiry%20regarding%20${encodeURIComponent(
                      artwork.title
                    )}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f5ecdf] hover:bg-[#ede0ce] text-[#6b5038] text-xs font-medium border border-[#ded0be] transition-all"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Inquire Artwork
                  </a>
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

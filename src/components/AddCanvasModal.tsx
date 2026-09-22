import React, { useState } from 'react';
import { X, Plus, Upload, Image as ImageIcon, Sparkles, Palette, Layers, Check } from 'lucide-react';
import { BotanicalArtwork, FrameShape } from '../types';

interface AddCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCanvas?: (artwork: Omit<BotanicalArtwork, 'id'>) => void | Promise<void>;
  onAddArtwork?: (artwork: BotanicalArtwork) => void | Promise<void>;
}

const COLOR_PRESETS = [
  { name: 'Forest Moss', color: '#608050' },
  { name: 'Kaveri Lotus', color: '#b86b77' },
  { name: 'Palmyra Amber', color: '#c29b38' },
  { name: 'Temple Teal', color: '#3d7a6b' },
  { name: 'Terracotta Scarlet', color: '#cf5a3c' },
  { name: 'Sandalwood Gold', color: '#d49b4b' },
];

export const AddCanvasModal: React.FC<AddCanvasModalProps> = ({
  isOpen,
  onClose,
  onAddCanvas,
  onAddArtwork,
}) => {
  const [title, setTitle] = useState('');
  const [tamilTitle, setTamilTitle] = useState('');
  const [price, setPrice] = useState('₹18,500');
  const [medium, setMedium] = useState('');
  const [dimensions, setDimensions] = useState('70 × 55 cm');
  const [year, setYear] = useState('2024');
  const [frameShape, setFrameShape] = useState<FrameShape>('rectangle');
  const [biasLightColor, setBiasLightColor] = useState('#608050');
  const [wallSide, setWallSide] = useState<'left' | 'right' | 'auto'>('auto');
  const [viewOrder, setViewOrder] = useState<number>(1);
  const [hallwayStation, setHallwayStation] = useState<number>(1);
  const [customImageData, setCustomImageData] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [inspiration, setInspiration] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  if (!isOpen) return null;

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const rawData = evt.target?.result as string;
      if (!rawData) return;

      // Cleanly load and compress to max 1400px so storage and WebGL render without lag or quota issues
      const img = new Image();
      img.onload = () => {
        const maxDim = 1400;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.92);
          setCustomImageData(compressed);
        } else {
          setCustomImageData(rawData);
        }
        setError(null);
      };
      img.onerror = () => {
        setCustomImageData(rawData);
        setError(null);
      };
      img.src = rawData;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (saving) return;

    if (!title.trim()) {
      setError('Please provide a title for the botanical artwork.');
      return;
    }

    if (!medium.trim()) {
      setError('Please describe the medium and organic materials used.');
      return;
    }

    const newArt: Omit<BotanicalArtwork, 'id'> = {
      title: title.trim(),
      tamilTitle: tamilTitle.trim() || undefined,
      botanicalSpecies: ['Pressed indigenous flora', 'Natural leaf specimens'],
      medium: medium.trim(),
      dimensions: dimensions.trim() || '65 × 85 cm',
      year: year.trim() || '2024',
      price: price.trim() || '₹18,500',
      frameShape,
      biasLightColor,
      biasLightIntensity: 2.0,
      description:
        description.trim() ||
        'A newly mounted botanical composition combining pressed indigenous flora and mineral pigment on rag paper.',
      inspiration:
        inspiration.trim() ||
        'Curated botanical specimen preserving floral cellular venation from the Kaveri basin landscape.',
      panelPosition: 'below',
      textureTheme: customImageData ? 'custom' : 'peepal_sacred',
      customImageData,
      createdBy: 'Curator Admin',
      wallSide,
      viewOrder: Number(viewOrder) || 1,
      hallwayStation: Number(hallwayStation) || 1,
    };

    const id = crypto.randomUUID();
    const fullArt: BotanicalArtwork = { ...newArt, id };
    setSaving(true);
    try {
      if (onAddArtwork) await onAddArtwork(fullArt);
      else if (onAddCanvas) await onAddCanvas(newArt);
      setTitle(''); setCustomImageData(undefined); setDescription(''); setInspiration('');
      onClose();
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not save canvas.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#21160e]/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#fffdf9] border border-[#ded0be] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#f5ece0] hover:bg-[#ede0ce] text-[#5e4530] hover:text-[#2d1f14] transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#f5ecdf] border border-[#ded0be] flex items-center justify-center text-[#85582f]">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#78573a]">
            Curator Suite • Authorized Admin
          </span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl text-[#2d1f14] tracking-wide mb-1">
          Mount New Botanical Canvas
        </h2>
        <p className="text-xs text-[#6e543f] mb-4">
          Add an authentic specimen canvas to Dr. Ophylia’s 3D exhibition walk and catalog.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#fdf1f1] border border-[#f5c6c6] text-xs text-[#a33232]">
            {error}
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7d6148] mb-1">
                Artwork Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Srirangam Sacred Basil"
                className="w-full px-3 py-2 rounded-xl bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#85582f]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7d6148] mb-1">
                Tamil Title (Optional)
              </label>
              <input
                type="text"
                value={tamilTitle}
                onChange={(e) => setTamilTitle(e.target.value)}
                placeholder="e.g., துளசி இலை தியானம்"
                className="w-full px-3 py-2 rounded-xl bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#85582f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7d6148] mb-1">
                Price / Acquisition Value *
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. ₹22,000 or $280"
                className="w-full px-3 py-2 rounded-xl bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#85582f]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7d6148] mb-1">
                Creation Year
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
                className="w-full px-3 py-2 rounded-xl bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#85582f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7d6148] mb-1">
                Medium & Materials *
              </label>
              <input
                type="text"
                required
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                placeholder="Pressed sacred leaves, raw ochre pigment on handmade paper"
                className="w-full px-3 py-2 rounded-xl bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#85582f]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7d6148] mb-1">
                Dimensions
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="70 × 55 cm"
                className="w-full px-3 py-2 rounded-xl bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#85582f]"
              />
            </div>
          </div>

          {/* Frame Shape Molding */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7d6148] mb-1">
              Architectural Frame Molding
            </label>
            <select
              value={frameShape}
              onChange={(e) => setFrameShape(e.target.value as FrameShape)}
              className="w-full px-3 py-2 rounded-xl bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#85582f]"
            >
              <option value="rectangle">Classic Rectangle (Walnut Molding)</option>
              <option value="square">Concentric Square Mount</option>
              <option value="circular">Sacred Circular Tondo Frame</option>
              <option value="arched">Cathedral Arched Vault Mount</option>
              <option value="leaf">Organic Leaf Silhouette</option>
            </select>
          </div>

          {/* Hallway Wall Side & Viewing Order Placement */}
          <div className="p-3.5 rounded-2xl bg-[#f7f0e6] border border-[#decbb7] space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#85582f]" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#634324] font-semibold">
                Hallway Placement & Viewing Order
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#7d6148] mb-1">
                  Corridor Wall Side
                </label>
                <select
                  value={wallSide}
                  onChange={(e) => setWallSide(e.target.value as 'left' | 'right' | 'auto')}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#85582f]"
                >
                  <option value="auto">Auto (Alternating)</option>
                  <option value="left">Left Wall</option>
                  <option value="right">Right Wall</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#7d6148] mb-1">
                  Scroll Viewing Order
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={viewOrder}
                  onChange={(e) => setViewOrder(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#85582f]"
                />
                <span className="text-[9px] text-[#8c6d53]">Sequence when scrolled</span>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#7d6148] mb-1">
                  Hallway Station #
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={hallwayStation}
                  onChange={(e) => setHallwayStation(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#85582f]"
                />
                <span className="text-[9px] text-[#8c6d53]">Position along corridor</span>
              </div>
            </div>
          </div>

          {/* Bias Lighting Color */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7d6148] mb-1.5 flex items-center justify-between">
              <span>Halo & Bias Light Aura Color</span>
              <span className="font-mono text-[10px] text-[#8c6d53]">{biasLightColor}</span>
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.color}
                  type="button"
                  onClick={() => setBiasLightColor(p.color)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] border transition-all cursor-pointer ${
                    biasLightColor === p.color
                      ? 'bg-[#f5ecdf] border-[#85582f] text-[#2d1f14] font-semibold'
                      : 'bg-[#fffefc] border-[#dfd2c0] text-[#6b5038]'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.name}</span>
                </button>
              ))}
              <input
                type="color"
                value={biasLightColor}
                onChange={(e) => setBiasLightColor(e.target.value)}
                className="w-7 h-7 rounded border border-[#dfd2c0] cursor-pointer p-0"
                title="Custom color"
              />
            </div>
          </div>

          {/* Optional Custom Image Upload */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7d6148] mb-1">
              Custom Specimen Photo or Canvas Image (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f5ecdf] hover:bg-[#ede0ce] border border-[#dfd2c0] text-xs text-[#5e4530] font-medium cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Choose Image</span>
                <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
              </label>
              {customImageData && (
                <div className="flex items-center gap-2">
                  <img
                    src={customImageData}
                    alt="Custom preview"
                    className="w-10 h-10 object-cover rounded-lg border border-[#dfd2c0]"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomImageData(undefined)}
                    className="text-[11px] text-[#a33232] hover:underline cursor-pointer"
                  >
                    Remove image
                  </button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-[#8c6d53] mt-1">
              If no image is uploaded, our procedural botanical leaf renderer will generate a deckled plate.
            </p>
          </div>

          {/* Description & Inspiration */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7d6148] mb-1">
              Artwork Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the cellular patterns, drying process, and leaf anatomy..."
              className="w-full px-3 py-2 rounded-xl bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#85582f] resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7d6148] mb-1">
              Ecological & Cultural Inspiration
            </label>
            <textarea
              rows={2}
              value={inspiration}
              onChange={(e) => setInspiration(e.target.value)}
              placeholder="Sacred temple groves, riverbanks of Kaveri, seasonal monsoon shifts..."
              className="w-full px-3 py-2 rounded-xl bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#85582f] resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-[#85582f] hover:bg-[#6e4622] text-[#fffefa] text-xs font-semibold shadow-md border border-[#9e6d3d] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Mount Canvas in Gallery Walk</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

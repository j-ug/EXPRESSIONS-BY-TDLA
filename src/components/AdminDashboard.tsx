import React, { useState } from 'react';
import { BotanicalArtwork, User } from '../types';
import { replaceStoredArtworks } from '../utils/artworksStorage';
import { deleteAllArtworks, deleteArtwork, updateArtwork, getArtworks, saveArtwork } from '../lib/artworks';
import { invalidateArtworkTexture, clearTextureCache } from '../utils/textureGenerator';
import { BOTANICAL_ARTWORKS } from '../data/artworks';
import { EditArtworkModal } from './EditArtworkModal';
import { Trash2, Edit2, Plus, ShieldAlert, Layers, Image as ImageIcon, Sparkles, ArrowUp, ArrowDown, X, RotateCcw } from 'lucide-react';

interface AdminDashboardProps {
  artworks: BotanicalArtwork[];
  currentUser: User | null;
  onClose: () => void;
  onUpdateArtworks: (artworks: BotanicalArtwork[]) => void;
  onOpenAddCanvas: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  artworks,
  currentUser,
  onClose,
  onUpdateArtworks,
  onOpenAddCanvas,
}) => {
  const [editingArtwork, setEditingArtwork] = useState<BotanicalArtwork | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const importArtworks = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || importing) return;
    if (!window.confirm('Import this artwork export? Existing IDs will not be overwritten.')) return;
    setImporting(true);
    setError(null);
    try {
      const records = JSON.parse(await file.text());
      if (!Array.isArray(records)) throw new Error('Export must be a JSON array of artworks.');
      for (const record of records) {
        if (!record || typeof record.id !== 'string' || typeof record.title !== 'string' ||
            !Array.isArray(record.botanicalSpecies) || typeof record.textureTheme !== 'string' ||
            typeof record.biasLightIntensity !== 'number' ||
            !['rectangle', 'square', 'leaf', 'circular', 'arched'].includes(record.frameShape)) {
          throw new Error('Invalid artwork record. Export complete artwork objects with their original IDs.');
        }
      }
      for (const record of records) await saveArtwork(record);
    } catch (error) {
      setError((error instanceof Error ? error.message : 'Import failed.') + ' Earlier records may have been imported.');
    } finally {
      try { onUpdateArtworks(replaceStoredArtworks(await getArtworks())); }
      catch { setError('Could not refresh the gallery. Reload before importing again.'); }
      clearTextureCache();
      setImporting(false);
      event.target.value = '';
    }
  };

  if (!currentUser?.isAdmin) return null;

  const handleDeleteSingle = async (id: string, title: string) => {
    if (deleting || importing) return;
    if (!window.confirm(`Are you sure you want to delete canvas "${title}"?`)) return;
    setDeleting(true);
    try {
      invalidateArtworkTexture(id);
      await deleteArtwork(id);
      onUpdateArtworks(replaceStoredArtworks(artworks.filter((art) => art.id !== id)));
    } catch {
      setError('The canvas could not be deleted. Please verify your admin access.');
    } finally { setDeleting(false); }
  };

  const handleDeleteAll = async () => {
    if (deleting || importing) return;
    if (
      !window.confirm(
        'WARNING: Are you sure you want to DELETE ALL CANVASES in the gallery?\n\nThis will remove all artwork entries so you can add them 1-by-1 manually.'
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      clearTextureCache();
      await deleteAllArtworks();
      onUpdateArtworks(replaceStoredArtworks([]));
    } catch {
      setError('The gallery could not be cleared. No local items were removed.');
    } finally { setDeleting(false); }
  };

  const handleResetToDefaults = () => {
    if (!window.confirm('Reset gallery cache to the 5 unique default botanical artworks? This will clear any stale textures and duplicate entries.')) return;
    clearTextureCache();
    const reset = replaceStoredArtworks(BOTANICAL_ARTWORKS);
    onUpdateArtworks(reset);
  };

  const handleSaveEdit = async (updatedArt: BotanicalArtwork) => {
    try {
      invalidateArtworkTexture(updatedArt.id);
      updatedArt = await updateArtwork(updatedArt.id, updatedArt);
      const updated = artworks.map((art) => (art.id === updatedArt.id ? updatedArt : art));
      onUpdateArtworks(replaceStoredArtworks(updated));
    } catch (error) {
      throw error;
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= artworks.length) return;
    const newArtworks = [...artworks];
    const [moved] = newArtworks.splice(index, 1);
    newArtworks.splice(targetIndex, 0, moved);
    const reindexed = newArtworks.map((art, idx) => ({ ...art, viewOrder: idx + 1 }));
    onUpdateArtworks(replaceStoredArtworks(reindexed));
    try {
      for (const art of reindexed) {
        await updateArtwork(art.id, art);
      }
    } catch {
      // Local copy remains updated
    }
  };

  const sortedArtworksList = [...artworks].sort((a, b) => (a.viewOrder ?? 999) - (b.viewOrder ?? 999));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#21160e]/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#fffdf9] border border-[#ded0be] rounded-3xl p-6 sm:p-8 shadow-2xl my-auto max-h-[92vh] flex flex-col text-[#2d1f14]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#eadecc]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-4 h-4 text-[#85582f]" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#78573a]">
                Curator Control Panel • Admin Dashboard
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#2d1f14]">
              Manage Gallery Canvases ({artworks.length})
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#f5ece0] hover:bg-[#ede0ce] text-[#5e4530] hover:text-[#2d1f14] transition-all cursor-pointer"
            title="Close Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <label className="mb-4 text-sm">
          {importing ? 'Importing artworks…' : 'Import legacy artwork JSON (does not overwrite existing IDs)'}
          <input type="file" accept=".json,application/json" disabled={importing || deleting}
            onChange={importArtworks} className="block mt-2" />
        </label>
        {/* Action Toolbar */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#fdf1f1] border border-[#f5c6c6] text-xs text-[#a33232]">
            {error}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-[#f5ecdf] border border-[#dfd2c0]">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenAddCanvas}
              className="px-4 py-2 rounded-xl bg-[#2a6836] hover:bg-[#20512a] text-white text-xs font-semibold shadow-sm border border-[#3e844c] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Canvas (1 by 1)</span>
            </button>
            <button
              onClick={handleResetToDefaults}
              className="px-4 py-2 rounded-xl bg-[#f5ece0] hover:bg-[#ede0ce] text-[#5e4530] text-xs font-semibold shadow-sm border border-[#dfd2c0] flex items-center gap-2 transition-all cursor-pointer"
              title="Reset gallery to 5 pristine default botanical specimens and purge texture cache"
            >
              <RotateCcw className="w-4 h-4 text-[#85582f]" />
              <span>Reset 5 Originals</span>
            </button>
          </div>

          {artworks.length > 0 && (
            <button
              disabled={deleting || importing}
              onClick={handleDeleteAll}
              className="px-4 py-2 rounded-xl bg-[#a33232] hover:bg-[#7d2424] text-white text-xs font-semibold shadow-sm border border-[#c44949] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete ALL Canvases</span>
            </button>
          )}
        </div>

        {/* Canvases List */}
        <div className="flex-1 overflow-y-auto pr-1">
          {sortedArtworksList.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-[#dfd2c0] rounded-2xl bg-[#faf6f0]">
              <Sparkles className="w-10 h-10 text-[#85582f] mx-auto mb-3 opacity-60" />
              <h3 className="font-serif text-xl text-[#2d1f14] mb-2">No Canvases in WebApp</h3>
              <p className="text-xs text-[#735842] max-w-md mx-auto mb-6 leading-relaxed">
                All existing canvases have been removed as requested. You can now add each botanical canvas manually 1 by 1.
              </p>
              <button
                onClick={onOpenAddCanvas}
                className="px-5 py-2.5 rounded-xl bg-[#85582f] hover:bg-[#6e4622] text-white text-xs font-semibold shadow-md flex items-center gap-2 mx-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Canvas Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {sortedArtworksList.map((art, idx) => (
                <div
                  key={art.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#fffefc] border border-[#ded0be] hover:border-[#bfa78f] shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#f5ecdf] border border-[#dfd2c0] shrink-0 flex items-center justify-center">
                      {art.customImageData ? (
                        <img src={art.customImageData} alt={art.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-[#85582f]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-[#85582f]/10 text-[10px] font-mono font-semibold text-[#85582f]">
                          Order #{art.viewOrder ?? idx + 1}
                        </span>
                        <h4 className="font-serif font-medium text-base text-[#2d1f14] truncate">
                          {art.title}
                        </h4>
                        {art.tamilTitle && (
                          <span className="text-xs text-[#78593e] font-serif">({art.tamilTitle})</span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-[#f5ece0] text-[9px] font-mono text-[#6b4e36] border border-[#decbb7] uppercase">
                          {art.wallSide === 'left' ? 'Left Wall' : art.wallSide === 'right' ? 'Right Wall' : 'Auto Wall'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#f5ece0] text-[9px] font-mono text-[#6b4e36] border border-[#decbb7]">
                          Station {art.hallwayStation ?? idx + 1}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6b5038] mt-1">
                        <span className="font-semibold text-[#85582f]">{art.price || 'Price on request'}</span>
                        <span>•</span>
                        <span>{art.medium}</span>
                        <span>•</span>
                        <span>{art.dimensions}</span>
                        <span>•</span>
                        <span className="capitalize">{art.frameShape} Frame</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Reordering */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Reorder Buttons */}
                    <div className="flex items-center border border-[#dfd2c0] rounded-lg overflow-hidden bg-[#faf4ec]">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveOrder(idx, 'up')}
                        className="p-1.5 text-[#5e4530] hover:bg-[#ede0ce] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        title="Move Up in Viewing Order"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-[1px] h-4 bg-[#dfd2c0]" />
                      <button
                        type="button"
                        disabled={idx === artworks.length - 1}
                        onClick={() => handleMoveOrder(idx, 'down')}
                        className="p-1.5 text-[#5e4530] hover:bg-[#ede0ce] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        title="Move Down in Viewing Order"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => setEditingArtwork(art)}
                      className="px-3 py-1.5 rounded-lg bg-[#f5ecdf] hover:bg-[#ede0ce] text-[#5e4530] text-xs font-medium border border-[#dfd2c0] flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      disabled={deleting || importing}
                      onClick={() => handleDeleteSingle(art.id, art.title)}
                      className="px-3 py-1.5 rounded-lg bg-[#fdf1f1] hover:bg-[#fcdede] text-[#a33232] text-xs font-medium border border-[#f5c6c6] flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Edit Modal */}
      {editingArtwork && (
        <EditArtworkModal
          artwork={editingArtwork}
          isOpen={!!editingArtwork}
          onClose={() => setEditingArtwork(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

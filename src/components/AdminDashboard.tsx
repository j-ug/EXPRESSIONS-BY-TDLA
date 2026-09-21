import React, { useState } from 'react';
import { BotanicalArtwork, User } from '../types';
import { replaceStoredArtworks } from '../utils/artworksStorage';
import { deleteAllArtworks, deleteArtwork, updateArtwork } from '../lib/artworks';
import { EditArtworkModal } from './EditArtworkModal';
import { Trash2, Edit2, Plus, ShieldAlert, Layers, Image as ImageIcon, Sparkles, X } from 'lucide-react';

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

  if (!currentUser?.isAdmin) return null;

  const handleDeleteSingle = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete canvas "${title}"?`)) return;
    try {
      await deleteArtwork(id);
      onUpdateArtworks(replaceStoredArtworks(artworks.filter((art) => art.id !== id)));
    } catch {
      setError('The canvas could not be deleted. Please verify your admin access.');
    }
  };

  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        'WARNING: Are you sure you want to DELETE ALL CANVASES in the gallery?\n\nThis will remove all artwork entries so you can add them 1-by-1 manually.'
      )
    ) {
      return;
    }

    try {
      await deleteAllArtworks();
      onUpdateArtworks(replaceStoredArtworks([]));
    } catch {
      setError('The gallery could not be cleared. No local items were removed.');
    }
  };

  const handleSaveEdit = async (updatedArt: BotanicalArtwork) => {
    try {
      await updateArtwork(updatedArt.id, updatedArt);
      const updated = artworks.map((art) => (art.id === updatedArt.id ? updatedArt : art));
      onUpdateArtworks(replaceStoredArtworks(updated));
    } catch {
      setError('Canvas details could not be saved. Please verify your admin access.');
    }
  };

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

        {/* Action Toolbar */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#fdf1f1] border border-[#f5c6c6] text-xs text-[#a33232]">
            {error}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-[#f5ecdf] border border-[#dfd2c0]">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddCanvas}
              className="px-4 py-2 rounded-xl bg-[#2a6836] hover:bg-[#20512a] text-white text-xs font-semibold shadow-sm border border-[#3e844c] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Canvas (1 by 1)</span>
            </button>
          </div>

          {artworks.length > 0 && (
            <button
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
          {artworks.length === 0 ? (
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
              {artworks.map((art, idx) => (
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
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#826750]">#{idx + 1}</span>
                        <h4 className="font-serif font-medium text-base text-[#2d1f14] truncate">
                          {art.title}
                        </h4>
                        {art.tamilTitle && (
                          <span className="text-xs text-[#78593e] font-serif">({art.tamilTitle})</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6b5038] mt-0.5">
                        <span className="font-semibold text-[#85582f]">{art.price || '₹18,500'}</span>
                        <span>•</span>
                        <span>{art.medium}</span>
                        <span>•</span>
                        <span>{art.dimensions}</span>
                        <span>•</span>
                        <span className="capitalize">{art.frameShape} Frame</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => setEditingArtwork(art)}
                      className="px-3 py-1.5 rounded-lg bg-[#f5ecdf] hover:bg-[#ede0ce] text-[#5e4530] text-xs font-medium border border-[#dfd2c0] flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>

                    <button
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

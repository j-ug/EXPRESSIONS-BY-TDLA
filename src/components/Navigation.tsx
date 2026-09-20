import React from 'react';
import { Volume2, VolumeX, Eye, Info, Sparkles, Plus, LogIn, LogOut, User as UserIcon, ShieldCheck, Trash2 } from 'lucide-react';
import { BotanicalArtwork, User } from '../types';
import { BOTANICAL_ARTWORKS } from '../data/artworks';

interface NavigationProps {
  scrollProgress: number;
  activeArtworkIndex: number;
  viewMode: '3d' | '2d';
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onToggleViewMode: () => void;
  onJumpToProgress: (progress: number) => void;
  onJumpToArtist: () => void;
  onReturnToHero: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenAddCanvas?: () => void;
  onDeleteCurrentArtwork?: () => void;
  artworks?: BotanicalArtwork[];
}

export const Navigation: React.FC<NavigationProps> = ({
  scrollProgress,
  activeArtworkIndex,
  viewMode,
  audioEnabled,
  onToggleAudio,
  onToggleViewMode,
  onJumpToProgress,
  onJumpToArtist,
  onReturnToHero,
  currentUser,
  onOpenAuth,
  onSignOut,
  onOpenAddCanvas,
  onDeleteCurrentArtwork,
  artworks = BOTANICAL_ARTWORKS,
}) => {
  return (
    <header className="fixed top-0 left-0 w-full z-40 px-3 sm:px-6 md:px-8 py-3.5 flex items-center justify-between pointer-events-none transition-all duration-300">
      {/* Brand Title & Discipline */}
      <div
        onClick={onReturnToHero}
        className="pointer-events-auto flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
      >
        <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-[#fffdf9]/90 backdrop-blur-md border border-[#dfd2c0] flex items-center justify-center text-[#8c5e34] shadow-md group-hover:border-[#b88c60] group-hover:scale-105 transition-all shrink-0">
          <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
        </div>
        <div>
          <h1 className="font-serif text-base sm:text-xl font-semibold tracking-wide text-[#2e2015] group-hover:text-[#140e08] transition-colors leading-none truncate max-w-[160px] sm:max-w-none">
            Dr. G. Ophylia Vinodhini
          </h1>
          <p className="text-[9px] sm:text-xs tracking-wider uppercase text-[#7d5f44] mt-0.5">
            Botanical Artist • Leaves & Flowers
          </p>
        </div>
      </div>

      {/* Center Artwork Progress Dots (visible on larger screens when in gallery) */}
      <div className="pointer-events-auto hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fffdf9]/90 backdrop-blur-md border border-[#dfd2c0] shadow-sm">
        <span className="text-[10px] font-mono text-[#82664e] uppercase tracking-wider mr-1">
          Galleria
        </span>
        {artworks.map((art, idx) => {
          const targetP = 0.14 + (idx / Math.max(1, artworks.length - 1)) * 0.74;
          const isActive = idx === activeArtworkIndex && scrollProgress >= 0.12 && scrollProgress < 0.88;
          return (
            <button
              key={art.id}
              onClick={() => onJumpToProgress(targetP)}
              title={art.title}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'w-5 bg-[#96683b]'
                  : 'w-2 bg-[#ded0bd] hover:bg-[#bda68d]'
              }`}
            />
          );
        })}
      </div>

      {/* Right Controls */}
      <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5">
        {/* Admin "Add Canvas" CTA */}
        {currentUser?.isAdmin && onOpenAddCanvas && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenAddCanvas}
              className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-[#2a6836] hover:bg-[#20512a] text-[#f7faf7] border border-[#3e844c] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              title="Add a new canvas to gallery (Admin)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono">Add</span>
            </button>
            <button
              onClick={onDeleteCurrentArtwork}
              className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-[#a33232] hover:bg-[#7d2424] text-[#fffefa] border border-[#d6c4af] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              title="Delete current canvas"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono">Delete</span>
            </button>
          </div>
        )}

        {/* Auth status & actions */}
        {currentUser ? (
          <div className="flex items-center gap-1 sm:gap-1.5 bg-[#fffdf9]/90 backdrop-blur-md border border-[#dfd2c0] rounded-full p-1 pl-2.5 shadow-sm">
            <div className="flex items-center gap-1">
              {currentUser.isAdmin ? (
                <ShieldCheck className="w-3.5 h-3.5 text-[#2a6836]" />
              ) : (
                <UserIcon className="w-3 h-3 text-[#85582f]" />
              )}
              <span className="text-[11px] font-medium text-[#2e2015] max-w-[80px] sm:max-w-[110px] truncate">
                {currentUser.name}
              </span>
              {currentUser.isAdmin && (
                <span className="px-1.5 py-0.5 text-[9px] font-mono rounded-full bg-[#e3efe4] text-[#20512a] font-bold">
                  Admin
                </span>
              )}
            </div>
            <button
              onClick={onSignOut}
              className="p-1 sm:px-2 py-0.5 rounded-full hover:bg-[#f3e7d6] text-[#7d5f44] hover:text-[#2d1f14] transition-colors cursor-pointer text-[10px] flex items-center gap-1"
              title="Sign Out"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#fffdf9]/90 hover:bg-[#f6ede2] backdrop-blur-md border border-[#dfd2c0] text-[#6b513a] hover:text-[#2e2015] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Sign in or register"
          >
            <LogIn className="w-3.5 h-3.5 text-[#85582f]" />
            <span className="text-[11px]">Sign In</span>
          </button>
        )}

        {/* Sound toggle */}
        <button
          onClick={onToggleAudio}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-medium backdrop-blur-md border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
            audioEnabled
              ? 'bg-[#efe3cb]/90 border-[#c4a170] text-[#543b22]'
              : 'bg-[#fffdf9]/90 border-[#dfd2c0] text-[#6b513a] hover:text-[#2e2015]'
          }`}
          title={audioEnabled ? 'Mute ambient soundscape' : 'Enable botanical ambient soundscape'}
        >
          {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="hidden md:inline text-[11px]">
            {audioEnabled ? 'Sound' : 'Mute'}
          </span>
        </button>

        {/* View Mode Toggle (3D vs 2D) */}
        <button
          onClick={onToggleViewMode}
          className="px-2 sm:px-2.5 py-1.5 rounded-full text-xs font-medium bg-[#fffdf9]/90 hover:bg-[#f6ede2] backdrop-blur-md border border-[#dfd2c0] text-[#6b513a] hover:text-[#2e2015] transition-all flex items-center gap-1 cursor-pointer shadow-sm"
          title="Switch view mode"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px] uppercase tracking-wider font-mono">
            {viewMode === '3d' ? '3D' : '2D'}
          </span>
        </button>

        {/* About the Artist Jump CTA */}
        <button
          onClick={onJumpToArtist}
          className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium bg-[#85582f] hover:bg-[#6e4622] text-[#fffefa] border border-[#9e6d3d] transition-all shadow-sm flex items-center gap-1 cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-[#edd5be]" />
          <span className="hidden sm:inline">Artist</span>
        </button>
      </div>
    </header>
  );
};

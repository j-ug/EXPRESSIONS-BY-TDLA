import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Gallery3D } from './components/Gallery3D';
import { Navigation } from './components/Navigation';
import { HeroEntry } from './components/HeroEntry';
import { AboutArtOverlay } from './components/AboutArtOverlay';
import { AboutArtistSection } from './components/AboutArtistSection';
import { ArtworkDetailModal } from './components/ArtworkDetailModal';
import { Accessible2DGallery } from './components/Accessible2DGallery';
import { AuthModal } from './components/AuthModal';
import { AddCanvasModal } from './components/AddCanvasModal';
import { MobileHorizontalControls } from './components/MobileHorizontalControls';
import { BotanicalArtwork, GalleryState, User } from './types';
import { galleryAudio } from './utils/audio';
import { getCurrentUser, logoutUser } from './utils/auth';
import { getAllArtworks, saveDynamicArtwork, updateStoredArtwork, deleteStoredArtwork } from './utils/artworksStorage';
import { deleteArtwork } from './lib/artworks';
import { keepFiveArtworks } from './lib/artworks';

export default function App() {
  const [artworks, setArtworks] = useState<BotanicalArtwork[]>(() => getAllArtworks());
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [addCanvasModalOpen, setAddCanvasModalOpen] = useState(false);

  const [galleryState, setGalleryState] = useState<GalleryState>({
    scrollProgress: 0,
    activeArtworkIndex: 0,
    isInGallery: false,
    isExited: false,
    viewMode: '3d',
    audioEnabled: false,
    selectedArtwork: null,
  });

  const [notification, setNotification] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Trigger non-intrusive notification banner
  const triggerNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3800);
  }, []);

  // Scroll listener that translates page scroll into smooth 0.0 -> 1.0 progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      const progress = Math.min(1.0, Math.max(0.0, scrollY / maxScroll));

      setGalleryState((prev) => {
        const inGallery = progress > 0.08;
        const exited = progress >= 0.88;
        return {
          ...prev,
          scrollProgress: progress,
          isInGallery: inGallery,
          isExited: exited,
        };
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Touch gesture listener for mobile/tablet: swipe left/right to scroll the 3D gallery
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Don't hijack swipe if a modal is open
      if (galleryState.selectedArtwork || authModalOpen || addCanvasModalOpen) return;

      if (e.touches.length > 0) {
        const deltaX = touchStartX - e.touches[0].clientX;
        const deltaY = touchStartY - e.touches[0].clientY;

        // If swipe gesture is primarily horizontal
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          if (maxScroll > 0) {
            // Translate horizontal swipe into proportional scroll progress
            const scrollDelta = (deltaX / window.innerWidth) * (maxScroll * 0.00003);
            window.scrollBy({ top: scrollDelta, behavior: 'auto' });
            touchStartX = e.touches[0].clientX;
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [galleryState.selectedArtwork, authModalOpen, addCanvasModalOpen]);

  // Keyboard navigation for gallery walk (Arrow keys or Page Up/Down)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (galleryState.selectedArtwork || authModalOpen || addCanvasModalOpen) return;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const step = window.innerHeight * 0.00009;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
        window.scrollBy({ top: step, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
        window.scrollBy({ top: -step, behavior: 'smooth' });
      } else if (e.key === 'Home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'End') {
        window.scrollTo({ top: maxScroll, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryState.selectedArtwork, authModalOpen, addCanvasModalOpen]);

  // Analytics hooks
  const handleGalleryEnter = useCallback(() => {
    console.log('[Analytics Event] Entered gallery room doorway');
    triggerNotification('Entered Dr. Ophylia’s Botanical Art Gallery');
  }, [triggerNotification]);

  const handleGalleryExit = useCallback(() => {
    console.log('[Analytics Event] Transitioned to About the Artist sanctuary');
  }, []);

  const handleArtworkChange = useCallback((index: number) => {
    setGalleryState((prev) => ({
      ...prev,
      activeArtworkIndex: index,
    }));
    const art = artworks[index];
    if (art) {
      console.log(`[Analytics Event] Viewed artwork ${index + 1}: ${art.title}`);
    }
  }, [artworks]);

  const handleSelectArtwork = useCallback((art: BotanicalArtwork) => {
    setGalleryState((prev) => ({ ...prev, selectedArtwork: art }));
  }, []);

  const handleCloseModal = useCallback(() => {
    setGalleryState((prev) => ({ ...prev, selectedArtwork: null }));
  }, []);

  // Smooth jump helpers
  const scrollToProgress = (p: number) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: maxScroll * p,
      behavior: 'smooth',
    });
  };

  const handleEnterGallery = () => {
    scrollToProgress(0.16);
  };

  const handleJumpToArtist = () => {
    console.log('[Analytics Event] Clicked About the Artist');
    scrollToProgress(0.96);
  };

  const handleReturnToHero = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleAudio = async () => {
    const active = await galleryAudio.toggle();
    setGalleryState((prev) => ({ ...prev, audioEnabled: active }));
    if (active) {
      triggerNotification('Ambient soundscape enabled (Breeze & Chimes)');
    }
  };

  const handleToggleViewMode = () => {
    setGalleryState((prev) => ({
      ...prev,
      viewMode: prev.viewMode === '3d' ? '2d' : '3d',
    }));
  };

  // Auth handlers
  const handleSignOut = () => {
    logoutUser();
    setCurrentUser(null);
    triggerNotification('Signed out successfully.');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.isAdmin) {
      triggerNotification(`Welcome back Admin ${user.name}! You can now add canvases.`);
    } else {
      triggerNotification(`Welcome, ${user.name}! You can now comment & review.`);
    }
  };

  // Admin canvas handler
  const handleAddCanvas = (newArtwork: BotanicalArtwork) => {
    saveDynamicArtwork(newArtwork);
    const updated = getAllArtworks();
    setArtworks(updated);
    triggerNotification(`New canvas “${newArtwork.title}” mounted in gallery!`);
    // Scroll to the newly added canvas station
    setTimeout(() => {
      const targetP = 0.14 + ((updated.length - 1) / Math.max(1, updated.length - 1)) * 0.74;
      scrollToProgress(targetP);
    }, 400);
  };

  const handleDeleteCurrentArtwork = async () => {
    const activeArt = artworks[galleryState.activeArtworkIndex];
    if (activeArt) {
      if (!window.confirm('Delete this canvas?')) return;
      // Remove from Firestore
      await deleteArtwork(activeArt.id);
      // Remove from localStorage
      const updated = deleteStoredArtwork(activeArt.id);
      setArtworks(updated);
      triggerNotification(`Canvas “${activeArt.title}” removed.`);
    }
  };

  const handleUpdateArtwork = (updatedArt: BotanicalArtwork) => {
    updateStoredArtwork(updatedArt);
    const updatedList = getAllArtworks();
    setArtworks(updatedList);
    setGalleryState((prev) => ({
      ...prev,
      selectedArtwork: updatedArt,
    }));
    triggerNotification(`Updated price & details for “${updatedArt.title}”!`);
  };

  const activeArtwork = artworks[galleryState.activeArtworkIndex] || artworks[0];

  return (
    <div className="relative min-h-screen bg-[#f7f2eb] text-[#2d1f14] selection:bg-[#dfcdb9] selection:text-[#23180f]">
      {/* Top Navigation */}
      <Navigation
        scrollProgress={galleryState.scrollProgress}
        activeArtworkIndex={galleryState.activeArtworkIndex}
        viewMode={galleryState.viewMode}
        audioEnabled={galleryState.audioEnabled}
        onToggleAudio={handleToggleAudio}
        onToggleViewMode={handleToggleViewMode}
        onJumpToProgress={scrollToProgress}
        onJumpToArtist={handleJumpToArtist}
        onReturnToHero={handleReturnToHero}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenAddCanvas={() => setAddCanvasModalOpen(true)}
        onDeleteCurrentArtwork={handleDeleteCurrentArtwork}
        artworks={artworks}
      />

      {/* Main Experience: 3D Canvas vs 2D Fallback */}
      {galleryState.viewMode === '3d' ? (
        <>
          {/* Fixed 3D Viewport in background */}
          <div className="fixed inset-0 z-10 w-full h-full">
            <Gallery3D
              scrollProgress={galleryState.scrollProgress}
              activeArtworkIndex={galleryState.activeArtworkIndex}
              onArtworkChange={handleArtworkChange}
              onGalleryEnter={handleGalleryEnter}
              onGalleryExit={handleGalleryExit}
              onArtworkClick={handleSelectArtwork}
              artworks={artworks}
            />
          </div>

          {/* Hero Landing Before Entering Gallery */}
          <HeroEntry
            scrollProgress={galleryState.scrollProgress}
            onEnterGallery={handleEnterGallery}
          />

          {/* About The Art Typography Overlay for current active artwork */}
          <AboutArtOverlay
            artwork={activeArtwork}
            artworkIndex={galleryState.activeArtworkIndex}
            totalArtworks={artworks.length}
            scrollProgress={galleryState.scrollProgress}
            isInGallery={galleryState.isInGallery}
            onInspect={handleSelectArtwork}
          />

          {/* Mobile & Tablet Horizontal Scroll Bar & Control Overlay */}
          <MobileHorizontalControls
            scrollProgress={galleryState.scrollProgress}
            onScrollProgressChange={scrollToProgress}
            activeArtworkIndex={galleryState.activeArtworkIndex}
            artworks={artworks}
          />

          {/* Final Section: About The Artist */}
          <AboutArtistSection
            scrollProgress={galleryState.scrollProgress}
            onReturnToGallery={() => scrollToProgress(0.5)}
          />

          {/* Virtual Scroll Track that drives the 3D timeline */}
          <div
            ref={scrollContainerRef}
            className="relative z-0 pointer-events-none"
            style={{ height: '560vh' }}
          />

          {/* Bottom subtle scroll progress bar */}
          <div className="fixed bottom-0 left-0 w-full h-[2px] bg-[#e4d7c5] z-40">
            <div
              className="h-full bg-gradient-to-r from-[#8a5d34] via-[#be8e57] to-[#d6aa75] transition-all duration-150"
              style={{ width: `${galleryState.scrollProgress * 100}%` }}
            />
          </div>
        </>
      ) : (
        /* Accessible 2D Catalog View */
        <Accessible2DGallery
          onInspect={handleSelectArtwork}
          onJumpToArtist={handleJumpToArtist}
          artworks={artworks}
        />
      )}

      {/* Botanical Artwork Magnifier / Specimen Detail & Review Modal */}
      <ArtworkDetailModal
        artwork={galleryState.selectedArtwork}
        onClose={handleCloseModal}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onUpdateArtwork={handleUpdateArtwork}
      />

      {/* User Login & Signup Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Add Canvas Modal */}
      <AddCanvasModal
        isOpen={addCanvasModalOpen}
        onClose={() => setAddCanvasModalOpen(false)}
        onAddArtwork={handleAddCanvas}
      />

      {/* Non-intrusive Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-2 rounded-full bg-[#fffdf9]/95 backdrop-blur-md border border-[#dfd0be] text-xs text-[#3c2a1c] shadow-xl flex items-center gap-2 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-[#a67442]" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}

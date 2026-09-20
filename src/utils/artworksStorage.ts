import { BotanicalArtwork } from '../types';
import { BOTANICAL_ARTWORKS } from '../data/artworks';

const ARTWORKS_STORAGE_KEY = 'botanical_gallery_artworks';

export function getStoredArtworks(): BotanicalArtwork[] {
  try {
    const raw = localStorage.getItem(ARTWORKS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ARTWORKS_STORAGE_KEY, JSON.stringify(BOTANICAL_ARTWORKS));
      return BOTANICAL_ARTWORKS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return BOTANICAL_ARTWORKS;
    }
    // Ensure all artworks have price field if missing from earlier storage
    let enriched = parsed.map((art: BotanicalArtwork) => {
      if (!art.price) {
        const defaultMatch = BOTANICAL_ARTWORKS.find((b) => b.id === art.id);
        return {
          ...art,
          price: defaultMatch?.price || '₹18,000',
        };
      }
      return art;
    });

    // If stored collection has fewer artworks than the complete BOTANICAL_ARTWORKS list (e.g. earlier 5-artwork session),
    // seamlessly merge in the remaining canvases so all 46 artworks are immediately available!
    if (enriched.length < BOTANICAL_ARTWORKS.length) {
      const existingIds = new Set(enriched.map((a: BotanicalArtwork) => a.id));
      const missingDefaults = BOTANICAL_ARTWORKS.filter((def) => !existingIds.has(def.id));
      enriched = [...enriched, ...missingDefaults];
      try {
        localStorage.setItem(ARTWORKS_STORAGE_KEY, JSON.stringify(enriched));
      } catch {
        // storage quota fallback
      }
    }

    return enriched;
  } catch {
    return BOTANICAL_ARTWORKS;
  }
}

export const getAllArtworks = getStoredArtworks;

export function updateStoredArtwork(updatedArtwork: BotanicalArtwork): BotanicalArtwork[] {
  const all = getStoredArtworks();
  const updated = all.map((a) => (a.id === updatedArtwork.id ? updatedArtwork : a));
  try {
    localStorage.setItem(ARTWORKS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Continue
  }
  return updated;
}

export function saveDynamicArtwork(artwork: BotanicalArtwork): BotanicalArtwork[] {
  const all = getStoredArtworks();
  const updated = [...all, artwork];
  try {
    localStorage.setItem(ARTWORKS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Continue
  }
  return updated;
}

export function saveNewArtwork(newArt: Omit<BotanicalArtwork, 'id'>): BotanicalArtwork[] {
  const all = getStoredArtworks();
  const artwork: BotanicalArtwork = {
    ...newArt,
    id: `artwork-${Date.now()}`,
  };

  const updated = [...all, artwork];
  try {
    localStorage.setItem(ARTWORKS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Continue
  }
  return updated;
}

export function deleteStoredArtwork(id: string): BotanicalArtwork[] {
  const all = getStoredArtworks();
  const updated = all.filter((a) => a.id !== id);
  try {
    localStorage.setItem(ARTWORKS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Continue
  }
  return updated;
}

export function resetArtworksToDefault(): BotanicalArtwork[] {
  try {
    localStorage.setItem(ARTWORKS_STORAGE_KEY, JSON.stringify(BOTANICAL_ARTWORKS));
  } catch {
    // Continue
  }
  return BOTANICAL_ARTWORKS;
}

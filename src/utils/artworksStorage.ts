import { BotanicalArtwork } from '../types';
import { BOTANICAL_ARTWORKS } from '../data/artworks';

const ARTWORKS_STORAGE_KEY = 'botanical_gallery_artworks';

export function getStoredArtworks(): BotanicalArtwork[] {
  try {
    const raw = localStorage.getItem(ARTWORKS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    // Default to the 5 default artworks
    localStorage.setItem(ARTWORKS_STORAGE_KEY, JSON.stringify(BOTANICAL_ARTWORKS));
    return BOTANICAL_ARTWORKS;
  } catch {
    return BOTANICAL_ARTWORKS;
  }
}

export const getAllArtworks = getStoredArtworks;

export function replaceStoredArtworks(artworks: BotanicalArtwork[]): BotanicalArtwork[] {
  try {
    localStorage.setItem(ARTWORKS_STORAGE_KEY, JSON.stringify(artworks));
  } catch {
    // The Firestore copy remains authoritative when browser storage is unavailable.
  }
  return artworks;
}

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

export function clearAllStoredArtworks(): BotanicalArtwork[] {
  try {
    localStorage.setItem(ARTWORKS_STORAGE_KEY, JSON.stringify([]));
  } catch {
    // Continue
  }
  return [];
}

export function resetArtworksToDefault(): BotanicalArtwork[] {
  try {
    localStorage.setItem(ARTWORKS_STORAGE_KEY, JSON.stringify([]));
  } catch {
    // Continue
  }
  return [];
}

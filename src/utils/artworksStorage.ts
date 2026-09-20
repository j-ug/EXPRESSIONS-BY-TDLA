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
    return parsed;
  } catch {
    return BOTANICAL_ARTWORKS;
  }
}

export const getAllArtworks = getStoredArtworks;

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

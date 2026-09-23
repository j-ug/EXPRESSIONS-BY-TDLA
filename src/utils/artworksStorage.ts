import { BotanicalArtwork } from '../types';
import { BOTANICAL_ARTWORKS } from '../data/artworks';

const ARTWORKS_STORAGE_KEY = 'botanical_gallery_artworks';

export function deduplicateArtworks(list: BotanicalArtwork[]): BotanicalArtwork[] {
  const seenIds = new Set<string>();
  const result: BotanicalArtwork[] = [];
  for (const item of list) {
    if (!item || !item.id) continue;
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      result.push(item);
    }
  }
  return result.sort((a, b) => (a.viewOrder ?? 999) - (b.viewOrder ?? 999));
}

export function getStoredArtworks(): BotanicalArtwork[] {
  try {
    const raw = localStorage.getItem(ARTWORKS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const unique = deduplicateArtworks(parsed);
        if (unique.length > 0) return unique;
      }
    }
    // Default to the 5 distinct default artworks
    const initial = deduplicateArtworks(BOTANICAL_ARTWORKS);
    localStorage.setItem(ARTWORKS_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch {
    return deduplicateArtworks(BOTANICAL_ARTWORKS);
  }
}

export const getAllArtworks = getStoredArtworks;

export function replaceStoredArtworks(artworks: BotanicalArtwork[]): BotanicalArtwork[] {
  const clean = deduplicateArtworks(artworks);
  try {
    localStorage.setItem(ARTWORKS_STORAGE_KEY, JSON.stringify(clean));
  } catch {
    // Continue
  }
  return clean;
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

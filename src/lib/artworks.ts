import { db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { BotanicalArtwork } from '../types';

const ARTWORKS_COLLECTION = 'artworks';

export const getArtworks = async (): Promise<BotanicalArtwork[]> => {
  const querySnapshot = await getDocs(collection(db, ARTWORKS_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BotanicalArtwork));
};

export const keepFiveArtworks = async (): Promise<void> => {
  const artworks = await getArtworks();
  if (artworks.length <= 5) return;
  const toDelete = artworks.slice(5);
  for (const art of toDelete) {
    await deleteArtwork(art.id);
  }
};

export const updateArtwork = async (id: string, updates: Partial<BotanicalArtwork>): Promise<void> => {
  const artworkRef = doc(db, ARTWORKS_COLLECTION, id);
  await updateDoc(artworkRef, updates);
};

export const deleteArtwork = async (id: string): Promise<void> => {
  const artworkRef = doc(db, ARTWORKS_COLLECTION, id);
  await deleteDoc(artworkRef);
};

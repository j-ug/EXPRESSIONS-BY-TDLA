import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { BotanicalArtwork } from '../types';

const ARTWORKS_COLLECTION = 'artworks';

export const getArtworks = async (): Promise<BotanicalArtwork[]> => {
  const querySnapshot = await getDocs(collection(db, ARTWORKS_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BotanicalArtwork));
};

export const saveArtwork = async (artwork: BotanicalArtwork): Promise<void> => {
  await setDoc(doc(db, ARTWORKS_COLLECTION, artwork.id), artwork);
};

export const updateArtwork = async (id: string, updates: Partial<BotanicalArtwork>): Promise<void> => {
  const artworkRef = doc(db, ARTWORKS_COLLECTION, id);
  await setDoc(artworkRef, updates, { merge: true });
};

export const deleteArtwork = async (id: string): Promise<void> => {
  const artworkRef = doc(db, ARTWORKS_COLLECTION, id);
  await deleteDoc(artworkRef);
};

export const deleteAllArtworks = async (): Promise<void> => {
  const snapshot = await getDocs(collection(db, ARTWORKS_COLLECTION));
  const batch = writeBatch(db);
  snapshot.docs.forEach((item) => batch.delete(item.ref));
  await batch.commit();
};

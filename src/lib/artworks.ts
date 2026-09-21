import { getSupabase } from './supabase';
import { BotanicalArtwork } from '../types';

export async function requireAdmin(): Promise<void> {
  const client = getSupabase();
  const { data: user } = await client.auth.getUser();
  const isAdminEmail = user?.user?.email === 'jeswinsamuel.la@gmail.com' || user?.user?.email === 'ophyliagodwin@gmail.com';
  
  const { data, error } = await client.rpc('is_gallery_admin');
  if (error && !isAdminEmail) throw error;
  if (data !== true && !isAdminEmail) throw new Error('Administrator access is required.');
}

export async function getArtworks(): Promise<BotanicalArtwork[]> {
  const client = getSupabase();
  const all: BotanicalArtwork[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client.from('artworks')
      .select('id, details').order('created_at').order('id').range(offset, offset + 499);
    if (error) throw error;
    all.push(...data.map(row => ({ ...row.details, id: row.id } as BotanicalArtwork)));
    if (data.length < 500) return all;
  }
}

async function prepareArtwork(artwork: BotanicalArtwork): Promise<BotanicalArtwork> {
  const result = { ...artwork };
  if (result.customImageData?.startsWith('data:')) {
    const blob = await (await fetch(result.customImageData)).blob();
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(blob.type) || blob.size > 5 * 1024 * 1024) {
      throw new Error('Choose a JPG, PNG or WebP image smaller than 5 MB.');
    }
    const path = crypto.randomUUID();
    const { error } = await getSupabase().storage.from('canvas-images').upload(path, blob, { contentType: blob.type });
    if (error) throw error;
    result.customImageData = getSupabase().storage.from('canvas-images').getPublicUrl(path).data.publicUrl;
  }
  // Complete replacement ensures cleared optional fields do not survive in JSON.
  return JSON.parse(JSON.stringify(result));
}

export async function saveArtwork(artwork: BotanicalArtwork): Promise<BotanicalArtwork> {
  await requireAdmin();
  const saved = await prepareArtwork(artwork);
  const { error } = await getSupabase().from('artworks').insert({ id: saved.id, details: saved });
  if (error) throw error;
  return saved;
}

export async function updateArtwork(id: string, artwork: BotanicalArtwork): Promise<BotanicalArtwork> {
  await requireAdmin();
  const saved = await prepareArtwork({ ...artwork, id });
  const { data, error } = await getSupabase().from('artworks').update({ details: saved }).eq('id', id).select('id').single();
  if (error || !data) throw error || new Error('Canvas no longer exists.');
  return saved;
}

export async function deleteArtwork(id: string): Promise<void> {
  await requireAdmin();
  const { data, error } = await getSupabase().from('artworks').delete().eq('id', id).select('id').single();
  if (error || !data) throw error || new Error('Canvas no longer exists.');
}

export async function deleteAllArtworks(): Promise<void> {
  const { error } = await getSupabase().rpc('delete_all_gallery_artworks');
  if (error) throw error;
}

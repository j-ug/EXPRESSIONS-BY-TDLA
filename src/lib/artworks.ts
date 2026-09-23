import { getSupabase, supabase } from './supabase';
import { BotanicalArtwork } from '../types';
import { getStoredArtworks, replaceStoredArtworks, deduplicateArtworks } from '../utils/artworksStorage';

export async function requireAdmin(): Promise<void> {
  if (!supabase) {
    // In standalone/preview mode, curator access is permitted
    return;
  }
  const client = getSupabase();
  const { data: user } = await client.auth.getUser();
  const isAdminEmail =
    user?.user?.email === 'jeswinsamuel.la@gmail.com' ||
    user?.user?.email === 'ophyliagodwin@gmail.com';

  const { data, error } = await client.rpc('is_gallery_admin');
  if (error && !isAdminEmail) throw error;
  if (data !== true && !isAdminEmail) throw new Error('Administrator access is required.');
}

export async function getAllArtworks(): Promise<BotanicalArtwork[]> {
  if (!supabase) return getStoredArtworks();
  const { data, error } = await getSupabase()
    .from('artworks')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Artwork fetch error:', error);
    return [];
  }

  const artworks = (data ?? [])
    .map((row) => ({ ...row.details, id: row.id } as BotanicalArtwork))
    .sort((a, b) => (a.viewOrder ?? 999) - (b.viewOrder ?? 999));
  
  console.log('ALL ARTWORKS FROM SUPABASE (getAllArtworks):', artworks);
  console.log('ARTWORK COUNT:', artworks.length);
  console.table(
    artworks.map((artwork, index) => ({
      index,
      id: artwork.id,
      title: artwork.title,
      image_url: (artwork as any).image_url || artwork.customImageData || (artwork as any).imageUrl || (artwork as any).url || artwork.textureTheme
    }))
  );
  return artworks;
}

export async function getArtworks(): Promise<BotanicalArtwork[]> {
  if (!supabase) {
    return getStoredArtworks();
  }
  try {
    const client = getSupabase();
    const all: BotanicalArtwork[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await client
        .from('artworks')
        .select('id, details')
        .order('created_at')
        .order('id')
        .range(offset, offset + 499);
      if (error) throw error;
      all.push(...data.map((row) => ({ ...row.details, id: row.id } as BotanicalArtwork)));
      if (data.length < 500) break;
    }
    console.log('ALL ARTWORKS FROM SUPABASE:', all);
    console.log('ARTWORK COUNT:', all.length);
    console.table(
      all.map((artwork, index) => ({
        index,
        id: artwork.id,
        title: artwork.title,
        image_url: (artwork as any).image_url || artwork.customImageData || (artwork as any).imageUrl || (artwork as any).url || artwork.textureTheme
      }))
    );

    const clean = deduplicateArtworks(all).sort((a, b) => (a.viewOrder ?? 999) - (b.viewOrder ?? 999));
    if (clean.length > 0) {
      replaceStoredArtworks(clean);
      return clean;
    }
    return getStoredArtworks();
  } catch (error) {
    console.warn('Failed to load remote artworks, using local gallery cache:', error);
    return getStoredArtworks();
  }
}

async function prepareArtwork(artwork: BotanicalArtwork): Promise<BotanicalArtwork> {
  const result = { ...artwork };
  if (result.customImageData?.startsWith('data:') && supabase) {
    try {
      const blob = await (await fetch(result.customImageData)).blob();
      if (['image/jpeg', 'image/png', 'image/webp'].includes(blob.type) && blob.size <= 5 * 1024 * 1024) {
        const path = crypto.randomUUID();
        const { error } = await getSupabase()
          .storage.from('canvas-images')
          .upload(path, blob, { contentType: blob.type });
        if (!error) {
          result.customImageData = getSupabase().storage.from('canvas-images').getPublicUrl(path).data.publicUrl;
        }
      }
    } catch {
      // Fallback: keep original data URL so user image is never lost
    }
  }
  // Complete replacement ensures cleared optional fields do not survive in JSON.
  return JSON.parse(JSON.stringify(result));
}

export async function saveArtwork(artwork: BotanicalArtwork): Promise<BotanicalArtwork> {
  await requireAdmin();
  const saved = await prepareArtwork(artwork);
  if (supabase) {
    try {
      const { error } = await getSupabase().from('artworks').insert({ id: saved.id, details: saved });
      if (error) console.warn('Supabase insert warning:', error);
    } catch (e) {
      console.warn('Supabase insert failed, saving locally:', e);
    }
  }
  const current = getStoredArtworks();
  const updated = replaceStoredArtworks([...current.filter((a) => a.id !== saved.id), saved]);
  return saved;
}

export async function updateArtwork(id: string, artwork: BotanicalArtwork): Promise<BotanicalArtwork> {
  await requireAdmin();
  const saved = await prepareArtwork({ ...artwork, id });
  if (supabase) {
    try {
      const { error } = await getSupabase().from('artworks').update({ details: saved }).eq('id', id);
      if (error) console.warn('Supabase update warning:', error);
    } catch (e) {
      console.warn('Supabase update failed, saving locally:', e);
    }
  }
  const current = getStoredArtworks();
  const updated = current.map((a) => (a.id === id ? saved : a));
  replaceStoredArtworks(updated);
  return saved;
}

export async function deleteArtwork(id: string): Promise<void> {
  await requireAdmin();
  if (supabase) {
    try {
      await getSupabase().from('artworks').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete failed, deleting locally:', e);
    }
  }
  const current = getStoredArtworks();
  replaceStoredArtworks(current.filter((a) => a.id !== id));
}

export async function deleteAllArtworks(): Promise<void> {
  if (supabase) {
    try {
      await getSupabase().rpc('delete_all_gallery_artworks');
    } catch {
      try {
        await getSupabase().from('artworks').delete().neq('id', '');
      } catch (e) {
        console.warn('Supabase deleteAll failed:', e);
      }
    }
  }
  replaceStoredArtworks([]);
}

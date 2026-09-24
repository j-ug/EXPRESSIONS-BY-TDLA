import { getSupabase, supabase } from './supabase';
import { useEffect, useState } from 'react';

export interface GalleryStats {
  total_visitors: number;
  active_visitors: number;
}

/**
 * Increments the global visitor count in the database.
 * Usually called once per session.
 */
export async function incrementVisitorCount(): Promise<void> {
  if (!supabase) return;
  const client = getSupabase();
  const { error } = await client.rpc('increment_visitor_count');
  if (error) {
    console.error('Failed to increment visitor count:', error);
  }
}

/**
 * Fetches the current total visitor count.
 */
export async function getTotalVisitors(): Promise<number> {
  if (!supabase) return 0;
  const client = getSupabase();
  const { data, error } = await client
    .from('gallery_stats')
    .select('total_visitors')
    .eq('id', 'global')
    .single();

  if (error) {
    console.error('Failed to fetch total visitors:', error);
    return 0;
  }
  return data.total_visitors;
}

/**
 * Hook for real-time gallery statistics (Total & Active Now).
 */
export function useGalleryStats() {
  const [stats, setStats] = useState<GalleryStats>({ total_visitors: 0, active_visitors: 1 });

  useEffect(() => {
    if (!supabase) return;

    // 1. Initial fetch
    getTotalVisitors().then(total => setStats(prev => ({ ...prev, total_visitors: total })));

    // 2. Realtime subscription for total_visitors updates
    const channel = supabase
      .channel('gallery_stats_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'gallery_stats', filter: 'id=eq.global' },
        (payload) => {
          setStats(prev => ({ ...prev, total_visitors: payload.new.total_visitors }));
        }
      )
      .subscribe();

    // 3. Presence for active visitors
    const presenceChannel = supabase.channel('online-visitors');

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        const count = Object.keys(newState).length;
        setStats(prev => ({ ...prev, active_visitors: Math.max(1, count) }));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('join', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('leave', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
            user_id: (await supabase!.auth.getUser()).data.user?.id || 'anonymous-' + Math.random().toString(36).substring(7),
          });
        }
      });

    return () => {
      channel.unsubscribe();
      presenceChannel.unsubscribe();
    };
  }, []);

  return stats;
}

import { User } from '../types';
import { getSupabase, supabase } from '../lib/supabase';

let verifiedUser: User | null = null;
export const getCurrentUser = (): User | null => verifiedUser;

async function resolveUser(): Promise<User | null> {
  const client = getSupabase();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  const { data: admin, error: roleError } = await client.rpc('is_gallery_admin');
  if (roleError) throw roleError;
  const isAdminEmail = data.user.email === 'jeswinsamuel.la@gmail.com' || data.user.email === 'ophyliagodwin@gmail.com';
  return {
    id: data.user.id,
    name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Visitor',
    email: data.user.email || '',
    createdAt: data.user.created_at,
    role: (admin === true || isAdminEmail) ? 'admin' : 'user',
    isAdmin: admin === true || isAdminEmail,
  };
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  if (!supabase) { callback(null); return () => {}; }
  let disposed = false;
  let revision = 0;
  const refresh = () => {
    const current = ++revision;
    // Run outside the SDK auth callback to avoid holding its session lock.
    setTimeout(async () => {
      let user: User | null = null;
      try { 
        user = await resolveUser();
        // Fallback for jeswinsamuel.la@gmail.com
        if (user && user.email === 'jeswinsamuel.la@gmail.com') {
          user.isAdmin = true;
          user.role = 'admin';
        }
      } catch { /* Fail closed. */ }
      if (!disposed && current === revision) {
        verifiedUser = user;
        callback(user);
      }
    }, 0);
  };
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) {
      ++revision;
      verifiedUser = null;
      callback(null);
    } else refresh();
  });
  const onFocus = () => refresh();
  window.addEventListener('focus', onFocus);
  refresh();
  return () => {
    disposed = true;
    ++revision;
    data.subscription.unsubscribe();
    window.removeEventListener('focus', onFocus);
  };
}

const message = (error: unknown) => error instanceof Error ? error.message : 'Unable to authenticate. Please try again.';

export async function loginUser(email: string, password: string) {
  try {
    const { error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    const user = await resolveUser();
    if (!user) throw new Error('Unable to verify your session.');
    verifiedUser = user;
    return { success: true as const, user };
  } catch (error) { return { success: false as const, error: message(error) }; }
}

export async function signUpUser(name: string, email: string, password: string) {
  try {
    if (!name.trim()) throw new Error('Your name is required.');
    const { data, error } = await getSupabase().auth.signUp({
      email: email.trim(), password,
      options: { data: { name: name.trim() }, emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
    if (!data.session) return { success: true as const, user: undefined, message: 'Check your email to confirm your account, then sign in.' };
    const user = await resolveUser();
    if (!user) throw new Error('Unable to verify your session.');
    verifiedUser = user;
    return { success: true as const, user, message: undefined };
  } catch (error) { return { success: false as const, error: message(error) }; }
}

export async function logoutUser(): Promise<void> {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
  verifiedUser = null;
}

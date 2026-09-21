import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User } from '../types';

const CURRENT_USER_STORAGE_KEY = 'botanical_gallery_current_user';

const toPublicUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  const token = await firebaseUser.getIdTokenResult(true);
  const isAdmin = token.claims.admin === true || token.claims.role === 'admin';
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Gallery Visitor',
    email: firebaseUser.email || '',
    role: isAdmin ? 'admin' : 'user',
    isAdmin,
    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
  };
};

const persistUser = (user: User | null) => {
  if (user) localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
};

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      persistUser(null);
      callback(null);
      return;
    }
    try {
      const user = await toPublicUser(firebaseUser);
      persistUser(user);
      callback(user);
    } catch {
      persistUser(null);
      callback(null);
    }
  });
}

const authError = (error: unknown): string => {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code.includes('invalid-credential')) return 'Invalid email or password.';
  if (code.includes('email-already-in-use')) return 'An account with this email already exists.';
  if (code.includes('weak-password')) return 'Password must contain at least 6 characters.';
  if (code.includes('invalid-email')) return 'Please enter a valid email address.';
  if (code.includes('too-many-requests')) return 'Too many attempts. Please wait and try again.';
  return 'Authentication failed. Please try again.';
};

export async function loginUser(email: string, password: string) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = await toPublicUser(credential.user);
    persistUser(user);
    return { success: true as const, user };
  } catch (error) {
    return { success: false as const, error: authError(error) };
  }
}

export async function signUpUser(name: string, email: string, password: string) {
  if (!name.trim()) return { success: false as const, error: 'Your name is required.' };
  try {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(credential.user, { displayName: name.trim() });
    const user = await toPublicUser(credential.user);
    persistUser(user);
    return { success: true as const, user };
  } catch (error) {
    return { success: false as const, error: authError(error) };
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
  persistUser(null);
}

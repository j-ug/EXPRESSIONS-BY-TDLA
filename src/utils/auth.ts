import { User } from '../types';

const USERS_STORAGE_KEY = 'botanical_gallery_users';
const CURRENT_USER_STORAGE_KEY = 'botanical_gallery_current_user';

export const ADMIN_CREDENTIALS = {
  email: 'admin123@gmail.com',
  password: 'admin@987',
};

interface StoredUser extends User {
  passwordHash: string;
}

// Pre-seeded Admin account
const DEFAULT_ADMIN_USER: StoredUser = {
  id: 'admin-main',
  name: 'Gallery Curator (Admin)',
  email: ADMIN_CREDENTIALS.email,
  passwordHash: ADMIN_CREDENTIALS.password,
  role: 'admin',
  createdAt: '2024-01-01T00:00:00.000Z',
};

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      const initial = [DEFAULT_ADMIN_USER];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const users = JSON.parse(raw);
    // Ensure admin user exists in list
    const hasAdmin = users.some((u: StoredUser) => u.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase());
    if (!hasAdmin) {
      users.push(DEFAULT_ADMIN_USER);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
    return users;
  } catch {
    return [DEFAULT_ADMIN_USER];
  }
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (u) {
      u.isAdmin = u.role === 'admin';
    }
    return u;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  } catch {
    // Ignore storage issues
  }
}

export function loginUser(email: string, password: string): { success: boolean; user?: User; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    return { success: false, error: 'Please provide both email and password.' };
  }

  // Check admin shortcut credentials
  if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() && cleanPassword === ADMIN_CREDENTIALS.password) {
    const adminUser: User = {
      id: DEFAULT_ADMIN_USER.id,
      name: DEFAULT_ADMIN_USER.name,
      email: ADMIN_CREDENTIALS.email,
      role: 'admin',
      isAdmin: true,
      createdAt: DEFAULT_ADMIN_USER.createdAt,
    };
    setCurrentUser(adminUser);
    return { success: true, user: adminUser };
  }

  const users = getStoredUsers();
  const found = users.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.passwordHash === cleanPassword
  );

  if (!found) {
    return { success: false, error: 'Invalid email or password. Please try again or create an account.' };
  }

  const user: User = {
    id: found.id,
    name: found.name,
    email: found.email,
    role: found.role,
    isAdmin: found.role === 'admin',
    createdAt: found.createdAt,
  };

  setCurrentUser(user);
  return { success: true, user };
}

export function signUpUser(
  name: string,
  email: string,
  password: string
): { success: boolean; user?: User; error?: string } {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanName || !cleanEmail || !cleanPassword) {
    return { success: false, error: 'All fields are required.' };
  }

  if (cleanPassword.length < 5) {
    return { success: false, error: 'Password must be at least 5 characters long.' };
  }

  const users = getStoredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, error: 'An account with this email already exists. Please sign in.' };
  }

  // Check if this matches the requested admin email & password
  const isAdmin =
    cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() && cleanPassword === ADMIN_CREDENTIALS.password;

  const newUser: StoredUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    name: cleanName,
    email: cleanEmail,
    passwordHash: cleanPassword,
    role: isAdmin ? 'admin' : 'user',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // Continue
  }

  const publicUser: User = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    isAdmin: newUser.role === 'admin',
    createdAt: newUser.createdAt,
  };

  setCurrentUser(publicUser);
  return { success: true, user: publicUser };
}

export function logoutUser(): void {
  setCurrentUser(null);
}

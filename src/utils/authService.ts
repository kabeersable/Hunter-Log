/**
 * Authentication & User Account Management Service
 */

export interface UserAccount {
  username: string;
  passwordHash: string;
  role: 'admin' | 'user';
  createdAt: string;
}

const STORAGE_USERS_KEY = 'HUNTER_SYSTEM_ACCOUNTS_V1';
const STORAGE_SESSION_KEY = 'HUNTER_SYSTEM_ACTIVE_SESSION_V1';

// Admin credentials specified by system owner
export const ADMIN_CREDENTIALS = {
  username: 'admin_hunter_9247',
  password: 'Xk7#mQp2!vT9$wRz4Lc@',
};

// Simple string hash helper for secure storage
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash)}_${password.length}`;
}

export class AuthService {
  static getUsers(): UserAccount[] {
    try {
      const raw = localStorage.getItem(STORAGE_USERS_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as UserAccount[];
    } catch {
      return [];
    }
  }

  static saveUsers(users: UserAccount[]): void {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save user accounts:', e);
    }
  }

  static getActiveSession(): UserAccount | null {
    try {
      const raw = localStorage.getItem(STORAGE_SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as UserAccount;
    } catch {
      return null;
    }
  }

  static setActiveSession(user: UserAccount | null): void {
    if (!user) {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } else {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    }
  }

  static registerUser(username: string, password: string): { success: boolean; error?: string; user?: UserAccount } {
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const users = this.getUsers();
    if (trimmed.toLowerCase() === 'admin_hunter_9247' || users.some((u) => u.username.toLowerCase() === trimmed.toLowerCase())) {
      return { success: false, error: 'Username already exists. Please choose a different username.' };
    }

    const newUser: UserAccount = {
      username: trimmed,
      passwordHash: hashPassword(password),
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setActiveSession(newUser);

    return { success: true, user: newUser };
  }

  static loginUser(username: string, password: string): { success: boolean; error?: string; user?: UserAccount } {
    const trimmed = username.trim();
    if (!trimmed || !password) {
      return { success: false, error: 'Please enter both username and password.' };
    }

    // Check Admin Master Credentials
    if (trimmed === 'admin_hunter_9247' && password === 'Xk7#mQp2!vT9$wRz4Lc@') {
      const adminUser: UserAccount = {
        username: 'admin_hunter_9247',
        passwordHash: hashPassword(password),
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      this.setActiveSession(adminUser);
      return { success: true, user: adminUser };
    }

    // Check Registered Standard Users
    const users = this.getUsers();
    const targetHash = hashPassword(password);
    const found = users.find(
      (u) => u.username.toLowerCase() === trimmed.toLowerCase() && u.passwordHash === targetHash
    );

    if (found) {
      this.setActiveSession(found);
      return { success: true, user: found };
    }

    return { success: false, error: 'Invalid username or password.' };
  }

  static logout(): void {
    this.setActiveSession(null);
  }
}

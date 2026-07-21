import type { GameState } from '../types/hunter';

export interface IStorageAdapter {
  loadState(): Promise<GameState | null>;
  saveState(state: GameState): Promise<void>;
  clearState(): Promise<void>;
}

const STORAGE_KEY = 'HUNTER_LOG_SYSTEM_STATE_V1';

export class LocalStorageAdapter implements IStorageAdapter {
  async loadState(): Promise<GameState | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as GameState;
    } catch (e) {
      console.error('[STORAGE SYSTEM ERROR] Failed to parse local storage state:', e);
      return null;
    }
  }

  async saveState(state: GameState): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('[STORAGE SYSTEM ERROR] Failed to write state to local storage:', e);
    }
  }

  async clearState(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('[STORAGE SYSTEM ERROR] Failed to clear local storage:', e);
    }
  }
}

// Singleton storage instance (swappable in future versions)
export const storageAdapter: IStorageAdapter = new LocalStorageAdapter();

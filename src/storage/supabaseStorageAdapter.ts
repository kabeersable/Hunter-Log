import { supabase } from '../lib/supabaseClient';
import type { GameState, Hunter, RoutineTask, DailyLogEntry, Milestone } from '../types/hunter';
import { LocalStorageAdapter } from './storageAdapter';

const localBackupAdapter = new LocalStorageAdapter();
const OFFLINE_CACHE_KEY = 'HUNTER_OFFLINE_CACHE_V1';
const MIGRATION_DONE_KEY = 'HUNTER_SUPABASE_MIGRATED_V1';

export class SupabaseStorageAdapter {
  /**
   * Load GameState from Supabase for logged in user_id.
   * Fallback to localStorage cache if offline.
   */
  async loadState(userId: string): Promise<GameState | null> {
    if (!userId) return null;

    try {
      if (!navigator.onLine) {
        console.warn('[STORAGE] Device offline. Loading from local cache...');
        return await this.loadOfflineCache();
      }

      // 1. Fetch Hunter Profile
      const { data: hunterRows, error: hunterErr } = await supabase
        .from('hunters')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (hunterErr) {
        console.error('[SUPABASE] Failed to fetch hunter profile:', hunterErr);
        return await this.loadOfflineCache();
      }

      // If user has no record in Supabase yet, check for local data to migrate!
      if (!hunterRows || hunterRows.length === 0) {
        return await this.handleFirstTimeMigration(userId);
      }

      const hRow = hunterRows[0];
      const hunter: Hunter = {
        name: hRow.name,
        level: hRow.level,
        xp: hRow.xp,
        xpToNextLevel: hRow.xp_to_next_level,
        rank: hRow.rank,
        streak: hRow.streak,
        longestStreak: hRow.longest_streak,
        coins: hRow.coins,
        stats: hRow.stats,
        penaltyZoneActive: hRow.penalty_zone_active,
        penaltyZoneExpiresAt: hRow.penalty_zone_expires_at,
        rankFrozenUntil: hRow.rank_frozen_until,
        lastProcessedDate: new Date().toISOString().split('T')[0],
        createdAt: hRow.updated_at || new Date().toISOString(),
      };

      // 2. Fetch Tasks
      const { data: taskRows } = await supabase
        .from('routine_tasks')
        .select('*')
        .eq('user_id', userId);

      const tasks: RoutineTask[] = (taskRows || []).map((t) => ({
        id: t.id,
        title: t.title,
        type: t.type as any,
        scheduleDays: t.schedule_days,
        statTrained: t.stat as any,
        difficulty: t.difficulty as any,
        target: t.target,
        timeSlot: t.time_slot,
        active: t.active,
        createdAt: t.created_at,
        xpReward: t.type === 'main' ? 30 : 20,
      }));

      // 3. Fetch Daily Logs
      const { data: logRows } = await supabase
        .from('daily_log_entries')
        .select('*')
        .eq('user_id', userId);

      const logs: DailyLogEntry[] = (logRows || []).map((l) => ({
        id: l.id,
        date: l.date,
        routineTaskId: l.routine_task_id,
        status: l.status as any,
        proof: l.proof,
        completedAt: l.completed_at,
      }));

      // 4. Fetch Milestones
      const { data: milestoneRows } = await supabase
        .from('milestones')
        .select('*')
        .eq('user_id', userId);

      const milestones: Milestone[] = (milestoneRows || []).map((m) => ({
        id: m.id,
        title: m.title,
        cadence: m.cadence as any,
        stat: m.stat as any,
        order: m.order,
        unlocksAfter: m.unlocks_after_milestone_id,
        status: m.status as any,
      }));

      const state: GameState = {
        hunter,
        tasks,
        logs,
        bossQuests: [],
        penaltyRecords: [],
        notifications: [],
        weeklyReports: [],
        milestones,
      };

      // Save fresh state to local cache for offline availability
      this.saveOfflineCache(state);
      return state;
    } catch (err) {
      console.error('[STORAGE] Error loading state from Supabase:', err);
      return await this.loadOfflineCache();
    }
  }

  /**
   * Save GameState to Supabase for user_id and update local offline cache.
   */
  async saveState(userId: string, state: GameState): Promise<void> {
    if (!userId || !state.hunter) return;

    // Always update local cache immediately for fast UI response & offline support
    this.saveOfflineCache(state);

    if (!navigator.onLine) {
      console.warn('[STORAGE] Offline: State saved to local cache. Will sync when online.');
      return;
    }

    try {
      const hunter = state.hunter;

      // 1. Upsert Hunter Profile
      await supabase.from('hunters').upsert({
        id: `hunter-${userId}`,
        user_id: userId,
        name: hunter.name,
        level: hunter.level,
        xp: hunter.xp,
        xp_to_next_level: hunter.xpToNextLevel,
        rank: hunter.rank,
        streak: hunter.streak,
        longest_streak: hunter.longestStreak,
        coins: hunter.coins,
        stats: hunter.stats,
        penalty_zone_active: hunter.penaltyZoneActive,
        penalty_zone_expires_at: hunter.penaltyZoneExpiresAt,
        rank_frozen_until: hunter.rankFrozenUntil,
        updated_at: new Date().toISOString(),
      });

      // 2. Upsert Tasks
      if (state.tasks.length > 0) {
        const taskPayload = state.tasks.map((t) => ({
          id: t.id,
          user_id: userId,
          title: t.title,
          type: t.type,
          schedule_days: t.scheduleDays,
          stat: t.statTrained,
          difficulty: t.difficulty,
          target: t.target,
          time_slot: t.timeSlot,
          active: t.active,
          created_at: t.createdAt,
        }));
        await supabase.from('routine_tasks').upsert(taskPayload);
      }

      // 3. Upsert Logs
      if (state.logs.length > 0) {
        const logPayload = state.logs.map((l) => ({
          id: l.id,
          user_id: userId,
          date: l.date,
          routine_task_id: l.routineTaskId,
          status: l.status,
          proof: l.proof,
          completed_at: l.completedAt,
        }));
        await supabase.from('daily_log_entries').upsert(logPayload);
      }

      // 4. Upsert Milestones
      if (state.milestones.length > 0) {
        const milestonePayload = state.milestones.map((m) => ({
          id: m.id,
          user_id: userId,
          title: m.title,
          cadence: m.cadence,
          stat: m.stat,
          unlocks_after_milestone_id: m.unlocksAfter,
          order: m.order,
          status: m.status,
        }));
        await supabase.from('milestones').upsert(milestonePayload);
      }
    } catch (err) {
      console.error('[SUPABASE] Failed to sync state to Supabase:', err);
    }
  }

  /**
   * Migrate existing local data (localStorage) to Supabase on first login
   */
  private async handleFirstTimeMigration(userId: string): Promise<GameState | null> {
    const localData = await localBackupAdapter.loadState();
    if (localData && localData.hunter && !localStorage.getItem(MIGRATION_DONE_KEY)) {
      console.log('[SUPABASE MIGRATION] Uploading existing local dataset to Supabase account...');
      await this.saveState(userId, localData);
      localStorage.setItem(MIGRATION_DONE_KEY, 'true');
      return localData;
    }
    return null;
  }

  private saveOfflineCache(state: GameState) {
    try {
      localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('[STORAGE] Error saving offline cache:', e);
    }
  }

  private async loadOfflineCache(): Promise<GameState | null> {
    try {
      const raw = localStorage.getItem(OFFLINE_CACHE_KEY);
      if (!raw) return await localBackupAdapter.loadState();
      return JSON.parse(raw) as GameState;
    } catch {
      return await localBackupAdapter.loadState();
    }
  }
}

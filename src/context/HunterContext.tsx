import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  GameState,
  Hunter,
  RoutineTask,
  DailyLogEntry,
  Milestone,
  StatKey,
  TaskType,
  QuestDifficulty
} from '../types/hunter';
import { storageAdapter } from '../storage/storageAdapter';
import {
  createInitialHunter,
  processMidnightRollover,
  completeDailyQuest,
  completeBossQuest,
  getTodayDateString,
  awardXpAndCheckLevelUp,
  isTaskScheduledForDay,
  deduplicateTasks,
  deduplicateMilestones
} from '../engine/gameEngine';
import { AuthService, type UserAccount } from '../utils/authService';
import {
  PERSONAL_SEED,
  GENERIC_PUBLIC_SEED,
  buildRoutineTaskFromSeed,
  buildMilestoneFromSeed
} from '../data/seedData';
import { NotificationService } from '../utils/notificationService';
import { supabase } from '../lib/supabaseClient';
import { SupabaseStorageAdapter } from '../storage/supabaseStorageAdapter';

const supabaseAdapter = new SupabaseStorageAdapter();

interface HunterContextType {
  state: GameState;
  isLoading: boolean;
  activeTab: 'dashboard' | 'checklist' | 'routine' | 'report';
  setActiveTab: (tab: 'dashboard' | 'checklist' | 'routine' | 'report') => void;
  secondsUntilMidnight: number;
  proofModalLog: DailyLogEntry | null;
  openProofModal: (log: DailyLogEntry) => void;
  closeProofModal: () => void;
  
  // Actions
  completeOnboarding: (
    name: string,
    customTasks?: { title: string; target: string; statTrained: StatKey }[],
    presetType?: 'personal' | 'generic'
  ) => void;
  submitProof: (proof: string, isPartial?: boolean) => void;
  submitBossProof: (bossQuestId: string, proof: string) => void;
  completeMilestone: (milestoneId: string) => void;
  addTask: (taskData: {
    title: string;
    target: string;
    type: TaskType;
    statTrained: StatKey;
    difficulty: QuestDifficulty;
    xpReward: number;
    scheduleDays?: 'everyday' | 'weekday' | 'weekend' | string[];
    timeSlot?: string;
  }) => void;
  toggleTaskActive: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  deleteMilestone: (milestoneId: string) => void;
  addBossQuest: (title: string, statTrained: StatKey, xpReward: number) => void;
  isAdmin: boolean;
  loginWithUserSession: (user: UserAccount) => void;
  logoutUser: () => void;
  authenticateAdmin: (passcode: string) => boolean;
  logoutAdmin: () => void;
  loadSeedPreset: (presetType: 'personal' | 'generic') => void;
  enableNotifications: () => Promise<boolean>;
  sendTestNotification: () => void;
  dismissNotification: (id: string) => void;
  resetAllData: () => void;
}

const defaultGameState: GameState = {
  hunter: null,
  tasks: [],
  logs: [],
  bossQuests: [],
  penaltyRecords: [],
  notifications: [],
  weeklyReports: [],
  milestones: [],
};

const HunterContext = createContext<HunterContextType | undefined>(undefined);

export const HunterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(defaultGameState);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checklist' | 'routine' | 'report'>('checklist');
  const [secondsUntilMidnight, setSecondsUntilMidnight] = useState<number>(0);
  const [proofModalLog, setProofModalLog] = useState<DailyLogEntry | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('HUNTER_SYSTEM_ADMIN_AUTH') === 'true';
  });

  const authenticateAdmin = (passcode: string): boolean => {
    const validPins = ['7777', '1337', 'hunter', 'admin'];
    if (validPins.includes(passcode.trim().toLowerCase())) {
      setIsAdmin(true);
      localStorage.setItem('HUNTER_SYSTEM_ADMIN_AUTH', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('HUNTER_SYSTEM_ADMIN_AUTH');
  };

  const loginWithUserSession = (user: UserAccount) => {
    AuthService.setActiveSession(user);
    if (user.role === 'admin' || user.username === 'admin_hunter_9247') {
      setIsAdmin(true);
      localStorage.setItem('HUNTER_SYSTEM_ADMIN_AUTH', 'true');
      completeOnboarding('Master Hunter', undefined, 'personal');
    } else {
      setIsAdmin(false);
      localStorage.removeItem('HUNTER_SYSTEM_ADMIN_AUTH');
      completeOnboarding(user.username, undefined, 'generic');
    }
  };

  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);

  const logoutUser = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    AuthService.logout();
    setIsAdmin(false);
    setSupabaseUserId(null);
    localStorage.removeItem('HUNTER_SYSTEM_ADMIN_AUTH');
    setState(defaultGameState);
    storageAdapter.clearState();
  };

  // Listen for Supabase Auth state changes & load state from Supabase / cache
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true);
      if (session?.user) {
        const userId = session.user.id;
        setSupabaseUserId(userId);

        let loaded = await supabaseAdapter.loadState(userId);
        if (!loaded || !loaded.hunter) {
          // Initialize new account with default seed
          const defaultTasks = PERSONAL_SEED.routineTasks.map((t, idx) =>
            buildRoutineTaskFromSeed(t, idx, getTodayDateString(new Date()))
          );
          const defaultMilestones = PERSONAL_SEED.milestones.map((m, idx) =>
            buildMilestoneFromSeed(m, idx)
          );
          const initialHunter = createInitialHunter(session.user.email || 'Master Hunter');
          loaded = {
            hunter: initialHunter,
            tasks: defaultTasks,
            logs: [],
            bossQuests: [],
            penaltyRecords: [],
            notifications: [],
            weeklyReports: [],
            milestones: defaultMilestones,
          };
          await supabaseAdapter.saveState(userId, loaded);
        }

        const updated = processMidnightRollover(loaded, new Date());
        setState(updated);
        await supabaseAdapter.saveState(userId, updated);
      } else {
        setSupabaseUserId(null);
        const loaded = await storageAdapter.loadState();
        if (loaded && loaded.hunter) {
          const updated = processMidnightRollover(loaded, new Date());
          setState(updated);
        } else {
          setState(defaultGameState);
        }
      }
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Countdown timer to midnight local time & periodic rollover checker
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diffSec = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
      setSecondsUntilMidnight(diffSec);

      // Check time slots every minute
      if (state.hunter) {
        const todayStr = getTodayDateString(now);
        NotificationService.scheduleTimeSlotCheck(state.tasks);

        if (state.hunter.lastProcessedDate !== todayStr) {
          const updated = processMidnightRollover(state, now);
          setState(updated);
          storageAdapter.saveState(updated);
          if (supabaseUserId) {
            supabaseAdapter.saveState(supabaseUserId, updated);
          }
        }
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [state, supabaseUserId]);

  const saveState = useCallback(async (newState: GameState) => {
    const deduplicatedState: GameState = {
      ...newState,
      tasks: deduplicateTasks(newState.tasks),
      milestones: deduplicateMilestones(newState.milestones),
    };

    if (deduplicatedState.notifications.length > state.notifications.length) {
      const newest = deduplicatedState.notifications[0];
      if (newest) {
        NotificationService.sendNotification(newest.title, newest.message, newest.type);
      }
    }
    setState(deduplicatedState);
    await storageAdapter.saveState(deduplicatedState);

    if (supabaseUserId) {
      await supabaseAdapter.saveState(supabaseUserId, deduplicatedState);
    }
  }, [state.notifications.length, supabaseUserId]);

  const enableNotifications = async (): Promise<boolean> => {
    return await NotificationService.requestPermission();
  };

  const sendTestNotification = () => {
    if (NotificationService.getPermissionStatus() !== 'granted') {
      NotificationService.requestPermission().then((granted) => {
        if (granted) {
          NotificationService.sendNotification(
            'TEST NOTIFICATION SUCCESSFUL',
            'System Protocol active on mobile & laptop.',
            'info'
          );
        } else {
          alert('Notification permission is denied in browser settings.');
        }
      });
    } else {
      NotificationService.sendNotification(
        'TEST NOTIFICATION SUCCESSFUL',
        'System Protocol active on mobile & laptop.',
        'info'
      );
    }
  };

  // Complete onboarding with seed support
  const completeOnboarding = (
    name: string,
    customTasks?: { title: string; target: string; statTrained: StatKey }[],
    presetType: 'personal' | 'generic' = 'personal'
  ) => {
    const todayStr = getTodayDateString(new Date());
    const hunter: Hunter = createInitialHunter(name);

    let routineTasks: RoutineTask[] = [];
    let milestones: Milestone[] = [];

    if (customTasks && customTasks.length >= 3) {
      routineTasks = customTasks.map((t, index) => ({
        id: `task-${Date.now()}-${index}`,
        title: t.title.trim(),
        type: 'main',
        statTrained: t.statTrained,
        xpReward: 30,
        difficulty: 'E',
        target: t.target.trim(),
        active: true,
        createdAt: todayStr,
        scheduleDays: 'everyday',
      }));
      // Add default milestones from personal seed
      milestones = PERSONAL_SEED.milestones.map((m, idx) => buildMilestoneFromSeed(m, idx));
    } else {
      const seed = presetType === 'generic' ? GENERIC_PUBLIC_SEED : PERSONAL_SEED;
      routineTasks = seed.routineTasks.map((st, idx) => buildRoutineTaskFromSeed(st, idx, todayStr));
      milestones = seed.milestones.map((sm, idx) => buildMilestoneFromSeed(sm, idx));
    }

    // Generate initial logs for today matching schedule
    const logs: DailyLogEntry[] = routineTasks
      .filter((t) => isTaskScheduledForDay(t.scheduleDays, todayStr))
      .map((t) => ({
        id: `log-${todayStr}-${t.id}`,
        date: todayStr,
        routineTaskId: t.id,
        status: 'pending',
        proof: null,
        completedAt: null,
      }));

    const initialState: GameState = {
      hunter,
      tasks: routineTasks,
      logs,
      bossQuests: [],
      penaltyRecords: [],
      notifications: [
        {
          id: `notif-welcome-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'SYSTEM AWAKENING',
          message: `Welcome, Hunter ${hunter.name}. System protocol initialized with ${presetType === 'personal' ? 'Personal' : 'Starter'} routine dataset.`,
          type: 'info',
        },
      ],
      weeklyReports: [],
      milestones,
    };

    saveState(initialState);
  };

  const openProofModal = (log: DailyLogEntry) => {
    setProofModalLog(log);
  };

  const closeProofModal = () => {
    setProofModalLog(null);
  };

  const submitProof = (proof: string, isPartial: boolean = false) => {
    if (!proofModalLog) return;
    try {
      const newState = completeDailyQuest(state, proofModalLog.id, proof, isPartial, new Date());
      saveState(newState);
      closeProofModal();
    } catch (e: any) {
      alert(e.message || 'Failed to complete quest');
    }
  };

  const submitBossProof = (bossQuestId: string, proof: string) => {
    try {
      const newState = completeBossQuest(state, bossQuestId, proof, new Date());
      saveState(newState);
    } catch (e: any) {
      alert(e.message || 'Failed to complete Boss Quest');
    }
  };

  const completeMilestone = (milestoneId: string) => {
    if (!state.hunter) return;

    const index = state.milestones.findIndex((m) => m.id === milestoneId);
    if (index === -1) return;

    const milestone = state.milestones[index];
    if (milestone.status === 'completed') return;

    const updatedMilestones = [...state.milestones];
    updatedMilestones[index] = {
      ...milestone,
      status: 'completed',
      completedAt: new Date().toISOString(),
    };

    let updatedHunter = { ...state.hunter };
    if (milestone.stat) {
      const currentVal = updatedHunter.stats[milestone.stat] || 10;
      updatedHunter.stats = {
        ...updatedHunter.stats,
        [milestone.stat]: currentVal + 2,
      };
    }

    const xpResult = awardXpAndCheckLevelUp(updatedHunter, 50);
    updatedHunter = xpResult.hunter;

    const newState: GameState = {
      ...state,
      hunter: updatedHunter,
      milestones: updatedMilestones,
      notifications: [
        {
          id: `notif-ms-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'MILESTONE ACHIEVED',
          message: `Milestone "${milestone.title}" unlocked! +50 XP granted.`,
          type: 'info',
        },
        ...state.notifications,
      ],
    };

    saveState(newState);
  };

  const addTask = (taskData: {
    title: string;
    target: string;
    type: TaskType;
    statTrained: StatKey;
    difficulty: QuestDifficulty;
    xpReward: number;
    scheduleDays?: 'everyday' | 'weekday' | 'weekend' | string[];
    timeSlot?: string;
  }) => {
    const todayStr = getTodayDateString(new Date());
    const newTask: RoutineTask = {
      id: `task-${Date.now()}`,
      title: taskData.title.trim(),
      type: taskData.type,
      statTrained: taskData.statTrained,
      xpReward: taskData.xpReward,
      difficulty: taskData.difficulty,
      target: taskData.target.trim(),
      active: true,
      createdAt: todayStr,
      scheduleDays: taskData.scheduleDays || 'everyday',
      timeSlot: taskData.timeSlot,
    };

    let updatedLogs = [...state.logs];
    if (isTaskScheduledForDay(newTask.scheduleDays, todayStr)) {
      updatedLogs.push({
        id: `log-${todayStr}-${newTask.id}`,
        date: todayStr,
        routineTaskId: newTask.id,
        status: 'pending',
        proof: null,
        completedAt: null,
      });
    }

    const newState: GameState = {
      ...state,
      tasks: [...state.tasks, newTask],
      logs: updatedLogs,
      notifications: [
        {
          id: `notif-add-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'ROUTINE UPDATED',
          message: `New ${newTask.type.toUpperCase()} Quest "${newTask.title}" added to System.`,
          type: 'info',
        },
        ...state.notifications,
      ],
    };

    saveState(newState);
  };

  const toggleTaskActive = (taskId: string) => {
    const updatedTasks = state.tasks.map((t) =>
      t.id === taskId ? { ...t, active: !t.active } : t
    );
    saveState({ ...state, tasks: updatedTasks });
  };

  const deleteTask = async (taskId: string) => {
    const updatedTasks = state.tasks.filter((t) => t.id !== taskId);
    const updatedLogs = state.logs.filter((l) => l.routineTaskId !== taskId);
    saveState({ ...state, tasks: updatedTasks, logs: updatedLogs });
    if (supabaseUserId) {
      try {
        await supabase.from('routine_tasks').delete().eq('id', taskId);
      } catch (e) {
        // ignore
      }
    }
  };

  const deleteMilestone = async (milestoneId: string) => {
    const updatedMilestones = state.milestones.filter((m) => m.id !== milestoneId);
    saveState({ ...state, milestones: updatedMilestones });
    if (supabaseUserId) {
      try {
        await supabase.from('milestones').delete().eq('id', milestoneId);
      } catch (e) {
        // ignore
      }
    }
  };

  const addBossQuest = (title: string, statTrained: StatKey, xpReward: number) => {
    const todayStr = getTodayDateString(new Date());
    const newBossQuest = {
      id: `boss-${Date.now()}`,
      title: title.trim(),
      statTrained,
      xpReward,
      weekOf: todayStr,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    const newState: GameState = {
      ...state,
      bossQuests: [newBossQuest, ...state.bossQuests],
      notifications: [
        {
          id: `notif-boss-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'BOSS QUEST INITIALIZED',
          message: `Weekly Boss Quest "${title}" assigned. 7-day deadline active.`,
          type: 'warning',
        },
        ...state.notifications,
      ],
    };

    saveState(newState);
  };

  const loadSeedPreset = (presetType: 'personal' | 'generic') => {
    const todayStr = getTodayDateString(new Date());
    const seed = presetType === 'personal' ? PERSONAL_SEED : GENERIC_PUBLIC_SEED;

    const newTasks = seed.routineTasks.map((st, idx) => buildRoutineTaskFromSeed(st, idx, todayStr));
    const newMilestones = seed.milestones.map((sm, idx) => buildMilestoneFromSeed(sm, idx));

    const newLogs: DailyLogEntry[] = newTasks
      .filter((t) => isTaskScheduledForDay(t.scheduleDays, todayStr))
      .map((t) => ({
        id: `log-${todayStr}-${t.id}`,
        date: todayStr,
        routineTaskId: t.id,
        status: 'pending',
        proof: null,
        completedAt: null,
      }));

    const newState: GameState = {
      ...state,
      tasks: newTasks,
      milestones: newMilestones,
      logs: newLogs,
      notifications: [
        {
          id: `notif-seed-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'ROUTINE PRESET LOADED',
          message: `Loaded ${presetType === 'personal' ? 'Personal Default' : 'Generic Starter'} seed dataset.`,
          type: 'info',
        },
        ...state.notifications,
      ],
    };

    saveState(newState);
  };

  const dismissNotification = (id: string) => {
    const filtered = state.notifications.filter((n) => n.id !== id);
    saveState({ ...state, notifications: filtered });
  };

  const resetAllData = () => {
    if (confirm('SYSTEM OVERRIDE: Reset all Hunter data and System protocol history?')) {
      storageAdapter.clearState();
      setState(defaultGameState);
    }
  };

  return (
    <HunterContext.Provider
      value={{
        state,
        isLoading,
        activeTab,
        setActiveTab,
        secondsUntilMidnight,
        proofModalLog,
        openProofModal,
        closeProofModal,
        completeOnboarding,
        submitProof,
        submitBossProof,
        completeMilestone,
        addTask,
        toggleTaskActive,
        deleteTask,
        deleteMilestone,
        addBossQuest,
        loadSeedPreset,
        isAdmin,
        loginWithUserSession,
        logoutUser,
        authenticateAdmin,
        logoutAdmin,
        enableNotifications,
        sendTestNotification,
        dismissNotification,
        resetAllData,
      }}
    >
      {children}
    </HunterContext.Provider>
  );
};

export const useHunter = () => {
  const context = useContext(HunterContext);
  if (!context) {
    throw new Error('useHunter must be used within a HunterProvider');
  }
  return context;
};

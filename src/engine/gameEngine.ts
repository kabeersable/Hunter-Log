import type {
  Hunter,
  DailyLogEntry,
  BossQuest,
  PenaltyRecord,
  GameState,
  RankType,
} from '../types/hunter';

export const INITIAL_STATS = {
  STR: 10,
  VIT: 10,
  INT: 10,
  PER: 10,
  WIL: 10,
};

export function createInitialHunter(name: string): Hunter {
  const today = getTodayDateString();
  return {
    name: name.trim(),
    level: 1,
    xp: 0,
    xpToNextLevel: 120, // 1 * 120
    rank: 'E',
    streak: 0,
    longestStreak: 0,
    coins: 0,
    stats: { ...INITIAL_STATS },
    penaltyZoneActive: false,
    penaltyZoneExpiresAt: null,
    rankFrozenUntil: null,
    lastProcessedDate: today,
    createdAt: new Date().toISOString(),
  };
}

export function getTodayDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDate(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return getTodayDateString(date);
}

export function isTaskScheduledForDay(scheduleDays: any, dateStr: string): boolean {
  if (!scheduleDays || scheduleDays === 'everyday') return true;

  const date = new Date(dateStr + 'T12:00:00');
  const dayIndex = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayShort = dayNames[dayIndex];

  if (scheduleDays === 'weekday') {
    return dayIndex >= 1 && dayIndex <= 5;
  }

  if (scheduleDays === 'weekend') {
    return dayIndex === 0 || dayIndex === 6;
  }

  if (Array.isArray(scheduleDays)) {
    return scheduleDays.map((d: string) => d.toLowerCase()).includes(dayShort);
  }

  return true;
}

export function calculateXpToNextLevel(level: number): number {
  return level * 120;
}

export function isRankFrozen(hunter: Hunter, now: Date = new Date()): boolean {
  if (!hunter.rankFrozenUntil) return false;
  return new Date(hunter.rankFrozenUntil) > now;
}

export function isPenaltyZoneActive(hunter: Hunter, now: Date = new Date()): boolean {
  if (!hunter.penaltyZoneActive || !hunter.penaltyZoneExpiresAt) return false;
  return new Date(hunter.penaltyZoneExpiresAt) > now;
}

/**
 * Calculates Rank based on Level, Streak, Clear history, Stats & Penalty history.
 * Rank conditions:
 * E: Level 1–9
 * D: Level 10–19 AND streak >= 7
 * C: Level 20–34 AND streak >= 14 AND zero missed Main Quests in last 14 days
 * B: Level 35–49 AND streak >= 21 AND at least 1 Boss Quest cleared
 * A: Level 50–74 AND streak >= 30 AND all stats > 40
 * S: Level 75+ AND streak >= 60 AND no penalty triggered in last 45 days
 */
export function calculateQualifiedRank(
  hunter: Hunter,
  penaltyRecords: PenaltyRecord[],
  bossQuests: BossQuest[],
  now: Date = new Date()
): RankType {
  const { level, streak, stats } = hunter;

  // Check 14-day missed main quests count
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const missedInLast14 = penaltyRecords.filter(
    (p) => p.type === 'missed_main_task' && new Date(p.date) >= fourteenDaysAgo
  ).length;

  // Check 45-day penalty count
  const fortyFiveDaysAgo = new Date(now);
  fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);
  const penaltiesInLast45 = penaltyRecords.filter(
    (p) => new Date(p.date) >= fortyFiveDaysAgo
  ).length;

  // Check cleared boss quests
  const clearedBossQuests = bossQuests.filter((b) => b.status === 'completed').length;

  // Check all stats > 40
  const allStatsOver40 = Object.values(stats).every((val) => val > 40);

  if (level >= 75 && streak >= 60 && penaltiesInLast45 === 0) return 'S';
  if (level >= 50 && streak >= 30 && allStatsOver40) return 'A';
  if (level >= 35 && streak >= 21 && clearedBossQuests >= 1) return 'B';
  if (level >= 20 && streak >= 14 && missedInLast14 === 0) return 'C';
  if (level >= 10 && streak >= 7) return 'D';

  return 'E';
}

export function awardXpAndCheckLevelUp(hunter: Hunter, amount: number): {
  hunter: Hunter;
  leveledUp: boolean;
  levelsGained: number;
} {
  let xp = hunter.xp + amount;
  let level = hunter.level;
  let xpToNextLevel = hunter.xpToNextLevel;
  let coins = hunter.coins;
  let levelsGained = 0;

  while (xp >= xpToNextLevel) {
    xp -= xpToNextLevel;
    level += 1;
    levelsGained += 1;
    xpToNextLevel = calculateXpToNextLevel(level);
    coins += level * 10;
  }

  const updatedHunter: Hunter = {
    ...hunter,
    level,
    xp,
    xpToNextLevel,
    coins,
  };

  return {
    hunter: updatedHunter,
    leveledUp: levelsGained > 0,
    levelsGained,
  };
}

/**
 * Process Midnight Rollover and Penalties for past un-evaluated days.
 */
export function processMidnightRollover(state: GameState, now: Date = new Date()): GameState {
  if (!state.hunter) return state;

  let hunter = { ...state.hunter };
  let logs = [...state.logs];
  let tasks = [...state.tasks];
  let bossQuests = [...state.bossQuests];
  let penaltyRecords = [...state.penaltyRecords];
  let notifications = [...state.notifications];

  const todayStr = getTodayDateString(now);
  const lastProcessed = hunter.lastProcessedDate || todayStr;

  // Clean up expired Penalty Zone
  if (hunter.penaltyZoneActive && hunter.penaltyZoneExpiresAt) {
    if (new Date(hunter.penaltyZoneExpiresAt) <= now) {
      hunter.penaltyZoneActive = false;
      hunter.penaltyZoneExpiresAt = null;
      notifications.unshift({
        id: `notif-${Date.now()}-pz-off`,
        timestamp: now.toISOString(),
        title: 'PENALTY ZONE EXPIRED',
        message: 'Side quests un-locked. System restrictions lifted.',
        type: 'info',
      });
    }
  }

  // Iterate days from lastProcessed up to (excluding) todayStr
  let currentDateCursor = lastProcessed;

  while (currentDateCursor < todayStr) {
    const targetDate = currentDateCursor;
    currentDateCursor = addDaysToDate(currentDateCursor, 1);

    // Check all active tasks for targetDate
    const activeTasksForDay = tasks.filter((t) => t.active && isTaskScheduledForDay(t.scheduleDays, targetDate));

    // Get or create log entries for targetDate
    let dayLogEntries = logs.filter((l) => l.date === targetDate);
    
    // If no log entries existed for past day, generate pending ones
    activeTasksForDay.forEach((task) => {
      const existing = dayLogEntries.find((l) => l.routineTaskId === task.id);
      if (!existing) {
        const newLog: DailyLogEntry = {
          id: `log-${targetDate}-${task.id}`,
          date: targetDate,
          routineTaskId: task.id,
          status: 'pending',
          proof: null,
          completedAt: null,
        };
        logs.push(newLog);
        dayLogEntries.push(newLog);
      }
    });

    let mainTasksFailedCountOnDay = 0;
    let mainTasksTotalCountOnDay = 0;

    // Evaluate pending main tasks for targetDate
    logs = logs.map((log) => {
      if (log.date !== targetDate) return log;
      const task = tasks.find((t) => t.id === log.routineTaskId);
      if (!task || task.type !== 'main') return log;

      mainTasksTotalCountOnDay += 1;

      if (log.status === 'pending') {
        mainTasksFailedCountOnDay += 1;
        
        // Main quest failed penalty
        const baseLoss = 20;
        const xpLoss = hunter.penaltyZoneActive ? baseLoss * 2 : baseLoss;

        hunter.xp = Math.max(0, hunter.xp - xpLoss);
        hunter.streak = 0; // Streak breaks immediately on 1 missed main task

        // Decrease stat trained (min 1)
        const currentStatVal = hunter.stats[task.statTrained] || 10;
        hunter.stats = {
          ...hunter.stats,
          [task.statTrained]: Math.max(1, currentStatVal - 1),
        };

        penaltyRecords.unshift({
          id: `pen-${Date.now()}-${log.id}`,
          date: targetDate,
          type: 'missed_main_task',
          details: `Failed Main Quest: "${task.title}". -${xpLoss} XP. ${task.statTrained} -1.`,
          xpLost: xpLoss,
        });

        notifications.unshift({
          id: `notif-${Date.now()}-${log.id}`,
          timestamp: now.toISOString(),
          title: 'QUEST FAILED',
          message: `Main Quest "${task.title}" failed on ${targetDate}. -${xpLoss} XP. Streak reset to 0.`,
          type: 'penalty',
        });

        return { ...log, status: 'failed' };
      }

      if (log.status === 'failed') {
        mainTasksFailedCountOnDay += 1;
      }

      return log;
    });

    // Check streak preservation for targetDate (only if no main tasks failed)
    if (mainTasksTotalCountOnDay > 0 && mainTasksFailedCountOnDay === 0) {
      // Check if all main tasks were actually completed
      const allMainCompleted = logs
        .filter((l) => l.date === targetDate)
        .every((l) => {
          const t = tasks.find((tk) => tk.id === l.routineTaskId);
          return t?.type !== 'main' || l.status === 'completed' || l.status === 'partial';
        });

      if (allMainCompleted) {
        hunter.streak += 1;
        if (hunter.streak > hunter.longestStreak) {
          hunter.longestStreak = hunter.streak;
        }
      }
    } else if (mainTasksFailedCountOnDay > 0) {
      hunter.streak = 0;
    }

    // Check 7-day rolling window for 3 missed main tasks
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const missedIn7Days = penaltyRecords.filter(
      (p) => p.type === 'missed_main_task' && new Date(p.date) >= sevenDaysAgo
    ).length;

    if (missedIn7Days >= 3) {
      const freezeUntil = new Date(now);
      freezeUntil.setDate(freezeUntil.getDate() + 7);
      hunter.rankFrozenUntil = freezeUntil.toISOString();

      penaltyRecords.unshift({
        id: `pen-${Date.now()}-freeze`,
        date: targetDate,
        type: 'rank_frozen',
        details: `3 missed Main Quests in 7 days. Rank frozen until ${getTodayDateString(freezeUntil)}.`,
        xpLost: 0,
      });

      notifications.unshift({
        id: `notif-${Date.now()}-freeze`,
        timestamp: now.toISOString(),
        title: 'RANK FROZEN',
        message: '3 Main Quests missed in 7 days. Rank elevation blocked for 7 days.',
        type: 'penalty',
      });
    }
  }

  // Evaluate expired Boss Quests
  bossQuests = bossQuests.map((bq) => {
    if (bq.status === 'pending') {
      const bqWeek = new Date(bq.weekOf);
      const daysDiff = (now.getTime() - bqWeek.getTime()) / (1000 * 3600 * 24);
      if (daysDiff >= 7) {
        // Boss quest expired!
        hunter.penaltyZoneActive = true;
        const penaltyEnd = new Date(now);
        penaltyEnd.setHours(penaltyEnd.getHours() + 24);
        hunter.penaltyZoneExpiresAt = penaltyEnd.toISOString();

        penaltyRecords.unshift({
          id: `pen-${Date.now()}-boss`,
          date: todayStr,
          type: 'missed_boss_quest',
          details: `Missed Boss Quest: "${bq.title}". 24-Hour Penalty Zone initiated.`,
          xpLost: 50,
        });

        notifications.unshift({
          id: `notif-${Date.now()}-boss`,
          timestamp: now.toISOString(),
          title: 'PENALTY ZONE ACTIVATED',
          message: `Boss Quest "${bq.title}" missed. Side quests disabled for 24 hours.`,
          type: 'penalty',
        });

        return { ...bq, status: 'failed' };
      }
    }
    return bq;
  });

  // Ensure logs exist for TODAY
  const activeTasksToday = tasks.filter((t) => t.active && isTaskScheduledForDay(t.scheduleDays, todayStr));
  activeTasksToday.forEach((task) => {
    const existing = logs.find((l) => l.date === todayStr && l.routineTaskId === task.id);
    if (!existing) {
      logs.push({
        id: `log-${todayStr}-${task.id}`,
        date: todayStr,
        routineTaskId: task.id,
        status: 'pending',
        proof: null,
        completedAt: null,
      });
    }
  });

  // Check Rank qualification (if not frozen)
  if (!isRankFrozen(hunter, now)) {
    const qualifiedRank = calculateQualifiedRank(hunter, penaltyRecords, bossQuests, now);
    if (qualifiedRank !== hunter.rank) {
      notifications.unshift({
        id: `notif-${Date.now()}-rank`,
        timestamp: now.toISOString(),
        title: 'RANK EVALUATION',
        message: `Rank updated from ${hunter.rank} to ${qualifiedRank}.`,
        type: 'rank_change',
      });
      hunter.rank = qualifiedRank;
    }
  }

  hunter.lastProcessedDate = todayStr;

  return {
    ...state,
    hunter,
    logs,
    tasks,
    bossQuests,
    penaltyRecords,
    notifications,
  };
}

/**
 * Complete a quest entry with mandatory proof
 */
export function completeDailyQuest(
  state: GameState,
  logId: string,
  proof: string,
  isPartial: boolean = false,
  now: Date = new Date()
): GameState {
  if (!state.hunter) return state;
  if (!proof || proof.trim().length === 0) {
    throw new Error('Mandatory proof required to mark quest complete.');
  }

  const logIndex = state.logs.findIndex((l) => l.id === logId);
  if (logIndex === -1) return state;

  const targetLog = state.logs[logIndex];
  const task = state.tasks.find((t) => t.id === targetLog.routineTaskId);
  if (!task) return state;

  // Check if penalty zone active for Side task
  if (task.type === 'side' && isPenaltyZoneActive(state.hunter, now)) {
    throw new Error('Penalty Zone Active: Side tasks are locked.');
  }

  const xpAward = isPartial ? Math.floor(task.xpReward / 2) : task.xpReward;
  const newStatus = isPartial ? 'partial' : 'completed';

  const updatedLog: DailyLogEntry = {
    ...targetLog,
    status: newStatus,
    proof: proof.trim(),
    completedAt: now.toISOString(),
  };

  const updatedLogs = [...state.logs];
  updatedLogs[logIndex] = updatedLog;

  // Stat boost on full completion
  let updatedHunter = { ...state.hunter };
  if (!isPartial) {
    const currentStat = updatedHunter.stats[task.statTrained] || 10;
    updatedHunter.stats = {
      ...updatedHunter.stats,
      [task.statTrained]: currentStat + 1,
    };
  }

  // Award XP & Check Level Up
  const xpResult = awardXpAndCheckLevelUp(updatedHunter, xpAward);
  updatedHunter = xpResult.hunter;

  let notifications = [...state.notifications];
  if (xpResult.leveledUp) {
    notifications.unshift({
      id: `notif-${Date.now()}-lvl`,
      timestamp: now.toISOString(),
      title: 'LEVEL UP',
      message: `Hunter reached Level ${updatedHunter.level}! Rewards granted.`,
      type: 'level_up',
    });
  }

  // Check Rank elevation if not frozen
  if (!isRankFrozen(updatedHunter, now)) {
    const qualifiedRank = calculateQualifiedRank(
      updatedHunter,
      state.penaltyRecords,
      state.bossQuests,
      now
    );
    if (qualifiedRank !== updatedHunter.rank) {
      notifications.unshift({
        id: `notif-${Date.now()}-rank`,
        timestamp: now.toISOString(),
        title: 'RANK EVALUATION',
        message: `Rank elevated to ${qualifiedRank}.`,
        type: 'rank_change',
      });
      updatedHunter.rank = qualifiedRank;
    }
  }

  notifications.unshift({
    id: `notif-${Date.now()}-comp`,
    timestamp: now.toISOString(),
    title: 'QUEST COMPLETED',
    message: `Quest "${task.title}" verified. +${xpAward} XP gained.`,
    type: 'info',
  });

  return {
    ...state,
    hunter: updatedHunter,
    logs: updatedLogs,
    notifications,
  };
}

/**
 * Complete weekly Boss Quest with proof
 */
export function completeBossQuest(
  state: GameState,
  bossQuestId: string,
  proof: string,
  now: Date = new Date()
): GameState {
  if (!state.hunter) return state;
  if (!proof || proof.trim().length === 0) {
    throw new Error('Mandatory proof required for Boss Quest.');
  }

  const index = state.bossQuests.findIndex((b) => b.id === bossQuestId);
  if (index === -1) return state;

  const bq = state.bossQuests[index];
  const updatedBossQuests = [...state.bossQuests];
  updatedBossQuests[index] = {
    ...bq,
    status: 'completed',
  };

  // Stat boost + XP
  let updatedHunter = { ...state.hunter };
  const currentStat = updatedHunter.stats[bq.statTrained] || 10;
  updatedHunter.stats = {
    ...updatedHunter.stats,
    [bq.statTrained]: currentStat + 3,
  };

  const xpResult = awardXpAndCheckLevelUp(updatedHunter, bq.xpReward);
  updatedHunter = xpResult.hunter;

  let notifications = [...state.notifications];
  notifications.unshift({
    id: `notif-${Date.now()}-boss-clear`,
    timestamp: now.toISOString(),
    title: 'BOSS QUEST CLEARED',
    message: `Boss Quest "${bq.title}" cleared! +${bq.xpReward} XP. ${bq.statTrained} +3.`,
    type: 'info',
  });

  // Re-check rank
  if (!isRankFrozen(updatedHunter, now)) {
    const qualifiedRank = calculateQualifiedRank(
      updatedHunter,
      state.penaltyRecords,
      updatedBossQuests,
      now
    );
    if (qualifiedRank !== updatedHunter.rank) {
      updatedHunter.rank = qualifiedRank;
    }
  }

  return {
    ...state,
    hunter: updatedHunter,
    bossQuests: updatedBossQuests,
    notifications,
  };
}

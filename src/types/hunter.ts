export type StatKey = 'STR' | 'VIT' | 'INT' | 'PER' | 'WIL';
export type RankType = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type QuestDifficulty = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type TaskType = 'main' | 'side';
export type LogStatus = 'pending' | 'completed' | 'failed' | 'partial';

export interface HunterStats {
  STR: number;
  VIT: number;
  INT: number;
  PER: number;
  WIL: number;
}

export interface Hunter {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;   // formula: level * 120
  rank: RankType;
  streak: number;
  longestStreak: number;
  coins: number;
  stats: HunterStats;      // all start at 10
  penaltyZoneActive: boolean;
  penaltyZoneExpiresAt: string | null;
  rankFrozenUntil: string | null;
  lastProcessedDate: string; // YYYY-MM-DD
  createdAt: string;
}

export type ScheduleDaysType = 'everyday' | 'weekday' | 'weekend' | string[];

export interface RoutineTask {
  id: string;
  title: string;           // e.g. "Workout 45 min", "No sugar"
  type: TaskType;          // main = non-negotiable, side = bonus/optional
  statTrained: StatKey;
  xpReward: number;
  difficulty: QuestDifficulty;
  target: string;          // e.g. "45 min", "20 pages"
  active: boolean;         // paused/retired but never deleted
  createdAt: string;
  scheduleDays?: ScheduleDaysType;
  timeSlot?: string;
}

export interface Milestone {
  id: string;
  title: string;
  cadence: 'monthly' | 'biweekly' | 'one-time';
  stat: StatKey | null;
  order?: number;
  unlocksAfter?: string;
  status: 'pending' | 'completed';
  completedAt?: string | null;
}

export interface DailyLogEntry {
  id: string;
  date: string;            // YYYY-MM-DD
  routineTaskId: string;
  status: LogStatus;
  proof: string | null;    // entered number/timestamp/result
  completedAt: string | null;
}

export interface BossQuest {
  id: string;
  title: string;
  statTrained: StatKey;
  xpReward: number;
  weekOf: string;          // start date of the week (YYYY-MM-DD)
  status: LogStatus;
  createdAt: string;
}

export interface PenaltyRecord {
  id: string;
  date: string;
  type: 'missed_main_task' | 'missed_boss_quest' | 'penalty_zone_active' | 'rank_frozen';
  details: string;
  xpLost: number;
}

export interface WeeklyReportData {
  weekId: string;
  startDate: string;
  endDate: string;
  completionRate: number;
  mainCompletedCount: number;
  mainFailedCount: number;
  statDeltas: Record<StatKey, number>;
  rankState: { rank: RankType; isFrozen: boolean };
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'warning' | 'penalty' | 'level_up' | 'rank_change' | 'info';
}

export interface GameState {
  hunter: Hunter | null;
  tasks: RoutineTask[];
  logs: DailyLogEntry[];
  bossQuests: BossQuest[];
  penaltyRecords: PenaltyRecord[];
  notifications: SystemNotification[];
  weeklyReports: WeeklyReportData[];
  milestones: Milestone[];
}

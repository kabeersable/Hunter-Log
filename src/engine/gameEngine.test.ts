import { describe, it, expect } from 'vitest';
import {
  createInitialHunter,
  awardXpAndCheckLevelUp,
  calculateQualifiedRank,
  processMidnightRollover,
  completeDailyQuest,
} from './gameEngine';
import type { GameState, RoutineTask } from '../types/hunter';

describe('Hunter Log Game Engine', () => {
  it('initializes hunter correctly with Level 1, 0 XP, and 120 xpToNextLevel', () => {
    const hunter = createInitialHunter('Sung Jin-Woo');
    expect(hunter.name).toBe('Sung Jin-Woo');
    expect(hunter.level).toBe(1);
    expect(hunter.xp).toBe(0);
    expect(hunter.xpToNextLevel).toBe(120);
    expect(hunter.rank).toBe('E');
    expect(hunter.stats.STR).toBe(10);
  });

  it('levels up with steep formula level * 120', () => {
    const hunter = createInitialHunter('Jin-Woo');
    // Gain 120 XP -> should reach Level 2 (120 XP to next level = 2 * 120 = 240)
    const result = awardXpAndCheckLevelUp(hunter, 120);
    expect(result.leveledUp).toBe(true);
    expect(result.hunter.level).toBe(2);
    expect(result.hunter.xp).toBe(0);
    expect(result.hunter.xpToNextLevel).toBe(240);
  });

  it('calculates rank progression correctly', () => {
    let hunter = createInitialHunter('Jin-Woo');
    expect(calculateQualifiedRank(hunter, [], [])).toBe('E');

    // D Rank: Level 10 AND streak >= 7
    hunter.level = 10;
    hunter.streak = 7;
    expect(calculateQualifiedRank(hunter, [], [])).toBe('D');

    // Without streak >= 7, stays E
    hunter.streak = 6;
    expect(calculateQualifiedRank(hunter, [], [])).toBe('E');
  });

  it('processes day rollover and applies penalties for pending Main tasks', () => {
    const hunter = createInitialHunter('Jin-Woo');
    hunter.lastProcessedDate = '2026-07-20';

    const mainTask: RoutineTask = {
      id: 'task-1',
      title: 'Workout 45 min',
      type: 'main',
      statTrained: 'STR',
      xpReward: 50,
      difficulty: 'D',
      target: '45 min',
      active: true,
      createdAt: '2026-07-20',
    };

    const initialLogs = [
      {
        id: 'log-2026-07-20-task-1',
        date: '2026-07-20',
        routineTaskId: 'task-1',
        status: 'pending' as const,
        proof: null,
        completedAt: null,
      },
    ];

    const state: GameState = {
      hunter,
      tasks: [mainTask],
      logs: initialLogs,
      bossQuests: [],
      penaltyRecords: [],
      notifications: [],
      weeklyReports: [],
    };

    // Simulate rollover to today 2026-07-21
    const today = new Date('2026-07-21T10:00:00Z');
    const newState = processMidnightRollover(state, today);

    // Main task pending on 2026-07-20 should have failed!
    const failedLog = newState.logs.find((l) => l.date === '2026-07-20');
    expect(failedLog?.status).toBe('failed');

    // Hunter streak should reset to 0, STR reduced by 1
    expect(newState.hunter?.streak).toBe(0);
    expect(newState.hunter?.stats.STR).toBe(9); // 10 - 1
    expect(newState.penaltyRecords.length).toBeGreaterThan(0);
  });

  it('enforces proof entry when completing quests', () => {
    const hunter = createInitialHunter('Jin-Woo');
    const mainTask: RoutineTask = {
      id: 'task-1',
      title: 'Read 20 pages',
      type: 'main',
      statTrained: 'INT',
      xpReward: 40,
      difficulty: 'E',
      target: '20 pages',
      active: true,
      createdAt: '2026-07-21',
    };

    const state: GameState = {
      hunter,
      tasks: [mainTask],
      logs: [
        {
          id: 'log-1',
          date: '2026-07-21',
          routineTaskId: 'task-1',
          status: 'pending',
          proof: null,
          completedAt: null,
        },
      ],
      bossQuests: [],
      penaltyRecords: [],
      notifications: [],
      weeklyReports: [],
    };

    // Attempt completion without proof -> should throw
    expect(() => completeDailyQuest(state, 'log-1', '')).toThrow();

    // Complete with valid proof -> succeeds, awards XP and boosts INT
    const newState = completeDailyQuest(state, 'log-1', 'Read Chapter 4 (22 pages)');
    expect(newState.hunter?.xp).toBe(40);
    expect(newState.hunter?.stats.INT).toBe(11);
  });
});

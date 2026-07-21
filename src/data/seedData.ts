import type { RoutineTask, Milestone, StatKey, TaskType } from '../types/hunter';

export interface SeedTask {
  title: string;
  type: TaskType;
  scheduleDays: 'everyday' | 'weekday' | 'weekend' | string[];
  stat: StatKey | null;
  target: string;
  timeSlot?: string;
}

export interface SeedMilestone {
  title: string;
  cadence: 'monthly' | 'biweekly' | 'one-time';
  stat: StatKey | null;
  order?: number;
  unlocksAfter?: string;
}

// User's Personal Default Seed Data
export const PERSONAL_SEED: { routineTasks: SeedTask[]; milestones: SeedMilestone[] } = {
  routineTasks: [
    { title: "No smoking", type: "main", scheduleDays: "everyday", stat: "WIL", target: "0 cigarettes" },
    { title: "Gym / strength training", type: "main", scheduleDays: "weekday", stat: "STR", target: "60 min", timeSlot: "17:30-18:30" },
    { title: "Gym", type: "main", scheduleDays: "weekend", stat: "STR", target: "60 min" },
    { title: "DSA / LeetCode", type: "main", scheduleDays: "weekday", stat: "INT", target: "3 problems", timeSlot: "19:00-20:00" },
    { title: "AI/ML or personal AI agent project", type: "main", scheduleDays: ["mon", "wed", "fri"], stat: "INT", target: "60-90 min", timeSlot: "20:15-21:30" },
    { title: "Java full stack learning/practice", type: "main", scheduleDays: ["tue", "thu"], stat: "INT", target: "60-90 min", timeSlot: "20:15-21:30" },
    { title: "Skincare + hair care routine", type: "main", scheduleDays: "everyday", stat: "VIT", target: "morning + night" },
    { title: "IELTS practice", type: "main", scheduleDays: "weekday", stat: "PER", target: "30 min", timeSlot: "21:45-22:15" },

    { title: "Certification module progress", type: "side", scheduleDays: "weekday", stat: "INT", target: "20-30 min" },
    { title: "Aptitude practice", type: "side", scheduleDays: "weekday", stat: "PER", target: "15-20 min" },
    { title: "Research paper reading/notes", type: "side", scheduleDays: "weekday", stat: "INT", target: "20 min" },
    { title: "Journal / reflection", type: "side", scheduleDays: "weekday", stat: "WIL", target: "5 lines" },

    { title: "Deep AI agent / project build session", type: "side", scheduleDays: "weekend", stat: "INT", target: "2-3 hrs" },
    { title: "Certification course", type: "side", scheduleDays: "weekend", stat: "INT", target: "1 hr" },
    { title: "Java full stack project work", type: "side", scheduleDays: "weekend", stat: "INT", target: "1-2 hrs" },
    { title: "Research paper writing session", type: "side", scheduleDays: "weekend", stat: "INT", target: "1 hr" },
    { title: "IELTS mock test", type: "side", scheduleDays: "weekend", stat: "PER", target: "1x per week" },
    { title: "Travel / free block", type: "side", scheduleDays: "weekend", stat: null, target: "protected" }
  ],

  milestones: [
    { title: "Complete 1 certification", cadence: "monthly", stat: "INT" },
    { title: "Research paper phase (outline -> draft -> submit)", cadence: "biweekly", stat: "INT" },
    { title: "Weight check-in", cadence: "biweekly", stat: "STR" },
    { title: "IELTS full mock exam", cadence: "biweekly", stat: "PER" },

    { title: "Java: Core Java (syntax, OOP, collections, exceptions)", cadence: "one-time", stat: "INT", order: 1 },
    { title: "Java: SQL / JDBC", cadence: "one-time", stat: "INT", order: 2, unlocksAfter: "Java: Core Java (syntax, OOP, collections, exceptions)" },
    { title: "Java: Spring Boot basics (REST APIs)", cadence: "one-time", stat: "INT", order: 3, unlocksAfter: "Java: SQL / JDBC" },
    { title: "Java: Frontend basics (HTML/CSS/JS + React or Angular)", cadence: "one-time", stat: "INT", order: 4, unlocksAfter: "Java: Spring Boot basics (REST APIs)" },
    { title: "Java: Full stack project 1", cadence: "one-time", stat: "INT", order: 5, unlocksAfter: "Java: Frontend basics (HTML/CSS/JS + React or Angular)" },
    { title: "Java: Full stack project 2 (portfolio piece)", cadence: "one-time", stat: "INT", order: 6, unlocksAfter: "Java: Full stack project 1" }
  ]
};

// Generic Starter Seed Data for Public / Shared Deploys
export const GENERIC_PUBLIC_SEED: { routineTasks: SeedTask[]; milestones: SeedMilestone[] } = {
  routineTasks: [
    { title: "Drink 8 glasses of water", type: "main", scheduleDays: "everyday", stat: "VIT", target: "8 glasses (2L)" },
    { title: "Exercise 20 minutes", type: "main", scheduleDays: "everyday", stat: "STR", target: "20 min" },
    { title: "Read 15 minutes", type: "main", scheduleDays: "everyday", stat: "INT", target: "15 min" },
    { title: "No phone after 10pm", type: "main", scheduleDays: "everyday", stat: "WIL", target: "10:00 PM" },
    { title: "Daily Journal", type: "side", scheduleDays: "everyday", stat: "PER", target: "5 min" }
  ],
  milestones: [
    { title: "Complete 14-day Habit Streak", cadence: "biweekly", stat: "WIL" },
    { title: "Monthly Fitness Milestone", cadence: "monthly", stat: "STR" }
  ]
};

export function buildRoutineTaskFromSeed(seed: SeedTask, index: number, createdDate: string): RoutineTask {
  return {
    id: `task-seed-${Date.now()}-${index}`,
    title: seed.title,
    type: seed.type,
    statTrained: seed.stat || 'WIL',
    xpReward: seed.type === 'main' ? 30 : 20,
    difficulty: seed.type === 'main' ? 'D' : 'E',
    target: seed.target,
    active: true,
    createdAt: createdDate,
    scheduleDays: seed.scheduleDays,
    timeSlot: seed.timeSlot,
  };
}

export function buildMilestoneFromSeed(seed: SeedMilestone, index: number): Milestone {
  return {
    id: `milestone-${Date.now()}-${index}`,
    title: seed.title,
    cadence: seed.cadence,
    stat: seed.stat,
    order: seed.order,
    unlocksAfter: seed.unlocksAfter,
    status: 'pending',
  };
}

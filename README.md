# HUNTER LOG — Daily System Protocol (Solo Leveling Routine PWA)

**Hunter Log** is a hardcore, gamified daily routine tracker inspired by *Solo Leveling's* System leveling mechanism. Unlike traditional habit trackers, difficulty and penalties are core System features designed to enforce non-negotiable personal routines every single day.

---

## ⚡ Key Game Mechanics & Rules

### 1. Fixed Daily Quests
- **Main Quests**: Non-negotiable daily tasks defined during setup (minimum 3 required). Every task requires a measurable **Target** (e.g. `"45 min workout"`, `"20 pages read"`, `"0g sugar"`). Uncompleted Main tasks automatically fail at midnight local time.
- **Side Quests**: Optional bonus habits. Earn extra XP and train stats.
- **Boss Quests**: Large weekly challenges with a 7-day deadline defined every Sunday.

---

## 📈 Leveling & XP Formula
- **XP to Next Level**: `level * 120` (Steep, hard curve).
  - Level 1: 120 XP
  - Level 2: 240 XP
  - Level 10: 1,200 XP
  - Level 50: 6,000 XP
- **Mandatory Proof**: Marking a quest complete requires entering numerical or result proof (e.g., `"Completed 45 mins at 7:30 AM"`).
- **Partial Completion**: Awards 50% XP and 0 stat boost.

---

## 💀 Automated Penalty Protocol
All penalties fire automatically at midnight local time during day rollover:

1. **Main Quest Failure**:
   - `-20 XP` penalty (deducted immediately, min 0 XP).
   - **Streak Reset**: Reset to `0 Days`.
   - **Stat Degradation**: The trained stat for that task drops by `-1` (min stat 1).
2. **Penalty Zone (Missed Boss Quest)**:
   - Activates a **24-Hour Penalty Zone**.
   - Side Quests are locked (grayed out, non-clickable).
   - Any Main Quest failure during Penalty Zone incurs **DOUBLE XP loss** (`-40 XP`).
3. **Rank Frozen State**:
   - Triggered by **3 missed Main Quests** in a rolling 7-day window.
   - Rank-up is strictly suspended for **7 days** (`rankFrozenUntil`), even if Level and Streak qualify.

---

## 🏆 Strict Rank Ladder

Rank elevation requires satisfying **BOTH** Level AND specific operational conditions:

| Rank | Required Level | Additional Conditions Required |
| :--- | :--- | :--- |
| **E** | Level 1–9 | Initial Awakening Rank |
| **D** | Level 10–19 | Streak >= 7 Days |
| **C** | Level 20–34 | Streak >= 14 Days **AND** 0 missed Main Quests in last 14 days |
| **B** | Level 35–49 | Streak >= 21 Days **AND** >= 1 Boss Quest cleared |
| **A** | Level 50–74 | Streak >= 30 Days **AND** All stats > 40 |
| **S** | Level 75+ | Streak >= 60 Days **AND** 0 penalties in last 45 days |

*Note: Rank elevation is blocked whenever `rankFrozenUntil` is active.*

---

## 🛠 Tuning & Configuration

The domain formulas and constants can be easily adjusted in [`src/engine/gameEngine.ts`](file:///c:/projects/SoloLeveling/src/engine/gameEngine.ts):

- **XP Curve**: Modify `calculateXpToNextLevel(level)`:
  ```ts
  export function calculateXpToNextLevel(level: number): number {
    return level * 120; // Adjust multiplier here
  }
  ```
- **Base Penalty XP Loss**: Adjust in `processMidnightRollover()`:
  ```ts
  const baseLoss = 20; // Base XP lost per failed main quest
  ```
- **Rank Ladder Conditions**: Modify `calculateQualifiedRank()`.

---

## 🚀 Technical Architecture

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
- **Design Aesthetic**: Dark mode, Solo Leveling System Window cyan (`#00f0ff`) & crimson red (`#ff2a5f`) glow effects, monospace stat typography, custom SVG 5-stat Radar Chart (STR, VIT, INT, PER, WIL), scanline texture.
- **Persistence Layer**: Decoupled storage adapter (`IStorageAdapter` -> `LocalStorageAdapter`) in [`src/storage/storageAdapter.ts`](file:///c:/projects/SoloLeveling/src/storage/storageAdapter.ts). Easily swappable for Supabase / SQLite.
- **PWA**: Service Worker caching, manifest.json, installable offline web application.

### Running Locally

```bash
# Install dependencies
npm install

# Run unit test suite
npx vitest run

# Start development server
npm run dev

# Build production PWA bundle
npm run build
```

import React from 'react';
import { useHunter } from '../context/HunterContext';
import { RadarChart } from '../components/RadarChart';
import { Flame, Shield, Award, AlertOctagon, Lock, Skull } from 'lucide-react';
import { isRankFrozen } from '../engine/gameEngine';
import type { RankType } from '../types/hunter';

const RANK_CONDITIONS: Record<RankType, string> = {
  E: 'Level 1–9',
  D: 'Level 10–19 AND Streak >= 7 days',
  C: 'Level 20–34 AND Streak >= 14 days AND 0 missed Main Quests in 14 days',
  B: 'Level 35–49 AND Streak >= 21 days AND >= 1 Boss Quest cleared',
  A: 'Level 50–74 AND Streak >= 30 days AND All Stats > 40',
  S: 'Level 75+ AND Streak >= 60 days AND 0 penalties in last 45 days',
};

export const DashboardScreen: React.FC = () => {
  const { state } = useHunter();
  const hunter = state.hunter;

  if (!hunter) return null;

  const frozen = isRankFrozen(hunter);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="system-box p-6 shadow-cyan-glow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-system-cyan/30">
          <div>
            <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
              [HUNTER STATUS FILE]
            </span>
            <h1 className="font-system font-black text-2xl text-slate-100 tracking-wider">
              {hunter.name.toUpperCase()}
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Protocol Registered: {new Date(hunter.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Rank Badge */}
            <div className="relative">
              <div
                className={`w-16 h-16 flex flex-col items-center justify-center font-system font-black text-2xl border-2 shadow-lg ${
                  frozen
                    ? 'border-red-500 bg-red-950/60 text-red-400 shadow-red-glow'
                    : hunter.rank === 'S'
                    ? 'border-amber-400 bg-amber-950/60 text-amber-300 shadow-gold-glow'
                    : hunter.rank === 'A'
                    ? 'border-purple-500 bg-purple-950/60 text-purple-300 shadow-purple-glow'
                    : 'border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-cyan-glow'
                }`}
              >
                <span>{hunter.rank}</span>
                <span className="text-[9px] tracking-widest opacity-80">RANK</span>
              </div>
              {frozen && (
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-300 flex items-center gap-0.5 shadow-md">
                  <Lock className="w-3 h-3" />
                  FROZEN
                </div>
              )}
            </div>

            {/* Level & Streak Stats */}
            <div className="space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">LEVEL:</span>
                <span className="font-system font-black text-slate-100 text-sm">{hunter.level}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">CURRENT STREAK:</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  {hunter.streak} Days
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">LONGEST STREAK:</span>
                <span className="text-slate-200 font-bold">{hunter.longestStreak} Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Level XP Bar */}
        <div className="mt-4 space-y-1">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-cyan-400 font-bold">XP PROGRESSION (LEVEL {hunter.level})</span>
            <span className="text-slate-300 font-bold">
              {hunter.xp} / {hunter.xpToNextLevel} XP ({Math.floor((hunter.xp / hunter.xpToNextLevel) * 100)}%)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-950 border border-slate-700 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-cyan-300 shadow-cyan-glow transition-all duration-500"
              style={{ width: `${Math.min(100, (hunter.xp / hunter.xpToNextLevel) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-500 block text-right pt-0.5">
            Next Level Formula: level * 120 XP
          </span>
        </div>
      </div>

      {/* Main Grid: Radar Chart & Stat Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="system-box p-5">
          <h3 className="font-system font-extrabold text-xs text-cyan-400 tracking-wider mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            [STAT RADAR MATRIX]
          </h3>
          <RadarChart stats={hunter.stats} size={280} />
        </div>

        {/* Rank Qualification Rules & Penalty Status */}
        <div className="space-y-4">
          <div className="system-box p-5 space-y-3">
            <h3 className="font-system font-extrabold text-xs text-cyan-400 tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4" />
              [RANK LADDER REQUIREMENTS]
            </h3>

            <div className="space-y-2 font-mono text-xs">
              {(['E', 'D', 'C', 'B', 'A', 'S'] as RankType[]).map((r) => {
                const isCurrent = hunter.rank === r;
                return (
                  <div
                    key={r}
                    className={`p-2.5 rounded border transition-all ${
                      isCurrent
                        ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300 font-bold shadow-cyan-glow'
                        : 'bg-system-bg border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-system font-black tracking-wider flex items-center gap-1.5">
                        RANK {r} {isCurrent && <span className="text-[10px] text-cyan-400">(ACTIVE)</span>}
                      </span>
                    </div>
                    <div className="text-[11px] opacity-90 leading-tight">{RANK_CONDITIONS[r]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Penalty Records Log */}
      <div className="system-box p-5">
        <h3 className="font-system font-extrabold text-xs text-red-400 tracking-wider mb-3 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4" />
          [SYSTEM PENALTY AUDIT LOG]
        </h3>

        {state.penaltyRecords.length === 0 ? (
          <div className="text-xs font-mono text-slate-500 italic p-3 bg-system-bg border border-slate-800 rounded">
            No penalty protocols recorded in System history. Flawless record.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {state.penaltyRecords.map((pen) => (
              <div
                key={pen.id}
                className="bg-red-950/20 border border-red-900/60 p-2.5 rounded flex items-center justify-between font-mono text-xs text-red-300"
              >
                <div className="space-y-0.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <Skull className="w-3.5 h-3.5 text-red-400" />
                    <span>{pen.details}</span>
                  </div>
                  <div className="text-[10px] text-red-400/70">
                    Timestamp: {new Date(pen.date).toLocaleDateString()}
                  </div>
                </div>
                {pen.xpLost > 0 && (
                  <div className="font-bold text-red-400 bg-red-950/80 px-2 py-0.5 border border-red-800 rounded shrink-0">
                    -{pen.xpLost} XP
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

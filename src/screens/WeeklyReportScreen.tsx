import React, { useState } from 'react';
import { useHunter } from '../context/HunterContext';
import type { StatKey } from '../types/hunter';
import { Award, Plus, Sparkles } from 'lucide-react';
import { getTodayDateString, isRankFrozen } from '../engine/gameEngine';

export const WeeklyReportScreen: React.FC = () => {
  const { state, addBossQuest } = useHunter();
  const [bossTitle, setBossTitle] = useState('');
  const [bossStat, setBossStat] = useState<StatKey>('STR');
  const [bossXp, setBossXp] = useState(150);
  const [showBossForm, setShowBossForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const hunter = state.hunter;
  if (!hunter) return null;

  const frozen = isRankFrozen(hunter);

  // Calculate 7-day completion rate metrics
  const last7DaysLogs = state.logs.filter((l) => {
    const logDate = new Date(l.date);
    const now = new Date();
    const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 7;
  });

  const totalLogs = last7DaysLogs.length;
  const completedLogs = last7DaysLogs.filter((l) => l.status === 'completed' || l.status === 'partial').length;
  const failedLogs = last7DaysLogs.filter((l) => l.status === 'failed').length;

  const completionRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 100;

  const handleCreateBoss = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bossTitle.trim()) {
      setErrorMsg('Boss Quest Title cannot be empty.');
      return;
    }
    addBossQuest(bossTitle.trim(), bossStat, bossXp);
    setBossTitle('');
    setShowBossForm(false);
    setErrorMsg('');
  };

  const activeBossQuest = state.bossQuests.find((b) => b.status === 'pending');

  return (
    <div className="space-y-6 pb-12">
      {/* System Weekly Report Header */}
      <div className="system-box p-6 shadow-cyan-glow space-y-4">
        <div className="flex items-center justify-between border-b border-system-cyan/30 pb-3">
          <div>
            <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase flex items-center gap-2">
              <Award className="w-4 h-4" />
              [SYSTEM EVALUATION AUDIT]
            </span>
            <h1 className="font-system font-black text-2xl text-slate-100 tracking-wider mt-1">
              WEEKLY HUNTER PERFORMANCE
            </h1>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-slate-400 block">EVALUATION DATE</span>
            <span className="text-cyan-300 font-bold">{getTodayDateString(new Date())}</span>
          </div>
        </div>

        {/* 7-Day Performance Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-system-bg p-3 border border-system-cyan/30 rounded text-center">
            <span className="text-slate-400 text-[10px] block">COMPLETION RATE</span>
            <span className="font-system font-extrabold text-2xl text-cyan-300">
              {completionRate}%
            </span>
          </div>

          <div className="bg-system-bg p-3 border border-green-500/30 rounded text-center">
            <span className="text-slate-400 text-[10px] block">QUESTS CLEARED</span>
            <span className="font-system font-extrabold text-2xl text-green-400">
              {completedLogs}
            </span>
          </div>

          <div className="bg-system-bg p-3 border border-red-500/30 rounded text-center">
            <span className="text-slate-400 text-[10px] block">QUESTS FAILED</span>
            <span className="font-system font-extrabold text-2xl text-red-400">
              {failedLogs}
            </span>
          </div>
        </div>

        {/* Rank Audit Summary */}
        <div className="bg-system-bg p-4 border border-slate-800 rounded font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-bold">CURRENT RANK STATUS:</span>
            <span className={`font-system font-extrabold ${frozen ? 'text-red-400' : 'text-cyan-300'}`}>
              RANK {hunter.rank} {frozen ? '(FROZEN)' : '(ACTIVE)'}
            </span>
          </div>

          {frozen ? (
            <p className="text-red-400 text-[11px] leading-relaxed">
              3 Main Quests missed in 7 days. Rank frozen until {new Date(hunter.rankFrozenUntil!).toLocaleDateString()}.
            </p>
          ) : (
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Rank status operational. Maintain 100% Main Quest execution to qualify for rank elevation.
            </p>
          )}
        </div>
      </div>

      {/* Weekly Boss Quest Creator Section */}
      <div className="system-box p-6 shadow-cyan-glow space-y-4">
        <div className="flex items-center justify-between border-b border-system-cyan/30 pb-3">
          <h2 className="font-system font-extrabold text-sm text-cyan-400 tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            [WEEKLY BOSS QUEST ASSIGNMENT]
          </h2>
          {!activeBossQuest && (
            <button
              onClick={() => setShowBossForm(!showBossForm)}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-system font-extrabold text-xs rounded transition-all shadow-cyan-glow flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              {showBossForm ? 'CANCEL' : 'DEFINE BOSS QUEST'}
            </button>
          )}
        </div>

        {activeBossQuest ? (
          <div className="bg-system-bg p-4 border border-red-500/40 rounded font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-400">ACTIVE BOSS QUEST:</span>
              <span className="text-amber-400 font-bold">+{activeBossQuest.xpReward} XP</span>
            </div>
            <div className="font-system font-bold text-slate-100 text-base">
              "{activeBossQuest.title}"
            </div>
            <p className="text-slate-400 text-[11px]">
              Stat Reward: <strong className="text-cyan-400">{activeBossQuest.statTrained} +3</strong> | Assigned: {new Date(activeBossQuest.createdAt).toLocaleDateString()}
            </p>
          </div>
        ) : showBossForm ? (
          <form onSubmit={handleCreateBoss} className="space-y-4 font-mono text-xs">
            <p className="text-slate-400 text-xs">
              Define ONE large, uncomfortable challenge with a 7-day deadline (e.g. "Run a 10k", "Publish open-source project", "Fast 24 hours").
            </p>

            <div>
              <label className="block text-slate-300 mb-1">BOSS QUEST TITLE:</label>
              <input
                type="text"
                value={bossTitle}
                onChange={(e) => setBossTitle(e.target.value)}
                placeholder="e.g. Complete 10km Marathon"
                className="w-full bg-system-bg border border-slate-700 p-2.5 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1">PRIMARY STAT TRAINED:</label>
                <select
                  value={bossStat}
                  onChange={(e) => setBossStat(e.target.value as StatKey)}
                  className="w-full bg-system-bg border border-slate-700 p-2.5 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
                >
                  <option value="STR">STR (Strength)</option>
                  <option value="VIT">VIT (Vitality)</option>
                  <option value="INT">INT (Intelligence)</option>
                  <option value="PER">PER (Perception)</option>
                  <option value="WIL">WIL (Willpower)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">XP REWARD (100 - 300):</label>
                <input
                  type="number"
                  value={bossXp}
                  onChange={(e) => setBossXp(Number(e.target.value))}
                  min={100}
                  max={300}
                  className="w-full bg-system-bg border border-slate-700 p-2.5 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-xs text-red-400 bg-red-950/60 p-2 rounded border border-red-800">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBossForm(false)}
                className="px-4 py-2 text-slate-400 hover:text-slate-200"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-system font-extrabold text-xs rounded shadow-cyan-glow"
              >
                INITIALIZE BOSS QUEST
              </button>
            </div>
          </form>
        ) : (
          <div className="text-xs font-mono text-slate-500 italic p-4 bg-system-bg border border-slate-800 rounded">
            No Boss Quest currently active for this week. Click 'DEFINE BOSS QUEST' to set your weekly challenge.
          </div>
        )}
      </div>
    </div>
  );
};

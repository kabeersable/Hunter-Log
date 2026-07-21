import React, { useState } from 'react';
import { useHunter } from '../context/HunterContext';
import { ProofModal } from '../components/ProofModal';
import { PenaltyBanner } from '../components/PenaltyBanner';
import { getTodayDateString, isPenaltyZoneActive } from '../engine/gameEngine';
import { Clock, ShieldAlert, CheckCircle2, AlertCircle, Award, Sparkles, Lock, ArrowRight } from 'lucide-react';
import type { QuestDifficulty } from '../types/hunter';

const DIFFICULTY_COLORS: Record<QuestDifficulty, string> = {
  E: 'border-slate-600 bg-slate-900 text-slate-300',
  D: 'border-blue-600 bg-blue-950 text-blue-300',
  C: 'border-cyan-500 bg-cyan-950 text-cyan-300 shadow-cyan-glow',
  B: 'border-purple-500 bg-purple-950 text-purple-300 shadow-purple-glow',
  A: 'border-red-500 bg-red-950 text-red-300 shadow-red-glow',
  S: 'border-amber-400 bg-amber-950 text-amber-300 shadow-gold-glow',
};

export const ChecklistScreen: React.FC = () => {
  const { state, secondsUntilMidnight, openProofModal, submitBossProof } = useHunter();
  const [bossProofInput, setBossProofInput] = useState('');
  const [selectedBossId, setSelectedBossId] = useState<string | null>(null);

  const hunter = state.hunter;
  if (!hunter) return null;

  const todayStr = getTodayDateString(new Date());
  const penaltyZone = isPenaltyZoneActive(hunter);

  // Format seconds until midnight to HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Get logs for today
  const todayLogs = state.logs.filter((l) => l.date === todayStr);

  // Separate tasks by Main & Side
  const activeMainTasks = state.tasks
    .filter((t) => t.active && t.type === 'main')
    .map((task) => {
      const log = todayLogs.find((l) => l.routineTaskId === task.id);
      return { task, log };
    });

  const activeSideTasks = state.tasks
    .filter((t) => t.active && t.type === 'side')
    .map((task) => {
      const log = todayLogs.find((l) => l.routineTaskId === task.id);
      return { task, log };
    });

  // Current active Boss Quest
  const activeBossQuest = state.bossQuests.find((b) => b.status === 'pending');

  const handleBossSubmit = (e: React.FormEvent, bossId: string) => {
    e.preventDefault();
    if (!bossProofInput.trim()) return;
    submitBossProof(bossId, bossProofInput);
    setBossProofInput('');
    setSelectedBossId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <PenaltyBanner />

      {/* Countdown Header Card */}
      <div className="system-box p-5 shadow-cyan-glow flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
            [DAILY SYSTEM EVALUATION]
          </span>
          <h1 className="font-system font-black text-xl text-slate-100 tracking-wider">
            TODAY'S QUEST PROTOCOL ({todayStr})
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Pending Main Quests auto-fail at midnight rollover (-20 XP, stat drop, streak reset).
          </p>
        </div>

        {/* Live Countdown Timer */}
        <div className="bg-system-bg border border-cyan-500/40 p-3 rounded text-center shrink-0 shadow-cyan-glow min-w-[170px]">
          <div className="text-[10px] font-mono text-cyan-400 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            TIME UNTIL ROLLOVER:
          </div>
          <div className="font-mono font-black text-2xl text-cyan-300 tracking-widest mt-0.5">
            {formatTime(secondsUntilMidnight)}
          </div>
        </div>
      </div>

      {/* Active Boss Quest Card (If Present) */}
      {activeBossQuest && (
        <div className="system-box-danger p-5 shadow-red-glow space-y-3">
          <div className="flex items-center justify-between border-b border-red-800 pb-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400 animate-bounce" />
              <span className="font-system font-black text-sm text-red-400 tracking-wider">
                [WEEKLY BOSS QUEST ACTIVE]
              </span>
            </div>
            <span className="text-xs font-mono text-gold-glow font-bold">
              +{activeBossQuest.xpReward} XP | {activeBossQuest.statTrained} +3
            </span>
          </div>

          <div className="font-system font-bold text-slate-100 text-lg">
            {activeBossQuest.title}
          </div>

          {selectedBossId === activeBossQuest.id ? (
            <form onSubmit={(e) => handleBossSubmit(e, activeBossQuest.id)} className="space-y-2 pt-1">
              <input
                type="text"
                value={bossProofInput}
                onChange={(e) => setBossProofInput(e.target.value)}
                placeholder="Enter mandatory proof of Boss Quest clearance..."
                className="w-full bg-system-bg border border-red-500/60 p-2.5 rounded font-mono text-xs text-slate-100 focus:outline-none focus:border-red-400"
                autoFocus
              />
              <div className="flex gap-2 justify-end font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedBossId(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-red-glow"
                >
                  CLEAR BOSS QUEST
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setSelectedBossId(activeBossQuest.id)}
              className="w-full py-2.5 bg-red-950 hover:bg-red-900 border border-red-500 text-red-300 font-system font-extrabold text-xs tracking-wider rounded transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              EXECUTE BOSS QUEST CLEARANCE
            </button>
          )}
        </div>
      )}

      {/* Main Quests Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-system-cyan/20 pb-2">
          <h2 className="font-system font-extrabold text-sm text-cyan-400 tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            [MAIN QUESTS - NON-NEGOTIABLE]
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {activeMainTasks.filter((item) => item.log?.status === 'completed' || item.log?.status === 'partial').length} / {activeMainTasks.length} Completed
          </span>
        </div>

        {activeMainTasks.length === 0 ? (
          <div className="text-xs font-mono text-slate-500 italic p-4 bg-system-bg border border-slate-800 rounded">
            No Main Quests active in System. Visit Manage Routine to add daily tasks.
          </div>
        ) : (
          <div className="space-y-3">
            {activeMainTasks.map(({ task, log }) => {
              const status = log?.status || 'pending';
              const isDone = status === 'completed' || status === 'partial';

              return (
                <div
                  key={task.id}
                  className={`system-box p-4 transition-all ${
                    isDone
                      ? 'border-green-500/40 bg-green-950/20'
                      : status === 'failed'
                      ? 'border-red-500/40 bg-red-950/20'
                      : 'hover:border-cyan-400/80 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!isDone && log) openProofModal(log);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {/* Difficulty Tag */}
                        <span className={`text-[10px] font-system font-bold px-1.5 py-0.5 rounded border ${DIFFICULTY_COLORS[task.difficulty]}`}>
                          RANK {task.difficulty}
                        </span>

                        <span className="font-system font-bold text-slate-100 text-base">
                          {task.title}
                        </span>

                        {task.timeSlot && (
                          <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 border border-amber-700/60 rounded">
                            {task.timeSlot}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-400 pt-1">
                        <span>Target: <strong className="text-cyan-300">{task.target}</strong></span>
                        <span>Trains: <strong className="text-cyan-400">{task.statTrained}</strong></span>
                        <span>Reward: <strong className="text-gold-glow">+{task.xpReward} XP</strong></span>
                      </div>

                      {log?.proof && (
                        <div className="text-[11px] font-mono text-green-400/90 bg-green-950/40 p-1.5 border border-green-800/60 rounded mt-2">
                          Proof Verified: "{log.proof}"
                        </div>
                      )}
                    </div>

                    {/* Status Button */}
                    <div className="shrink-0">
                      {status === 'completed' && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-950 border border-green-500 text-green-400 font-mono text-xs font-bold rounded">
                          <CheckCircle2 className="w-4 h-4" /> CLEARED
                        </span>
                      )}
                      {status === 'partial' && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950 border border-amber-500 text-amber-300 font-mono text-xs font-bold rounded">
                          <CheckCircle2 className="w-4 h-4" /> PARTIAL
                        </span>
                      )}
                      {status === 'failed' && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950 border border-red-500 text-red-400 font-mono text-xs font-bold rounded">
                          <AlertCircle className="w-4 h-4" /> FAILED
                        </span>
                      )}
                      {status === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (log) openProofModal(log);
                          }}
                          className="px-3.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/50 font-system font-bold text-xs rounded transition-all shadow-cyan-glow flex items-center gap-1"
                        >
                          VERIFY <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Side Quests Section */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="font-system font-extrabold text-sm text-purple-400 tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            [SIDE QUESTS - BONUS HABITS]
          </h2>
          {penaltyZone && (
            <span className="text-xs font-mono text-red-400 font-bold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> PENALTY ZONE LOCKED
            </span>
          )}
        </div>

        {activeSideTasks.length === 0 ? (
          <div className="text-xs font-mono text-slate-500 italic p-4 bg-system-bg border border-slate-800 rounded">
            No Side Quests defined.
          </div>
        ) : (
          <div className="space-y-3">
            {activeSideTasks.map(({ task, log }) => {
              const status = log?.status || 'pending';
              const isDone = status === 'completed' || status === 'partial';

              return (
                <div
                  key={task.id}
                  className={`system-box p-3.5 transition-all ${
                    penaltyZone
                      ? 'opacity-40 grayscale pointer-events-none bg-slate-950 border-slate-800'
                      : isDone
                      ? 'border-green-500/40 bg-green-950/20'
                      : 'hover:border-purple-400/80 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!penaltyZone && !isDone && log) openProofModal(log);
                  }}
                >
                  <div className="flex items-center justify-between gap-3 font-mono text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                        {penaltyZone && <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                        <span>{task.title}</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Target: <span className="text-purple-300">{task.target}</span> | +{task.xpReward} XP
                      </div>
                    </div>

                    {isDone ? (
                      <span className="text-green-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> CLEARED
                      </span>
                    ) : (
                      <button
                        disabled={penaltyZone}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!penaltyZone && log) openProofModal(log);
                        }}
                        className="px-3 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-500 text-purple-300 font-bold rounded"
                      >
                        VERIFY
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ProofModal />
    </div>
  );
};

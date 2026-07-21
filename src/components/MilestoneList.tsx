import React from 'react';
import { useHunter } from '../context/HunterContext';
import { Award, CheckCircle2, Lock, Sparkles, Target, Layers, Trash2 } from 'lucide-react';

export const MilestoneList: React.FC = () => {
  const { state, completeMilestone, deleteMilestone } = useHunter();
  const milestones = state.milestones || [];

  if (milestones.length === 0) return null;

  // Group milestones into recurring vs one-time progression sequence
  const recurringMilestones = milestones.filter((m) => m.cadence !== 'one-time');
  const sequenceMilestones = milestones
    .filter((m) => m.cadence === 'one-time')
    .sort((a, b) => (a.order || 99) - (b.order || 99));

  // Helper to check if a sequence milestone is unlocked
  const isUnlocked = (m: typeof sequenceMilestones[0]) => {
    if (!m.unlocksAfter) return true;
    const prv = milestones.find((x) => x.title === m.unlocksAfter);
    return prv ? prv.status === 'completed' : true;
  };

  return (
    <div className="space-y-6 pt-4 border-t border-slate-800">
      <div className="flex items-center justify-between border-b border-system-cyan/30 pb-2">
        <h2 className="font-system font-black text-sm text-cyan-400 tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4" />
          [SYSTEM MILESTONES & PROGRESSION PATH]
        </h2>
        <span className="font-mono text-xs text-slate-400">
          {milestones.filter((m) => m.status === 'completed').length} / {milestones.length} Unlocked
        </span>
      </div>

      {/* One-Time Sequence Milestones (e.g. Java Fullstack Roadmap) */}
      {sequenceMilestones.length > 0 && (
        <div className="system-box p-4 space-y-3">
          <h3 className="font-system font-extrabold text-xs text-purple-400 tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            [SEQUENTIAL MASTERY ROADMAP]
          </h3>

          <div className="space-y-2.5">
            {sequenceMilestones.map((m) => {
              const unlocked = isUnlocked(m);
              const isDone = m.status === 'completed';

              return (
                <div
                  key={m.id}
                  className={`p-3 rounded border font-mono text-xs transition-all ${
                    isDone
                      ? 'bg-green-950/30 border-green-500/50 text-green-300'
                      : !unlocked
                      ? 'bg-slate-950/80 border-slate-800 text-slate-500 opacity-60'
                      : 'bg-system-bg border-cyan-500/40 text-slate-100 shadow-cyan-glow'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm flex items-center gap-2">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                        ) : !unlocked ? (
                          <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
                        )}
                        <span>{m.title}</span>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        {m.order && <span className="text-cyan-400 font-bold mr-2">Step {m.order}</span>}
                        {m.stat && <span>Stat Boost: <strong className="text-cyan-300">{m.stat} +2</strong> | </span>}
                        <span>Reward: <strong>+50 XP</strong></span>
                        {m.unlocksAfter && !isDone && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5">
                            Unlocks after: "{m.unlocksAfter}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <span className="px-2.5 py-1 bg-green-950 border border-green-500 text-green-400 text-[10px] font-bold rounded">
                          CLEARED
                        </span>
                      ) : !unlocked ? (
                        <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-600 text-[10px] font-bold rounded flex items-center gap-1">
                          <Lock className="w-3 h-3" /> LOCKED
                        </span>
                      ) : (
                        <button
                          onClick={() => completeMilestone(m.id)}
                          className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-system font-extrabold text-xs rounded shadow-cyan-glow transition-all"
                        >
                          CLAIM MILESTONE
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`Delete milestone "${m.title}"?`)) {
                            deleteMilestone(m.id);
                          }
                        }}
                        className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                        title="Delete milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recurring Cadence Milestones (Biweekly / Monthly) */}
      {recurringMilestones.length > 0 && (
        <div className="system-box p-4 space-y-3">
          <h3 className="font-system font-extrabold text-xs text-gold-glow tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            [RECURRING CADENCE MILESTONES]
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recurringMilestones.map((m) => {
              const isDone = m.status === 'completed';

              return (
                <div
                  key={m.id}
                  className={`p-3 rounded border font-mono text-xs transition-all ${
                    isDone
                      ? 'bg-green-950/30 border-green-500/50 text-green-300'
                      : 'bg-system-bg border-amber-500/40 text-slate-100 shadow-gold-glow'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-950 border border-amber-700 text-amber-300">
                        {m.cadence}
                      </span>
                      <div className="flex items-center gap-2">
                        {m.stat && <span className="text-cyan-400 font-bold">{m.stat} +2</span>}
                        <button
                          onClick={() => {
                            if (confirm(`Delete milestone "${m.title}"?`)) {
                              deleteMilestone(m.id);
                            }
                          }}
                          className="text-slate-500 hover:text-red-400 p-0.5 transition-colors"
                          title="Delete milestone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="font-bold text-sm text-slate-100">{m.title}</div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">+50 XP Reward</span>
                      {isDone ? (
                        <span className="text-green-400 font-bold text-[10px]">CLAIMED</span>
                      ) : (
                        <button
                          onClick={() => completeMilestone(m.id)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded"
                        >
                          CLAIM
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

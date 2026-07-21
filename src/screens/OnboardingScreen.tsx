import React, { useState } from 'react';
import { useHunter } from '../context/HunterContext';
import type { StatKey } from '../types/hunter';
import { Shield, Plus, Trash2, CheckCircle2, AlertTriangle, Sparkles, UserCheck, Globe } from 'lucide-react';
import { AdminAuthModal } from '../components/AdminAuthModal';

const PRESET_SUGGESTIONS: { title: string; target: string; stat: StatKey }[] = [
  { title: 'Morning Workout', target: '45 min', stat: 'STR' },
  { title: 'Read Technical Book', target: '20 pages', stat: 'INT' },
  { title: 'No Refined Sugar', target: '0g sugar', stat: 'VIT' },
  { title: 'Deep Work Session', target: '2 hours', stat: 'WIL' },
  { title: 'Mindfulness / Focus', target: '15 min', stat: 'PER' },
];

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding, isAdmin } = useHunter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [presetChoice, setPresetChoice] = useState<'personal' | 'generic' | 'custom'>('generic');
  const [showAdminModal, setShowAdminModal] = useState(false);
  
  // Tasks setup
  const [mainTasks, setMainTasks] = useState<{ title: string; target: string; statTrained: StatKey }[]>([
    { title: 'No smoking', target: '0 cigarettes', statTrained: 'WIL' },
    { title: 'Gym / strength training', target: '60 min', statTrained: 'STR' },
    { title: 'DSA / LeetCode', target: '3 problems', statTrained: 'INT' },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTarget, setNewTaskTarget] = useState('');
  const [newTaskStat, setNewTaskStat] = useState<StatKey>('STR');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddMainTask = () => {
    if (!newTaskTitle.trim()) {
      setErrorMsg('Task title cannot be empty.');
      return;
    }
    if (!newTaskTarget.trim()) {
      setErrorMsg('Mandatory target required (e.g. "45 min", "20 pages", "0g sugar").');
      return;
    }
    setErrorMsg('');
    setMainTasks([
      ...mainTasks,
      { title: newTaskTitle.trim(), target: newTaskTarget.trim(), statTrained: newTaskStat },
    ]);
    setNewTaskTitle('');
    setNewTaskTarget('');
  };

  const handleRemoveTask = (index: number) => {
    setMainTasks(mainTasks.filter((_, i) => i !== index));
  };

  const handlePresetClick = (preset: { title: string; target: string; stat: StatKey }) => {
    setMainTasks([
      ...mainTasks,
      { title: preset.title, target: preset.target, statTrained: preset.stat },
    ]);
  };

  const handleFinishOnboarding = () => {
    if (!name.trim()) {
      setErrorMsg('Hunter Name is required.');
      return;
    }

    if (presetChoice === 'personal') {
      completeOnboarding(name, undefined, 'personal');
    } else if (presetChoice === 'generic') {
      completeOnboarding(name, undefined, 'generic');
    } else {
      if (mainTasks.length < 3) {
        setErrorMsg('System Protocol requires a MINIMUM of 3 Main Quests before activation.');
        return;
      }
      completeOnboarding(name, mainTasks);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-system-bg relative overflow-hidden">
      {/* Background glowing ambient light */}
      <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -bottom-20 -right-20 pointer-events-none" />

      <div className="system-box w-full max-w-xl p-6 sm:p-8 shadow-cyan-glow relative z-10">
        {step === 1 ? (
          /* Step 1: Hunter Awakening */
          <div className="space-y-6 text-center">
            <div className="inline-flex p-3 bg-cyan-950/60 border border-cyan-500/40 rounded-full text-cyan-400 mb-2 shadow-cyan-glow">
              <Shield className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
                [SYSTEM NOTIFICATION]
              </span>
              <h1 className="font-system font-black text-2xl sm:text-3xl text-slate-100 tracking-wider">
                HUNTER AWAKENING
              </h1>
              <p className="text-xs font-mono text-slate-400 max-w-md mx-auto leading-relaxed">
                You have been chosen by the System. Initialize your identity to construct your daily protocol.
              </p>
            </div>

            <div className="text-left space-y-2 pt-2 font-mono text-xs">
              <label className="block text-slate-300 font-bold">
                HUNTER DESIGNATION (NAME):
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter your name (e.g. Sung Jin-Woo)"
                className="w-full bg-system-bg border border-system-cyan/40 p-3.5 rounded text-base text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-600"
              />
            </div>

            {/* Preset Selection Options */}
            <div className="text-left space-y-2.5 pt-2 font-mono text-xs">
              <label className="block text-slate-300 font-bold">
                SELECT INITIAL ROUTINE SEED:
              </label>

              <div className="space-y-2">
                <div
                  onClick={() => {
                    if (!isAdmin) {
                      setShowAdminModal(true);
                      return;
                    }
                    setPresetChoice('personal');
                  }}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    presetChoice === 'personal'
                      ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300 shadow-cyan-glow'
                      : 'bg-system-bg border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-cyan-400" />
                      {isAdmin ? 'MY PERSONAL MASTER ROUTINE' : '🔒 MY PERSONAL ROUTINE (ADMIN LOCKED)'}
                    </span>
                    <span className="text-[10px] bg-cyan-950 px-2 py-0.5 border border-cyan-800 rounded">
                      {isAdmin ? 'UNLOCKED' : 'PASSCODE REQUIRED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isAdmin
                      ? 'Pre-loaded with Gym, DSA/LeetCode, AI/ML, Java Full Stack, Skincare, IELTS, and Milestones.'
                      : 'Protected personal routine. Enter Admin passcode (1337) to unlock.'}
                  </p>
                </div>

                <div
                  onClick={() => setPresetChoice('generic')}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    presetChoice === 'generic'
                      ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300 shadow-cyan-glow'
                      : 'bg-system-bg border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-purple-400" />
                      GENERIC PUBLIC STARTER ROUTINE
                    </span>
                    <span className="text-[10px] bg-purple-950 px-2 py-0.5 border border-purple-800 rounded">
                      Sample Data
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sample tasks: Water intake, 20-min exercise, 15-min reading, no phone after 10pm. Clean starting point for others.
                  </p>
                </div>

                <div
                  onClick={() => setPresetChoice('custom')}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    presetChoice === 'custom'
                      ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300 shadow-cyan-glow'
                      : 'bg-system-bg border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm">
                    MANUAL CUSTOM BUILDER
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Manually define your own Main Quests step-by-step.
                  </p>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="text-xs font-mono text-red-400 bg-red-950/50 border border-red-800 p-2.5 rounded">
                {errorMsg}
              </div>
            )}

            <button
              onClick={() => {
                if (!name.trim()) {
                  setErrorMsg('Hunter Name is required.');
                  return;
                }
                setErrorMsg('');
                if (presetChoice === 'custom') {
                  setStep(2);
                } else {
                  handleFinishOnboarding();
                }
              }}
              className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-system font-extrabold text-sm tracking-wider rounded shadow-cyan-glow transition-all flex items-center justify-center gap-2"
            >
              INITIALIZE PROTOCOL →
            </button>
          </div>
        ) : (
          /* Step 2: Custom Routine Setup */
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
                [STEP 2: ROUTINE SETUP]
              </span>
              <h2 className="font-system font-black text-xl text-slate-100 tracking-wider mt-1">
                DEFINE MAIN DAILY QUESTS
              </h2>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Main Quests repeat daily. Minimum 3 required.
              </p>
            </div>

            {/* Current Main Tasks List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span>CONFIGURED MAIN QUESTS ({mainTasks.length}/3 Min):</span>
                {mainTasks.length >= 3 && (
                  <span className="text-green-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> REQUIRED MINIMUM MET
                  </span>
                )}
              </div>

              {mainTasks.map((t, idx) => (
                <div
                  key={idx}
                  className="bg-system-bg p-3 border border-system-cyan/30 rounded flex items-center justify-between font-mono text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-100 text-sm">{t.title}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Target: <span className="text-cyan-300 font-bold">{t.target}</span> | Stat: <span className="text-cyan-400 font-bold">{t.statTrained}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveTask(idx)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    title="Remove Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Form to Add New Task */}
            <div className="bg-slate-900/80 p-3.5 border border-slate-800 rounded space-y-3">
              <div className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> ADD ANOTHER MAIN QUEST:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">TASK TITLE:</label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Study Coding"
                    className="w-full bg-system-bg border border-slate-700 p-2 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">MEASURABLE TARGET:</label>
                  <input
                    type="text"
                    value={newTaskTarget}
                    onChange={(e) => setNewTaskTarget(e.target.value)}
                    placeholder="e.g. 2 hours"
                    className="w-full bg-system-bg border border-slate-700 p-2 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">STAT TRAINED:</span>
                  <select
                    value={newTaskStat}
                    onChange={(e) => setNewTaskStat(e.target.value as StatKey)}
                    className="bg-system-bg border border-slate-700 text-cyan-300 font-mono text-xs p-1.5 rounded focus:outline-none focus:border-cyan-400"
                  >
                    <option value="STR">STR (Strength)</option>
                    <option value="VIT">VIT (Vitality)</option>
                    <option value="INT">INT (Intelligence)</option>
                    <option value="PER">PER (Perception)</option>
                    <option value="WIL">WIL (Willpower)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAddMainTask}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/40 rounded font-mono text-xs transition-all"
                >
                  + ADD QUEST
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 block mb-1.5">QUICK SUGGESTIONS:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SUGGESTIONS.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => handlePresetClick(preset)}
                    className="text-[11px] font-mono bg-system-bg border border-slate-800 hover:border-cyan-500/50 px-2.5 py-1 rounded text-slate-300 transition-colors"
                  >
                    + {preset.title} ({preset.target})
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="text-xs font-mono text-red-400 bg-red-950/50 border border-red-800 p-2.5 rounded flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Finish Action */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 text-xs font-mono text-slate-400 hover:text-slate-200"
              >
                ← BACK
              </button>
              <button
                onClick={handleFinishOnboarding}
                className="flex-1 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-system font-extrabold text-sm tracking-wider rounded shadow-cyan-glow transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                ACTIVATE SYSTEM PROTOCOL
              </button>
            </div>
          </div>
        )}
      </div>

      <AdminAuthModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSuccess={() => setPresetChoice('personal')}
      />
    </div>
  );
};

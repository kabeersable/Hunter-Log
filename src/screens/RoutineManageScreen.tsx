import React, { useState } from 'react';
import { useHunter } from '../context/HunterContext';
import type { StatKey, TaskType, QuestDifficulty } from '../types/hunter';
import { MilestoneList } from '../components/MilestoneList';
import { AdminAuthModal } from '../components/AdminAuthModal';
import { Layers, Plus, Pause, Play, Info, UserCheck, Globe } from 'lucide-react';

export const RoutineManageScreen: React.FC = () => {
  const { state, addTask, toggleTaskActive, loadSeedPreset, isAdmin } = useHunter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [type, setType] = useState<TaskType>('main');
  const [statTrained, setStatTrained] = useState<StatKey>('STR');
  const [difficulty] = useState<QuestDifficulty>('E');
  const [xpReward] = useState(30);
  const [scheduleDays, setScheduleDays] = useState<string>('everyday');
  const [timeSlot, setTimeSlot] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Task Title cannot be empty.');
      return;
    }
    if (!target.trim()) {
      setErrorMsg('Mandatory Target required (e.g. "45 min", "20 pages", "0g sugar").');
      return;
    }

    addTask({
      title: title.trim(),
      target: target.trim(),
      type,
      statTrained,
      difficulty,
      xpReward,
      scheduleDays: scheduleDays === 'everyday' || scheduleDays === 'weekday' || scheduleDays === 'weekend' ? scheduleDays : scheduleDays.split(',').map((s) => s.trim()),
      timeSlot: timeSlot.trim() || undefined,
    });

    setTitle('');
    setTarget('');
    setTimeSlot('');
    setShowAddForm(false);
    setErrorMsg('');
  };

  const activeMainCount = state.tasks.filter((t) => t.active && t.type === 'main').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Info */}
      <div className="system-box p-5 shadow-cyan-glow space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            [SYSTEM ROUTINE CONFIGURATION]
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!isAdmin) {
                  setShowAdminModal(true);
                  return;
                }
                if (confirm('Load Personal Routine Seed dataset? This will update active tasks and milestones.')) {
                  loadSeedPreset('personal');
                }
              }}
              className="px-2.5 py-1.5 bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:text-white font-mono text-xs rounded transition-all flex items-center gap-1"
              title="Load personal master routine dataset (Admin Only)"
            >
              <UserCheck className="w-3.5 h-3.5" /> {isAdmin ? 'LOAD MY SEED' : '🔒 MASTER SEED'}
            </button>

            <button
              onClick={() => {
                if (confirm('Load Generic Public Starter dataset? This will update active tasks with sample data.')) {
                  loadSeedPreset('generic');
                }
              }}
              className="px-2.5 py-1.5 bg-purple-950 border border-purple-500/40 text-purple-300 hover:text-white font-mono text-xs rounded transition-all flex items-center gap-1"
              title="Load generic public starter dataset"
            >
              <Globe className="w-3.5 h-3.5" /> LOAD STARTER SEED
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-system font-bold text-xs rounded transition-all shadow-cyan-glow"
            >
              <Plus className="w-4 h-4" />
              {showAddForm ? 'CANCEL' : 'CONFIGURE QUEST'}
            </button>
          </div>
        </div>

        <h1 className="font-system font-black text-xl text-slate-100 tracking-wider">
          MANAGE ROUTINE QUESTS & SCHEDULE
        </h1>

        <div className="flex items-center gap-2 text-xs font-mono text-amber-300 bg-amber-950/40 p-2.5 border border-amber-800 rounded">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            Routine tasks repeat according to their schedule (everyday, weekdays, weekends, or specific days). Minimum 3 Main Quests required.
          </span>
        </div>
      </div>

      {/* Form: Add New Task */}
      {showAddForm && (
        <form onSubmit={handleCreateTask} className="system-box p-5 space-y-4 shadow-cyan-glow">
          <h3 className="font-system font-extrabold text-sm text-cyan-400 tracking-wider">
            [CREATE ROUTINE QUEST]
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="block text-slate-300 mb-1">QUEST TITLE (Required):</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Morning Pushups"
                className="w-full bg-system-bg border border-slate-700 p-2.5 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">MEASURABLE TARGET (Required):</label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. 50 reps, 45 min, 20 pages"
                className="w-full bg-system-bg border border-slate-700 p-2.5 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">SCHEDULE DAYS:</label>
              <select
                value={scheduleDays}
                onChange={(e) => setScheduleDays(e.target.value)}
                className="w-full bg-system-bg border border-slate-700 p-2.5 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                <option value="everyday">Everyday</option>
                <option value="weekday">Weekdays (Mon-Fri)</option>
                <option value="weekend">Weekends (Sat-Sun)</option>
                <option value="mon,wed,fri">Mon, Wed, Fri</option>
                <option value="tue,thu">Tue, Thu</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">TIME SLOT (Optional):</label>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="e.g. 19:00-20:00"
                className="w-full bg-system-bg border border-slate-700 p-2.5 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">QUEST TYPE:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full bg-system-bg border border-slate-700 p-2.5 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                <option value="main">MAIN (Non-negotiable, penalty on fail)</option>
                <option value="side">SIDE (Bonus habit, optional)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">STAT TRAINED:</label>
              <select
                value={statTrained}
                onChange={(e) => setStatTrained(e.target.value as StatKey)}
                className="w-full bg-system-bg border border-slate-700 p-2.5 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                <option value="STR">STR (Strength)</option>
                <option value="VIT">VIT (Vitality)</option>
                <option value="INT">INT (Intelligence)</option>
                <option value="PER">PER (Perception)</option>
                <option value="WIL">WIL (Willpower)</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs font-mono text-red-400 bg-red-950/60 border border-red-800 p-2.5 rounded">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-system font-extrabold text-xs rounded shadow-cyan-glow"
            >
              REGISTER QUEST
            </button>
          </div>
        </form>
      )}

      {/* Active Tasks List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-2">
          <span className="text-cyan-400 font-bold">CONFIGURED ROUTINE TASKS ({state.tasks.length})</span>
          <span className="text-slate-400">Active Main Quests: {activeMainCount} (Min 3)</span>
        </div>

        {state.tasks.map((task) => (
          <div
            key={task.id}
            className={`system-box p-4 flex items-center justify-between gap-4 font-mono text-xs ${
              !task.active ? 'opacity-50 grayscale bg-slate-950' : ''
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-1.5 py-0.5 rounded font-system font-bold text-[10px] ${
                    task.type === 'main'
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                      : 'bg-purple-950 text-purple-400 border border-purple-500/40'
                  }`}
                >
                  {task.type.toUpperCase()}
                </span>
                <span className="font-system font-bold text-slate-100 text-sm">{task.title}</span>
                {task.timeSlot && (
                  <span className="text-[10px] text-amber-300 bg-amber-950/60 px-1.5 py-0.5 border border-amber-800 rounded">
                    {task.timeSlot}
                  </span>
                )}
              </div>
              <div className="text-slate-400 text-[11px]">
                Target: <strong className="text-cyan-300">{task.target}</strong> | Schedule: <strong className="text-purple-300">{Array.isArray(task.scheduleDays) ? task.scheduleDays.join(', ') : task.scheduleDays || 'everyday'}</strong> | Stat: <strong className="text-cyan-400">{task.statTrained}</strong>
              </div>
            </div>

            <button
              onClick={() => {
                if (task.active && task.type === 'main' && activeMainCount <= 3) {
                  alert('SYSTEM REQUIREMENT: Minimum 3 active Main Quests required.');
                  return;
                }
                toggleTaskActive(task.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs transition-all ${
                task.active
                  ? 'bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 border border-slate-700'
                  : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              {task.active ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> PAUSE
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> ACTIVATE
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Milestones Section */}
      <MilestoneList />

      <AdminAuthModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} />
    </div>
  );
};

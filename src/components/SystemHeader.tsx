import React, { useState } from 'react';
import { useHunter } from '../context/HunterContext';
import { AdminAuthModal } from './AdminAuthModal';
import { Flame, Shield, Award, Coins, RotateCcw, AlertTriangle, Layers, CalendarCheck, Bell, LogOut } from 'lucide-react';
import { isRankFrozen } from '../engine/gameEngine';

export const SystemHeader: React.FC = () => {
  const { state, activeTab, setActiveTab, resetAllData, sendTestNotification, isAdmin, logoutUser } = useHunter();
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const hunter = state.hunter;

  if (!hunter) return null;

  const frozen = isRankFrozen(hunter);

  return (
    <>
      <header className="sticky top-0 z-40 bg-system-bg/95 backdrop-blur-md border-b border-system-cyan/30 shadow-cyan-glow">
        <div className="max-w-4xl mx-auto px-3 py-2 sm:px-4 sm:py-2.5">
          {/* Top Info Bar */}
          <div className="flex items-center justify-between text-xs font-mono mb-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <button
                onClick={() => setShowAdminAuthModal(true)}
                className="text-cyan-400 font-bold tracking-wider hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-default text-[11px] sm:text-xs"
                title=""
              >
                <span>[SYSTEM ONLINE]</span>
                {isAdmin && <span className="text-[10px] text-cyan-400 font-extrabold">•</span>}
              </button>
              <span className="text-slate-500 hidden sm:inline">|</span>
              <span className="text-slate-300 font-semibold hidden sm:inline truncate max-w-[100px] sm:max-w-none">{hunter.name}</span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Coins */}
              <div className="flex items-center gap-1 text-gold-glow font-bold text-[11px] sm:text-xs">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{hunter.coins} G</span>
              </div>

              {/* Streak */}
              <div className={`flex items-center gap-1 font-bold text-[11px] sm:text-xs ${hunter.streak > 0 ? 'text-amber-400 text-gold-glow' : 'text-slate-500'}`}>
                <Flame className={`w-3.5 h-3.5 ${hunter.streak > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-600'}`} />
                <span>{hunter.streak}D</span>
              </div>

              {/* Notifications */}
              <button
                onClick={sendTestNotification}
                title="Enable & Test Mobile/Desktop System Notifications"
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono text-[10px] sm:text-[11px] px-1.5 py-0.5 bg-cyan-950/60 border border-cyan-500/40 rounded shadow-cyan-glow"
              >
                <Bell className="w-3 h-3 animate-pulse" />
                <span className="hidden sm:inline font-bold">NOTIFS</span>
              </button>

              {/* Log Out */}
              <button
                onClick={() => {
                  if (confirm('Log out of current System session?')) {
                    logoutUser();
                  }
                }}
                title="Log Out of System"
                className="text-slate-500 hover:text-red-400 transition-colors p-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>

              {/* Reset */}
              <button
                onClick={resetAllData}
                title="Reset System Protocol"
                className="text-slate-500 hover:text-red-400 transition-colors p-1 text-[10px] font-mono"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Middle Status & Rank Bar */}
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {/* Level & Rank */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Rank Badge */}
              <div className="relative">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 flex flex-col items-center justify-center font-system font-black text-base sm:text-lg border-2 shadow-lg ${
                    frozen
                      ? 'border-red-500 bg-red-950/40 text-red-400 shadow-red-glow'
                      : hunter.rank === 'S'
                      ? 'border-amber-400 bg-amber-950/40 text-amber-300 shadow-gold-glow'
                      : hunter.rank === 'A'
                      ? 'border-purple-500 bg-purple-950/40 text-purple-300 shadow-purple-glow'
                      : 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-cyan-glow'
                  }`}
                >
                  <span>{hunter.rank}</span>
                  <span className="text-[7px] sm:text-[8px] tracking-tighter opacity-80">RANK</span>
                </div>
                {frozen && (
                  <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[7px] font-bold px-1 rounded border border-red-300 flex items-center gap-0.5">
                    <AlertTriangle className="w-2 h-2" />
                    FROZEN
                  </div>
                )}
              </div>

              {/* Level & XP Bar */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-system font-extrabold text-slate-100 text-xs sm:text-sm">
                    LVL {hunter.level}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono text-cyan-400">
                    ({hunter.xp}/{hunter.xpToNextLevel} XP)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-24 sm:w-48 h-2 bg-slate-900 border border-slate-700 rounded-full overflow-hidden mt-1 relative">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-cyan-300 transition-all duration-500 shadow-cyan-glow"
                    style={{ width: `${Math.min(100, (hunter.xp / hunter.xpToNextLevel) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Navigation Tabs (Desktop & Tablet) */}
            <nav className="hidden md:flex items-center bg-system-card/90 p-1 border border-system-border rounded-md font-mono text-xs">
              <button
                onClick={() => setActiveTab('checklist')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
                  activeTab === 'checklist'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-cyan-glow font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>QUESTS</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-cyan-glow font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>HUNTER</span>
              </button>

              <button
                onClick={() => setActiveTab('routine')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
                  activeTab === 'routine'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-cyan-glow font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ROUTINE</span>
              </button>

              <button
                onClick={() => setActiveTab('report')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
                  activeTab === 'report'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-cyan-glow font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>REPORT</span>
              </button>
            </nav>
          </div>
        </div>

        <AdminAuthModal isOpen={showAdminAuthModal} onClose={() => setShowAdminAuthModal(false)} />
      </header>

      {/* Mobile Bottom Navigation Dock (Fixed at bottom on mobile screens) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-system-bg/95 backdrop-blur-lg border-t border-system-cyan/30 py-1.5 px-2 flex items-center justify-around font-mono text-[10px] shadow-cyan-glow">
        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded transition-all ${
            activeTab === 'checklist'
              ? 'text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-500/40 shadow-cyan-glow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>QUESTS</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded transition-all ${
            activeTab === 'dashboard'
              ? 'text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-500/40 shadow-cyan-glow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>HUNTER</span>
        </button>

        <button
          onClick={() => setActiveTab('routine')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded transition-all ${
            activeTab === 'routine'
              ? 'text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-500/40 shadow-cyan-glow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ROUTINE</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded transition-all ${
            activeTab === 'report'
              ? 'text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-500/40 shadow-cyan-glow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>REPORT</span>
        </button>
      </nav>
    </>
  );
};

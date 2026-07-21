import React from 'react';
import { useHunter } from '../context/HunterContext';
import { AlertOctagon, Lock, Skull } from 'lucide-react';
import { isPenaltyZoneActive, isRankFrozen } from '../engine/gameEngine';

export const PenaltyBanner: React.FC = () => {
  const { state } = useHunter();
  const hunter = state.hunter;
  if (!hunter) return null;

  const penaltyZone = isPenaltyZoneActive(hunter);
  const frozen = isRankFrozen(hunter);

  if (!penaltyZone && !frozen) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 mt-3 space-y-2">
      {penaltyZone && (
        <div className="system-box-danger p-3.5 shadow-red-glow animate-pulse">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-950 border border-red-500 rounded text-red-500 shrink-0">
              <Skull className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-system text-red-500 font-extrabold text-sm tracking-wider flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" />
                  WARNING: PENALTY ZONE ACTIVE
                </span>
                {hunter.penaltyZoneExpiresAt && (
                  <span className="font-mono text-[10px] text-red-400 bg-red-950/80 px-2 py-0.5 border border-red-800 rounded">
                    EXPIRES: {new Date(hunter.penaltyZoneExpiresAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-red-200 mt-1 font-mono leading-relaxed">
                Boss Quest missed. Side Quests are locked. Any Main Quest failures during Penalty Zone will incur DOUBLE XP penalty (-40 XP).
              </p>
            </div>
          </div>
        </div>
      )}

      {frozen && (
        <div className="bg-red-950/40 border border-red-800 p-3 rounded flex items-center justify-between text-xs font-mono text-red-300">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-400" />
            <span>
              <strong>RANK FROZEN PROTOCOL:</strong> 3 Main Quests missed within 7 days. Rank elevation suspended until{' '}
              {new Date(hunter.rankFrozenUntil!).toLocaleDateString()}.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

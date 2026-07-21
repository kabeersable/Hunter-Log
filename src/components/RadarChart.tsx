import React from 'react';
import type { HunterStats, StatKey } from '../types/hunter';

interface RadarChartProps {
  stats: HunterStats;
  size?: number;
}

const STAT_KEYS: StatKey[] = ['STR', 'VIT', 'INT', 'PER', 'WIL'];

export const RadarChart: React.FC<RadarChartProps> = ({ stats, size = 300 }) => {
  const center = size / 2;
  const radius = size * 0.35;

  // Determine max scale (at least 50, or rounded up max stat)
  const maxStatValue = Math.max(50, ...Object.values(stats));
  const scale = radius / maxStatValue;

  // 5 vertices angles (in radians, starting top -PI/2)
  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const x = center + value * Math.cos(angle);
    const y = center + value * Math.sin(angle);
    return { x, y };
  };

  // Concentric pentagon grids (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Polygon path for current stats
  const statPoints = STAT_KEYS.map((key, i) => {
    const val = stats[key] || 10;
    const { x, y } = getCoordinates(i, val * scale);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center justify-center relative p-2">
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </radialGradient>
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Concentric grid pentagons */}
        {gridLevels.map((lvl) => {
          const points = STAT_KEYS.map((_, i) => {
            const { x, y } = getCoordinates(i, radius * lvl);
            return `${x},${y}`;
          }).join(' ');
          return (
            <polygon
              key={`grid-${lvl}`}
              points={points}
              fill="none"
              stroke="rgba(0, 240, 255, 0.15)"
              strokeWidth="1"
              strokeDasharray={lvl === 1 ? 'none' : '3,3'}
            />
          );
        })}

        {/* Axes lines from center to outer vertices */}
        {STAT_KEYS.map((_, i) => {
          const { x, y } = getCoordinates(i, radius);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(0, 240, 255, 0.2)"
              strokeWidth="1"
            />
          );
        })}

        {/* Filled Stat Polygon */}
        <polygon
          points={statPoints}
          fill="url(#radarGlow)"
          stroke="#00f0ff"
          strokeWidth="2.5"
          filter="url(#cyanGlow)"
        />

        {/* Stat Value Nodes */}
        {STAT_KEYS.map((key, i) => {
          const val = stats[key] || 10;
          const { x, y } = getCoordinates(i, val * scale);
          return (
            <g key={`node-${key}`}>
              <circle cx={x} cy={y} r="4" fill="#00f0ff" />
              <circle cx={x} cy={y} r="7" fill="none" stroke="#00f0ff" strokeWidth="1" opacity="0.6" />
            </g>
          );
        })}

        {/* Labels & Numbers */}
        {STAT_KEYS.map((key, i) => {
          const labelCoord = getCoordinates(i, radius + 25);
          const val = stats[key] || 10;
          return (
            <g key={`label-${key}`} transform={`translate(${labelCoord.x}, ${labelCoord.y})`}>
              <text
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-cyan-400 font-mono text-xs font-bold tracking-widest"
                style={{ textShadow: '0 0 6px rgba(0, 240, 255, 0.8)' }}
              >
                {key}
              </text>
              <text
                textAnchor="middle"
                y="14"
                className="fill-slate-100 font-mono text-[11px] font-extrabold"
              >
                {val}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="grid grid-cols-5 gap-1 w-full max-w-sm mt-3 pt-2 border-t border-system-cyan/20 text-center">
        {STAT_KEYS.map((key) => (
          <div key={key} className="bg-system-card/60 p-1 rounded border border-system-border">
            <div className="text-[10px] text-system-muted font-mono">{key}</div>
            <div className="text-xs font-mono font-bold text-cyan-400">{stats[key]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

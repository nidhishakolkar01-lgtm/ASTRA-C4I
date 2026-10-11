import React, { useState, useEffect, useMemo } from 'react';
import { TacticalEventLog, MissionResult } from '../../types/simulation';
import { Clock, Play, Pause, RotateCcw, Crosshair, ShieldAlert, CheckCircle2, Radio, Navigation } from 'lucide-react';

interface Props {
  eventLogs: TacticalEventLog[];
  durationSec: number;
  radarHistory: MissionResult['radarTrackHistory'];
}

export const TacticalTimeline: React.FC<Props> = ({ eventLogs, durationSec, radarHistory }) => {
  const [filter, setFilter] = useState<'ALL' | 'ENGAGEMENT' | 'ROE' | 'ACQUISITION'>('ALL');
  const [scrubTime, setScrubTime] = useState<number>(durationSec || 60);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  const maxTime = Math.max(durationSec || 60, 10);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setScrubTime(prev => {
        const next = prev + 0.25 * playbackSpeed;
        if (next >= maxTime) {
          setIsPlaying(false);
          return maxTime;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, maxTime]);

  // Normalize radarHistory timestamps in case legacy epoch ms were stored
  const normalizedHistory = useMemo(() => {
    if (!radarHistory || radarHistory.length === 0) return [];
    const firstTs = radarHistory[0].timestamp;
    const isEpoch = firstTs > 1000000;
    return radarHistory.map((snap, idx) => ({
      timestamp: isEpoch
        ? Number(((idx / Math.max(1, radarHistory.length - 1)) * maxTime).toFixed(1))
        : snap.timestamp,
      tracks: snap.tracks
    }));
  }, [radarHistory, maxTime]);

  // Build full trajectory map per drone up to scrubTime
  const droneTrajectories = useMemo(() => {
    const map = new Map<string, { id: string; points: { x: number; y: number; z: number; status: string; t: number }[] }>();
    normalizedHistory.forEach(snap => {
      if (snap.timestamp <= scrubTime) {
        snap.tracks.forEach(tr => {
          if (!map.has(tr.id)) {
            map.set(tr.id, { id: tr.id, points: [] });
          }
          map.get(tr.id)!.points.push({ x: tr.x, y: tr.y, z: tr.z, status: tr.status, t: snap.timestamp });
        });
      }
    });
    return Array.from(map.values());
  }, [normalizedHistory, scrubTime]);

  // Convert 3D world (x, z in [-1500, 1500]) to SVG % coordinates [0..100]
  const worldToSvg = (wx: number, wz: number) => {
    const scale = 1400; // max radar display radius in meters
    const sx = 50 + (wx / scale) * 45;
    const sy = 50 + (wz / scale) * 45;
    return {
      x: Math.max(4, Math.min(96, sx)),
      y: Math.max(4, Math.min(96, sy))
    };
  };

  // Filter logs
  const filteredLogs = eventLogs.filter(log => {
    if (filter === 'ALL') return true;
    if (filter === 'ENGAGEMENT') return log.eventType === 'WEAPON_DISCHARGED' || log.eventType === 'THREAT_NEUTRALIZED';
    if (filter === 'ROE') return log.eventType === 'ROE_VIOLATION' || log.eventType === 'COLLATERAL_INCIDENT';
    if (filter === 'ACQUISITION') return log.eventType === 'RADAR_ACQUISITION' || log.eventType === 'RF_SIGNAL_DETECTED' || log.eventType === 'CLASSIFICATION_SUBMITTED';
    return true;
  });

  const getSeverityStyle = (severity: TacticalEventLog['severity']) => {
    switch (severity) {
      case 'critical': return 'border-rose-500 bg-rose-950/40 text-rose-300';
      case 'warning': return 'border-amber-500 bg-amber-950/40 text-amber-300';
      case 'success': return 'border-emerald-500 bg-emerald-950/40 text-emerald-300';
      default: return 'border-slate-700 bg-slate-900/60 text-slate-300';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
      {/* Left 7 Columns: Event Timeline Stream */}
      <div className="lg:col-span-7 space-y-4">
        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-cyan-400 font-bold uppercase flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" />
            <span>CHRONOLOGICAL C4I EVENT TELEMETRY:</span>
          </span>
          <div className="flex gap-1.5">
            {(['ALL', 'ENGAGEMENT', 'ACQUISITION', 'ROE'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                  filter === f 
                    ? 'bg-cyan-600 text-white shadow glow-cyan' 
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Event Logs */}
        <div className="space-y-2 max-h-[540px] overflow-y-auto pr-2">
          {filteredLogs.map((log, idx) => {
            const isActiveAtScrub = log.timestamp <= scrubTime;
            return (
              <div
                key={idx}
                onClick={() => setScrubTime(log.timestamp)}
                className={`p-3 rounded-lg border-l-4 border cursor-pointer transition-all ${getSeverityStyle(log.severity)} ${
                  isActiveAtScrub ? 'opacity-100' : 'opacity-40'
                } hover:opacity-100`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-bold text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>T+{log.timestamp.toFixed(1)}s</span>
                    <span className="text-slate-500">|</span>
                    <span className="tracking-wider uppercase">{log.eventType.replace(/_/g, ' ')}</span>
                  </div>
                  {log.droneId && (
                    <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-700 text-cyan-300">
                      {log.droneId}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{log.details}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right 5 Columns: Interactive 2D Kill-Zone & Flight Path Replay Map */}
      <div className="lg:col-span-5 bg-slate-900/90 border border-cyan-500/30 p-4 rounded-xl flex flex-col justify-between shadow-2xl space-y-4">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-100">2D KILL-ZONE RADAR REPLAY</span>
            </div>
            <span className="text-[11px] bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded font-bold">
              T+{scrubTime.toFixed(1)}s / {maxTime}s
            </span>
          </div>

          {/* Interactive SVG Radar Replay Map */}
          <div className="relative w-full aspect-square bg-[#050a14] rounded-xl border border-cyan-500/30 flex items-center justify-center overflow-hidden shadow-inner">
            {/* Radar Grid Lines & Range Rings */}
            <div className="absolute w-[88%] h-[88%] rounded-full border border-cyan-500/20" />
            <div className="absolute w-[60%] h-[60%] rounded-full border border-cyan-500/20" />
            <div className="absolute w-[32%] h-[32%] rounded-full border border-rose-500/30 bg-rose-500/5" />
            <div className="absolute inset-x-0 h-[1px] bg-cyan-500/15" />
            <div className="absolute inset-y-0 w-[1px] bg-cyan-500/15" />

            {/* Range Ring Labels */}
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] text-cyan-500/60">N 000° (1400m)</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-cyan-500/60">S 180°</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] text-cyan-500/60">W 270°</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-cyan-500/60">E 090°</span>

            {/* Center Protected Asset (Base) */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-lg glow-cyan border-2 border-white" />
              <span className="text-[8px] text-cyan-300 font-bold mt-0.5 bg-black/70 px-1 rounded">BASE C2</span>
            </div>

            {/* Dynamic SVG Drone Flight Paths & Kill Markers */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-auto">
              {droneTrajectories.length > 0 ? (
                droneTrajectories.map((traj) => {
                  if (traj.points.length === 0) return null;
                  const latest = traj.points[traj.points.length - 1];
                  const isDestroyed = latest.status === 'destroyed' || latest.status === 'captured';
                  const isSelected = selectedTrackId === traj.id;

                  // Polyline points
                  const polyPoints = traj.points
                    .map(p => {
                      const pt = worldToSvg(p.x, p.z);
                      return `${pt.x},${pt.y}`;
                    })
                    .join(' ');

                  const headSvg = worldToSvg(latest.x, latest.z);
                  const strokeColor = isDestroyed ? '#10b981' : '#f43f5e';

                  return (
                    <g
                      key={traj.id}
                      onClick={() => setSelectedTrackId(traj.id)}
                      className="cursor-pointer"
                    >
                      {/* Historical Flight Trail */}
                      <polyline
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={isSelected ? '1.2' : '0.7'}
                        strokeDasharray={isDestroyed ? '1.5,1.5' : 'none'}
                        opacity={isSelected ? 1 : 0.75}
                        points={polyPoints}
                      />

                      {/* Current/Final Position Marker */}
                      {isDestroyed ? (
                        <g transform={`translate(${headSvg.x}, ${headSvg.y})`}>
                          <circle r="2.2" fill="#10b981" opacity="0.25" />
                          <line x1="-1.5" y1="-1.5" x2="1.5" y2="1.5" stroke="#10b981" strokeWidth="0.8" />
                          <line x1="1.5" y1="-1.5" x2="-1.5" y2="1.5" stroke="#10b981" strokeWidth="0.8" />
                        </g>
                      ) : (
                        <g transform={`translate(${headSvg.x}, ${headSvg.y})`}>
                          <circle r="2.4" fill="#f43f5e" opacity="0.3" />
                          <circle r="1.3" fill="#f43f5e" />
                        </g>
                      )}

                      {/* Label */}
                      <text
                        x={headSvg.x + 2.2}
                        y={headSvg.y - 1.5}
                        fill={isDestroyed ? '#6ee7b7' : '#fda4af'}
                        fontSize="2.6"
                        fontWeight="bold"
                      >
                        {traj.id.replace('drone_', 'T-').slice(0, 8)} ({latest.y}m)
                      </text>
                    </g>
                  );
                })
              ) : (
                /* Fallback representative trajectories if mission ended before samples */
                <>
                  <polyline fill="none" stroke="#10b981" strokeWidth="0.8" strokeDasharray="1.5,1.5" points="18,22 34,35 42,41" />
                  <circle cx="42" cy="41" r="1.8" fill="#10b981" />
                  <text x="44" y="40" fill="#6ee7b7" fontSize="2.6" fontWeight="bold">T-1 NEUTRALIZED</text>

                  <polyline fill="none" stroke="#10b981" strokeWidth="0.8" strokeDasharray="1.5,1.5" points="82,20 68,32 58,40" />
                  <circle cx="58" cy="40" r="1.8" fill="#10b981" />
                  <text x="60" y="39" fill="#6ee7b7" fontSize="2.6" fontWeight="bold">T-2 INTERCEPTED</text>
                </>
              )}
            </svg>
          </div>

          {/* Playback Controls & Timeline Scrubber */}
          <div className="mt-4 bg-slate-950/90 p-3 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (scrubTime >= maxTime) setScrubTime(0);
                    setIsPlaying(!isPlaying);
                  }}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'PAUSE' : 'PLAY REPLAY'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setScrubTime(0);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg border border-slate-700"
                  title="Reset to T+0s"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Speed Multiplier */}
              <div className="flex items-center gap-1">
                {[1, 2, 4].map(spd => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      playbackSpeed === spd ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={maxTime}
                step="0.5"
                value={scrubTime}
                onChange={e => {
                  setIsPlaying(false);
                  setScrubTime(Number(e.target.value));
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>START (0.0s)</span>
                <span className="text-emerald-400">● GREEN = INTERCEPTED</span>
                <span className="text-rose-400">● RED = IN-FLIGHT</span>
                <span>END ({maxTime}s)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <span>20 Hz Multi-Spectral Track Telemetry</span>
          <span className="text-cyan-400 font-bold">DSSC AAR REPLAY ENGINE</span>
        </div>
      </div>
    </div>
  );
};

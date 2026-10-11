import React from 'react';
import { useSimulator } from '../../context/SimulatorContext';
import { Shield, AlertCircle, ShieldAlert, Zap, Clock, Play, Pause, RotateCcw } from 'lucide-react';

export const ThreatAlertBanner: React.FC = () => {
  const { 
    missionState, 
    activeScenario, 
    elapsedTimeSec, 
    baseHealth, 
    drones, 
    pauseSimulation, 
    resumeSimulation, 
    resetSimulation 
  } = useSimulator();

  const activeThreats = drones.filter(d => d.status === 'flying').length;
  const neutralizedCount = drones.filter(d => d.status === 'destroyed' || d.status === 'captured').length;
  const remainingTime = Math.max(0, activeScenario.timeLimitSec - elapsedTimeSec);

  // Health Color
  const getHealthColor = (hp: number) => {
    if (hp > 70) return 'bg-emerald-500 text-emerald-400';
    if (hp > 30) return 'bg-amber-500 text-amber-400';
    return 'bg-rose-500 text-rose-400 animate-pulse';
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700/80 px-4 py-2.5 flex items-center justify-between font-mono select-none text-xs shadow-xl">
      {/* Scenario Title & Mission Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            missionState === 'RUNNING' ? 'bg-rose-500 animate-ping' : 'bg-amber-400'
          }`} />
          <span className="font-bold text-slate-100 uppercase tracking-wider text-sm">
            {activeScenario.title}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            activeScenario.difficulty === 'Recruit' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
            activeScenario.difficulty === 'Operator' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
            activeScenario.difficulty === 'Tactical Lead' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}>
            [{activeScenario.difficulty.toUpperCase()}]
          </span>
        </div>

        {/* Environmental Badges */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-400">
          <span className="bg-slate-800 px-2 py-0.5 rounded">TERRAIN: {activeScenario.terrain.replace('_', ' ').toUpperCase()}</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded">WEATHER: {activeScenario.weather.toUpperCase()}</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded">LIGHTING: {activeScenario.timeOfDay.toUpperCase()}</span>
        </div>
      </div>

      {/* Center Tactical Counters */}
      <div className="flex items-center gap-6">
        {/* Base Integrity */}
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-400 leading-none">BASE INTEGRITY</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${getHealthColor(baseHealth).split(' ')[0]}`}
                  style={{ width: `${baseHealth}%` }}
                />
              </div>
              <span className={`font-bold ${getHealthColor(baseHealth).split(' ')[1]}`}>{baseHealth}%</span>
            </div>
          </div>
        </div>

        {/* Threats Counter */}
        <div className="flex items-center gap-3 bg-slate-950 px-3 py-1 rounded border border-slate-800">
          <div>
            <span className="text-[9px] text-slate-500 block">HOSTILES</span>
            <span className="font-bold text-rose-400 text-sm">{activeThreats}</span>
          </div>
          <div className="text-slate-700">/</div>
          <div>
            <span className="text-[9px] text-slate-500 block">NEUTRALIZED</span>
            <span className="font-bold text-emerald-400 text-sm">{neutralizedCount}</span>
          </div>
        </div>

        {/* Mission Clock */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded border border-slate-800 text-cyan-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-sm tracking-wider">
            {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toFixed(0).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-2">
        {missionState === 'RUNNING' ? (
          <button
            onClick={pauseSimulation}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs transition-all border border-slate-700"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>PAUSE</span>
          </button>
        ) : missionState === 'PAUSED' ? (
          <button
            onClick={resumeSimulation}
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded text-xs transition-all glow-cyan"
          >
            <Play className="w-3.5 h-3.5" />
            <span>RESUME</span>
          </button>
        ) : null}

        <button
          onClick={resetSimulation}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-xs transition-all border border-slate-700"
          title="Restart Scenario"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESTART</span>
        </button>
      </div>
    </div>
  );
};

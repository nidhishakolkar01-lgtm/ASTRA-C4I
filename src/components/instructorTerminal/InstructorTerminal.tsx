import React, { useState, useEffect } from 'react';
import { useSimulator } from '../../context/SimulatorContext';
import { dualTerminalSync, DualTerminalMessage } from '../../engine/DualTerminalSync';
import { voiceComms } from '../../engine/VoiceComms';
import { 
  ShieldAlert, 
  Radio, 
  Zap, 
  Wind, 
  Send, 
  Eye, 
  Activity, 
  AlertTriangle, 
  Crosshair, 
  Sliders, 
  UserCheck 
} from 'lucide-react';

export const InstructorTerminal: React.FC = () => {
  const { 
    activeScenario, 
    traineeProfile, 
    drones, 
    baseHealth, 
    elapsedTimeSec, 
    missionState,
    selectedDroneId
  } = useSimulator();

  const [dispatchText, setDispatchText] = useState('');
  const [injectedLogs, setInjectedLogs] = useState<{ time: string; text: string }[]>([
    { time: '12:00:00', text: 'Dual-Terminal Instructor Console Connected. Trainee telemetry stream active.' }
  ]);
  const [jammingLevel, setJammingLevel] = useState(0.5);

  const addInjectLog = (text: string) => {
    const time = new Date().toLocaleTimeString();
    setInjectedLogs(prev => [{ time, text }, ...prev.slice(0, 30)]);
  };

  const handleInjectJamming = () => {
    dualTerminalSync.injectJamming(jammingLevel);
    voiceComms.speak('Hostile electronic warfare jamming pod activated in sector.', 'urgent');
    addInjectLog(`Injected ${(jammingLevel * 100).toFixed(0)}% High-Power Radar Jamming Clutter.`);
  };

  const handleSpawnDecoy = () => {
    dualTerminalSync.spawnSurpriseDecoy(Math.round(Math.random() * 360));
    voiceComms.speak('New radar contact detected on bearing 180.', 'normal');
    addInjectLog('Spawned Mockingbird Electronic Decoy Drone on trainee blind spot.');
  };

  const handleTriggerSwarm = () => {
    dualTerminalSync.triggerSwarmPincer();
    voiceComms.calloutSwarmAlert(4);
    addInjectLog('Triggered 4-node Swarm Pincer Attack converging from multiple azimuths.');
  };

  const handleAlterWeather = (weather: string, timeOfDay: string) => {
    dualTerminalSync.alterWeather(weather, timeOfDay);
    voiceComms.speak(`Atmospheric condition changed to ${weather} ${timeOfDay}.`, 'normal');
    addInjectLog(`Injected environmental shift: ${weather.toUpperCase()} / ${timeOfDay.toUpperCase()}`);
  };

  const handleSendDispatch = () => {
    if (!dispatchText.trim()) return;
    dualTerminalSync.sendDispatch(dispatchText);
    voiceComms.calloutInstructorIntercom(dispatchText);
    addInjectLog(`Dispatched Voice Note: "${dispatchText}"`);
    setDispatchText('');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 font-mono select-none text-xs">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-700 p-5 rounded-xl shadow-2xl flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">COMMAND & CONTROL SUITE</div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>INSTRUCTOR-TRAINEE DUAL TERMINAL (REAL-TIME INJECTOR)</span>
          </h2>
          <p className="text-slate-400 text-[11px] mt-1">
            Real-time adversary red-team control deck for DSSC evaluators to inject electronic warfare, surprise swarms, and assess officer reaction under pressure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-emerald-500/50 flex items-center gap-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-[11px]">TRAINEE LINK: SYNCED</span>
          </div>
        </div>
      </div>

      {/* Grid: Trainee Telemetry & Instructor Control Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Trainee Telemetry Monitor */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-cyan-400 text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>LIVE TRAINEE MONITOR</span>
            </span>
            <span className="text-[10px] bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
              {missionState}
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[10px]">OFFICER TRAINEE:</div>
              <div className="font-bold text-slate-100 text-sm">{traineeProfile.rank} {traineeProfile.name}</div>
              <div className="text-[10px] text-cyan-400">{traineeProfile.unit}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block text-[9px]">BASE INTEGRITY:</span>
                <span className={`font-bold ${baseHealth > 70 ? 'text-emerald-400' : (baseHealth > 30 ? 'text-amber-400' : 'text-rose-400')}`}>
                  {baseHealth}%
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block text-[9px]">MISSION TIME:</span>
                <span className="font-bold text-slate-200">{elapsedTimeSec.toFixed(0)}s</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[9px]">CURRENT TARGET LOCK:</span>
              <span className="font-bold text-cyan-300">
                {selectedDroneId ? `Track ${selectedDroneId}` : 'NO TARGET DESIGNATED'}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[9px]">ACTIVE SCENARIO:</span>
              <span className="font-bold text-slate-200">{activeScenario.title}</span>
              <div className="text-[10px] text-slate-400">
                Active Threats: {drones.filter(d => d.status === 'flying').length} | Neutralized: {drones.filter(d => d.status === 'destroyed' || d.status === 'captured').length}
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right: Real-Time Injector Action Deck */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
              <span className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>REAL-TIME ADVERSARY INJECTORS (RED-TEAM)</span>
              </span>
              <span className="text-[10px] text-slate-400">Click to inject surprise stressor</span>
            </div>

            {/* Injector Button Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Inject EW Jamming */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 text-xs">RADAR EW JAMMING PULSE</span>
                  <Radio className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-slate-400 text-[10px]">
                  Injects high-power noise barrage onto trainee radar PPI screen.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.2"
                    max="0.9"
                    step="0.1"
                    value={jammingLevel}
                    onChange={e => setJammingLevel(Number(e.target.value))}
                    className="flex-1 h-1 bg-slate-800 rounded accent-amber-400"
                  />
                  <button
                    onClick={handleInjectJamming}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded font-bold text-[10px] glow-amber"
                  >
                    INJECT ({(jammingLevel * 100).toFixed(0)}%)
                  </button>
                </div>
              </div>

              {/* Spawn Surprise Decoy */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-cyan-500/40 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400 text-xs">SPAWN SURPRISE DECOY</span>
                    <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-slate-400 text-[10px] mt-1">
                    Spawns high-RCS radar decoy to test operator trigger discipline and avoid CIWS ammunition waste.
                  </p>
                </div>
                <button
                  onClick={handleSpawnDecoy}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded font-bold text-[10px] glow-cyan w-full mt-2"
                >
                  SPAWN DECOY
                </button>
              </div>

              {/* Trigger Swarm Pincer */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-rose-500/40 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-400 text-xs">SWARM PINCER ATTACK</span>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  </div>
                  <p className="text-slate-400 text-[10px] mt-1">
                    Launches 4 coordinated autonomous boids swarm drones converging simultaneously from opposite flanks.
                  </p>
                </div>
                <button
                  onClick={handleTriggerSwarm}
                  className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded font-bold text-[10px] glow-rose w-full mt-2"
                >
                  LAUNCH SWARM PINCER
                </button>
              </div>

              {/* Inject Weather/Night Shift */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-purple-500/40 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-400 text-xs">DEGRADE ATMOSPHERE</span>
                    <Wind className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-slate-400 text-[10px] mt-1">
                    Forces instant dense fog or pitch night to test thermal FLIR and acoustic slew-to-cue reaction.
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleAlterWeather('foggy', 'dusk')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1.5 rounded text-[9px] flex-1"
                  >
                    DENSE FOG
                  </button>
                  <button
                    onClick={() => handleAlterWeather('sandstorm', 'night')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1.5 rounded text-[9px] flex-1"
                  >
                    SANDSTORM NIGHT
                  </button>
                </div>
              </div>
            </div>

            {/* Instructor Voice Dispatch Intercom */}
            <div className="mt-4 bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <span className="font-bold text-slate-200 text-xs flex items-center gap-2">
                <span>INSTRUCTOR TACTICAL INTERCOM (AI VOICE DISPATCH)</span>
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dispatchText}
                  onChange={e => setDispatchText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendDispatch()}
                  placeholder="Type orders or critique (e.g. 'Cease fire on sector 2! Verify IFF status!')..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleSendDispatch}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded font-bold text-xs glow-amber flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>TRANSMIT VOICE</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Injected Stress Log */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-slate-400 text-[10px] block mb-1.5 font-bold">INSTRUCTOR INJECTION AUDIT LOG:</span>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 max-h-24 overflow-y-auto space-y-1 text-[10px] text-slate-400">
              {injectedLogs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-amber-400">[{log.time}]</span>
                  <span className="text-slate-300">{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

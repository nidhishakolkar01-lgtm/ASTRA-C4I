import React, { useState, useEffect } from 'react';
import { useSimulator } from '../../context/SimulatorContext';
import { Shield, Volume2, VolumeX, Mic, MicOff, User, Play, Award, Sliders, Bot, BookOpen, Radio, Clock, Eye, Cpu } from 'lucide-react';

interface Props {
  activeView: 'SIMULATOR' | 'AAR' | 'STUDIO' | 'INSTRUCTOR' | 'AI_ADVISOR' | 'MANUAL';
  setActiveView: (view: 'SIMULATOR' | 'AAR' | 'STUDIO' | 'INSTRUCTOR' | 'AI_ADVISOR' | 'MANUAL') => void;
}

export const Header: React.FC<Props> = ({ activeView, setActiveView }) => {
  const { 
    traineeProfile, 
    updateTraineeInfo, 
    soundMuted, 
    toggleSound,
    voiceCommsEnabled,
    toggleVoiceComms,
    hudMode,
    setHudMode,
    juryAutoPilot,
    toggleJuryAutoPilot
  } = useSimulator();
  
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [name, setName] = useState(traineeProfile.name);
  const [rank, setRank] = useState(traineeProfile.rank);
  const [unit, setUnit] = useState(traineeProfile.unit);

  // Live Mission Clock (Dual Zulu UTC & IST)
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const zuluTime = time.toISOString().substring(11, 19) + 'Z';
  const istTime = time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });

  const handleSaveProfile = () => {
    updateTraineeInfo(name, rank, unit);
    setShowEditProfile(false);
  };

  return (
    <header className="sticky top-0 z-50 select-none font-mono shrink-0">
      {/* Top Security & Classification Bar */}
      <div className="bg-emerald-950/90 border-b border-emerald-500/30 px-3 py-0.5 flex items-center justify-between text-[9px] text-emerald-300 font-bold tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            SECURE C4I AIR DEFENSE LINK // STANAG 4586
          </span>
          <span className="text-emerald-500/60 hidden md:inline">|</span>
          <span className="text-emerald-400 hidden md:inline">AES-256 GCM</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 px-1.5 rounded-sm text-[8px] font-black">
            SECRET // REL TO DSSC / MOD INDIA
          </span>
        </div>
      </div>

      {/* Main Glass Cockpit Header */}
      <div className="glass-panel-obsidian border-b border-cyan-500/25 px-3 py-1 flex items-center justify-between shadow-xl backdrop-blur-xl">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-2.5">
          <div className="relative group cursor-pointer" onClick={() => setActiveView('SIMULATOR')}>
            <div className="w-8 h-8 clip-chamfer-sm bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-900 flex items-center justify-center text-white shadow glow-cyan border border-cyan-400/50">
              <Shield className="w-4 h-4 text-cyan-100" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-black rounded-full" title="Node Online" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-100 text-xs tracking-wider font-mono">
                ASTRA<span className="text-cyan-400">-C4I</span>
              </span>
              <span className="bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                PS-26247 DSSC
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[8px] px-1.5 py-0.2 rounded font-bold">
                <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                DEFCON 2
              </span>
            </div>
            <div className="text-[9px] text-slate-400 flex items-center gap-1.5 leading-none mt-0.5">
              <span>COUNTER-DRONE THREAT SIMULATOR</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400/80 font-mono">28°36'N 77°12'E</span>
            </div>
          </div>
        </div>

        {/* Tactical Mission Clocks */}
        <div className="hidden 2xl:flex items-center gap-2 bg-slate-900/80 border border-cyan-500/20 px-2.5 py-0.5 rounded clip-chamfer-sm text-[10px]">
          <Clock className="w-3 h-3 text-cyan-400" />
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="text-slate-400">ZULU: <strong className="text-cyan-300 font-bold">{zuluTime}</strong></span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">IST: <strong className="text-amber-300 font-bold">{istTime}</strong></span>
          </div>
        </div>

        {/* Main Navigation Modules */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-950/80 p-0.5 rounded border border-slate-800">
          <button
            onClick={() => setActiveView('SIMULATOR')}
            className={`btn-tactical-interactive flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold clip-chamfer-sm ${
              activeView === 'SIMULATOR'
                ? 'bg-cyan-600 text-white shadow glow-cyan border-b border-cyan-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Play className="w-3 h-3" />
            <span>3D C4I</span>
          </button>

          <button
            onClick={() => setActiveView('AAR')}
            className={`btn-tactical-interactive flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold clip-chamfer-sm ${
              activeView === 'AAR'
                ? 'bg-cyan-600 text-white shadow glow-cyan border-b border-cyan-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Award className="w-3 h-3" />
            <span>AAR DEBRIEF</span>
          </button>

          <button
            onClick={() => setActiveView('INSTRUCTOR')}
            className={`btn-tactical-interactive flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold clip-chamfer-sm ${
              activeView === 'INSTRUCTOR'
                ? 'bg-amber-600 text-white shadow glow-amber border-b border-amber-300'
                : 'text-amber-400/80 hover:text-amber-300 hover:bg-slate-900'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>INSTRUCTOR</span>
          </button>

          <button
            onClick={() => setActiveView('STUDIO')}
            className={`btn-tactical-interactive flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold clip-chamfer-sm ${
              activeView === 'STUDIO'
                ? 'bg-cyan-600 text-white shadow glow-cyan border-b border-cyan-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>STUDIO</span>
          </button>

          <button
            onClick={() => setActiveView('AI_ADVISOR')}
            className={`btn-tactical-interactive flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold clip-chamfer-sm ${
              activeView === 'AI_ADVISOR'
                ? 'bg-cyan-600 text-white shadow glow-cyan border-b border-cyan-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Bot className="w-3 h-3" />
            <span>AI ADVISOR</span>
          </button>

          <button
            onClick={() => setActiveView('MANUAL')}
            className={`btn-tactical-interactive flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold clip-chamfer-sm ${
              activeView === 'MANUAL'
                ? 'bg-cyan-600 text-white shadow glow-cyan border-b border-cyan-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>DOCTRINE</span>
          </button>
        </nav>

        {/* HUD Declutter Mode Switcher & Jury Auto-Pilot + Audio Controls */}
        <div className="flex items-center gap-1.5">
          {/* 3-Mode HUD Declutter Switcher (Visible in Simulator view) */}
          {activeView === 'SIMULATOR' && (
            <div className="hidden md:flex items-center bg-slate-950/90 border border-cyan-500/30 rounded p-0.5 gap-0.5" title="Switch HUD Declutter Mode [Key: H]">
              <Eye className="w-3 h-3 text-cyan-400 mx-1" />
              {(['full', 'tactical', 'cinematic'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setHudMode(mode)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${
                    hudMode === mode
                      ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode === 'full' ? 'FULL' : mode === 'tactical' ? 'TACTICAL' : 'CLEAR'}
                </button>
              ))}
            </div>
          )}

          {/* 1-Click Jury Auto-Pilot AI Commander Toggle */}
          {activeView === 'SIMULATOR' && (
            <button
              onClick={toggleJuryAutoPilot}
              className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-bold transition-all clip-chamfer-sm ${
                juryAutoPilot
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 glow-amber animate-pulse'
                  : 'bg-slate-900/90 border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-500/50'
              }`}
              title="Toggle Autonomous AI Commander for Hands-Free Jury Demo [Key: P]"
            >
              <Cpu className="w-3 h-3" />
              <span className="hidden sm:inline">{juryAutoPilot ? 'AUTO-PILOT: ON' : 'AUTO-PILOT'}</span>
            </button>
          )}

          {/* Voice Comms Toggle */}
          <button
            onClick={toggleVoiceComms}
            className={`p-1.5 rounded border transition-all clip-chamfer-sm ${
              voiceCommsEnabled 
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 glow-emerald' 
                : 'bg-slate-900 border-slate-700 text-slate-500'
            }`}
            title={voiceCommsEnabled ? 'AI Voice Alerts Active' : 'Voice Alerts Muted'}
          >
            {voiceCommsEnabled ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5" />}
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded border transition-all clip-chamfer-sm ${
              soundMuted 
                ? 'bg-slate-900 border-slate-700 text-slate-500' 
                : 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 glow-cyan'
            }`}
            title={soundMuted ? 'Unmute Tactical Audio' : 'Mute Tactical Audio'}
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Officer Trainee Badge */}
          <button
            onClick={() => setShowEditProfile(true)}
            className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 px-2 py-1 rounded clip-chamfer-sm text-slate-300 transition-all text-left shadow"
          >
            <div className="w-5 h-5 rounded bg-cyan-950 border border-cyan-500/50 flex items-center justify-center">
              <User className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="hidden xl:block">
              <div className="font-bold text-[10px] leading-tight text-slate-100">{traineeProfile.rank} {traineeProfile.name}</div>
              <div className="text-[8px] text-cyan-400 truncate max-w-[100px] leading-none">{traineeProfile.unit}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Edit Trainee Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel-obsidian border border-cyan-500/40 p-6 rounded-xl max-w-md w-full space-y-4 shadow-2xl clip-chamfer-corner">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-cyan-500/20 pb-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>OFFICER TRAINEE CREDENTIALS</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">OFFICER NAME:</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] block mb-1">MILITARY RANK:</label>
                <input
                  type="text"
                  value={rank}
                  onChange={e => setRank(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] block mb-1">UNIT / FORMATION / ACADEMY:</label>
                <input
                  type="text"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowEditProfile(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded text-xs clip-chamfer-sm"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveProfile}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded font-bold text-xs glow-cyan clip-chamfer-sm"
              >
                SAVE CREDENTIALS
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};


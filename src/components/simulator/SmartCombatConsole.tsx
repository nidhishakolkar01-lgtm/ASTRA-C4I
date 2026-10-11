import React, { useState, useEffect } from 'react';
import { useSimulator } from '../../context/SimulatorContext';
import { DRONE_DATABASE } from '../../data/droneDatabase';
import { DroneCategory, SensorMode } from '../../types/simulation';
import { 
  Crosshair, 
  Target, 
  Zap, 
  ShieldAlert, 
  Radio, 
  Flame, 
  Eye, 
  Sun, 
  Compass, 
  Layers, 
  Award, 
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Play,
  Pause,
  Maximize2,
  Lock,
  Unlock,
  Shield,
  Gauge,
  Activity
} from 'lucide-react';
import { RadarScreen } from './RadarScreen';
import { AcousticRFScope } from './AcousticRFScope';

interface SmartCombatConsoleProps {
  onOpenAAR?: () => void;
  onOpenScenarios?: () => void;
  onOpenInstructor?: () => void;
}

export const SmartCombatConsole: React.FC<SmartCombatConsoleProps> = ({
  onOpenAAR,
  onOpenScenarios,
  onOpenInstructor
}) => {
  const { 
    drones, 
    selectedDroneId, 
    selectDrone, 
    selectedWeaponId, 
    selectWeapon, 
    weapons, 
    fireWeapon, 
    classifyDrone, 
    sensorMode, 
    setSensorMode, 
    radarContacts, 
    radarSweepDeg, 
    baseHealth, 
    missionState, 
    elapsedTimeSec, 
    activeScenario, 
    lastMissionResult,
    eventLogs,
    resetSimulation,
    pauseSimulation,
    resumeSimulation,
    masterArm,
    toggleMasterArm,
    setMasterArm
  } = useSimulator();

  const [radarRangeScale, setRadarRangeScale] = useState<number>(2500);
  const [showExpandedRadar, setShowExpandedRadar] = useState<boolean>(false);
  
  // Tactical Warning & Recoil Visual States
  const [armWarningFlash, setArmWarningFlash] = useState<boolean>(false);
  const [fireKickAnim, setFireKickAnim] = useState<boolean>(false);

  // Active flying drones
  const activeDrones = drones.filter(d => d.status === 'flying');
  const selectedDrone = drones.find(d => d.instanceId === selectedDroneId);
  const selectedSpec = selectedDrone ? DRONE_DATABASE[selectedDrone.specId] : null;
  const activeWeapon = weapons[selectedWeaponId];

  // Auto-Select the best countermeasure based on drone spec
  const getRecommendedWeaponId = (specId?: string): string => {
    if (!specId) return 'rf_jammer_directional';
    const spec = DRONE_DATABASE[specId];
    if (!spec) return 'rf_jammer_directional';

    if (spec.category === 'swarm_member') return 'hpm_emp_emitter';
    if (spec.category === 'loitering_munition') return 'laser_dew_system';
    if (spec.category === 'fpv_kamikaze') return 'laser_dew_system';
    if (spec.category === 'heavy_hexacopter') return 'ciws_30mm_autocannon';
    if (spec.category === 'decoy_drone') return 'rf_jammer_directional';
    return 'rf_jammer_directional';
  };

  const recommendedWeaponId = selectedSpec ? getRecommendedWeaponId(selectedSpec.id) : null;
  const isRecommendedActive = recommendedWeaponId === selectedWeaponId;

  // Range calculation
  const isTargetInRange = selectedDrone && activeWeapon
    ? selectedDrone.distanceToBase <= activeWeapon.effectiveRange
    : false;

  // Execute fire with Master Arm safety check
  const handleFireWithSafetyCheck = (targetId?: string) => {
    if (masterArm === 'SAFE') {
      // Toggle to ARMED directly on click or flash warning
      setArmWarningFlash(true);
      setTimeout(() => setArmWarningFlash(false), 1200);
      return;
    }

    setFireKickAnim(true);
    setTimeout(() => setFireKickAnim(false), 240);
    fireWeapon(targetId);
  };

  // 1-Click Smart Engage: Automatically arms weapon, chooses recommended countermeasure, and fires with safety bypass
  const handleSmartEngage = () => {
    if (!selectedDrone) return;
    setMasterArm('ARMED');
    const recId = getRecommendedWeaponId(selectedDrone.specId);
    selectWeapon(recId);
    setFireKickAnim(true);
    setTimeout(() => setFireKickAnim(false), 240);
    // Directly bypass safety interlock for atomic 1-click execution
    fireWeapon(selectedDrone.instanceId, true);
  };

  // Lock nearest threat
  const handleLockNearest = () => {
    if (activeDrones.length === 0) return;
    const sorted = [...activeDrones].sort((a, b) => a.distanceToBase - b.distanceToBase);
    selectDrone(sorted[0].instanceId);
    const bestWpn = getRecommendedWeaponId(sorted[0].specId);
    selectWeapon(bestWpn);
  };

  // Remaining time
  const remainingTime = Math.max(0, activeScenario.timeLimitSec - elapsedTimeSec);

  // Recent tactical event
  const latestEvent = eventLogs.length > 0 ? eventLogs[eventLogs.length - 1] : null;

  // Calculate closure rate (Vc in m/s) and time to breach (Tgo in sec)
  const calculateKinematics = (drone: typeof drones[0]) => {
    const vx = drone.velocity[0] || 0;
    const vy = drone.velocity[1] || 0;
    const vz = drone.velocity[2] || 0;
    const px = drone.position[0];
    const py = drone.position[1];
    const pz = drone.position[2];

    const dist = Math.sqrt(px * px + py * py + pz * pz);
    if (dist <= 0) return { vc: 0, tgo: 999 };

    // Radial velocity towards base (dot product of velocity and unit vector to base)
    const dot = -(px * vx + py * vy + pz * vz);
    const vc = Math.round((dot / dist) * 10) / 10;
    const tgo = vc > 0.5 ? Math.max(0, Math.round((dist / vc) * 10) / 10) : 999;
    return { vc, tgo };
  };

  return (
    <div className={`absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none overflow-hidden font-mono z-10 ${fireKickAnim ? 'animate-weapon-kick' : ''}`}>
      
      {/* ========================================================= */}
      {/* 4 CORNER TACTICAL ATTITUDE BRACKETS (NATO HUD SYMBOLOGY) */}
      {/* ========================================================= */}
      <div className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 border-cyan-500/40 pointer-events-none flex flex-col justify-start pl-1 pt-1 text-[8px] text-cyan-500/60 font-mono">
        <span>+14°</span>
      </div>
      <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-cyan-500/40 pointer-events-none flex flex-col items-end pr-1 pt-1 text-[8px] text-cyan-500/60 font-mono">
        <span>FOV 55°</span>
      </div>
      <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 border-cyan-500/40 pointer-events-none flex flex-col justify-end pl-1 pb-1 text-[8px] text-cyan-500/60 font-mono">
        <span>MSL 240m</span>
      </div>
      <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 border-cyan-500/40 pointer-events-none flex flex-col items-end justify-end pr-1 pb-1 text-[8px] text-cyan-500/60 font-mono">
        <span>STANAG-4586</span>
      </div>

      {/* ========================================================= */}
      {/* TOP COMPONENT: STATUS HEADER & DYNAMIC HEADING COMPASS TAPE */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-1.5 w-full">
        {/* Top Operational Status Bar */}
        <div className="glass-panel-obsidian border border-cyan-500/30 px-2.5 py-1 rounded-lg shadow-xl pointer-events-auto flex items-center justify-between">
          {/* Left: System Title & Drill Mode */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${missionState === 'RUNNING' ? 'bg-rose-500 animate-ping' : 'bg-amber-400'}`} />
              <span className="font-extrabold text-white text-[11px] tracking-wider font-mono">
                ASTRA<span className="text-cyan-400">-C4I</span>
              </span>
              <span className="text-[9px] bg-cyan-950/80 border border-cyan-500/40 px-1.5 py-0.5 rounded text-cyan-300 font-bold clip-chamfer-sm">
                {activeScenario.title.toUpperCase()}
              </span>
            </div>

            <button
              onClick={onOpenScenarios}
              className="btn-tactical-interactive bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1 transition-all clip-chamfer-sm"
            >
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>DRILLS</span>
            </button>
          </div>

          {/* Center: Dynamic Heading Compass Tape */}
          <div className="hidden md:flex items-center gap-2 bg-black/75 border border-cyan-500/20 px-3 py-0.5 rounded clip-chamfer-sm text-[10px]">
            <Compass className="w-3 h-3 text-cyan-400" />
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-400">BRG:</span>
              <span className="font-bold text-cyan-300">
                {Math.round(radarSweepDeg).toString().padStart(3, '0')}°
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">SECTOR:</span>
              <span className="text-amber-400 font-bold">
                {radarSweepDeg >= 315 || radarSweepDeg < 45 ? 'NORTH' :
                 radarSweepDeg >= 45 && radarSweepDeg < 135 ? 'EAST' :
                 radarSweepDeg >= 135 && radarSweepDeg < 225 ? 'SOUTH' : 'WEST'}
              </span>
            </div>
          </div>

          {/* Right: Master Arm Indicator, Base Health & Controls */}
          <div className="flex items-center gap-2 text-[10px]">
            {/* Master Arm Safety Switch */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMasterArm}
                className={`btn-tactical-interactive flex items-center gap-1 px-2 py-0.5 rounded font-mono font-black text-[10px] border transition-all clip-chamfer-sm ${
                  masterArm === 'ARMED'
                    ? 'bg-rose-600 text-white border-rose-400 shadow glow-rose animate-pulse'
                    : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50'
                }`}
                title="Master Arm Toggle (Press [A])"
              >
                {masterArm === 'ARMED' ? (
                  <>
                    <Unlock className="w-3 h-3 text-white" />
                    <span>ARMED [A]</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>SAFE [A]</span>
                  </>
                )}
              </button>
            </div>

            {/* Base Health Integrity */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              <span className="text-[9px] text-slate-400">BASE:</span>
              <div className="w-12 bg-slate-800 h-1.5 rounded overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${baseHealth > 60 ? 'bg-emerald-500' : (baseHealth > 30 ? 'bg-amber-500' : 'bg-rose-500')}`}
                  style={{ width: `${baseHealth}%` }}
                />
              </div>
              <span className={`font-bold text-[10px] ${baseHealth > 60 ? 'text-emerald-400' : (baseHealth > 30 ? 'text-amber-400' : 'text-rose-400')}`}>
                {baseHealth}%
              </span>
            </div>

            {/* Drill Timer */}
            <div className="bg-slate-900/90 px-2 py-0.5 rounded border border-cyan-500/30 font-bold text-cyan-300 text-[10px] clip-chamfer-sm">
              ⏱ {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toFixed(0).padStart(2, '0')}
            </div>

            {/* Sim State Controls */}
            {missionState === 'RUNNING' ? (
              <button
                onClick={pauseSimulation}
                className="bg-slate-900 hover:bg-slate-800 p-1 rounded border border-slate-700 text-amber-400"
                title="Pause Drill"
              >
                <Pause className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={resumeSimulation}
                className="bg-emerald-600 hover:bg-emerald-500 p-1 rounded text-white"
                title="Resume Drill"
              >
                <Play className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={resetSimulation}
              className="bg-slate-900 hover:bg-slate-800 p-1 rounded border border-slate-700 text-slate-300"
              title="Reset Drill"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Threat Quick-Select Carousel Strip with Closure Rates */}
        {activeDrones.length > 0 && (
          <div className="flex items-center gap-1.5 pointer-events-auto overflow-x-auto py-0.5">
            <button
              onClick={handleLockNearest}
              className="btn-tactical-interactive bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] px-2.5 py-1 rounded flex items-center gap-1 shadow glow-rose shrink-0 clip-chamfer-sm"
            >
              <Target className="w-3 h-3" />
              <span>LOCK NEAREST ({activeDrones.length})</span>
            </button>

            <div className="flex items-center gap-1 overflow-x-auto text-[9px]">
              {activeDrones.map(d => {
                const spec = DRONE_DATABASE[d.specId];
                const isSelected = d.instanceId === selectedDroneId;
                const isCrit = spec?.threatLevel === 'CRITICAL' || spec?.threatLevel === 'HIGH';
                const { vc, tgo } = calculateKinematics(d);

                return (
                  <button
                    key={d.instanceId}
                    onClick={() => {
                      selectDrone(d.instanceId);
                      const best = getRecommendedWeaponId(d.specId);
                      selectWeapon(best);
                    }}
                    className={`px-2 py-0.5 rounded border flex items-center gap-1.5 shrink-0 transition-all clip-chamfer-sm ${
                      isSelected
                        ? 'bg-rose-950/90 border-rose-400 text-white shadow glow-rose'
                        : isCrit
                          ? 'glass-panel-subtle border-amber-500/50 hover:border-amber-400 text-amber-200'
                          : 'glass-panel-subtle border-cyan-500/40 hover:border-cyan-400 text-cyan-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-rose-400 animate-ping' : (isCrit ? 'bg-amber-400' : 'bg-cyan-400')}`} />
                    <span className="font-bold tracking-wide">{d.instanceId.toUpperCase()}</span>
                    <span className="text-slate-300 font-mono">{d.distanceToBase}m</span>
                    <span className={`text-[8px] font-bold ${vc > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {vc > 0 ? `+${vc}` : vc}m/s
                    </span>
                    {tgo < 30 && (
                      <span className="text-[8px] bg-rose-500/20 text-rose-300 px-1 rounded font-bold">
                        {tgo}s
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Safety Disengage Flash Alert */}
      {armWarningFlash && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 glass-panel-alert px-4 py-1.5 rounded-lg border border-rose-500 text-white font-mono font-bold text-[11px] flex items-center gap-2 shadow-2xl animate-bounce pointer-events-auto z-40">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>SAFETY INTERLOCK ACTIVE • PRESS [A] OR CLICK ARM FIRST</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* MIDDLE SECTION: FLOATING SENSOR DECK (LEFT) & TARGET POD (RIGHT) */}
      {/* ========================================================= */}
      <div className="flex items-start justify-between w-full pointer-events-none my-auto">
        {/* Left Floating Deck: Compact Radar & Sensor Modes */}
        <div className="pointer-events-auto flex flex-col gap-1.5 w-48">
          {/* Sensor Optic Switcher Strip */}
          <div className="glass-panel-obsidian p-1.5 rounded-lg shadow-xl flex flex-col gap-1 clip-chamfer-sm">
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider px-0.5 flex justify-between">
              <span>SENSOR OPTICS</span>
              <span className="text-cyan-400">{sensorMode.toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[9px]">
              <button
                onClick={() => setSensorMode('daylight')}
                className={`py-1 px-1.5 rounded flex items-center gap-1 transition-all clip-chamfer-sm ${
                  sensorMode === 'daylight' ? 'bg-cyan-600 text-white font-bold glow-cyan' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Sun className="w-2.5 h-2.5 text-amber-400" />
                <span>DAYLIGHT</span>
              </button>

              <button
                onClick={() => setSensorMode('nvg')}
                className={`py-1 px-1.5 rounded flex items-center gap-1 transition-all clip-chamfer-sm ${
                  sensorMode === 'nvg' ? 'bg-emerald-600 text-white font-bold glow-emerald' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Eye className="w-2.5 h-2.5 text-emerald-400" />
                <span>NVG GEN-3</span>
              </button>

              <button
                onClick={() => setSensorMode('flir_white')}
                className={`py-1 px-1.5 rounded flex items-center gap-1 transition-all clip-chamfer-sm ${
                  sensorMode === 'flir_white' ? 'bg-rose-600 text-white font-bold glow-rose' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Flame className="w-2.5 h-2.5 text-orange-400" />
                <span>FLIR WHT</span>
              </button>

              <button
                onClick={() => setSensorMode('flir_ironbow')}
                className={`py-1 px-1.5 rounded flex items-center gap-1 transition-all clip-chamfer-sm ${
                  sensorMode === 'flir_ironbow' ? 'bg-amber-600 text-white font-bold glow-amber' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Flame className="w-2.5 h-2.5 text-purple-400" />
                <span>IRONBOW</span>
              </button>
            </div>
          </div>

          {/* Mini Interactive PPI Radar Scope (Scaled to 144x144px) */}
          <div className="glass-panel-obsidian p-2 rounded-lg shadow-xl flex flex-col items-center clip-chamfer-corner">
            <div className="w-full flex items-center justify-between pb-1 border-b border-cyan-500/20 text-[9px] text-cyan-400 font-bold">
              <span className="flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                AESA PPI
              </span>

              {/* Range Scale Toggle */}
              <div className="flex items-center gap-0.5 bg-black/60 px-1 py-0.5 rounded border border-slate-800 text-[8px]">
                {[1000, 2500, 5000].map(r => (
                  <button
                    key={r}
                    onClick={() => setRadarRangeScale(r)}
                    className={`px-1 py-0.2 rounded font-bold transition-all ${
                      radarRangeScale === r ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {(r / 1000).toFixed(0)}K
                  </button>
                ))}
                <button
                  onClick={() => setShowExpandedRadar(true)}
                  className="ml-0.5 text-cyan-400 hover:text-white"
                  title="Expand Full Radar Station"
                >
                  <Maximize2 className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Radar Scope Viewport (w-36 h-36 = 144px, center = 72px) */}
            <div className="relative w-36 h-36 rounded-full border border-cyan-500/40 bg-slate-950/90 overflow-hidden my-1.5 flex items-center justify-center shadow-inner">
              {/* Distance Rings */}
              <div className="absolute w-9 h-9 rounded-full border border-cyan-500/20" />
              <div className="absolute w-18 h-18 rounded-full border border-cyan-500/25" />
              <div className="absolute w-27 h-27 rounded-full border border-cyan-500/30" />
              <div className="absolute w-36 h-36 rounded-full border border-cyan-500/40" />

              {/* Crosshair lines */}
              <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-500/20" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-500/20" />

              {/* Cardinal Labels */}
              <span className="absolute top-0.5 text-[7px] text-cyan-400 font-bold">N</span>
              <span className="absolute right-1 text-[7px] text-cyan-400 font-bold">E</span>
              <span className="absolute bottom-0.5 text-[7px] text-cyan-400 font-bold">S</span>
              <span className="absolute left-1 text-[7px] text-cyan-400 font-bold">W</span>

              {/* Rotating Sweep Beam */}
              <div
                style={{ transform: `rotate(${radarSweepDeg - 90}deg)` }}
                className="absolute inset-0 origin-center pointer-events-none"
              >
                <div 
                  className="w-1/2 h-full ml-auto bg-gradient-to-l from-cyan-400/40 to-transparent" 
                  style={{ clipPath: 'polygon(100% 50%, 0% 0%, 0% 100%)' }} 
                />
              </div>

              {/* Center Base Outpost Dot */}
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow glow-cyan z-10" />

              {/* Radar Contacts */}
              {radarContacts.map(contact => {
                const azRad = ((contact.azimuthDeg - 90) * Math.PI) / 180;
                const normalizedDist = (Math.min(radarRangeScale, contact.rangeMeters) / radarRangeScale) * 65;
                const x = 72 + Math.cos(azRad) * normalizedDist;
                const y = 72 + Math.sin(azRad) * normalizedDist;
                const isSelected = contact.id === selectedDroneId;
                const drone = drones.find(d => d.instanceId === contact.id);

                const opacity = isSelected ? 1.0 : Math.max(0.3, 1.0 - (contact.blipAge || 0) * 0.7);

                return (
                  <div
                    key={contact.id}
                    onClick={() => {
                      selectDrone(contact.id);
                      if (drone) {
                        const best = getRecommendedWeaponId(drone.specId);
                        selectWeapon(best);
                      }
                    }}
                    style={{ 
                      left: `${x}px`, 
                      top: `${y}px`,
                      opacity
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full cursor-pointer transition-all flex items-center justify-center ${
                      isSelected
                        ? 'bg-rose-500 ring-2 ring-rose-500/40 scale-125 z-20 animate-pulse'
                        : 'bg-amber-400 hover:scale-125 hover:bg-white z-10'
                    }`}
                    title={`Click to Lock Track: ${contact.id} (${contact.rangeMeters}m)`}
                  >
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>
                );
              })}
            </div>

            <div className="w-full flex justify-between text-[8px] text-slate-400 px-0.5 font-mono">
              <span>{radarContacts.length} TRK</span>
              <span className="text-cyan-400 font-bold">{Math.round(radarSweepDeg).toString().padStart(3, '0')}°</span>
              <span className="text-emerald-400 cursor-pointer hover:underline" onClick={() => setShowExpandedRadar(true)}>
                EXPAND
              </span>
            </div>
          </div>
        </div>

        {/* Right Floating Deck: Target FLIR Reconnaissance Pod & AI Weapon Recommendation */}
        {selectedDrone && selectedSpec ? (
          <div
            key={`inspector-${selectedDrone.instanceId}`}
            className="pointer-events-auto w-68 glass-panel-obsidian p-2.5 rounded-xl shadow-2xl text-[11px] space-y-2 clip-chamfer-corner border border-cyan-500/40 animate-slide-in-right holo-scan-overlay"
          >
            {/* Header with Close / Unlock */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <div>
                  <div className="font-extrabold text-rose-300 text-[11px] uppercase font-mono leading-tight">{selectedDrone.instanceId}</div>
                  <div className="text-[9px] text-slate-400 leading-tight">{selectedSpec.name}</div>
                </div>
              </div>

              <button
                onClick={() => selectDrone(null)}
                className="btn-tactical-interactive text-[9px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 clip-chamfer-sm"
              >
                UNLOCK
              </button>
            </div>

            {/* Telemetry Grid */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-950/70 p-1.5 rounded border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 block text-[8px]">RANGE:</span>
                <span className="font-bold text-cyan-300">{selectedDrone.distanceToBase} m</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8px]">ALTITUDE:</span>
                <span className="font-bold text-slate-200">{Math.round(selectedDrone.position[1])} m</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8px]">RCS SIGNATURE:</span>
                <span className="font-bold text-slate-200">{selectedSpec.rcs} m²</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8px]">CLOSURE (Vc):</span>
                {(() => {
                  const { vc, tgo } = calculateKinematics(selectedDrone);
                  return (
                    <span className={`font-bold ${vc > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {vc > 0 ? `+${vc}` : vc}m/s {tgo < 90 ? `(${tgo}s)` : ''}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Target Health Bar */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-slate-400">INTEGRITY:</span>
                <span className="text-cyan-400 font-bold">{selectedDrone.health}/{selectedDrone.maxHealth} HP</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden border border-slate-800">
                <div
                  className="bg-rose-500 h-full transition-all duration-300"
                  style={{ width: `${(selectedDrone.health / selectedDrone.maxHealth) * 100}%` }}
                />
              </div>
            </div>

            {/* Live Acoustic & RF Signature Oscilloscope */}
            <AcousticRFScope
              spec={selectedSpec}
              distanceMeters={selectedDrone.distanceToBase}
              rfNoiseLevel={activeScenario.rfNoiseLevel}
            />

            {/* AI Doctrine Recommendation Card */}
            <div className="bg-amber-950/40 border border-amber-500/60 p-2 rounded-lg space-y-1 clip-chamfer-sm">
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  AI ROE RECOMMENDATION
                </span>
                <span className="bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded text-[7px] font-bold">OPTIMAL</span>
              </div>

              <div className="font-bold text-white text-[10px] truncate">
                {weapons[recommendedWeaponId || 'rf_jammer_directional']?.name}
              </div>

              {/* 1-Click Smart Engage Button */}
              <button
                onClick={handleSmartEngage}
                className="btn-tactical-interactive w-full mt-1 bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold py-1.5 px-2 rounded text-[10px] flex items-center justify-center gap-1.5 shadow-lg glow-amber transition-all clip-chamfer-sm"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                <span>SMART ENGAGE (AUTO-FIRE)</span>
              </button>
            </div>

            {/* Quick 1-Click Classification Buttons */}
            <div className="space-y-1">
              <span className="text-[8px] text-slate-400 font-bold block">INTEL CLASSIFICATION:</span>
              <div className="grid grid-cols-3 gap-1 text-[8px]">
                {[
                  { id: 'micro_quadcopter', label: 'MAVIC' },
                  { id: 'fpv_kamikaze', label: 'FPV' },
                  { id: 'loitering_munition', label: 'SHAHED' },
                  { id: 'heavy_hexacopter', label: 'HEXACOP' },
                  { id: 'swarm_member', label: 'SWARM' },
                  { id: 'decoy_drone', label: 'DECOY' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => classifyDrone(selectedDrone.instanceId, cat.id as DroneCategory)}
                    className="btn-tactical-interactive bg-slate-900/90 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 py-0.5 px-1 rounded text-slate-300 hover:text-cyan-300 transition-all font-mono truncate clip-chamfer-sm"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="pointer-events-auto w-56 glass-panel-obsidian p-2.5 rounded-xl shadow-xl text-[10px] text-slate-400 space-y-1.5 clip-chamfer-corner border border-cyan-500/20 animate-slide-in-right holo-scan-overlay">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold border-b border-cyan-500/20 pb-1 text-[10px]">
              <Crosshair className="w-3.5 h-3.5" />
              <span>FIRE CONTROL</span>
            </div>
            <p className="text-[9px] text-slate-400 leading-snug">
              Click any 3D HUD target bracket or radar blip to slave weapons.
            </p>
            <button
              onClick={handleLockNearest}
              className="btn-tactical-interactive w-full bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold py-1 px-2 rounded text-[10px] transition-all clip-chamfer-sm"
            >
              LOCK NEAREST [TAB]
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* BOTTOM SECTION: TACTICAL WEAPON PYLONS & PNEUMATIC TRIGGER */}
      {/* ========================================================= */}
      <div className="flex flex-col items-center gap-1 pointer-events-auto w-full max-w-4xl mx-auto animate-panel-enter">
        <div className="w-full glass-panel-obsidian p-1.5 rounded-xl shadow-2xl flex flex-col gap-1.5 clip-chamfer-corner border border-cyan-500/30 holo-scan-overlay">
          {/* Tactical Weapon Station Pylons */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-1.5">
            {Object.values(weapons).map((weapon, idx) => {
              const isSelected = weapon.id === selectedWeaponId;
              const isRecommended = weapon.id === recommendedWeaponId;
              const inRange = selectedDrone ? selectedDrone.distanceToBase <= weapon.effectiveRange : true;

              return (
                <button
                  key={weapon.id}
                  onClick={() => selectWeapon(weapon.id)}
                  className={`btn-tactical-interactive p-1.5 rounded-lg text-left transition-all relative flex flex-col justify-between border clip-chamfer-sm ${
                    isSelected
                      ? 'bg-rose-950/80 border-rose-400 shadow glow-rose scale-[1.02]'
                      : isRecommended
                        ? 'bg-amber-950/40 border-amber-400/80 shadow glow-amber'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {/* Station Number & Badge */}
                  <div className="flex items-center justify-between text-[7px] font-mono">
                    <span className="text-slate-500 font-bold">STN {idx + 1}</span>
                    <span className={`font-bold px-1 rounded ${
                      weapon.category === 'soft_kill' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {weapon.category === 'soft_kill' ? 'SOFT' : 'HARD'}
                    </span>
                    {isRecommended && (
                      <span className="bg-amber-500 text-black font-extrabold px-1 rounded animate-pulse">
                        REC
                      </span>
                    )}
                  </div>

                  {/* Weapon Name */}
                  <div className="font-bold text-[10px] text-white truncate my-0.5 font-mono">
                    {weapon.name}
                  </div>

                  {/* Range & Capacitors / Ammo Link Indicator */}
                  <div className="text-[8px] text-slate-400 flex justify-between font-mono items-center">
                    <span>{weapon.effectiveRange}m</span>
                    <span className={inRange ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {weapon.ammoCapacity === -1 ? 'PWR 100%' : `${weapon.currentAmmo} RND`}
                    </span>
                  </div>

                  {/* Visual Energy / Ammo Mini Bar */}
                  <div className="w-full bg-slate-950 h-0.5 rounded mt-0.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${weapon.category === 'soft_kill' ? 'bg-cyan-400' : 'bg-rose-500'}`}
                      style={{ 
                        width: weapon.ammoCapacity === -1 
                          ? '100%' 
                          : `${(weapon.currentAmmo / weapon.ammoCapacity) * 100}%` 
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Primary Action Engagement Bar with Safety Gate */}
          <div className="flex items-center justify-between pt-1 border-t border-cyan-500/20 gap-3">
            {/* Active Weapon Intel & Master Arm Status */}
            <div className="text-[10px] text-slate-300 truncate flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-slate-500 font-mono">ARM:</span>
                <button
                  type="button"
                  onClick={toggleMasterArm}
                  title="Toggle Master Arm Interlock [Press 'A']"
                  className={`font-bold font-mono text-[9px] px-1.5 py-0.2 rounded cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                    masterArm === 'ARMED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {masterArm} [A]
                </button>
              </div>
              <span className="font-bold text-cyan-400">{activeWeapon.name}:</span>
              <span className="text-slate-400 text-[9px] truncate">{activeWeapon.description}</span>
            </div>

            {/* Heavy Pneumatic Fire Trigger Button */}
            <button
              onClick={() => handleFireWithSafetyCheck()}
              disabled={missionState !== 'RUNNING'}
              className={`btn-tactical-interactive px-5 py-1.5 rounded-lg font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-1.5 shadow-xl shrink-0 clip-chamfer-sm ${
                missionState !== 'RUNNING'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : masterArm === 'SAFE'
                    ? 'bg-amber-600 hover:bg-amber-500 text-black font-extrabold shadow'
                    : selectedDrone && isTargetInRange
                      ? 'bg-rose-600 hover:bg-rose-500 text-white glow-rose animate-pulse'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white glow-cyan'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>
                {masterArm === 'SAFE' 
                  ? `SAFETY ON [PRESS A]` 
                  : selectedDrone
                    ? (isTargetInRange ? `ENGAGE [SPACE]` : `OUT OF RANGE`)
                    : `DISCHARGE`}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Tactical Event Feed */}
        {latestEvent && (
          <div className="text-[9px] text-slate-400 bg-black/75 px-2.5 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1.5 clip-chamfer-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold text-cyan-300">C4I:</span>
            <span className="truncate max-w-xl">{latestEvent.details}</span>
          </div>
        )}
      </div>

      {/* Fullscreen AESA Radar Modal */}
      {showExpandedRadar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 pointer-events-auto">
          <RadarScreen onClose={() => setShowExpandedRadar(false)} />
        </div>
      )}

      {/* Mission Debriefing Modal Overlay */}
      {missionState === 'COMPLETED' && lastMissionResult && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-4 pointer-events-auto select-none">
          <div className="glass-panel-obsidian border-2 border-cyan-500/70 rounded-2xl max-w-xl w-full p-6 font-mono shadow-2xl space-y-5 glow-cyan clip-chamfer-corner animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div>
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <span>DSSC DEFENCE SERVICES STAFF COLLEGE • EXERCISE DEBRIEFING</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  DRILL CONCLUDED: {lastMissionResult.scenarioTitle.toUpperCase()}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">TACTICAL RATING</span>
                <span className={`text-sm font-bold px-2.5 py-0.5 rounded clip-chamfer-sm ${
                  lastMissionResult.evaluation.overallTacticalRating.startsWith('Alpha')
                    ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                    : lastMissionResult.evaluation.overallTacticalRating.startsWith('Bravo')
                      ? 'bg-cyan-950 border border-cyan-500 text-cyan-300'
                      : lastMissionResult.evaluation.overallTacticalRating.startsWith('Charlie')
                        ? 'bg-amber-950 border border-amber-500 text-amber-300'
                        : 'bg-rose-950 border border-rose-500 text-rose-300'
                }`}>
                  {lastMissionResult.evaluation.overallTacticalRating}
                </span>
              </div>
            </div>

            {/* Score & Key Outcome Banner */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl clip-chamfer-sm">
                <span className="text-[10px] text-slate-400 block mb-0.5">FINAL SCORE</span>
                <span className="text-2xl font-bold text-cyan-400">{lastMissionResult.evaluation.finalScore}</span>
                <span className="text-[9px] text-slate-500 block">/ 1000 PTS</span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl clip-chamfer-sm">
                <span className="text-[10px] text-slate-400 block mb-0.5">NEUTRALIZED</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {lastMissionResult.threatsNeutralized}
                  <span className="text-xs text-slate-500"> / {drones.length}</span>
                </span>
                <span className="text-[9px] text-emerald-500/80 block">HOSTILES DOWN</span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl clip-chamfer-sm">
                <span className="text-[10px] text-slate-400 block mb-0.5">BASE INTEGRITY</span>
                <span className={`text-2xl font-bold ${
                  lastMissionResult.baseHealthRemaining > 60
                    ? 'text-emerald-400'
                    : (lastMissionResult.baseHealthRemaining > 20 ? 'text-amber-400' : 'text-rose-400')
                }`}>
                  {lastMissionResult.baseHealthRemaining}%
                </span>
                <span className="text-[9px] text-slate-500 block">SURVIVED</span>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-slate-900/70 border border-cyan-500/20 p-3.5 rounded-xl space-y-1.5 text-xs clip-chamfer-sm">
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>COMMAND POST AFTER-ACTION ASSESSMENT:</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {lastMissionResult.evaluation.recommendations[0] || 'Interception executed in accordance with Indian Army Counter-Drone Doctrine.'}
              </p>
            </div>

            {/* Navigation & Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-3">
              <button
                onClick={resetSimulation}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all clip-chamfer-sm"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span>REPLAY DRILL</span>
              </button>

              <button
                onClick={() => {
                  if (onOpenAAR) onOpenAAR();
                }}
                className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-xl glow-cyan flex items-center gap-2 transition-all flex-1 justify-center clip-chamfer-sm"
              >
                <Award className="w-4 h-4 text-white" />
                <span>OPEN COMPLETE AFTER-ACTION REVIEW (AAR)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


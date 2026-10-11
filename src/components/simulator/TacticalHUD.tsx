import React from 'react';
import { useSimulator } from '../../context/SimulatorContext';
import { SensorMode } from '../../types/simulation';
import { DRONE_DATABASE } from '../../data/droneDatabase';
import { Sun, Eye, Flame, Compass, Volume2, Shield, Activity, Crosshair } from 'lucide-react';

export const TacticalHUD: React.FC = () => {
  const { 
    sensorMode, 
    setSensorMode, 
    selectedDroneId, 
    drones, 
    acousticContact, 
    baseHealth,
    elapsedTimeSec,
    activeScenario
  } = useSimulator();

  const selectedDrone = drones.find(d => d.instanceId === selectedDroneId);
  const selectedSpec = selectedDrone ? DRONE_DATABASE[selectedDrone.specId] : null;

  return (
    <div className="flex flex-col gap-3 pointer-events-auto select-none">
      {/* Sensor Mode Switcher Bar */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/80 shadow-2xl">
        <span className="text-[10px] uppercase font-mono px-2 text-slate-400 font-semibold tracking-wider">
          OPTICAL / EO-IR:
        </span>

        <button
          onClick={() => setSensorMode('daylight')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
            sensorMode === 'daylight'
              ? 'bg-cyan-600 text-white shadow-lg glow-cyan'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>DAYLIGHT</span>
        </button>

        <button
          onClick={() => setSensorMode('nvg')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
            sensorMode === 'nvg'
              ? 'bg-emerald-600 text-white shadow-lg glow-emerald'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>NVG (GEN-3)</span>
        </button>

        <button
          onClick={() => setSensorMode('flir_white')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
            sensorMode === 'flir_white'
              ? 'bg-rose-600 text-white shadow-lg glow-rose'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>FLIR (WHITE-HOT)</span>
        </button>

        <button
          onClick={() => setSensorMode('flir_ironbow')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
            sensorMode === 'flir_ironbow'
              ? 'bg-amber-600 text-white shadow-lg glow-amber'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-purple-400" />
          <span>FLIR (IRONBOW)</span>
        </button>
      </div>

      {/* Target Telemetry Card (If a target is selected) */}
      {selectedDrone && selectedSpec ? (
        <div className="bg-slate-900/95 backdrop-blur-md p-3.5 rounded-lg border border-cyan-500/50 shadow-2xl w-80 text-xs font-mono space-y-2.5">
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="font-bold text-cyan-300 uppercase tracking-wider">{selectedDrone.instanceId}</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              selectedDrone.status === 'flying' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {selectedDrone.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">DISTANCE:</span>
              <span className="font-bold text-cyan-300">{selectedDrone.distanceToBase} m</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ALTITUDE:</span>
              <span className="font-bold text-slate-200">{Math.round(selectedDrone.position[1])} m AGL</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ESTIMATED RCS:</span>
              <span className="font-bold text-slate-200">{selectedSpec.rcs} m²</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">THERMAL SIG:</span>
              <span className="font-bold text-orange-400">{(selectedSpec.thermalSignature * 100).toFixed(0)}% ({Math.round(24 + selectedSpec.thermalSignature * 65)}°C)</span>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-800">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">STRUCTURE INTEGRITY</span>
              <span className="text-cyan-400 font-bold">{selectedDrone.health}/{selectedDrone.maxHealth} HP</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-cyan-500 h-full transition-all duration-300"
                style={{ width: `${(selectedDrone.health / selectedDrone.maxHealth) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-lg border border-slate-800 w-80 text-xs font-mono text-slate-400 flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-500 animate-pulse" />
          <span>NO TRACK DESIGNATED. CLICK RADAR BLIP TO ENGAGE.</span>
        </div>
      )}

      {/* Acoustic Direction-Finding Bearing Widget */}
      {acousticContact && (
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-amber-500/40 text-xs font-mono flex items-center justify-between text-amber-300 w-80">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-400 animate-bounce" />
            <div>
              <div className="font-bold text-[11px]">ACOUSTIC ARRAY DF:</div>
              <div className="text-[10px] text-slate-400">{acousticContact.motorType}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-amber-400">BRG {acousticContact.bearingDeg}°</div>
            <div className="text-[10px] text-slate-400">{acousticContact.soundPressureLevelDb} dB @ {acousticContact.estimatedRpm} RPM</div>
          </div>
        </div>
      )}
    </div>
  );
};

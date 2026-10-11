import React, { useState } from 'react';
import { useSimulator } from '../../context/SimulatorContext';
import { DroneCategory } from '../../types/simulation';
import { CheckCircle2, AlertTriangle, ShieldQuestion, HelpCircle } from 'lucide-react';

export const ThreatClassifier: React.FC = () => {
  const { selectedDroneId, drones, classifyDrone } = useSimulator();
  const [showGuide, setShowGuide] = useState(false);

  const selectedDrone = drones.find(d => d.instanceId === selectedDroneId);
  if (!selectedDrone || selectedDrone.status === 'destroyed' || selectedDrone.status === 'captured') {
    return null;
  }

  const categories: { id: DroneCategory | 'bird_false_alarm'; label: string; desc: string; icon: string }[] = [
    { id: 'micro_quadcopter', label: 'Micro Quadcopter', desc: 'DJI/COTS 4-rotor, low RCS (0.01m²), 2.4/5.8GHz', icon: '🚁' },
    { id: 'fpv_kamikaze', label: 'FPV Kamikaze Racer', desc: 'High-speed erratic dive (45 m/s), HEAT payload', icon: '⚡' },
    { id: 'loitering_munition', label: 'Delta Loitering Munition', desc: 'Shahed/Switchblade fixed-wing, gas piston engine', icon: '✈️' },
    { id: 'swarm_member', label: 'Swarm Strike Node', desc: 'Coordinated boids formation node with mesh link', icon: '🐝' },
    { id: 'heavy_hexacopter', label: 'Heavy Bomber Hexacopter', desc: '6 arms, 82mm mortar dropper, high thermal motor heat', icon: '💣' },
    { id: 'decoy_drone', label: 'Electronic Decoy Lure', desc: 'Artificial high RCS echo / flare, bait for CIWS', icon: '🪤' },
    { id: 'bird_false_alarm', label: 'False Alarm (Avian/Kite)', desc: 'Biological track, non-threat', icon: '🦅' }
  ];

  const handleClassify = (cat: DroneCategory | 'bird_false_alarm') => {
    classifyDrone(selectedDrone.instanceId, cat);
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-md rounded-lg border border-amber-500/50 p-3 shadow-2xl font-mono text-xs text-slate-200 select-none w-80">
      <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <ShieldQuestion className="w-4 h-4" />
          <span>CLASSIFY THREAT TRACK</span>
        </div>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="text-slate-400 hover:text-cyan-400 text-[10px] flex items-center gap-1"
        >
          <HelpCircle className="w-3 h-3" />
          <span>{showGuide ? 'HIDE ROE' : 'RECOGNITION'}</span>
        </button>
      </div>

      <div className="py-2 text-[11px] text-slate-300">
        Designate classification for <span className="font-bold text-cyan-400">{selectedDrone.instanceId}</span>:
      </div>

      {/* Classification Options */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {categories.map(cat => {
          const isSelected = selectedDrone.classifiedAs === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => handleClassify(cat.id)}
              className={`w-full p-2 rounded text-left flex items-center justify-between border transition-all ${
                isSelected 
                  ? 'bg-emerald-950/70 border-emerald-400 text-emerald-300 shadow-md' 
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{cat.icon}</span>
                <div>
                  <div className="font-bold text-[11px] leading-tight">{cat.label}</div>
                  <div className="text-[9px] text-slate-400 truncate max-w-[190px]">{cat.desc}</div>
                </div>
              </div>

              {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {selectedDrone.classifiedAs && (
        <div className="mt-2 p-1.5 rounded bg-slate-950 border border-emerald-500/40 text-[10px] text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>CLASSIFIED AS: {selectedDrone.classifiedAs.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
};

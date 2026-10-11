import React, { useState } from 'react';
import { DRONE_DATABASE } from '../../data/droneDatabase';
import { DroneSpec } from '../../types/simulation';
import { BookOpen, ShieldAlert, Zap, Radio, Volume2, Flame, Crosshair, AlertTriangle } from 'lucide-react';

export const DroneThreatManual: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>('fpv_kamikaze_strike');
  const spec = DRONE_DATABASE[selectedKey] || DRONE_DATABASE['fpv_kamikaze_strike'];

  const getThreatBadge = (level: DroneSpec['threatLevel']) => {
    switch (level) {
      case 'CRITICAL': return 'bg-rose-500/20 text-rose-400 border-rose-500 glow-rose';
      case 'HIGH': return 'bg-amber-500/20 text-amber-400 border-amber-500 glow-amber';
      case 'MEDIUM': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 font-mono select-none text-xs">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-700 p-5 rounded-xl shadow-xl flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">TACTICAL INTELLIGENCE MANUAL</div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>THREAT RECOGNITION ENCYCLOPEDIA & C-UAS VULNERABILITY MATRIX</span>
          </h2>
          <p className="text-slate-400 text-[11px] mt-1">
            Visual profiles, RF signatures, thermal models, and countermeasure susceptibilities for modern battlefield UAVs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat List Sidebar */}
        <div className="space-y-2">
          <div className="text-slate-400 font-bold uppercase text-[10px] px-1 pb-1">
            IDENTIFIED COMBAT THREAT TIERS:
          </div>

          {Object.values(DRONE_DATABASE).map(item => {
            const isSelected = item.id === selectedKey;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedKey(item.id)}
                className={`w-full p-3 rounded-lg text-left transition-all border flex items-center justify-between ${
                  isSelected 
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-lg glow-cyan' 
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-[11px] leading-tight text-slate-100">{item.name}</div>
                  <div className="text-[9px] text-slate-400 uppercase mt-0.5">{item.category.replace(/_/g, ' ')}</div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getThreatBadge(item.threatLevel)}`}>
                  {item.threatLevel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Threat Detail Dossier (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-6 rounded-xl space-y-6 shadow-2xl">
          {/* Top Title & Classification */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">TARGET SPECIFICATION DOSSIER</div>
              <h3 className="text-lg font-bold text-slate-100 mt-0.5">{spec.name}</h3>
              <div className="text-slate-400 text-[11px]">{spec.description}</div>
            </div>

            <div className={`px-3 py-1.5 rounded-lg border font-bold text-xs ${getThreatBadge(spec.threatLevel)}`}>
              THREAT: {spec.threatLevel}
            </div>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-lg border border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[9px]">RADAR CROSS SECTION:</span>
              <span className="font-bold text-cyan-300">{spec.rcs} m²</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">MAX SPEED:</span>
              <span className="font-bold text-slate-200">{spec.maxSpeed} m/s (~{Math.round(spec.maxSpeed * 3.6)} km/h)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">THERMAL CONTRAST:</span>
              <span className="font-bold text-orange-400">{(spec.thermalSignature * 100).toFixed(0)}% (Hot Motor)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">ACOUSTIC LEVEL:</span>
              <span className="font-bold text-amber-300">{spec.acousticDb} dB @ 50m</span>
            </div>
          </div>

          {/* RF & Payload Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px]">
                <Radio className="w-4 h-4" />
                <span>RF CHANNELS & TELEMETRY</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Frequencies: <span className="text-cyan-300 font-bold">{spec.rfFrequencies.join(', ')} MHz</span>
              </p>
              <p className="text-slate-400 text-[10px]">
                Emits directional digital/analog control link. Interceptable via RF Waterfall scanner.
              </p>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-[11px]">
                <ShieldAlert className="w-4 h-4" />
                <span>WARHEAD & PAYLOAD THREAT</span>
              </div>
              <p className="text-slate-200 font-bold text-[11px]">{spec.payload}</p>
              <p className="text-slate-400 text-[10px]">
                Structural Armor: <span className="text-slate-200 font-bold">{spec.armor} HP</span>
              </p>
            </div>
          </div>

          {/* Countermeasure Susceptibility Matrix */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-xs">C-UAS EFFECTOR VULNERABILITY PROBABILITY</span>
              <span className="text-[10px] text-slate-400">Higher % = More Effective Mitigation</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'RF Jammer', value: spec.countermeasureSusceptibility.rfJamming, type: 'Soft-Kill' },
                { name: 'GNSS Spoofer', value: spec.countermeasureSusceptibility.gpsSpoofing, type: 'Soft-Kill' },
                { name: 'High-Power Microwave', value: spec.countermeasureSusceptibility.hpmPulse, type: 'Soft-Kill' },
                { name: 'Laser DEW', value: spec.countermeasureSusceptibility.laserDEW, type: 'Hard-Kill' },
                { name: '30mm CIWS', value: spec.countermeasureSusceptibility.kineticCIWS, type: 'Hard-Kill' },
                { name: 'Net Interceptor', value: spec.countermeasureSusceptibility.netGun, type: 'Soft-Kill' }
              ].map((eff, i) => (
                <div key={i} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-300 font-bold">{eff.name}</span>
                    <span className={`font-bold ${eff.value >= 0.75 ? 'text-emerald-400' : (eff.value >= 0.5 ? 'text-amber-400' : 'text-rose-400')}`}>
                      {(eff.value * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${eff.value >= 0.75 ? 'bg-emerald-500' : (eff.value >= 0.5 ? 'bg-amber-500' : 'bg-rose-500')}`}
                      style={{ width: `${eff.value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useSimulator } from '../../context/SimulatorContext';
import { Radio, Navigation, Zap, Flame, Crosshair, ShieldAlert, Target } from 'lucide-react';

export const WeaponStation: React.FC = () => {
  const { 
    weapons, 
    selectedWeaponId, 
    selectWeapon, 
    fireWeapon, 
    selectedDroneId, 
    drones, 
    missionState,
    activeScenario
  } = useSimulator();

  const selectedDrone = drones.find(d => d.instanceId === selectedDroneId);
  const activeWeapon = weapons[selectedWeaponId];

  // Helper Icon Resolver
  const renderIcon = (iconName: string, className: string = 'w-4 h-4') => {
    switch (iconName) {
      case 'Radio': return <Radio className={className} />;
      case 'Navigation': return <Navigation className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Crosshair': return <Crosshair className={className} />;
      case 'ShieldAlert': return <ShieldAlert className={className} />;
      default: return <Target className={className} />;
    }
  };

  const isTargetInRange = selectedDrone && activeWeapon
    ? selectedDrone.distanceToBase <= activeWeapon.effectiveRange
    : false;

  return (
    <div className="flex flex-col bg-slate-900/95 backdrop-blur-md rounded-lg border border-slate-700/80 p-3 shadow-2xl font-mono select-none w-full max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-cyan-400">
          <Target className="w-4 h-4" />
          <span className="font-bold tracking-wider">C-UAS LAYERED DEFENSE STATIONS</span>
        </div>
        <div className="text-[11px] text-slate-400">
          STATUS: <span className="text-emerald-400 font-bold">SYSTEMS ARMED & READY</span>
        </div>
      </div>

      {/* Weapon Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 my-3">
        {Object.values(weapons).map(weapon => {
          const isSelected = weapon.id === selectedWeaponId;
          const isSoftKill = weapon.category === 'soft_kill';

          return (
            <button
              key={weapon.id}
              onClick={() => selectWeapon(weapon.id)}
              className={`p-2.5 rounded-lg text-left transition-all relative flex flex-col justify-between border ${
                isSelected 
                  ? (isSoftKill ? 'bg-cyan-950/60 border-cyan-400 shadow-lg glow-cyan' : 'bg-rose-950/60 border-rose-400 shadow-lg glow-rose')
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
              }`}
            >
              {/* Category Badge */}
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  isSoftKill ? 'bg-cyan-500/20 text-cyan-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {isSoftKill ? 'SOFT-KILL' : 'HARD-KILL'}
                </span>
                {renderIcon(weapon.iconName, `w-3.5 h-3.5 ${isSelected ? (isSoftKill ? 'text-cyan-400' : 'text-rose-400') : 'text-slate-400'}`)}
              </div>

              {/* Weapon Name */}
              <div className="font-bold text-[11px] text-slate-100 leading-tight mb-2 truncate">
                {weapon.name}
              </div>

              {/* Range & Ammo */}
              <div className="text-[9px] text-slate-400 space-y-0.5">
                <div className="flex justify-between">
                  <span>MAX RNG:</span>
                  <span className="text-slate-200 font-bold">{weapon.effectiveRange}m</span>
                </div>
                <div className="flex justify-between">
                  <span>AMMO/PWR:</span>
                  <span className="text-emerald-400 font-bold">
                    {weapon.ammoCapacity === -1 ? 'UNLIMITED' : `${weapon.currentAmmo} RNDS`}
                  </span>
                </div>
              </div>

              {/* Selection Border Glow */}
              {isSelected && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Primary Fire Trigger & Tactical Weapon Overview */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-4">
        {/* Selected Weapon Specs */}
        {activeWeapon && (
          <div className="text-[11px] text-slate-300 flex-1 truncate">
            <span className="text-cyan-400 font-bold">{activeWeapon.name}: </span>
            <span className="text-slate-400">{activeWeapon.description}</span>
          </div>
        )}

        {/* Collateral Risk Warning */}
        {activeScenario.urbanCollateralSensitive && activeWeapon?.collateralRisk === 'HIGH' && (
          <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/80 px-2.5 py-1 rounded text-[10px] text-rose-300 font-bold">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>URBAN SECTOR: HIGH COLLATERAL RISK!</span>
          </div>
        )}

        {/* Engage Fire Button */}
        <button
          onClick={() => fireWeapon()}
          disabled={missionState !== 'RUNNING'}
          className={`px-6 py-2 rounded-lg font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 shadow-xl ${
            missionState !== 'RUNNING'
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : selectedDrone && isTargetInRange
                ? 'bg-rose-600 hover:bg-rose-500 text-white glow-rose animate-pulse'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white glow-cyan'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          <span>{selectedDrone ? (isTargetInRange ? 'ENGAGE TARGET [SPACE]' : 'FIRE (OUT OF RANGE)') : 'DISCHARGE WEAPON'}</span>
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Shield, Crosshair, Eye, Zap, CheckCircle2, ChevronRight, ChevronLeft, X, HelpCircle, Radio } from 'lucide-react';

interface TacticalTutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const TUTORIAL_STEPS = [
  {
    step: 1,
    badge: 'PHASE 01 // DETECTION & ACQUISITION',
    title: '3D AESA Radar & Airspace Tracking',
    description:
      'Incoming hostile drones and coordinated swarms appear on the Bottom-Left AESA Doppler Radar and as 3D NATO HUD diamond brackets in the battlefield viewport.',
    actionTip: 'Press [TAB] or click any 3D HUD target bracket / Radar blip to slave Fire Control to that hostile track.',
    hotkey: 'TAB / CLICK'
  },
  {
    step: 2,
    badge: 'PHASE 02 // MULTI-SPECTRAL SENSOR FUSION',
    title: 'Optical, Night-Vision (NVG) & FLIR Thermal',
    description:
      'In night, fog, sandstorm, or Electronic Warfare (EW) degraded scenarios, switch between Daylight EO, Gen-3 Green Phosphor NVG, White-Hot FLIR, and Ironbow Thermal.',
    actionTip: 'Press [V] to cycle sensor modes or [C] to switch between Gunner Boresight, 360° Target Inspection, and Satellite Overhead views.',
    hotkey: 'KEY [V] / [C]'
  },
  {
    step: 3,
    badge: 'PHASE 03 // THREAT CLASSIFICATION',
    title: 'Acoustic, RF & Visual Signature Identification',
    description:
      'Use the right-hand Target Inspector & Acoustic/RF Oscilloscope to distinguish commercial recon quadcopters, FPV kamikaze drones, Shahed loitering munitions, and electronic decoys.',
    actionTip: 'Click the matching classification button in the Target Inspector card to earn Decision-Tree Classification points.',
    hotkey: 'INTEL DESIGNATOR'
  },
  {
    step: 4,
    badge: 'PHASE 04 // ROE & WEAPON SELECTION',
    title: 'Soft-Kill EW vs Hard-Kill Kinetic Effectors',
    description:
      'Match the effector to the threat and Rules of Engagement (ROE): use RF Jammer [1] or GNSS Spoofer [2] in urban collateral zones, HPM EMP [3] against swarms, Fiber Laser DEW [4] against FPVs, and 30mm CIWS [5] against armored munitions.',
    actionTip: 'Press [1]-[6] to select a weapon pylon, or use the AI Doctrine Recommendation card.',
    hotkey: 'KEYS [1] - [6]'
  },
  {
    step: 5,
    badge: 'PHASE 05 // MASTER ARM & ENGAGEMENT',
    title: 'Master Arm Interlock & 1-Click Smart Engage',
    description:
      'To prevent accidental discharge, weapons start in SAFE mode. Toggle Master Arm to ARMED before firing, or click "EXECUTE SMART ENGAGE" to automatically arm, select the optimal countermeasure, and fire in one click.',
    actionTip: 'Press [A] to toggle Master Arm, then press [SPACE] to engage!',
    hotkey: '[A] + [SPACE]'
  }
];

export const TacticalTutorialOverlay: React.FC<TacticalTutorialOverlayProps> = ({ isOpen, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  if (!isOpen) return null;

  const current = TUTORIAL_STEPS[currentIdx];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-mono">
      <div className="glass-panel-obsidian border-2 border-cyan-500/70 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 glow-cyan clip-chamfer-corner">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
                DSSC WELLINGTON // OPERATOR FIELD BRIEFING
              </div>
              <div className="text-sm font-bold text-white">
                60-SECOND TACTICAL COMBAT WALKTHROUGH
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center gap-1.5">
          {TUTORIAL_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentIdx(idx)}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                idx === currentIdx ? 'bg-cyan-400 shadow glow-cyan' : idx < currentIdx ? 'bg-emerald-500/60' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Step Content Body */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
              {current.badge}
            </span>
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
              HOTKEY: {current.hotkey}
            </span>
          </div>

          <h3 className="text-base font-bold text-white">{current.title}</h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            {current.description}
          </p>

          <div className="bg-cyan-950/40 border border-cyan-500/40 p-2.5 rounded-lg flex items-start gap-2 text-[11px] text-cyan-200">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{current.actionTip}</span>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border ${
              currentIdx === 0
                ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>PREV</span>
          </button>

          <span className="text-[11px] text-slate-400">
            STEP {currentIdx + 1} OF {TUTORIAL_STEPS.length}
          </span>

          {currentIdx < TUTORIAL_STEPS.length - 1 ? (
            <button
              onClick={() => setCurrentIdx(prev => prev + 1)}
              className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg glow-cyan transition-all"
            >
              <span>NEXT PHASE</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ENTER COMBAT C2</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

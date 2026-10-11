import React, { useState, useEffect } from 'react';
import { SimulatorProvider, useSimulator } from './context/SimulatorContext';
import { Header } from './components/common/Header';
import { SimulationCanvas, CameraViewMode } from './components/simulator/SimulationCanvas';
import { SmartCombatConsole } from './components/simulator/SmartCombatConsole';
import { RFAnalyzer } from './components/simulator/RFAnalyzer';
import { ThreatClassifier } from './components/simulator/ThreatClassifier';
import { AfterActionReview } from './components/aar/AfterActionReview';
import { InstructorTerminal } from './components/instructorTerminal/InstructorTerminal';
import { ScenarioStudio } from './components/scenarioBuilder/ScenarioStudio';
import { TacticalAIAssistant } from './components/aiAdvisor/TacticalAIAssistant';
import { DroneThreatManual } from './components/droneEncyclopedia/DroneThreatManual';
import { TacticalTutorialOverlay } from './components/simulator/TacticalTutorialOverlay';
import { DEFAULT_SCENARIOS } from './data/defaultScenarios';
import { Radio, X, Activity, HelpCircle } from 'lucide-react';

const SimulatorMainView: React.FC<{ 
  onNavigateToAAR: () => void; 
  onNavigateToInstructor: () => void;
}> = ({ 
  onNavigateToAAR, 
  onNavigateToInstructor 
}) => {
  const { 
    fireWeapon, 
    selectWeapon, 
    cycleTarget, 
    cycleSensorMode, 
    toggleSound,
    toggleMasterArm,
    startScenario,
    activeScenario,
    generateProceduralMission
  } = useSimulator();

  const [showScenarioDrawer, setShowScenarioDrawer] = useState(false);
  const [showRFModal, setShowRFModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('orbit');

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        fireWeapon();
      } else if (e.code === 'KeyA' || e.key === 'a' || e.key === 'A') {
        toggleMasterArm();
      } else if (e.code === 'Digit1') {
        selectWeapon('rf_jammer_directional');
      } else if (e.code === 'Digit2') {
        selectWeapon('gps_spoofer_nav');
      } else if (e.code === 'Digit3') {
        selectWeapon('hpm_emp_emitter');
      } else if (e.code === 'Digit4') {
        selectWeapon('laser_dew_system');
      } else if (e.code === 'Digit5') {
        selectWeapon('ciws_30mm_autocannon');
      } else if (e.code === 'Digit6') {
        selectWeapon('net_interceptor_hunter');
      } else if (e.code === 'Tab') {
        e.preventDefault();
        cycleTarget();
      } else if (e.code === 'KeyV') {
        cycleSensorMode();
      } else if (e.code === 'KeyM') {
        toggleSound();
      } else if (e.code === 'KeyC') {
        // Toggle camera view
        setCameraMode(prev => prev === 'gunner' ? 'target' : (prev === 'target' ? 'orbit' : 'gunner'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fireWeapon, toggleMasterArm, selectWeapon, cycleTarget, cycleSensorMode, toggleSound]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#070b12] select-none">
      {/* 1. Full-Screen Edge-to-Edge 3D Battlefield Canvas */}
      <div className="absolute inset-0 z-0">
        <SimulationCanvas 
          externalCameraMode={cameraMode}
          onCameraModeChange={setCameraMode}
        />
      </div>

      {/* 2. Seamless Floating Modern Tactical C4I Combat Console */}
      <SmartCombatConsole 
        onOpenAAR={onNavigateToAAR}
        onOpenScenarios={() => setShowScenarioDrawer(true)}
        onOpenInstructor={onNavigateToInstructor}
      />

      {/* 3. Deep RF Spectrum Waterfall & Field Guide Toolbar */}
      <div className="absolute top-12 right-3 z-30 pointer-events-auto flex flex-col items-end">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowTutorial(true)}
            className="btn-tactical-interactive bg-slate-900/90 hover:bg-cyan-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[9px] font-mono flex items-center gap-1 shadow-lg backdrop-blur-md transition-all"
            title="Open 60-Second Interactive Operator Walkthrough"
          >
            <HelpCircle className="w-3 h-3 text-amber-400" />
            <span>GUIDE</span>
          </button>

          <button
            onClick={() => setShowRFModal(!showRFModal)}
            className="btn-tactical-interactive bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border border-slate-700/80 px-2 py-0.5 rounded text-[9px] font-mono flex items-center gap-1 shadow-lg backdrop-blur-md transition-all"
          >
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>{showRFModal ? 'HIDE RF' : 'RF SCOPE'}</span>
          </button>
        </div>

        {showRFModal && (
          <div className="mt-2 w-80 bg-slate-950/95 border border-cyan-500/50 p-3 rounded-xl shadow-2xl backdrop-blur-xl animate-slide-in-right holo-scan-overlay">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono text-cyan-400 font-bold">
              <span>EW RADIO SPECTRUM WATERFALL</span>
              <button onClick={() => setShowRFModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="mt-2">
              <RFAnalyzer />
            </div>
          </div>
        )}
      </div>

      {/* Interactive Guided Tutorial Modal */}
      <TacticalTutorialOverlay
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />

      {/* 4. Scenario Selection Modal Drawer */}
      {showScenarioDrawer && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-cyan-500/60 rounded-2xl max-w-2xl w-full p-5 font-mono shadow-2xl space-y-4 animate-panel-enter holo-scan-overlay">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="text-cyan-400 font-bold text-base flex items-center gap-2">
                <span>DSSC TACTICAL DRILL DIRECTORY (MoD PS 26247)</span>
              </div>
              <button
                onClick={() => setShowScenarioDrawer(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Select a mission or trigger procedural AI drill:</span>
              <button
                onClick={() => {
                  generateProceduralMission('Operator');
                  setShowScenarioDrawer(false);
                }}
                className="btn-tactical-interactive bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all"
              >
                ⚡ GENERATE RANDOMIZED AI SWARM DRILL
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {DEFAULT_SCENARIOS.map(sc => (
                <div
                  key={sc.id}
                  onClick={() => {
                    startScenario(sc);
                    setShowScenarioDrawer(false);
                  }}
                  className={`btn-tactical-interactive p-3.5 rounded-xl border cursor-pointer transition-all ${
                    activeScenario.id === sc.id
                      ? 'bg-cyan-950/80 border-cyan-400 shadow-xl glow-cyan text-white'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{sc.title}</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-cyan-300 font-bold">
                      {sc.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{sc.description}</p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                    <span>TERRAIN: {sc.terrain.replace('_', ' ').toUpperCase()}</span>
                    <span>THREATS: {sc.drones.length}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export function App() {
  const [activeView, setActiveView] = useState<'SIMULATOR' | 'AAR' | 'STUDIO' | 'INSTRUCTOR' | 'AI_ADVISOR' | 'MANUAL'>('SIMULATOR');

  return (
    <SimulatorProvider>
      <div className="h-screen w-screen overflow-hidden bg-[#070b12] text-slate-100 flex flex-col font-sans">
        {/* Persistent Military Header */}
        <Header activeView={activeView} setActiveView={setActiveView} />

        {/* Dynamic View Router */}
        <main className={`flex-1 relative ${activeView === 'SIMULATOR' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {activeView === 'SIMULATOR' && (
            <SimulatorMainView 
              onNavigateToAAR={() => setActiveView('AAR')} 
              onNavigateToInstructor={() => setActiveView('INSTRUCTOR')}
            />
          )}
          {activeView === 'AAR' && <div key="aar" className="animate-panel-enter"><AfterActionReview /></div>}
          {activeView === 'INSTRUCTOR' && <div key="instructor" className="animate-panel-enter"><InstructorTerminal /></div>}
          {activeView === 'STUDIO' && (
            <div key="studio" className="animate-panel-enter">
              <ScenarioStudio onLaunchMission={() => setActiveView('SIMULATOR')} />
            </div>
          )}
          {activeView === 'AI_ADVISOR' && <div key="advisor" className="animate-panel-enter"><TacticalAIAssistant /></div>}
          {activeView === 'MANUAL' && <div key="manual" className="animate-panel-enter"><DroneThreatManual /></div>}
        </main>
      </div>
    </SimulatorProvider>
  );
}

export default App;

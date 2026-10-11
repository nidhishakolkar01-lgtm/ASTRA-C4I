import React, { useState } from 'react';
import { useSimulator } from '../../context/SimulatorContext';
import { PerformanceMetrics } from './PerformanceMetrics';
import { TacticalTimeline } from './TacticalTimeline';
import { UnitAnalytics } from './UnitAnalytics';
import { MissionReportExport } from './MissionReportExport';
import { BarChart3, Clock, TrendingUp, FileText, RotateCcw, Play, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AfterActionReview: React.FC = () => {
  const { lastMissionResult, traineeProfile, resetSimulation, generateProceduralMission, startScenario, activeScenario } = useSimulator();
  const [activeTab, setActiveTab] = useState<'METRICS' | 'TIMELINE' | 'ANALYTICS' | 'REPORT'>('METRICS');

  // Trigger confetti on high score
  React.useEffect(() => {
    if (lastMissionResult && lastMissionResult.evaluation.finalScore >= 800) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [lastMissionResult]);

  if (!lastMissionResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-slate-900/60 rounded-xl border border-slate-800 font-mono">
        <BarChart3 className="w-16 h-16 text-slate-600 mb-4 animate-pulse" />
        <h3 className="text-lg font-bold text-slate-200">NO RECENT MISSION DATA</h3>
        <p className="text-xs text-slate-400 max-w-md mt-2">
          Complete a threat defense drill or launch a procedural scenario to generate an After-Action Review (AAR) dossier.
        </p>
        <button
          onClick={() => resetSimulation()}
          className="mt-6 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all glow-cyan flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          <span>START TACTICAL DRILL</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 select-none">
      {/* Top Header & Tab Navigation Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('METRICS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'METRICS'
                ? 'bg-cyan-600 text-white shadow-lg glow-cyan'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>PERFORMANCE METRICS</span>
          </button>

          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'TIMELINE'
                ? 'bg-cyan-600 text-white shadow-lg glow-cyan'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>TIMELINE & REPLAY</span>
          </button>

          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'ANALYTICS'
                ? 'bg-cyan-600 text-white shadow-lg glow-cyan'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>UNIT PROGRESSION</span>
          </button>

          <button
            onClick={() => setActiveTab('REPORT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'REPORT'
                ? 'bg-cyan-600 text-white shadow-lg glow-cyan'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>OFFICIAL REPORT DOSSIER</span>
          </button>
        </div>

        {/* Quick Replay & Next Drill Actions */}
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => resetSimulation()}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-xs transition-all border border-slate-700"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>RETRY DRILL</span>
          </button>

          <button
            onClick={() => generateProceduralMission('Operator')}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all glow-emerald"
          >
            <Zap className="w-4 h-4" />
            <span>NEXT PROCEDURAL DRILL</span>
          </button>
        </div>
      </div>

      {/* Tab Contents with Spring Entrance Transitions */}
      {activeTab === 'METRICS' && (
        <div key="tab-metrics" className="animate-panel-enter">
          <PerformanceMetrics evaluation={lastMissionResult.evaluation} />
        </div>
      )}
      {activeTab === 'TIMELINE' && (
        <div key="tab-timeline" className="animate-panel-enter">
          <TacticalTimeline 
            eventLogs={lastMissionResult.eventLogs} 
            durationSec={lastMissionResult.durationSec}
            radarHistory={lastMissionResult.radarTrackHistory}
          />
        </div>
      )}
      {activeTab === 'ANALYTICS' && (
        <div key="tab-analytics" className="animate-panel-enter">
          <UnitAnalytics traineeProfile={traineeProfile} />
        </div>
      )}
      {activeTab === 'REPORT' && (
        <div key="tab-report" className="animate-panel-enter">
          <MissionReportExport missionResult={lastMissionResult} />
        </div>
      )}
    </div>
  );
};

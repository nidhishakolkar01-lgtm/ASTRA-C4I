import React from 'react';
import { TraineeProfile } from '../../types/simulation';
import { User, Award, TrendingUp, AlertCircle, BarChart3, CheckCircle2 } from 'lucide-react';

interface Props {
  traineeProfile: TraineeProfile;
}

export const UnitAnalytics: React.FC<Props> = ({ traineeProfile }) => {
  const { skillProgression, totalMissions, averageScore, missionHistory } = traineeProfile;

  const skills = [
    { label: 'Detection Speed & Early Warning', value: skillProgression.detectionSpeed, color: 'text-cyan-400', bg: 'bg-cyan-500' },
    { label: 'Threat Classification Precision', value: skillProgression.classificationAccuracy, color: 'text-emerald-400', bg: 'bg-emerald-500' },
    { label: 'ROE & Collateral Discipline', value: skillProgression.roeCompliance, color: 'text-amber-400', bg: 'bg-amber-500' },
    { label: 'Swarm Saturation Management', value: skillProgression.swarmManagement, color: 'text-indigo-400', bg: 'bg-indigo-500' },
    { label: 'Electronic Warfare & RF Countermeasures', value: skillProgression.electronicWarfareProficiency, color: 'text-purple-400', bg: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Officer Summary Card */}
      <div className="bg-slate-900/90 border border-slate-700 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-cyan-500 flex items-center justify-center text-cyan-400">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">OFFICER TRAINEE DOSSIER</div>
            <div className="text-lg font-bold text-slate-100">{traineeProfile.rank} {traineeProfile.name}</div>
            <div className="text-cyan-400 text-[11px] font-medium">{traineeProfile.unit} | ID: {traineeProfile.id}</div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800 text-center">
            <span className="text-slate-400 text-[10px] block">TOTAL DRILLS</span>
            <span className="text-xl font-bold text-slate-100">{totalMissions}</span>
          </div>
          <div className="bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800 text-center">
            <span className="text-slate-400 text-[10px] block">AVERAGE SCORE</span>
            <span className="text-xl font-bold text-cyan-400">{averageScore} / 1000</span>
          </div>
        </div>
      </div>

      {/* Competence Matrix & Radar Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Skill Bars */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200">TACTICAL PROFICIENCY INDEX</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-3.5">
            {skills.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">{s.label}</span>
                  <span className={`font-bold ${s.color}`}>{s.value}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className={`h-full ${s.bg} transition-all duration-500`} style={{ width: `${s.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Weakness & Automated Training Recommendations */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="font-bold text-slate-200">UNIT TRAINING DIRECTIVE (AI-DIAGNOSED)</span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="text-amber-400 font-bold mb-1 flex items-center gap-1.5">
                  <span>PRIORITY DRILL:</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Recommended for advanced <strong>Swarm Saturation & High-Power Microwave (HPM)</strong> engagement drills under degraded RF jamming conditions.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>COMMENDATION:</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Demonstrates exceptional Rules of Engagement (ROE) discipline and zero collateral discharge in populated sector simulations.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 text-center">
            Assessment generated in compliance with DSSC C-UAS Training Standards.
          </div>
        </div>
      </div>
    </div>
  );
};

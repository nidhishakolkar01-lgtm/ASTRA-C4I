import React from 'react';
import { DecisionTreeEvaluation } from '../../types/simulation';
import { Target, ShieldCheck, Zap, AlertTriangle, Scale, Activity, Award } from 'lucide-react';

interface Props {
  evaluation: DecisionTreeEvaluation;
}

export const PerformanceMetrics: React.FC<Props> = ({ evaluation }) => {
  const getRatingBadge = (rating: string) => {
    if (rating.startsWith('Alpha')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500 glow-emerald';
    if (rating.startsWith('Bravo')) return 'bg-blue-500/20 text-blue-400 border-blue-500 glow-cyan';
    if (rating.startsWith('Charlie')) return 'bg-amber-500/20 text-amber-400 border-amber-500 glow-amber';
    return 'bg-rose-500/20 text-rose-400 border-rose-500 glow-rose';
  };

  const metrics = [
    {
      title: 'Detection Latency & Early Warning',
      score: evaluation.detectionScore,
      details: `Avg Latency: ${evaluation.avgDetectionLatencySec}s | Benchmark: <6.0s`,
      icon: Activity,
      color: 'cyan'
    },
    {
      title: 'Threat Classification Accuracy',
      score: evaluation.classificationScore,
      details: `${evaluation.correctClassifications}/${evaluation.totalThreats} Identified Correctly`,
      icon: Target,
      color: 'emerald'
    },
    {
      title: 'Weapon-Target Allocation (WTA)',
      score: evaluation.engagementScore,
      details: `${evaluation.optimalWeaponChoices} Optimal | ${evaluation.suboptimalWeaponChoices} Suboptimal Effectors`,
      icon: Zap,
      color: 'indigo'
    },
    {
      title: 'ROE & Collateral Damage Discipline',
      score: evaluation.roeDisciplineScore,
      details: `${evaluation.collateralIncidents} Urban Collateral Blast Incidents`,
      icon: ShieldCheck,
      color: 'amber'
    },
    {
      title: 'Resource & Magazine Economy',
      score: evaluation.resourceEfficiencyScore,
      details: 'Ammo & Capacitor Power Management Index',
      icon: Scale,
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner Grade Score */}
      <div className="bg-slate-900/90 border border-slate-700/80 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full border-4 border-cyan-500/80 flex items-center justify-center bg-slate-950 shadow-inner">
            <span className="text-2xl font-bold text-cyan-300">{evaluation.finalScore}</span>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] tracking-wider uppercase">DSSC TACTICAL COMPETENCE SCORE</div>
            <div className="text-xl font-bold text-slate-100 mt-0.5">FINAL GRADE: {evaluation.finalScore} / 1000 PTS</div>
            <div className="text-slate-400 text-[11px] mt-1">Multi-factor Decision-Tree Evaluation</div>
          </div>
        </div>

        {/* Rating Stamp Badge */}
        <div className={`px-5 py-3 rounded-lg border-2 font-bold tracking-widest text-center uppercase text-sm ${getRatingBadge(evaluation.overallTacticalRating)}`}>
          <Award className="w-5 h-5 mx-auto mb-1" />
          <span>{evaluation.overallTacticalRating}</span>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 font-bold text-[11px] truncate">{m.title}</span>
                  <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-slate-100">{m.score}</span>
                  <span className="text-slate-500 text-[10px]">/ 100</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-2 border border-slate-800">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      m.score >= 80 ? 'bg-emerald-500' : (m.score >= 50 ? 'bg-amber-500' : 'bg-rose-500')
                    }`}
                    style={{ width: `${m.score}%` }}
                  />
                </div>
              </div>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
                {m.details}
              </div>
            </div>
          );
        })}
      </div>

      {/* Doctrinal Critique & Recommendations */}
      <div className="bg-slate-900/90 border border-cyan-500/30 p-5 rounded-xl shadow-xl">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>DSSC TACTICAL DEBRIEF & OPERATIONAL LESSONS</span>
        </div>
        <ul className="space-y-2 text-slate-300 text-[11px]">
          {evaluation.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2.5 bg-slate-950/70 p-2.5 rounded border border-slate-800">
              <span className="text-cyan-400 font-bold">[{i + 1}]</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

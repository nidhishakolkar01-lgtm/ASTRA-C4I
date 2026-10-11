import React from 'react';
import { MissionResult } from '../../types/simulation';
import { Printer, Download, Shield, FileText, CheckCircle2, Award } from 'lucide-react';

interface Props {
  missionResult: MissionResult;
}

export const MissionReportExport: React.FC<Props> = ({ missionResult }) => {
  const { evaluation, traineeName, rank, unit, traineeId, scenarioTitle, durationSec, date, threatsNeutralized, threatsEscaped, baseHealthRemaining } = missionResult;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(missionResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `DSSC_AAR_${missionResult.missionId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 font-mono select-none">
      {/* Action Buttons */}
      <div className="flex justify-end gap-3 print:hidden">
        <button
          onClick={handleExportJSON}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-xs transition-all border border-slate-700"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>EXPORT TELEMETRY (.JSON)</span>
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-lg glow-cyan"
        >
          <Printer className="w-4 h-4" />
          <span>PRINT / SAVE PDF DOSSIER</span>
        </button>
      </div>

      {/* Official MoD Dossier Paper Sheet */}
      <div className="bg-slate-900 border-2 border-slate-700 p-8 rounded-xl shadow-2xl space-y-6 text-slate-200 print:bg-white print:text-black print:border-black print:p-4">
        {/* Header Block */}
        <div className="border-b-2 border-cyan-500/40 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-cyan-950/80 border border-cyan-400 rounded-lg flex items-center justify-center text-cyan-300">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="text-[10px] tracking-widest text-slate-400 uppercase">MINISTRY OF DEFENCE | DEFENCE SERVICES STAFF COLLEGE</div>
              <div className="text-lg font-bold text-slate-100 tracking-wider">AFTER-ACTION REVIEW (AAR) COMBAT EVALUATION REPORT</div>
              <div className="text-cyan-400 text-xs font-semibold">ASTRA-CUAS SIMULATION PLATFORM | PS-26247</div>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-400">
            <div>REPORT ID: <span className="text-cyan-300 font-bold">{missionResult.missionId}</span></div>
            <div>DATE: <span className="text-slate-200 font-bold">{new Date(date).toLocaleDateString()}</span></div>
            <div>SECURITY: <span className="text-emerald-400 font-bold">OFFICIAL / UNCLASSIFIED</span></div>
          </div>
        </div>

        {/* Trainee & Drill Meta Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-lg border border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">OFFICER TRAINEE:</span>
            <span className="font-bold text-slate-100">{rank} {traineeName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">UNIT & SERVICE:</span>
            <span className="font-bold text-slate-100">{unit}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">EXERCISE TITLE:</span>
            <span className="font-bold text-cyan-300">{scenarioTitle}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">DRILL DURATION:</span>
            <span className="font-bold text-slate-100">{durationSec} Seconds</span>
          </div>
        </div>

        {/* Results & Score Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center flex flex-col justify-center">
            <span className="text-slate-400 text-[10px] block uppercase">TACTICAL COMPETENCE SCORE</span>
            <span className="text-3xl font-bold text-cyan-300 my-1">{evaluation.finalScore} / 1000</span>
            <span className="text-emerald-400 font-bold text-xs">{evaluation.overallTacticalRating}</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">THREATS NEUTRALIZED:</span>
              <span className="font-bold text-emerald-400">{threatsNeutralized}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">THREATS ESCAPED:</span>
              <span className="font-bold text-rose-400">{threatsEscaped}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">BASE INTEGRITY:</span>
              <span className="font-bold text-cyan-400">{baseHealthRemaining}%</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">DETECTION SCORE:</span>
              <span className="font-bold text-cyan-300">{evaluation.detectionScore}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">CLASSIFICATION ACCURACY:</span>
              <span className="font-bold text-emerald-400">{evaluation.classificationScore}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ROE DISCIPLINE:</span>
              <span className="font-bold text-amber-400">{evaluation.roeDisciplineScore}/100</span>
            </div>
          </div>
        </div>

        {/* Tactical Critique Points */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
            OFFICIAL INSTRUCTOR DEBRIEF & OPERATIONAL FINDINGS:
          </div>
          <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-lg border border-slate-800 text-[11px] text-slate-300">
            {evaluation.recommendations.map((r, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Signature & Authentication Block */}
        <div className="pt-8 border-t border-slate-800 grid grid-cols-2 gap-8 text-[11px] text-slate-400">
          <div>
            <div className="border-b border-slate-700 pb-8 text-center text-slate-500 italic">
              [ Digitally Verified via ASTRA-CUAS Simulation Engine ]
            </div>
            <div className="text-center font-bold text-slate-300 mt-2">CHIEF INSTRUCTOR / EVALUATOR</div>
            <div className="text-center text-[10px]">Air Defence Wing, DSSC Wellington</div>
          </div>

          <div>
            <div className="border-b border-slate-700 pb-8 text-center text-slate-500 italic">
              {rank} {traineeName}
            </div>
            <div className="text-center font-bold text-slate-300 mt-2">OFFICER TRAINEE SIGNATURE</div>
            <div className="text-center text-[10px]">{unit}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

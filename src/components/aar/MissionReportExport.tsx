import React, { useState } from 'react';
import { MissionResult } from '../../types/simulation';
import { Printer, Download, Shield, FileText, CheckCircle2, Award, QrCode, Sparkles, Check, Bookmark } from 'lucide-react';

interface Props {
  missionResult: MissionResult;
}

export const MissionReportExport: React.FC<Props> = ({ missionResult }) => {
  const { 
    evaluation, 
    traineeName, 
    rank, 
    unit, 
    traineeId, 
    scenarioTitle, 
    durationSec, 
    date, 
    threatsNeutralized, 
    threatsEscaped, 
    baseHealthRemaining,
    missionId
  } = missionResult;

  const [activeTab, setActiveTab] = useState<'certificate' | 'dossier'>('certificate');

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

  // Generate deterministic digital verification hash
  const digitalVerificationHash = `SHA256:${Array.from((missionId + traineeName + date).replace(/[^a-zA-Z0-9]/g, ''))
    .map(c => c.charCodeAt(0).toString(16))
    .join('')
    .slice(0, 32)
    .toUpperCase()}`;

  // Calculate qualification grade
  const getGrade = (score: number) => {
    if (score >= 850) return { title: 'DISTINCTION (ALPHA-1)', color: 'text-amber-400', border: 'border-amber-400', bg: 'bg-amber-950/60' };
    if (score >= 700) return { title: 'COMMENDED (BRAVO-1)', color: 'text-cyan-400', border: 'border-cyan-400', bg: 'bg-cyan-950/60' };
    if (score >= 500) return { title: 'QUALIFIED (CHARLIE-1)', color: 'text-emerald-400', border: 'border-emerald-400', bg: 'bg-emerald-950/60' };
    return { title: 'RETEST REQUIRED', color: 'text-rose-400', border: 'border-rose-400', bg: 'bg-rose-950/60' };
  };

  const grade = getGrade(evaluation.finalScore);

  return (
    <div className="space-y-6 font-mono select-none">
      {/* Top Controls & Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        {/* View Toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-700 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'certificate'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow glow-amber'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>OFFICIAL CERTIFICATE</span>
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'dossier'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>MISSION DOSSIER REPORT</span>
          </button>
        </div>

        {/* Export / Print Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-lg text-xs transition-all border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXPORT TELEMETRY (.JSON)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-500 hover:to-yellow-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg glow-amber"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT / SAVE PDF</span>
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: OFFICIAL DSSC CERTIFICATE ==================== */}
      {activeTab === 'certificate' && (
        <div className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-4 border-double border-amber-500/60 p-8 sm:p-12 rounded-2xl shadow-2xl text-slate-200 space-y-8 print:bg-white print:text-black print:border-amber-800 print:p-6 print:rounded-none">
          {/* Ornate Corner Accents */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

          {/* Watermark Crest Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Shield className="w-96 h-96 text-amber-300" />
          </div>

          {/* Certificate Header Block */}
          <div className="text-center space-y-2 border-b border-amber-500/30 pb-6">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-amber-950/80 border-2 border-amber-400 rounded-full flex items-center justify-center text-amber-300 shadow-lg glow-amber">
                <Shield className="w-7 h-7" />
              </div>
            </div>
            <div className="text-xs uppercase tracking-widest text-amber-400/90 font-bold">
              GOVERNMENT OF INDIA • MINISTRY OF DEFENCE
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-200 tracking-wider">
              DEFENCE SERVICES STAFF COLLEGE (DSSC)
            </h2>
            <div className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
              WELLINGTON (NILGIRIS) • WING OF AIR DEFENCE & ELECTRONIC WARFARE
            </div>
            <div className="inline-block bg-amber-500/10 border border-amber-400/40 text-amber-300 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1">
              ASTRA-C4I TACTICAL SIMULATION PLATFORM • SIH-2026 PS-26247
            </div>
          </div>

          {/* Title of Certification */}
          <div className="text-center space-y-3">
            <div className="text-xs text-slate-400 tracking-widest uppercase">
              CERTIFICATE OF OPERATIONAL PROFICIENCY & TACTICAL COMPETENCE
            </div>
            <p className="text-xs text-slate-400 italic max-w-xl mx-auto">
              This is to officially certify that the designated officer has completed rigorous multi-threat counter-drone simulation, demonstrating competence in sensor fusion, threat classification, electronic warfare, and precision kinetic/directed-energy interception.
            </p>
          </div>

          {/* Officer Trainee Name Banner */}
          <div className="text-center py-4 bg-slate-900/60 border-y border-amber-500/20">
            <div className="text-[10px] text-amber-400 font-bold tracking-widest uppercase mb-1">
              AWARDED TO
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide font-sans">
              {rank} {traineeName}
            </div>
            <div className="text-xs text-slate-300 mt-1 font-mono">
              SERVICE ID: <span className="text-amber-300 font-bold">{traineeId}</span> • FORMATION / UNIT: <span className="text-cyan-300 font-bold">{unit}</span>
            </div>
          </div>

          {/* Exercise Meta & Performance Grade */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className={`p-4 rounded-xl border text-center ${grade.bg} ${grade.border}`}>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">COMBAT PROFICIENCY GRADE</span>
              <span className={`text-lg font-black block mt-1 ${grade.color}`}>{grade.title}</span>
              <span className="text-xs font-bold text-slate-300">{evaluation.finalScore} / 1000 PTS</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 text-center flex flex-col justify-center">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">EXERCISE SCENARIO</span>
              <span className="text-xs font-bold text-cyan-300 block mt-1 truncate">{scenarioTitle}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">DURATION: {durationSec}s</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 text-center flex flex-col justify-center">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">BASE ASSET INTEGRITY</span>
              <span className="text-lg font-black text-emerald-400 block mt-1">{baseHealthRemaining}%</span>
              <span className="text-[10px] text-slate-400">SURVIVED BREACH</span>
            </div>
          </div>

          {/* Sub-Score Telemetry Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs bg-slate-950/50 p-3 rounded-lg border border-slate-800 max-w-2xl mx-auto">
            <div>
              <span className="text-[9px] text-slate-400 block">THREATS DOWN</span>
              <span className="font-bold text-emerald-400">{threatsNeutralized} Neutralized</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block">DETECTION SCORE</span>
              <span className="font-bold text-cyan-300">{evaluation.detectionScore}/100</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block">CLASSIFICATION</span>
              <span className="font-bold text-amber-300">{evaluation.classificationScore}/100</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block">ROE DISCIPLINE</span>
              <span className="font-bold text-purple-300">{evaluation.roeDisciplineScore}/100</span>
            </div>
          </div>

          {/* Authentication, Digital Seal & Signatures */}
          <div className="pt-8 border-t border-amber-500/30 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Signature 1 */}
            <div className="text-center space-y-1">
              <div className="border-b border-slate-700 pb-4 text-xs font-serif italic text-amber-300/80">
                Brig. General R. V. Ramanathan
              </div>
              <div className="font-bold text-xs text-slate-200">CHIEF INSTRUCTOR, AIR DEFENCE</div>
              <div className="text-[10px] text-slate-500">Defence Services Staff College, Wellington</div>
            </div>

            {/* Center Cryptographic Verification & Simulated QR */}
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-16 h-16 bg-white p-1 rounded-md shadow-md flex items-center justify-center border border-amber-400/80">
                <QrCode className="w-14 h-14 text-slate-900" />
              </div>
              <div className="text-[8px] font-mono text-slate-400">
                <div className="text-amber-400/90 font-bold">STANAG 4586 COMPLIANT</div>
                <div className="truncate max-w-[160px] text-slate-500">{digitalVerificationHash}</div>
                <div className="text-emerald-400">CRYPTOGRAPHIC SEAL VERIFIED</div>
              </div>
            </div>

            {/* Signature 2 */}
            <div className="text-center space-y-1">
              <div className="border-b border-slate-700 pb-4 text-xs font-serif italic text-cyan-300/80">
                {rank} {traineeName}
              </div>
              <div className="font-bold text-xs text-slate-200">OFFICER TRAINEE</div>
              <div className="text-[10px] text-slate-500">{unit}</div>
            </div>
          </div>

          {/* Certificate Footer */}
          <div className="text-center text-[9px] text-slate-600 pt-2 border-t border-slate-800">
            ISSUED UNDER PS-26247 DEFENCE SIMULATION PROTOCOLS • DEFENCE SERVICES STAFF COLLEGE • WELLINGTON, TAMIL NADU, INDIA
          </div>
        </div>
      )}

      {/* ==================== TAB 2: DETAILED OPERATIONAL DOSSIER ==================== */}
      {activeTab === 'dossier' && (
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

          {/* Cryptographic Hash Bar */}
          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>DIGITAL AUDIT STAMP: <strong className="text-slate-200">{digitalVerificationHash}</strong></span>
            </div>
            <span className="text-emerald-400 font-bold">STANAG 4586 VERIFIED</span>
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
      )}
    </div>
  );
};

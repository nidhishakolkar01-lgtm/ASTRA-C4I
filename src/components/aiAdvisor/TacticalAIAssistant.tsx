import React, { useState } from 'react';
import { useSimulator } from '../../context/SimulatorContext';
import { Bot, Send, Sparkles, Shield, Key, CheckCircle, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export const TacticalAIAssistant: React.FC = () => {
  const { lastMissionResult, traineeProfile } = useSimulator();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('astra_gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: `Jai Hind, ${traineeProfile.rank} ${traineeProfile.name}. I am ASTRA-AI, Directing Staff Advisor for Counter-UAS Operations at the Defence Services Staff College (DSSC), Wellington.\n\nI evaluate sensor slew-to-cue efficiency, Weapon-Target Allocation (WTA), and Rules of Engagement (ROE) discipline against modern asymmetric drone warfare doctrines. How can I assist your combat readiness?`,
      time: '12:00'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const predefinedPrompts = [
    'How do I counter fast FPV kamikaze drones at night?',
    'When should I deploy High-Power Microwave (HPM) over 30mm CIWS?',
    'What are the telltale radar and acoustic signatures of a Shahed delta munition?',
    'Analyze my latest mission performance and tactical weaknesses.'
  ];

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('astra_gemini_api_key', key);
    setShowKeyInput(false);
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Check if real Gemini API Key is provided
    if (apiKey.trim()) {
      try {
        const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
        const systemPrompt = `You are a Senior Directing Staff (Air Defence Wing) at the Defence Services Staff College (DSSC), Wellington, Ministry of Defence.
You instruct military officers in Counter-Unmanned Aerial Systems (C-UAS) doctrines, kill chain execution (Detect, Track, Identify, Classify, Neutralize), multi-spectral sensor fusion (3D AESA Radar, RF Waterfall DF, FLIR MWIR/LWIR thermal, Acoustic beamforming), and weapon-target pairing (Soft-kill RF/GNSS/HPM vs Hard-kill 30mm AHEAD airburst and 10kW High-Energy Laser).
Keep your advice concise, authoritative, professional, and formatted in clear military bullet points. Use standard Indian Army / IAF terminology.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${systemPrompt}\n\nTrainee Query: ${query}`
        });

        const reply = response.text || 'Directive acknowledged. Maintain defensive vigilance.';
        setMessages(prev => [
          ...prev,
          {
            sender: 'assistant',
            text: reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsTyping(false);
        return;
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local doctrine base:', err);
      }
    }

    // High-Fidelity Local Doctrine Fallback (100% Offline Air-Gapped)
    setTimeout(() => {
      let reply = '';
      const q = query.toLowerCase();

      if (q.includes('fpv') || q.includes('kamikaze')) {
        reply = `**FPV Kamikaze Interception Doctrine (Tactical Note):**\n\n1. **Sensor Cueing:** FPV racing drones operate at high speeds (40-50 m/s) with steep dive profiles. Their 5.8 GHz analog VTX signals emit distinctive high-RSSI spikes on the RF Spectrum Waterfall.\n2. **Countermeasure Allocation:**\n   - **Primary Hard-Kill:** 30mm CIWS with AHEAD programmable airburst creates a dense tungsten pellet cloud directly in the terminal dive corridor.\n   - **Soft-Kill:** Directional RF Disruptors on 5.8 GHz / 915 MHz sever the pilot's analog video or ELRS telemetry link, forcing a crash or blind glide.\n   - **Avoid:** Pure GNSS jamming is ineffective because human FPV pilots navigate visually via the video feed.`;
      } else if (q.includes('hpm') || q.includes('microwave') || q.includes('swarm')) {
        reply = `**High-Power Microwave (HPM) vs. CIWS Weapon Allocation:**\n\n- **Deploy HPM When:** Facing coordinated multi-node drone swarms (3+ drones). HPM generates an intense, wide-angle electromagnetic pulse (800m cone) that couples into drone internal ESC wiring, destroying all swarm members simultaneously with zero fragmentation risk.\n- **Deploy 30mm CIWS When:** Engaging heavy-armor delta-wing loitering munitions (Shahed type) or hardened single targets where kinetic destruction of the warhead is required before perimeter breach.`;
      } else if (q.includes('shahed') || q.includes('delta') || q.includes('loitering')) {
        reply = `**Shahed / Delta-Wing Loitering Munition Signatures:**\n\n1. **Acoustic:** Emits a loud, low-frequency 2-stroke piston lawnmower engine sound (75-80 dB @ 50m, 5500-6500 RPM).\n2. **Thermal FLIR:** Strong thermal contrast from the rear internal combustion cylinder and exhaust manifold.\n3. **Radar:** Distinctive 0.10 m² RCS with steady cruise velocity (50 m/s).\n4. **Engagement Rule:** Target with High-Energy Laser DEW for silent thermal burn, or 30mm CIWS beyond 600m standoff to prevent warhead blast on base structures.`;
      } else if (q.includes('performance') || q.includes('weakness') || q.includes('latest')) {
        if (lastMissionResult) {
          const evalRes = lastMissionResult.evaluation;
          reply = `**Mission Debrief Analysis for ${lastMissionResult.scenarioTitle}:**\n\n- **Tactical Score:** ${evalRes.finalScore} / 1000 (${evalRes.overallTacticalRating})\n- **Detection Latency:** ${evalRes.avgDetectionLatencySec}s (Score: ${evalRes.detectionScore}/100)\n- **Classification Precision:** ${evalRes.classificationScore}%\n- **ROE Compliance:** ${evalRes.roeDisciplineScore}/100 with ${evalRes.collateralIncidents} collateral blast incident(s).\n\n**Directing Staff Finding:** ${evalRes.recommendations.join(' ')}`;
        } else {
          reply = `No mission record detected in the current training session. Launch a drill in the 3D simulator, and I will generate an exhaustive after-action analysis correlating your sensor slew times and ROE decisions!`;
        }
      } else {
        reply = `**Joint Air Defence Doctrine Directive:** In accordance with DSSC standards, always cross-cue sensors (Radar ➔ RF Waterfall ➔ EO/IR Slew-to-Cue). In populated sectors, adhere to strict Rules of Engagement (ROE) by deploying non-kinetic RF disruptors, coordinate spoofing, or High-Energy Laser to avoid civilian collateral casualties.`;
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 font-mono select-none text-xs">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/90 border border-cyan-400 flex items-center justify-center text-cyan-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>ASTRA-AI | DIRECTING STAFF DOCTRINE MENTOR</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                apiKey ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              }`}>
                {apiKey ? 'GEMINI 2.5 LIVE AI' : 'OFFLINE AIR-GAPPED DOCTRINE'}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Joint Air Defence principles, sensor slew-to-cue, and tactical debriefing.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowKeyInput(!showKeyInput)}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-xs border border-slate-700"
        >
          <Key className="w-3.5 h-3.5 text-cyan-400" />
          <span>{apiKey ? 'CONFIGURED API KEY' : 'ADD GEMINI KEY'}</span>
        </button>
      </div>

      {/* Gemini API Key Modal/Card */}
      {showKeyInput && (
        <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/40 space-y-2">
          <div className="text-cyan-400 font-bold text-xs flex justify-between">
            <span>ENTER GOOGLE GEMINI API KEY (OPTIONAL):</span>
            <span className="text-slate-500 cursor-pointer" onClick={() => setShowKeyInput(false)}>✕</span>
          </div>
          <p className="text-slate-400 text-[10px]">
            Enables dynamic Gemini 2.5 Flash reasoning for open-ended tactical debate. If left blank, the system automatically uses the air-gapped local military doctrine database.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => handleSaveKey(apiKey)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded font-bold text-xs glow-cyan"
            >
              SAVE KEY
            </button>
          </div>
        </div>
      )}

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-2">
        {predefinedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 h-[420px] overflow-y-auto space-y-3 shadow-inner">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1 text-[9px] text-slate-500 mb-1 px-1">
              <span>{m.sender === 'user' ? 'YOU' : 'DIRECTING STAFF'}</span>
              <span>•</span>
              <span>{m.time}</span>
            </div>
            <div
              className={`p-3.5 rounded-xl max-w-xl text-[11px] leading-relaxed whitespace-pre-line ${
                m.sender === 'user'
                  ? 'bg-cyan-600 text-white shadow glow-cyan'
                  : 'bg-slate-950 border border-slate-800 text-slate-200'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-slate-500 text-[10px] flex items-center gap-2 p-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
            <span>Reviewing DSSC tactical doctrine...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask a tactical doctrine question (e.g., 'What is the optimal engagement range for High-Energy Lasers in heavy rain?')..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-cyan-400"
        />
        <button
          onClick={() => handleSend()}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-lg font-bold text-xs transition-all glow-cyan flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span>TRANSMIT</span>
        </button>
      </div>
    </div>
  );
};

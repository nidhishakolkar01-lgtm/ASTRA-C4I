import React, { useRef, useEffect } from 'react';
import { useSimulator } from '../../context/SimulatorContext';
import { Wifi, Activity, Cpu } from 'lucide-react';

export const RFAnalyzer: React.FC = () => {
  const { rfContacts, activeScenario, selectDrone, selectedDroneId } = useSimulator();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waterfallHistoryRef = useRef<number[][]>([]);

  // Render RF Waterfall & Spectrum Bars
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const channels = 64; // frequency bins across 400MHz - 6000MHz

    // Generate current spectrum slice
    const currentSlice = new Array(channels).fill(0);

    // Add noise floor
    for (let i = 0; i < channels; i++) {
      currentSlice[i] = 5 + Math.random() * (10 + activeScenario.rfNoiseLevel * 25);
    }

    // Map active RF contacts to channels
    rfContacts.forEach(contact => {
      let bin = 0;
      if (contact.centerFrequencyMHz < 1000) bin = Math.floor((contact.centerFrequencyMHz - 400) / 10);
      else if (contact.centerFrequencyMHz < 2500) bin = 20 + Math.floor((contact.centerFrequencyMHz - 1000) / 80);
      else bin = 40 + Math.floor((contact.centerFrequencyMHz - 2400) / 100);

      bin = Math.max(0, Math.min(channels - 1, bin));

      // Signal power
      const power = Math.max(20, 100 + contact.rssiDb);
      currentSlice[bin] = Math.min(100, currentSlice[bin] + power);
      if (bin > 0) currentSlice[bin - 1] = Math.max(currentSlice[bin - 1], power * 0.5);
      if (bin < channels - 1) currentSlice[bin + 1] = Math.max(currentSlice[bin + 1], power * 0.5);
    });

    // Push to history
    waterfallHistoryRef.current.unshift(currentSlice);
    if (waterfallHistoryRef.current.length > 50) {
      waterfallHistoryRef.current.pop();
    }

    // Clear
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, width, height);

    // Draw Spectrum Bar graph on top 40% of canvas
    const barHeight = height * 0.38;
    const binWidth = width / channels;

    ctx.fillStyle = '#00e5ff';
    for (let i = 0; i < channels; i++) {
      const val = currentSlice[i];
      const h = (val / 100) * barHeight;
      const x = i * binWidth;
      const y = barHeight - h;

      ctx.fillStyle = val > 50 ? '#ef4444' : (val > 25 ? '#f59e0b' : '#00e5ff');
      ctx.fillRect(x, y, binWidth - 1, h);
    }

    // Draw Waterfall Heatmap on bottom 60%
    const waterfallY = barHeight + 8;
    const waterfallH = height - waterfallY;
    const rowH = waterfallH / 50;

    waterfallHistoryRef.current.forEach((row, rowIdx) => {
      const y = waterfallY + rowIdx * rowH;
      row.forEach((val, colIdx) => {
        const x = colIdx * binWidth;
        // Color mapping based on RF strength
        if (val > 60) ctx.fillStyle = 'rgb(239, 68, 68)'; // Red hot
        else if (val > 40) ctx.fillStyle = 'rgb(245, 158, 11)'; // Amber
        else if (val > 20) ctx.fillStyle = 'rgb(14, 165, 233)'; // Cyan
        else ctx.fillStyle = 'rgb(10, 25, 45)'; // Dark blue floor

        ctx.fillRect(x, y, binWidth, rowH);
      });
    });

  }, [rfContacts, activeScenario.rfNoiseLevel]);

  return (
    <div className="flex flex-col bg-slate-900/95 backdrop-blur-md rounded-lg border border-cyan-500/40 p-3 shadow-2xl font-mono select-none">
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 text-xs">
        <div className="flex items-center gap-2 text-cyan-400">
          <Wifi className="w-4 h-4 animate-pulse" />
          <span className="font-bold tracking-wider">RF SPECTRUM & WATERFALL</span>
        </div>
        <div className="text-[10px] text-slate-400">
          BAND: <span className="text-cyan-300 font-bold">400MHz - 5.8GHz</span>
        </div>
      </div>

      {/* Spectrum & Waterfall Canvas */}
      <div className="relative my-2 self-center">
        <canvas
          ref={canvasRef}
          width={280}
          height={160}
          className="rounded border border-cyan-500/30 shadow-inner bg-slate-950"
        />
      </div>

      {/* Intercepted Signal List */}
      <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
        {rfContacts.length > 0 ? (
          rfContacts.map(contact => {
            const isSelected = contact.id === selectedDroneId;
            return (
              <div
                key={contact.id}
                onClick={() => selectDrone(contact.id)}
                className={`p-1.5 rounded text-[10px] flex items-center justify-between cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200' 
                    : 'bg-slate-950/60 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold text-cyan-400">{contact.centerFrequencyMHz} MHz | BRG {contact.bearingDeg}°</div>
                  <div className="text-[9px] text-slate-400 truncate max-w-[170px]">{contact.protocolDetected}</div>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${contact.rssiDb > -60 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {contact.rssiDb} dBm
                  </span>
                  {contact.isFrequencyHopping && (
                    <span className="block text-[8px] text-emerald-400 font-bold">FHSS ACTIVE</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-2 text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>SCANNING RF SPECTRUM...</span>
          </div>
        )}
      </div>
    </div>
  );
};

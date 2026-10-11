import React, { useEffect, useRef } from 'react';
import { DroneSpec } from '../../types/simulation';
import { Radio, Volume2 } from 'lucide-react';

interface AcousticRFScopeProps {
  spec: DroneSpec;
  distanceMeters: number;
  rfNoiseLevel: number;
}

export const AcousticRFScope: React.FC<AcousticRFScopeProps> = ({
  spec,
  distanceMeters,
  rfNoiseLevel
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    // Determine acoustic harmonic multiplier based on category
    const baseFreq =
      spec.category === 'fpv_kamikaze' ? 9 :
      spec.category === 'loitering_munition' ? 3.5 :
      spec.category === 'heavy_hexacopter' ? 5.5 :
      spec.category === 'swarm_member' ? 7.5 : 6.0;

    const render = () => {
      phase += 0.14;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#040914';
      ctx.fillRect(0, 0, w, h);

      // Draw subtle oscilloscope grid
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // 1. Acoustic Rotor / Engine Harmonic Waveform (Cyan)
      ctx.beginPath();
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.6;
      const attenuation = Math.max(0.25, Math.min(1, 1 - distanceMeters / 2500));

      for (let x = 0; x < w; x++) {
        const t = x / w;
        const primary = Math.sin(t * Math.PI * 2 * baseFreq + phase);
        const harmonic = 0.4 * Math.sin(t * Math.PI * 6 * baseFreq - phase * 1.6);
        const noise = (Math.random() - 0.5) * (0.25 + rfNoiseLevel * 0.6);
        const y = h / 2 + (primary + harmonic + noise) * (h * 0.34) * attenuation;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 2. RF Hopping Carrier Pulse Spikes (Amber)
      if (spec.rfFrequencies.length > 0) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.55)';
        const spikeCount = spec.rfFrequencies.length * 3;
        for (let i = 0; i < spikeCount; i++) {
          const sx = ((i * 37 + Math.floor(phase * 4)) % (w - 10)) + 5;
          const spikeH = 6 + ((Math.sin(phase + i) + 1) * 0.5) * 14 * attenuation;
          ctx.fillRect(sx, h - spikeH, 2.5, spikeH);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [spec, distanceMeters, rfNoiseLevel]);

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded p-1.5 space-y-1 font-mono">
      <div className="flex items-center justify-between text-[8px]">
        <span className="text-cyan-400 font-bold flex items-center gap-1">
          <Volume2 className="w-2.5 h-2.5 text-cyan-400" />
          <span>SIGNATURE SCOPE</span>
        </span>
        <span className="text-amber-300 font-bold">
          {spec.acousticDb}dB | {spec.rfFrequencies.length > 0 ? `${spec.rfFrequencies[0]}MHz` : 'INS'}
        </span>
      </div>

      <canvas
        ref={canvasRef}
        width={210}
        height={32}
        className="w-full h-[32px] rounded border border-cyan-500/20 block"
      />

      <div className="flex items-center justify-between text-[7px] text-slate-400 leading-none">
        <span>{
          spec.category === 'loitering_munition' ? '2-STROKE PISTON' :
          spec.category === 'fpv_kamikaze' ? '28k RPM BRUSHLESS' :
          spec.category === 'heavy_hexacopter' ? '6-ROTOR HARMONIC' : '4-BLADE MICROPROP'
        }</span>
        <span className="text-emerald-400 font-bold">LOCKED</span>
      </div>
    </div>
  );
};

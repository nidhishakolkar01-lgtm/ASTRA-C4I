import React, { useRef, useEffect, useState } from 'react';
import { useSimulator } from '../../context/SimulatorContext';
import { DRONE_DATABASE } from '../../data/droneDatabase';
import { Radio, ShieldAlert, Crosshair, ZoomIn, ZoomOut, Target } from 'lucide-react';

interface RadarScreenProps {
  onClose?: () => void;
}

export const RadarScreen: React.FC<RadarScreenProps> = ({ onClose }) => {
  const { 
    radarSweepDeg, 
    radarContacts, 
    selectedDroneId, 
    selectDrone, 
    activeScenario,
    drones,
    selectWeapon
  } = useSimulator();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rangeScaleMeters, setRangeScaleMeters] = useState<number>(2500); // 1000m, 2500m, 5000m

  // Render High-Fidelity 2D PPI Radar Canvas with MIL-STD-2525D Symbology & Phosphor Decay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const maxRange = rangeScaleMeters;
    const scale = (size / 2 - 25) / maxRange;

    // Tactical Radar Screen Dark CRT Phosphor Background
    ctx.fillStyle = '#030b06';
    ctx.fillRect(0, 0, size, size);

    // 1. Draw Range Rings based on selected range scale
    const ringInterval = maxRange <= 1000 ? 250 : (maxRange <= 2500 ? 500 : 1000);
    const ringCounts = Math.floor(maxRange / ringInterval);

    ctx.strokeStyle = 'rgba(0, 255, 102, 0.22)';
    ctx.lineWidth = 1;

    for (let i = 1; i <= ringCounts; i++) {
      const r = i * ringInterval;
      const radiusPx = r * scale;
      ctx.beginPath();
      ctx.arc(center, center, radiusPx, 0, Math.PI * 2);
      ctx.stroke();

      // Range text
      ctx.fillStyle = 'rgba(0, 255, 102, 0.65)';
      ctx.font = '9px monospace';
      ctx.fillText(`${r}m`, center + 4, center - radiusPx + 10);
    }

    // 2. Draw Crosshairs & 30-degree Radial Grids
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.12)';
    for (let deg = 0; deg < 360; deg += 30) {
      const rad = ((deg - 90) * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(center + Math.cos(rad) * (size / 2 - 15), center + Math.sin(rad) * (size / 2 - 15));
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(0, 255, 102, 0.35)';
    ctx.beginPath();
    ctx.moveTo(center, 12);
    ctx.lineTo(center, size - 12);
    ctx.moveTo(12, center);
    ctx.lineTo(size - 12, center);
    ctx.stroke();

    // Cardinal Heading Labels (000 North, 090 East, 180 South, 270 West)
    ctx.fillStyle = '#00ff66';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('N 000°', center - 18, 16);
    ctx.fillText('S 180°', center - 18, size - 6);
    ctx.fillText('E 090°', size - 42, center + 4);
    ctx.fillText('W 270°', 6, center + 4);

    // 3. Draw Rotating Sweep Beam with Authentic Phosphor Gradient
    const sweepRad = ((radarSweepDeg - 90) * Math.PI) / 180;
    const sweepX = center + Math.cos(sweepRad) * (size / 2 - 12);
    const sweepY = center + Math.sin(sweepRad) * (size / 2 - 12);

    const gradient = ctx.createRadialGradient(center, center, 8, center, center, size / 2 - 12);
    gradient.addColorStop(0, 'rgba(0, 255, 102, 0.35)');
    gradient.addColorStop(1, 'rgba(0, 255, 102, 0.04)');

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, size / 2 - 12, sweepRad - 0.4, sweepRad);
    ctx.lineTo(center, center);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Primary Sweep Line
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(sweepX, sweepY);
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 4. Draw Advanced Electronic Warfare (EW) Strobe Jamming & Noise Barrage
    const isEWActive = activeScenario.radarJammingLevel > 0.15 || drones.some(d => d.status === 'flying' && d.specId === 'decoy_drone');

    if (isEWActive) {
      // Find EW emitter bearings (decoy drones or simulated adversary ground jammer)
      const ewEmitters: number[] = [];
      drones.forEach(d => {
        if (d.status === 'flying' && (d.specId === 'decoy_drone' || d.specId === 'loitering_shahed')) {
          const az = ((Math.atan2(d.position[0], -d.position[2]) * 180 / Math.PI) + 360) % 360;
          ewEmitters.push(az);
        }
      });

      // If no specific drone emitter but scenario has ambient jamming, simulate an azimuth
      if (ewEmitters.length === 0 && activeScenario.radarJammingLevel > 0.15) {
        ewEmitters.push(38); // Standard NW border ECM beacon
      }

      ewEmitters.forEach(emitterAz => {
        const strobeRad = ((emitterAz - 90) * Math.PI) / 180;
        const strobeWidth = 0.12 * Math.max(0.5, activeScenario.radarJammingLevel); // Angular spread

        // Radial Strobe Wedge (Coherent Noise Jamming Sector)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, size / 2 - 12, strobeRad - strobeWidth, strobeRad + strobeWidth);
        ctx.lineTo(center, center);
        const strobeGrad = ctx.createRadialGradient(center, center, 10, center, center, size / 2 - 12);
        strobeGrad.addColorStop(0, 'rgba(255, 170, 0, 0.45)');
        strobeGrad.addColorStop(0.7, 'rgba(255, 80, 0, 0.25)');
        strobeGrad.addColorStop(1, 'rgba(255, 0, 0, 0.05)');
        ctx.fillStyle = strobeGrad;
        ctx.fill();

        // Bright Core Strobe Line
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.lineTo(
          center + Math.cos(strobeRad) * (size / 2 - 14),
          center + Math.sin(strobeRad) * (size / 2 - 14)
        );
        ctx.strokeStyle = 'rgba(255, 200, 50, 0.75)';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // High-Frequency Noise Grass / Spikes along the Strobe Cone
        ctx.fillStyle = 'rgba(255, 230, 100, 0.85)';
        const grassCount = Math.floor(25 * (activeScenario.radarJammingLevel || 0.4));
        for (let g = 0; g < grassCount; g++) {
          const rOffset = (Math.random() * 0.85 + 0.1) * (size / 2 - 20);
          const aOffset = strobeRad + (Math.random() - 0.5) * strobeWidth * 1.8;
          ctx.fillRect(
            center + Math.cos(aOffset) * rOffset,
            center + Math.sin(aOffset) * rOffset,
            Math.random() > 0.5 ? 2.5 : 1.5,
            Math.random() > 0.5 ? 2.5 : 1.5
          );
        }

        // False Echo Blips (Range Gate Pull-Off RGPO Decoys)
        for (let f = 1; f <= 2; f++) {
          const ghostDist = (0.3 + f * 0.28) * (size / 2 - 20);
          const ghostJitter = Math.sin(Date.now() * 0.006 + f) * 12;
          ctx.beginPath();
          ctx.arc(
            center + Math.cos(strobeRad) * (ghostDist + ghostJitter),
            center + Math.sin(strobeRad) * (ghostDist + ghostJitter),
            3,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = 'rgba(255, 160, 0, 0.65)';
          ctx.fill();
        }
        ctx.restore();
      });

      // Background Atmospheric Thermal Radar Grass Noise
      const ambientNoise = Math.floor(activeScenario.radarJammingLevel * 60);
      ctx.fillStyle = 'rgba(255, 120, 0, 0.3)';
      for (let i = 0; i < ambientNoise; i++) {
        const randAngle = Math.random() * Math.PI * 2;
        const randDist = Math.random() * (size / 2 - 20);
        ctx.fillRect(
          center + Math.cos(randAngle) * randDist,
          center + Math.sin(randAngle) * randDist,
          1.5,
          1.5
        );
      }
    }

    // 5. Draw Flight Trajectory Breadcrumbs
    drones.forEach(drone => {
      if (drone.status === 'destroyed' || drone.status === 'captured') return;
      if (drone.flightPath && drone.flightPath.length > 1) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        drone.flightPath.slice(-12).forEach((pt, i) => {
          const ptAzRad = ((Math.atan2(pt[0], -pt[2]) * 180 / Math.PI - 90) * Math.PI) / 180;
          const ptRange = Math.hypot(pt[0], pt[2]);
          const px = center + Math.cos(ptAzRad) * Math.min(size / 2 - 15, ptRange * scale);
          const py = center + Math.sin(ptAzRad) * Math.min(size / 2 - 15, ptRange * scale);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }
    });

    // 6. Draw Radar Track Blips with MIL-STD-2525D Symbology & Phosphor Fade
    radarContacts.forEach(contact => {
      // Clamp range to prevent overflowing circular scope
      const clampedRange = Math.min(maxRange, contact.rangeMeters);
      const isOutOfBounds = contact.rangeMeters > maxRange;

      const azRad = ((contact.azimuthDeg - 90) * Math.PI) / 180;
      const blipX = center + Math.cos(azRad) * (clampedRange * scale);
      const blipY = center + Math.sin(azRad) * (clampedRange * scale);

      const isSelected = contact.id === selectedDroneId;

      // Authentic Phosphor Decay Intensity
      const phosphorAlpha = Math.max(0.25, 1.0 - contact.blipAge * 0.7);

      // MIL-STD Hostile Track: Inverted Diamond
      ctx.save();
      ctx.globalAlpha = isSelected ? 1.0 : phosphorAlpha;

      ctx.beginPath();
      ctx.moveTo(blipX, blipY - 6);
      ctx.lineTo(blipX + 6, blipY);
      ctx.lineTo(blipX, blipY + 6);
      ctx.lineTo(blipX - 6, blipY);
      ctx.closePath();
      ctx.fillStyle = isSelected ? '#00e5ff' : (isOutOfBounds ? '#f59e0b' : '#ef4444');
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Velocity stem
      const stemRad = ((contact.azimuthDeg + 90) * Math.PI) / 180;
      ctx.strokeStyle = isSelected ? '#00e5ff' : '#f87171';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(blipX, blipY);
      ctx.lineTo(blipX + Math.cos(stemRad) * 14, blipY + Math.sin(stemRad) * 14);
      ctx.stroke();

      // Selected Target Reticle Box
      if (isSelected) {
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(blipX - 11, blipY - 11, 22, 22);
      }

      // Track Label
      ctx.fillStyle = isSelected ? '#00e5ff' : '#fca5a5';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`TRK-${contact.id.split('_')[1] || contact.id.slice(-3)}`, blipX + 10, blipY - 3);
      ctx.font = '8px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(`${contact.rangeMeters}m | V:${contact.radialVelocity}m/s`, blipX + 10, blipY + 8);

      ctx.restore();
    });

    // 7. Base Center Outpost Marker
    ctx.beginPath();
    ctx.arc(center, center, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff66';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

  }, [radarSweepDeg, radarContacts, selectedDroneId, activeScenario.radarJammingLevel, drones, rangeScaleMeters]);

  // Click-to-lock targeting
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const size = canvas.width;
    const center = size / 2;
    const maxRange = rangeScaleMeters;
    const scale = (size / 2 - 25) / maxRange;

    let closestId: string | null = null;
    let minDistance = 28;

    radarContacts.forEach(contact => {
      const clampedRange = Math.min(maxRange, contact.rangeMeters);
      const azRad = ((contact.azimuthDeg - 90) * Math.PI) / 180;
      const blipX = center + Math.cos(azRad) * (clampedRange * scale);
      const blipY = center + Math.sin(azRad) * (clampedRange * scale);

      const d = Math.hypot(clickX - blipX, clickY - blipY);
      if (d < minDistance) {
        minDistance = d;
        closestId = contact.id;
      }
    });

    if (closestId) {
      selectDrone(closestId);
      const drone = drones.find(d => d.instanceId === closestId);
      if (drone) {
        const spec = DRONE_DATABASE[drone.specId];
        if (spec) {
          if (spec.category === 'swarm_member') selectWeapon('hpm_emp_emitter');
          else if (spec.category === 'loitering_munition') selectWeapon('laser_dew_system');
          else if (spec.category === 'fpv_kamikaze') selectWeapon('laser_dew_system');
          else if (spec.category === 'heavy_hexacopter') selectWeapon('ciws_30mm_autocannon');
          else selectWeapon('rf_jammer_directional');
        }
      }
    }
  };

  return (
    <div className="flex flex-col bg-slate-950/95 backdrop-blur-xl rounded-2xl border border-emerald-500/50 p-3 shadow-2xl font-mono select-none">
      {/* Header with Title and Range Selector */}
      <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 text-xs">
        <div className="flex items-center gap-2 text-emerald-400">
          <Radio className="w-4 h-4 animate-pulse" />
          <span className="font-bold tracking-wider">AESA 3D PPI SEARCH RADAR</span>
        </div>

        {/* Range Scale Buttons */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-slate-800 text-[10px]">
          <span className="text-slate-400 px-1">SCALE:</span>
          {[1000, 2500, 5000].map(r => (
            <button
              key={r}
              onClick={() => setRangeScaleMeters(r)}
              className={`px-2 py-0.5 rounded font-bold transition-all ${
                rangeScaleMeters === r ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {(r / 1000).toFixed(1)}KM
            </button>
          ))}
        </div>

        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white ml-2 text-xs">✕</button>
        )}
      </div>

      {/* PPI Radar Screen Canvas */}
      <div className="relative flex items-center justify-center my-2 cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          onClick={handleCanvasClick}
          className="rounded-full border-2 border-emerald-500/60 shadow-2xl glow-emerald"
        />
      </div>

      {/* Active EW / Jamming Threat Bar */}
      {(activeScenario.radarJammingLevel > 0.15 || drones.some(d => d.specId === 'decoy_drone' && d.status === 'flying')) && (
        <div className="bg-amber-950/70 border border-amber-500/50 rounded px-2.5 py-1 text-[10px] text-amber-300 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>⚠️ EW JAMMING DETECTED:</span>
          </div>
          <span className="font-mono">NOISE STROBE ACTIVE | AESA GAIN -{Math.round((activeScenario.radarJammingLevel || 0.35) * 100)}%</span>
        </div>
      )}

      {/* Bottom Telemetry Ticker */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
        <div>
          <span>SWEEP: </span>
          <span className="text-emerald-300 font-bold">{Math.round(radarSweepDeg).toString().padStart(3, '0')}°</span>
        </div>
        <div>
          <span>TRACKS: </span>
          <span className="text-cyan-400 font-bold">{radarContacts.length} ACTIVE</span>
        </div>
        <div className="text-emerald-400 font-semibold">
          CLICK BLIP TO LOCK TARGET
        </div>
      </div>
    </div>
  );
};

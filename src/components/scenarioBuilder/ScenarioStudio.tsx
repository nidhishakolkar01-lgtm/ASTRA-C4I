import React, { useState, useRef, useEffect } from 'react';
import { useSimulator } from '../../context/SimulatorContext';
import { ScenarioDefinition, TerrainType, WeatherType, TimeOfDay, DroneCategory } from '../../types/simulation';
import { DRONE_DATABASE } from '../../data/droneDatabase';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Play, 
  ShieldAlert, 
  Sparkles, 
  Compass, 
  Download, 
  Upload, 
  Save, 
  MapPin, 
  Target, 
  Layers, 
  Radio, 
  Crosshair,
  CheckCircle,
  FileText
} from 'lucide-react';

interface Props {
  onLaunchMission: () => void;
}

interface SandboxDrone {
  id: string;
  specId: string;
  spawnDistance: number; // meters from base
  angleDeg: number; // 0-359 degrees
  altitudeM: number;
  delaySec: number;
  swarmId?: string;
  formation?: 'wedge' | 'line' | 'pincer' | 'scatter';
  isMotherShip?: boolean;
}

export const ScenarioStudio: React.FC<Props> = ({ onLaunchMission }) => {
  const { startScenario } = useSimulator();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Scenario Global Settings
  const [title, setTitle] = useState('Op Trishul: Coordinated Swarm Incursion');
  const [difficulty, setDifficulty] = useState<ScenarioDefinition['difficulty']>('Tactical Lead');
  const [terrain, setTerrain] = useState<TerrainType>('border_outpost');
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('dusk');
  const [radarJamming, setRadarJamming] = useState(0.25);
  const [rfNoise, setRfNoise] = useState(0.2);
  const [urbanCollateralSensitive, setUrbanCollateralSensitive] = useState(false);
  const [timeLimit, setTimeLimit] = useState(150);

  // Threat Wave State
  const [droneList, setDroneList] = useState<SandboxDrone[]>([
    { id: 'sb_1', specId: 'loitering_shahed', spawnDistance: 1600, angleDeg: 340, altitudeM: 180, delaySec: 2 },
    { id: 'sb_2', specId: 'swarm_strike_node', spawnDistance: 1300, angleDeg: 35, altitudeM: 110, delaySec: 10, swarmId: 'alpha_swarm', formation: 'wedge' },
    { id: 'sb_3', specId: 'swarm_strike_node', spawnDistance: 1350, angleDeg: 40, altitudeM: 110, delaySec: 10, swarmId: 'alpha_swarm', formation: 'wedge' },
    { id: 'sb_4', specId: 'swarm_strike_node', spawnDistance: 1350, angleDeg: 30, altitudeM: 110, delaySec: 10, swarmId: 'alpha_swarm', formation: 'wedge' },
    { id: 'sb_5', specId: 'electronic_decoy', spawnDistance: 1100, angleDeg: 190, altitudeM: 220, delaySec: 18 }
  ]);

  const [selectedDroneIndex, setSelectedDroneIndex] = useState<number | null>(0);
  const [selectedFormationTool, setSelectedFormationTool] = useState<'single' | 'wedge' | 'pincer' | 'mothership'>('single');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // -------------------------------------------------------------
  // 1. TACTICAL 2D SANDBOX CANVAS DRAWING
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const center = width / 2;
    const maxRange = 2000; // 2km radius
    const scale = (center - 24) / maxRange;

    // Background Grid
    ctx.fillStyle = '#060d17';
    ctx.fillRect(0, 0, width, height);

    // Subtle Radial Glow
    const bgGrad = ctx.createRadialGradient(center, center, 10, center, center, center - 20);
    bgGrad.addColorStop(0, 'rgba(0, 180, 255, 0.08)');
    bgGrad.addColorStop(0.7, 'rgba(0, 60, 100, 0.03)');
    bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Concentric Range Rings (500m, 1000m, 1500m, 2000m)
    [500, 1000, 1500, 2000].forEach(r => {
      ctx.beginPath();
      ctx.arc(center, center, r * scale, 0, Math.PI * 2);
      ctx.strokeStyle = r === 2000 ? 'rgba(0, 229, 255, 0.4)' : 'rgba(0, 229, 255, 0.15)';
      ctx.lineWidth = r === 2000 ? 1.5 : 1;
      ctx.setLineDash(r === 2000 ? [] : [4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Range label
      ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
      ctx.font = '9px monospace';
      ctx.fillText(`${r}m`, center + 6, center - r * scale + 11);
    });

    // Crosshair Axis Lines
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(center, 12);
    ctx.lineTo(center, height - 12);
    ctx.moveTo(12, center);
    ctx.lineTo(width - 12, center);
    ctx.stroke();

    // Cardinal Heading Indicators
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('000° N', center, 18);
    ctx.fillText('090° E', width - 26, center + 3);
    ctx.fillText('180° S', center, height - 8);
    ctx.fillText('270° W', 26, center + 3);

    // Protected Base Asset (Center)
    ctx.beginPath();
    ctx.arc(center, center, 70 * scale, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Base Icon
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(center, center, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('FOB BASE', center, center + 16);

    // Draw Ingress Trajectory Lines & Threat Nodes
    droneList.forEach((drone, idx) => {
      const azRad = ((drone.angleDeg - 90) * Math.PI) / 180;
      const dx = center + Math.cos(azRad) * (drone.spawnDistance * scale);
      const dy = center + Math.sin(azRad) * (drone.spawnDistance * scale);
      const isSelected = selectedDroneIndex === idx;

      // Ingress Vector to Base
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.lineTo(center, center);
      ctx.strokeStyle = isSelected ? 'rgba(239, 68, 68, 0.7)' : 'rgba(239, 68, 68, 0.25)';
      ctx.lineWidth = isSelected ? 1.5 : 1;
      ctx.setLineDash([3, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Threat Node Dot
      const spec = DRONE_DATABASE[drone.specId];
      const isSwarm = drone.swarmId !== undefined;
      const isMother = drone.isMotherShip;

      ctx.beginPath();
      ctx.arc(dx, dy, isSelected ? 8 : 6, 0, Math.PI * 2);
      ctx.fillStyle = isMother ? '#a855f7' : (isSwarm ? '#38bdf8' : (drone.specId === 'electronic_decoy' ? '#eab308' : '#ef4444'));
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#ffffff' : '#000000';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      // Threat Label
      ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.8)';
      ctx.font = isSelected ? 'bold 10px monospace' : '9px monospace';
      ctx.textAlign = 'center';
      const label = `${idx + 1}. ${spec?.name.slice(0, 12) || 'Threat'} (${drone.angleDeg}°)`;
      ctx.fillText(label, dx, dy - 10);
    });
  }, [droneList, selectedDroneIndex]);

  // Click Canvas to Select Drone or Place Threat
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvas.width;
    const center = width / 2;
    const maxRange = 2000;
    const scale = (center - 24) / maxRange;

    // Check if clicked near an existing drone
    for (let i = 0; i < droneList.length; i++) {
      const d = droneList[i];
      const azRad = ((d.angleDeg - 90) * Math.PI) / 180;
      const dx = center + Math.cos(azRad) * (d.spawnDistance * scale);
      const dy = center + Math.sin(azRad) * (d.spawnDistance * scale);

      if (Math.hypot(clickX - dx, clickY - dy) < 16) {
        setSelectedDroneIndex(i);
        return;
      }
    }

    // Otherwise, place new threat at clicked azimuth and distance
    const relX = clickX - center;
    const relY = clickY - center;
    const distPx = Math.hypot(relX, relY);
    const distanceMeters = Math.min(2000, Math.max(300, Math.round(distPx / scale)));
    const angleDeg = Math.round((Math.atan2(relY, relX) * 180 / Math.PI + 90 + 360) % 360);

    if (selectedFormationTool === 'wedge') {
      // Spawn 3-Drone Wedge Swarm
      const swarmTag = `swarm_${Date.now()}`;
      const newDrones: SandboxDrone[] = [
        { id: `sb_${Date.now()}_1`, specId: 'swarm_strike_node', spawnDistance: distanceMeters, angleDeg: angleDeg, altitudeM: 120, delaySec: 5, swarmId: swarmTag, formation: 'wedge' },
        { id: `sb_${Date.now()}_2`, specId: 'swarm_strike_node', spawnDistance: distanceMeters + 40, angleDeg: (angleDeg - 4 + 360) % 360, altitudeM: 120, delaySec: 5, swarmId: swarmTag, formation: 'wedge' },
        { id: `sb_${Date.now()}_3`, specId: 'swarm_strike_node', spawnDistance: distanceMeters + 40, angleDeg: (angleDeg + 4) % 360, altitudeM: 120, delaySec: 5, swarmId: swarmTag, formation: 'wedge' }
      ];
      setDroneList(prev => [...prev, ...newDrones]);
      setSelectedDroneIndex(droneList.length);

    } else if (selectedFormationTool === 'pincer') {
      // Spawn 4-Drone Pincer Flanking Swarm
      const swarmTag = `pincer_${Date.now()}`;
      const newDrones: SandboxDrone[] = [
        { id: `sb_${Date.now()}_1`, specId: 'fpv_kamikaze_strike', spawnDistance: distanceMeters, angleDeg: (angleDeg - 25 + 360) % 360, altitudeM: 90, delaySec: 8, swarmId: swarmTag, formation: 'pincer' },
        { id: `sb_${Date.now()}_2`, specId: 'fpv_kamikaze_strike', spawnDistance: distanceMeters + 30, angleDeg: (angleDeg - 22 + 360) % 360, altitudeM: 90, delaySec: 8, swarmId: swarmTag, formation: 'pincer' },
        { id: `sb_${Date.now()}_3`, specId: 'fpv_kamikaze_strike', spawnDistance: distanceMeters, angleDeg: (angleDeg + 25) % 360, altitudeM: 90, delaySec: 8, swarmId: swarmTag, formation: 'pincer' },
        { id: `sb_${Date.now()}_4`, specId: 'fpv_kamikaze_strike', spawnDistance: distanceMeters + 30, angleDeg: (angleDeg + 22) % 360, altitudeM: 90, delaySec: 8, swarmId: swarmTag, formation: 'pincer' }
      ];
      setDroneList(prev => [...prev, ...newDrones]);
      setSelectedDroneIndex(droneList.length);

    } else if (selectedFormationTool === 'mothership') {
      // Spawn Mother-Ship Hexacopter
      const newDrone: SandboxDrone = {
        id: `sb_${Date.now()}`,
        specId: 'heavy_hexacopter_bomber',
        spawnDistance: distanceMeters,
        angleDeg: angleDeg,
        altitudeM: 200,
        delaySec: 5,
        isMotherShip: true
      };
      setDroneList(prev => [...prev, newDrone]);
      setSelectedDroneIndex(droneList.length);

    } else {
      // Single Drone
      const newDrone: SandboxDrone = {
        id: `sb_${Date.now()}`,
        specId: 'fpv_kamikaze_strike',
        spawnDistance: distanceMeters,
        angleDeg: angleDeg,
        altitudeM: 110,
        delaySec: Math.round(droneList.length * 8 + 4)
      };
      setDroneList(prev => [...prev, newDrone]);
      setSelectedDroneIndex(droneList.length);
    }
  };

  // -------------------------------------------------------------
  // 2. PRESET MILITARY DOCTRINE TEMPLATES (MoD / DSSC)
  // -------------------------------------------------------------
  const loadPresetTemplate = (presetKey: 'trishul' | 'meghdoot' | 'rakshak' | 'mothership') => {
    if (presetKey === 'trishul') {
      setTitle('Operation Trishul: Western Desert High-Speed Ingress');
      setDifficulty('Tactical Lead');
      setTerrain('border_outpost');
      setTimeOfDay('night');
      setWeather('sandstorm');
      setRadarJamming(0.45);
      setRfNoise(0.35);
      setUrbanCollateralSensitive(false);
      setTimeLimit(130);
      setDroneList([
        { id: 'tri_1', specId: 'loitering_shahed', spawnDistance: 1700, angleDeg: 330, altitudeM: 190, delaySec: 2 },
        { id: 'tri_2', specId: 'loitering_shahed', spawnDistance: 1650, angleDeg: 345, altitudeM: 180, delaySec: 6 },
        { id: 'tri_3', specId: 'electronic_decoy', spawnDistance: 1200, angleDeg: 300, altitudeM: 240, delaySec: 15 },
        { id: 'tri_4', specId: 'fpv_kamikaze_strike', spawnDistance: 1100, angleDeg: 45, altitudeM: 45, delaySec: 25 },
        { id: 'tri_5', specId: 'fpv_kamikaze_strike', spawnDistance: 1050, angleDeg: 55, altitudeM: 40, delaySec: 25 }
      ]);
    } else if (presetKey === 'meghdoot') {
      setTitle('Operation Meghdoot: Mountain Valley Swarm Flank');
      setDifficulty('Specialist');
      setTerrain('mountain_valley');
      setTimeOfDay('dusk');
      setWeather('snow_blizzard');
      setRadarJamming(0.3);
      setRfNoise(0.2);
      setUrbanCollateralSensitive(false);
      setTimeLimit(150);
      setDroneList([
        { id: 'meg_1', specId: 'swarm_strike_node', spawnDistance: 1400, angleDeg: 10, altitudeM: 140, delaySec: 4, swarmId: 'ladakh_swarm', formation: 'pincer' },
        { id: 'meg_2', specId: 'swarm_strike_node', spawnDistance: 1450, angleDeg: 15, altitudeM: 140, delaySec: 4, swarmId: 'ladakh_swarm', formation: 'pincer' },
        { id: 'meg_3', specId: 'swarm_strike_node', spawnDistance: 1400, angleDeg: 65, altitudeM: 130, delaySec: 8, swarmId: 'ladakh_swarm', formation: 'pincer' },
        { id: 'meg_4', specId: 'swarm_strike_node', spawnDistance: 1450, angleDeg: 70, altitudeM: 130, delaySec: 8, swarmId: 'ladakh_swarm', formation: 'pincer' },
        { id: 'meg_5', specId: 'micro_quad_dji', spawnDistance: 850, angleDeg: 190, altitudeM: 60, delaySec: 1 }
      ]);
    } else if (presetKey === 'rakshak') {
      setTitle('Operation Rakshak: Urban FOB Decoy & Collateral');
      setDifficulty('Operator');
      setTerrain('urban_fob');
      setTimeOfDay('day');
      setWeather('clear');
      setRadarJamming(0.1);
      setRfNoise(0.15);
      setUrbanCollateralSensitive(true); // Strict ROE
      setTimeLimit(140);
      setDroneList([
        { id: 'rak_1', specId: 'micro_quad_dji', spawnDistance: 950, angleDeg: 260, altitudeM: 70, delaySec: 2 },
        { id: 'rak_2', specId: 'electronic_decoy', spawnDistance: 1200, angleDeg: 80, altitudeM: 190, delaySec: 10 },
        { id: 'rak_3', specId: 'heavy_hexacopter_bomber', spawnDistance: 1100, angleDeg: 275, altitudeM: 130, delaySec: 20 },
        { id: 'rak_4', specId: 'micro_quad_dji', spawnDistance: 800, angleDeg: 340, altitudeM: 55, delaySec: 35 }
      ]);
    } else {
      setTitle('Operation Sudarshan: Mother-Ship Standoff Raid');
      setDifficulty('Specialist');
      setTerrain('coastal_naval');
      setTimeOfDay('dusk');
      setWeather('heavy_rain');
      setRadarJamming(0.4);
      setRfNoise(0.3);
      setUrbanCollateralSensitive(false);
      setTimeLimit(160);
      setDroneList([
        { id: 'sud_1', specId: 'heavy_hexacopter_bomber', spawnDistance: 1500, angleDeg: 220, altitudeM: 210, delaySec: 5, isMotherShip: true },
        { id: 'sud_2', specId: 'electronic_decoy', spawnDistance: 1300, angleDeg: 180, altitudeM: 250, delaySec: 10 },
        { id: 'sud_3', specId: 'loitering_shahed', spawnDistance: 1700, angleDeg: 240, altitudeM: 160, delaySec: 22 }
      ]);
    }
    setSelectedDroneIndex(0);
  };

  // -------------------------------------------------------------
  // 3. EXPORT & IMPORT SCENARIO SUITE (Air-Gapped Offline Ready)
  // -------------------------------------------------------------
  const exportScenarioJSON = () => {
    const scenarioData = {
      title,
      difficulty,
      terrain,
      weather,
      timeOfDay,
      radarJamming,
      rfNoise,
      urbanCollateralSensitive,
      timeLimit,
      drones: droneList
    };

    const blob = new Blob([JSON.stringify(scenarioData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importScenarioJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.difficulty) setDifficulty(parsed.difficulty);
        if (parsed.terrain) setTerrain(parsed.terrain);
        if (parsed.weather) setWeather(parsed.weather);
        if (parsed.timeOfDay) setTimeOfDay(parsed.timeOfDay);
        if (parsed.radarJamming !== undefined) setRadarJamming(parsed.radarJamming);
        if (parsed.rfNoise !== undefined) setRfNoise(parsed.rfNoise);
        if (parsed.urbanCollateralSensitive !== undefined) setUrbanCollateralSensitive(parsed.urbanCollateralSensitive);
        if (parsed.timeLimit) setTimeLimit(parsed.timeLimit);
        if (Array.isArray(parsed.drones)) setDroneList(parsed.drones);
        setSelectedDroneIndex(0);
      } catch (err) {
        alert('Invalid scenario JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const saveToLocalProfile = () => {
    const payload = {
      title,
      difficulty,
      terrain,
      weather,
      timeOfDay,
      radarJamming,
      rfNoise,
      urbanCollateralSensitive,
      timeLimit,
      drones: droneList,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('astra_custom_scenario_saved', JSON.stringify(payload));
    setSavedSuccessMsg('Mission saved to local profile cache.');
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  // -------------------------------------------------------------
  // 4. LAUNCH SCENARIO INTO 3D SIMULATOR
  // -------------------------------------------------------------
  const handleLaunch = () => {
    const customDrones = droneList.map(d => {
      const rad = ((d.angleDeg - 90) * Math.PI) / 180;
      const x = Math.round(Math.cos(rad) * d.spawnDistance);
      const z = Math.round(Math.sin(rad) * d.spawnDistance);
      const y = Math.round(d.altitudeM || 110);

      return {
        specId: d.specId,
        spawnPosition: [x, y, z] as [number, number, number],
        targetPosition: [0, 5, 0] as [number, number, number],
        spawnDelaySec: d.delaySec,
        swarmId: d.swarmId,
        formation: d.formation,
        isMotherShip: d.isMotherShip
      };
    });

    const scenario: ScenarioDefinition = {
      id: `custom_studio_${Date.now()}`,
      title,
      difficulty,
      terrain,
      weather,
      timeOfDay,
      radarJammingLevel: radarJamming,
      opticalFogLevel: weather === 'foggy' ? 0.65 : 0.1,
      rfNoiseLevel: rfNoise,
      urbanCollateralSensitive,
      timeLimitSec: timeLimit,
      description: `Tactical drill created in Instructor Sandbox Studio. Features ${customDrones.length} customized drone threat tracks.`,
      protectedAsset: {
        name: 'Command Post, Radar Mast & Fuel Station',
        position: [0, 0, 0],
        radius: 70,
        maxAllowedDamage: 100
      },
      objectives: [
        { id: 'c_obj1', description: 'Detect, classify and eliminate all threat vectors', required: true, completed: false },
        { id: 'c_obj2', description: 'Prevent perimeter base damage breach (< 30% damage)', required: true, completed: false },
        { id: 'c_obj3', description: 'Comply with Rules of Engagement (Zero collateral breach)', required: true, completed: false }
      ],
      drones: customDrones
    };

    startScenario(scenario);
    onLaunchMission();
  };

  const selectedDrone = selectedDroneIndex !== null ? droneList[selectedDroneIndex] : null;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4 font-mono select-none text-xs">
      {/* Studio Header & Action Bar */}
      <div className="bg-slate-900/95 border border-slate-700/80 p-4 rounded-xl shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>MINISTRY OF DEFENCE (DSSC) | INSTRUCTOR SANDBOX MISSION STUDIO</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mt-0.5">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <span>TACTICAL C-UAS SCENARIO & FORMATION BUILDER</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Preset Buttons */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
            <span className="text-slate-400 px-1 font-bold">PRESETS:</span>
            <button onClick={() => loadPresetTemplate('trishul')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300">OP TRISHUL</button>
            <button onClick={() => loadPresetTemplate('meghdoot')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300">OP MEGHDOOT</button>
            <button onClick={() => loadPresetTemplate('rakshak')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300">OP RAKSHAK</button>
            <button onClick={() => loadPresetTemplate('mothership')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300">MOTHER-SHIP</button>
          </div>

          {/* Export / Import */}
          <button
            onClick={exportScenarioJSON}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-md"
            title="Download Scenario JSON for air-gapped systems"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXPORT JSON</span>
          </button>

          <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-md cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>IMPORT</span>
            <input type="file" accept=".json" onChange={importScenarioJSON} className="hidden" />
          </label>

          <button
            onClick={saveToLocalProfile}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-md"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>SAVE</span>
          </button>

          {/* Launch Button */}
          <button
            onClick={handleLaunch}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all glow-emerald flex items-center gap-2 shadow-2xl shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>LAUNCH DRILL</span>
          </button>
        </div>
      </div>

      {savedSuccessMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/60 p-2 rounded-lg text-emerald-300 flex items-center gap-2 text-xs">
          <CheckCircle className="w-4 h-4" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Main 2-Column Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Interactive 2D Top-Down Tactical Map (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
                <Target className="w-4 h-4" />
                <span>INTERACTIVE 2D TACTICAL AIRSPACE SANDBOX (2.0 KM RADIUS)</span>
              </div>
              <span className="text-[10px] text-slate-400">CLICK TO PLACE THREAT</span>
            </div>

            {/* Formation Placement Mode Toolstrip */}
            <div className="flex items-center gap-2 py-2.5 overflow-x-auto text-[11px]">
              <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0">ADD TOOL:</span>
              <button
                onClick={() => setSelectedFormationTool('single')}
                className={`px-2.5 py-1 rounded border transition-all ${
                  selectedFormationTool === 'single'
                    ? 'bg-cyan-600 border-cyan-400 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                1x SINGLE DRONE
              </button>
              <button
                onClick={() => setSelectedFormationTool('wedge')}
                className={`px-2.5 py-1 rounded border transition-all ${
                  selectedFormationTool === 'wedge'
                    ? 'bg-cyan-600 border-cyan-400 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                3x WEDGE SWARM
              </button>
              <button
                onClick={() => setSelectedFormationTool('pincer')}
                className={`px-2.5 py-1 rounded border transition-all ${
                  selectedFormationTool === 'pincer'
                    ? 'bg-cyan-600 border-cyan-400 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                4x PINCER FLANK
              </button>
              <button
                onClick={() => setSelectedFormationTool('mothership')}
                className={`px-2.5 py-1 rounded border transition-all ${
                  selectedFormationTool === 'mothership'
                    ? 'bg-purple-600 border-purple-400 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                HEXA MOTHER-SHIP
              </button>
            </div>

            {/* Tactical Canvas */}
            <div className="flex items-center justify-center p-2 bg-slate-950 rounded-xl border border-slate-800 relative">
              <canvas
                ref={canvasRef}
                width={480}
                height={480}
                onClick={handleCanvasClick}
                className="cursor-crosshair rounded-xl max-w-full h-auto shadow-2xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[10px] text-slate-400">
            <span>🔴 Enemy Ingress Vectors | 🟣 Mother-Ship Carrier | 🔵 Coordinated Swarms</span>
            <span className="font-bold text-cyan-400">{droneList.length} TRACKS LOADED</span>
          </div>
        </div>

        {/* Right Column: Scenario Config & Selected Threat Parameters (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Threat Inspector */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-sm text-cyan-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>
                  {selectedDrone ? `TRACK #${(selectedDroneIndex || 0) + 1} INSPECTOR` : 'NO THREAT SELECTED'}
                </span>
              </span>
              {selectedDrone && (
                <button
                  onClick={() => {
                    if (selectedDroneIndex !== null) {
                      setDroneList(prev => prev.filter((_, i) => i !== selectedDroneIndex));
                      setSelectedDroneIndex(null);
                    }
                  }}
                  className="text-rose-400 hover:text-rose-300 p-1 flex items-center gap-1 text-[10px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>DELETE</span>
                </button>
              )}
            </div>

            {selectedDrone ? (
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">DRONE TYPE / SEEKER:</label>
                  <select
                    value={selectedDrone.specId}
                    onChange={e => {
                      if (selectedDroneIndex !== null) {
                        const updated = [...droneList];
                        updated[selectedDroneIndex].specId = e.target.value;
                        setDroneList(updated);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white"
                  >
                    {Object.values(DRONE_DATABASE).map(spec => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name} ({spec.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">SPAWN DISTANCE (m):</label>
                    <input
                      type="number"
                      min="400"
                      max="2000"
                      step="50"
                      value={selectedDrone.spawnDistance}
                      onChange={e => {
                        if (selectedDroneIndex !== null) {
                          const updated = [...droneList];
                          updated[selectedDroneIndex].spawnDistance = Number(e.target.value);
                          setDroneList(updated);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">AZIMUTH BEARING (°):</label>
                    <input
                      type="number"
                      min="0"
                      max="359"
                      value={selectedDrone.angleDeg}
                      onChange={e => {
                        if (selectedDroneIndex !== null) {
                          const updated = [...droneList];
                          updated[selectedDroneIndex].angleDeg = Number(e.target.value);
                          setDroneList(updated);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">ALTITUDE AGL (m):</label>
                    <input
                      type="number"
                      min="15"
                      max="400"
                      step="10"
                      value={selectedDrone.altitudeM}
                      onChange={e => {
                        if (selectedDroneIndex !== null) {
                          const updated = [...droneList];
                          updated[selectedDroneIndex].altitudeM = Number(e.target.value);
                          setDroneList(updated);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">SPAWN DELAY (s):</label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={selectedDrone.delaySec}
                      onChange={e => {
                        if (selectedDroneIndex !== null) {
                          const updated = [...droneList];
                          updated[selectedDroneIndex].delaySec = Number(e.target.value);
                          setDroneList(updated);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">FORMATION:</label>
                    <select
                      value={selectedDrone.formation || 'wedge'}
                      onChange={e => {
                        if (selectedDroneIndex !== null) {
                          const updated = [...droneList];
                          updated[selectedDroneIndex].formation = e.target.value as any;
                          setDroneList(updated);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-[11px] text-slate-200"
                    >
                      <option value="wedge">Wedge (V-Formation)</option>
                      <option value="pincer">Pincer (Dual Flank)</option>
                      <option value="line">Assault Line</option>
                      <option value="scatter">Scatter Cloud</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <span className="text-[10px] text-slate-300">MOTHER-SHIP:</span>
                    <input
                      type="checkbox"
                      checked={selectedDrone.isMotherShip || false}
                      onChange={e => {
                        if (selectedDroneIndex !== null) {
                          const updated = [...droneList];
                          updated[selectedDroneIndex].isMotherShip = e.target.checked;
                          setDroneList(updated);
                        }
                      }}
                      className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500">
                Click on any threat node on the 2D sandbox map to adjust its altitude, delay, or formation.
              </div>
            )}
          </div>

          {/* Environmental & EW Rules Panel */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-xl space-y-3">
            <div className="font-bold text-sm text-cyan-400 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>BATTLEFIELD & ELECTRONIC WARFARE RULES</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-300">{difficulty.toUpperCase()}</span>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">EXERCISE TITLE:</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">TERRAIN:</label>
                <select
                  value={terrain}
                  onChange={e => setTerrain(e.target.value as TerrainType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white"
                >
                  <option value="border_outpost">Border Outpost</option>
                  <option value="urban_fob">Urban FOB</option>
                  <option value="mountain_valley">Mountain Valley</option>
                  <option value="coastal_naval">Coastal Naval</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">WEATHER:</label>
                <select
                  value={weather}
                  onChange={e => setWeather(e.target.value as WeatherType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white"
                >
                  <option value="clear">Clear</option>
                  <option value="foggy">Dense Fog</option>
                  <option value="heavy_rain">Heavy Rain</option>
                  <option value="sandstorm">Desert Sandstorm</option>
                  <option value="snow_blizzard">Snow Blizzard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">TIME OF DAY:</label>
                <select
                  value={timeOfDay}
                  onChange={e => setTimeOfDay(e.target.value as TimeOfDay)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white"
                >
                  <option value="day">Daylight</option>
                  <option value="dusk">Dusk</option>
                  <option value="night">Night</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">DIFFICULTY:</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white"
                >
                  <option value="Recruit">Recruit</option>
                  <option value="Operator">Operator</option>
                  <option value="Tactical Lead">Tactical Lead</option>
                  <option value="Specialist">Specialist</option>
                </select>
              </div>
            </div>

            {/* Jamming Sliders */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>RADAR EW JAMMING LEVEL:</span>
                  <span className="font-bold text-amber-400">{(radarJamming * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={radarJamming}
                  onChange={e => setRadarJamming(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>RF SPECTRUM NOISE:</span>
                  <span className="font-bold text-cyan-400">{(rfNoise * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={rfNoise}
                  onChange={e => setRfNoise(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* Urban Collateral Toggle */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-300">STRICT URBAN ROE (COLLATERAL PROHIBITED):</span>
              <input
                type="checkbox"
                checked={urbanCollateralSensitive}
                onChange={e => setUrbanCollateralSensitive(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

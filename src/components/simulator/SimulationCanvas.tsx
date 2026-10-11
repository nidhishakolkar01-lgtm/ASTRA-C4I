import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { useSimulator } from '../../context/SimulatorContext';
import { DRONE_DATABASE } from '../../data/droneDatabase';
import { SensorMode, TerrainType, TimeOfDay, WeatherType } from '../../types/simulation';
import { TerrainGenerator } from '../../engine/TerrainGenerator';
import { FoliageGenerator } from '../../engine/FoliageGenerator';
import { MilitaryBaseAssets } from '../../engine/MilitaryBaseAssets';
import { RealisticDroneMeshes } from '../../engine/RealisticDroneMeshes';
import { BallisticFXEngine } from '../../engine/BallisticFXEngine';
import { Crosshair, Video, Compass, Target, ZoomIn, ZoomOut, Eye } from 'lucide-react';

export type CameraViewMode = 'orbit' | 'gunner' | 'target' | 'overhead';

interface ProjectedTargetHUD {
  id: string;
  name: string;
  x: number;
  y: number;
  dist: number;
  alt: number;
  isSelected: boolean;
  status: string;
  threatLevel: string;
  leadX?: number;
  leadY?: number;
  isOffscreen?: boolean;
  edgeX?: number;
  edgeY?: number;
  edgeAngle?: number;
  vc?: number;
}

interface SimulationCanvasProps {
  externalCameraMode?: CameraViewMode;
  onCameraModeChange?: (mode: CameraViewMode) => void;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  externalCameraMode,
  onCameraModeChange
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { 
    drones, 
    selectedDroneId, 
    selectDrone, 
    sensorMode, 
    activeScenario, 
    activeVisualFX,
    selectedWeaponId,
    weapons,
    fireWeapon,
    selectWeapon,
    setMasterArm,
    hitmarkerActive,
    juryAutoPilot,
    radarSweepDeg
  } = useSimulator();

  const [internalCameraMode, setInternalCameraMode] = useState<CameraViewMode>('orbit');
  const cameraMode = externalCameraMode || internalCameraMode;

  const handleSetCameraMode = (mode: CameraViewMode) => {
    setInternalCameraMode(mode);
    if (onCameraModeChange) onCameraModeChange(mode);
  };

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const droneMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const ballisticFXRef = useRef<BallisticFXEngine | null>(null);
  const vrButtonContainerRef = useRef<HTMLDivElement>(null);

  const [headingDeg, setHeadingDeg] = useState(0);
  const [pitchDeg, setPitchDeg] = useState(14);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; active: boolean }>({
    x: 500,
    y: 300,
    active: false
  });
  const [projectedTargets, setProjectedTargets] = useState<ProjectedTargetHUD[]>([]);
  const [opticalZoom, setOpticalZoom] = useState<number>(1); // 1x, 2x, 4x, 8x

  // Dynamic Camera Orbit & Look Params (Smooth, never stuck)
  const cameraParams = useRef({
    yaw: 0,
    pitch: 0.25,
    dist: 90,
    isDragging: false,
    prevX: 0,
    prevY: 0,
    panX: 0,
    panZ: 0
  });

  const selectedDrone = drones.find(d => d.instanceId === selectedDroneId);

  // Initialize Three.js Scene, Camera, Terrain, and Single Unified Render Loop
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene & Perspective Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.5, 7000);
    camera.position.set(0, 40, 95);
    camera.lookAt(0, 15, 0);
    cameraRef.current = camera;

    // 2. High-Performance WebGL Renderer with ACES Tone Mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.xr.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // 3. Initialize Ballistic Effects Engine
    const ballisticFX = new BallisticFXEngine(scene);
    ballisticFXRef.current = ballisticFX;

    // 4. WebXR VR Button Setup
    if (typeof navigator !== 'undefined' && 'xr' in navigator) {
      if (vrButtonContainerRef.current) {
        vrButtonContainerRef.current.innerHTML = '';
        const vrBtn = VRButton.createButton(renderer);
        vrBtn.style.position = 'relative';
        vrBtn.style.top = '0';
        vrBtn.style.left = '0';
        vrBtn.style.padding = '6px 12px';
        vrBtn.style.border = '1px solid #00e5ff';
        vrBtn.style.borderRadius = '6px';
        vrBtn.style.background = '#0a192f';
        vrBtn.style.color = '#00e5ff';
        vrBtn.style.fontFamily = 'monospace';
        vrBtn.style.fontSize = '10px';
        vrBtn.style.fontWeight = 'bold';
        vrBtn.style.cursor = 'pointer';
        vrButtonContainerRef.current.appendChild(vrBtn);
      }
    }

    // 5. Photorealistic Terrain & Natural Mountain Foliage
    setupBattlefieldEnvironment(scene, activeScenario.terrain, activeScenario.timeOfDay, activeScenario.weather);

    // 6. Military Forward Operating Base (FOB) Defences & Radomes
    const fobInstallation = MilitaryBaseAssets.createFOBInstallation();
    scene.add(fobInstallation);

    // 7. Mouse Orbit, Look, and Zoom Controls (Smooth 360° rotation)
    const onMouseDown = (e: MouseEvent) => {
      // Don't drag if clicking UI buttons
      if ((e.target as HTMLElement).closest('button')) return;
      cameraParams.current.isDragging = true;
      cameraParams.current.prevX = e.clientX;
      cameraParams.current.prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!cameraParams.current.isDragging) return;
      const deltaX = e.clientX - cameraParams.current.prevX;
      const deltaY = e.clientY - cameraParams.current.prevY;
      cameraParams.current.prevX = e.clientX;
      cameraParams.current.prevY = e.clientY;

      cameraParams.current.yaw -= deltaX * 0.0055;
      const minPitch = cameraMode === 'target' ? -1.4 : -0.7;
      const maxPitch = cameraMode === 'target' ? 1.4 : 1.4;
      cameraParams.current.pitch = Math.max(minPitch, Math.min(maxPitch, cameraParams.current.pitch + deltaY * 0.0055));

      const deg = Math.round(((cameraParams.current.yaw * 180 / Math.PI) % 360 + 360) % 360);
      setHeadingDeg(deg);
      setPitchDeg(Math.round((cameraParams.current.pitch * 180) / Math.PI));
    };

    const onMouseUp = () => {
      cameraParams.current.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      const minDist = cameraMode === 'target' ? 10 : 8;
      const maxDist = cameraMode === 'target' ? 350 : 650;
      cameraParams.current.dist = Math.max(minDist, Math.min(maxDist, cameraParams.current.dist + e.deltaY * 0.15));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: true });

    // 8. SINGLE CONSOLIDATED HIGH-PERFORMANCE RENDER LOOP
    let lastTime = performance.now();

    renderer.setAnimationLoop((currentTime: number) => {
      const delta = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      // A. Rotate primary AESA radar antenna on base mast
      const radarAntenna = scene.getObjectByName('radar_antenna');
      if (radarAntenna) {
        radarAntenna.rotation.y += delta * 2.2;
      }

      // B. Rotate drone propellers & turbines
      droneMeshesRef.current.forEach(group => {
        group.traverse(child => {
          if (child.name.startsWith('rotor_')) {
            child.rotation.y += 45 * delta;
          }
        });
      });

      // C. Update Ballistic Effects Engine (tracers, particles, laser dwell)
      if (ballisticFXRef.current) {
        ballisticFXRef.current.update(delta);
      }

      // D. DYNAMIC PIVOT CAMERA ENGINE (Resolves stuck camera and angle locks)
      const currentSelected = drones.find(d => d.instanceId === selectedDroneId);
      const { yaw, pitch, dist } = cameraParams.current;

      if (cameraMode === 'target' && currentSelected && currentSelected.status === 'flying') {
        // DRONE VIEW: Smooth 360° orbit pivot around the active drone!
        const pivot = new THREE.Vector3(...currentSelected.position);
        const droneDist = Math.max(6, Math.min(85, dist * 0.28));
        const camX = pivot.x + Math.sin(yaw) * Math.cos(pitch) * droneDist;
        const camY = Math.max(1.5, pivot.y + Math.sin(pitch) * droneDist);
        const camZ = pivot.z + Math.cos(yaw) * Math.cos(pitch) * droneDist;

        camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.14);
        camera.lookAt(pivot.x, pivot.y, pivot.z);

      } else if (cameraMode === 'gunner') {
        // GUNNER SIGHT: Mounted directly on 30mm CIWS autocannon base
        const gunnerOrigin = new THREE.Vector3(-25, 6.8, -10);
        camera.position.lerp(gunnerOrigin, 0.2);

        if (currentSelected && currentSelected.status === 'flying') {
          // Track target with smooth aim interpolation
          const tgt = new THREE.Vector3(...currentSelected.position);
          camera.lookAt(tgt.x, tgt.y, tgt.z);

          // Slew CIWS and Laser turrets towards target
          const ciws = scene.getObjectByName('ciws_turret');
          if (ciws) ciws.lookAt(tgt.x, ciws.position.y, tgt.z);
          const laser = scene.getObjectByName('laser_dew_dome');
          if (laser) laser.lookAt(tgt);

        } else {
          // Manual gunner slew using mouse angles
          const lookDir = new THREE.Vector3(
            Math.sin(yaw) * Math.cos(pitch) * 200,
            Math.sin(pitch) * 200 + 10,
            Math.cos(yaw) * Math.cos(pitch) * 200
          );
          camera.lookAt(gunnerOrigin.clone().add(lookDir));

          const ciws = scene.getObjectByName('ciws_turret');
          if (ciws) ciws.lookAt(gunnerOrigin.x + lookDir.x, ciws.position.y, gunnerOrigin.z + lookDir.z);
        }

      } else if (cameraMode === 'overhead') {
        // SATELLITE MAP: Top-down altitude surveillance
        const overheadPos = new THREE.Vector3(0, 950, 0);
        camera.position.lerp(overheadPos, 0.08);
        camera.lookAt(0, 0, -10);

      } else {
        // BASE ORBIT: Smooth 360° orbit around Forward Operating Base
        const basePivot = new THREE.Vector3(0, 8, 0);
        const camX = basePivot.x + Math.sin(yaw) * Math.cos(pitch) * dist;
        const camY = basePivot.y + Math.max(3, Math.sin(pitch) * dist + 16);
        const camZ = basePivot.z + Math.cos(yaw) * Math.cos(pitch) * dist;

        camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.12);
        camera.lookAt(basePivot.x, basePivot.y, basePivot.z);
      }

      // E. Update Optical FOV Zoom
      const targetFov = cameraMode === 'gunner' 
        ? (opticalZoom === 8 ? 7 : (opticalZoom === 4 ? 14 : (opticalZoom === 2 ? 28 : 55)))
        : 55;
      if (Math.abs(camera.fov - targetFov) > 0.1) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.15);
        camera.updateProjectionMatrix();
      }

      // F. Render 3D Scene
      renderer.render(scene, camera);
    });

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      renderer.setAnimationLoop(null);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      if (ballisticFXRef.current) {
        ballisticFXRef.current.dispose();
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeScenario.terrain, activeScenario.timeOfDay, activeScenario.weather, cameraMode, selectedDroneId, opticalZoom]);

  // Project 3D Drone Positions to 2D Screen Space for Interactive HUD Brackets & Lead Pippers
  useEffect(() => {
    let animId: number;

    const projectDrones = () => {
      const camera = cameraRef.current;
      if (camera && mountRef.current) {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        const projected: ProjectedTargetHUD[] = [];
        const tempV = new THREE.Vector3();
        const leadV = new THREE.Vector3();

        drones.forEach(d => {
          if (!d || !d.position || !Array.isArray(d.position) || d.status === 'destroyed') return;
          
          tempV.set(d.position[0], d.position[1], d.position[2]);
          const dist = d.distanceToBase;

          // Closure rate calculation
          const vx = d.velocity[0] || 0;
          const vy = d.velocity[1] || 0;
          const vz = d.velocity[2] || 0;
          const dot = -(d.position[0] * vx + d.position[1] * vy + d.position[2] * vz);
          const vc = dist > 0 ? Math.round((dot / dist) * 10) / 10 : 0;

          // Ballistic lead calculation (vMuzzle = 1050 m/s for 30mm CIWS)
          let leadX: number | undefined;
          let leadY: number | undefined;
          if (dist > 0) {
            const timeOfFlight = dist / 1050; // seconds
            leadV.set(
              d.position[0] + vx * timeOfFlight,
              d.position[1] + vy * timeOfFlight,
              d.position[2] + vz * timeOfFlight
            );
            leadV.project(camera);
            if (leadV.z < 1.0) {
              leadX = (leadV.x * 0.5 + 0.5) * w;
              leadY = (-(leadV.y * 0.5) + 0.5) * h;
            }
          }

          tempV.project(camera);

          const spec = DRONE_DATABASE[d.specId];
          const isSelected = d.instanceId === selectedDroneId;

          if (tempV.z < 1.0) {
            const sx = (tempV.x * 0.5 + 0.5) * w;
            const sy = (-(tempV.y * 0.5) + 0.5) * h;

            if (sx >= 15 && sx <= w - 15 && sy >= 15 && sy <= h - 15) {
              // Target is comfortably inside screen FOV
              projected.push({
                id: d.instanceId,
                name: spec ? spec.name : 'Hostile Drone',
                x: sx,
                y: sy,
                dist,
                alt: Math.round(d.position[1]),
                isSelected,
                status: d.status,
                threatLevel: spec ? spec.threatLevel : 'HIGH',
                leadX,
                leadY,
                isOffscreen: false,
                vc
              });
            } else {
              // Off-screen on sides/top/bottom
              const clampedX = Math.max(30, Math.min(w - 30, sx));
              const clampedY = Math.max(30, Math.min(h - 30, sy));
              const angle = Math.atan2(sy - h / 2, sx - w / 2);
              projected.push({
                id: d.instanceId,
                name: spec ? spec.name : 'Hostile Drone',
                x: sx,
                y: sy,
                dist,
                alt: Math.round(d.position[1]),
                isSelected,
                status: d.status,
                threatLevel: spec ? spec.threatLevel : 'HIGH',
                isOffscreen: true,
                edgeX: clampedX,
                edgeY: clampedY,
                edgeAngle: angle,
                vc
              });
            }
          } else {
            // Target is behind camera - project edge arrow
            const angle = Math.atan2(-tempV.y, -tempV.x);
            const clampedX = w / 2 + Math.cos(angle) * (w / 2 - 35);
            const clampedY = h / 2 + Math.sin(angle) * (h / 2 - 35);
            projected.push({
              id: d.instanceId,
              name: spec ? spec.name : 'Hostile Drone',
              x: clampedX,
              y: clampedY,
              dist,
              alt: Math.round(d.position[1]),
              isSelected,
              status: d.status,
              threatLevel: spec ? spec.threatLevel : 'HIGH',
              isOffscreen: true,
              edgeX: clampedX,
              edgeY: clampedY,
              edgeAngle: angle,
              vc
            });
          }
        });

        setProjectedTargets(projected);
      }

      animId = requestAnimationFrame(projectDrones);
    };

    animId = requestAnimationFrame(projectDrones);
    return () => cancelAnimationFrame(animId);
  }, [drones, selectedDroneId]);

  // Synchronize 3D Drone Meshes with Simulation State
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const currentDroneIds = new Set(drones.map(d => d.instanceId));

    // Remove old meshes
    droneMeshesRef.current.forEach((group, id) => {
      if (!currentDroneIds.has(id)) {
        scene.remove(group);
        droneMeshesRef.current.delete(id);
      }
    });

    // Add or Update Drone meshes
    drones.forEach(drone => {
      let group = droneMeshesRef.current.get(drone.instanceId);

      if (!group) {
        const spec = DRONE_DATABASE[drone.specId] || DRONE_DATABASE['micro_quad_dji'];
        group = RealisticDroneMeshes.createDroneMesh(spec);
        group.name = drone.instanceId;
        scene.add(group);
        droneMeshesRef.current.set(drone.instanceId, group);
      }

      group.position.set(drone.position[0], drone.position[1], drone.position[2]);

      // Heading rotation
      if (drone.velocity[0] !== 0 || drone.velocity[2] !== 0) {
        const targetHeading = new THREE.Vector3(
          drone.position[0] + drone.velocity[0],
          drone.position[1] + drone.velocity[1],
          drone.position[2] + drone.velocity[2]
        );
        group.lookAt(targetHeading);
      }

      group.visible = drone.status !== 'destroyed';
    });
  }, [drones, selectedDroneId]);

  // Handle Dynamic Ballistic FX Firing Events
  useEffect(() => {
    const ballisticFX = ballisticFXRef.current;
    if (!ballisticFX) return;

    activeVisualFX.forEach(fx => {
      const p1 = new THREE.Vector3(...fx.origin);
      const p2 = new THREE.Vector3(...fx.targetPosition);

      if (fx.type === 'ciws_tracer') {
        ballisticFX.spawnCIWSBurst(p1, p2, 8);
      } else if (fx.type === 'laser_dew') {
        ballisticFX.setLaserDwell(p1, p2, true);
        setTimeout(() => ballisticFX.setLaserDwell(p1, p2, false), 500);
      } else if (fx.type === 'explosion') {
        ballisticFX.spawnTargetHitSparks(p2, 16);
      }
    });
  }, [activeVisualFX]);

  // Visual Sensor Mode Shader Filter
  const getSensorFilterStyle = (mode: SensorMode) => {
    switch (mode) {
      case 'nvg':
        return 'filter-nvg';
      case 'flir_white':
        return 'filter-thermal brightness-125';
      case 'flir_black':
        return 'filter-thermal invert';
      case 'flir_ironbow':
        return 'filter contrast-200 saturate-200 hue-rotate-90';
      default:
        return '';
    }
  };

  // Compute dynamic aiming coordinates: magnetic snap to nearby target, cursor tracking, and locked target tracking
  const onScreenTargets = projectedTargets.filter(t => !t.isOffscreen);
  const selectedTargetProj = onScreenTargets.find(t => t.isSelected);

  // Find closest drone to cursor for Magnetic Target Snap (within 58px)
  const magneticSnapTarget = cursorPos.active
    ? onScreenTargets.reduce<{ tgt: ProjectedTargetHUD | null; distPx: number }>(
        (best, t) => {
          const dPx = Math.hypot(t.x - cursorPos.x, t.y - cursorPos.y);
          return dPx < best.distPx ? { tgt: t, distPx: dPx } : best;
        },
        { tgt: null, distPx: 58 }
      ).tgt
    : null;

  // Dynamic Aiming Reticle coordinates:
  // 1) If cursor is hovering near any target, magnetically snap onto that target!
  // 2) If user is moving cursor on screen, follow cursor smoothly!
  // 3) If cursor leaves canvas and a target is locked, slave directly onto the locked target!
  const aimX = magneticSnapTarget
    ? magneticSnapTarget.x
    : cursorPos.active
      ? cursorPos.x
      : selectedTargetProj
        ? selectedTargetProj.x
        : 500;

  const aimY = magneticSnapTarget
    ? magneticSnapTarget.y
    : cursorPos.active
      ? cursorPos.y
      : selectedTargetProj
        ? selectedTargetProj.y
        : 300;

  const handleViewportMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true
    });
  };

  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (magneticSnapTarget) {
      selectDrone(magneticSnapTarget.id);
    }
  };

  const handleViewportDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const targetToEngage = magneticSnapTarget || selectedTargetProj;
    if (targetToEngage) {
      selectDrone(targetToEngage.id);
      setMasterArm('ARMED');
      const droneObj = drones.find(d => d.instanceId === targetToEngage.id);
      const spec = droneObj ? DRONE_DATABASE[droneObj.specId] : null;
      if (spec) {
        const bestWeapon =
          spec.category === 'swarm_member'
            ? 'hpm_emp_emitter'
            : spec.category === 'loitering_munition' || spec.category === 'fpv_kamikaze'
              ? 'laser_dew_system'
              : spec.category === 'heavy_hexacopter'
                ? 'ciws_30mm_autocannon'
                : 'rf_jammer_directional';
        selectWeapon(bestWeapon);
      }
      fireWeapon(targetToEngage.id, true);
    }
  };

  return (
    <div
      onMouseMove={handleViewportMouseMove}
      onMouseLeave={() => setCursorPos(prev => ({ ...prev, active: false }))}
      onClick={handleViewportClick}
      onDoubleClick={handleViewportDoubleClick}
      className="relative w-full h-full overflow-hidden bg-slate-950 select-none"
    >
      {/* 3D WebGL / WebXR Canvas Viewport */}
      <div 
        ref={mountRef} 
        className={`w-full h-full cursor-none transition-all duration-300 ${getSensorFilterStyle(sensorMode)}`}
      />

      {/* Optical Sensor Mode / Camera Switch Calibration Flash Overlay */}
      <div
        key={`sensor-flash-${sensorMode}-${cameraMode}-${opticalZoom}`}
        className="absolute inset-0 bg-cyan-400/20 pointer-events-none z-20 animate-sensor-boot"
      />

      {/* Electronic Warfare (EW) Tactical Screen Noise & Jamming Static Overlay */}
      {(activeScenario.radarJammingLevel > 0.15 || activeScenario.rfNoiseLevel > 0.15 || drones.some(d => d.specId === 'decoy_drone' && d.status === 'flying')) && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden mix-blend-screen opacity-30">
          <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,180,0,0.14)_3px,transparent_4px)] animate-pulse" />
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-amber-950/80 border border-amber-500/60 px-3 py-1 rounded-md text-[10px] font-mono text-amber-300 flex items-center gap-2 shadow-2xl backdrop-blur-md pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold tracking-wider">⚠️ EW ENVIRONMENT: ACTIVE RF/RADAR JAMMING DETECTED</span>
            <span className="text-amber-400/80">| SENSOR LOSS: {Math.round(Math.max(activeScenario.radarJammingLevel, activeScenario.rfNoiseLevel) * 100)}%</span>
          </div>
        </div>
      )}

      {/* Real-Time Screen-Space Interactive Target HUD Brackets & Ballistic Lead Pippers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Predictive Lead Pipper Lines & Dynamic Aim Tether Vector (SVG Layer) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Dynamic Tether Line from Moving Aiming Sight to Locked Target */}
          {selectedTargetProj && cursorPos.active && (
            <line
              x1={aimX}
              y1={aimY}
              x2={selectedTargetProj.x}
              y2={selectedTargetProj.y}
              stroke="#f43f5e"
              strokeWidth="1.2"
              strokeDasharray="5 4"
              strokeOpacity="0.65"
            />
          )}

          {projectedTargets.filter(t => t.isSelected && !t.isOffscreen && t.leadX !== undefined && t.leadY !== undefined).map(t => (
            <g key={`lead-vector-${t.id}`}>
              <line
                x1={t.x}
                y1={t.y}
                x2={t.leadX!}
                y2={t.leadY!}
                stroke="#00f0ff"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                className="opacity-80"
              />
            </g>
          ))}
        </svg>

        {/* Target Reticles and Offscreen Indicators */}
        {projectedTargets.map(tgt => {
          const isSelected = tgt.isSelected;
          const isCritical = tgt.threatLevel === 'CRITICAL' || tgt.threatLevel === 'HIGH';

          if (tgt.isOffscreen) {
            // Off-Screen Threat Indicator Arrow
            return (
              <div
                key={`offscreen-${tgt.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  selectDrone(tgt.id);
                }}
                style={{
                  left: `${tgt.edgeX}px`,
                  top: `${tgt.edgeY}px`,
                  transform: 'translate(-50%, -50%)'
                }}
                className="absolute pointer-events-auto cursor-pointer group flex items-center justify-center"
              >
                <div 
                  style={{ transform: `rotate(${(tgt.edgeAngle || 0) * (180 / Math.PI)}deg)` }}
                  className="w-8 h-8 flex items-center justify-center filter drop-shadow-md"
                >
                  {/* Directional Chevron pointing outward along edge vector toward offscreen target */}
                  <svg viewBox="0 0 24 24" className={`w-6 h-6 ${
                    isSelected ? 'text-rose-500 fill-rose-500 animate-pulse' : (isCritical ? 'text-amber-400 fill-amber-400' : 'text-cyan-400 fill-cyan-400')
                  }`}>
                    <path d="M5 3l14 9-14 9 4-9z" />
                  </svg>
                </div>
                <div className="absolute left-9 font-mono text-[8px] bg-black/85 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300 whitespace-nowrap shadow-xl">
                  <span className="font-bold text-white">{tgt.id.toUpperCase()}</span> ({tgt.dist}m)
                </div>
              </div>
            );
          }

          return (
            <React.Fragment key={tgt.id}>
              {/* Ballistic Lead Pipper Reticle */}
              {isSelected && tgt.leadX !== undefined && tgt.leadY !== undefined && (
                <div
                  style={{
                    left: `${tgt.leadX}px`,
                    top: `${tgt.leadY}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="absolute pointer-events-none flex flex-col items-center justify-center z-20"
                >
                  <div className="relative w-8 h-8 rounded-full border border-cyan-400 flex items-center justify-center glow-cyan">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <div className="absolute top-0 w-0.5 h-2 bg-cyan-400" />
                    <div className="absolute bottom-0 w-0.5 h-2 bg-cyan-400" />
                    <div className="absolute left-0 h-0.5 w-2 bg-cyan-400" />
                    <div className="absolute right-0 h-0.5 w-2 bg-cyan-400" />
                  </div>
                  <span className="text-[8px] font-mono font-bold text-cyan-300 bg-black/70 px-1 rounded mt-0.5 whitespace-nowrap border border-cyan-500/30">
                    EEGS LEAD PIPPER
                  </span>
                </div>
              )}

              {/* Main Target Bounding Box / NATO Reticle */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  selectDrone(tgt.id);
                }}
                style={{
                  left: `${tgt.x}px`,
                  top: `${tgt.y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
                className="absolute pointer-events-auto cursor-pointer transition-transform duration-75 group"
              >
                {isSelected ? (
                  /* NATO Hostile Air Diamond Locking Gate with Elastic Snap-In & Dual Counter-Rotating Rings */
                  <div className="relative w-12 h-12 flex items-center justify-center animate-lock-snap">
                    {/* Expanding Sonar Lock Ring */}
                    <div className="absolute inset-0 rounded-full border border-rose-500/50 animate-sonar-ping" />

                    {/* Outer Clockwise Reticle Ring */}
                    <div className="absolute inset-0 w-11 h-11 m-auto rounded-full border border-dashed border-rose-500/70 animate-reticle-slow" />

                    {/* Inner Counter-Clockwise Range Ring */}
                    <div className="absolute inset-0 w-8 h-8 m-auto rounded-full border border-dotted border-amber-400/60 animate-reticle-reverse" />
                    
                    {/* Inner Diamond (45 deg Rotated Square) */}
                    <div className="w-6 h-6 border-2 border-rose-500 rotate-45 shadow glow-rose animate-pulse flex items-center justify-center">
                      <div className="w-1 h-1 bg-rose-500" />
                    </div>

                    {/* Corner Reticle Brackets */}
                    <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t-2 border-l-2 border-rose-400" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t-2 border-r-2 border-rose-400" />
                    <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-b-2 border-l-2 border-rose-400" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b-2 border-r-2 border-rose-400" />
                  </div>
                ) : (
                  /* Standard Acquisition Bracket */
                  <div className={`relative w-10 h-10 flex items-center justify-center transition-all duration-200 ${
                    isCritical ? 'border border-amber-400/80 hover:scale-110' : 'border border-cyan-400/80 hover:scale-110'
                  }`}>
                    <div className={`w-1 h-1 rounded-full ${isCritical ? 'bg-amber-400' : 'bg-cyan-400'}`} />

                    {/* Corner Accents */}
                    <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-t border-l border-white" />
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 border-t border-r border-white" />
                    <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 border-b border-l border-white" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-b border-r border-white" />
                  </div>
                )}

                {/* Tactical Target Callout Data Tag */}
                <div className={`absolute left-13 top-0 font-mono text-[8px] whitespace-nowrap px-1.5 py-0.5 rounded shadow-xl backdrop-blur-md border transition-all duration-200 ${
                  isSelected
                    ? 'glass-panel-alert border-rose-500 text-rose-200 glow-rose animate-slide-in-left'
                    : 'glass-panel-obsidian border-slate-700 text-cyan-300'
                }`}>
                  <div className="font-extrabold tracking-wider">{tgt.id.toUpperCase()}</div>
                  <div><span className="font-bold text-white">{tgt.dist}m</span> | {tgt.alt}m</div>
                  {tgt.vc !== undefined && (
                    <div className={`text-[7px] font-bold ${tgt.vc > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      Vc: {tgt.vc > 0 ? `+${tgt.vc}` : tgt.vc}m/s
                    </div>
                  )}
                  {isSelected && (
                    <div className="text-[7px] text-rose-300 font-black uppercase animate-pulse flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping" />
                      LOCKED
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* DYNAMIC MOVING AIMING SIGHT (FOLLOWS CURSOR & MAGNETICALLY SNAPS) */}
      {/* ================================================================= */}
      {(cursorPos.active || selectedTargetProj) && (
        <div
          style={{
            left: `${aimX}px`,
            top: `${aimY}px`,
            transform: 'translate(-50%, -50%)'
          }}
          className="absolute pointer-events-none z-20 transition-[left,top] duration-75 ease-out"
        >
          <div className="relative flex items-center justify-center">
            {/* Outer Slewing Aim Ring */}
            <div
              className={`rounded-full border transition-all duration-150 flex items-center justify-center ${
                magneticSnapTarget
                  ? 'w-16 h-16 border-rose-400 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.45)] scale-105'
                  : selectedTargetProj && !cursorPos.active
                    ? 'w-14 h-14 border-rose-500/80'
                    : 'w-11 h-11 border-cyan-400/70 bg-cyan-500/5'
              }`}
            >
              {/* 4 Tick Marks */}
              <div className={`absolute -top-1.5 w-0.5 h-2.5 ${magneticSnapTarget ? 'bg-rose-400' : 'bg-cyan-400'}`} />
              <div className={`absolute -bottom-1.5 w-0.5 h-2.5 ${magneticSnapTarget ? 'bg-rose-400' : 'bg-cyan-400'}`} />
              <div className={`absolute -left-1.5 h-0.5 w-2.5 ${magneticSnapTarget ? 'bg-rose-400' : 'bg-cyan-400'}`} />
              <div className={`absolute -right-1.5 h-0.5 w-2.5 ${magneticSnapTarget ? 'bg-rose-400' : 'bg-cyan-400'}`} />
              {/* Center Pipper Dot */}
              <div className={`w-1.5 h-1.5 rounded-full ${magneticSnapTarget ? 'bg-rose-400 animate-ping' : 'bg-cyan-300'}`} />
            </div>

            {/* Live Micro-Telemetry Readout Moving with the Aiming Sight */}
            <div className="absolute left-10 top-2 font-mono text-[8px] leading-tight whitespace-nowrap bg-slate-950/80 border border-cyan-500/30 px-1.5 py-0.5 rounded backdrop-blur-sm text-cyan-300">
              {magneticSnapTarget ? (
                <>
                  <div className="text-rose-300 font-bold">SNAP: {magneticSnapTarget.id.toUpperCase()}</div>
                  <div className="text-emerald-300">CLICK LOCK · DBL-CLICK FIRE</div>
                </>
              ) : (
                <>
                  <div>AZ {((headingDeg + Math.round((aimX - 500) * 0.08)) + 360) % 360}° · EL {pitchDeg - Math.round((aimY - 300) * 0.05)}°</div>
                  <div className="text-slate-400">{weapons[selectedWeaponId]?.name.split(' ')[0] || 'C4I'} SIGHT</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tactical Hitmarker (Appears at locked target or cursor position, never stuck!) */}
      {hitmarkerActive && (
        <div
          style={{
            left: `${selectedTargetProj ? selectedTargetProj.x : aimX}px`,
            top: `${selectedTargetProj ? selectedTargetProj.y : aimY}px`,
            transform: 'translate(-50%, -50%)'
          }}
          className="absolute pointer-events-none z-30"
        >
          <div className="relative w-12 h-12 flex items-center justify-center animate-ping">
            <div className="absolute w-7 h-0.5 bg-rose-500 rotate-45 shadow-lg shadow-rose-500/80" />
            <div className="absolute w-7 h-0.5 bg-rose-500 -rotate-45 shadow-lg shadow-rose-500/80" />
          </div>
        </div>
      )}

      {/* Sleek Camera Switcher & Optical Zoom Pill (Positioned cleanly below top status bar) */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 pointer-events-auto font-mono text-[10px]">
        {/* Optical Zoom Selector (for Gunner Sight) */}
        {cameraMode === 'gunner' && (
          <div className="flex items-center bg-black/80 backdrop-blur-md rounded border border-rose-500/40 p-0.5 shadow-lg text-rose-300 text-[9px]">
            <span className="px-1.5 font-bold flex items-center gap-1">
              <Eye className="w-2.5 h-2.5 text-rose-400" />
              ZOOM:
            </span>
            {[1, 2, 4, 8].map(z => (
              <button
                key={z}
                onClick={() => setOpticalZoom(z)}
                className={`px-1.5 py-0.2 rounded font-bold transition-all ${
                  opticalZoom === z ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {z}x
              </button>
            ))}
          </div>
        )}

        {/* View Mode Buttons */}
        <div className="flex items-center bg-black/75 backdrop-blur-md rounded border border-slate-700/80 p-0.5 shadow-lg">
          <button
            onClick={() => handleSetCameraMode('gunner')}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
              cameraMode === 'gunner' ? 'bg-rose-600 text-white font-bold shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Mount camera on 30mm CIWS / Laser turret [Key C]"
          >
            <Crosshair className="w-3 h-3 text-rose-400" />
            <span>GUNNER</span>
          </button>

          <button
            onClick={() => handleSetCameraMode('target')}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
              cameraMode === 'target' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Smooth 360° orbit inspection around locked target drone"
          >
            <Target className="w-3 h-3 text-cyan-300" />
            <span>DRONE 360°</span>
          </button>

          <button
            onClick={() => handleSetCameraMode('orbit')}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
              cameraMode === 'orbit' ? 'bg-slate-700 text-cyan-300 font-bold' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Free tactical orbit around base"
          >
            <Video className="w-3 h-3" />
            <span>ORBIT</span>
          </button>

          <button
            onClick={() => handleSetCameraMode('overhead')}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
              cameraMode === 'overhead' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="High-altitude overhead satellite view"
          >
            <Compass className="w-3 h-3 text-amber-400" />
            <span>SAT MAP</span>
          </button>
        </div>

        <div ref={vrButtonContainerRef} className="shadow-lg scale-90 origin-left" />
      </div>

      {/* AI Auto-Commander Active HUD Banner */}
      {juryAutoPilot && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 px-3 py-1 rounded bg-amber-500/20 border border-amber-400/60 backdrop-blur-md text-amber-200 font-mono text-[10px] font-bold shadow-lg">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>ASTRA AI AUTO-COMMANDER ACTIVE • AUTONOMOUS LOCK & INTERCEPT</span>
        </div>
      )}

      {/* Dynamic Gunner Sight Mode Overlay (Moves with Target Lock or Cursor!) */}
      {cameraMode === 'gunner' && (
        <div
          style={{
            left: `${selectedTargetProj ? selectedTargetProj.x : aimX}px`,
            top: `${selectedTargetProj ? selectedTargetProj.y : aimY}px`,
            transform: 'translate(-50%, -50%)'
          }}
          className="absolute pointer-events-none z-10 transition-[left,top] duration-75 ease-out"
        >
          <div className="relative w-48 h-48 border border-rose-500/45 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            <div className="absolute top-0 w-0.5 h-6 bg-rose-500/80" />
            <div className="absolute bottom-0 w-0.5 h-6 bg-rose-500/80" />
            <div className="absolute left-0 h-0.5 w-6 bg-rose-500/80" />
            <div className="absolute right-0 h-0.5 w-6 bg-rose-500/80" />

            <div className="absolute -top-7 text-[10px] font-mono text-rose-300 font-bold bg-black/75 px-2 py-0.5 rounded border border-rose-500/30 whitespace-nowrap">
              30mm CIWS / DEW SIGHT · AZ {headingDeg}° EL {pitchDeg}°
            </div>
            {selectedDrone && (
              <div className="absolute -bottom-7 text-[10px] font-mono text-cyan-300 bg-black/75 px-2 py-0.5 rounded border border-cyan-500/30 whitespace-nowrap">
                DIST: {selectedDrone.distanceToBase}m | {selectedDrone.instanceId.toUpperCase()} SLAVED
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// THREE.JS BATTLEFIELD ENVIRONMENT BUILDERS
// ==========================================

function setupBattlefieldEnvironment(
  scene: THREE.Scene, 
  terrain: TerrainType, 
  timeOfDay: TimeOfDay, 
  weather: WeatherType
) {
  let skyColor = 0x1a2b4c;
  let fogColor = 0x0f172a;
  let fogDensity = 0.0006;

  if (timeOfDay === 'day') {
    skyColor = 0x6ba4d8;
    fogColor = 0x8ab9de;
    fogDensity = 0.0002;
  } else if (timeOfDay === 'dusk') {
    skyColor = 0x4a2830;
    fogColor = 0x3d202d;
    fogDensity = 0.0004;
  } else {
    skyColor = 0x050914;
    fogColor = 0x080f1e;
    fogDensity = 0.0007;
  }

  if (weather === 'foggy') fogDensity = 0.0024;
  if (weather === 'heavy_rain') {
    skyColor = 0x1f2937;
    fogColor = 0x111827;
    fogDensity = 0.0015;
  }
  if (weather === 'sandstorm') {
    skyColor = 0x614a2a;
    fogColor = 0x4e3a1f;
    fogDensity = 0.0022;
  }

  scene.background = new THREE.Color(skyColor);
  scene.fog = new THREE.FogExp2(fogColor, fogDensity);

  // Natural Sky & Sun Lighting
  const ambientLight = new THREE.AmbientLight(
    timeOfDay === 'day' ? 0xffffff : (timeOfDay === 'dusk' ? 0xffc499 : 0x334466), 
    timeOfDay === 'day' ? 1.4 : (timeOfDay === 'dusk' ? 0.9 : 0.4)
  );
  ambientLight.name = 'env_ambient_light';
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(
    timeOfDay === 'day' ? 0xfffaed : (timeOfDay === 'dusk' ? 0xff8844 : 0x88aaff), 
    timeOfDay === 'day' ? 2.5 : (timeOfDay === 'dusk' ? 1.8 : 0.6)
  );
  sunLight.position.set(400, 600, 250);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 50;
  sunLight.shadow.camera.far = 2500;
  sunLight.shadow.camera.left = -400;
  sunLight.shadow.camera.right = 400;
  sunLight.shadow.camera.top = 400;
  sunLight.shadow.camera.bottom = -400;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  // Photorealistic Procedural 3D Mountain Terrain with PBR Shaders
  const terrainMesh = TerrainGenerator.createTerrainMesh(terrain, weather);
  scene.add(terrainMesh);

  // Instanced Foliage (650+ pine trees, spruces, boulders adapted to altitude)
  const forest = FoliageGenerator.createForestInstanced(terrain);
  scene.add(forest);

  // Tactical Range Rings (200m, 500m, 1000m, 1500m)
  for (const radius of [200, 500, 1000, 1500]) {
    const ringGeo = new THREE.RingGeometry(radius - 1.5, radius + 1.5, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 1.0;
    scene.add(ring);
  }
}

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  ScenarioDefinition, 
  DroneInstance, 
  WeaponSpec, 
  TacticalEventLog, 
  MissionResult, 
  TraineeProfile, 
  SensorMode, 
  DroneCategory,
  WeaponVisualFXEvent
} from '../types/simulation';
import { DEFAULT_SCENARIOS } from '../data/defaultScenarios';
import { DRONE_DATABASE } from '../data/droneDatabase';
import { WEAPON_ARSENAL } from '../data/weaponArsenal';
import { DronePhysicsEngine } from '../engine/DronePhysics';
import { SensorFusionEngine, RadarContact, RFSignalContact, AcousticContact } from '../engine/SensorFusion';
import { DecisionScoringEngine } from '../engine/DecisionScoring';
import { ScenarioGeneratorEngine } from '../engine/ScenarioGenerator';
import { soundManager } from '../engine/SoundEffects';
import { voiceComms } from '../engine/VoiceComms';
import { dualTerminalSync, DualTerminalMessage } from '../engine/DualTerminalSync';

interface SimulatorContextType {
  // Mission Status
  missionState: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  activeScenario: ScenarioDefinition;
  elapsedTimeSec: number;
  baseHealth: number;
  
  // Entities
  drones: DroneInstance[];
  selectedDroneId: string | null;
  selectedWeaponId: string;
  weapons: Record<string, WeaponSpec>;
  activeVisualFX: WeaponVisualFXEvent[];
  
  // Sensor State
  sensorMode: SensorMode;
  radarSweepDeg: number;
  radarContacts: RadarContact[];
  rfContacts: RFSignalContact[];
  acousticContact: AcousticContact | null;
  
  // Logs & Results
  eventLogs: TacticalEventLog[];
  lastMissionResult: MissionResult | null;
  traineeProfile: TraineeProfile;
  
  // Actions
  startScenario: (scenario: ScenarioDefinition) => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  resetSimulation: () => void;
  selectDrone: (droneId: string | null) => void;
  selectWeapon: (weaponId: string) => void;
  setSensorMode: (mode: SensorMode) => void;
  cycleSensorMode: () => void;
  cycleTarget: () => void;
  classifyDrone: (droneId: string, category: DroneCategory | 'bird_false_alarm') => void;
  fireWeapon: (targetDroneId?: string, bypassSafety?: boolean) => void;
  masterArm: 'SAFE' | 'ARMED';
  toggleMasterArm: () => void;
  setMasterArm: (state: 'SAFE' | 'ARMED') => void;
  generateProceduralMission: (difficulty?: ScenarioDefinition['difficulty']) => void;
  updateTraineeInfo: (name: string, rank: string, unit: string) => void;
  soundMuted: boolean;
  toggleSound: () => void;
  voiceCommsEnabled: boolean;
  toggleVoiceComms: () => void;
  hitmarkerActive: boolean;
}

const DEFAULT_TRAINEE: TraineeProfile = {
  id: 'TRN-2026-08',
  name: 'Capt. Vikramaditya Rathore',
  rank: 'Major',
  unit: '33 Air Defence Brigade / DSSC',
  totalMissions: 5,
  averageScore: 785,
  skillProgression: {
    detectionSpeed: 82,
    classificationAccuracy: 75,
    roeCompliance: 88,
    swarmManagement: 70,
    electronicWarfareProficiency: 65
  },
  missionHistory: []
};

const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined);

export const SimulatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [missionState, setMissionState] = useState<'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED'>('IDLE');
  const [activeScenario, setActiveScenario] = useState<ScenarioDefinition>(DEFAULT_SCENARIOS[0]);
  const [elapsedTimeSec, setElapsedTimeSec] = useState<number>(0);
  const [baseHealth, setBaseHealth] = useState<number>(100);
  
  const [drones, setDrones] = useState<DroneInstance[]>([]);
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>('rf_jammer_directional');
  const [weapons, setWeapons] = useState<Record<string, WeaponSpec>>(WEAPON_ARSENAL);
  const [activeVisualFX, setActiveVisualFX] = useState<WeaponVisualFXEvent[]>([]);
  
  const [sensorMode, setSensorMode] = useState<SensorMode>('daylight');
  const [radarSweepDeg, setRadarSweepDeg] = useState<number>(0);
  const [radarContacts, setRadarContacts] = useState<RadarContact[]>([]);
  const [rfContacts, setRfContacts] = useState<RFSignalContact[]>([]);
  const [acousticContact, setAcousticContact] = useState<AcousticContact | null>(null);
  
  const [eventLogs, setEventLogs] = useState<TacticalEventLog[]>([]);
  const [lastMissionResult, setLastMissionResult] = useState<MissionResult | null>(null);
  const [traineeProfile, setTraineeProfile] = useState<TraineeProfile>(() => {
    const saved = localStorage.getItem('astra_trainee_profile');
    return saved ? JSON.parse(saved) : DEFAULT_TRAINEE;
  });
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [voiceCommsEnabled, setVoiceCommsEnabled] = useState<boolean>(true);
  const [hitmarkerActive, setHitmarkerActive] = useState<boolean>(false);
  const [masterArm, setMasterArm] = useState<'SAFE' | 'ARMED'>('SAFE');

  const radarHistoryRef = useRef<MissionResult['radarTrackHistory']>([]);
  const elapsedTimeRef = useRef<number>(0);
  const isFinishingRef = useRef<boolean>(false);

  const toggleMasterArm = () => {
    setMasterArm(prev => {
      const next = prev === 'SAFE' ? 'ARMED' : 'SAFE';
      soundManager.playTargetLock();
      return next;
    });
  };

  // Toggle Sound & Voice
  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    soundManager.setMuted(next);
  };

  const toggleVoiceComms = () => {
    const next = !voiceCommsEnabled;
    setVoiceCommsEnabled(next);
    voiceComms.setEnabled(next);
  };

  // Cycle Sensor Mode
  const cycleSensorMode = () => {
    const modes: SensorMode[] = ['daylight', 'nvg', 'flir_white', 'flir_ironbow'];
    const idx = modes.indexOf(sensorMode);
    const nextMode = modes[(idx + 1) % modes.length];
    setSensorMode(nextMode);
  };

  // Cycle Target
  const cycleTarget = () => {
    const activeDrones = drones.filter(d => d.status === 'flying');
    if (activeDrones.length === 0) return;
    if (!selectedDroneId) {
      setSelectedDroneId(activeDrones[0].instanceId);
      return;
    }
    const idx = activeDrones.findIndex(d => d.instanceId === selectedDroneId);
    const nextDrone = activeDrones[(idx + 1) % activeDrones.length];
    setSelectedDroneId(nextDrone.instanceId);
  };

  // Add Log Entry
  const addLog = useCallback((
    eventType: TacticalEventLog['eventType'], 
    details: string, 
    severity: TacticalEventLog['severity'] = 'info',
    droneId?: string,
    weaponId?: string
  ) => {
    setEventLogs(prev => [
      {
        timestamp: Number(elapsedTimeSec.toFixed(1)),
        eventType,
        details,
        severity,
        droneId,
        weaponId
      },
      ...prev.slice(0, 100)
    ]);
  }, [elapsedTimeSec]);

  // Start Scenario
  const startScenario = useCallback((scenario: ScenarioDefinition) => {
    isFinishingRef.current = false;
    setActiveScenario(scenario);
    setMissionState('RUNNING');
    setElapsedTimeSec(0);
    elapsedTimeRef.current = 0;
    setBaseHealth(100);
    setSelectedDroneId(null);
    setWeapons(JSON.parse(JSON.stringify(WEAPON_ARSENAL)));
    setActiveVisualFX([]);
    radarHistoryRef.current = [];

    // Initialize Drone instances
    const initialDrones: DroneInstance[] = scenario.drones.map((d, idx) => {
      const spec = DRONE_DATABASE[d.specId] || DRONE_DATABASE['micro_quad_dji'];
      return {
        instanceId: `drone_${idx + 1}_${d.specId}`,
        specId: d.specId,
        position: [...d.spawnPosition] as [number, number, number],
        velocity: [0, 0, 0] as [number, number, number],
        targetDestination: [...d.targetPosition] as [number, number, number],
        health: spec.armor,
        maxHealth: spec.armor,
        status: 'flying',
        rfLinkActive: true,
        gpsLockActive: true,
        detectedByRadar: false,
        detectedByRF: false,
        detectedByOptics: false,
        distanceToBase: Math.round(Math.hypot(d.spawnPosition[0], d.spawnPosition[2])),
        swarmId: d.swarmId,
        isMotherShip: d.isMotherShip || d.specId === 'heavy_hexacopter_bomber',
        flightPath: [[...d.spawnPosition] as [number, number, number]]
      };
    });

    setDrones(initialDrones);
    setEventLogs([
      {
        timestamp: 0,
        eventType: 'THREAT_SPAWNED',
        details: `Exercise Initialized: "${scenario.title}" [${scenario.difficulty}] in ${scenario.terrain.replace('_', ' ')} terrain. Protected Asset: ${scenario.protectedAsset.name}`,
        severity: 'info'
      }
    ]);

    voiceComms.speak(`Commencing drill: ${scenario.title}. All sensor arrays online.`);
  }, []);

  // Finish Simulation
  const finishSimulation = useCallback(() => {
    if (isFinishingRef.current && missionState === 'COMPLETED') return;
    isFinishingRef.current = true;
    setMissionState('COMPLETED');

    const evaluation = DecisionScoringEngine.evaluateMission(
      activeScenario,
      drones,
      DRONE_DATABASE,
      weapons,
      eventLogs,
      elapsedTimeSec,
      baseHealth
    );

    const neutralizedCount = drones.filter(d => d.status === 'destroyed' || d.status === 'captured').length;
    const escapedCount = drones.length - neutralizedCount;

    const missionResult: MissionResult = {
      missionId: `M-${Date.now().toString().slice(-6)}`,
      scenarioId: activeScenario.id,
      scenarioTitle: activeScenario.title,
      traineeId: traineeProfile.id,
      traineeName: traineeProfile.name,
      rank: traineeProfile.rank,
      unit: traineeProfile.unit,
      date: new Date().toISOString(),
      durationSec: Math.round(elapsedTimeSec),
      threatsNeutralized: neutralizedCount,
      threatsEscaped: escapedCount,
      baseHealthRemaining: baseHealth,
      evaluation,
      eventLogs,
      radarTrackHistory: radarHistoryRef.current
    };

    setLastMissionResult(missionResult);

    voiceComms.speak(`Simulation complete. Tactical grade: ${evaluation.overallTacticalRating}. Score: ${evaluation.finalScore} points. Preparing After-Action Review.`);

    // Update Trainee progression
    setTraineeProfile(prev => {
      const updatedTotal = prev.totalMissions + 1;
      const updatedAvg = Math.round((prev.averageScore * prev.totalMissions + evaluation.finalScore) / updatedTotal);
      const updatedHistory = [missionResult, ...prev.missionHistory.slice(0, 19)];

      const updated = {
        ...prev,
        totalMissions: updatedTotal,
        averageScore: updatedAvg,
        skillProgression: {
          detectionSpeed: Math.round(prev.skillProgression.detectionSpeed * 0.8 + evaluation.detectionScore * 0.2),
          classificationAccuracy: Math.round(prev.skillProgression.classificationAccuracy * 0.8 + evaluation.classificationScore * 0.2),
          roeCompliance: Math.round(prev.skillProgression.roeCompliance * 0.8 + evaluation.roeDisciplineScore * 0.2),
          swarmManagement: Math.round(prev.skillProgression.swarmManagement * 0.8 + (neutralizedCount / (drones.length || 1)) * 100 * 0.2),
          electronicWarfareProficiency: Math.round(prev.skillProgression.electronicWarfareProficiency * 0.8 + evaluation.engagementScore * 0.2)
        },
        missionHistory: updatedHistory
      };
      localStorage.setItem('astra_trainee_profile', JSON.stringify(updated));
      return updated;
    });
  }, [activeScenario, drones, weapons, eventLogs, elapsedTimeSec, baseHealth, traineeProfile]);

  // Main Simulation Loop
  useEffect(() => {
    if (missionState !== 'RUNNING') return;

    const interval = setInterval(() => {
      const deltaSec = 0.05; // 20 updates per sec

      // Advance time and check time limit
      setElapsedTimeSec(prev => {
        const nextTime = prev + deltaSec;
        elapsedTimeRef.current = nextTime;

        // Check time limit safely outside render
        if (nextTime >= activeScenario.timeLimitSec && !isFinishingRef.current) {
          isFinishingRef.current = true;
          clearInterval(interval);
          setTimeout(() => {
            finishSimulation();
          }, 10);
          return activeScenario.timeLimitSec;
        }
        return nextTime;
      });

      // Advance Radar sweep
      setRadarSweepDeg(prev => (prev + 360 * deltaSec * 0.25) % 360);

      // Clean up expired visual effects (> 500ms)
      const now = Date.now();
      setActiveVisualFX(prev => prev.filter(fx => now - fx.createdAt < fx.durationMs));

      // Update Drones Physics with Autonomous Military Red-Team AI
      setDrones(prevDrones => {
        const { updatedDrones, newSpawnedDrones } = DronePhysicsEngine.updateDrones(
          prevDrones,
          DRONE_DATABASE,
          deltaSec,
          activeScenario.protectedAsset.position
        );

        // Handle Mother-Ship daughter drone releases
        if (newSpawnedDrones.length > 0) {
          voiceComms.calloutSwarmAlert(newSpawnedDrones.length);
          addLog(
            'RED_TEAM_TACTIC',
            `TACTICAL ALERT: Mother-ship deployed ${newSpawnedDrones.length}x daughter FPV kamikaze drones at terminal standoff range!`,
            'critical'
          );
        }

        const combinedDrones = [...updatedDrones, ...newSpawnedDrones];

        // Check base breaches
        combinedDrones.forEach(drone => {
          if (drone.status === 'flying' && drone.distanceToBase <= activeScenario.protectedAsset.radius) {
            drone.status = 'destroyed';
            const spec = DRONE_DATABASE[drone.specId];
            const dmg = spec?.category === 'loitering_munition' ? 45 : (spec?.category === 'fpv_kamikaze' ? 25 : 10);
            
            setBaseHealth(h => {
              const remaining = Math.max(0, h - dmg);
              if (remaining <= 0 && !isFinishingRef.current) {
                isFinishingRef.current = true;
                clearInterval(interval);
                setTimeout(() => finishSimulation(), 200);
              }
              return remaining;
            });

            soundManager.playExplosion();
            voiceComms.calloutBaseBreach(dmg);

            // Trigger explosion FX at base
            setActiveVisualFX(fx => [
              ...fx,
              {
                id: `exp_base_${Date.now()}`,
                type: 'explosion',
                origin: [drone.position[0], drone.position[1], drone.position[2]],
                targetPosition: [drone.position[0], drone.position[1], drone.position[2]],
                color: '#ef4444',
                durationMs: 700,
                createdAt: Date.now()
              }
            ]);

            addLog(
              'BASE_DAMAGE_TAKEN',
              `BREACH: ${spec?.name || 'Hostile Drone'} penetrated perimeter defense! Impact caused ${dmg}% base damage.`,
              'critical',
              drone.instanceId
            );
          }
        });

        // Record history every ~0.25s with exact mission elapsed time
        if (Math.random() < 0.25) {
          radarHistoryRef.current.push({
            timestamp: Number(elapsedTimeRef.current.toFixed(1)),
            tracks: combinedDrones.map(d => ({
              id: d.instanceId,
              x: Math.round(d.position[0]),
              y: Math.round(d.position[1]),
              z: Math.round(d.position[2]),
              status: d.status
            }))
          });
        }

        // Check if all threats are neutralized
        const allNeutralized = combinedDrones.every(d => d.status === 'destroyed' || d.status === 'captured');
        if (allNeutralized && combinedDrones.length > 0 && !isFinishingRef.current) {
          isFinishingRef.current = true;
          clearInterval(interval);
          setTimeout(() => finishSimulation(), 500);
        }

        return combinedDrones;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [missionState, activeScenario, finishSimulation, addLog]);

  // Compute Sensor Contacts & Broadcast Telemetry to Instructor
  useEffect(() => {
    if (missionState !== 'RUNNING') return;

    const radar = SensorFusionEngine.computeRadarContacts(
      drones,
      DRONE_DATABASE,
      activeScenario.radarJammingLevel,
      activeScenario.weather,
      radarSweepDeg
    );
    setRadarContacts(radar);

    const rf = SensorFusionEngine.computeRFContacts(
      drones,
      DRONE_DATABASE,
      activeScenario.rfNoiseLevel
    );
    setRfContacts(rf);

    const acoustic = SensorFusionEngine.computeAcousticBearing(
      drones,
      DRONE_DATABASE
    );
    setAcousticContact(acoustic);

    // Tag detection timestamps on drones
    setDrones(prev => prev.map(d => {
      const hasRadar = radar.some(r => r.id === d.instanceId);
      const hasRf = rf.some(r => r.id === d.instanceId);
      const isDetected = hasRadar || hasRf;

      if (isDetected && d.detectionTime === undefined) {
        soundManager.playTargetLock();
        voiceComms.calloutRadarLock(d.instanceId, d.distanceToBase);
        addLog(
          hasRadar ? 'RADAR_ACQUISITION' : 'RF_SIGNAL_DETECTED',
          `Early Warning Contact: Track ${d.instanceId} acquired at ${d.distanceToBase}m range.`,
          'warning',
          d.instanceId
        );
        return {
          ...d,
          detectedByRadar: hasRadar,
          detectedByRF: hasRf,
          detectionTime: Number(elapsedTimeSec.toFixed(1))
        };
      }
      return {
        ...d,
        detectedByRadar: hasRadar,
        detectedByRF: hasRf
      };
    }));

    // Broadcast Trainee Telemetry to Instructor Console over LAN/BroadcastChannel
    dualTerminalSync.sendTraineeTelemetry({
      traineeId: traineeProfile.id,
      baseHealth,
      elapsedTimeSec,
      selectedDroneId,
      selectedWeaponId,
      activeThreatsCount: drones.filter(d => d.status === 'flying').length
    });

  }, [radarSweepDeg, missionState]);

  // Listen to Instructor Injections via DualTerminalSync
  useEffect(() => {
    const unsubscribe = dualTerminalSync.subscribe((msg: DualTerminalMessage) => {
      if (msg.sender !== 'INSTRUCTOR') return;

      if (msg.type === 'INJECT_JAMMING') {
        setActiveScenario(prev => ({
          ...prev,
          radarJammingLevel: msg.payload.jammingLevel || 0.6
        }));
        addLog('THREAT_SPAWNED', `INSTRUCTOR INJECTION: Hostile electronic warfare jamming spike applied.`, 'warning');
      } else if (msg.type === 'SPAWN_SURPRISE_DECOY') {
        const rad = ((msg.payload.bearingDeg - 90) * Math.PI) / 180;
        const x = Math.round(Math.cos(rad) * msg.payload.distance);
        const z = Math.round(Math.sin(rad) * msg.payload.distance);
        const newDrone: DroneInstance = {
          instanceId: `drone_decoy_${Date.now().toString().slice(-4)}`,
          specId: 'electronic_decoy',
          position: [x, 150, z],
          velocity: [0, 0, 0],
          targetDestination: [0, 5, 0],
          health: 25,
          maxHealth: 25,
          status: 'flying',
          rfLinkActive: true,
          gpsLockActive: true,
          detectedByRadar: false,
          detectedByRF: false,
          detectedByOptics: false,
          distanceToBase: Math.round(Math.hypot(x, z)),
          flightPath: [[x, 150, z]]
        };
        setDrones(prev => [...prev, newDrone]);
        addLog('THREAT_SPAWNED', `INSTRUCTOR INJECTION: Surprise decoy drone spawned on bearing ${msg.payload.bearingDeg}°.`, 'warning');
      } else if (msg.type === 'TRIGGER_SWARM_PINCER') {
        const swarmNodes: DroneInstance[] = [-45, 45, 135, 225].map((angle, i) => {
          const rad = ((angle - 90) * Math.PI) / 180;
          const x = Math.round(Math.cos(rad) * 1100);
          const z = Math.round(Math.sin(rad) * 1100);
          return {
            instanceId: `drone_swarm_pincer_${i + 1}_${Date.now().toString().slice(-4)}`,
            specId: 'swarm_strike_node',
            position: [x, 120 + i * 20, z],
            velocity: [0, 0, 0],
            targetDestination: [0, 5, 0],
            health: 45,
            maxHealth: 45,
            status: 'flying',
            rfLinkActive: true,
            gpsLockActive: true,
            detectedByRadar: false,
            detectedByRF: false,
            detectedByOptics: false,
            distanceToBase: 1100,
            swarmId: 'instructor_pincer_swarm',
            flightPath: [[x, 120 + i * 20, z]]
          };
        });
        setDrones(prev => [...prev, ...swarmNodes]);
        addLog('THREAT_SPAWNED', `INSTRUCTOR INJECTION: 4-node Swarm Pincer attack triggered!`, 'critical');
      } else if (msg.type === 'ALTER_WEATHER') {
        setActiveScenario(prev => ({
          ...prev,
          weather: msg.payload.weather,
          timeOfDay: msg.payload.timeOfDay
        }));
        addLog('THREAT_SPAWNED', `INSTRUCTOR INJECTION: Atmospheric conditions forced to ${msg.payload.weather}/${msg.payload.timeOfDay}.`, 'info');
      } else if (msg.type === 'SEND_INSTRUCTOR_DISPATCH') {
        addLog('THREAT_SPAWNED', `INSTRUCTOR DISPATCH: "${msg.payload.message}"`, 'info');
      }
    });

    return () => unsubscribe();
  }, [addLog]);

  // Classify Drone
  const classifyDrone = (droneId: string, category: DroneCategory | 'bird_false_alarm') => {
    setDrones(prev => prev.map(d => {
      if (d.instanceId === droneId) {
        const spec = DRONE_DATABASE[d.specId];
        const isCorrect = spec && spec.category === category;

        addLog(
          'CLASSIFICATION_SUBMITTED',
          `Operator designated Track ${d.instanceId} as [${category.toUpperCase()}]. Result: ${isCorrect ? 'VERIFIED MATCH' : 'MISCLASSIFIED'}`,
          isCorrect ? 'success' : 'warning',
          droneId
        );

        return {
          ...d,
          classifiedAs: category,
          classificationTime: Number(elapsedTimeSec.toFixed(1))
        };
      }
      return d;
    }));
  };

  // Fire / Engage Weapon with 3D Visual Effects
  const fireWeapon = (targetDroneId?: string, bypassSafety?: boolean) => {
    // Safety Interlock Check
    if (!bypassSafety && masterArm === 'SAFE') {
      soundManager.playTargetLock();
      addLog('WEAPON_DISCHARGED', 'SAFETY INTERLOCK ACTIVE: Master Arm in SAFE mode. Toggle [A] or click ARM before discharging.', 'warning');
      return;
    }
    if (bypassSafety && masterArm === 'SAFE') {
      setMasterArm('ARMED');
    }

    const targetId = targetDroneId || selectedDroneId;
    const weapon = weapons[selectedWeaponId];
    if (!weapon) return;

    // Check ammo
    if (weapon.ammoCapacity > 0 && weapon.currentAmmo <= 0) {
      addLog('WEAPON_DISCHARGED', `${weapon.name} is depleted! Reload or switch weapon station.`, 'warning');
      return;
    }

    // Deduct ammo/energy
    setWeapons(prev => ({
      ...prev,
      [selectedWeaponId]: {
        ...weapon,
        currentAmmo: weapon.ammoCapacity > 0 ? Math.max(0, weapon.currentAmmo - (weapon.type === 'ciws_30mm' ? 25 : 1)) : weapon.currentAmmo
      }
    }));

    let resolvedTargetId = targetId;
    let targetDrone = drones.find(d => d.instanceId === resolvedTargetId);

    // If no target locked, check if there is an in-flight drone near boresight/forward sector
    if (!targetDrone) {
      const candidate = drones.find(d => d.status === 'flying' && d.position[2] < 0 && Math.abs(d.position[0]) < 280);
      if (candidate) {
        resolvedTargetId = candidate.instanceId;
        targetDrone = candidate;
        setSelectedDroneId(candidate.instanceId);
      }
    }

    // Origin position of base turrets
    let turretOrigin: [number, number, number] = [0, 4, 0];
    if (weapon.type === 'ciws_30mm') turretOrigin = [-25, 4, -10];
    else if (weapon.type === 'laser_dew') turretOrigin = [25, 4, -10];
    else if (weapon.type === 'hpm_emp') turretOrigin = [0, 14, -18];

    // Target position for visual projectile/beam
    const targetPos: [number, number, number] = targetDrone 
      ? [...targetDrone.position] 
      : [0, 45, -1200];

    // Trigger 3D Visual Effects (Tracers, Lasers, EMP shockwaves)
    const fxType: WeaponVisualFXEvent['type'] = 
      weapon.type === 'laser_dew' ? 'laser_dew' :
      weapon.type === 'ciws_30mm' ? 'ciws_tracer' :
      weapon.type === 'hpm_emp' ? 'hpm_shockwave' : 'rf_cone';

    setActiveVisualFX(prev => [
      ...prev,
      {
        id: `fx_${Date.now()}`,
        type: fxType,
        origin: turretOrigin,
        targetPosition: targetPos,
        color: weapon.type === 'laser_dew' ? '#ff0033' : (weapon.type === 'ciws_30mm' ? '#fbbf24' : '#00e5ff'),
        durationMs: weapon.type === 'laser_dew' ? 550 : 380,
        createdAt: Date.now()
      }
    ]);

    // Play corresponding sound
    if (weapon.type === 'ciws_30mm') soundManager.playCIWSBurst();
    else if (weapon.type === 'laser_dew') soundManager.playLaserDEW();
    else if (weapon.type === 'rf_jammer') soundManager.playRFJammer();
    else if (weapon.type === 'hpm_emp') soundManager.playHPMPulse();
    else soundManager.playRadarPing();

    if (!targetDrone || targetDrone.status === 'destroyed' || targetDrone.status === 'captured') {
      addLog('WEAPON_DISCHARGED', `${weapon.name} discharged downrange. Sector sweeping fire.`, 'info', undefined, selectedWeaponId);
      return;
    }

    const finalTargetId = targetDrone.instanceId;
    const spec = DRONE_DATABASE[targetDrone.specId];
    if (!spec) return;

    // Trigger Hitmarker on target contact
    setHitmarkerActive(true);
    setTimeout(() => setHitmarkerActive(false), 220);

    // Range check
    if (targetDrone.distanceToBase > weapon.effectiveRange) {
      addLog(
        'WEAPON_DISCHARGED',
        `${weapon.name} engagement out of range (${targetDrone.distanceToBase}m > ${weapon.effectiveRange}m max).`,
        'warning',
        finalTargetId,
        selectedWeaponId
      );
      return;
    }

    // Check Urban Collateral ROE
    if (activeScenario.urbanCollateralSensitive && weapon.collateralRisk === 'HIGH') {
      voiceComms.calloutROEViolation();
      addLog(
        'ROE_VIOLATION',
        `ROE BREACH: High-collateral weapon (${weapon.name}) discharged in urban zone! Civilian infrastructure at risk.`,
        'critical',
        finalTargetId,
        selectedWeaponId
      );
      addLog('COLLATERAL_INCIDENT', 'Shrapnel dispersion caused collateral damage.', 'critical', finalTargetId, selectedWeaponId);
    } else {
      addLog(
        'WEAPON_DISCHARGED',
        `Engaging ${spec.name} with ${weapon.name} at range ${targetDrone.distanceToBase}m.`,
        'info',
        finalTargetId,
        selectedWeaponId
      );
    }

    // Engagement Outcomes based on Susceptibility
    setTimeout(() => {
      setDrones(prev => prev.map(d => {
        if (d.instanceId !== finalTargetId) {
          // If HPM EMP, it affects adjacent drones within 150m!
          if (weapon.type === 'hpm_emp' && d.status === 'flying') {
            const [x1, y1, z1] = targetDrone.position;
            const [x2, y2, z2] = d.position;
            const dist = Math.hypot(x1 - x2, y1 - y2, z1 - z2);
            if (dist < 150) {
              soundManager.playExplosion();
              voiceComms.calloutThreatNeutralized(d.instanceId, weapon.name);

              setActiveVisualFX(fx => [
                ...fx,
                {
                  id: `exp_${d.instanceId}_${Date.now()}`,
                  type: 'explosion',
                  origin: [d.position[0], d.position[1], d.position[2]],
                  targetPosition: [d.position[0], d.position[1], d.position[2]],
                  color: '#ef4444',
                  durationMs: 700,
                  createdAt: Date.now()
                }
              ]);

              addLog('THREAT_NEUTRALIZED', `HPM Wide-Cone Pulse fried avionics on adjacent ${d.instanceId}!`, 'success', d.instanceId);
              return { ...d, status: 'destroyed', health: 0 };
            }
          }
          return d;
        }

        let newStatus = d.status;
        let newHealth = d.health;

        if (weapon.type === 'rf_jammer') {
          if (Math.random() < spec.countermeasureSusceptibility.rfJamming) {
            newStatus = 'jammed_rth';
            voiceComms.calloutThreatNeutralized(spec.name, weapon.name);
            addLog('THREAT_NEUTRALIZED', `RF Control link severed! ${spec.name} forced into Fail-Safe Return-To-Home.`, 'success', finalTargetId);
          } else {
            addLog('WEAPON_DISCHARGED', `${spec.name} has anti-jamming CRPA/optical seeker. Soft-kill RF failed.`, 'warning', finalTargetId);
          }
        } else if (weapon.type === 'gps_spoofer') {
          if (Math.random() < spec.countermeasureSusceptibility.gpsSpoofing) {
            newStatus = 'spoofed_drift';
            voiceComms.calloutThreatNeutralized(spec.name, weapon.name);
            addLog('THREAT_NEUTRALIZED', `GNSS Spoofing successful. ${spec.name} diverted off attack heading.`, 'success', finalTargetId);
          } else {
            addLog('WEAPON_DISCHARGED', `${spec.name} ignored GPS spoofing (operates on manual FPV / INS).`, 'warning', finalTargetId);
          }
        } else if (weapon.type === 'laser_dew') {
          newHealth = Math.max(0, newHealth - 60);
          if (newHealth <= 0) {
            newStatus = 'destroyed';
            soundManager.playExplosion();
            voiceComms.calloutThreatNeutralized(spec.name, weapon.name);

            setActiveVisualFX(fx => [
              ...fx,
              {
                id: `exp_${finalTargetId}_${Date.now()}`,
                type: 'explosion',
                origin: [d.position[0], d.position[1], d.position[2]],
                targetPosition: [d.position[0], d.position[1], d.position[2]],
                color: '#ef4444',
                durationMs: 700,
                createdAt: Date.now()
              }
            ]);

            addLog('THREAT_NEUTRALIZED', `High-Energy Laser burned through composite frame! ${spec.name} destroyed.`, 'success', finalTargetId);
          }
        } else if (weapon.type === 'ciws_30mm') {
          newHealth = 0;
          newStatus = 'destroyed';
          soundManager.playExplosion();
          voiceComms.calloutThreatNeutralized(spec.name, weapon.name);

          setActiveVisualFX(fx => [
            ...fx,
            {
              id: `exp_${finalTargetId}_${Date.now()}`,
              type: 'explosion',
              origin: [d.position[0], d.position[1], d.position[2]],
              targetPosition: [d.position[0], d.position[1], d.position[2]],
              color: '#ef4444',
              durationMs: 700,
              createdAt: Date.now()
            }
          ]);

          addLog('THREAT_NEUTRALIZED', `30mm Tungsten Airburst shrapnel shredded ${spec.name}!`, 'success', finalTargetId);
        } else if (weapon.type === 'hpm_emp') {
          newHealth = 0;
          newStatus = 'destroyed';
          soundManager.playExplosion();
          voiceComms.calloutThreatNeutralized(spec.name, weapon.name);

          setActiveVisualFX(fx => [
            ...fx,
            {
              id: `exp_${finalTargetId}_${Date.now()}`,
              type: 'explosion',
              origin: [d.position[0], d.position[1], d.position[2]],
              targetPosition: [d.position[0], d.position[1], d.position[2]],
              color: '#ef4444',
              durationMs: 700,
              createdAt: Date.now()
            }
          ]);

          addLog('THREAT_NEUTRALIZED', `High-Power Microwave surge destroyed ${spec.name} flight computer.`, 'success', finalTargetId);
        } else if (weapon.type === 'net_interceptor') {
          newStatus = 'captured';
          soundManager.playExplosion();
          voiceComms.calloutThreatNeutralized(spec.name, weapon.name);
          addLog('THREAT_NEUTRALIZED', `Sky-Net captured ${spec.name} intact with parachute deployment.`, 'success', finalTargetId);
        }

        return {
          ...d,
          status: newStatus,
          health: newHealth,
          neutralizedTimestamp: newStatus !== 'flying' ? Number(elapsedTimeSec.toFixed(1)) : undefined,
          neutralizedBy: newStatus !== 'flying' ? weapon.name : undefined
        };
      }));

      // Auto-advance target lock to nearest in-flight threat if current target was neutralized
      setTimeout(() => {
        setDrones(currentDrones => {
          const currentlySelected = currentDrones.find(cd => cd.instanceId === finalTargetId);
          if (currentlySelected && currentlySelected.status !== 'flying') {
            const activeRemaining = currentDrones.filter(cd => cd.status === 'flying');
            if (activeRemaining.length > 0) {
              const sorted = [...activeRemaining].sort((a, b) => a.distanceToBase - b.distanceToBase);
              setSelectedDroneId(sorted[0].instanceId);
            } else {
              setSelectedDroneId(null);
            }
          }
          return currentDrones;
        });
      }, 60);
    }, 250);
  };

  const pauseSimulation = () => setMissionState('PAUSED');
  const resumeSimulation = () => setMissionState('RUNNING');
  const resetSimulation = () => startScenario(activeScenario);

  const generateProceduralMission = (difficulty: ScenarioDefinition['difficulty'] = 'Operator') => {
    const procedural = ScenarioGeneratorEngine.generateScenario(difficulty, traineeProfile);
    startScenario(procedural);
  };

  const updateTraineeInfo = (name: string, rank: string, unit: string) => {
    setTraineeProfile(prev => {
      const updated = { ...prev, name, rank, unit };
      localStorage.setItem('astra_trainee_profile', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <SimulatorContext.Provider
      value={{
        missionState,
        activeScenario,
        elapsedTimeSec,
        baseHealth,
        drones,
        selectedDroneId,
        selectedWeaponId,
        weapons,
        activeVisualFX,
        sensorMode,
        radarSweepDeg,
        radarContacts,
        rfContacts,
        acousticContact,
        eventLogs,
        lastMissionResult,
        traineeProfile,
        startScenario,
        pauseSimulation,
        resumeSimulation,
        resetSimulation,
        selectDrone: setSelectedDroneId,
        selectWeapon: setSelectedWeaponId,
        setSensorMode,
        cycleSensorMode,
        cycleTarget,
        classifyDrone,
        fireWeapon,
        masterArm,
        toggleMasterArm,
        setMasterArm,
        generateProceduralMission,
        updateTraineeInfo,
        soundMuted,
        toggleSound,
        voiceCommsEnabled,
        toggleVoiceComms,
        hitmarkerActive
      }}
    >
      {children}
    </SimulatorContext.Provider>
  );
};

export const useSimulator = () => {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  return context;
};

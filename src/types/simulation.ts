export type TerrainType = 'border_outpost' | 'urban_fob' | 'mountain_valley' | 'coastal_naval';
export type WeatherType = 'clear' | 'foggy' | 'heavy_rain' | 'sandstorm' | 'snow_blizzard';
export type TimeOfDay = 'day' | 'dusk' | 'night';
export type SensorMode = 'daylight' | 'nvg' | 'flir_white' | 'flir_black' | 'flir_ironbow';

export type DroneCategory = 
  | 'micro_quadcopter'     // Commercial drone (DJI Mini/Mavic) - small RCS, surveillance
  | 'fpv_kamikaze'         // High speed, erratic terminal dive, explosive payload
  | 'loitering_munition'   // Shahed / Switchblade style - delta wing, pre-programmed, high kinetic impact
  | 'swarm_member'         // Flocking autonomous node
  | 'heavy_hexacopter'     // Grenade/payload dropper, higher radar cross section
  | 'decoy_drone';         // False radar reflector, electronic lure

export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DroneSpec {
  id: string;
  name: string;
  category: DroneCategory;
  rcs: number; // Radar Cross Section (m^2)
  maxSpeed: number; // m/s
  maxAltitude: number; // m
  thermalSignature: number; // 0 to 1
  rfFrequencies: number[]; // e.g. [2400, 5800] MHz
  acousticDb: number; // dB at 50m
  armor: number; // HP
  payload: string;
  threatLevel: ThreatLevel;
  description: string;
  countermeasureSusceptibility: {
    rfJamming: number; // 0-1 (1 is highly vulnerable)
    gpsSpoofing: number;
    hpmPulse: number;
    laserDEW: number;
    kineticCIWS: number;
    netGun: number;
  };
}

export type TacticalBehaviorPhase = 
  | 'recon_approach'      // Low-altitude ingress, radar masking
  | 'decoy_radiation'     // Emitting active false RF/radar signals
  | 'swarm_convergence'   // Boids coordinated flocking
  | 'evasive_jinking'     // Rapid corkscrew / anti-laser maneuvers
  | 'terminal_dive';      // High-speed proportional navigation dive

export interface DroneInstance {
  instanceId: string;
  specId: string;
  position: [number, number, number]; // x, y, z
  velocity: [number, number, number];
  targetDestination: [number, number, number];
  health: number; // Current HP
  maxHealth: number;
  status: 'flying' | 'jammed_rth' | 'jammed_hover' | 'spoofed_drift' | 'destroyed' | 'captured';
  rfLinkActive: boolean;
  gpsLockActive: boolean;
  detectedByRadar: boolean;
  detectedByRF: boolean;
  detectedByOptics: boolean;
  classifiedAs?: DroneCategory | 'unknown' | 'bird_false_alarm';
  classificationTime?: number; // timestamp
  detectionTime?: number; // timestamp
  distanceToBase: number;
  swarmId?: string;
  isLeader?: boolean;
  formation?: 'wedge' | 'line' | 'pincer' | 'scatter';
  swarmIndex?: number;
  neutralizedTimestamp?: number;
  neutralizedBy?: string;
  flightPath: [number, number, number][];
  
  // Advanced Red-Team AI properties
  tacticalPhase?: TacticalBehaviorPhase;
  isJinking?: boolean;
  jinkTimer?: number;
  isMotherShip?: boolean;
  daughtersSpawned?: boolean;
}

export type WeaponCategory = 'hard_kill' | 'soft_kill';

export interface WeaponSpec {
  id: string;
  name: string;
  category: WeaponCategory;
  type: 
    | 'ciws_30mm'
    | 'laser_dew'
    | 'rf_jammer'
    | 'gps_spoofer'
    | 'hpm_emp'
    | 'net_interceptor'
    | 'manpads_missile';
  effectiveRange: number; // meters
  ammoCapacity: number; // -1 for unlimited/energy
  currentAmmo: number;
  cooldownMs: number;
  energyCostPerSec: number;
  collateralRisk: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH';
  description: string;
  iconName: string;
}

export interface ScenarioObjective {
  id: string;
  description: string;
  required: boolean;
  completed: boolean;
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  description: string;
  difficulty: 'Recruit' | 'Operator' | 'Tactical Lead' | 'Specialist';
  terrain: TerrainType;
  weather: WeatherType;
  timeOfDay: TimeOfDay;
  radarJammingLevel: number; // 0-1 (degradation of radar)
  opticalFogLevel: number; // 0-1
  rfNoiseLevel: number; // 0-1
  drones: {
    specId: string;
    spawnPosition: [number, number, number];
    targetPosition: [number, number, number];
    spawnDelaySec: number;
    swarmId?: string;
    formation?: 'wedge' | 'line' | 'pincer' | 'scatter';
    isMotherShip?: boolean;
  }[];
  protectedAsset: {
    name: string;
    position: [number, number, number];
    radius: number;
    maxAllowedDamage: number;
  };
  timeLimitSec: number;
  urbanCollateralSensitive: boolean; // ROE requires soft-kill or precision
  objectives: ScenarioObjective[];
}

export interface TacticalEventLog {
  timestamp: number; // seconds into mission
  eventType: 
    | 'THREAT_SPAWNED'
    | 'RADAR_ACQUISITION'
    | 'RF_SIGNAL_DETECTED'
    | 'OPTICAL_ACQUISITION'
    | 'CLASSIFICATION_SUBMITTED'
    | 'WEAPON_DISCHARGED'
    | 'THREAT_NEUTRALIZED'
    | 'COLLATERAL_INCIDENT'
    | 'BASE_DAMAGE_TAKEN'
    | 'ROE_VIOLATION'
    | 'RED_TEAM_TACTIC';
  droneId?: string;
  weaponId?: string;
  details: string;
  severity: 'info' | 'success' | 'warning' | 'critical';
  scoreDelta?: number;
}

export interface DecisionTreeEvaluation {
  detectionScore: number;
  avgDetectionLatencySec: number;
  classificationScore: number;
  correctClassifications: number;
  totalThreats: number;
  engagementScore: number;
  optimalWeaponChoices: number;
  suboptimalWeaponChoices: number;
  roeDisciplineScore: number;
  collateralIncidents: number;
  resourceEfficiencyScore: number;
  overallTacticalRating: 'Alpha (Superior)' | 'Bravo (Combat Ready)' | 'Charlie (Needs Re-training)' | 'Delta (Failed Drill)';
  finalScore: number;
  recommendations: string[];
}

export interface MissionResult {
  missionId: string;
  scenarioId: string;
  scenarioTitle: string;
  traineeId: string;
  traineeName: string;
  rank: string;
  unit: string;
  date: string;
  durationSec: number;
  threatsNeutralized: number;
  threatsEscaped: number;
  baseHealthRemaining: number;
  evaluation: DecisionTreeEvaluation;
  eventLogs: TacticalEventLog[];
  radarTrackHistory: {
    timestamp: number;
    tracks: { id: string; x: number; y: number; z: number; status: string }[];
  }[];
}

export interface TraineeProfile {
  id: string;
  name: string;
  rank: string;
  unit: string;
  totalMissions: number;
  averageScore: number;
  skillProgression: {
    detectionSpeed: number;
    classificationAccuracy: number;
    roeCompliance: number;
    swarmManagement: number;
    electronicWarfareProficiency: number;
  };
  missionHistory: MissionResult[];
}

// 3D Visual Effect Event for Muzzle Flash, Laser Beams, Tracers, and Explosions
export interface WeaponVisualFXEvent {
  id: string;
  type: 'ciws_tracer' | 'laser_dew' | 'hpm_shockwave' | 'rf_cone' | 'explosion';
  origin: [number, number, number];
  targetPosition: [number, number, number];
  color: string;
  durationMs: number;
  createdAt: number;
}

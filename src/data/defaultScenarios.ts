import { ScenarioDefinition } from '../types/simulation';

export const DEFAULT_SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'sih_jury_benchmark_45s',
    title: 'SIH 2026 Jury Benchmark: 45s High-Adrenaline Drill',
    difficulty: 'Specialist',
    terrain: 'border_outpost',
    weather: 'clear',
    timeOfDay: 'dusk',
    radarJammingLevel: 0.15,
    opticalFogLevel: 0.1,
    rfNoiseLevel: 0.2,
    description: 'Standardized 45-second high-adrenaline evaluation benchmark designed specifically for Smart India Hackathon (SIH 2026 PS-26247) jury evaluation. Tests multi-tier threat handling: Shahed-136 delta-wing dive, agile FPV kamikaze intercept, and rapid hard/soft-kill decisions under compressed response windows.',
    urbanCollateralSensitive: false,
    timeLimitSec: 45,
    protectedAsset: {
      name: 'Forward Command Bunker & Ammo Depot',
      position: [0, 0, 0],
      radius: 60,
      maxAllowedDamage: 100
    },
    objectives: [
      { id: 'obj_1', description: 'Acquire and track fast incoming Shahed-136 loitering munition', required: true, completed: false },
      { id: 'obj_2', description: 'Neutralize low-altitude FPV kamikaze drones before perimeter breach', required: true, completed: false },
      { id: 'obj_3', description: 'Maintain forward outpost integrity > 80% within 45 seconds', required: true, completed: false }
    ],
    drones: [
      {
        specId: 'loitering_shahed',
        spawnPosition: [0, 240, -1100],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 1
      },
      {
        specId: 'fpv_kamikaze_strike',
        spawnPosition: [-350, 70, -700],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 4
      },
      {
        specId: 'fpv_kamikaze_strike',
        spawnPosition: [300, 90, -550],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 12
      }
    ]
  },
  {
    id: 'op_trishul_border',
    title: 'Operation Trishul: Border Outpost Infiltration',
    difficulty: 'Recruit',
    terrain: 'border_outpost',
    weather: 'clear',
    timeOfDay: 'day',
    radarJammingLevel: 0.05,
    opticalFogLevel: 0.1,
    rfNoiseLevel: 0.1,
    description: 'Hostile reconnaissance quadcopters and forward loitering munitions are probing the perimeter of a forward tactical observation post. Detect, classify, and neutralize threats before they pinpoint troop fortifications.',
    urbanCollateralSensitive: false,
    timeLimitSec: 120,
    protectedAsset: {
      name: 'Forward Command Bunker & Ammo Depot',
      position: [0, 0, 0],
      radius: 60,
      maxAllowedDamage: 100
    },
    objectives: [
      { id: 'obj_1', description: 'Detect all incoming airborne tracks via 3D Radar/RF scanner', required: true, completed: false },
      { id: 'obj_2', description: 'Accurately classify commercial quadcopters vs delta loitering munitions', required: true, completed: false },
      { id: 'obj_3', description: 'Neutralize threats before breach of 100m danger perimeter', required: true, completed: false }
    ],
    drones: [
      {
        specId: 'micro_quad_dji',
        spawnPosition: [-600, 120, -700],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 2
      },
      {
        specId: 'micro_quad_dji',
        spawnPosition: [700, 140, -600],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 15
      },
      {
        specId: 'loitering_shahed',
        spawnPosition: [0, 300, -1400],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 35
      }
    ]
  },

  {
    id: 'urban_shield_fob',
    title: 'Urban Shield: FOB Saturation Swarm Assault',
    difficulty: 'Tactical Lead',
    terrain: 'urban_fob',
    weather: 'clear',
    timeOfDay: 'night',
    radarJammingLevel: 0.20,
    opticalFogLevel: 0.2,
    rfNoiseLevel: 0.35,
    description: 'A coordinated 6-node drone swarm accompanied by an active electronic decoy is launching a saturation strike against an urban military headquarters. Strict Rules of Engagement (ROE): Minimize kinetic collateral damage in surrounding civilian corridors.',
    urbanCollateralSensitive: true,
    timeLimitSec: 150,
    protectedAsset: {
      name: 'Sector HQ & Communication Tower',
      position: [0, 0, 0],
      radius: 80,
      maxAllowedDamage: 100
    },
    objectives: [
      { id: 'obj_1', description: 'Deploy FLIR Thermal / NVG to spot stealth night incursions', required: true, completed: false },
      { id: 'obj_2', description: 'Identify and ignore the electronic decoy drone without wasting CIWS ammo', required: true, completed: false },
      { id: 'obj_3', description: 'Neutralize swarm using High-Power Microwave (HPM) or Soft-Kill Jamming', required: true, completed: false },
      { id: 'obj_4', description: 'Zero civilian collateral incidents in adjacent residential sectors', required: true, completed: false }
    ],
    drones: [
      {
        specId: 'electronic_decoy',
        spawnPosition: [-300, 200, -1100],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 3
      },
      {
        specId: 'swarm_strike_node',
        spawnPosition: [-250, 160, -950],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 12,
        swarmId: 'alpha_swarm',
        formation: 'wedge'
      },
      {
        specId: 'swarm_strike_node',
        spawnPosition: [-150, 170, -980],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 12,
        swarmId: 'alpha_swarm',
        formation: 'wedge'
      },
      {
        specId: 'swarm_strike_node',
        spawnPosition: [-350, 150, -980],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 12,
        swarmId: 'alpha_swarm',
        formation: 'wedge'
      },
      {
        specId: 'fpv_kamikaze_strike',
        spawnPosition: [800, 90, -400],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 30
      },
      {
        specId: 'heavy_hexacopter_bomber',
        spawnPosition: [400, 240, -1200],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 45
      }
    ]
  },

  {
    id: 'op_meghdoot_ew',
    title: 'Operation Meghdoot: High-Altitude EW & Degraded Sensor Ambush',
    difficulty: 'Specialist',
    terrain: 'mountain_valley',
    weather: 'sandstorm',
    timeOfDay: 'dusk',
    radarJammingLevel: 0.65, // Severe radar clutter
    opticalFogLevel: 0.55,
    rfNoiseLevel: 0.70,
    description: 'Adversary electronic warfare pods are jamming primary search radar and injecting false RF harmonics. Trainees must rely on acoustic direction-finding vectors, thermal FLIR scanning, and manual lead-angle CIWS / DEW tracking.',
    urbanCollateralSensitive: false,
    timeLimitSec: 140,
    protectedAsset: {
      name: 'High-Altitude Early Warning Radar Array',
      position: [0, 0, 0],
      radius: 70,
      maxAllowedDamage: 100
    },
    objectives: [
      { id: 'obj_1', description: 'Filter out radar jamming interference to acquire real targets', required: true, completed: false },
      { id: 'obj_2', description: 'Engage fast contour-hugging FPV suicide drones', required: true, completed: false },
      { id: 'obj_3', description: 'Intercept high-yield delta loitering munitions using Laser DEW / CIWS', required: true, completed: false }
    ],
    drones: [
      {
        specId: 'fpv_kamikaze_strike',
        spawnPosition: [-800, 60, -700],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 4
      },
      {
        specId: 'fpv_kamikaze_strike',
        spawnPosition: [-700, 80, -900],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 10
      },
      {
        specId: 'loitering_shahed',
        spawnPosition: [900, 350, -1500],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 25
      },
      {
        specId: 'loitering_shahed',
        spawnPosition: [-900, 380, -1600],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 40
      },
      {
        specId: 'heavy_hexacopter_bomber',
        spawnPosition: [0, 200, -1100],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 60
      }
    ]
  },

  {
    id: 'op_sagar_rakshak',
    title: 'Operation Sagar Rakshak: Maritime Naval Base Defense',
    difficulty: 'Operator',
    terrain: 'coastal_naval',
    weather: 'heavy_rain',
    timeOfDay: 'night',
    radarJammingLevel: 0.15,
    opticalFogLevel: 0.40,
    rfNoiseLevel: 0.20,
    description: 'Hostile reconnaissance and loitering munitions approaching a coastal naval pier and fuel storage depot during heavy monsoon precipitation. Rain attenuates laser efficiency by 30%. Plan weapon allocation accordingly.',
    urbanCollateralSensitive: true,
    timeLimitSec: 130,
    protectedAsset: {
      name: 'Naval Fueling Pier & Missile Corvette',
      position: [0, 0, 0],
      radius: 90,
      maxAllowedDamage: 100
    },
    objectives: [
      { id: 'obj_1', description: 'Compensate for rain laser attenuation by using CIWS or RF jammers', required: true, completed: false },
      { id: 'obj_2', description: 'Neutralize sea-skimming recon quadcopters with net interceptor', required: true, completed: false },
      { id: 'obj_3', description: 'Prevent damage to the high-explosive fuel storage tanks', required: true, completed: false }
    ],
    drones: [
      {
        specId: 'micro_quad_dji',
        spawnPosition: [500, 40, -800],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 5
      },
      {
        specId: 'heavy_hexacopter_bomber',
        spawnPosition: [-600, 180, -1000],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 20
      },
      {
        specId: 'loitering_shahed',
        spawnPosition: [100, 250, -1300],
        targetPosition: [0, 5, 0],
        spawnDelaySec: 40
      }
    ]
  }
];

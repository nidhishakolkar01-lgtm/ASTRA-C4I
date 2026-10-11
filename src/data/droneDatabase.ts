import { DroneSpec } from '../types/simulation';

export const DRONE_DATABASE: Record<string, DroneSpec> = {
  'micro_quad_dji': {
    id: 'micro_quad_dji',
    name: 'Phantom-X Micro Quadcopter',
    category: 'micro_quadcopter',
    rcs: 0.01, // 0.01 m^2 (very small radar blip)
    maxSpeed: 20, // m/s (~72 km/h)
    maxAltitude: 500,
    thermalSignature: 0.25, // low heat from small electric motors
    rfFrequencies: [2400, 5800],
    acousticDb: 48,
    armor: 40,
    payload: '4K EO/IR Gimbal & Laser Target Designator',
    threatLevel: 'LOW',
    description: 'Commercial off-the-shelf reconnaissance quadcopter used for forward artillery spotting and perimeter probing. Highly vulnerable to RF jammer and GNSS spoofing.',
    countermeasureSusceptibility: {
      rfJamming: 0.95,
      gpsSpoofing: 0.85,
      hpmPulse: 0.90,
      laserDEW: 0.90,
      kineticCIWS: 0.60,
      netGun: 0.95,
    }
  },

  'fpv_kamikaze_strike': {
    id: 'fpv_kamikaze_strike',
    name: 'Viper-FPV Kamikaze Interceptor',
    category: 'fpv_kamikaze',
    rcs: 0.015,
    maxSpeed: 45, // m/s (~160 km/h)
    maxAltitude: 250,
    thermalSignature: 0.40,
    rfFrequencies: [915, 1200, 5800],
    acousticDb: 62,
    armor: 30,
    payload: '1.5kg PG-7V High-Explosive Anti-Tank (HEAT) Warhead',
    threatLevel: 'HIGH',
    description: 'Ultra-fast, pilot-controlled racing drone outfitted with an anti-tank warhead. Executes steep terminal dives. Requires rapid hard-kill interception or directional RF video blinding.',
    countermeasureSusceptibility: {
      rfJamming: 0.80, // High, but operator might glide terminal trajectory
      gpsSpoofing: 0.10, // Not GPS guided (manual pilot)
      hpmPulse: 0.85,
      laserDEW: 0.75,
      kineticCIWS: 0.70,
      netGun: 0.40, // Too fast for close net
    }
  },

  'loitering_shahed': {
    id: 'loitering_shahed',
    name: 'Delta-Wing Harpy Loitering Munition',
    category: 'loitering_munition',
    rcs: 0.10, // 0.1 m^2
    maxSpeed: 52, // m/s (~185 km/h)
    maxAltitude: 1200,
    thermalSignature: 0.85, // Gas piston engine generates strong thermal contrast
    rfFrequencies: [1575.42, 1227.60], // GPS/GLONASS receivers
    acousticDb: 78, // Very distinctive lawnmower sound
    armor: 150,
    payload: '40kg High-Explosive Blast Fragmentation Warhead',
    threatLevel: 'CRITICAL',
    description: 'Long-range delta-wing suicide drone. Autonomous inertial and satellite guided. Heavy payload capable of destroying command bunkers and radar arrays. Best countered with CIWS 30mm or High-Energy Laser.',
    countermeasureSusceptibility: {
      rfJamming: 0.30, // Semi-autonomous, ignores control jammer
      gpsSpoofing: 0.65, // Causes INS drift if CRPA is bypassed
      hpmPulse: 0.70,
      laserDEW: 0.90,
      kineticCIWS: 0.95,
      netGun: 0.05,
    }
  },

  'swarm_strike_node': {
    id: 'swarm_strike_node',
    name: 'Hive-Mind Swarm Drone (Node)',
    category: 'swarm_member',
    rcs: 0.02,
    maxSpeed: 30,
    maxAltitude: 400,
    thermalSignature: 0.35,
    rfFrequencies: [2400, 5200, 5800],
    acousticDb: 55,
    armor: 45,
    payload: '0.8kg Explosive Shrapnel Charge + Mesh Relay',
    threatLevel: 'CRITICAL',
    description: 'Part of a coordinated multi-drone swarm utilizing decentralized flocking algorithms. Attempts to overwhelm defences by saturation. Best engaged with wide-cone High Power Microwave (HPM) or rapid automated CIWS.',
    countermeasureSusceptibility: {
      rfJamming: 0.75,
      gpsSpoofing: 0.50,
      hpmPulse: 0.98, // Wide cone kills entire cluster
      laserDEW: 0.60, // Takes out one-by-one
      kineticCIWS: 0.80,
      netGun: 0.30,
    }
  },

  'heavy_hexacopter_bomber': {
    id: 'heavy_hexacopter_bomber',
    name: 'Goliath Night Bomber Hexacopter',
    category: 'heavy_hexacopter',
    rcs: 0.15,
    maxSpeed: 18,
    maxAltitude: 600,
    thermalSignature: 0.60,
    rfFrequencies: [868, 2400],
    acousticDb: 70,
    armor: 180,
    payload: '4x 82mm High-Explosive Mortar Bombs with Thermal Sight',
    threatLevel: 'HIGH',
    description: 'Large heavy-lift multicopter operating primarily under cover of darkness to drop unguided munitions on trenches and armored vehicles. Large radar and thermal footprint make it prime target for Laser DEW and CIWS.',
    countermeasureSusceptibility: {
      rfJamming: 0.85,
      gpsSpoofing: 0.70,
      hpmPulse: 0.80,
      laserDEW: 0.95,
      kineticCIWS: 0.95,
      netGun: 0.70,
    }
  },

  'electronic_decoy': {
    id: 'electronic_decoy',
    name: 'Mockingbird RF/Radar Decoy',
    category: 'decoy_drone',
    rcs: 0.35, // Artificially magnified with Luneburg lens
    maxSpeed: 38,
    maxAltitude: 800,
    thermalSignature: 0.90, // Pyrotechnic flare emitter
    rfFrequencies: [433, 915, 2400, 5800],
    acousticDb: 60,
    armor: 25,
    payload: 'Active Radar Echo Augmenter & RF Noise Emitter',
    threatLevel: 'MEDIUM',
    description: 'Decoy drone engineered to generate false high-threat radar cross-section and thermal plumes. Designed to bait operators into depleting expensive kinetic ammo. ROE dictates soft-kill verification.',
    countermeasureSusceptibility: {
      rfJamming: 0.90,
      gpsSpoofing: 0.90,
      hpmPulse: 0.95,
      laserDEW: 0.50, // Wasteful
      kineticCIWS: 0.95, // Wasteful if engaged
      netGun: 0.20,
    }
  }
};

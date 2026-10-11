import { WeaponSpec } from '../types/simulation';

export const WEAPON_ARSENAL: Record<string, WeaponSpec> = {
  'rf_jammer_directional': {
    id: 'rf_jammer_directional',
    name: 'Shakti Directional RF Disruptor',
    category: 'soft_kill',
    type: 'rf_jammer',
    effectiveRange: 1500, // 1500m beam
    ammoCapacity: -1, // Battery powered
    currentAmmo: 100, // 100% battery
    cooldownMs: 800,
    energyCostPerSec: 5,
    collateralRisk: 'NONE',
    description: 'High-gain directional RF jammer covering 433MHz, 915MHz, 2.4GHz & 5.8GHz. Forces COTS drones into automatic Return-To-Home (RTH) or controlled hover-land. Zero collateral risk.',
    iconName: 'Radio'
  },

  'gps_spoofer_nav': {
    id: 'gps_spoofer_nav',
    name: 'NavIC / GNSS Coordinate Spoofer',
    category: 'soft_kill',
    type: 'gps_spoofer',
    effectiveRange: 2000,
    ammoCapacity: -1,
    currentAmmo: 100,
    cooldownMs: 1500,
    energyCostPerSec: 8,
    collateralRisk: 'LOW',
    description: 'Broadcasts forged satellite ephemeris signals, misleading satellite-guided autonomous drones (e.g., Shahed-style delta wings) away from the base perimeter towards safe neutralization zones.',
    iconName: 'Navigation'
  },

  'hpm_emp_emitter': {
    id: 'hpm_emp_emitter',
    name: 'Vajra High-Power Microwave (HPM)',
    category: 'soft_kill',
    type: 'hpm_emp',
    effectiveRange: 800,
    ammoCapacity: 6, // 6 high-voltage capacitor charges
    currentAmmo: 6,
    cooldownMs: 3000,
    energyCostPerSec: 25,
    collateralRisk: 'MODERATE',
    description: 'Emits a wide-beam electromagnetic pulse designed to induce severe voltage spikes in drone electronic speed controllers (ESCs) and avionics. Ideal for neutralizing dense drone swarms instantly.',
    iconName: 'Zap'
  },

  'laser_dew_system': {
    id: 'laser_dew_system',
    name: 'Aditya 10kW High-Energy Laser (DEW)',
    category: 'hard_kill',
    type: 'laser_dew',
    effectiveRange: 1800,
    ammoCapacity: -1,
    currentAmmo: 100,
    cooldownMs: 1200,
    energyCostPerSec: 15,
    collateralRisk: 'LOW',
    description: 'Continuous-wave solid-state fiber laser. Burns through drone composite carbon-fiber frames, optics, and motor wiring in 1.5 seconds of dwell-time tracking. Silent, instantaneous hit with low collateral.',
    iconName: 'Flame'
  },

  'ciws_30mm_autocannon': {
    id: 'ciws_30mm_autocannon',
    name: 'Akash-Rakshak 30mm CIWS Auto-Cannon',
    category: 'hard_kill',
    type: 'ciws_30mm',
    effectiveRange: 2500,
    ammoCapacity: 600, // rounds of AHEAD airburst ammunition
    currentAmmo: 600,
    cooldownMs: 200,
    energyCostPerSec: 0,
    collateralRisk: 'HIGH',
    description: 'Radar-directed rapid-fire 30mm rotary cannon firing programmable tungsten fragment airburst rounds. Creates an impenetrable cloud of pellets. High collateral risk in urban settlements.',
    iconName: 'Crosshair'
  },

  'net_interceptor_hunter': {
    id: 'net_interceptor_hunter',
    name: 'Garuda Sky-Net Drone Interceptor',
    category: 'soft_kill',
    type: 'net_interceptor',
    effectiveRange: 400,
    ammoCapacity: 4,
    currentAmmo: 4,
    cooldownMs: 2000,
    energyCostPerSec: 0,
    collateralRisk: 'NONE',
    description: 'High-speed interceptor rocket or drone deploying an entangling Kevlar net with parachute. Captures threat drone intact for forensic exploitation and intelligence gathering.',
    iconName: 'ShieldAlert'
  }
};

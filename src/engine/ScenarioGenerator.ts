import { ScenarioDefinition, TerrainType, WeatherType, TimeOfDay, TraineeProfile } from '../types/simulation';
import { DRONE_DATABASE } from '../data/droneDatabase';

export class ScenarioGeneratorEngine {
  /**
   * Procedurally generate a tactical drone defense scenario
   */
  static generateScenario(
    difficulty: ScenarioDefinition['difficulty'] = 'Operator',
    traineeProfile?: TraineeProfile
  ): ScenarioDefinition {
    const id = `proc_drill_${Date.now()}`;
    const terrains: TerrainType[] = ['border_outpost', 'urban_fob', 'mountain_valley', 'coastal_naval'];
    const weathers: WeatherType[] = ['clear', 'foggy', 'heavy_rain', 'sandstorm'];
    const timesOfDay: TimeOfDay[] = ['day', 'dusk', 'night'];

    // Randomize environment or adapt to trainee weakness
    let terrain = terrains[Math.floor(Math.random() * terrains.length)];
    let weather = weathers[Math.floor(Math.random() * weathers.length)];
    let timeOfDay = timesOfDay[Math.floor(Math.random() * timesOfDay.length)];

    // Dynamic Difficulty Adjustment (DDA) based on Trainee Profile
    if (traineeProfile && traineeProfile.skillProgression) {
      if (traineeProfile.skillProgression.electronicWarfareProficiency < 60) {
        weather = 'sandstorm'; // tests high EW / degraded radar skills
      }
      if (traineeProfile.skillProgression.detectionSpeed < 60) {
        timeOfDay = 'night'; // tests thermal / NVG detection
      }
    }

    // Determine threat count & composition based on difficulty
    let threatCount = 3;
    let radarJammingLevel = 0.1;
    let rfNoiseLevel = 0.15;
    let urbanCollateralSensitive = terrain === 'urban_fob';

    if (difficulty === 'Recruit') {
      threatCount = 3;
      radarJammingLevel = 0.05;
      weather = 'clear';
      timeOfDay = 'day';
    } else if (difficulty === 'Operator') {
      threatCount = 4;
      radarJammingLevel = 0.25;
      rfNoiseLevel = 0.3;
    } else if (difficulty === 'Tactical Lead') {
      threatCount = 6;
      radarJammingLevel = 0.45;
      rfNoiseLevel = 0.5;
    } else if (difficulty === 'Specialist') {
      threatCount = 8;
      radarJammingLevel = 0.70;
      rfNoiseLevel = 0.75;
      weather = weather === 'clear' ? 'foggy' : weather;
      timeOfDay = timeOfDay === 'day' ? 'night' : timeOfDay;
    }

    // Generate Drone waves & spawn vectors
    const availableDroneKeys = Object.keys(DRONE_DATABASE);
    const drones: ScenarioDefinition['drones'] = [];
    const hasSwarm = threatCount >= 5;

    let delayAcc = 3;

    for (let i = 0; i < threatCount; i++) {
      let specId: string;

      if (hasSwarm && i >= 1 && i <= 3) {
        specId = 'swarm_strike_node';
      } else if (i === 0 && difficulty !== 'Recruit' && Math.random() < 0.5) {
        specId = 'electronic_decoy';
      } else {
        const nonDecoyKeys = availableDroneKeys.filter(k => k !== 'electronic_decoy');
        specId = nonDecoyKeys[Math.floor(Math.random() * nonDecoyKeys.length)];
      }

      // Random 360 degree bearing at 800 - 1600m range
      const angleRad = Math.random() * Math.PI * 2;
      const distance = 800 + Math.random() * 800;
      const spawnX = Math.round(Math.sin(angleRad) * distance);
      const spawnZ = Math.round(-Math.cos(angleRad) * distance);
      const spawnY = Math.round(80 + Math.random() * 250);

      drones.push({
        specId,
        spawnPosition: [spawnX, spawnY, spawnZ],
        targetPosition: [0, 5, 0],
        spawnDelaySec: delayAcc,
        swarmId: specId === 'swarm_strike_node' ? 'proc_swarm_alpha' : undefined,
        formation: specId === 'swarm_strike_node' ? 'wedge' : undefined
      });

      delayAcc += Math.round(6 + Math.random() * 12);
    }

    const titlePrefixes = ['Exercise Garuda', 'Operation Trishul', 'Drill Vayu-Rakshak', 'Tactical Sortie Vajra', 'Iron Dome Alpha'];
    const randomTitle = `${titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)]} #${Math.floor(100 + Math.random() * 900)}`;

    return {
      id,
      title: randomTitle,
      difficulty,
      terrain,
      weather,
      timeOfDay,
      radarJammingLevel,
      opticalFogLevel: weather === 'foggy' ? 0.6 : (weather === 'sandstorm' ? 0.4 : 0.1),
      rfNoiseLevel,
      urbanCollateralSensitive,
      timeLimitSec: Math.max(90, delayAcc + 45),
      description: `Procedurally synthesized dynamic threat scenario. Features ${threatCount} non-deterministic aerial tracks in ${terrain.replace('_', ' ')} under ${weather} ${timeOfDay} conditions.`,
      protectedAsset: {
        name: 'Unit Command Post & Radar Mast',
        position: [0, 0, 0],
        radius: 75,
        maxAllowedDamage: 100
      },
      objectives: [
        { id: 'obj_p1', description: 'Acquire and track all procedural threat vectors before perimeter breach', required: true, completed: false },
        { id: 'obj_p2', description: 'Execute rapid multi-spectral sensor classification', required: true, completed: false },
        { id: 'obj_p3', description: 'Neutralize threats with zero unnecessary collateral damage', required: true, completed: false }
      ],
      drones
    };
  }
}

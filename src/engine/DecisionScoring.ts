import { DecisionTreeEvaluation, DroneInstance, TacticalEventLog, ScenarioDefinition, WeaponSpec, DroneSpec } from '../types/simulation';

export class DecisionScoringEngine {
  /**
   * Evaluate tactical performance using MoD decision-tree rules
   */
  static evaluateMission(
    scenario: ScenarioDefinition,
    drones: DroneInstance[],
    specs: Record<string, DroneSpec>,
    weapons: Record<string, WeaponSpec>,
    eventLogs: TacticalEventLog[],
    durationSec: number,
    baseHealth: number
  ): DecisionTreeEvaluation {
    const totalThreats = scenario.drones.length;
    let detectionTimeSum = 0;
    let detectedCount = 0;
    let correctClassifications = 0;
    let optimalWeaponChoices = 0;
    let suboptimalWeaponChoices = 0;
    let collateralIncidents = 0;
    let ammoExpended = 0;
    const recommendations: string[] = [];

    // 1. EVALUATE DETECTION LATENCY
    for (const drone of drones) {
      if (drone.detectionTime !== undefined) {
        detectionTimeSum += drone.detectionTime;
        detectedCount++;
      }
    }
    const avgDetectionLatencySec = detectedCount > 0 ? Number((detectionTimeSum / detectedCount).toFixed(1)) : 25;
    
    // Benchmark: under 6s = 100, above 20s decays to 40
    let detectionScore = Math.max(0, Math.min(100, Math.round(100 - (avgDetectionLatencySec - 4) * 4)));
    if (detectedCount < totalThreats) {
      detectionScore = Math.round(detectionScore * (detectedCount / totalThreats));
      recommendations.push(`Missed radar/RF acquisition for ${totalThreats - detectedCount} incoming threat(s). Maintain vigilant 360° PPI radar sweep.`);
    } else if (avgDetectionLatencySec > 12) {
      recommendations.push(`Detection latency averaged ${avgDetectionLatencySec}s. Practice rapid cross-referencing between RF spectrum spikes and optical FLIR bearing.`);
    }

    // 2. EVALUATE CLASSIFICATION ACCURACY
    for (const drone of drones) {
      const spec = specs[drone.specId];
      if (drone.classifiedAs && spec) {
        if (drone.classifiedAs === spec.category) {
          correctClassifications++;
        }
      }
    }
    const classificationScore = totalThreats > 0 ? Math.round((correctClassifications / totalThreats) * 100) : 100;
    if (correctClassifications < totalThreats) {
      recommendations.push(`Threat classification accuracy was ${classificationScore}%. Review drone visual silhouttes, acoustic RPM signatures, and RF hopping frequencies in the manual.`);
    }

    // 3. EVALUATE ENGAGEMENT & WEAPON ALLOCATION (WTA)
    // Inspect weapon discharge events
    for (const log of eventLogs) {
      if (log.eventType === 'WEAPON_DISCHARGED' && log.weaponId && log.droneId) {
        ammoExpended++;
        const weapon = weapons[log.weaponId];
        const drone = drones.find(d => d.instanceId === log.droneId);
        const spec = drone ? specs[drone.specId] : null;

        if (weapon && spec) {
          // Check susceptibility
          let susceptibility = 0.5;
          if (weapon.type === 'rf_jammer') susceptibility = spec.countermeasureSusceptibility.rfJamming;
          if (weapon.type === 'gps_spoofer') susceptibility = spec.countermeasureSusceptibility.gpsSpoofing;
          if (weapon.type === 'hpm_emp') susceptibility = spec.countermeasureSusceptibility.hpmPulse;
          if (weapon.type === 'laser_dew') susceptibility = spec.countermeasureSusceptibility.laserDEW;
          if (weapon.type === 'ciws_30mm') susceptibility = spec.countermeasureSusceptibility.kineticCIWS;
          if (weapon.type === 'net_interceptor') susceptibility = spec.countermeasureSusceptibility.netGun;

          // Decoy engagement check (Wasteful if shooting 30mm CIWS at cheap decoy)
          if (spec.category === 'decoy_drone' && weapon.category === 'hard_kill') {
            suboptimalWeaponChoices++;
            recommendations.push('Fired high-value kinetic CIWS at an electronic radar decoy. Decoys should be suppressed with Soft-Kill RF disruptors or bypassed.');
          } else if (susceptibility >= 0.75) {
            optimalWeaponChoices++;
          } else {
            suboptimalWeaponChoices++;
          }
        }
      }

      if (log.eventType === 'COLLATERAL_INCIDENT') {
        collateralIncidents++;
      }
    }

    const totalEngagements = optimalWeaponChoices + suboptimalWeaponChoices;
    const engagementScore = totalEngagements > 0 
      ? Math.round((optimalWeaponChoices / totalEngagements) * 100)
      : (drones.some(d => d.status === 'destroyed' || d.status === 'captured') ? 80 : 30);

    // 4. EVALUATE RULES OF ENGAGEMENT (ROE) & COLLATERAL DISCIPLINE
    let roeDisciplineScore = 100 - collateralIncidents * 25;
    if (scenario.urbanCollateralSensitive && collateralIncidents > 0) {
      roeDisciplineScore = Math.max(0, roeDisciplineScore - 15);
      recommendations.push(`Violated urban Rules of Engagement (ROE) with ${collateralIncidents} collateral blast incident(s). Prioritize Laser DEW, Net-Guns, or RF soft-kill in populated sectors.`);
    }

    // 5. RESOURCE EFFICIENCY SCORE
    let resourceEfficiencyScore = 90;
    if (ammoExpended > totalThreats * 3) {
      resourceEfficiencyScore = Math.max(30, 90 - (ammoExpended - totalThreats * 3) * 5);
      recommendations.push('Excessive ammunition / energy consumption. Apply precision fire bursts rather than continuous saturation.');
    }

    // BASE DAMAGE PENALTY
    const baseDamageTaken = 100 - baseHealth;
    if (baseDamageTaken > 0) {
      recommendations.push(`Protected base sustained ${baseDamageTaken}% perimeter damage. Intercept threats at standoff ranges (>400m).`);
    }

    // OVERALL WEIGHTED SCORE (0 - 1000)
    // Detection (25%), Classification (25%), Engagement WTA (25%), ROE Discipline (15%), Efficiency (10%)
    const weightedRaw = 
      (detectionScore * 0.25) +
      (classificationScore * 0.25) +
      (engagementScore * 0.25) +
      (roeDisciplineScore * 0.15) +
      (resourceEfficiencyScore * 0.10);

    const baseSurvivalFactor = baseHealth / 100;
    const finalScore = Math.round(weightedRaw * 10 * baseSurvivalFactor);

    let overallTacticalRating: DecisionTreeEvaluation['overallTacticalRating'] = 'Delta (Failed Drill)';
    if (finalScore >= 850) {
      overallTacticalRating = 'Alpha (Superior)';
    } else if (finalScore >= 700) {
      overallTacticalRating = 'Bravo (Combat Ready)';
    } else if (finalScore >= 500) {
      overallTacticalRating = 'Charlie (Needs Re-training)';
    }

    if (recommendations.length === 0) {
      recommendations.push('Flawless interception execution. Excellent multi-spectral sensor cueing, accurate threat classification, and exemplary ROE discipline.');
    }

    return {
      detectionScore,
      avgDetectionLatencySec,
      classificationScore,
      correctClassifications,
      totalThreats,
      engagementScore,
      optimalWeaponChoices,
      suboptimalWeaponChoices,
      roeDisciplineScore: Math.max(0, roeDisciplineScore),
      collateralIncidents,
      resourceEfficiencyScore,
      overallTacticalRating,
      finalScore,
      recommendations
    };
  }
}

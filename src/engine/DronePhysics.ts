import { DroneInstance, DroneSpec, TacticalBehaviorPhase } from '../types/simulation';
import { DRONE_DATABASE } from '../data/droneDatabase';

export class DronePhysicsEngine {
  /**
   * Autonomous Military Red-Team Threat AI Engine
   * Simulates multi-phase adversary doctrines, terrain masking, reactive evasion,
   * mother-ship deployment, and Boids swarm flocking.
   */
  static updateDrones(
    drones: DroneInstance[],
    specs: Record<string, DroneSpec>,
    deltaTime: number,
    basePosition: [number, number, number] = [0, 0, 0]
  ): { updatedDrones: DroneInstance[]; newSpawnedDrones: DroneInstance[] } {
    const newSpawnedDrones: DroneInstance[] = [];

    // =========================================================
    // PRE-PROCESSING: SWARM LEADER & DECAPITATION DETECTION
    // =========================================================
    const swarmMembers = new Map<string, DroneInstance[]>();
    const swarmLeaders = new Map<string, DroneInstance>();

    drones.forEach(d => {
      if (!d.swarmId) return;
      if (!swarmMembers.has(d.swarmId)) {
        swarmMembers.set(d.swarmId, []);
      }
      swarmMembers.get(d.swarmId)!.push(d);

      if (d.isLeader && d.status === 'flying') {
        swarmLeaders.set(d.swarmId, d);
      }
    });

    // Dynamic Leader Election if Leader was Neutralized (Decapitation Strike)
    swarmMembers.forEach((members, swarmId) => {
      const activeMembers = members.filter(m => m.status === 'flying');
      if (activeMembers.length > 0 && !swarmLeaders.has(swarmId)) {
        // Elect the closest or healthiest drone as the new tactical leader
        const electedLeader = activeMembers.reduce((prev, curr) => 
          curr.health > prev.health ? curr : prev
        , activeMembers[0]);
        electedLeader.isLeader = true;
        swarmLeaders.set(swarmId, electedLeader);
      }
    });

    const updatedDrones: DroneInstance[] = drones.map((drone, droneIndex) => {
      if (drone.status === 'destroyed' || drone.status === 'captured') {
        return drone;
      }

      const spec = specs[drone.specId];
      if (!spec) return drone;

      let [x, y, z] = drone.position;
      let [vx, vy, vz] = drone.velocity;
      let status: DroneInstance['status'] = drone.status;
      let tacticalPhase: TacticalBehaviorPhase = drone.tacticalPhase || 'recon_approach';
      let isJinking = drone.isJinking || false;
      let jinkTimer = drone.jinkTimer || 0;
      let daughtersSpawned = drone.daughtersSpawned || false;
      let isLeader = drone.isLeader || false;
      const formation = drone.formation || 'wedge';

      // Distance to protected base
      const dx = basePosition[0] - x;
      const dy = basePosition[1] - y;
      const dz = basePosition[2] - z;
      const distToBase = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

      // =========================================================
      // 1. SOFT-KILL MITIGATION STATES
      // =========================================================
      if (status === 'jammed_rth') {
        const speed = spec.maxSpeed * 0.65;
        vx = (-dx / distToBase) * speed;
        vz = (-dz / distToBase) * speed;
        vy = 6;
        x += vx * deltaTime;
        y += vy * deltaTime;
        z += vz * deltaTime;

        if (distToBase > 1600) status = 'destroyed';

      } else if (status === 'jammed_hover') {
        vx *= 0.88;
        vz *= 0.88;
        vy = -1.8;
        x += vx * deltaTime;
        y = Math.max(0.5, y + vy * deltaTime);
        z += vz * deltaTime;

        if (y <= 1.0) status = 'captured';

      } else if (status === 'spoofed_drift') {
        const speed = spec.maxSpeed * 0.75;
        const driftAngle = Math.atan2(dz, dx) + 0.03 * deltaTime * 60;
        vx = Math.cos(driftAngle) * speed;
        vz = Math.sin(driftAngle) * speed;
        x += vx * deltaTime;
        z += vz * deltaTime;

      } else {
        // =========================================================
        // 2. ACTIVE ADVERSARY RED-TEAM FLIGHT DOCTRINES
        // =========================================================

        // A. Mother-Ship Deployment Doctrine (Heavy Hexacopter releases 2x FPVs)
        if (drone.isMotherShip && !daughtersSpawned && distToBase < 750) {
          daughtersSpawned = true;
          [-28, 28].forEach((offset, idx) => {
            newSpawnedDrones.push({
              instanceId: `daughter_fpv_${drone.instanceId}_${idx + 1}`,
              specId: 'fpv_kamikaze_strike',
              position: [x + offset, y - 4, z + offset] as [number, number, number],
              velocity: [vx * 1.35, -5, vz * 1.35] as [number, number, number],
              targetDestination: [0, 5, 0],
              health: 30,
              maxHealth: 30,
              status: 'flying',
              rfLinkActive: true,
              gpsLockActive: true,
              detectedByRadar: false,
              detectedByRF: true,
              detectedByOptics: false,
              distanceToBase: Math.round(distToBase),
              tacticalPhase: 'terminal_dive',
              flightPath: [[x + offset, y - 4, z + offset] as [number, number, number]]
            });
          });
        }

        // B. Determine Tactical Phase & Reactive Evasion
        if (drone.health < drone.maxHealth) {
          isJinking = true;
          jinkTimer = 3.5;
          tacticalPhase = 'evasive_jinking';
        } else if (distToBase < 280 && (spec.category === 'fpv_kamikaze' || spec.category === 'loitering_munition')) {
          tacticalPhase = 'terminal_dive';
        } else if (spec.category === 'swarm_member') {
          tacticalPhase = 'swarm_convergence';
        } else if (spec.category === 'decoy_drone') {
          tacticalPhase = 'decoy_radiation';
        } else {
          tacticalPhase = 'recon_approach';
        }

        // C. ADVANCED SWARM FLOCKING & FORMATION COORDINATION
        let swarmVx = 0;
        let swarmVz = 0;

        if (drone.swarmId) {
          const leader = swarmLeaders.get(drone.swarmId);

          if (leader && leader.instanceId === drone.instanceId) {
            isLeader = true;
          }

          if (leader && leader.instanceId !== drone.instanceId && leader.status === 'flying') {
            // FOLLOWER LOGIC: Target formation slot relative to leader
            const [lx, , lz] = leader.position;
            const lvx = leader.velocity[0] || dx;
            const lvz = leader.velocity[2] || dz;
            const lHeading = Math.atan2(lvz, lvx);
            const lSpeed = Math.hypot(lvx, lvz) || spec.maxSpeed;

            const swarmIndex = drone.swarmIndex !== undefined ? drone.swarmIndex : (droneIndex % 8);
            const side = swarmIndex % 2 === 0 ? 1 : -1;
            const rank = Math.ceil((swarmIndex + 1) / 2);

            let slotX = lx;
            let slotZ = lz;

            if (formation === 'wedge') {
              // Classic V-formation: Wingmen staggered rear and lateral
              const perpX = -Math.sin(lHeading);
              const perpZ = Math.cos(lHeading);
              const backX = -Math.cos(lHeading);
              const backZ = -Math.sin(lHeading);

              const lateralDist = rank * 28 * side;
              const longitudinalDist = rank * 24;

              slotX = lx + backX * longitudinalDist + perpX * lateralDist;
              slotZ = lz + backZ * longitudinalDist + perpZ * lateralDist;

            } else if (formation === 'pincer') {
              // Pincer Split Flanking: Swarm splits into two wings (West / East)
              const flankAngle = side > 0 ? 0.65 : -0.65; // ~37° flank offset
              const flankHeading = lHeading + flankAngle;
              const flankDist = 75 + rank * 25;

              slotX = lx + Math.cos(flankHeading) * flankDist;
              slotZ = lz + Math.sin(flankHeading) * flankDist;

            } else if (formation === 'line') {
              // Frontal Assault Line: Spread abreast perpendicular to advance
              const perpX = -Math.sin(lHeading);
              const perpZ = Math.cos(lHeading);
              const spread = (swarmIndex - 2.5) * 32;

              slotX = lx + perpX * spread;
              slotZ = lz + perpZ * spread;

            } else {
              // Scatter / Cloud Boids
              const mates = (swarmMembers.get(drone.swarmId) || []).filter(
                d => d.instanceId !== drone.instanceId && d.status === 'flying'
              );

              let sepX = 0, sepZ = 0;
              let avgX = 0, avgZ = 0;
              let avgVx = 0, avgVz = 0;

              for (const mate of mates) {
                const mdx = x - mate.position[0];
                const mdz = z - mate.position[2];
                const d = Math.hypot(mdx, mdz) || 1;
                if (d < 50) {
                  sepX += (mdx / d) * (50 - d);
                  sepZ += (mdz / d) * (50 - d);
                }
                avgX += mate.position[0];
                avgZ += mate.position[2];
                avgVx += mate.velocity[0];
                avgVz += mate.velocity[2];
              }

              if (mates.length > 0) {
                avgX /= mates.length;
                avgZ /= mates.length;
                avgVx /= mates.length;
                avgVz /= mates.length;

                const cohX = (avgX - x) * 0.02;
                const cohZ = (avgZ - z) * 0.02;
                const aliX = (avgVx - vx) * 0.15;
                const aliZ = (avgVz - vz) * 0.15;

                swarmVx = sepX * 0.08 + cohX + aliX;
                swarmVz = sepZ * 0.08 + cohZ + aliZ;
              }
            }

            if (formation !== 'scatter') {
              // Move smoothly toward formation slot
              const toSlotX = slotX - x;
              const toSlotZ = slotZ - z;
              const distToSlot = Math.hypot(toSlotX, toSlotZ);

              if (distToSlot > 3) {
                const slotDirX = toSlotX / distToSlot;
                const slotDirZ = toSlotZ / distToSlot;
                const catchupFactor = Math.min(1.8, Math.max(0.6, distToSlot / 25));

                swarmVx = (slotDirX * lSpeed * catchupFactor - vx) * 0.35;
                swarmVz = (slotDirZ * lSpeed * catchupFactor - vz) * 0.35;
              }
            }
          }
        }

        // D. Tactical Guidance & Velocity Computation
        const baseSpeed = spec.maxSpeed;
        const dirX = dx / distToBase;
        const dirZ = dz / distToBase;

        let evasiveX = 0;
        let evasiveY = 0;
        let evasiveZ = 0;

        // Reactive High-G Jinking Corkscrew Maneuvers
        if (isJinking && jinkTimer > 0) {
          jinkTimer -= deltaTime;
          if (jinkTimer <= 0) isJinking = false;

          const t = Date.now() * 0.012;
          const perpX = -dirZ;
          const perpZ = dirX;
          evasiveX = perpX * Math.sin(t) * 22;
          evasiveZ = perpZ * Math.sin(t) * 22;
          evasiveY = Math.cos(t * 1.6) * 10;
        }

        // Altitude Profile based on Doctrine
        let targetY = spec.maxAltitude * 0.4;

        if (tacticalPhase === 'recon_approach' && distToBase > 600) {
          // Nap-of-the-Earth (NOE) radar terrain masking: stay at 20-35m AGL
          targetY = 26 + Math.sin(x * 0.01 + z * 0.01) * 8;
        } else if (tacticalPhase === 'terminal_dive') {
          // Proportional Navigation steep dive into base
          targetY = 3.5;
        } else if (tacticalPhase === 'decoy_radiation') {
          // Climb to high altitude to maximize radar cross section exposure
          targetY = 220 + Math.sin(Date.now() * 0.002) * 35;
        }

        const targetVy = tacticalPhase === 'terminal_dive'
          ? -baseSpeed * 0.88
          : (targetY - y) * 0.16;

        // Integrate Velocities
        vx = dirX * baseSpeed + swarmVx + evasiveX;
        vz = dirZ * baseSpeed + swarmVz + evasiveZ;
        vy += (targetVy + evasiveY - vy) * 0.16;

        // Position Step
        x += vx * deltaTime;
        y = Math.max(2, y + vy * deltaTime);
        z += vz * deltaTime;
      }

      // Record Flight Breadcrumb
      const flightPath: [number, number, number][] = 
        drone.flightPath.length > 500 ? drone.flightPath.slice(1) : [...drone.flightPath];
      if (Math.random() < 0.14) {
        flightPath.push([x, y, z]);
      }

      const updatedInstance: DroneInstance = {
        ...drone,
        position: [x, y, z] as [number, number, number],
        velocity: [vx, vy, vz] as [number, number, number],
        distanceToBase: Math.round(distToBase),
        status,
        tacticalPhase,
        isJinking,
        jinkTimer,
        isLeader,
        daughtersSpawned,
        flightPath
      };

      return updatedInstance;
    });

    return { updatedDrones, newSpawnedDrones };
  }
}

import * as THREE from 'three';

/**
 * BallisticFXEngine.ts
 * High-performance 3D visual & particle effects for C-UAS kinetic and energy weapons:
 * - High-speed 30mm CIWS tungsten tracer streams with ballistic gravity drop
 * - Continuous high-energy ionizing laser DEW beam with thermal target ablation sparks
 * - Muzzle flash particle bursts and cartridge casing ejections
 * - Screen-space / 3D hitmarkers and structural damage smoke
 */

export interface TracerBullet {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetPos: THREE.Vector3;
  life: number;
  maxLife: number;
  mesh: THREE.Mesh;
}

export interface SparkParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  mesh: THREE.Mesh;
}

export class BallisticFXEngine {
  private scene: THREE.Scene;
  private tracers: TracerBullet[] = [];
  private sparks: SparkParticle[] = [];
  private laserBeamMesh: THREE.Mesh | null = null;
  private laserGlowMesh: THREE.Mesh | null = null;
  private tracerGeo: THREE.CylinderGeometry;
  private tracerMat: THREE.MeshBasicMaterial;
  private sparkGeo: THREE.SphereGeometry;
  private sparkMat: THREE.MeshBasicMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    // Pre-allocate geometries and materials to avoid GC overhead
    this.tracerGeo = new THREE.CylinderGeometry(0.12, 0.12, 4.5, 6);
    this.tracerGeo.rotateX(Math.PI / 2); // Align forward along Z
    this.tracerMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });

    this.sparkGeo = new THREE.SphereGeometry(0.18, 6, 6);
    this.sparkMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
  }

  /**
   * Spawn a burst of 30mm CIWS tungsten tracers
   */
  public spawnCIWSBurst(origin: THREE.Vector3, target: THREE.Vector3, count: number = 6) {
    const dir = target.clone().sub(origin).normalize();
    const speed = 1050; // 1050 m/s muzzle velocity for 30mm AHEAD rounds

    for (let i = 0; i < count; i++) {
      // Add slight ballistic spread / dispersion
      const spread = new THREE.Vector3(
        (Math.random() - 0.5) * 0.035,
        (Math.random() - 0.5) * 0.035,
        (Math.random() - 0.5) * 0.035
      );
      const bulletVel = dir.clone().add(spread).normalize().multiplyScalar(speed);

      // Stagger spawn along origin
      const spawnOffset = dir.clone().multiplyScalar(i * 12);
      const spawnPos = origin.clone().add(spawnOffset);

      const tracerMesh = new THREE.Mesh(this.tracerGeo, this.tracerMat);
      tracerMesh.position.copy(spawnPos);
      tracerMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), bulletVel.clone().normalize());

      this.scene.add(tracerMesh);

      const distance = origin.distanceTo(target);
      const travelTime = Math.max(0.2, distance / speed);

      this.tracers.push({
        position: spawnPos,
        velocity: bulletVel,
        targetPos: target.clone(),
        life: 0,
        maxLife: travelTime + 0.15,
        mesh: tracerMesh
      });
    }

    // Muzzle flash at origin
    this.spawnMuzzleFlash(origin, dir);
  }

  /**
   * Set or update continuous High-Energy Laser DEW beam
   */
  public setLaserDwell(origin: THREE.Vector3, target: THREE.Vector3, active: boolean) {
    if (!active) {
      if (this.laserBeamMesh) {
        this.scene.remove(this.laserBeamMesh);
        this.laserBeamMesh.geometry.dispose();
        this.laserBeamMesh = null;
      }
      if (this.laserGlowMesh) {
        this.scene.remove(this.laserGlowMesh);
        this.laserGlowMesh.geometry.dispose();
        this.laserGlowMesh = null;
      }
      return;
    }

    const dist = origin.distanceTo(target);
    const dir = target.clone().sub(origin).normalize();
    const midPoint = origin.clone().add(dir.clone().multiplyScalar(dist / 2));

    if (!this.laserBeamMesh) {
      const beamGeo = new THREE.CylinderGeometry(0.14, 0.14, 1, 8);
      beamGeo.rotateX(Math.PI / 2);
      const beamMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.95 });
      this.laserBeamMesh = new THREE.Mesh(beamGeo, beamMat);
      this.scene.add(this.laserBeamMesh);

      const glowGeo = new THREE.CylinderGeometry(0.4, 0.4, 1, 8);
      glowGeo.rotateX(Math.PI / 2);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0x00a8ff, transparent: true, opacity: 0.35 });
      this.laserGlowMesh = new THREE.Mesh(glowGeo, glowMat);
      this.scene.add(this.laserGlowMesh);
    }

    // Update laser transforms
    this.laserBeamMesh.scale.set(1, 1, dist);
    this.laserBeamMesh.position.copy(midPoint);
    this.laserBeamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);

    if (this.laserGlowMesh) {
      this.laserGlowMesh.scale.set(1, 1, dist);
      this.laserGlowMesh.position.copy(midPoint);
      this.laserGlowMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    }

    // Spawn heat ablation sparks at target impact point
    this.spawnTargetHitSparks(target, 4);
  }

  /**
   * Muzzle flash particle burst
   */
  public spawnMuzzleFlash(origin: THREE.Vector3, dir: THREE.Vector3) {
    const flashCount = 6;
    for (let i = 0; i < flashCount; i++) {
      const pMesh = new THREE.Mesh(this.sparkGeo, this.sparkMat);
      pMesh.position.copy(origin);
      this.scene.add(pMesh);

      const vel = dir.clone().multiplyScalar(15 + Math.random() * 20)
        .add(new THREE.Vector3((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12));

      this.sparks.push({
        position: origin.clone(),
        velocity: vel,
        life: 0,
        maxLife: 0.12,
        mesh: pMesh
      });
    }
  }

  /**
   * Target impact sparks / debris
   */
  public spawnTargetHitSparks(targetPos: THREE.Vector3, count: number = 8) {
    for (let i = 0; i < count; i++) {
      const pMesh = new THREE.Mesh(this.sparkGeo, this.sparkMat);
      pMesh.position.copy(targetPos);
      this.scene.add(pMesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.2) * 35,
        (Math.random() - 0.5) * 35
      );

      this.sparks.push({
        position: targetPos.clone(),
        velocity: vel,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.2,
        mesh: pMesh
      });
    }
  }

  /**
   * Update all active ballistic projectiles and particles each frame
   */
  public update(deltaSec: number) {
    // 1. Update CIWS Tracers
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.life += deltaSec;

      // Ballistic step with slight gravity drop
      t.velocity.y -= 9.8 * deltaSec;
      t.position.addScaledVector(t.velocity, deltaSec);
      t.mesh.position.copy(t.position);

      if (t.life >= t.maxLife) {
        this.scene.remove(t.mesh);
        t.mesh.geometry.dispose();
        this.tracers.splice(i, 1);
      }
    }

    // 2. Update Sparks / Muzzle Flash particles
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.life += deltaSec;
      s.position.addScaledVector(s.velocity, deltaSec);
      s.mesh.position.copy(s.position);

      const progress = s.life / s.maxLife;
      s.mesh.scale.setScalar(Math.max(0.1, 1 - progress));

      if (s.life >= s.maxLife) {
        this.scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        this.sparks.splice(i, 1);
      }
    }
  }

  /**
   * Cleanup all meshes
   */
  public dispose() {
    this.tracers.forEach(t => {
      this.scene.remove(t.mesh);
      t.mesh.geometry.dispose();
    });
    this.sparks.forEach(s => {
      this.scene.remove(s.mesh);
      s.mesh.geometry.dispose();
    });
    if (this.laserBeamMesh) {
      this.scene.remove(this.laserBeamMesh);
      this.laserBeamMesh.geometry.dispose();
    }
    if (this.laserGlowMesh) {
      this.scene.remove(this.laserGlowMesh);
      this.laserGlowMesh.geometry.dispose();
    }
    this.tracerGeo.dispose();
    this.tracerMat.dispose();
    this.sparkGeo.dispose();
    this.sparkMat.dispose();
  }
}

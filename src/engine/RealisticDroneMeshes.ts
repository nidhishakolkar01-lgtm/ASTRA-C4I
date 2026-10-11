import * as THREE from 'three';
import { DroneCategory } from '../types/simulation';

/**
 * RealisticDroneMeshes.ts
 * High-Fidelity 3D Military & Commercial Drone Asset Generator for Three.js
 * 
 * Generates accurate scale models for:
 * 1. Loitering Munition (Shahed-136 / Switchblade 600 Delta-Wing)
 * 2. FPV Kamikaze Strike Drone (Carbon-fiber X-frame with PG-7V shaped-charge warhead)
 * 3. Micro Recon Quadcopter (DJI Mavic 3 Enterprise thermal recon)
 * 4. Heavy Bomber Hexacopter (Baba Yaga with 82mm mortar rack)
 * 5. Autonomous Swarm Hunter (Stealth delta with faceted stealth edges)
 * 6. EW Radar Decoy (Equipped with Luneburg lens passive radar amplifier)
 */

export class RealisticDroneMeshes {
  // Shared materials cache to minimize WebGL draw calls & memory
  private static carbonFiberMat: THREE.MeshStandardMaterial;
  private static militaryGreyMat: THREE.MeshStandardMaterial;
  private static desertCamoMat: THREE.MeshStandardMaterial;
  private static darkMetalMat: THREE.MeshStandardMaterial;
  private static warheadOliveMat: THREE.MeshStandardMaterial;
  private static lensGlassMat: THREE.MeshPhysicalMaterial;
  private static rotorMat: THREE.MeshBasicMaterial;
  private static ledGreenMat: THREE.MeshBasicMaterial;
  private static ledRedMat: THREE.MeshBasicMaterial;
  private static luneburgMat: THREE.MeshStandardMaterial;

  private static initMaterials() {
    if (this.carbonFiberMat) return;

    // Procedural carbon fiber texture
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#181a1f';
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = '#262930';
      for (let i = 0; i < 128; i += 8) {
        for (let j = 0; j < 128; j += 8) {
          if ((i + j) % 16 === 0) {
            ctx.fillRect(i, j, 8, 8);
          }
        }
      }
    }
    const carbonTex = new THREE.CanvasTexture(canvas);
    carbonTex.wrapS = THREE.RepeatWrapping;
    carbonTex.wrapT = THREE.RepeatWrapping;
    carbonTex.repeat.set(4, 4);

    this.carbonFiberMat = new THREE.MeshStandardMaterial({
      map: carbonTex,
      roughness: 0.45,
      metalness: 0.35,
    });

    this.militaryGreyMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.6,
      metalness: 0.2,
    });

    this.desertCamoMat = new THREE.MeshStandardMaterial({
      color: 0x786047,
      roughness: 0.75,
      metalness: 0.1,
    });

    this.darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.85,
    });

    this.warheadOliveMat = new THREE.MeshStandardMaterial({
      color: 0x3d4928, // OD Green
      roughness: 0.6,
      metalness: 0.4,
    });

    this.lensGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.8,
      transparent: true,
      opacity: 0.85,
    });

    this.rotorMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });

    this.ledGreenMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    this.ledRedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    this.luneburgMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.15,
      wireframe: false,
    });
  }

  public static createDroneMesh(spec: { category: DroneCategory; name: string }): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();
    group.name = `drone_${spec.category}`;

    switch (spec.category) {
      case 'loitering_munition':
        return this.buildShahedDeltaWing(group);
      case 'fpv_kamikaze':
        return this.buildFPVKamikaze(group);
      case 'micro_quadcopter':
        return this.buildDJIMavicQuadcopter(group);
      case 'heavy_hexacopter':
        return this.buildBabaYagaHexacopter(group);
      case 'swarm_member':
        return this.buildSwarmHunter(group);
      case 'decoy_drone':
        return this.buildDecoyDrone(group);
      default:
        return this.buildDJIMavicQuadcopter(group);
    }
  }

  /**
   * 1. Shahed-136 Style Loitering Munition (Delta Wing)
   * Real scale: ~3.5m wingspan, 2.5m length. Swept delta with vertical winglets, pusher prop, nose warhead.
   */
  private static buildShahedDeltaWing(group: THREE.Group): THREE.Group {
    // Delta Wing Body
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 3.2);       // Nose apex
    wingShape.lineTo(4.2, -2.8);    // Starboard wingtip
    wingShape.lineTo(4.2, -3.2);    // Starboard trailing edge
    wingShape.lineTo(0.6, -3.0);    // Starboard motor root
    wingShape.lineTo(-0.6, -3.0);   // Port motor root
    wingShape.lineTo(-4.2, -3.2);   // Port trailing edge
    wingShape.lineTo(-4.2, -2.8);   // Port wingtip
    wingShape.closePath();

    const extrudeSettings = {
      depth: 0.45,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    };

    const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
    const wingMesh = new THREE.Mesh(wingGeo, this.desertCamoMat);
    wingMesh.rotation.x = Math.PI / 2;
    wingMesh.position.y = 0;
    wingMesh.castShadow = true;
    group.add(wingMesh);

    // Central Fuselage spine
    const spineGeo = new THREE.CylinderGeometry(0.35, 0.45, 5.4, 12);
    const spineMesh = new THREE.Mesh(spineGeo, this.militaryGreyMat);
    spineMesh.rotation.x = Math.PI / 2;
    spineMesh.position.set(0, 0.2, 0.1);
    group.add(spineMesh);

    // Nose seeker dome (Optical / Guidance)
    const noseGeo = new THREE.SphereGeometry(0.32, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const noseMesh = new THREE.Mesh(noseGeo, this.lensGlassMat);
    noseMesh.rotation.x = -Math.PI / 2;
    noseMesh.position.set(0, 0.2, -2.8);
    group.add(noseMesh);

    // Vertical Stabilizer Winglets (Wingtip fins)
    [-4.18, 4.18].forEach(x => {
      const finShape = new THREE.Shape();
      finShape.moveTo(0, 0);
      finShape.lineTo(0, 1.4);
      finShape.lineTo(-0.7, 1.2);
      finShape.lineTo(-1.1, 0);
      finShape.closePath();

      const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.06, bevelEnabled: false });
      const finMesh = new THREE.Mesh(finGeo, this.desertCamoMat);
      finMesh.rotation.y = Math.PI / 2;
      finMesh.position.set(x, 0, 3.2);
      group.add(finMesh);
    });

    // Rear MD-550 2-stroke engine cylinder casing
    const engineGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.9, 10);
    const engineMesh = new THREE.Mesh(engineGeo, this.darkMetalMat);
    engineMesh.rotation.x = Math.PI / 2;
    engineMesh.position.set(0, 0.2, 2.7);
    group.add(engineMesh);

    // Rear Pusher Propeller (Spinning)
    const propGeo = new THREE.BoxGeometry(2.4, 0.15, 0.04);
    const propMesh = new THREE.Mesh(propGeo, this.rotorMat);
    propMesh.name = 'rotor_pusher';
    propMesh.position.set(0, 0.2, 3.2);
    group.add(propMesh);

    return group;
  }

  /**
   * 2. High-Speed FPV Kamikaze Racing Quad with Strapped PG-7V Warhead
   */
  private static buildFPVKamikaze(group: THREE.Group): THREE.Group {
    // 1. Carbon-fiber X-Frame
    const armWidth = 0.12;
    const armLength = 2.6;
    const arm1Geo = new THREE.BoxGeometry(armWidth, 0.06, armLength);
    const arm1 = new THREE.Mesh(arm1Geo, this.carbonFiberMat);
    arm1.rotation.y = Math.PI / 4;
    group.add(arm1);

    const arm2 = new THREE.Mesh(arm1Geo, this.carbonFiberMat);
    arm2.rotation.y = -Math.PI / 4;
    group.add(arm2);

    // Central Carbon Deck Plates (Double deck)
    const deckGeo = new THREE.BoxGeometry(0.7, 0.04, 1.6);
    const topDeck = new THREE.Mesh(deckGeo, this.carbonFiberMat);
    topDeck.position.y = 0.2;
    group.add(topDeck);

    const botDeck = new THREE.Mesh(deckGeo, this.carbonFiberMat);
    botDeck.position.y = -0.1;
    group.add(botDeck);

    // 6S LiPo Battery Pack on top with yellow strap
    const batGeo = new THREE.BoxGeometry(0.55, 0.35, 0.9);
    const batMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });
    const bat = new THREE.Mesh(batGeo, batMat);
    bat.position.set(0, 0.4, 0.1);
    group.add(bat);

    const strapGeo = new THREE.BoxGeometry(0.58, 0.37, 0.18);
    const strapMat = new THREE.MeshStandardMaterial({ color: 0xeab308 });
    const strap = new THREE.Mesh(strapGeo, strapMat);
    strap.position.set(0, 0.4, 0.1);
    group.add(strap);

    // Strapped PG-7V RPG Shaped-Charge Warhead (Underslung)
    const warheadConeGeo = new THREE.ConeGeometry(0.38, 1.3, 16);
    const warheadCone = new THREE.Mesh(warheadConeGeo, this.warheadOliveMat);
    warheadCone.rotation.x = -Math.PI / 2;
    warheadCone.position.set(0, -0.35, -1.1);
    group.add(warheadCone);

    // Warhead Impact Piezoelectric Fuze needle tip
    const fuzeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
    const fuze = new THREE.Mesh(fuzeGeo, this.darkMetalMat);
    fuze.rotation.x = Math.PI / 2;
    fuze.position.set(0, -0.35, -1.8);
    group.add(fuze);

    // Rocket booster body tube
    const tubeGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.4, 12);
    const tube = new THREE.Mesh(tubeGeo, this.warheadOliveMat);
    tube.rotation.x = Math.PI / 2;
    tube.position.set(0, -0.35, 0.2);
    group.add(tube);

    // 5.8GHz Lollipop VTX Antenna (Rear)
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6);
    const stem = new THREE.Mesh(stemGeo, this.darkMetalMat);
    stem.rotation.x = -Math.PI / 6;
    stem.position.set(0, 0.55, 0.9);
    group.add(stem);

    const lobeGeo = new THREE.SphereGeometry(0.12, 10, 10);
    const lobeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
    const lobe = new THREE.Mesh(lobeGeo, lobeMat);
    lobe.position.set(0, 0.85, 1.05);
    group.add(lobe);

    // Forward Tilted RunCam FPV Camera (35° uptilt)
    const camGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const cam = new THREE.Mesh(camGeo, this.darkMetalMat);
    cam.rotation.x = -0.6; // ~35° uptilt for high speed forward flight
    cam.position.set(0, 0.1, -0.9);
    group.add(cam);

    const lensGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 10);
    const lens = new THREE.Mesh(lensGeo, this.lensGlassMat);
    lens.rotation.x = -0.6;
    lens.position.set(0, 0.13, -1.02);
    group.add(lens);

    // 4 Brushless High-KV Motors & Tri-Blade Propellers
    const motorOffsets = [
      [-0.92, -0.92], [0.92, -0.92],
      [-0.92, 0.92], [0.92, 0.92]
    ];

    motorOffsets.forEach(([mx, mz], idx) => {
      // Motor Bell
      const bellGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.18, 12);
      const bell = new THREE.Mesh(bellGeo, this.darkMetalMat);
      bell.position.set(mx, 0.1, mz);
      group.add(bell);

      // Tri-blade propeller disc
      const propGroup = new THREE.Group();
      propGroup.name = `rotor_${idx}`;
      propGroup.position.set(mx, 0.22, mz);

      for (let b = 0; b < 3; b++) {
        const bladeGeo = new THREE.BoxGeometry(0.65, 0.02, 0.08);
        const blade = new THREE.Mesh(bladeGeo, this.rotorMat);
        blade.rotation.y = (b * Math.PI * 2) / 3;
        blade.position.x = Math.cos((b * Math.PI * 2) / 3) * 0.32;
        blade.position.z = Math.sin((b * Math.PI * 2) / 3) * 0.32;
        propGroup.add(blade);
      }
      group.add(propGroup);
    });

    return group;
  }

  /**
   * 3. Micro Recon Quadcopter (Commercial Military Grade - DJI Mavic 3 Enterprise)
   */
  private static buildDJIMavicQuadcopter(group: THREE.Group): THREE.Group {
    // Aerodynamic Fuselage
    const bodyGeo = new THREE.BoxGeometry(0.7, 0.35, 1.4);
    const body = new THREE.Mesh(bodyGeo, this.militaryGreyMat);
    body.position.y = 0.1;
    group.add(body);

    // Nose Cone
    const noseGeo = new THREE.CylinderGeometry(0.25, 0.35, 0.4, 8);
    const nose = new THREE.Mesh(noseGeo, this.militaryGreyMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0.1, -0.85);
    group.add(nose);

    // Front EO/IR Gimbal Ball
    const gimbalGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const gimbal = new THREE.Mesh(gimbalGeo, this.darkMetalMat);
    gimbal.position.set(0, -0.1, -0.85);
    group.add(gimbal);

    const opticGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.08, 10);
    const optic = new THREE.Mesh(opticGeo, this.lensGlassMat);
    optic.rotation.x = Math.PI / 2;
    optic.position.set(0, -0.1, -1.02);
    group.add(optic);

    // 4 Folding Arms
    const armDefs = [
      { start: [-0.3, 0.1, -0.4], end: [-1.2, 0.15, -0.9], idx: 0, led: this.ledRedMat },
      { start: [0.3, 0.1, -0.4], end: [1.2, 0.15, -0.9], idx: 1, led: this.ledGreenMat },
      { start: [-0.3, 0.1, 0.4], end: [-1.3, 0.05, 1.1], idx: 2, led: this.ledGreenMat },
      { start: [0.3, 0.1, 0.4], end: [1.3, 0.05, 1.1], idx: 3, led: this.ledGreenMat },
    ];

    armDefs.forEach(arm => {
      const p1 = new THREE.Vector3(...arm.start);
      const p2 = new THREE.Vector3(...arm.end);
      const armLength = p1.distanceTo(p2);
      const armDir = p2.clone().sub(p1).normalize();

      const armMeshGeo = new THREE.CylinderGeometry(0.06, 0.08, armLength, 8);
      const armMesh = new THREE.Mesh(armMeshGeo, this.militaryGreyMat);
      armMesh.position.copy(p1).add(armDir.clone().multiplyScalar(armLength / 2));
      armMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), armDir);
      group.add(armMesh);

      // Motor & Strobe LED under arm tip
      const ledGeo = new THREE.SphereGeometry(0.04, 6, 6);
      const led = new THREE.Mesh(ledGeo, arm.led);
      led.position.set(arm.end[0], arm.end[1] - 0.08, arm.end[2]);
      group.add(led);

      // Folding 2-blade Propeller
      const propGroup = new THREE.Group();
      propGroup.name = `rotor_${arm.idx}`;
      propGroup.position.set(arm.end[0], arm.end[1] + 0.1, arm.end[2]);

      const bladeGeo = new THREE.BoxGeometry(0.9, 0.02, 0.08);
      const blade = new THREE.Mesh(bladeGeo, this.rotorMat);
      propGroup.add(blade);

      group.add(propGroup);
    });

    return group;
  }

  /**
   * 4. Heavy Hexacopter Bomber (Baba Yaga / Heavy Drone with 82mm mortar rack)
   */
  private static buildBabaYagaHexacopter(group: THREE.Group): THREE.Group {
    // Heavy central carbon tub
    const hubGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.6, 12);
    const hub = new THREE.Mesh(hubGeo, this.darkMetalMat);
    hub.position.y = 0.2;
    group.add(hub);

    // Avionics dome & Starlink / GNSS receiver antenna puck
    const gnssGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 12);
    const gnss = new THREE.Mesh(gnssGeo, this.luneburgMat);
    gnss.position.set(0, 0.58, 0);
    group.add(gnss);

    // Underslung automated 4-tube rotary mortar dispenser
    const rackGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.3, 8);
    const rack = new THREE.Mesh(rackGeo, this.darkMetalMat);
    rack.position.set(0, -0.3, 0);
    group.add(rack);

    // 4 x 82mm High Explosive Mortar bombs in the rack
    for (let m = 0; m < 4; m++) {
      const angle = (m * Math.PI) / 2;
      const bombGeo = new THREE.CylinderGeometry(0.18, 0.14, 1.1, 10);
      const bomb = new THREE.Mesh(bombGeo, this.warheadOliveMat);
      bomb.position.set(Math.cos(angle) * 0.55, -0.9, Math.sin(angle) * 0.55);
      group.add(bomb);

      // Tail fin assembly
      const tailGeo = new THREE.BoxGeometry(0.35, 0.2, 0.04);
      const tail = new THREE.Mesh(tailGeo, this.darkMetalMat);
      tail.position.set(Math.cos(angle) * 0.55, -0.4, Math.sin(angle) * 0.55);
      group.add(tail);
    }

    // 6 Carbon Fiber Booms & 28-inch Heavy Propellers
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const armLength = 3.6;
      const endX = Math.cos(angle) * armLength;
      const endZ = Math.sin(angle) * armLength;

      // Carbon Boom Tube
      const boomGeo = new THREE.CylinderGeometry(0.1, 0.1, armLength, 8);
      const boom = new THREE.Mesh(boomGeo, this.carbonFiberMat);
      boom.rotation.z = Math.PI / 2;
      boom.rotation.y = angle;
      boom.position.set(Math.cos(angle) * (armLength / 2), 0.2, Math.sin(angle) * (armLength / 2));
      group.add(boom);

      // Heavy Motor Mount
      const motorGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.3, 12);
      const motor = new THREE.Mesh(motorGeo, this.darkMetalMat);
      motor.position.set(endX, 0.35, endZ);
      group.add(motor);

      // Propeller (Heavy 28-inch carbon)
      const propGroup = new THREE.Group();
      propGroup.name = `rotor_${i}`;
      propGroup.position.set(endX, 0.55, endZ);

      const bladeGeo = new THREE.BoxGeometry(2.6, 0.05, 0.2);
      const blade = new THREE.Mesh(bladeGeo, this.rotorMat);
      propGroup.add(blade);
      group.add(propGroup);
    }

    return group;
  }

  /**
   * 5. Autonomous Swarm Hunter (Stealth Delta / Canard Wing)
   */
  private static buildSwarmHunter(group: THREE.Group): THREE.Group {
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(0, 1.8);       // Nose
    bodyShape.lineTo(1.6, -1.2);    // Starboard wingtip
    bodyShape.lineTo(0.4, -1.4);    // Starboard trailing edge
    bodyShape.lineTo(-0.4, -1.4);   // Port trailing edge
    bodyShape.lineTo(-1.6, -1.2);   // Port wingtip
    bodyShape.closePath();

    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
      depth: 0.25,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.06,
      bevelThickness: 0.06
    });

    const stealthMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.3,
      metalness: 0.6
    });

    const body = new THREE.Mesh(bodyGeo, stealthMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    // Glowing internal AI Swarm Link node
    const glowGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(0, 0.15, 0);
    group.add(glow);

    // Twin Micro Turbines
    [-0.3, 0.3].forEach(x => {
      const jetGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 10);
      const jet = new THREE.Mesh(jetGeo, this.darkMetalMat);
      jet.rotation.x = Math.PI / 2;
      jet.position.set(x, 0.05, 1.2);
      group.add(jet);
    });

    return group;
  }

  /**
   * 6. EW Radar Decoy Drone (Equipped with Luneburg Lens Reflector Sphere)
   */
  private static buildDecoyDrone(group: THREE.Group): THREE.Group {
    // Quadcopter base
    this.buildDJIMavicQuadcopter(group);

    // Large Spherical Luneburg Lens (Amplifies Radar Cross-Section to mimic a Fighter Jet)
    const lensGeo = new THREE.IcosahedronGeometry(0.85, 2);
    const lens = new THREE.Mesh(lensGeo, this.luneburgMat);
    lens.position.set(0, 0.8, 0);
    group.add(lens);

    // Electronic Jammer / RF Spoofing Dipole Antenna array
    const mastGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8);
    const mast = new THREE.Mesh(mastGeo, this.darkMetalMat);
    mast.position.set(0, 1.8, 0);
    group.add(mast);

    // Active radiating strobe indicator
    const strobeGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const strobeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const strobe = new THREE.Mesh(strobeGeo, strobeMat);
    strobe.position.set(0, 2.4, 0);
    group.add(strobe);

    return group;
  }
}

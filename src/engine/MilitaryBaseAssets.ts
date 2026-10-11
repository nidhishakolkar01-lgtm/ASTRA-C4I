import * as THREE from 'three';

/**
 * Military Base & Tactical Outpost Architectural Assets
 * Detailed FOB installations: HESCO barriers, sandbags, watchtowers,
 * communication radomes, 30mm CIWS Gatling cannon, and High-Energy Laser stations.
 */
export class MilitaryBaseAssets {
  /**
   * Build complete Forward Operating Base (FOB) defense installation
   */
  public static createFOBInstallation(): THREE.Group {
    const fob = new THREE.Group();
    fob.name = 'military_fob_installation';

    // 1. REINFORCED CONCRETE COMMAND BUNKER
    const bunkerGroup = new THREE.Group();
    bunkerGroup.position.set(0, 0, 0);

    // Main Bunker Body
    const bunkerGeo = new THREE.BoxGeometry(45, 9, 32);
    const bunkerMat = new THREE.MeshStandardMaterial({
      color: 0x3a404a,
      roughness: 0.85,
      metalness: 0.15
    });
    const bunkerMesh = new THREE.Mesh(bunkerGeo, bunkerMat);
    bunkerMesh.position.y = 4.5;
    bunkerMesh.castShadow = true;
    bunkerMesh.receiveShadow = true;
    bunkerGroup.add(bunkerMesh);

    // Camo Tarp Roof
    const tarpGeo = new THREE.PlaneGeometry(48, 35);
    tarpGeo.rotateX(-Math.PI / 2);
    const tarpMat = new THREE.MeshStandardMaterial({
      color: 0x2b382d,
      roughness: 0.95
    });
    const tarp = new THREE.Mesh(tarpGeo, tarpMat);
    tarp.position.y = 9.2;
    bunkerGroup.add(tarp);

    // Blast Proof Steel Door
    const doorGeo = new THREE.BoxGeometry(5, 6, 0.8);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x1e2229, metalness: 0.8 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 3, 16.2);
    bunkerGroup.add(door);

    fob.add(bunkerGroup);

    // 2. PRIMARY 3D SEARCH RADAR MAST
    const mastGroup = new THREE.Group();
    mastGroup.position.set(0, 0, -22);

    const towerGeo = new THREE.CylinderGeometry(1.2, 2.8, 32, 8);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, metalness: 0.7 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 16;
    tower.castShadow = true;
    mastGroup.add(tower);

    // Rotating AESA Radar Array
    const radarBarGeo = new THREE.BoxGeometry(16, 5, 1.8);
    const radarBarMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.6,
      roughness: 0.3
    });
    const radarDish = new THREE.Mesh(radarBarGeo, radarBarMat);
    radarDish.name = 'radar_dish';
    radarDish.position.y = 33;
    radarDish.castShadow = true;

    // Radome feed horn
    const feedGeo = new THREE.ConeGeometry(1.5, 3, 8);
    feedGeo.rotateX(Math.PI / 2);
    const feedMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const feed = new THREE.Mesh(feedGeo, feedMat);
    feed.position.set(0, 0, -2.5);
    radarDish.add(feed);

    mastGroup.add(radarDish);
    fob.add(mastGroup);

    // 3. DETAILED 30mm CIWS AUTO-CANNON (Phalanx / Pantsir Style)
    const ciwsStation = MilitaryBaseAssets.createCIWSStation();
    ciwsStation.position.set(-28, 0, -12);
    fob.add(ciwsStation);

    // 4. DETAILED HIGH-ENERGY LASER DEW STATION
    const laserStation = MilitaryBaseAssets.createLaserDEWStation();
    laserStation.position.set(28, 0, -12);
    fob.add(laserStation);

    // 5. HESCO CONCUSSION BARRIERS ALONG PERIMETER
    const hescoGroup = MilitaryBaseAssets.createHescoPerimeter(65);
    fob.add(hescoGroup);

    // 6. PERIMETER GUARD WATCHTOWERS (4 corners)
    [[-55, -55], [55, -55], [-55, 45], [55, 45]].forEach(([wx, wz]) => {
      const tower = MilitaryBaseAssets.createWatchtower();
      tower.position.set(wx, 0, wz);
      fob.add(tower);
    });

    return fob;
  }

  /**
   * High-Fidelity 30mm CIWS Rotary Gatling Turret
   */
  public static createCIWSStation(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'ciws_30mm_station';

    // Turret Base Pedestal
    const baseGeo = new THREE.CylinderGeometry(4.5, 5.5, 4.5, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const pedestal = new THREE.Mesh(baseGeo, baseMat);
    pedestal.position.y = 2.25;
    pedestal.castShadow = true;
    group.add(pedestal);

    // Armored Rotating Turret Housing
    const housingGeo = new THREE.BoxGeometry(6, 5, 7);
    const housing = new THREE.Mesh(housingGeo, baseMat);
    housing.position.set(0, 6, 0);
    housing.castShadow = true;
    group.add(housing);

    // Ku-band Radome Tracking Dish on top
    const radomeGeo = new THREE.SphereGeometry(2.2, 16, 16);
    const radomeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const radome = new THREE.Mesh(radomeGeo, radomeMat);
    radome.position.set(0, 9.5, 0.5);
    radome.scale.set(1, 1.2, 1);
    group.add(radome);

    // 6-Barrel Gatling Gun Assembly
    const gunAssembly = new THREE.Group();
    gunAssembly.position.set(0, 5.8, -3.5);

    // Central rotor cylinder
    const rotorGeo = new THREE.CylinderGeometry(0.8, 0.8, 8, 12);
    rotorGeo.rotateX(Math.PI / 2);
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95 });
    const rotor = new THREE.Mesh(rotorGeo, gunMat);
    gunAssembly.add(rotor);

    // 6 outer barrels
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const barrelGeo = new THREE.CylinderGeometry(0.18, 0.18, 9, 8);
      barrelGeo.rotateX(Math.PI / 2);
      const barrel = new THREE.Mesh(barrelGeo, gunMat);
      barrel.position.set(Math.cos(angle) * 0.7, Math.sin(angle) * 0.7, -1);
      gunAssembly.add(barrel);
    }

    gunAssembly.name = 'gatling_barrels';
    group.add(gunAssembly);

    return group;
  }

  /**
   * High-Fidelity High-Energy Laser DEW Weapon Station
   */
  public static createLaserDEWStation(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'laser_dew_station';

    // Turntable Base
    const baseGeo = new THREE.CylinderGeometry(4.5, 5.5, 3.5, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 });
    const pedestal = new THREE.Mesh(baseGeo, baseMat);
    pedestal.position.y = 1.75;
    pedestal.castShadow = true;
    group.add(pedestal);

    // Fiber Laser Optical Emitter Gimbal Housing
    const housingGeo = new THREE.CylinderGeometry(3.2, 3.2, 5, 16);
    housingGeo.rotateZ(Math.PI / 2);
    const housing = new THREE.Mesh(housingGeo, baseMat);
    housing.position.set(0, 5.2, 0);
    housing.castShadow = true;
    group.add(housing);

    // Optical Emitter Aperture Lens Barrel
    const lensTubeGeo = new THREE.CylinderGeometry(1.6, 1.8, 4.5, 16);
    lensTubeGeo.rotateX(Math.PI / 2);
    const lensTube = new THREE.Mesh(lensTubeGeo, baseMat);
    lensTube.position.set(0, 5.2, -3.2);
    group.add(lensTube);

    // Glowing Optical Front Lens Glass
    const glassGeo = new THREE.CircleGeometry(1.4, 16);
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, 5.2, -5.5);
    group.add(glass);

    return group;
  }

  /**
   * HESCO Concussion Barrier Perimeter Wall
   */
  public static createHescoPerimeter(radius: number): THREE.Group {
    const group = new THREE.Group();
    const count = 36;
    const blockGeo = new THREE.BoxGeometry(4.5, 4, 3);
    const blockMat = new THREE.MeshStandardMaterial({
      color: 0x8a7b66, // Sand-filled geotextile canvas
      roughness: 0.95
    });

    for (let i = 0; i < count; i++) {
      // Leave entrance gaps on North & South
      if ((i >= 16 && i <= 19) || (i >= 34 && i <= 36) || (i >= 0 && i <= 1)) continue;

      const angle = (i * Math.PI * 2) / count;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      const block = new THREE.Mesh(blockGeo, blockMat);
      block.position.set(x, 2, z);
      block.rotation.y = angle + Math.PI / 2;
      block.castShadow = true;
      block.receiveShadow = true;
      group.add(block);
    }

    return group;
  }

  /**
   * Elevated Perimeter Guard Watchtower
   */
  public static createWatchtower(): THREE.Group {
    const tower = new THREE.Group();

    // 4 Corner Stilts
    const stiltMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    [[-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(([sx, sz]) => {
      const stiltGeo = new THREE.CylinderGeometry(0.2, 0.2, 14);
      const stilt = new THREE.Mesh(stiltGeo, stiltMat);
      stilt.position.set(sx, 7, sz);
      tower.add(stilt);
    });

    // Observation Cabin Platform
    const cabinGeo = new THREE.BoxGeometry(5.5, 4, 5.5);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.y = 15;
    cabin.castShadow = true;
    tower.add(cabin);

    // Corrugated Roof
    const roofGeo = new THREE.ConeGeometry(4.5, 2, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 18;
    tower.add(roof);

    return tower;
  }
}

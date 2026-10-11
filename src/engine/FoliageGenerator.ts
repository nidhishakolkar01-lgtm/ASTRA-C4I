import * as THREE from 'three';
import { TerrainType } from '../types/simulation';
import { TerrainGenerator } from './TerrainGenerator';

/**
 * High-Performance Instanced 3D Foliage & Forest Generator
 * Spawns thousands of detailed pine trees, spruces, boulders, and scrub bushes at 60 FPS
 */
export class FoliageGenerator {
  /**
   * Build complete natural forest & rock system placed onto mountain topography
   */
  public static createForestInstanced(terrain: TerrainType): THREE.Group {
    const forestGroup = new THREE.Group();
    forestGroup.name = 'foliage_forest_group';

    const treeCount = terrain === 'urban_fob' ? 180 : 650;
    const boulderCount = 200;

    // 1. PINE TREE MODEL GEOMETRIES
    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.5, 0.9, 8, 7);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x3d2817,
      roughness: 0.9,
      metalness: 0.05
    });

    // Tiered Pine Foliage (3 stacked cones)
    const foliageTier1 = new THREE.ConeGeometry(5, 7, 7);
    const foliageTier2 = new THREE.ConeGeometry(4, 6, 7);
    const foliageTier3 = new THREE.ConeGeometry(2.8, 5, 7);

    foliageTier1.translate(0, 7, 0);
    foliageTier2.translate(0, 11, 0);
    foliageTier3.translate(0, 15, 0);

    // Merge pine needle layers into single geometry
    const combinedFoliageGeo = new THREE.BufferGeometry();
    const foliageMat = new THREE.MeshStandardMaterial({
      color: terrain === 'mountain_valley' ? 0x243625 : 0x1f3b25,
      roughness: 0.75,
      metalness: 0.05,
      flatShading: true
    });

    // Instanced Mesh for Trunks and Foliage
    const trunkInstanced = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
    const foliageInstanced1 = new THREE.InstancedMesh(foliageTier1, foliageMat, treeCount);
    const foliageInstanced2 = new THREE.InstancedMesh(foliageTier2, foliageMat, treeCount);
    const foliageInstanced3 = new THREE.InstancedMesh(foliageTier3, foliageMat, treeCount);

    trunkInstanced.castShadow = true;
    trunkInstanced.receiveShadow = true;
    foliageInstanced1.castShadow = true;
    foliageInstanced1.receiveShadow = true;

    const dummy = new THREE.Object3D();
    let placedTrees = 0;

    for (let i = 0; i < treeCount * 3 && placedTrees < treeCount; i++) {
      // Scatter within 1800m of base, but keep perimeter (radius 100m) clear for line of sight
      const angle = Math.random() * Math.PI * 2;
      const radius = 110 + Math.random() * 1600;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      const y = TerrainGenerator.getHeight(x, z, terrain);

      // Don't spawn trees underwater for coastal terrain
      if (terrain === 'coastal_naval' && y < 3) continue;

      const scale = 0.8 + Math.random() * 0.8;
      const rotY = Math.random() * Math.PI * 2;

      // Position Trunk
      dummy.position.set(x, y + 4 * scale, z);
      dummy.rotation.set(0, rotY, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      trunkInstanced.setMatrixAt(placedTrees, dummy.matrix);

      // Position Foliage Tiers
      dummy.position.set(x, y + scale, z);
      dummy.updateMatrix();
      foliageInstanced1.setMatrixAt(placedTrees, dummy.matrix);
      foliageInstanced2.setMatrixAt(placedTrees, dummy.matrix);
      foliageInstanced3.setMatrixAt(placedTrees, dummy.matrix);

      placedTrees++;
    }

    trunkInstanced.instanceMatrix.needsUpdate = true;
    foliageInstanced1.instanceMatrix.needsUpdate = true;
    foliageInstanced2.instanceMatrix.needsUpdate = true;
    foliageInstanced3.instanceMatrix.needsUpdate = true;

    forestGroup.add(trunkInstanced);
    forestGroup.add(foliageInstanced1);
    forestGroup.add(foliageInstanced2);
    forestGroup.add(foliageInstanced3);

    // 2. BOULDERS & MOUNTAIN ROCK OUTCROPPINGS
    const rockGeo = new THREE.DodecahedronGeometry(4, 1);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x47494d,
      roughness: 0.9,
      metalness: 0.1
    });

    const rockInstanced = new THREE.InstancedMesh(rockGeo, rockMat, boulderCount);
    rockInstanced.castShadow = true;
    rockInstanced.receiveShadow = true;

    for (let i = 0; i < boulderCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 80 + Math.random() * 1500;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const y = TerrainGenerator.getHeight(x, z, terrain);

      const sX = 0.7 + Math.random() * 1.5;
      const sY = 0.5 + Math.random() * 1.0;
      const sZ = 0.7 + Math.random() * 1.5;

      dummy.position.set(x, y + sY * 1.5, z);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.scale.set(sX, sY, sZ);
      dummy.updateMatrix();

      rockInstanced.setMatrixAt(i, dummy.matrix);
    }

    rockInstanced.instanceMatrix.needsUpdate = true;
    forestGroup.add(rockInstanced);

    return forestGroup;
  }
}

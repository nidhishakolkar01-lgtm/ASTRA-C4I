import * as THREE from 'three';
import { TerrainType, WeatherType } from '../types/simulation';

/**
 * Photorealistic Procedural 3D Terrain & Heightmap Engine
 * Generates mountain topography, valleys, rocky ridges, and PBR terrain shaders
 */
export class TerrainGenerator {
  // Multi-octave Perlin-like pseudo noise generator
  private static pseudoNoise(x: number, z: number): number {
    const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
    return s - Math.floor(s);
  }

  private static smoothNoise(x: number, z: number): number {
    const i = Math.floor(x);
    const j = Math.floor(z);
    const fx = x - i;
    const fz = z - j;

    // Hermite cubic curve for smooth interpolation
    const sx = fx * fx * (3 - 2 * fx);
    const sz = fz * fz * (3 - 2 * fz);

    const n00 = TerrainGenerator.pseudoNoise(i, j);
    const n10 = TerrainGenerator.pseudoNoise(i + 1, j);
    const n01 = TerrainGenerator.pseudoNoise(i, j + 1);
    const n11 = TerrainGenerator.pseudoNoise(i + 1, j + 1);

    const ix0 = n00 * (1 - sx) + n10 * sx;
    const ix1 = n01 * (1 - sx) + n11 * sx;

    return ix0 * (1 - sz) + ix1 * sz;
  }

  public static getHeight(x: number, z: number, terrain: TerrainType): number {
    // Keep FOB base area (radius 180m) relatively flat for military installations
    const distFromCenter = Math.hypot(x, z);
    const baseFlattenFactor = Math.min(1.0, Math.max(0.0, (distFromCenter - 90) / 160));

    // Multi-octave noise summation (Fractal Brownian Motion)
    let elevation = 0;

    if (terrain === 'border_outpost' || terrain === 'mountain_valley') {
      // Rugged Himalayan / Karakoram mountain ridges
      elevation += TerrainGenerator.smoothNoise(x * 0.0012, z * 0.0012) * 160;
      elevation += TerrainGenerator.smoothNoise(x * 0.0035, z * 0.0035) * 60;
      elevation += TerrainGenerator.smoothNoise(x * 0.012, z * 0.012) * 18;
      elevation += TerrainGenerator.smoothNoise(x * 0.03, z * 0.03) * 5;
    } else if (terrain === 'urban_fob') {
      // Gentle rolling industrial terrain with slight hills on perimeter
      elevation += TerrainGenerator.smoothNoise(x * 0.001, z * 0.001) * 35;
      elevation += TerrainGenerator.smoothNoise(x * 0.005, z * 0.005) * 12;
    } else if (terrain === 'coastal_naval') {
      // Coastal shoreline: low flat land sloping toward deep water in the negative Z direction
      const seaSlope = (z > 200) ? 0 : -z * 0.06;
      elevation += seaSlope;
      elevation += TerrainGenerator.smoothNoise(x * 0.002, z * 0.002) * 25;
    }

    return elevation * baseFlattenFactor;
  }

  /**
   * Generate High-Resolution Photorealistic PBR Terrain Texture & Normal Map
   */
  public static generatePBRTerrainTexture(terrain: TerrainType): {
    diffuseMap: THREE.CanvasTexture;
    normalMap: THREE.CanvasTexture;
    roughnessMap: THREE.CanvasTexture;
  } {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const normCanvas = document.createElement('canvas');
    normCanvas.width = size;
    normCanvas.height = size;
    const normCtx = normCanvas.getContext('2d')!;

    // Base color palettes based on terrain
    let baseHex = '#3d3429'; // mountain rocky soil
    let accentHex = '#5c4e3d';
    let grassHex = '#4a5438';
    let snowHex = '#d8e1e8';

    if (terrain === 'urban_fob') {
      baseHex = '#272b33'; // asphalt, dark soil, concrete dust
      accentHex = '#3c424e';
      grassHex = '#383e33';
      snowHex = '#6e7787';
    } else if (terrain === 'mountain_valley') {
      baseHex = '#4d463b'; // high-altitude Ladakh desert & granite
      accentHex = '#6b5e4c';
      grassHex = '#54523b';
      snowHex = '#ffffff';
    } else if (terrain === 'coastal_naval') {
      baseHex = '#2d3330'; // damp coastal soil, mud, rocks
      accentHex = '#3d4742';
      grassHex = '#3d5236';
      snowHex = '#647a75';
    }

    // 1. Paint Base Noise Layers
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, size, size);

    // Procedural rock strata and soil granulation
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    const normData = normCtx.createImageData(size, size);
    const nData = normData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const n1 = TerrainGenerator.smoothNoise(x * 0.08, y * 0.08);
        const n2 = TerrainGenerator.smoothNoise(x * 0.25, y * 0.25) * 0.5;
        const val = n1 + n2;

        // Modulate RGB
        const shade = Math.floor((val - 0.5) * 45);
        data[idx] = Math.max(0, Math.min(255, data[idx] + shade));
        data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + shade));
        data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] + shade));

        // Normal map calculation (Sobel-like vector)
        const nx = Math.floor(128 + Math.sin(x * 0.2) * 25);
        const ny = Math.floor(128 + Math.cos(y * 0.2) * 25);
        nData[idx] = nx;
        nData[idx + 1] = ny;
        nData[idx + 2] = 255;
        nData[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    normCtx.putImageData(normData, 0, 0);

    // 2. Add FOB Perimeter Camo Markings / Runway Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 2;
    for (let i = 0; i < size; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }

    const diffuseMap = new THREE.CanvasTexture(canvas);
    diffuseMap.wrapS = THREE.RepeatWrapping;
    diffuseMap.wrapT = THREE.RepeatWrapping;
    diffuseMap.repeat.set(16, 16);

    const normalMap = new THREE.CanvasTexture(normCanvas);
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(16, 16);

    const roughnessMap = diffuseMap.clone();

    return { diffuseMap, normalMap, roughnessMap };
  }

  /**
   * Build complete Photorealistic 3D Mountainous Terrain Mesh
   */
  public static createTerrainMesh(terrain: TerrainType, weather: WeatherType): THREE.Mesh {
    const width = 4500;
    const depth = 4500;
    const segments = 160;

    const geo = new THREE.PlaneGeometry(width, depth, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const vy = TerrainGenerator.getHeight(vx, vz, terrain);
      pos.setY(i, vy);
    }

    geo.computeVertexNormals();

    const { diffuseMap, normalMap, roughnessMap } = TerrainGenerator.generatePBRTerrainTexture(terrain);

    const mat = new THREE.MeshStandardMaterial({
      map: diffuseMap,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      roughness: weather === 'heavy_rain' ? 0.35 : 0.85, // wet ground reflections in rain
      metalness: weather === 'heavy_rain' ? 0.25 : 0.05,
      flatShading: false
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    mesh.name = 'photorealistic_terrain';

    return mesh;
  }
}

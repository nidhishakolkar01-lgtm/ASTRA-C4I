# ASTRA-C4I: Counter-UAS Threat Simulation Trainer

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r128-black.svg?logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Electron](https://img.shields.io/badge/Electron-29.0-47848F.svg?logo=electron)](https://www.electronjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**ASTRA-C4I** is an indigenous, lightweight, unit-deployable Command, Control, Communications, Computers, and Intelligence (C4I) tactical simulation platform. It trains air defence operators and military commanders in detecting, classifying, and neutralizing asymmetric unmanned aerial systems (UAS)—including micro-quadcopters, loitering munitions, FPV kamikazes, and coordinated multi-agent drone swarms.

Designed for air-gapped forward-deployed environments, the platform operates 100% offline with zero external cloud dependencies.

---

## Architecture Overview

```
                                  +---------------------------------------+
                                  |         ASTRA-C4I CORE SYSTEM         |
                                  +---------------------------------------+
                                                      |
         +--------------------------------------------+-------------------------------------------+
         |                                            |                                           |
+--------v-------------------+              +---------v------------------+              +---------v-------------------+
|    3D BATTLESPACE ENGINE   |              |    SENSOR FUSION SUITE     |              |    C-UAS ARSENAL STATION    |
+----------------------------+              +----------------------------+              +-----------------------------+
| • Three.js 60 FPS WebGL    |              | • 3D Primary Search Radar  |              | • 30mm CIWS Autocannon      |
| • 6-DoF Dynamic Drone Phys |              | • RF Spectrum Waterfall    |              | • 10kW High-Energy Laser    |
| • Boids Swarm Mesh Links   |              | • EO / IR / FLIR Optical   |              | • Directional RF Jammer     |
| • Multiple Terrain Biomes  |              | • Acoustic DF Array        |              | • Wideband HPM/EMP Pulser   |
| • Day / Dusk / Night Cycles|              | • Multi-Track Association  |              | • GNSS Navigation Spoofer   |
+----------------------------+              +----------------------------+              +-----------------------------+
         |                                            |                                           |
         +--------------------------------------------+-------------------------------------------+
                                                      |
         +--------------------------------------------+-------------------------------------------+
         |                                            |                                           |
+--------v-------------------+              +---------v------------------+              +---------v-------------------+
|  INSTRUCTOR DUAL-TERMINAL  |              |  AUDIO & COMMS SYNTHESIS   |              |     AAR DEBRIEF ENGINE      |
+----------------------------+              +----------------------------+              +-----------------------------+
| • LAN BroadcastChannel Sync|              | • Procedural Web Audio FX  |              | • 1000-Point Scoring Model  |
| • Dynamic Threat Injections|              | • Dual-Chirp Locking Tones |              | • STANAG 4586 Audit Stamp   |
| • Environmental Perturb    |              | • Voice Alert Dispatch     |              | • DSSC Competency Diploma   |
| • Trainee Telemetry Stream |              | • Sub-Bass Impact Rumble   |              | • 1-Click PDF/Print Dossier |
+----------------------------+              +----------------------------+              +-----------------------------+
```

---

## Core Capabilities

### 1. 3D Battlespace & Swarm Dynamics
- High-fidelity WebGL battlespace with realistic terrain generation (border outposts, desert forward bases, urban FOBs).
- 6-DoF flight dynamics simulating fixed-wing loitering munitions, racing FPV kamikazes, and commercial quadcopters.
- Real-time **Boids swarm cohesion & separation**, featuring dynamic inter-drone RF data mesh lines connecting swarm members.

### 2. Multi-Sensor Fusion
- **Primary Search Radar:** 360-degree sweep with customizable range scales (1000m to 5000m), RCS attenuation, and radar jamming clutter.
- **RF Direction Finding:** Multi-band spectrum monitoring (915 MHz, 1.2 GHz, 2.4 GHz, 5.8 GHz, GNSS L1/L2) with signal strength waterfall.
- **Electro-Optical / Infrared (EO/IR):** Picture-in-picture FLIR camera with White-Hot, Black-Hot, and Ironbow thermal imaging modes.
- **Acoustic Bearing Array:** Acoustic signature tracking for low-RCS threats in radar-blind corridors.

### 3. Layered Hard-Kill & Soft-Kill Arsenal
- **Soft-Kill:** Directional RF Jamming, Wideband GNSS Spoofing, High-Power Microwave (HPM/EMP).
- **Hard-Kill:** 30mm CIWS Rotary Autocannon with predictive lead calculation, 10kW High-Energy Laser (DEW) with thermal dwell accumulation.
- **Master Arm Safety:** 2-stage arming protocol with visual/audio safety interlocks.

### 4. Interactive Glass Cockpit HUD
- Dynamic mouse-following aiming sight with magnetic snap-to-target acquisition.
- 4-stage kill-chain HUD (Search $\to$ Track $\to$ Fire Control $\to$ Intercept).
- 3-mode declutter toggle (`FULL`, `TACTICAL`, `CLEAR`).
- Autonomous **Jury Auto-Pilot** AI commander for hands-free operational demonstration.

### 5. Official DSSC AAR & Printable Dossier
- Comprehensive After-Action Review (AAR) evaluating detection latency, classification accuracy, and Rules of Engagement (ROE) compliance.
- Exportable telemetry in structured JSON format.
- Print-ready Official Certificate of Competency featuring cryptographic SHA-256 seal verification and simulated QR validation matrix.

---

## Quick Start

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher

### Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/nidhishakolkar01-lgtm/ASTRA-C4I.git
cd ASTRA-C4I
npm install
```

### Running Development Server
Start the local Vite development server:
```bash
npm run dev
```
Navigate to **`http://localhost:5173`** in any modern Chromium, Firefox, or WebKit browser.

### Building for Production
Compile TypeScript and bundle optimized static assets:
```bash
npm run build
```
Build outputs are written to the `dist/` directory.

### Running Desktop Standalone Application (Electron)
Launch the desktop client in an isolated Electron window:
```bash
npm run electron:start
```
To package a standalone executable (`.exe`):
```bash
npm run electron:pack
```

---

## Tactical Controls & Keybindings

| Key / Control | Action | Function |
| :--- | :--- | :--- |
| `Space` | Fire Weapon | Fires the active weapon station at selected target |
| `Tab` | Cycle Target | Selects next detected airborne hostile in range |
| `1` - `5` | Select Weapon | Switches countermeasure (Jammer, CIWS, Laser, EMP, Spoof) |
| `M` | Master Arm | Toggles system arming state (`SAFE` $\leftrightarrow$ `ARMED`) |
| `H` | HUD Mode | Cycles HUD declutter (`FULL` $\to$ `TACTICAL` $\to$ `CLEAR`) |
| `P` | Auto-Pilot | Toggles autonomous AI target engagement mode |
| `C` | Sensor Mode | Cycles active sensor focus (Radar $\to$ FLIR $\to$ RF $\to$ Acoustic) |
| `Esc` | Clear Selection | Deselects target lock |

---

## Project Structure

```
ASTRA-C4I/
├── electron/                   # Electron desktop wrapper
│   ├── main.cjs                # Main process entrypoint
│   └── preload.cjs             # IPC security preload script
├── public/                     # Static web assets & PWA manifest
├── src/
│   ├── components/
│   │   ├── aar/                # After-Action Review & Certificate exports
│   │   ├── aiAdvisor/          # AI Tactical Assistant component
│   │   ├── common/             # Header, Navigation, and shared UI
│   │   ├── droneEncyclopedia/  # Threat database & doctrine handbook
│   │   ├── instructorTerminal/ # Instructor live injection console
│   │   ├── scenarioBuilder/    # Custom scenario generator & editor
│   │   └── simulator/          # 3D canvas, HUD, Radar, scopes, console
│   ├── context/
│   │   └── SimulatorContext.tsx# Central state machine & event dispatcher
│   ├── data/
│   │   ├── defaultScenarios.ts # Standardized combat scenarios & drills
│   │   ├── droneDatabase.ts    # Threat specifications, RCS, frequencies
│   │   └── weaponArsenal.ts    # Countermeasure ballistics & dwell stats
│   ├── engine/
│   │   ├── BallisticFXEngine.ts# Particle physics, tracer fire & explosions
│   │   ├── DecisionScoring.ts  # NATO/DSSC evaluation scoring model
│   │   ├── DronePhysics.ts     # 6-DoF trajectory & Boids swarm algorithms
│   │   ├── DualTerminalSync.ts # Cross-tab & LAN telemetry sync
│   │   ├── FoliageGenerator.ts # Procedural terrain vegetation
│   │   ├── MilitaryBaseAssets.ts# Base fortifications, bunkers & radar domes
│   │   ├── RealisticDroneMeshes.ts# 3D drone procedural procedural meshes
│   │   ├── ScenarioGenerator.ts# Procedural threat injection engine
│   │   ├── SensorFusion.ts     # Radar, RF, acoustic & thermal integration
│   │   ├── SoundEffects.ts     # Multi-node procedural Web Audio synthesizer
│   │   ├── TerrainGenerator.ts # Heightmap generation & biome textures
│   │   └── VoiceComms.ts       # Synthesized radio voice alerts
│   ├── types/
│   │   └── simulation.ts       # TypeScript type declarations
│   ├── App.tsx                 # Root application component
│   ├── index.css               # Tailwind utility & glassmorphism styling
│   └── main.tsx                # React DOM entrypoint
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Technology Stack

- **User Interface:** React 18, Tailwind CSS, Lucide Icons
- **3D Graphics:** Three.js, WebGL, WebXR
- **Audio Synthesis:** Web Audio API (Multi-Node Procedural Synthesizers)
- **Local Intercom & Networking:** BroadcastChannel API
- **Desktop Runtime:** Electron 29
- **Build System:** Vite 5, TypeScript 5

---

## Security & Interoperability

- **Air-Gapped Operation:** Designed to operate completely disconnected from external networks.
- **STANAG 4586 Alignment:** Threat telemetry structures follow NATO/Allied standards for unmanned control system interoperability.
- **Cryptographic Seal:** Mission debrief certificates include deterministic SHA-256 validation signatures.

---

## License

This project is licensed under the [MIT License](LICENSE).

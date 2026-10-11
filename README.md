# ASTRA-CUAS: AI-Enabled Drone & Counter-Drone Threat Simulation Trainer
### Smart India Hackathon (SIH 2026) | Problem Statement ID: 26247
**Organization:** Ministry of Defence (MoD) | **Department:** Defence Services Staff College (DSSC), Wellington  
**Category:** Software | **Theme:** Robotics and Drones

---

## 🎖️ Executive Summary

Modern asymmetric warfare (demonstrated in Ukraine, the Red Sea, and India's Northern & Western frontiers) has established low-cost commercial quadcopters, high-speed FPV kamikaze drones, and autonomous loitering munitions as decisive tactical threats. Existing military training relies on theoretical classroom lectures and sparse, cost-prohibitive live-fire drills that are weather-dependent and do not provide sufficient repetitions for unit-level readiness.

**ASTRA-CUAS** is an indigenous, lightweight, unit-deployable, full-stack 3D tactical simulation platform designed for officers and air defence personnel to train in **detecting, classifying, and neutralizing drone and swarm threats** across complex environments.

---

## 🚀 Key Modules & System Capabilities

```
+-----------------------------------------------------------------------------------------+
|                              ASTRA-CUAS PLATFORM ARCHITECTURE                           |
+-----------------------------------------------------------------------------------------+
       |                                       |                                   |
+------v----------------+       +--------------v---------------+       +-----------v------+
| 1. 3D BATTLEFIELD     |       | 2. SENSOR FUSION             |       | 3. LAYERED C-UAS |
|    SIMULATOR (WebXR)  |       |    SUITE                     |       |    ARSENAL       |
+-----------------------+       +------------------------------+       +------------------+
| - WebGL / WebXR 60FPS |       | - 3D PPI Search Radar        |       | - 30mm CIWS Gun  |
| - 6-DoF Physics Model |       | - RF Waterfall Analyzer      |       | - 10kW Laser DEW |
| - Boids Swarm AI      |       | - FLIR (White/Black/Ironbow) |       | - RF Disruptor   |
| - 4 Tactical Terrains |       | - Acoustic Bearing DF        |       | - GNSS Spoofer   |
| - Day / Dusk / Night  |       | - Johnson Criteria Optic     |       | - HPM Microwave  |
+-----------------------+       +------------------------------+       +------------------+
       |                                       |                                   |
+------v----------------+       +--------------v---------------+       +-----------v------+
| 4. DUAL TERMINAL      |       | 5. AI VOICE ALERTS &         |       | 6. DECISION-TREE |
|    INSTRUCTOR CONSOLE |       |    RADIO CHATTER             |       |    AAR STUDIO    |
+-----------------------+       +------------------------------+       +------------------+
| - Real-time EW Inject |       | - Synthetic Speech Engine    |       | - 1000-Pt Metric |
| - Surprise Decoy Lure |       | - VHF/UHF Radio Squelch      |       | - 2D/3D Replay   |
| - Swarm Pincer Attack |       | - ROE Breach Warnings        |       | - Unit Analytics |
| - Voice Intercom Comms|       | - Target Lock Callouts       |       | - MoD PDF Dossier|
+-----------------------+       +------------------------------+       +------------------+
```

---

## 🌟 Advanced Features Implemented

### 1. Standalone Offline Desktop App (`.exe`)
- Packaged with **Electron** for 100% offline, air-gapped field deployment on forward battalion laptops.
- Zero external cloud or internet dependencies.

### 2. Instructor-Trainee Dual Terminal (Multiplayer / LAN Sync)
- A commanding officer / instructor console connecting in real-time over **BroadcastChannel / Local LAN**:
  - **Live Trainee Telemetry Monitor:** View trainee's target locks, active weapon station, base health, and score.
  - **Real-Time Red-Team Injectors:**
    * *Inject Instant High-Power Radar Jamming (+50% noise clutter)*
    * *Spawn Surprise Mockingbird Decoy Drone in trainee's blind spot*
    * *Trigger Coordinated 4-Node Swarm Pincer Attack*
    * *Force Sudden Atmospheric Degradation (Sandstorm / Dense Fog / Night)*
    * *Transmit Live Tactical Voice Dispatch over trainee headset*

### 3. AI Tactical Voice Comms & Radio Chatter
- Built-in speech synthesis combined with procedural VHF/UHF military radio bandpass filters and squelch bursts:
  - *"Early warning contact: Track 02 acquired at 1100 meters."*
  - *"Splash one hostile. Delta loitering munition neutralized with High-Energy Laser."*
  - *"Warning! Rules of engagement breach! High collateral risk in urban sector!"*
  - *"Perimeter breach! Point defence active!"*

### 4. WebXR / Immersive 360° VR Mode
- Integrated with the **WebXR Device API** and Three.js VR runtime.
- Plug-and-play support for Meta Quest 2/3, HTC Vive, and Pico headsets with in-VR HUD reticles.

---

## 🛠️ Quick Start & Local Execution

### Web Browser Mode (Immediate)
```bash
cd c-uas-threat-simulator
npm run dev
```
Open **`http://localhost:5173`** in Chrome, Edge, or Firefox.

### Desktop Standalone Executable Packaging
```bash
# Test Electron desktop window locally
npm run electron:start

# Build installer package (.exe)
npm run electron:pack
```

---

## 📋 Technology Stack
- **Frontend Framework:** React 18 with TypeScript
- **3D Graphics Engine:** Three.js (WebGL / WebXR)
- **Desktop Runtime:** Electron 29
- **Styling:** Tailwind CSS (Tactical Military Dark UI)
- **Audio & Comms:** Web Audio API + Web Speech Synthesis (100% offline)
- **LAN & State Sync:** BroadcastChannel API
- **Build Tool:** Vite 5

---
**Developed for Smart India Hackathon (SIH 2026) | Team Atmanirbhar Defence**

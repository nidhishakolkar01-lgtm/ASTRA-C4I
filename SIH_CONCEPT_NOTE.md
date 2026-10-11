# SMART INDIA HACKATHON (SIH 2026) - EXECUTIVE CONCEPT NOTE
## Problem Statement ID: 26247
**Title:** AI-Enabled Drone & Counter-Drone Threat Simulation Trainer  
**Ministry / Department:** Ministry of Defence (MoD) / Defence Services Staff College (DSSC), Wellington  
**Category:** Software | **Theme:** Robotics and Drones  

---

### 1. The Operational Challenge & Strategic Context
Recent conflicts (Ukraine, Red Sea, Nagorno-Karabakh, and proxy drone incursions along India's Northern & Western frontiers) have proven that low-cost commercial off-the-shelf (COTS) quadcopters, high-speed FPV kamikaze drones, and autonomous loitering munitions can overwhelm traditional air defences. 

Existing military training suffers from critical bottlenecks:
- **High Economic & Logistics Costs:** Expending live target drones and air defence ammunition for routine drills is economically prohibitive for daily unit-level practice.
- **Weather & Range Clearance Constraints:** Live-fire drills require restricted military airspace and clear weather.
- **Hardware Barrier:** Most foreign military simulators (e.g. Bohemia Interactive VBS) demand multi-lakh GPU workstations, making widespread deployment across forward battalion observation posts impractical.

---

### 2. The Proposed Solution: ASTRA-CUAS
**ASTRA-CUAS** is an indigenous, lightweight, software-based 3D counter-drone threat simulation platform designed for officers and air defence personnel to train in **detecting, classifying, and neutralizing drone and swarm threats** across complex environments.

#### Key Architectural Highlights
1. **Unit-Level Deployability (Minimal Hardware Footprint):**
   - Engineered in WebGL / WebXR and packaged with Electron for **100% offline, air-gapped operation on standard field laptops** (Intel i5/Ryzen 5, 8–16 GB RAM) delivering smooth 60+ FPS.
   - Plug-and-play scalable to immersive 360° VR headsets (Meta Quest 2/3, HTC Vive) without requiring code modifications.
2. **Multi-Spectral Synthetic Sensor Suite:**
   - **3D PPI Search Radar:** 12 RPM sweep, RCS-based SNR calculation, Doppler radial velocity vectors, and EW jamming noise clutter.
   - **RF Spectrum & Waterfall Analyzer:** Monitors 400 MHz to 5.8 GHz, detecting FHSS frequency hopping and protocol signatures (OcuSync, Analog VTX, ExpressLRS).
   - **EO/IR Thermal Optics:** Multi-spectral view switching between Daylight Optical, Gen-3 NVG (Green Phosphor), and FLIR Thermal (White-Hot / Black-Hot / Ironbow).
   - **Acoustic Direction-Finding Array:** Azimuth bearing estimation and motor RPM analysis for non-line-of-sight (NLOS) detection.
3. **Layered Counter-UAS (C-UAS) Effector Arsenal:**
   - **Soft-Kill:** Directional RF Disruptors (433M/915M/2.4G/5.8G), NavIC/GNSS Coordinate Spoofers, High-Power Microwave (HPM EMP pulse), and Sky-Net Interceptors.
   - **Hard-Kill:** 30mm CIWS Auto-Cannon firing AHEAD programmable tungsten airburst ammunition, and 10kW High-Energy Laser (DEW).
4. **Decision-Tree Tactical Scoring Engine:**
   - Quantitative 1000-Point DSSC Competence Metric evaluating Detection Latency ($TTD$), Threat Classification Accuracy, Weapon-Target Allocation ($WTA$), Rules of Engagement ($ROE$) & Collateral Discipline, and Magazine Economy.
   - Assigns military grades: *Alpha (Superior $\ge 850$), Bravo (Combat Ready $\ge 700$), Charlie (Needs Remediation $\ge 500$), Delta (Failed Drill $< 500$)*.
5. **After-Action Review (AAR) & Unit Progression Analytics:**
   - Interactive time-scrubbed 2D/3D trajectory replay.
   - Historical multi-session radar chart diagnosing individual and unit-wide weaknesses.
   - Official Ministry of Defence printable debrief dossier with digital verification signatures.
6. **Instructor-Trainee Dual Terminal (Multiplayer / LAN Sync):**
   - Live red-team adversary console allowing instructors to inject surprise radar jamming pulses, decoy drones, and 4-node swarm pincer attacks in real-time.
7. **AI Voice Comms & Military Radio Squelch:**
   - 100% offline synthetic voice callouts and tactical VHF/UHF radio squelch static.

---

### 3. Innovation & Atmanirbhar Bharat Impact
- **Zero Foreign Proprietary Dependencies:** 100% indigenous software stack eliminating costly recurring software licenses.
- **Air-Gapped Cybersecurity:** Zero external cloud dependencies, complying with strict defence data security guidelines.
- **High-Scalability:** Enables high-frequency daily repetitions for infantry and air defence units stationed at high-altitude posts (e.g. Ladakh/Sachen) or desert borders.

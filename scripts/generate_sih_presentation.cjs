const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

// Initialize presentation
const pres = new pptxgen();

// Set Presentation Properties
pres.title = "ASTRA-CUAS: AI-Enabled Drone & Counter-Drone Threat Simulation Trainer";
pres.subject = "Smart India Hackathon 2026 - Problem Statement 26247";
pres.author = "Team ASTRA - SIH 2026";
pres.company = "Ministry of Defence | Defence Services Staff College (DSSC)";
pres.layout = 'LAYOUT_16x9';

// Define Military Theme Palette
const PALETTE = {
  bgDark: '0A0F1D',       // Deep Tactical Navy
  cardBg: '131E35',       // Command Card Dark Slate
  borderCyan: '00E5FF',   // Radar Cyan
  textLight: 'F8FAFC',    // Pure White
  textMuted: '94A3B8',    // Muted Silver Grey
  accentGold: 'F59E0B',   // Army Amber / Gold
  accentGreen: '10B981',  // Military Emerald
  accentRed: 'EF4444',    // Threat Red
  headerBg: '0F172A'      // Slate Header
};

function addTacticalSlide(title, subtitle) {
  const slide = pres.addSlide();
  
  // Background
  slide.background = { color: PALETTE.bgDark };

  // Top Tactical Header Banner
  slide.addShape(pres.ShapeType.rect, {
    x: 0.5, y: 0.4, w: 12.3, h: 0.9,
    fill: { color: PALETTE.headerBg },
    line: { color: PALETTE.borderCyan, width: 1 }
  });

  // Top Title Text
  slide.addText(title.toUpperCase(), {
    x: 0.7, y: 0.45, w: 9.0, h: 0.45,
    fontFace: 'Trebuchet MS',
    fontSize: 20,
    bold: true,
    color: PALETTE.borderCyan
  });

  // Subtitle / Breadcrumb
  slide.addText(subtitle || 'SIH 2026 | PS 26247 | MINISTRY OF DEFENCE | DSSC WELLINGTON', {
    x: 0.7, y: 0.9, w: 9.0, h: 0.3,
    fontFace: 'Arial',
    fontSize: 10,
    color: PALETTE.textMuted
  });

  // Top Right Badge
  slide.addShape(pres.ShapeType.roundRect, {
    x: 10.4, y: 0.55, w: 2.2, h: 0.6,
    fill: { color: '1E293B' },
    line: { color: PALETTE.accentGold, width: 1 },
    rectRadius: 0.1
  });
  slide.addText('RESTRICTED / DEFENCE', {
    x: 10.4, y: 0.65, w: 2.2, h: 0.4,
    fontFace: 'Arial',
    fontSize: 9,
    bold: true,
    align: 'center',
    color: PALETTE.accentGold
  });

  // Bottom Footer
  slide.addText('ASTRA-CUAS SIMULATION PLATFORM | SMART INDIA HACKATHON 2026', {
    x: 0.5, y: 7.1, w: 8.0, h: 0.3,
    fontFace: 'Arial',
    fontSize: 9,
    color: PALETTE.textMuted
  });

  return slide;
}

// ==========================================
// SLIDE 1: TITLE SLIDE
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: PALETTE.bgDark };

  // Center Tactical Card
  slide.addShape(pres.ShapeType.roundRect, {
    x: 1.0, y: 0.8, w: 11.33, h: 5.8,
    fill: { color: PALETTE.cardBg },
    line: { color: PALETTE.borderCyan, width: 1.5 },
    rectRadius: 0.2
  });

  // National / Event Header
  slide.addText('SMART INDIA HACKATHON 2026 | SOFTWARE EDITION', {
    x: 1.5, y: 1.2, w: 10.33, h: 0.4,
    fontFace: 'Arial',
    fontSize: 13,
    bold: true,
    color: PALETTE.accentGold,
    align: 'center'
  });

  // Main Title
  slide.addText('ASTRA-CUAS', {
    x: 1.5, y: 1.6, w: 10.33, h: 1.1,
    fontFace: 'Trebuchet MS',
    fontSize: 44,
    bold: true,
    color: PALETTE.textLight,
    align: 'center'
  });

  // Subtitle
  slide.addText('AI-Enabled Drone & Counter-Drone Threat Simulation Trainer', {
    x: 1.5, y: 2.7, w: 10.33, h: 0.5,
    fontFace: 'Trebuchet MS',
    fontSize: 20,
    color: PALETTE.borderCyan,
    align: 'center'
  });

  // Problem Statement Pill
  slide.addShape(pres.ShapeType.roundRect, {
    x: 4.4, y: 3.3, w: 4.5, h: 0.45,
    fill: { color: '0F172A' },
    line: { color: PALETTE.accentGold, width: 1 },
    rectRadius: 0.1
  });
  slide.addText('PROBLEM STATEMENT ID: 26247', {
    x: 4.4, y: 3.38, w: 4.5, h: 0.3,
    fontFace: 'Arial',
    fontSize: 11,
    bold: true,
    color: PALETTE.accentGold,
    align: 'center'
  });

  // Organization Details Card
  slide.addShape(pres.ShapeType.rect, {
    x: 2.0, y: 4.0, w: 9.33, h: 1.4,
    fill: { color: '0A1124' },
    line: { color: '334155', width: 1 }
  });

  slide.addText([
    { text: 'Target Organization: ', options: { bold: true, color: PALETTE.textMuted } },
    { text: 'Ministry of Defence (MoD)\n', options: { bold: true, color: PALETTE.textLight } },
    { text: 'Department: ', options: { bold: true, color: PALETTE.textMuted } },
    { text: 'Defence Services Staff College (DSSC), Wellington\n', options: { bold: true, color: PALETTE.textLight } },
    { text: 'Category / Theme: ', options: { bold: true, color: PALETTE.textMuted } },
    { text: 'Software | Robotics and Drones | Counter-UAS Tactical Training', options: { bold: true, color: PALETTE.borderCyan } }
  ], {
    x: 2.3, y: 4.15, w: 8.7, h: 1.1,
    fontFace: 'Arial',
    fontSize: 12,
    align: 'center'
  });

  // Footer Tagline
  slide.addText('Air-Gapped Desktop (.exe) • WebXR 360° VR • Autonomous Swarm AI • Multi-Spectral Sensor Fusion', {
    x: 1.5, y: 5.7, w: 10.33, h: 0.4,
    fontFace: 'Arial',
    fontSize: 11,
    color: PALETTE.accentGreen,
    align: 'center'
  });
}

// ==========================================
// SLIDE 2: BACKGROUND & OPERATIONAL NEED
// ==========================================
{
  const slide = addTacticalSlide(
    'Operational Background & Problem Definition',
    'Modern Asymmetric Battlefield Realities vs Traditional Training Limitations'
  );

  // Left Card: Current Conflict Realities
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.6, w: 5.6, h: 5.1,
    fill: { color: PALETTE.cardBg },
    line: { color: PALETTE.accentRed, width: 1.2 },
    rectRadius: 0.15
  });

  slide.addText('THE MODERN DRONE THREAT (UKRAINE / ARMENIA / RED SEA)', {
    x: 1.0, y: 1.8, w: 5.2, h: 0.4,
    fontFace: 'Trebuchet MS',
    fontSize: 12,
    bold: true,
    color: PALETTE.accentRed
  });

  slide.addText([
    { text: '• Asymmetric Cost Ratio: ', options: { bold: true, color: PALETTE.accentGold } },
    { text: '$500 commercial FPV drones destroying $5M armoured vehicles and command outposts.\n\n', options: { color: PALETTE.textLight } },
    { text: '• Swarm & Saturation Tactics: ', options: { bold: true, color: PALETTE.accentGold } },
    { text: 'Simultaneous coordinated multi-axis incursions overwhelming conventional single-target radar systems.\n\n', options: { color: PALETTE.textLight } },
    { text: '• Low Radar Cross Section (RCS): ', options: { bold: true, color: PALETTE.accentGold } },
    { text: 'Carbon-fiber airframes (RCS < 0.005 m²) navigating Nap-of-the-Earth (NOE) valleys to exploit radar shadow zones.\n\n', options: { color: PALETTE.textLight } },
    { text: '• Electronic Warfare Hardening: ', options: { bold: true, color: PALETTE.accentGold } },
    { text: 'Fiber-optic tethered control and autonomous visual inertial odometry resisting RF jamming.\n', options: { color: PALETTE.textLight } }
  ], {
    x: 1.0, y: 2.3, w: 5.2, h: 4.2,
    fontFace: 'Arial',
    fontSize: 11
  });

  // Right Card: Existing Training Deficiencies
  slide.addShape(pres.ShapeType.roundRect, {
    x: 6.9, y: 1.6, w: 5.6, h: 5.1,
    fill: { color: PALETTE.cardBg },
    line: { color: PALETTE.accentGold, width: 1.2 },
    rectRadius: 0.15
  });

  slide.addText('EXISTING MILITARY TRAINING BOTTLENECKS', {
    x: 7.1, y: 1.8, w: 5.2, h: 0.4,
    fontFace: 'Trebuchet MS',
    fontSize: 12,
    bold: true,
    color: PALETTE.accentGold
  });

  slide.addText([
    { text: '• Prohibitive Financial Cost: ', options: { bold: true, color: PALETTE.accentRed } },
    { text: 'Live-fire anti-drone drills consume tens of thousands of dollars in specialized munitions and target drones per session.\n\n', options: { color: PALETTE.textLight } },
    { text: '• Weather & Range Restrictions: ', options: { bold: true, color: PALETTE.accentRed } },
    { text: 'Live ranges require clear daylight, large safety corridors, and calm winds; zero night or blizzard practice.\n\n', options: { color: PALETTE.textLight } },
    { text: '• Inadequate Cognitive Repetition: ', options: { bold: true, color: PALETTE.accentRed } },
    { text: 'Troops get only 2-3 live engagements per year. Muscle memory and rapid threat classification degrade quickly.\n\n', options: { color: PALETTE.textLight } },
    { text: '• Rote Learning / Fixed Scenarios: ', options: { bold: true, color: PALETTE.accentRed } },
    { text: 'Classroom slide decks lack procedural variability; soldiers cannot train against dynamic adaptive swarm AI.\n', options: { color: PALETTE.textLight } }
  ], {
    x: 7.1, y: 2.3, w: 5.2, h: 4.2,
    fontFace: 'Arial',
    fontSize: 11
  });
}

// ==========================================
// SLIDE 3: PROPOSED SOLUTION ARCHITECTURE
// ==========================================
{
  const slide = addTacticalSlide(
    'ASTRA-CUAS Proposed Solution',
    'Tactical Software-Based Simulation Platform Usable at Unit-Level on Standard Hardware'
  );

  // 3 Capability Columns
  const cols = [
    {
      x: 0.8,
      title: 'MULTI-SPECTRAL SENSOR SUITE',
      color: PALETTE.borderCyan,
      items: [
        '3D PPI Pulse Doppler Radar with RCS calculations and range-azimuth sweeps',
        'RF Waterfall Spectrogram (400MHz-5.8GHz) detecting control uplinks & video downlinks',
        'EO/IR FLIR Thermal Optics with White-Hot, Black-Hot, Ironbow & NVG shaders',
        'Triangulated Acoustic Direction Finding for low-altitude blind-spot tracking'
      ]
    },
    {
      x: 4.85,
      title: 'LAYERED C-UAS ARSENAL',
      color: PALETTE.accentGold,
      items: [
        '30mm CIWS Gatling Cannon firing tungsten AHEAD airburst shrapnel pellets',
        '10kW High-Energy Laser DEW for silent thermal structural burn-through',
        'Directional RF Jammer severing C2 radio telemetry and video downlinks',
        'GNSS Coordinate Spoofer drifting drones away from high-value target assets',
        'High-Power Microwave (HPM) wide-angle EMP disabling swarm electronics'
      ]
    },
    {
      x: 8.9,
      title: 'INTELLIGENT EVALUATION & AAR',
      color: PALETTE.accentGreen,
      items: [
        'DSSC 1000-Point Decision-Tree scoring speed, identification and proportionality',
        'Millisecond-accurate Tactical Event Timeline recording every operator decision',
        'Instructor-Trainee Dual Console for live jamming and decoy injection over LAN',
        'Directing Staff AI Mentor (Gemini 2.5 Flash + offline heuristic engine)'
      ]
    }
  ];

  cols.forEach(col => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: col.x, y: 1.6, w: 3.6, h: 5.1,
      fill: { color: PALETTE.cardBg },
      line: { color: col.color, width: 1.2 },
      rectRadius: 0.15
    });

    slide.addText(col.title, {
      x: col.x + 0.2, y: 1.8, w: 3.2, h: 0.5,
      fontFace: 'Trebuchet MS',
      fontSize: 11,
      bold: true,
      color: col.color
    });

    const bulletList = col.items.map(it => `• ${it}\n\n`).join('');
    slide.addText(bulletList, {
      x: col.x + 0.2, y: 2.4, w: 3.2, h: 4.1,
      fontFace: 'Arial',
      fontSize: 10,
      color: PALETTE.textLight
    });
  });
}

// ==========================================
// SLIDE 4: SYSTEM ARCHITECTURE & TECH STACK
// ==========================================
{
  const slide = addTacticalSlide(
    'System Architecture & Technology Stack',
    '100% Air-Gapped Capable Architecture with Zero Specialized Hardware Dependency'
  );

  // Top Box: Presentation & Graphics
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.6, w: 11.7, h: 1.4,
    fill: { color: PALETTE.cardBg },
    line: { color: PALETTE.borderCyan, width: 1 },
    rectRadius: 0.1
  });
  slide.addText('GRAPHICS, RENDERING & SIMULATION FRONTEND (THREE.JS + REACT 18 + WEBXR)', {
    x: 1.0, y: 1.75, w: 11.3, h: 0.35,
    fontFace: 'Trebuchet MS',
    fontSize: 11,
    bold: true,
    color: PALETTE.borderCyan
  });
  slide.addText('Procedural 4.5km² PBR Mountain Heightfields • Instanced Conifer Forests (650+ trees @ 60 FPS) • PBR Normal/Roughness Shaders • WebXR 360° Immersive VR Support • ACES Filmic Tone Mapping', {
    x: 1.0, y: 2.15, w: 11.3, h: 0.65,
    fontFace: 'Arial',
    fontSize: 10,
    color: PALETTE.textLight
  });

  // Middle Left: AI & Physics Engine
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 3.2, w: 5.7, h: 2.2,
    fill: { color: PALETTE.cardBg },
    line: { color: PALETTE.accentGold, width: 1 },
    rectRadius: 0.1
  });
  slide.addText('CORE SIMULATION & THREAT AI ENGINES', {
    x: 1.0, y: 3.35, w: 5.3, h: 0.3,
    fontFace: 'Trebuchet MS',
    fontSize: 11,
    bold: true,
    color: PALETTE.accentGold
  });
  slide.addText([
    { text: '• Autonomous Red-Team AI: ', options: { bold: true, color: PALETTE.textMuted } },
    { text: 'NOE terrain-masking (20-35m AGL), reactive corkscrew jinking, and Reynolds Boids flocking.\n', options: { color: PALETTE.textLight } },
    { text: '• Sensor Fusion Engine: ', options: { bold: true, color: PALETTE.textMuted } },
    { text: 'Real-time radar cross-section calculation, RF modulation spectrum, and thermal emission signatures.\n', options: { color: PALETTE.textLight } },
    { text: '• Directing Staff AI Mentor: ', options: { bold: true, color: PALETTE.textMuted } },
    { text: 'Google Gemini 2.5 Flash API with deterministic offline rule-based fallback for air-gapped bases.', options: { color: PALETTE.textLight } }
  ], {
    x: 1.0, y: 3.75, w: 5.3, h: 1.5,
    fontFace: 'Arial',
    fontSize: 9.5
  });

  // Middle Right: Networking & Scoring
  slide.addShape(pres.ShapeType.roundRect, {
    x: 6.8, y: 3.2, w: 5.7, h: 2.2,
    fill: { color: PALETTE.cardBg },
    line: { color: PALETTE.accentGreen, width: 1 },
    rectRadius: 0.1
  });
  slide.addText('EVALUATION, NETWORKING & AUDIO SYSTEMS', {
    x: 7.0, y: 3.35, w: 5.3, h: 0.3,
    fontFace: 'Trebuchet MS',
    fontSize: 11,
    bold: true,
    color: PALETTE.accentGreen
  });
  slide.addText([
    { text: '• DSSC Decision-Tree Scoring: ', options: { bold: true, color: PALETTE.textMuted } },
    { text: '1000-point algorithm evaluating detection time, classification accuracy, ROE compliance, and collateral risk.\n', options: { color: PALETTE.textLight } },
    { text: '• Dual-Terminal Instructor Sync: ', options: { bold: true, color: PALETTE.textMuted } },
    { text: 'Local WebSocket / BroadcastChannel enabling commanding officers to inject EW surprise jamming over LAN.\n', options: { color: PALETTE.textLight } },
    { text: '• Military Synthetic Voice Comms: ', options: { bold: true, color: PALETTE.textMuted } },
    { text: 'Web Speech synthesis with bandpass squelch filter and tactical radio chime sound design.', options: { color: PALETTE.textLight } }
  ], {
    x: 7.0, y: 3.75, w: 5.3, h: 1.5,
    fontFace: 'Arial',
    fontSize: 9.5
  });

  // Bottom Box: Deployment Runtime
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 5.6, w: 11.7, h: 1.1,
    fill: { color: '071120' },
    line: { color: '334155', width: 1 },
    rectRadius: 0.1
  });
  slide.addText('DEPLOYMENT TARGET: AIR-GAPPED STANDALONE WINDOWS EXECUTABLE (.EXE)', {
    x: 1.0, y: 5.7, w: 11.3, h: 0.3,
    fontFace: 'Trebuchet MS',
    fontSize: 10,
    bold: true,
    color: PALETTE.accentGold
  });
  slide.addText('Packaged with Electron 29 & NSIS installer. Zero internet connection required. Runs smoothly at 60 FPS on standard defence military laptops (Intel i5/i7 or AMD Ryzen with integrated/discrete GPU).', {
    x: 1.0, y: 6.05, w: 11.3, h: 0.5,
    fontFace: 'Arial',
    fontSize: 9.5,
    color: PALETTE.textLight
  });
}

// ==========================================
// SLIDE 5: AUTONOMOUS RED-TEAM THREAT AI
// ==========================================
{
  const slide = addTacticalSlide(
    'Autonomous Red-Team Threat AI Engine',
    'Procedurally Generated, Adversarial & Adaptive Threat Behaviors'
  );

  const tactics = [
    {
      x: 0.8,
      name: 'NAP-OF-THE-EARTH (NOE) TERRAIN MASKING',
      desc: 'Drones dynamically compute mountain heightmaps and hug ground contours at 20-35m AGL, flying inside valley shadows to break direct radar Line-of-Sight until within 800m of the target FOB.'
    },
    {
      x: 3.8,
      name: 'COORDINATED BOIDS SWARM CONVERGENCE',
      desc: 'Swarms execute Craig Reynolds flocking algorithm (Cohesion, Separation, Alignment). If the lead drone is destroyed, the swarm instantly re-elects a flight leader and splits into multi-axis pincer attack vectors.'
    },
    {
      x: 6.8,
      name: 'HIGH-G EVASIVE CORKSCREW JINKING',
      desc: 'Upon detecting optical laser lock-on or CIWS radar track initiation, loitering munitions execute chaotic spiral maneuvers (up to 4.5G lateral acceleration) to disrupt ballistic intercept calculation.'
    },
    {
      x: 9.8,
      name: 'MOTHER-SHIP DAUGHTER DEPLOYMENT',
      desc: 'Heavy carrier hexacopters hold standoff positions 1800m away, deploying multiple sub-250g FPV daughter kamikaze drones simultaneously to saturate the base air defense CIWS magazine capacity.'
    }
  ];

  tactics.forEach(t => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: t.x, y: 1.6, w: 2.7, h: 5.1,
      fill: { color: PALETTE.cardBg },
      line: { color: PALETTE.accentGold, width: 1.2 },
      rectRadius: 0.15
    });

    slide.addText(t.name, {
      x: t.x + 0.15, y: 1.8, w: 2.4, h: 0.7,
      fontFace: 'Trebuchet MS',
      fontSize: 10,
      bold: true,
      color: PALETTE.accentGold
    });

    slide.addText(t.desc, {
      x: t.x + 0.15, y: 2.6, w: 2.4, h: 3.8,
      fontFace: 'Arial',
      fontSize: 9.5,
      color: PALETTE.textLight
    });
  });
}

// ==========================================
// SLIDE 6: DECISION SCORING & AAR STUDIO
// ==========================================
{
  const slide = addTacticalSlide(
    'DSSC Decision-Tree Scoring & After-Action Review (AAR)',
    '1000-Point Quantitative Tactical Competency Evaluation System'
  );

  // Left Side: 1000-Point Scoring Breakdown
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.6, w: 5.7, h: 5.1,
    fill: { color: PALETTE.cardBg },
    line: { color: PALETTE.borderCyan, width: 1.2 },
    rectRadius: 0.15
  });

  slide.addText('DSSC 1000-POINT SCORING RUBRIC', {
    x: 1.0, y: 1.8, w: 5.3, h: 0.35,
    fontFace: 'Trebuchet MS',
    fontSize: 12,
    bold: true,
    color: PALETTE.borderCyan
  });

  const scoringRows = [
    { title: '1. Early Detection Speed (Max 250 Pts)', detail: 'Awarded for detecting low-RCS targets beyond 1200m using radar or RF spectrogram sweeps.' },
    { title: '2. Threat Classification Accuracy (Max 250 Pts)', detail: 'Correctly identifying drone category and payload (e.g. discriminating FPV from Decoy).' },
    { title: '3. Proportional Engagement & ROE (Max 300 Pts)', detail: 'Applying optimal countermeasure (e.g. RF Jammer for commercial C2; Laser for loitering munitions; CIWS for swarms).' },
    { title: '4. Collateral & Base Protection (Max 200 Pts)', detail: 'Preventing explosive impact inside 100m FOB perimeter and avoiding friendly airspace violations.' },
    { title: 'Violations & Penalties', detail: '-150 Pts for shooting friendly decoys; -100 Pts for weapon overheating / magazine exhaustion.' }
  ];

  let sy = 2.3;
  scoringRows.forEach(sr => {
    slide.addText(sr.title, {
      x: 1.0, y: sy, w: 5.3, h: 0.25,
      fontFace: 'Trebuchet MS',
      fontSize: 10,
      bold: true,
      color: PALETTE.accentGold
    });
    slide.addText(sr.detail, {
      x: 1.0, y: sy + 0.25, w: 5.3, h: 0.45,
      fontFace: 'Arial',
      fontSize: 9,
      color: PALETTE.textLight
    });
    sy += 0.75;
  });

  // Right Side: AAR Dashboard Features
  slide.addShape(pres.ShapeType.roundRect, {
    x: 6.8, y: 1.6, w: 5.7, h: 5.1,
    fill: { color: PALETTE.cardBg },
    line: { color: PALETTE.accentGreen, width: 1.2 },
    rectRadius: 0.15
  });

  slide.addText('AAR STUDIO & UNIT ANALYTICS DASHBOARD', {
    x: 7.0, y: 1.8, w: 5.3, h: 0.35,
    fontFace: 'Trebuchet MS',
    fontSize: 12,
    bold: true,
    color: PALETTE.accentGreen
  });

  slide.addText([
    { text: '• Granular Millisecond Telemetry: ', options: { bold: true, color: PALETTE.accentGold } },
    { text: 'Records timestamped logs of every sensor switch, radar lock, frequency hop, and trigger pull.\n\n', options: { color: PALETTE.textLight } },
    { text: '• 3D Trajectory Replay: ', options: { bold: true, color: PALETTE.accentGold } },
    { text: 'Inspect interception geometry from third-person perspective to analyze missile/shell lead-angle errors.\n\n', options: { color: PALETTE.textLight } },
    { text: '• Cohort & Unit Readiness Tracking: ', options: { bold: true, color: PALETTE.accentGold } },
    { text: 'Tracks platoon-level reaction times over 100+ simulated engagements to spot training plateaus.\n\n', options: { color: PALETTE.textLight } },
    { text: '• Formal Military Debrief Dossiers: ', options: { bold: true, color: PALETTE.accentGold } },
    { text: 'Automated 1-click export of DSSC tactical debrief reports in PDF, CSV, and encrypted JSON formats.\n', options: { color: PALETTE.textLight } }
  ], {
    x: 7.0, y: 2.3, w: 5.3, h: 4.2,
    fontFace: 'Arial',
    fontSize: 10
  });
}

// ==========================================
// SLIDE 7: KEY INNOVATIONS & COMPETITIVE ADVANTAGES
// ==========================================
{
  const slide = addTacticalSlide(
    'Key Innovations & Strategic Differentiation',
    'How ASTRA-CUAS Surpasses Traditional Defence Simulators'
  );

  // Table of Comparison
  const headers = [
    { text: 'Feature Matrix', options: { fill: '0F172A', color: PALETTE.borderCyan, bold: true, fontFace: 'Trebuchet MS', fontSize: 10 } },
    { text: 'Traditional Defence Trainers', options: { fill: '0F172A', color: PALETTE.accentRed, bold: true, fontFace: 'Trebuchet MS', fontSize: 10 } },
    { text: 'ASTRA-CUAS Platform', options: { fill: '0F172A', color: PALETTE.accentGreen, bold: true, fontFace: 'Trebuchet MS', fontSize: 10 } }
  ];

  const rows = [
    [
      { text: 'Hardware Footprint', options: { bold: true, color: PALETTE.textLight } },
      { text: 'Expensive CAVOK domes / custom hydraulic cockpits ($200K+)', options: { color: PALETTE.textMuted } },
      { text: 'Runs on standard defence laptops (Zero specialized hardware)', options: { bold: true, color: PALETTE.accentGreen } }
    ],
    [
      { text: 'Scenario Generation', options: { bold: true, color: PALETTE.textLight } },
      { text: 'Rigid pre-recorded scripted paths (causes rote learning)', options: { color: PALETTE.textMuted } },
      { text: 'Procedural Red-Team AI with Boids Swarms & NOE masking', options: { bold: true, color: PALETTE.accentGreen } }
    ],
    [
      { text: 'Sensor Simulation', options: { bold: true, color: PALETTE.textLight } },
      { text: 'Visual only or simplified 2D radar blips', options: { color: PALETTE.textMuted } },
      { text: 'Multi-Spectral: 3D PPI Radar, RF Waterfall, EO/IR, Acoustic', options: { bold: true, color: PALETTE.accentGreen } }
    ],
    [
      { text: 'Network Architecture', options: { bold: true, color: PALETTE.textLight } },
      { text: 'Requires internet cloud server connections', options: { color: PALETTE.textMuted } },
      { text: '100% Air-Gapped Standalone .exe + Offline Dual-Terminal LAN', options: { bold: true, color: PALETTE.accentGreen } }
    ],
    [
      { text: 'Immersive Headset', options: { bold: true, color: PALETTE.textLight } },
      { text: 'Requires proprietary VR SDKs and external tracker stations', options: { color: PALETTE.textMuted } },
      { text: 'Native WebXR 360° VR for Meta Quest / HTC Vive with 1 click', options: { bold: true, color: PALETTE.accentGreen } }
    ]
  ];

  slide.addTable([headers, ...rows], {
    x: 0.8, y: 1.6, w: 11.7, h: 5.0,
    border: { pt: 1, color: '334155' },
    fill: PALETTE.cardBg,
    fontFace: 'Arial',
    fontSize: 9.5,
    valign: 'middle'
  });
}

// ==========================================
// SLIDE 8: OPERATIONAL IMPACT & COST SAVINGS
// ==========================================
{
  const slide = addTacticalSlide(
    'Operational Impact & Cost Analysis',
    'Massive Multi-Crore Savings for Armed Forces with Unprecedented Repetition Scaling'
  );

  // 4 Metric Highlight Cards
  const stats = [
    { num: '99.4%', label: 'COST REDUCTION', sub: 'vs Live-Fire Drills ($50K/exercise → $0 consumable cost)' },
    { num: '10x', label: 'TRAINING FREQUENCY', sub: 'Troops scale from 2 live drills/yr to 20+ weekly simulations' },
    { num: '60 FPS', label: 'OPTIMIZED PERFORMANCE', sub: 'Instanced foliage & PBR shaders on standard Intel/AMD GPUs' },
    { num: '100%', label: 'AIR-GAPPED READY', sub: 'Zero internet dependencies, compliant with military security' }
  ];

  stats.forEach((st, idx) => {
    const x = 0.8 + idx * 2.98;
    slide.addShape(pres.ShapeType.roundRect, {
      x: x, y: 1.6, w: 2.8, h: 2.2,
      fill: { color: PALETTE.cardBg },
      line: { color: PALETTE.accentGold, width: 1.2 },
      rectRadius: 0.15
    });

    slide.addText(st.num, {
      x: x + 0.1, y: 1.8, w: 2.6, h: 0.6,
      fontFace: 'Trebuchet MS',
      fontSize: 28,
      bold: true,
      color: PALETTE.accentGold,
      align: 'center'
    });

    slide.addText(st.label, {
      x: x + 0.1, y: 2.45, w: 2.6, h: 0.3,
      fontFace: 'Trebuchet MS',
      fontSize: 10,
      bold: true,
      color: PALETTE.borderCyan,
      align: 'center'
    });

    slide.addText(st.sub, {
      x: x + 0.1, y: 2.8, w: 2.6, h: 0.85,
      fontFace: 'Arial',
      fontSize: 9,
      color: PALETTE.textLight,
      align: 'center'
    });
  });

  // Bottom Qualitative Banner
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 4.1, w: 11.7, h: 2.6,
    fill: { color: '0B1528' },
    line: { color: PALETTE.borderCyan, width: 1 },
    rectRadius: 0.15
  });

  slide.addText('STRATEGIC BENEFITS FOR MINISTRY OF DEFENCE & DSSC WELLINGTON', {
    x: 1.0, y: 4.3, w: 11.3, h: 0.35,
    fontFace: 'Trebuchet MS',
    fontSize: 11,
    bold: true,
    color: PALETTE.borderCyan
  });

  slide.addText([
    { text: '• Unit-Level Deployment: ', options: { bold: true, color: PALETTE.accentGold } },
    { text: 'Forward battalions deployed at LAC, LOC, and coastal installations can train daily inside forward bunkers without shipping soldiers to central academies.\n\n', options: { color: PALETTE.textLight } },
    { text: '• Elimination of Safety Hazards: ', options: { bold: true, color: PALETTE.accentGold } },
    { text: 'Zero risk of ricochets, unexploded kinetic shrapnel ordnance, or stray laser eye hazards during high-stress novice instruction.\n\n', options: { color: PALETTE.textLight } },
    { text: '• Objective Doctrinal Standard: ', options: { bold: true, color: PALETTE.accentGold } },
    { text: 'Removes subjective instructor bias through algorithmic 1000-point DSSC decision-tree metrics benchmarked against Tri-Services C-UAS doctrine.\n', options: { color: PALETTE.textLight } }
  ], {
    x: 1.0, y: 4.75, w: 11.3, h: 1.8,
    fontFace: 'Arial',
    fontSize: 9.5
  });
}

// ==========================================
// SLIDE 9: DEVELOPMENT ROADMAP & FUTURE SCOPE
// ==========================================
{
  const slide = addTacticalSlide(
    'Implementation Roadmap & Tri-Services Vision',
    'From Prototype to Full-Scale Defence Induction'
  );

  const phases = [
    {
      x: 0.8,
      phase: 'PHASE 1: CURRENT STATUS (SIH 2026)',
      color: PALETTE.accentGreen,
      items: [
        'Complete React 18 + Three.js simulator engine',
        'Photorealistic PBR terrain & instanced foliage',
        'Autonomous Red-Team NOE and Swarm AI',
        'Multi-Spectral sensor suite (Radar, RF, EO/IR, Acoustic)',
        'Standalone offline Electron .exe package'
      ]
    },
    {
      x: 4.85,
      phase: 'PHASE 2: 3-6 MONTHS (FIELD TRIALS)',
      color: PALETTE.accentGold,
      items: [
        'Live pilot trials at DSSC Wellington & Army Air Defence College',
        'Hardware-in-the-Loop (HIL) integration with physical C-UAS gunner joystick turrets',
        'Multi-player squad tactical defense mode (multi-operator C4I coordination)',
        'Air-Gapped LLM local inference on quantized GGUF models'
      ]
    },
    {
      x: 8.9,
      phase: 'PHASE 3: 12 MONTHS (TRI-SERVICES INDUCTION)',
      color: PALETTE.borderCyan,
      items: [
        'Procurement integration across Indian Army, Air Force, and Navy outposts',
        'Real-world radar telemetry ingestion for mission digital twins',
        'Classified MIL-STD-6016 / Link-16 tactical data link interoperability',
        'Central Army C4I readiness score dashboard'
      ]
    }
  ];

  phases.forEach(p => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: p.x, y: 1.6, w: 3.6, h: 5.1,
      fill: { color: PALETTE.cardBg },
      line: { color: p.color, width: 1.2 },
      rectRadius: 0.15
    });

    slide.addText(p.phase, {
      x: p.x + 0.2, y: 1.8, w: 3.2, h: 0.55,
      fontFace: 'Trebuchet MS',
      fontSize: 10,
      bold: true,
      color: p.color
    });

    const bulletList = p.items.map(it => `✓ ${it}\n\n`).join('');
    slide.addText(bulletList, {
      x: p.x + 0.2, y: 2.5, w: 3.2, h: 4.0,
      fontFace: 'Arial',
      fontSize: 9.5,
      color: PALETTE.textLight
    });
  });
}

// ==========================================
// SLIDE 10: CONCLUSION & DEMONSTRATION
// ==========================================
{
  const slide = addTacticalSlide(
    'Conclusion & Operational Readiness',
    'Empowering the Armed Forces to Dominate the Drone-Contested Battlespace'
  );

  slide.addShape(pres.ShapeType.roundRect, {
    x: 1.5, y: 1.6, w: 10.33, h: 4.2,
    fill: { color: PALETTE.cardBg },
    line: { color: PALETTE.borderCyan, width: 1.5 },
    rectRadius: 0.2
  });

  slide.addText('READY FOR LIVE DEMONSTRATION & INDUCTION', {
    x: 2.0, y: 1.9, w: 9.33, h: 0.45,
    fontFace: 'Trebuchet MS',
    fontSize: 18,
    bold: true,
    color: PALETTE.borderCyan,
    align: 'center'
  });

  slide.addText([
    { text: 'ASTRA-CUAS addresses every critical criterion defined by the Ministry of Defence:\n\n', options: { bold: true, color: PALETTE.accentGold } },
    { text: '✔ Minimal Specialized Hardware: ', options: { bold: true, color: PALETTE.accentGreen } },
    { text: 'Zero external sensors or supercomputers needed; operational on standard issue field laptops.\n\n', options: { color: PALETTE.textLight } },
    { text: '✔ Randomized & Procedural Threats: ', options: { bold: true, color: PALETTE.accentGreen } },
    { text: 'Prevents rote learning with autonomous Red-Team AI mimicking real enemy tactics.\n\n', options: { color: PALETTE.textLight } },
    { text: '✔ Objective Decision-Tree Scoring: ', options: { bold: true, color: PALETTE.accentGreen } },
    { text: 'Tracks individual and battalion operational readiness over repeated sessions.\n\n', options: { color: PALETTE.textLight } },
    { text: '✔ 100% Offline Air-Gapped Security: ', options: { bold: true, color: PALETTE.accentGreen } },
    { text: 'Safeguards sensitive military tactics, operational protocols, and scoring telemetry on-premise.\n', options: { color: PALETTE.textLight } }
  ], {
    x: 2.0, y: 2.4, w: 9.33, h: 3.2,
    fontFace: 'Arial',
    fontSize: 11
  });

  // Call to Action Box
  slide.addShape(pres.ShapeType.roundRect, {
    x: 3.5, y: 6.0, w: 6.33, h: 0.7,
    fill: { color: '0F172A' },
    line: { color: PALETTE.accentGold, width: 1.2 },
    rectRadius: 0.1
  });

  slide.addText('THANK YOU | OPEN FOR DIRECTING STAFF QUESTIONS & LIVE DEMO', {
    x: 3.5, y: 6.18, w: 6.33, h: 0.35,
    fontFace: 'Trebuchet MS',
    fontSize: 11,
    bold: true,
    color: PALETTE.accentGold,
    align: 'center'
  });
}

// Generate the PPTX File
const outputPath = path.resolve(__dirname, '..', 'ASTRA_CUAS_SIH2026_Official_Presentation.pptx');
pres.writeFile({ fileName: outputPath })
  .then(fileName => {
    console.log(`[SUCCESS] Official SIH 2026 PowerPoint Presentation successfully created at:\n${fileName}`);
  })
  .catch(err => {
    console.error(`[ERROR] Failed to create PPTX file:`, err);
    process.exit(1);
  });

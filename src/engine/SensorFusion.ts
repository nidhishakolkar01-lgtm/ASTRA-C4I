import { DroneInstance, DroneSpec, WeatherType, TimeOfDay, SensorMode } from '../types/simulation';

export interface RadarContact {
  id: string;
  azimuthDeg: number; // 0 - 360 degrees
  elevationDeg: number;
  rangeMeters: number;
  radialVelocity: number; // m/s
  rcsEstimate: number; // m^2
  signalToNoiseRatio: number; // dB
  isFriendOrFoe: 'UNKNOWN' | 'HOSTILE' | 'FRIENDLY' | 'CIVILIAN_FALSE_ALARM';
  blipAge: number; // for phosphor decay
}

export interface RFSignalContact {
  id: string;
  centerFrequencyMHz: number;
  bandwidthMHz: number;
  rssiDb: number; // -100 to -30 dBm
  bearingDeg: number;
  protocolDetected: string;
  isFrequencyHopping: boolean;
}

export interface AcousticContact {
  bearingDeg: number;
  elevationDeg: number;
  estimatedRpm: number;
  soundPressureLevelDb: number;
  motorType: 'Piston Engine (2-Stroke)' | 'Electric Multirotor' | 'Turbine / High-Speed Prop';
}

export class SensorFusionEngine {
  /**
   * Compute Primary Radar Scan Contacts
   */
  static computeRadarContacts(
    drones: DroneInstance[],
    specs: Record<string, DroneSpec>,
    radarJammingLevel: number,
    weather: WeatherType,
    sweepAngleDeg: number
  ): RadarContact[] {
    const contacts: RadarContact[] = [];

    // Weather attenuation factor (dB/km)
    let weatherLoss = 1.0;
    if (weather === 'heavy_rain') weatherLoss = 1.4;
    if (weather === 'sandstorm') weatherLoss = 1.6;

    for (const drone of drones) {
      if (drone.status === 'destroyed' || drone.status === 'captured') continue;

      const spec = specs[drone.specId];
      if (!spec) continue;

      const [x, y, z] = drone.position;
      const range = Math.sqrt(x * x + y * y + z * z);
      
      // Calculate Azimuth (0 deg = North/-Z, 90 deg = East/+X)
      let azimuth = (Math.atan2(x, -z) * (180 / Math.PI) + 360) % 360;
      let elevation = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);

      // Radar Cross Section SNR Calculation (Radar range equation proxy)
      // Base radar range ~3000m for 1m^2 RCS
      const effectiveRCS = spec.rcs;
      const rangeRatio = (range * weatherLoss) / 2500;
      const rawSNR = (effectiveRCS * 1000) / Math.pow(rangeRatio, 3.5);
      
      // Jamming reduces SNR and injects noise floor
      const noiseFloor = 10 + radarJammingLevel * 60;
      const snr = Math.max(0, rawSNR - noiseFloor);

      // Detection threshold: SNR > 12 dB
      const isDetected = snr > 12;

      if (isDetected) {
        // Calculate radial velocity
        const [vx, vy, vz] = drone.velocity;
        const radialVel = (x * vx + y * vy + z * vz) / (range || 1);

        // Blip age based on clockwise sweep lag (authentic PPI phosphor decay)
        const sweepLag = (sweepAngleDeg - azimuth + 360) % 360;
        const blipAge = Math.min(1.0, sweepLag / 270);

        contacts.push({
          id: drone.instanceId,
          azimuthDeg: Math.round(azimuth),
          elevationDeg: Math.round(elevation),
          rangeMeters: Math.round(range),
          radialVelocity: Math.round(radialVel),
          rcsEstimate: Number(effectiveRCS.toFixed(3)),
          signalToNoiseRatio: Math.round(snr),
          isFriendOrFoe: spec.category === 'decoy_drone' ? 'UNKNOWN' : 'HOSTILE',
          blipAge
        });
      }
    }

    return contacts;
  }

  /**
   * Compute RF Direction Finding & Spectrum Analyzer Contacts
   */
  static computeRFContacts(
    drones: DroneInstance[],
    specs: Record<string, DroneSpec>,
    rfNoiseLevel: number
  ): RFSignalContact[] {
    const contacts: RFSignalContact[] = [];

    for (const drone of drones) {
      if (drone.status === 'destroyed' || drone.status === 'captured') continue;
      if (!drone.rfLinkActive) continue;

      const spec = specs[drone.specId];
      if (!spec || spec.rfFrequencies.length === 0) continue;

      const [x, , z] = drone.position;
      const range = Math.sqrt(x * x + z * z);
      const bearing = (Math.atan2(x, -z) * (180 / Math.PI) + 360) % 360;

      // Free space path loss proxy: RSSI from -30 dBm (close) to -95 dBm (far)
      const rawRssi = -30 - 20 * Math.log10(Math.max(10, range));
      const effectiveRssi = rawRssi - rfNoiseLevel * 15;

      if (effectiveRssi > -95) {
        const primaryFreq = spec.rfFrequencies[0];
        let protocol = 'OcuSync 4 / FHSS (Encrypted)';
        let isHopping = true;

        if (primaryFreq === 5800) {
          protocol = 'Analog 5.8GHz VTX (Direct Video Link)';
          isHopping = false;
        } else if (primaryFreq === 868 || primaryFreq === 915) {
          protocol = 'ExpressLRS / Crossfire RC (Telemetry)';
          isHopping = true;
        } else if (primaryFreq === 1575.42) {
          protocol = 'L1 GPS/Galileo Satellite Downlink';
          isHopping = false;
        }

        contacts.push({
          id: drone.instanceId,
          centerFrequencyMHz: primaryFreq,
          bandwidthMHz: primaryFreq > 2000 ? 20 : 2,
          rssiDb: Math.round(effectiveRssi),
          bearingDeg: Math.round(bearing),
          protocolDetected: protocol,
          isFrequencyHopping: isHopping
        });
      }
    }

    return contacts;
  }

  /**
   * Compute Acoustic Direction Finding
   */
  static computeAcousticBearing(
    drones: DroneInstance[],
    specs: Record<string, DroneSpec>
  ): AcousticContact | null {
    // Return the closest loudest audible drone
    let loudestContact: AcousticContact | null = null;
    let maxAudibleDb = 0;

    for (const drone of drones) {
      if (drone.status === 'destroyed' || drone.status === 'captured') continue;
      const spec = specs[drone.specId];
      if (!spec) continue;

      const [x, y, z] = drone.position;
      const range = Math.sqrt(x * x + y * y + z * z);
      const bearing = (Math.atan2(x, -z) * (180 / Math.PI) + 360) % 360;
      const elevation = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);

      // Acoustic inverse square decay
      const receivedDb = spec.acousticDb - 20 * Math.log10(Math.max(1, range / 50));

      if (receivedDb > 25 && receivedDb > maxAudibleDb) {
        maxAudibleDb = receivedDb;
        
        let motorType: AcousticContact['motorType'] = 'Electric Multirotor';
        let estimatedRpm = 4800;

        if (spec.category === 'loitering_munition') {
          motorType = 'Piston Engine (2-Stroke)';
          estimatedRpm = 6200;
        } else if (spec.category === 'fpv_kamikaze') {
          motorType = 'Turbine / High-Speed Prop';
          estimatedRpm = 18500;
        }

        loudestContact = {
          bearingDeg: Math.round(bearing),
          elevationDeg: Math.round(elevation),
          estimatedRpm,
          soundPressureLevelDb: Math.round(receivedDb),
          motorType
        };
      }
    }

    return loudestContact;
  }

  /**
   * Optical / Thermal Sensor Visibility Check
   */
  static calculateOpticalVisibility(
    drone: DroneInstance,
    spec: DroneSpec,
    sensorMode: SensorMode,
    weather: WeatherType,
    timeOfDay: TimeOfDay
  ): {
    isVisible: boolean;
    contrastRatio: number; // 0 to 1
    thermalTempCelsius: number;
    recommendedModeNotice?: string;
  } {
    const [x, y, z] = drone.position;
    const distance = Math.sqrt(x * x + y * y + z * z);

    let maxVisualRange = 1600; // daylight clear
    let thermalTemp = 24 + spec.thermalSignature * 65; // 24C ambient up to 89C for hot engines

    if (weather === 'foggy') maxVisualRange *= 0.35;
    if (weather === 'heavy_rain') maxVisualRange *= 0.45;
    if (weather === 'sandstorm') maxVisualRange *= 0.25;

    let contrast = 0.8;

    if (sensorMode === 'daylight') {
      if (timeOfDay === 'night') {
        maxVisualRange *= 0.15; // pitch dark daylight camera
        contrast = 0.1;
      } else if (timeOfDay === 'dusk') {
        maxVisualRange *= 0.6;
        contrast = 0.5;
      }
    } else if (sensorMode === 'nvg') {
      if (timeOfDay === 'night' || timeOfDay === 'dusk') {
        maxVisualRange *= 0.75; // NVG amplification
        contrast = 0.85;
      } else {
        contrast = 0.3; // bloomed in daylight
      }
    } else if (sensorMode.startsWith('flir_')) {
      // Thermal sees through night and moderate fog
      const thermalRangeMultiplier = weather === 'foggy' ? 0.75 : 0.95;
      maxVisualRange = 1800 * thermalRangeMultiplier;
      contrast = Math.min(1.0, 0.4 + spec.thermalSignature * 0.7);
    }

    const isVisible = distance <= maxVisualRange;

    return {
      isVisible,
      contrastRatio: isVisible ? contrast * Math.max(0.2, 1 - distance / maxVisualRange) : 0,
      thermalTempCelsius: Math.round(thermalTemp)
    };
  }
}

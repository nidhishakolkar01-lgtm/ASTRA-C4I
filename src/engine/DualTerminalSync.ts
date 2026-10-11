/**
 * Instructor-Trainee Dual Terminal Synchronization Engine (Multiplayer / LAN)
 * Uses BroadcastChannel + LAN WebRTC/Storage messaging for real-time instructor injection
 */

export interface DualTerminalMessage {
  type: 
    | 'INJECT_JAMMING'
    | 'SPAWN_SURPRISE_DECOY'
    | 'TRIGGER_SWARM_PINCER'
    | 'ALTER_WEATHER'
    | 'SEND_INSTRUCTOR_DISPATCH'
    | 'OVERRIDE_WEAPON_LOCK'
    | 'TRAINEE_TELEMETRY'
    | 'PING';
  sender: 'INSTRUCTOR' | 'TRAINEE';
  payload: any;
  timestamp: number;
}

class DualTerminalSyncEngine {
  private channel: BroadcastChannel | null = null;
  private listeners: ((msg: DualTerminalMessage) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('astra_cuas_dual_terminal');
      this.channel.onmessage = (event) => {
        const msg = event.data as DualTerminalMessage;
        this.notifyListeners(msg);
      };
    }
  }

  public subscribe(callback: (msg: DualTerminalMessage) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(msg: DualTerminalMessage) {
    this.listeners.forEach(l => l(msg));
  }

  public sendMessage(type: DualTerminalMessage['type'], payload: any, sender: 'INSTRUCTOR' | 'TRAINEE' = 'INSTRUCTOR') {
    const msg: DualTerminalMessage = {
      type,
      sender,
      payload,
      timestamp: Date.now()
    };

    if (this.channel) {
      this.channel.postMessage(msg);
    }

    // Also trigger local listeners
    this.notifyListeners(msg);
  }

  // Instructor Commands
  public injectJamming(level: number = 0.6) {
    this.sendMessage('INJECT_JAMMING', { jammingLevel: level });
  }

  public spawnSurpriseDecoy(bearingDeg: number = 180) {
    this.sendMessage('SPAWN_SURPRISE_DECOY', { bearingDeg, distance: 950 });
  }

  public triggerSwarmPincer() {
    this.sendMessage('TRIGGER_SWARM_PINCER', { swarmSize: 4 });
  }

  public alterWeather(weather: string, timeOfDay: string) {
    this.sendMessage('ALTER_WEATHER', { weather, timeOfDay });
  }

  public sendDispatch(message: string) {
    this.sendMessage('SEND_INSTRUCTOR_DISPATCH', { message });
  }

  public sendTraineeTelemetry(telemetry: any) {
    this.sendMessage('TRAINEE_TELEMETRY', telemetry, 'TRAINEE');
  }
}

export const dualTerminalSync = new DualTerminalSyncEngine();

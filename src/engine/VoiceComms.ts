/**
 * Tactical AI Voice Synthesis & Military Radio Chatter Engine
 * Simulates tactical VHF/UHF radio comms with natural, human-like neural voices
 */
export class VoiceCommsEngine {
  private isEnabled: boolean = true;
  private volume: number = 0.85;
  private voice: SpeechSynthesisVoice | null = null;
  private audioCtx: AudioContext | null = null;
  private lastSpokenTime: number = 0;
  private lastSpokenText: string = '';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => this.initVoices();
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Filter for English voices
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));

    // Priority 1: High-fidelity Natural / Neural human voices (Microsoft Online Natural, Google Neural, Edge Neural)
    const naturalHumanVoice = englishVoices.find(v => {
      const name = v.name.toLowerCase();
      return (
        (name.includes('natural') || name.includes('neural') || name.includes('online')) &&
        !name.includes('david')
      );
    });

    // Priority 2: Clear studio human voices (Google US/UK, Guy, Christopher, Aria, Jenny, Sonia, Ryan)
    const studioHumanVoice = englishVoices.find(v => {
      const name = v.name.toLowerCase();
      return (
        name.includes('google us english') ||
        name.includes('google uk english') ||
        name.includes('guy') ||
        name.includes('christopher') ||
        name.includes('aria') ||
        name.includes('jenny') ||
        name.includes('ryan') ||
        name.includes('samantha') ||
        name.includes('daniel')
      );
    });

    // Priority 3: Non-David modern English voice (Zira, Mark, Hazel, etc.)
    const fallbackEnglishVoice = englishVoices.find(v => !v.name.toLowerCase().includes('david'));

    this.voice = naturalHumanVoice || studioHumanVoice || fallbackEnglishVoice || englishVoices[0] || voices[0] || null;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public cancel() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Play tactical radio squelch static burst before and after voice transmissions
   */
  private playRadioSquelch(type: 'open' | 'close') {
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const dur = type === 'open' ? 0.05 : 0.07;
      const bufferSize = Math.floor(this.audioCtx.sampleRate * dur);
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = this.audioCtx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1600;
      bandpass.Q.value = 2.5;

      const gain = this.audioCtx.createGain();
      gain.gain.value = 0.03 * this.volume;

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(this.audioCtx.destination);

      noise.start();
    } catch {
      // Audio fallback
    }
  }

  /**
   * Speak a tactical message with natural, human-like voice synthesis
   */
  public speak(message: string, priority: 'normal' | 'urgent' = 'normal') {
    if (!this.isEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const now = Date.now();
    // Prevent repeating identical callouts within 4 seconds
    if (message === this.lastSpokenText && now - this.lastSpokenTime < 4000) {
      return;
    }

    if (priority === 'urgent' || message.includes('Simulation complete')) {
      window.speechSynthesis.cancel(); // Clear any pending speech queue immediately
    } else if (window.speechSynthesis.speaking) {
      // Don't flood the speech queue if non-urgent
      return;
    }

    this.lastSpokenText = message;
    this.lastSpokenTime = now;

    this.playRadioSquelch('open');

    // Ensure voices are initialized
    if (!this.voice) {
      this.initVoices();
    }

    const utterance = new SpeechSynthesisUtterance(message);
    if (this.voice) {
      utterance.voice = this.voice;
    }

    // Natural human cadence and pitch
    utterance.rate = priority === 'urgent' ? 1.05 : 1.0;
    utterance.pitch = 1.0; // Natural 1.0 pitch avoids robotic distortion
    utterance.volume = this.volume;

    utterance.onend = () => {
      this.playRadioSquelch('close');
    };

    utterance.onerror = () => {
      // Graceful error fallback
    };

    window.speechSynthesis.speak(utterance);
  }

  // Common Tactical Callouts
  public calloutRadarLock(trackId: string, range: number) {
    this.speak(`Early warning contact. Track ${trackId.replace('_', ' ')} acquired at ${range} meters.`, 'normal');
  }

  public calloutThreatNeutralized(threatName: string, weapon: string) {
    this.speak(`Splash one hostile. ${threatName} neutralized with ${weapon}.`, 'normal');
  }

  public calloutROEViolation() {
    this.speak(`Warning! Rules of engagement breach! High collateral risk in urban sector!`, 'urgent');
  }

  public calloutBaseBreach(damagePct: number) {
    this.speak(`Perimeter breach! Protected asset sustained ${damagePct} percent damage! Point defence active!`, 'urgent');
  }

  public calloutSwarmAlert(count: number) {
    this.speak(`Tactical alert. Coordinated swarm of ${count} hostile drones converging on base.`, 'urgent');
  }

  public calloutInstructorIntercom(text: string) {
    this.speak(`Instructor transmission: ${text}`, 'urgent');
  }
}

export const voiceComms = new VoiceCommsEngine();

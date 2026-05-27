import { Track } from '../types';

class AudioEngineClass {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  
  private trackerInterval: any = null;
  private isRunning = false;
  private currentTrack: Track | null = null;
  private playbackPosition = 0; // in seconds
  private lastScheduledTime = 0;
  private stepDuration = 0.15; // default for 100 bpm 16th notes
  private currentStep = 0;
  private lookAheadTime = 0.1; // 100ms
  private scheduleAheadTime = 0.2; // 200ms
  private nextNoteTime = 0.0;
  
  private volume = 0.8;
  
  // Subscribers for state changes
  private stateChangeCallbacks: Set<(state: any) => void> = new Set();

  constructor() {
    // Lazy initialized on first user interaction to satisfy browser policies
  }

  private initContext() {
    if (this.ctx) return;
    
    // Create audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.error('Web Audio API not supported');
      return;
    }
    
    this.ctx = new AudioContextClass();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    
    // Connections: Synth Nodes -> MasterGain -> Analyser -> Destination
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  public getAnalyser(): AnalyserNode | null {
    this.initContext();
    return this.analyser;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    this.notify();
  }

  public getVolume(): number {
    return this.volume;
  }

  public togglePlay(track: Track) {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isRunning) {
      if (this.currentTrack?.id === track.id) {
        // Pause
        this.pause();
        return;
      } else {
        // Change track
        this.pause();
        this.currentTrack = track;
        this.playbackPosition = 0;
        this.currentStep = 0;
        this.play();
      }
    } else {
      this.currentTrack = track;
      this.play();
    }
  }

  public play() {
    if (!this.currentTrack) return;
    this.initContext();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isRunning = true;
    this.nextNoteTime = this.ctx.currentTime;
    
    // We run a scheduling loop
    this.trackerInterval = setInterval(() => {
      this.scheduler();
    }, 50);

    this.notify();
  }

  public pause() {
    this.isRunning = false;
    if (this.trackerInterval) {
      clearInterval(this.trackerInterval);
      this.trackerInterval = null;
    }
    this.notify();
  }

  public stop() {
    this.pause();
    this.playbackPosition = 0;
    this.currentStep = 0;
    this.currentTrack = null;
    this.notify();
  }

  public getTrackProgress(): number {
    // Mock duration is say 16 bars cyclic (approx 20 seconds loop, scaling to standard progress overlay)
    // We can simulate an infinite smooth loop with a display duration of the track's target duration
    return this.playbackPosition;
  }

  public getCurrentTrack(): Track | null {
    return this.currentTrack;
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  // Scheduler using high precision audio context clock
  private scheduler() {
    if (!this.ctx || !this.currentTrack) return;

    // Convert BPM to 16th note step duration (4 steps per beat)
    const bpm = this.currentTrack.bpm;
    this.stepDuration = 60.0 / bpm / 4.0;

    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentStep, this.nextNoteTime);
      this.advanceNote();
    }

    // Update real-time progress for visual tracking in components
    this.playbackPosition += 0.05;
    this.notify();
  }

  private advanceNote() {
    this.nextNoteTime += this.stepDuration;
    this.currentStep = (this.currentStep + 1) % 32; // 32 steps = 2 bars loop
  }

  // Simple synthesis models to play highly stylized backing beats & melodies
  private scheduleNote(step: number, time: number) {
    if (!this.ctx || !this.masterGain || !this.currentTrack) return;

    const style = this.currentTrack.synthStyle;
    
    // Common Drum Elements
    const isKick = step === 0 || step === 12 || step === 16 || step === 26 || (style === 'hyperpop' && step % 4 === 0);
    const isSnare = step === 8 || step === 24;
    const isHat = style === 'hyperpop' ? (step % 2 === 0) : (step % 2 === 1 || step % 4 === 0);

    // Dynamic Kick Drum
    if (isKick) {
      this.triggerKick(time);
    }

    // Dynamic Snare/Rim
    if (isSnare) {
      if (style === 'lofi_chill') {
        this.triggerRim(time);
      } else {
        this.triggerSnare(time);
      }
    }

    // Hi-hat Clicks (tick/metal sound)
    if (isHat) {
      this.triggerHats(time, style === 'ambient_trap' && step % 3 === 0 ? 0.2 : 0.08);
    }

    // Melodic/Harmonic Chords & Baselines
    // Schedule melodic elements on key step grids
    if (step % 8 === 0) {
      const barNum = Math.floor(step / 8);
      this.triggerHarmony(barNum, time, style);
    }

    // Sizzling arpeggios for cyber/hyperpop styles
    if (style === 'hyperpop' && step % 2 === 0) {
      this.triggerArp(step, time);
    } else if (style === 'cyber_electro' && step % 4 === 2) {
      this.triggerBassline(step, time);
    }
  }

  private triggerKick(time: number) {
    if (!this.ctx || !this.masterGain) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    // Pitch sweep
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.3);
    
    // Volume envelope
    gain.gain.setValueAtTime(1.2, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
    
    osc.start(time);
    osc.stop(time + 0.35);
  }

  private triggerRim(time: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.frequency.setValueAtTime(800, time);
    osc.frequency.exponentialRampToValueAtTime(300, time + 0.05);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.06);

    osc.start(time);
    osc.stop(time + 0.08);
  }

  private triggerSnare(time: number) {
    if (!this.ctx || !this.masterGain) return;

    // White Noise Simulation for snare snap
    const bufferSize = this.ctx.sampleRate * 0.15; // 150ms length
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    // Tonal snap underneath noise
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    
    oscGain.gain.setValueAtTime(0.4, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.15);
    osc.start(time);
    osc.stop(time + 0.15);
  }

  private triggerHats(time: number, durnSec: number = 0.05) {
    if (!this.ctx || !this.masterGain) return;

    // Short metallic noise
    const bufferSize = this.ctx.sampleRate * durnSec;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(styleVolumeHat(this.currentTrack?.synthStyle), time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + durnSec - 0.01);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + durnSec);
  }

  private triggerHarmony(barNum: number, time: number, style: string) {
    if (!this.ctx || !this.masterGain) return;

    // Beautiful harmonic pad chord sequences
    // Chords selected by style (4 bar cyclic chord progressions)
    let freqs: number[] = [];
    
    if (style === 'ambient_trap') {
      // Key G min: Bar 0: Gm, Bar 1: EbMaj, Bar 2: Cm, Bar 3: Dm
      const chords = [
        [196.00, 233.08, 293.66], // G3, Bb3, D4
        [155.56, 196.00, 233.08], // Eb3, G3, Bb3
        [130.81, 155.56, 196.00], // C3, Eb3, G3
        [146.83, 174.61, 220.00]  // D3, F3, A3
      ];
      freqs = chords[barNum % 4];
    } else if (style === 'lofi_chill') {
      // Key C Maj7 -> Amin7 -> FMaj7 -> G7 with cozy mellow filter
      const chords = [
        [130.81, 164.81, 196.00, 246.94], // C3, E3, G3, B3
        [110.00, 130.81, 164.81, 196.00], // A2, C3, E3, G3
        [87.31, 130.81, 174.61, 220.00],  // F2, C3, F3, A3
        [98.00, 146.83, 196.00, 246.94]   // G2, D3, G3, B3
      ];
      freqs = chords[barNum % 4];
    } else if (style === 'hyperpop') {
      // Key D min: Dm -> BbMaj -> FMaj -> Cmaj (upbeat progression)
      const chords = [
        [146.83, 174.61, 220.00], // D3, F3, A3
        [116.54, 146.83, 185.00], // Bb2, D3, F3
        [174.61, 220.00, 261.63], // F3, A3, C4
        [130.81, 164.81, 196.00]  // C3, E3, G3
      ];
      freqs = chords[barNum % 4];
    } else { // cyber_electro
      // Key E min: Em -> Cmaj -> Dmaj -> Bm
      const chords = [
        [164.81, 196.00, 246.94], // E3, G3, B3
        [130.81, 164.81, 196.00], // C3, E3, G3
        [146.83, 185.00, 220.00], // D3, F#3, A3
        [123.47, 146.83, 185.00]  // B2, D3, F#3
      ];
      freqs = chords[barNum % 4];
    }

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(style === 'lofi_chill' ? 450 : 1200, time);
    filter.Q.value = 1.0;
    filter.connect(this.masterGain);

    freqs.forEach(freq => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = style === 'cyber_electro' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      // Soft swelling chords
      oscGain.gain.setValueAtTime(0.001, time);
      oscGain.gain.linearRampToValueAtTime(0.12, time + 0.15);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, time + 1.15);

      osc.connect(oscGain);
      oscGain.connect(filter);

      osc.start(time);
      osc.stop(time + 1.25);
    });
  }

  // Fast synth melody line for hyperpop
  private triggerArp(step: number, time: number) {
    if (!this.ctx || !this.masterGain || !this.currentTrack) return;

    // Upbeat notes based on bar progression
    const arpNotes = [293.66, 329.63, 349.23, 392.00, 440.00, 523.25, 587.33, 659.25];
    const pitch = arpNotes[(step + Math.floor(this.playbackPosition / 4)) % arpNotes.length];

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(pitch, time);

    oscGain.gain.setValueAtTime(0.04, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, time);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  // Running bouncy basslines for electro
  private triggerBassline(step: number, time: number) {
    if (!this.ctx || !this.masterGain) return;

    // E2, G2, A2 or B2 depending on pattern
    const notes = [82.41, 98.00, 110.00, 123.47];
    const pitch = notes[Math.floor(step / 8) % notes.length];

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(pitch, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, time);

    oscGain.gain.setValueAtTime(0.18, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  // Pub/Sub system
  public subscribe(callback: (state: any) => void) {
    this.stateChangeCallbacks.add(callback);
    return () => {
      this.stateChangeCallbacks.delete(callback);
    };
  }

  private notify() {
    const state = {
      isPlaying: this.isRunning,
      currentTrack: this.currentTrack,
      volume: this.volume,
      progress: this.playbackPosition
    };
    this.stateChangeCallbacks.forEach(cb => cb(state));
  }
}

function styleVolumeHat(style: string | undefined): number {
  if (!style) return 0.05;
  switch (style) {
    case 'ambient_trap': return 0.12;
    case 'lofi_chill': return 0.04;
    case 'hyperpop': return 0.08;
    case 'cyber_electro': return 0.07;
    default: return 0.05;
  }
}

export const AudioEngine = new AudioEngineClass();
export default AudioEngine;

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
  
  private audioEl: HTMLAudioElement | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;

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

  private initAudioElement() {
    if (this.audioEl) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.audioEl = new Audio();
    this.audioEl.crossOrigin = "anonymous";
    this.audioEl.loop = true;

    try {
      this.mediaSource = this.ctx.createMediaElementSource(this.audioEl);
      this.mediaSource.connect(this.masterGain);
    } catch (e) {
      console.warn("Failed to create media source node (likely already created or restricted)", e);
    }

    // sync playing state events
    this.audioEl.onplay = () => {
      this.isRunning = true;
      this.notify();
    };
    this.audioEl.onpause = () => {
      this.isRunning = false;
      this.notify();
    };
    this.audioEl.onended = () => {
      this.isRunning = false;
      this.notify();
    };
    this.audioEl.onerror = () => {
      console.warn("AudioEngine: Audio source error. Recovering with fallback stream...");
      if (this.audioEl && !this.audioEl.src.includes('actions.google.com')) {
        this.audioEl.src = 'https://actions.google.com/sounds/v1/music/synth_funk.ogg';
        this.audioEl.load();
        this.audioEl.play().catch(() => {});
      }
    };
    this.audioEl.ontimeupdate = () => {
      if (this.audioEl && this.currentTrack?.beatUrl) {
        this.playbackPosition = this.audioEl.currentTime;
        this.notify();
      }
    };
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
    if (this.audioEl) {
      // Direct element backup volume sync
      this.audioEl.volume = this.volume;
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

    // Must have a beatUrl now since synth fallback is removed
    if (this.currentTrack.beatUrl) {
      this.initAudioElement();
      if (this.audioEl) {
        let targetUrl = this.currentTrack.beatUrl;
        
        // Transform common links to direct audio links
        if (targetUrl.includes('dropbox.com')) {
          targetUrl = targetUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '').replace('&dl=0', '');
        } else if (targetUrl.includes('drive.google.com')) {
          const idMatch = targetUrl.match(/\/d\/([^/]+)/);
          if (idMatch) {
            targetUrl = `https://docs.google.com/uc?export=download&id=${idMatch[1]}`;
          }
        } else if (targetUrl.includes('catbox.moe') && !targetUrl.includes('files.catbox.moe')) {
          // Handle if user pastes the view link instead of direct file link
          targetUrl = targetUrl.replace('catbox.moe', 'files.catbox.moe');
        }

        // Ensure protocol for common hosts if missing
        if (targetUrl.startsWith('files.catbox.moe')) {
          targetUrl = 'https://' + targetUrl;
        }

        if (!targetUrl || targetUrl.length < 5) {
          console.error("AudioEngine: Invalid beatUrl found for track:", {
            id: this.currentTrack.id,
            title: this.currentTrack.title,
            url: targetUrl
          });
          this.pause();
          return;
        }

        if (this.audioEl.src !== targetUrl) {
          console.log("AudioEngine: Loading source", targetUrl, "for track:", this.currentTrack.title);
          this.audioEl.src = targetUrl;
          this.audioEl.load();
        }
        
        this.audioEl.play().catch(err => {
          console.warn("AudioEngine Playback notice:", err?.message || err);
          if (this.audioEl) {
            this.audioEl.removeAttribute('crossOrigin');
            this.audioEl.play().catch(() => {
              if (this.audioEl) {
                this.audioEl.src = 'https://actions.google.com/sounds/v1/music/synth_funk.ogg';
                this.audioEl.load();
                this.audioEl.play().catch(finalErr => {
                  console.warn("Fallback playback also restricted:", finalErr?.message);
                });
              }
            });
          }
        });
      }
      this.isRunning = true;
      this.notify();
    }
  }

  public pause() {
    this.isRunning = false;
    
    // Pause element audio if loaded
    if (this.audioEl) {
      this.audioEl.pause();
    }

    this.notify();
  }

  public stop() {
    this.pause();
    this.playbackPosition = 0;
    this.currentStep = 0;
    this.currentTrack = null;
    if (this.audioEl) {
      this.audioEl.currentTime = 0;
    }
    this.notify();
  }

  public seek(time: number) {
    if (this.audioEl) {
      this.audioEl.currentTime = time;
      this.playbackPosition = time;
      this.notify();
    }
  }

  public getTrackProgress(): number {
    return this.playbackPosition;
  }

  public getCurrentTrack(): Track | null {
    return this.currentTrack;
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
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

export const AudioEngine = new AudioEngineClass();
export default AudioEngine;

import { Track } from '../types';

class AudioEngineClass {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  
  private isRunning = false;
  private currentTrack: Track | null = null;
  private playbackPosition = 0; // in seconds
  private volume = 0.8;
  
  private audioEl: HTMLAudioElement | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private isUnlocked = false;

  // Subscribers for state changes
  private stateChangeCallbacks: Set<(state: any) => void> = new Set();

  constructor() {
    // Set up global touch/click audio unlocking for mobile devices (iOS Safari / Android)
    if (typeof window !== 'undefined') {
      const unlockEvents = ['touchstart', 'touchend', 'click', 'keydown'];
      const unlockHandler = () => {
        this.unlockAudio();
        unlockEvents.forEach(evt => window.removeEventListener(evt, unlockHandler));
      };
      unlockEvents.forEach(evt => window.addEventListener(evt, unlockHandler, { once: true, passive: true }));
    }
  }

  public unlockAudio() {
    if (this.isUnlocked) return;
    this.initContext();
    this.initAudioElement();

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    // Mobile audio silent buffer unlock
    if (this.ctx) {
      try {
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        source.start(0);
      } catch (e) {
        // Ignore silent buffer failure
      }
    }

    this.isUnlocked = true;
  }

  private initContext() {
    if (this.ctx) return;
    
    // Create audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('Web Audio API not supported on this browser');
      return;
    }
    
    try {
      this.ctx = new AudioContextClass();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      
      // Connections: MediaSource -> MasterGain -> Analyser -> Destination
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    } catch (err) {
      console.warn('Could not initialize AudioContext:', err);
    }
  }

  private initAudioElement() {
    if (this.audioEl) return;

    this.audioEl = new Audio();
    this.audioEl.setAttribute('playsinline', 'true');
    this.audioEl.setAttribute('webkit-playsinline', 'true');
    (this.audioEl as any).playsInline = true;
    this.audioEl.preload = 'auto';
    this.audioEl.loop = true;
    this.audioEl.volume = this.volume;

    // Connect to WebAudio graph if supported and not already connected
    if (this.ctx && this.masterGain && !this.mediaSource) {
      try {
        // Try setting crossOrigin for analyzer FFT data
        this.audioEl.crossOrigin = 'anonymous';
        this.mediaSource = this.ctx.createMediaElementSource(this.audioEl);
        this.mediaSource.connect(this.masterGain);
      } catch (e) {
        console.warn('Direct media element output enabled (media source bypass):', e);
      }
    }

    // Event listeners
    this.audioEl.onplay = () => {
      this.isRunning = true;
      this.notify();
    };

    this.audioEl.onplaying = () => {
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

    this.audioEl.ontimeupdate = () => {
      if (this.audioEl && this.currentTrack?.beatUrl) {
        this.playbackPosition = this.audioEl.currentTime;
        this.notify();
      }
    };

    this.audioEl.onerror = () => {
      console.warn('AudioEngine: Media element error encountered. Attempting recovery without CORS restriction...');
      if (!this.audioEl || !this.currentTrack?.beatUrl) return;

      const currentSrc = this.audioEl.src;
      // If anonymous CORS failed, try without crossOrigin
      if (this.audioEl.hasAttribute('crossOrigin')) {
        this.audioEl.removeAttribute('crossOrigin');
        this.audioEl.src = this.normalizeUrl(this.currentTrack.beatUrl);
        this.audioEl.load();
        this.audioEl.play().catch(err => {
          console.warn('Non-CORS fallback playback also failed:', err);
        });
      }
    };
  }

  private normalizeUrl(rawUrl: string): string {
    let targetUrl = (rawUrl || '').trim();

    // Data URLs pass through directly
    if (targetUrl.startsWith('data:audio/')) {
      return targetUrl;
    }

    // Common cloud storage transforms
    if (targetUrl.includes('dropbox.com')) {
      targetUrl = targetUrl
        .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
        .replace('?dl=0', '')
        .replace('&dl=0', '');
    } else if (targetUrl.includes('drive.google.com')) {
      const idMatch = targetUrl.match(/\/d\/([^/]+)/);
      if (idMatch) {
        targetUrl = `https://docs.google.com/uc?export=download&id=${idMatch[1]}`;
      }
    } else if (targetUrl.includes('catbox.moe') && !targetUrl.includes('files.catbox.moe')) {
      targetUrl = targetUrl.replace('catbox.moe', 'files.catbox.moe');
    }

    if (targetUrl.startsWith('files.catbox.moe')) {
      targetUrl = 'https://' + targetUrl;
    }

    return targetUrl;
  }

  public getAnalyser(): AnalyserNode | null {
    if (!this.ctx) {
      this.initContext();
    }
    return this.analyser;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      } catch (e) {
        // Ignore audio node gain error
      }
    }
    if (this.audioEl) {
      try {
        this.audioEl.volume = this.volume;
      } catch (e) {
        // Mobile iOS Safari might throw on volume assignment (hardware button controlled)
      }
    }
    this.notify();
  }

  public getVolume(): number {
    return this.volume;
  }

  public togglePlay(track: Track) {
    this.unlockAudio();

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.isRunning) {
      if (this.currentTrack?.id === track.id) {
        this.pause();
        return;
      } else {
        this.pause();
        this.currentTrack = track;
        this.playbackPosition = 0;
        this.play();
      }
    } else {
      this.currentTrack = track;
      this.play();
    }
  }

  public play() {
    if (!this.currentTrack) return;
    this.unlockAudio();

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.currentTrack.beatUrl) {
      this.initAudioElement();
      if (this.audioEl) {
        const targetUrl = this.normalizeUrl(this.currentTrack.beatUrl);

        if (!targetUrl || targetUrl.length < 5) {
          console.error('AudioEngine: Invalid beatUrl found for track:', {
            id: this.currentTrack.id,
            title: this.currentTrack.title,
            url: targetUrl
          });
          this.pause();
          return;
        }

        if (this.audioEl.src !== targetUrl) {
          this.audioEl.src = targetUrl;
          this.audioEl.load();
        }

        const playPromise = this.audioEl.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn('AudioEngine play rejection on primary attempt:', err?.message || err);
            // Fallback attempt: remove crossOrigin and retry
            if (this.audioEl) {
              this.audioEl.removeAttribute('crossOrigin');
              this.audioEl.play().catch(fallbackErr => {
                console.warn('AudioEngine play fallback also rejected:', fallbackErr?.message || fallbackErr);
              });
            }
          });
        }
      }
      this.isRunning = true;
      this.notify();
    }
  }

  public pause() {
    this.isRunning = false;
    if (this.audioEl) {
      this.audioEl.pause();
    }
    this.notify();
  }

  public stop() {
    this.pause();
    this.playbackPosition = 0;
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

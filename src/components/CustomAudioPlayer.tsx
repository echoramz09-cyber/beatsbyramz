import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { Track } from '../types';
import AudioEngine from '../utils/AudioEngine';
import AudioVisualizer from './AudioVisualizer';
import { Play, Pause, Volume2, VolumeX, RotateCcw, HelpCircle, Laptop, Radio } from 'lucide-react';

interface CustomAudioPlayerProps {
  onLicensingClick: (track: Track) => void;
}

export default function CustomAudioPlayer({ onLicensingClick }: CustomAudioPlayerProps) {
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    currentTrack: null as Track | null,
    volume: 0.8,
    progress: 0
  });

  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.8);
  const [isLooping, setIsLooping] = useState(true); // Loop by default since it plays continuous beautiful retro beats

  // Hook into AudioEngine state triggers
  useEffect(() => {
    const handleStateChange = (state: any) => {
      setPlayerState({
        isPlaying: state.isPlaying,
        currentTrack: state.currentTrack,
        volume: state.volume,
        progress: state.progress
      });
    };

    const unsubscribe = AudioEngine.subscribe(handleStateChange);
    return () => unsubscribe();
  }, []);

  const { isPlaying, currentTrack, volume, progress } = playerState;

  if (!currentTrack) return null;

  const handlePlayPause = () => {
    AudioEngine.togglePlay(currentTrack);
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setIsMuted(newVol === 0);
    AudioEngine.setVolume(newVol);
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      AudioEngine.setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      AudioEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleRestart = () => {
    // Reset play positions
    AudioEngine.stop();
    AudioEngine.togglePlay(currentTrack);
  };

  // Format progress ticks to readable time (infinite loop progress simulation styled as bars)
  const barProgress = (progress * currentTrack.bpm) / 120; // scale tick speed
  const seconds = Math.floor(barProgress % 60);
  const minutes = Math.floor(barProgress / 60);
  const formattedProgress = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div id="sticky-audio-player" className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-900 px-6 py-4 z-40 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Section: Active Track Info */}
        <div className="flex items-center gap-3.5 w-full md:w-1/3">
          <img 
            src={currentTrack.artwork} 
            alt={currentTrack.title} 
            className="w-12 h-12 rounded-xl object-cover border border-zinc-850 flex-shrink-0 animate-spin-slow"
            style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-widest font-semibold">
                Synthesizing Live
              </span>
            </div>
            <h4 className="text-white text-sm font-sans font-bold truncate tracking-tight">
              {currentTrack.title}
            </h4>
            <p className="text-[10px] text-zinc-500 font-mono truncate">
              {currentTrack.genre} • {currentTrack.bpm} BPM • {currentTrack.key}
            </p>
          </div>
        </div>

        {/* Middle Section: Audio Controls & Canvas Visualization */}
        <div className="flex flex-col items-center gap-2 w-full md:w-2/5">
          <div className="flex items-center gap-6">
            {/* Loop indicator */}
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-1.5 rounded-lg transition-colors ${
                isLooping ? 'text-purple-400 bg-purple-950/20' : 'text-zinc-650 hover:text-zinc-400'
              }`}
              title="Continuous Looping (Enabled by Default)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play Button */}
            <button
              onClick={handlePlayPause}
              id="sticky-play-pause-btn"
              className="w-11 h-11 rounded-full bg-white hover:scale-105 active:scale-95 text-zinc-950 flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-white/5"
              aria-label={isPlaying ? "Pause Beat" : "Play Beat"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-zinc-950" />
              ) : (
                <Play className="w-5 h-5 fill-zinc-950 translate-x-0.5" />
              )}
            </button>

            {/* Restart Beat */}
            <button
              onClick={handleRestart}
              className="p-1.5 text-zinc-650 hover:text-zinc-400 rounded-lg transition-all"
              title="Restart Rhythmic Pattern"
            >
              <RotateCcw className="w-4 h-4 scale-x-[-1]" />
            </button>
          </div>

          {/* Sizable Visualizer Overlay Panel */}
          <div className="w-full h-8 flex items-center justify-center">
            <AudioVisualizer className="max-w-xs h-6 opacity-60" />
          </div>

          {/* Timeline slider representation */}
          <div className="flex items-center gap-2.5 w-full text-zinc-550 text-[10px] font-mono leading-none">
            <span>{formattedProgress}</span>
            <div className="flex-1 h-1 bg-zinc-900 rounded-full overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                style={{ width: `${Math.min(100, (progress * 4) % 100)}%` }} // beautiful cyclical virtual track tracking
              />
            </div>
            <span>{currentTrack.duration}</span>
          </div>
        </div>

        {/* Right Section: Volume & Fast Purchase Actions */}
        <div className="flex items-center justify-end gap-4 w-full md:w-1/3">
          
          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-2">
            <button 
              onClick={handleMuteToggle}
              className="text-zinc-400 hover:text-white transition-colors"
              title="Toggle Audio Mute"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 accent-purple-500 h-1 bg-zinc-900 rounded-lg cursor-pointer"
            />
          </div>

          {/* Quick Buy license */}
          <button
            onClick={() => onLicensingClick(currentTrack)}
            id="sticky-buy-license-btn"
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-sans font-bold text-xs tracking-wider uppercase transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Licensing</span>
            <span className="text-[10px] font-mono text-purple-200">${currentTrack.priceBasic.toFixed(0)}+</span>
          </button>
        </div>

      </div>
    </div>
  );
}

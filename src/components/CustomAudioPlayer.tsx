import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { Track } from '../types';
import AudioEngine from '../utils/AudioEngine';
import AudioVisualizer from './AudioVisualizer';
import { Play, Pause, Volume2, VolumeX, RotateCcw, HelpCircle, Laptop, Radio, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomAudioPlayerProps {}

export default function CustomAudioPlayer() {
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    currentTrack: null as Track | null,
    volume: 0.8,
    progress: 0
  });

  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.8);
  const [isLooping, setIsLooping] = useState(true); // Loop by default since it plays continuous beautiful retro beats

  const [showCopyPopup, setShowCopyPopup] = useState(false);

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

  const handleBuyNow = () => {
    if (!playerState.currentTrack) return;
    
    const track = playerState.currentTrack;
    const info = `I'm interested in licensing: "${track.title}"\nGenre: ${track.genre}\nTempo: ${track.bpm} BPM\nDuration: ${track.duration}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(info).then(() => {
      setShowCopyPopup(true);
      setTimeout(() => setShowCopyPopup(false), 3000);
      
      // Redirect to Instagram DM after a short delay
      setTimeout(() => {
        window.open('https://ig.me/m/beatsbyramz', '_blank');
      }, 1000);
    });
  };

  const { isPlaying, currentTrack, volume, progress } = playerState;

  if (!currentTrack) return null;

  const parseDuration = (durationStr: string) => {
    if (!durationStr) return 180; // default 3 min
    const parts = durationStr.split(':').map(Number);
    if (parts.length === 2) {
      return (parts[0] * 60) + parts[1];
    }
    return 180;
  };

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
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const durationSeconds = parseDuration(currentTrack.duration);
  const formattedProgress = formatTime(progress);
  const progressPercent = Math.min(100, (progress / durationSeconds) * 100);

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    AudioEngine.seek(newTime);
  };

  return (
    <motion.div 
      id="sticky-audio-player" 
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 180 }}
      className="fixed bottom-0 left-0 right-0 bg-zinc-950 md:bg-zinc-950/95 md:backdrop-blur-lg border-t border-zinc-900 px-6 py-4 z-40 shadow-2xl"
    >
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
                Now Playing
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
              title="Continuous Looping"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play Button */}
            <button
              onClick={handlePlayPause}
              id="sticky-play-pause-btn"
              className="w-11 h-11 rounded-full bg-white hover:scale-105 active:scale-95 text-zinc-950 flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-white/5"
              aria-label={isPlaying ? "Pause" : "Play"}
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
              title="Restart Beat"
            >
              <RotateCcw className="w-4 h-4 scale-x-[-1]" />
            </button>
          </div>

          {/* Sizable Visualizer Overlay Panel */}
          <div className="w-full h-8 flex items-center justify-center">
            <AudioVisualizer className="max-w-xs h-6 opacity-60" />
          </div>

          {/* Timeline slider representation */}
          <div className="flex items-center gap-2.5 w-full text-zinc-550 text-[10px] font-mono leading-none group">
            <span>{formattedProgress}</span>
            <div className="flex-1 relative flex items-center h-4">
              <input 
                type="range"
                min="0"
                max={durationSeconds}
                step="0.1"
                value={progress}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden relative">
                <motion.div 
                  className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                  initial={false}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              {/* Playhead */}
              <div 
                className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0"
                style={{ left: `calc(${progressPercent}% - 5px)` }}
              />
            </div>
            <span>{currentTrack.duration}</span>
          </div>
        </div>

        {/* Right Section: Volume & License Action */}
        <div className="flex items-center justify-end gap-4 w-full md:w-1/3">
          
          <button 
            onClick={handleBuyNow}
            className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-sans font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all active:scale-95"
          >
            <Tag className="w-4 h-4 fill-white" />
            Buy Now
          </button>

          {/* Volume Control */}
          <div className="hidden lg:flex items-center gap-2">
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
        </div>

      </div>
      {/* Copy Confirmation Toast */}
      <AnimatePresence>
        {showCopyPopup && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ left: '50%', x: '-50%' }}
            className="fixed bottom-[110px] md:bottom-[100px] z-[100] px-6 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-2xl flex items-center gap-3 w-[280px]"
          >
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Tag className="w-4 h-4" />
            </div>
            <div className="font-sans">
              <p className="text-[10px] font-black text-white uppercase tracking-wider">Beat Details Copied!</p>
              <p className="text-[10px] text-zinc-400">Paste in Instagram DMs</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

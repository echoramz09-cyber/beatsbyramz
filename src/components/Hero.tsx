import { Play, Pause } from 'lucide-react';
import { Track } from '../types';
import { motion } from 'motion/react';

interface HeroProps {
  topTracks: Track[];
  isPlaying: boolean;
  activeTrackId: string | undefined;
  onPlayToggle: (track: Track) => void;
}

export default function Hero({ topTracks, isPlaying, activeTrackId, onPlayToggle }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-transparent pt-8 md:pt-12 pb-6 md:pb-8 px-4 md:px-6 border-b border-zinc-900 flex flex-col items-center text-center">
      
      {/* Decorative Neon Blur Orbs */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 md:w-80 h-64 md:h-80 rounded-full bg-amber-500/10 blur-3xl -z-10" 
      />

      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 w-full flex flex-col items-center">
        
        {/* Title Browse */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="space-y-1"
        >
          <h2 className="text-3xl sm:text-7xl font-sans font-black tracking-tight leading-tight uppercase">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 px-2 drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]">Top Beats</span>
          </h2>
        </motion.div>

        {/* Beats Showcase Row */}
        <div className="flex overflow-x-auto pb-4 gap-4 w-full snap-x scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 md:grid-cols-5">
          {topTracks.map((track, index) => {
            const isActive = activeTrackId === track.id;
            const isPlayingThis = isActive && isPlaying;

            return (
              <motion.div 
                key={track.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative flex-shrink-0 w-[160px] sm:w-auto snap-center"
              >
                <div 
                  onClick={() => onPlayToggle(track)}
                  className={`relative bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl transition-all duration-300 cursor-pointer ${isActive ? 'ring-1 ring-amber-500/60 bg-zinc-900 shadow-[0_0_15px_rgba(234,179,8,0.15)]' : 'hover:scale-[1.02] hover:bg-zinc-900/80 hover:border-zinc-700'}`}
                >
                  
                  {/* Artwork Square */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-950 border border-zinc-850">
                    <img 
                      src={track.artwork} 
                      alt={track.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayToggle(track);
                        }}
                        className="w-10 h-10 rounded-full bg-amber-400 hover:bg-yellow-300 text-black flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform cursor-pointer"
                        aria-label={isPlayingThis ? 'Pause beat' : 'Play beat'}
                      >
                        {isPlayingThis ? (
                          <Pause className="w-4 h-4 fill-black" />
                        ) : (
                          <Play className="w-4 h-4 fill-black translate-x-0.5" />
                        )}
                      </button>
                      <span className="text-[9px] font-mono font-bold text-amber-300 tracking-wider uppercase">
                        {isPlayingThis ? 'playing' : 'click to play'}
                      </span>
                    </div>

                    {/* Playing Indicator */}
                    {isPlayingThis && (
                      <div className="absolute top-2 right-2 flex gap-0.5 items-end h-3">
                        <span className="w-0.5 bg-amber-400 animate-[bounce_0.8s_infinite] h-2"></span>
                        <span className="w-0.5 bg-amber-400 animate-[bounce_0.5s_infinite_0.15s] h-3"></span>
                        <span className="w-0.5 bg-amber-400 animate-[bounce_0.7s_infinite_0.3s] h-1.5"></span>
                      </div>
                    )}
                  </div>

                  {/* Minimal Info */}
                  <div className="mt-3 text-left space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-[11px] font-sans font-black text-white truncate uppercase tracking-tight">{track.title}</h4>
                      {!isPlayingThis && (
                        <span className="text-[8px] font-mono text-zinc-550 group-hover:text-amber-400 transition-colors uppercase flex-shrink-0">
                          play
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                      <span>{track.bpm} • {track.duration}</span>
                      <span className="lowercase">{track.key}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

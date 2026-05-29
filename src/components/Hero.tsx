import { Play, Pause } from 'lucide-react';
import { Track } from '../types';
import { motion } from 'motion/react';

interface HeroProps {
  trendingTrack: Track | null;
  isPlaying: boolean;
  isPlayingTrending: boolean;
  onPlayToggle: (track: Track) => void;
}

export default function Hero({ trendingTrack, isPlaying, isPlayingTrending, onPlayToggle }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-zinc-950 pt-16 pb-12 px-6 border-b border-zinc-900 flex flex-col items-center text-center">
      
      {/* Decorative Neon Blur Orbs */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl -z-10" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.6, scale: 1.1 }}
        transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-pink-600/10 blur-3xl -z-10" 
      />

      <div className="max-w-3xl mx-auto space-y-8 flex flex-col items-center">
        
        {/* Title Browse */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="space-y-3"
        >
          
          <h2 className="text-3xl sm:text-5xl font-sans font-black tracking-tight leading-tight uppercase">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">Top Beats</span>
          </h2>
        </motion.div>

        {/* Beats Showcase Widget (Centered) */}
        {trendingTrack && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-[360px] group"
          >
            
            {/* Soft glowing background border */}
            <div className="absolute inset-x-0 -bottom-1 -top-1 bg-gradient-to-tr from-purple-600 via-pink-500 to-purple-600 rounded-3xl blur-md opacity-25 group-hover:opacity-40 transition-opacity duration-500" />
            
            <div className="relative bg-zinc-900 border border-zinc-800 p-5 rounded-3xl shadow-xl flex flex-col justify-between h-full">
              
              {/* Image preview area */}
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
                <img 
                  src={trendingTrack.artwork} 
                  alt={trendingTrack.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-85" />
                
                {/* Dynamic Status Badging */}
                <span className="absolute top-3 left-3 bg-purple-600 text-white font-sans font-bold text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md animate-pulse">
                  Feature Track
                </span>

                {/* Big Center Play Toggle Button */}
                <button
                  onClick={() => onPlayToggle(trendingTrack)}
                  id="hero-play-trending-btn"
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  aria-label={isPlayingTrending ? "Pause Beat" : "Play Beat"}
                >
                  {isPlayingTrending ? (
                    <Pause className="w-6 h-6 fill-zinc-950 text-zinc-950" />
                  ) : (
                    <Play className="w-6 h-6 fill-zinc-950 text-zinc-950 translate-x-0.5" />
                  )}
                </button>
              </div>

              {/* Title / Description */}
              <div className="mt-4 space-y-1.5 text-left">
                <div className="flex items-center justify-between text-zinc-500 font-sans font-bold text-[9px]">
                  <span className="text-purple-400 uppercase tracking-widest">{trendingTrack.genre}</span>
                  <span className="uppercase tracking-wider">{trendingTrack.bpm} BPM • {trendingTrack.key}</span>
                </div>
                <h3 className="text-xl font-sans font-black text-white tracking-tight">{trendingTrack.title}</h3>
                <p className="text-xs text-zinc-400 font-sans line-clamp-2">
                  {trendingTrack.tagline}
                </p>
              </div>

              {/* Showcase info */}
              <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-[9px] text-zinc-550 font-sans font-bold uppercase tracking-widest">Tempo</div>
                  <div className="text-sm font-sans font-black text-white">{trendingTrack.bpm} BPM</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-zinc-550 font-sans font-bold uppercase tracking-widest">Key</div>
                  <div className="text-sm font-sans font-black text-white lowercase">in {trendingTrack.key}</div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </div>
    </section>
  );
}

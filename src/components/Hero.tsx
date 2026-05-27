import { Play, Pause, Disc } from 'lucide-react';
import { Track } from '../types';

interface HeroProps {
  trendingTrack: Track | null;
  isPlaying: boolean;
  isPlayingTrending: boolean;
  onPlayToggle: (track: Track) => void;
  onLicensingClick: (track: Track) => void;
}

export default function Hero({ trendingTrack, isPlaying, isPlayingTrending, onPlayToggle, onLicensingClick }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-zinc-950 pt-16 pb-12 px-6 border-b border-zinc-900 flex flex-col items-center text-center">
      
      {/* Decorative Neon Blur Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl -z-10" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-pink-600/10 blur-3xl -z-10 animate-pulse" />

      <div className="max-w-3xl mx-auto space-y-8 flex flex-col items-center">
        
        {/* Title Browse */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-full text-purple-400 font-mono text-[10px] uppercase tracking-widest">
            <Disc className="w-3 h-3 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Spotlight Instrumental</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-white leading-tight uppercase">
            Browse the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">Sonic Vault</span>
          </h2>
          <p className="text-zinc-550 text-xs sm:text-sm font-sans max-w-lg leading-relaxed font-normal">
            Listen to exclusive, pristine, industry-standard beats produced by <span className="text-purple-400">beatsbyramz</span>. Stream raw previews and select lease options below.
          </p>
        </div>

        {/* Beats Showcase Widget (Centered) */}
        {trendingTrack && (
          <div className="relative w-full max-w-[360px] group">
            
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
                <span className="absolute top-3 left-3 bg-purple-600 text-white font-mono font-bold text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md animate-pulse">
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
                <div className="flex items-center justify-between text-zinc-500 font-mono text-[9px]">
                  <span className="text-purple-400 uppercase tracking-widest">{trendingTrack.genre}</span>
                  <span>{trendingTrack.bpm} BPM • {trendingTrack.key}</span>
                </div>
                <h3 className="text-xl font-sans font-black text-white tracking-tight">{trendingTrack.title}</h3>
                <p className="text-xs text-zinc-400 font-sans line-clamp-2">
                  {trendingTrack.tagline}
                </p>
              </div>

              {/* Showcase action trigger */}
              <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between gap-3 text-left">
                <div>
                  <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Lease Lease From</div>
                  <div className="text-lg font-mono font-black text-white">${trendingTrack.priceBasic.toFixed(2)}</div>
                </div>
                
                <button
                  onClick={() => onLicensingClick(trendingTrack)}
                  id="hero-buy-trending-btn"
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-sans font-extrabold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer"
                >
                  Lease Options
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}

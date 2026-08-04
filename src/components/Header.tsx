import { Search, Play, Pause, Music, Headphones, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Track } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  tracks: Track[];
  isPlaying: boolean;
  activeTrackId?: string;
  onPlayToggle: (track: Track) => void;
}

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  tracks, 
  isPlaying, 
  activeTrackId, 
  onPlayToggle 
}: HeaderProps) {
  
  // Search results specifically for the dropdown popover
  const searchResults = tracks.filter(track => {
    if (!searchQuery) return false;
    return track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           track.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
           track.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/98 md:bg-zinc-950/80 md:backdrop-blur-md border-b border-zinc-900/40 px-6 py-4 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo / Brand */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(234,179,8,0.8)] animate-pulse"></span>
          <h1 className="text-white font-sans font-extrabold tracking-wider text-sm sm:text-base hover:text-amber-400 transition-colors lowercase">
            craxx
          </h1>
        </div>

        {/* Right side Search Input */}
        <div className="relative w-full max-w-[200px] sm:max-w-xs group ml-4">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-550 absolute left-3 top-2.5 group-focus-within:text-amber-400 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 focus:bg-zinc-900/60 hover:bg-zinc-850 text-xs pl-9 pr-8 py-2.5 border border-zinc-800 focus:border-amber-400 rounded-xl text-white placeholder-zinc-500 focus:outline-none transition-all font-sans"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-rose-500 p-1 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown Pop-up */}
          <AnimatePresence>
            {searchQuery.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute top-full left-0 sm:left-auto sm:right-0 w-[calc(100vw-3rem)] sm:w-[400px] mt-4 bg-zinc-900/98 md:bg-zinc-900/95 md:backdrop-blur-xl border border-zinc-800 shadow-2xl rounded-3xl overflow-hidden z-[100] p-2"
              >
                {searchResults.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Music className="w-6 h-6 mx-auto text-zinc-700 mb-2" />
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest italic">No matches found</p>
                  </div>
                ) : (
                  <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                    <div className="px-3 py-1.5 mb-1 flex items-center justify-between">
                       <span className="text-[9px] font-sans font-black text-zinc-600 uppercase tracking-[0.2em]">Quick Results</span>
                       <span className="text-[8px] font-mono text-zinc-700">{searchResults.length} matches</span>
                    </div>
                    {searchResults.slice(0, 10).map((track) => {
                       const isActive = activeTrackId === track.id;
                       const isPlayingRow = isActive && isPlaying;
                       
                       return (
                         <button
                           key={track.id}
                           onClick={() => {
                             onPlayToggle(track);
                             setSearchQuery(''); // Close on click
                           }}
                           className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-white/5 transition-all group text-left"
                         >
                           <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex-shrink-0">
                             <img 
                               src={track.artwork} 
                               alt={track.title} 
                               className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-30" 
                               referrerPolicy="no-referrer" 
                             />
                             {isPlayingRow && (
                               <div className="absolute inset-0 bg-amber-500/40 flex items-center justify-center">
                                 <div className="flex gap-0.5 items-end">
                                   <span className="w-0.5 bg-white animate-[bounce_0.6s_infinite] h-2"></span>
                                   <span className="w-0.5 bg-white animate-[bounce_0.4s_infinite_0.1s] h-3"></span>
                                   <span className="w-0.5 bg-white animate-[bounce_0.5s_infinite_0.2s] h-1.5"></span>
                                 </div>
                               </div>
                             )}
                             <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isPlayingRow ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />}
                             </div>
                           </div>
                           <div className="flex-grow min-w-0">
                             <h5 className="text-zinc-100 text-xs font-bold font-sans truncate pr-2">{track.title}</h5>
                             <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-amber-400 font-mono font-bold uppercase">{track.genre}</span>
                                <span className="w-0.5 h-0.5 rounded-full bg-zinc-700" />
                                <span className="text-[9px] text-zinc-500 font-mono">{track.bpm} BPM</span>
                             </div>
                           </div>
                           <div className="flex-shrink-0">
                             <Headphones className="w-3.5 h-3.5 text-zinc-700 group-hover:text-amber-400 transition-colors" />
                           </div>
                         </button>
                       );
                    })}
                    {searchResults.length > 10 && (
                      <div className="px-4 py-3 text-center border-t border-zinc-800/50 mt-1">
                        <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">Scroll for more matches</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.header>
  );
}

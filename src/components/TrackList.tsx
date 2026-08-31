import { useState, useEffect, MouseEvent } from 'react';
import { Track } from '../types';
import { Genre } from '../lib/genreService';
import { Play, Pause, Tag, Music, Headphones, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TrackListProps {
  tracks: Track[];
  genresList: Genre[];
  onPlayToggle: (track: Track) => void;
  activeTrackId: string | undefined;
  isPlaying: boolean;
  searchQuery: string;
}

export default function TrackList({ 
  tracks, 
  genresList,
  onPlayToggle, 
  activeTrackId, 
  isPlaying,
  searchQuery
}: TrackListProps) {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCopyPopup, setShowCopyPopup] = useState(false);
  const itemsPerPage = 15;

  // Use dynamic genres from Firebase + 'All'
  const genreFilters = ['All', ...genresList.map(g => g.name)];

  // Filtering Logic for the main list
  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          track.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          track.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGenre = selectedGenre === 'All' || track.genre === selectedGenre;

    return matchesSearch && matchesGenre;
  });

  // Reset to first page when filtering or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenre, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredTracks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTracks = filteredTracks.slice(startIndex, startIndex + itemsPerPage);

  // Group current page tracks by genre (to maintain the visual grouping if desired)
  const groupedTracks = paginatedTracks.reduce((acc, track) => {
    if (!acc[track.genre]) acc[track.genre] = [];
    acc[track.genre].push(track);
    return acc;
  }, {} as Record<string, Track[]>);

  // Determine which genres to show: 
  // If 'All', show all genres present in the current paginated batch
  // If a specific genre is selected, only show that one
  const genresToRender = selectedGenre === 'All' 
    ? Object.keys(groupedTracks).sort()
    : [selectedGenre].filter(g => groupedTracks[g]);

  return (
    <section id="beats-section" className="py-20 px-6 max-w-7xl mx-auto space-y-10">
      
      {/* Catalog Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-zinc-900">
        <div className="space-y-1">
          <p className="text-xs text-zinc-500 font-sans font-bold uppercase tracking-wider">Filter by mood, search tags, or listen to high-quality beat previews.</p>
        </div>
      </div>

        {/* Modern Filter Chip Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          <span className="text-zinc-500 font-sans font-bold text-[10px] uppercase tracking-widest mr-2 hidden lg:inline flex-shrink-0">
            Quick Filter:
          </span>
          {genreFilters.map((g) => {
            const isSelected = selectedGenre === g;
            return (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                id={`filter-genre-btn-${g.replace(/\s+/g, '-').toLowerCase()}`}
                className={`px-3 py-2 md:px-4 md:py-2 rounded-xl text-[9px] md:text-[10px] font-sans font-bold tracking-widest transition-all uppercase cursor-pointer flex-shrink-0 ${
                  isSelected 
                    ? 'bg-amber-400 border border-yellow-300 text-black font-black shadow-lg shadow-amber-500/25' 
                    : 'bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>

      {/* Catalog Render Table */}
      <div className="w-full">
        
        {/* Table Headline Descriptors - Desktop Only */ }
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 border-b border-zinc-900 text-zinc-550 font-sans text-[10px] uppercase tracking-widest font-black">
          <div className="col-span-1 text-center">Preview</div>
          <div className="col-span-3 pl-4">Title</div>
          <div className="col-span-2 text-center">BPM • Time</div>
          <div className="col-span-1 text-center">Key</div>
          <div className="col-span-2 text-center">Buy Now</div>
          <div className="col-span-3 pl-4">Tags</div>
        </div>

        {/* Beats List */}
        <div className="divide-y divide-zinc-900/10 mt-1 min-h-[400px]">
          {filteredTracks.length === 0 ? (
            <div className="py-16 text-center text-zinc-550 border border-dashed border-zinc-900 rounded-3xl mt-4">
              <Music className="w-10 h-10 mx-auto text-zinc-650 mb-3" />
              <p className="text-zinc-400 font-semibold font-sans">No matching instrumentals found</p>
              <p className="text-[11px] text-zinc-550 font-mono mt-1">Try tweaking your filters or adjusting your tags query.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {genresToRender.map((genre) => (
                <motion.div 
                  key={`${genre}-${currentPage}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={selectedGenre === 'All' ? 'py-1' : 'py-4'}
                >
                  {/* Category Header */}
                  {selectedGenre !== 'All' && (
                    <div className="px-4 py-3 bg-zinc-900/20 rounded-xl mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                      <h3 className="text-[10px] font-sans font-black text-zinc-400 uppercase tracking-[0.2em]">{genre}</h3>
                      <span className="text-[9px] text-zinc-650 font-mono">({filteredTracks.filter(t => t.genre === genre).length} total)</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:block gap-4">
                    {groupedTracks[genre].map((track) => {
                      const isActive = activeTrackId === track.id;
                      const isPlayingRow = isActive && isPlaying;

                      const handleRowBuyNow = (e: MouseEvent) => {
                        e.stopPropagation();
                        const info = `I'm interested in licensing: "${track.title}"\nGenre: ${track.genre}\nTempo: ${track.bpm} BPM\nDuration: ${track.duration}`;
                        
                        navigator.clipboard.writeText(info).then(() => {
                          setShowCopyPopup(true);
                          setTimeout(() => setShowCopyPopup(false), 3000);
                          
                          setTimeout(() => {
                            window.open('https://ig.me/m/craxx', '_blank');
                          }, 1000);
                        });
                      };

                      return (
                        <motion.div
                          key={track.id}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                          onClick={() => onPlayToggle(track)}
                          className={`flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center px-5 py-5 md:px-4 md:py-4 rounded-3xl md:rounded-2xl hover:bg-zinc-900/40 transition-colors border border-zinc-900/50 md:border-transparent hover:border-zinc-800/50 group cursor-pointer ${
                            isActive ? 'bg-zinc-900/40 border-zinc-800 ring-1 ring-zinc-800/50' : 'bg-zinc-950/20'
                          }`}
                        >
                          {/* Top Section: Artwork & Title (Mobile Only) */}
                          <div className="flex items-center gap-4 w-full md:contents">
                            {/* Artwork */}
                            <div className="md:col-span-1 flex justify-center flex-shrink-0">
                              <div className="relative w-16 h-16 md:w-12 md:h-12 rounded-2xl md:rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex-shrink-0">
                                <img 
                                  src={track.artwork} 
                                  alt={track.title} 
                                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-30"
                                  referrerPolicy="no-referrer"
                                />
                                <div
                                  className={`absolute inset-0 m-auto flex items-center justify-center bg-black/20 md:bg-transparent md:group-hover:bg-black/40 text-white transition-all rounded-full ${isPlayingRow ? 'opacity-100' : 'opacity-100 md:opacity-0 group-hover:opacity-100'}`}
                                >
                                  {isPlayingRow ? (
                                    <Pause className="w-5 h-5 md:w-4 md:h-4 fill-white animate-pulse" />
                                  ) : (
                                    <Play className="w-5 h-5 md:w-4 md:h-4 fill-white translate-x-0.5" />
                                  )}
                                </div>

                                {isPlayingRow && (
                                  <div className="absolute inset-0 bg-amber-950/60 flex gap-0.5 items-end justify-center pb-3 md:pb-2.5 group-hover:opacity-0 pointer-events-none transition-opacity">
                                    <span className="w-1 bg-amber-300 animate-[bounce_0.8s_infinite] h-4"></span>
                                    <span className="w-1 bg-amber-300 animate-[bounce_0.5s_infinite_0.15s] h-6"></span>
                                    <span className="w-1 bg-amber-300 animate-[bounce_0.7s_infinite_0.3s] h-3"></span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Title & Info */}
                            <div className="md:col-span-3 pl-0 md:pl-4 flex-grow min-w-0">
                              <h4 className="text-white text-base md:text-sm font-sans font-bold truncate tracking-tight">{track.title}</h4>
                              <p className="text-xs md:text-[11px] text-zinc-500 font-sans truncate mt-1 md:mt-0.5">{track.tagline}</p>
                              
                              {/* Metadata Row (Mobile Only) */}
                              <div className="flex md:hidden items-center gap-3 mt-2 text-[10px] font-mono text-zinc-400">
                                <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800">{track.bpm} BPM</span>
                                <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800">{track.key}</span>
                                <span>{track.duration}</span>
                              </div>
                            </div>
                          </div>

                          {/* Desktop Metadata Columns */}
                          <div className="hidden md:block md:col-span-2 text-center font-mono text-zinc-300 text-xs">
                            {track.bpm} <span className="text-zinc-650 px-1">•</span> {track.duration}
                          </div>

                          <div className="hidden md:block md:col-span-1 text-center font-mono text-zinc-400 text-xs">
                            {track.key}
                          </div>

                          {/* Action Button */}
                          <div className="md:col-span-2 w-full md:w-auto md:flex md:justify-center">
                            <button
                              onClick={handleRowBuyNow}
                              className="w-full md:w-auto px-6 py-3.5 md:px-4 md:py-2 rounded-2xl md:rounded-xl bg-amber-400 md:bg-zinc-900 border border-amber-400/30 md:border-zinc-800 text-[11px] md:text-[10px] font-sans md:font-mono font-black text-black md:text-zinc-400 hover:text-white md:hover:text-amber-400 hover:bg-amber-400 md:hover:bg-zinc-800 transition-all uppercase tracking-widest flex items-center justify-center gap-2.5 group/buy active:scale-95 shadow-lg shadow-amber-500/10 md:shadow-none"
                            >
                              <Tag className="w-4 h-4 md:w-3 md:h-3 group-hover/buy:text-black md:group-hover/buy:text-amber-400 transition-colors" />
                              Buy Now
                            </button>
                          </div>

                          {/* TAGS - Scrollable on mobile if needed, though card is better */}
                          <div className="md:col-span-3 pl-0 md:pl-4 flex flex-wrap gap-1.5 overflow-hidden w-full">
                            {track.tags.map(tag => (
                              <span 
                                key={tag}
                                className="text-[9px] font-mono font-bold tracking-wide bg-zinc-900/50 group-hover:bg-zinc-850 hover:text-white transition-colors text-zinc-500 border border-zinc-800/50 px-2.5 py-1 rounded-full flex items-center gap-1"
                              >
                                <Tag className="w-2.5 h-2.5 text-zinc-600" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

          {/* Mobile-Optimized Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center mt-12 py-10 border-t border-zinc-900 gap-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl active:scale-90"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-2 mx-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    // Only show first, last, and pages near current
                    if (
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-2xl text-xs font-mono font-black border transition-all ${
                            currentPage === pageNum
                              ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-850'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 || 
                      pageNum === currentPage + 2
                    ) {
                      return <span key={pageNum} className="text-zinc-700 font-mono text-xs px-1">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl active:scale-90"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="text-[11px] text-zinc-500 font-mono uppercase tracking-[0.25em] flex items-center gap-3">
                <div className="w-8 h-px bg-zinc-900" />
                <span>Page <span className="text-purple-400 font-black">{currentPage}</span> / {totalPages}</span>
                <div className="w-8 h-px bg-zinc-900" />
              </div>
            </div>
          )}

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
    </section>
  );

}

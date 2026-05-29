import { useState } from 'react';
import { Track } from '../types';
import { Play, Pause, Search, Tag, Music, SlidersHorizontal, Headphones } from 'lucide-react';
import { motion } from 'motion/react';

interface TrackListProps {
  tracks: Track[];
  onPlayToggle: (track: Track) => void;
  activeTrackId: string | undefined;
  isPlaying: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function TrackList({ 
  tracks, 
  onPlayToggle, 
  activeTrackId, 
  isPlaying,
  searchQuery,
  setSearchQuery
}: TrackListProps) {
  const [selectedGenre, setSelectedGenre] = useState('All');

  // Find unique genres dynamically
  const genres = ['All', ...Array.from(new Set(tracks.map(t => t.genre)))];

  // Filtering Logic
  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          track.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          track.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGenre = selectedGenre === 'All' || track.genre === selectedGenre;

    return matchesSearch && matchesGenre;
  });

  return (
    <section id="beats-section" className="py-20 px-6 max-w-7xl mx-auto space-y-10">
      
      {/* Catalog Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-zinc-900">
        <div className="space-y-1">
          <p className="text-xs text-zinc-500 font-sans font-bold uppercase tracking-wider">Filter by mood, search tags, or listen to high-quality beat previews.</p>
        </div>
      </div>

      {/* Modern Filter Chip Row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-zinc-500 font-sans font-bold text-[10px] uppercase tracking-widest mr-2 hidden sm:inline flex-shrink-0">
          Genre Sort:
        </span>
        {genres.map((g) => {
          const isSelected = selectedGenre === g;
          return (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              id={`filter-genre-btn-${g.replace(/\s+/g, '-').toLowerCase()}`}
              className={`px-4 py-2 rounded-xl text-[10px] font-sans font-bold tracking-widest transition-all uppercase cursor-pointer ${
                isSelected 
                  ? 'bg-purple-600 border border-purple-500 text-white shadow-lg shadow-purple-500/15' 
                  : 'bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* Catalog Render Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] w-full text-left">
          
          {/* Table Headline Descriptors */ }
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-zinc-900 text-zinc-550 font-sans text-[10px] uppercase tracking-widest font-black">
            <div className="col-span-1 text-center">Preview</div>
            <div className="col-span-4 pl-4">Title</div>
            <div className="col-span-2 text-center">BPM</div>
            <div className="col-span-2 text-center">Key</div>
            <div className="col-span-3 pl-4">Tags</div>
          </div>

          {/* Table Beats List */}
          <div className="divide-y divide-zinc-900/50 mt-1">
            {filteredTracks.length === 0 ? (
              <div className="col-span-12 py-16 text-center text-zinc-550 border border-dashed border-zinc-900 rounded-3xl mt-4">
                <Music className="w-10 h-10 mx-auto text-zinc-650 mb-3" />
                <p className="text-zinc-400 font-semibold font-sans">No matching instrumentals found</p>
                <p className="text-[11px] text-zinc-550 font-mono mt-1">Try tweaking your filters or adjusting your tags query.</p>
              </div>
            ) : (
              filteredTracks.map((track) => {
                const isActive = activeTrackId === track.id;
                const isPlayingRow = isActive && isPlaying;

                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className={`grid grid-cols-12 gap-4 items-center px-4 py-4 rounded-2xl hover:bg-zinc-900/40 transition-colors border border-transparent hover:border-zinc-900/40 group ${
                      isActive ? 'bg-zinc-900/30 border-zinc-900' : ''
                    }`}
                  >
                    {/* Visualizer and Play buttons */}
                    <div className="col-span-1 flex justify-center">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex-shrink-0">
                        <img 
                          src={track.artwork} 
                          alt={track.title} 
                          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-30"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={() => onPlayToggle(track)}
                          id={`row-play-btn-${track.id}`}
                          className="absolute inset-0 m-auto flex items-center justify-center bg-transparent group-hover:bg-black/40 text-white transition-all rounded-full cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                          aria-label={isPlayingRow ? "Pause" : "Play"}
                        >
                          {isPlayingRow ? (
                            <Pause className="w-4 h-4 fill-white animate-pulse" />
                          ) : (
                            <Play className="w-4 h-4 fill-white translate-x-0.5" />
                          )}
                        </button>

                        {/* If playing & NOT hovered, display audio equalizer animations directly in the tiny artwork panel */}
                        {isPlayingRow && (
                          <div className="absolute inset-0 bg-purple-900/50 flex gap-0.5 items-end justify-center pb-2.5 group-hover:opacity-0 pointer-events-none transition-opacity">
                            <span className="w-1.0 bg-white animate-[bounce_0.8s_infinite] h-4"></span>
                            <span className="w-1.0 bg-white animate-[bounce_0.5s_infinite_0.15s] h-6"></span>
                            <span className="w-1.0 bg-white animate-[bounce_0.7s_infinite_0.3s] h-3"></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title & Tagline, etc. */}
                    <div className="col-span-4 pl-4 min-w-0">
                      <h4 className="text-white text-sm font-sans font-bold truncate tracking-tight">{track.title}</h4>
                      <p className="text-[11px] text-zinc-500 font-sans truncate mt-0.5">{track.tagline}</p>
                    </div>

                    {/* BPM */}
                    <div className="col-span-2 text-center font-mono text-zinc-300 text-xs">
                      {track.bpm}
                    </div>

                    {/* KEY */}
                    <div className="col-span-2 text-center font-mono text-zinc-400 text-xs">
                      {track.key}
                    </div>

                    {/* TAGS */}
                    <div className="col-span-3 pl-4 flex flex-wrap gap-1.5 overflow-hidden">
                      {track.tags.map(tag => (
                        <span 
                          key={tag}
                          className="text-[9px] font-mono font-medium tracking-wide bg-zinc-900 group-hover:bg-zinc-850 hover:text-white transition-colors text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-full flex items-center gap-0.5"
                        >
                          <Tag className="w-2 h-2 text-zinc-550" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

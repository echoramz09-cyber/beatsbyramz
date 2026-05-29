import { Search } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Header({ searchQuery, setSearchQuery }: HeaderProps) {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900/40 px-6 py-4 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo / Brand */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.8)] animate-pulse"></span>
          <h1 className="text-white font-sans font-extrabold tracking-wider text-sm sm:text-base hover:text-purple-400 transition-colors lowercase">
            beatsbyramz
          </h1>
        </div>

        {/* Right side Search Input */}
        <div className="relative w-40 sm:w-64">
          <Search className="w-4 h-4 text-zinc-550 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search beats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 focus:bg-zinc-900 hover:bg-zinc-850 text-xs pl-9 pr-3 py-2 border border-zinc-800 focus:border-purple-500 rounded-xl text-white placeholder-zinc-500 focus:outline-none transition-all font-sans"
          />
        </div>

      </div>
    </motion.header>
  );
}

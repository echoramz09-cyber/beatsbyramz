import { Star, Mail, Play } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900/40 px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo / Brand */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.8)] animate-pulse"></span>
          <h1 className="text-white font-sans font-extrabold tracking-wider text-sm sm:text-base hover:text-purple-400 transition-colors lowercase">
            beatsbyramz
          </h1>
        </div>

        {/* Middle Navigation - Clean Anchors */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-zinc-400">
          <a href="#beats-section" className="hover:text-white transition-colors flex items-center gap-1.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
            Beats Catalog
          </a>
          <a href="#licensing-section" className="hover:text-white transition-colors py-1">
            Licensing Price
          </a>
          <a href="#contact-section" className="hover:text-white transition-colors py-1 flex items-center gap-1">
            Collaborations
          </a>
        </nav>

        {/* Right Interactions */}
        <div className="flex items-center gap-3">
          <a 
            href="#contact-section" 
            className="text-xs font-mono text-purple-400 hover:text-white hover:bg-purple-950/20 border border-purple-900/40 hover:border-purple-500/80 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Send Lead Inquiry</span>
          </a>
        </div>

      </div>
    </header>
  );
}

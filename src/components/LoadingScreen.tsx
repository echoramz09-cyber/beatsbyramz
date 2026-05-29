import { motion } from 'motion/react';

export default function LoadingScreen() {
  // Apple-style spinner spokes: 12 segments
  const spokes = Array.from({ length: 12 });

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center gap-6 select-none"
    >
      {/* Background dynamic glow */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />

      {/* iOS Style Spinner */}
      <div className="relative w-12 h-12">
        {spokes.map((_, i) => (
          <div
            key={i}
            className="absolute left-[47%] top-0 w-[6%] h-[30%] bg-zinc-400 rounded-full origin-bottom"
            style={{
              transform: `rotate(${i * 30}deg) translateY(-100%)`,
              opacity: 0.15,
              animation: `ios-spinner-fade 1.2s linear infinite`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-2">
        <motion.h2 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-white font-sans font-black text-xl tracking-tighter uppercase"
        >
          BEATSBYRAMZ
        </motion.h2>
        <p className="text-[10px] items-center flex gap-1.5 text-zinc-500 font-sans font-bold uppercase tracking-[0.2em]">
          <span>Synchronizing Catalog</span>
          <span className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" />
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ios-spinner-fade {
          0% { opacity: 1; }
          100% { opacity: 0.15; }
        }
      `}} />
    </motion.div>
  );
}

import { useState } from 'react';
import { Track, LicenseType } from '../types';
import { LICENSE_OPTIONS } from '../data';
import { X, Check, ShieldCheck, Zap, Info, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LicensingModalProps {
  track: Track | null;
  onClose: () => void;
  onInquiryRequest: (track: Track, licenseType: LicenseType, price: number) => void;
}

export default function LicensingModal({ track, onClose, onInquiryRequest }: LicensingModalProps) {
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('premium');

  if (!track) return null;

  const currentOption = LICENSE_OPTIONS.find(l => l.type === selectedLicense);

  const handleCreateInquiry = () => {
    let finalPrice = track.priceBasic;
    if (selectedLicense === 'premium') finalPrice = track.pricePremium;
    if (selectedLicense === 'unlimited') finalPrice = track.priceUnlimited;

    onInquiryRequest(track, selectedLicense, finalPrice);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
          id="licensing-overlay-backdrop"
        />

        {/* Modal Panel */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          id="licensing-modal-box"
          className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-none md:h-auto"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-450 hover:text-white p-2 hover:bg-zinc-900 rounded-full transition-colors z-20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Side: Beat Details & Licensing Selection */}
          <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-zinc-900 overflow-y-auto">
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={track.artwork} 
                alt={track.title} 
                className="w-16 h-16 rounded-xl object-cover border border-zinc-800"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-purple-400 text-xs font-mono font-medium tracking-widest uppercase">
                  {track.genre} • {track.bpm} BPM
                </span>
                <h3 className="text-2xl font-sans font-black text-white tracking-tight">{track.title}</h3>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">Key: {track.key}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 mb-6 font-sans italic">
              "{track.tagline}"
            </p>

            <h4 className="text-zinc-300 text-xs font-mono uppercase tracking-wider mb-3">Select Lease Type:</h4>
            
            <div className="space-y-3">
              {LICENSE_OPTIONS.map((opt) => {
                const isSelected = selectedLicense === opt.type;
                
                // Get style relative prices
                let rawPrice = track.priceBasic;
                if (opt.type === 'premium') rawPrice = track.pricePremium;
                if (opt.type === 'unlimited') rawPrice = track.priceUnlimited;

                return (
                  <button
                    key={opt.type}
                    onClick={() => setSelectedLicense(opt.type)}
                    id={`btn-license-${opt.type}`}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center cursor-pointer ${
                      isSelected 
                        ? 'bg-purple-950/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                        : 'bg-zinc-900/60 border-zinc-850 hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-purple-500 bg-purple-500 text-white' : 'border-zinc-700'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="font-sans font-bold text-white text-sm">{opt.name}</div>
                        <div className="text-xs text-zinc-400 font-mono">
                          {opt.type === 'basic' && 'MP3 Only Arrangement'}
                          {opt.type === 'premium' && 'WAV + Track Stems (Best Value)'}
                          {opt.type === 'unlimited' && 'Full Royalty-Free Commercial Release'}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono text-base font-bold text-white">
                      ${rawPrice.toFixed(2)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side: Contract Specifications & Action */}
          <div className="w-full md:w-[360px] bg-zinc-900/40 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-4 text-purple-400">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <span className="text-xs font-mono font-bold tracking-widest uppercase">Contract terms</span>
              </div>

              <h3 className="text-lg font-sans font-black text-white mb-4">
                {currentOption?.name}
              </h3>

              <ul className="space-y-2.5 mb-6">
                {currentOption?.features.map((feat, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-xs text-zinc-300">
                    <Check className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl flex items-start gap-2 mb-6">
                <Info className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-450 font-mono leading-relaxed">
                  No automated checkout active. Submitting this inquiry will pre-populate the collaboration form so beatsbyramz can send custom contracts and files directly.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs text-zinc-400 font-mono">Estimated Price:</span>
                <span className="text-2xl font-mono font-black text-white">
                  ${(
                    selectedLicense === 'basic' ? track.priceBasic : 
                    selectedLicense === 'premium' ? track.pricePremium : 
                    track.priceUnlimited
                  ).toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCreateInquiry}
                id="modal-add-to-cart-btn"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-sans font-extrabold text-xs tracking-wider uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-white" />
                <span>Request Dynamic Quote</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

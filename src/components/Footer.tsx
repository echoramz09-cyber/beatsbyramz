import { useState, useEffect, FormEvent } from 'react';
import { Mail, Instagram, Youtube, Twitter, Radio, Check, FileText, Send, Heart, Sparkles } from 'lucide-react';
import { LICENSE_OPTIONS, PRODUCER_PROFILE } from '../data';

interface FooterProps {
  prefill?: {
    subject: string;
    message: string;
  } | null;
}

export default function Footer({ prefill }: FooterProps) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Custom Beat Inquiry', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync state values with prefilled quotes trigger
  useEffect(() => {
    if (prefill) {
      setFormData(prev => ({
        ...prev,
        subject: prefill.subject,
        message: prefill.message
      }));
    }
  }, [prefill]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: 'Custom Beat Inquiry', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1200);
  };

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pb-36 pt-16">
      
      {/* 1. Licensing Guide segment */}
      <section id="licensing-section" className="max-w-7xl mx-auto px-6 mb-20">
        <div className="text-center space-y-2 mb-12">
          <span className="text-purple-400 font-mono text-[10px] uppercase tracking-widest font-bold">Transparent Pricing</span>
          <h3 className="text-3xl font-sans font-black text-white tracking-tight">Licensing Guide</h3>
          <p className="text-xs text-zinc-500 font-mono max-w-md mx-auto">
            Choose the perfect legal license structure to unleash your music on Spotify, Apple Music, and YouTube safely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LICENSE_OPTIONS.map((opt) => (
            <div 
              key={opt.type}
              className={`p-6 rounded-3xl border flex flex-col justify-between space-y-6 ${
                opt.type === 'premium' 
                  ? 'bg-purple-950/10 border-purple-500/40 shadow-xl relative' 
                  : 'bg-zinc-900/30 border-zinc-900'
              }`}
            >
              {opt.type === 'premium' && (
                <span className="absolute -top-3 left-6 bg-purple-600 text-white font-mono text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-full border border-purple-500 shadow-md">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="text-zinc-400 font-mono text-xs uppercase">{opt.name}</h4>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-mono font-black text-white">${opt.price.toFixed(2)}</span>
                    <span className="text-zinc-550 text-[10px] font-mono">/one-time</span>
                  </div>
                </div>

                <ul className="space-y-2 border-t border-zinc-900/70 pt-4">
                  {opt.features.map((feat, idx) => (
                    <li key={idx} className="flex gap-2 items-start text-xs text-zinc-400">
                      <Check className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-zinc-950/50 border border-zinc-900 rounded-xl flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <span className="text-[10px] text-zinc-500 font-mono">Includes Signed PDF Contract Contract</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Contact & Collaboration forms segment */}
      <section id="contact-section" className="max-w-7xl mx-auto px-6 border-t border-zinc-900 pt-16 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Bio side details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-4">
              <img 
                src={PRODUCER_PROFILE.avatarUrl} 
                alt={PRODUCER_PROFILE.name} 
                className="w-16 h-16 rounded-2xl object-cover border border-zinc-850"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="text-xl font-sans font-black text-white tracking-tight">{PRODUCER_PROFILE.name}</h4>
                <p className="text-xs text-purple-400 font-mono">{PRODUCER_PROFILE.tagline}</p>
              </div>
            </div>

            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-sans">
              {PRODUCER_PROFILE.about}
            </p>

            <div className="space-y-3 font-mono text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <span className="text-zinc-300">{PRODUCER_PROFILE.socials.email}</span>
              </div>
              <div className="flex gap-3 pt-2">
                <a href={`https://${PRODUCER_PROFILE.socials.instagram}`} target="_blank" rel="noreferrer" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors" title="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href={`https://${PRODUCER_PROFILE.socials.youtube}`} target="_blank" rel="noreferrer" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors" title="YouTube">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href={`https://${PRODUCER_PROFILE.socials.twitter}`} target="_blank" rel="noreferrer" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors" title="Twitter">
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7 bg-zinc-900/20 border border-zinc-900 p-6 md:p-8 rounded-3xl space-y-6">
            <div>
              <h4 className="text-lg font-sans font-bold text-white tracking-tight">Need Custom Sounds?</h4>
              <p className="text-xs text-zinc-500 font-mono mt-1">Submit vocal references or custom tempo arrangements for custom exclusivity options.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase">Your Name</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none transition-all font-sans"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none transition-all font-sans"
                    placeholder="artist@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase">Interest Scope</label>
                <select 
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-all font-mono"
                >
                  <option value="Custom Beat Inquiry">Custom Beat Inquiry</option>
                  <option value="Exclusive Rights Purchase">Exclusive Rights Purchase</option>
                  <option value="Song Writing Collaboration">Song Writing Cooperation</option>
                  <option value="Sound Design Consulting">Other Inquiries</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase">Message details</label>
                <textarea 
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none transition-all font-sans resize-none"
                  placeholder="Outline references, timelines, and links to your previous tracks..."
                />
              </div>

              {submitted && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 text-emerald-400 font-mono text-xs rounded-xl flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-bounce" />
                  Your query has been recorded. beatsbyramz will get back to you within 24 hours!
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                id="btn-submit-contact"
                className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white font-mono text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Sending inquiry...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Inquiry Details</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* 3. Base footer lines */}
      <div className="max-w-7xl mx-auto px-6 border-t border-zinc-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-650 text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
          <span>© 2026 beatsbyramz. All licensing rights reserved.</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Engineered and synthesized with</span>
          <Heart className="w-3 h-3 text-red-650 fill-red-650" />
          <span>locally in browser</span>
        </div>
      </div>

    </footer>
  );
}

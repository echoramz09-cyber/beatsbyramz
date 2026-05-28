import { useState, useEffect, FormEvent } from 'react';
import { Mail, Instagram, Youtube, Twitter, Radio, Check, Send, Heart, Sparkles } from 'lucide-react';
import { PRODUCER_PROFILE } from '../data';
import { motion } from 'motion/react';

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
      
      {/* 2. Contact & Collaboration forms segment */}
      <section id="contact-section" className="max-w-7xl mx-auto px-6 pt-16 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Bio side details */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-5 space-y-6"
          >
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
                <motion.a whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.95 }} href={`https://${PRODUCER_PROFILE.socials.instagram}`} target="_blank" rel="noreferrer" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors" title="Instagram">
                  <Instagram className="w-4 h-4" />
                </motion.a>
                <motion.a whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.95 }} href={`https://${PRODUCER_PROFILE.socials.youtube}`} target="_blank" rel="noreferrer" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors" title="YouTube">
                  <Youtube className="w-4 h-4" />
                </motion.a>
                <motion.a whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.95 }} href={`https://${PRODUCER_PROFILE.socials.twitter}`} target="_blank" rel="noreferrer" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors" title="Twitter">
                  <Twitter className="w-4 h-4" />
                </motion.a>
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 bg-zinc-900/20 border border-zinc-900 p-6 md:p-8 rounded-3xl space-y-6"
          >
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

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
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
              </motion.button>
            </form>
          </motion.div>

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

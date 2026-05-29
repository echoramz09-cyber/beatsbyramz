import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, Shield, Plus, Edit2, Trash2, X, Music, Check, Settings, Save, Sparkles, Filter, ChevronRight, Hash, Layout } from 'lucide-react';
import { signInAnonymously, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { fetchBeats, addBeat, updateBeat, deleteBeat } from '../lib/beatService';
import { fetchGenres, addGenre, deleteGenre, Genre } from '../lib/genreService';
import { Track } from '../types';

interface AdminPanelProps {
  onCatalogRefresh: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ onCatalogRefresh, isOpen, onClose }: AdminPanelProps) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('beatsbyramz_admin_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Catalog items
  const [beats, setBeats] = useState<Track[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeFormTab, setActiveFormTab] = useState<'list' | 'add' | 'edit' | 'genres'>('list');
  const [selectedBeat, setSelectedBeat] = useState<Track | null>(null);
  const [adminGenreFilter, setAdminGenreFilter] = useState('All');

  // Genre management state
  const [newGenreName, setNewGenreName] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    bpm: 140,
    key: 'G Minor',
    genre: 'Trap',
    tagsString: '808; Atmospheric; Trap',
    priceBasic: 29,
    pricePremium: 49,
    priceUnlimited: 149,
    duration: '3:00',
    artwork: '',
    mood: 'Dark' as Track['mood'],
    beatUrl: ''
  });

  // Default Artwork mapping by genre
  const genreArtworks: Record<string, string> = {
    'ototoa': 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300&h=300',
    'Pop': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=300&h=300',
    'Trap': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=300&h=300',
    'Lofi Chill': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300&h=300',
    'Synthwave': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300&h=300',
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        localStorage.setItem('beatsbyramz_admin_session', JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          isFirebase: true
        }));
      }
      setIsLoading(false);
    });

    if (user) {
      loadBeats();
      loadGenres();
    }

    return () => unsubscribe();
  }, []);

  const loadBeats = async () => {
    try {
      const list = await fetchBeats();
      setBeats(list);
    } catch (e) {
      console.error(e);
    }
  };

  const loadGenres = async () => {
    try {
      const list = await fetchGenres();
      setGenres(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGenreName.trim()) return;
    setIsSubmitting(true);
    try {
      await addGenre(newGenreName.trim());
      setNewGenreName('');
      await loadGenres();
    } catch (err) {
      alert('Failed to add genre.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGenre = async (id: string) => {
    if (confirm('Delete this genre? Existing beats with this genre will keep it until edited.')) {
      try {
        await deleteGenre(id);
        await loadGenres();
      } catch (err) {
        alert('Failed to delete genre.');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    if (username === 'asxramzonfire09' && password === 'rehanabegum123') {
      try {
        // Attempt anonymous sign-in, but don't block if it's disabled in console
        await signInAnonymously(auth).catch(err => {
          console.warn('Anonymous Auth disabled in console. Proceeding with local admin session.', err);
        });
        
        // Establish a local admin session even if Auth provider is disabled
        const mockUser = { uid: 'admin-bypass', email: 'admin@beatsbyramz.fire' } as any;
        localStorage.setItem('beatsbyramz_admin_session', JSON.stringify(mockUser));
        setUser(mockUser); 
        loadBeats();
        loadGenres();
        setIsLoading(false);
      } catch (err: any) {
        setLoginError(`Login Error: ${err.message || 'Unknown error'}`);
        console.error('Login Error:', err);
      }
    } else {
      setLoginError('Invalid Administrator credentials.');
    }
    setIsSubmitting(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('beatsbyramz_admin_session');
      setUser(null);
      setBeats([]);
      setUsername('');
      setPassword('');
      setActiveFormTab('list');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const handleEditClick = (beat: Track) => {
    setSelectedBeat(beat);
    setFormData({
      title: beat.title,
      tagline: beat.tagline,
      bpm: beat.bpm,
      key: beat.key,
      genre: beat.genre,
      tagsString: beat.tags.join('; '),
      priceBasic: beat.priceBasic,
      pricePremium: beat.pricePremium,
      priceUnlimited: beat.priceUnlimited,
      duration: beat.duration,
      artwork: beat.artwork,
      mood: beat.mood,
      beatUrl: beat.beatUrl || ''
    });
    setActiveFormTab('edit');
  };

  const handleAddClick = () => {
    setSelectedBeat(null);
    setFormData({
      title: '',
      tagline: '',
      bpm: 140,
      key: 'G Minor',
      genre: 'Trap',
      tagsString: '808; Atmospheric; Trap',
      priceBasic: 29,
      pricePremium: 49,
      priceUnlimited: 149,
      duration: '3:00',
      artwork: '',
      mood: 'Dark',
      beatUrl: ''
    });
    setActiveFormTab('add');
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm('Are you strictly sure you want to delete this beat from the server? This action is irreversible.')) {
      try {
        await deleteBeat(id);
        await loadBeats();
        onCatalogRefresh();
      } catch (err) {
        alert('Deletion failed due to rules check.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (adminGenreFilter === 'All') return;
    
    const targets = beats.filter(b => b.genre === adminGenreFilter);
    if (targets.length === 0) return;

    if (confirm(`MASS PURGE WARNING: You are about to delete ALL ${targets.length} beats in the "${adminGenreFilter}" genre. This cannot be undone. Proceed?`)) {
       setIsSubmitting(true);
       try {
         for (const beat of targets) {
           await deleteBeat(beat.id);
         }
         await loadBeats();
         onCatalogRefresh();
         alert(`Successfully purged ${targets.length} beats.`);
       } catch (err) {
         alert('Bulk deletion partially failed.');
       } finally {
         setIsSubmitting(false);
       }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const tags = formData.tagsString
      .split(';')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const finalArtwork = formData.artwork || genreArtworks[formData.genre] || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300&h=300';

    // Trim all inputs and prepare payload
    const trimmedBeatUrl = formData.beatUrl?.trim();
    
    const beatPayload = {
      title: formData.title.trim(),
      tagline: formData.tagline?.trim() || `${formData.mood} styled rhythm`,
      bpm: Number(formData.bpm),
      key: formData.key.trim(),
      genre: formData.genre,
      tags,
      priceBasic: Number(formData.priceBasic),
      pricePremium: Number(formData.pricePremium),
      priceUnlimited: Number(formData.priceUnlimited),
      duration: formData.duration?.trim() || '3:00',
      artwork: finalArtwork.trim(),
      mood: formData.mood,
      beatUrl: trimmedBeatUrl
    };

    try {
      if (activeFormTab === 'edit' && selectedBeat) {
        await updateBeat(selectedBeat.id, beatPayload);
      } else {
        await addBeat(beatPayload);
      }
      setActiveFormTab('list');
      await loadBeats();
      onCatalogRefresh();
    } catch (err) {
      alert('Save operation failed. Please check your network and security parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Ambient overlay */}
      <div className="absolute inset-0 bg-zinc-950/98 md:bg-zinc-950/80 md:backdrop-blur-md" onClick={onClose}></div>

      {/* Main Container */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-zinc-900 border border-zinc-800/80 w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans z-10"
      >
        {/* Title Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-sans tracking-wider uppercase font-black text-zinc-100">Producer Command Console</h2>
              <p className="text-[10px] text-zinc-500 font-sans font-bold uppercase tracking-wider">Live database synchronization powered by Cloud Firestore</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-white bg-zinc-850 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Gate Screen */}
        {!user ? (
          <div className="flex-grow flex flex-col justify-center items-center py-16 px-6 max-w-sm mx-auto w-full">
            <h3 className="text-xl font-bold font-sans tracking-tight mb-2 flex items-center gap-1">
              Administrator Login
            </h3>
            <p className="text-xs text-zinc-400 text-center mb-6">Enter command credentials below to load write permissions</p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div>
                <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest mb-1">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="asxramzonfire09"
                  className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-800 focus:border-purple-500 text-sm focus:outline-none placeholder-zinc-750 transition-all font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-800 focus:border-purple-500 text-sm focus:outline-none placeholder-zinc-750 transition-all font-mono"
                  required
                />
              </div>

              {loginError && (
                <div className="text-[10px] text-rose-400 font-mono text-center pt-1 animate-bounce">
                  ⚠ {loginError}
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Authorize Terminal</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Logged In Dashboard Screen */
          <div className="flex-grow flex flex-col md:flex-row overflow-hidden bg-zinc-900">
            {/* Sidebar Controls */}
            <div className="w-full md:w-52 border-b md:border-b-0 md:border-r border-zinc-850 px-4 py-5 flex flex-col justify-between gap-4 flex-shrink-0 bg-zinc-950/20">
              <div className="space-y-1">
                <div className="text-[9px] font-sans font-bold text-zinc-500 uppercase tracking-widest px-2 mb-2">Controls</div>
                
                <button
                  onClick={() => setActiveFormTab('list')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
                    activeFormTab === 'list' 
                      ? 'bg-purple-650 text-white shadow-md shadow-purple-950/30' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-850/40'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Tracks Catalog</span>
                </button>

                <button
                  onClick={handleAddClick}
                  className={`w-full text-left px-3 py-2 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
                    activeFormTab === 'add' 
                      ? 'bg-purple-650 text-white shadow-md shadow-purple-950/30' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-850/40'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Beat</span>
                </button>

                <button
                  onClick={() => setActiveFormTab('genres')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
                    activeFormTab === 'genres' 
                      ? 'bg-purple-650 text-white shadow-md shadow-purple-950/30' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-850/40'
                  }`}
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>Manage Genres</span>
                </button>
              </div>

              <div>
                <div className="border-t border-zinc-850 pt-4 px-2 pb-2">
                  <div className="text-[9px] truncate text-emerald-400 font-mono flex items-center gap-1.5 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Admin Session</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left font-mono text-[10px] text-zinc-500 hover:text-rose-400 flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Exit Command</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Section panel */}
            <div className="flex-grow flex flex-col min-h-0">
              
              {/* Beats List */}
              {activeFormTab === 'list' && (
                <div className="flex-grow flex flex-col overflow-hidden px-6 py-6">
                  <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <h4 className="text-base font-bold font-sans tracking-tight">Active Instrumentals</h4>
                      <p className="text-[10px] text-zinc-400 font-mono">Total catalog tracks: {beats.length}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       {adminGenreFilter !== 'All' && (
                         <button 
                           onClick={handleBulkDelete}
                           className="bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-900/30 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                         >
                           <Trash2 className="w-3 h-3" />
                           Purge All
                         </button>
                       )}
                       <span className="text-[9px] text-zinc-500 font-mono uppercase">Filter:</span>
                       <select 
                         value={adminGenreFilter}
                         onChange={(e) => setAdminGenreFilter(e.target.value)}
                         className="bg-zinc-950 border border-zinc-850 rounded-lg px-2 py-1 text-[10px] font-mono focus:outline-none focus:border-purple-500"
                       >
                         <option value="All">All Genres</option>
                         {genres.map(g => (
                           <option key={g.id} value={g.name}>{g.name}</option>
                         ))}
                       </select>
                    </div>
                  </div>

                  <div className="flex-grow overflow-y-auto pr-1">
                    {isLoading ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-2">
                        <span className="w-6 h-6 border-2 border-t-transparent border-purple-500 rounded-full animate-spin"></span>
                        <span className="text-[10px] text-zinc-500 font-mono">Synchronizing beats...</span>
                      </div>
                    ) : beats.filter(b => adminGenreFilter === 'All' || b.genre === adminGenreFilter).length === 0 ? (
                      <div className="border border-dashed border-zinc-800 text-center rounded-2xl py-12 px-4 shadow-inner bg-zinc-950/20">
                        <span className="text-xs text-zinc-500">No tracks matches the current filter.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2.5 pb-2">
                        {beats
                          .filter(b => adminGenreFilter === 'All' || b.genre === adminGenreFilter)
                          .map((beat) => (
                          <div 
                            key={beat.id}
                            className="flex items-center justify-between bg-zinc-950/40 hover:bg-zinc-950/80 border border-zinc-850/60 hover:border-zinc-800 px-4 py-3 rounded-2xl transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img 
                                src={beat.artwork} 
                                alt={beat.title} 
                                className="w-10 h-10 rounded-xl object-cover border border-zinc-800 flex-shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0">
                                <h5 className="text-xs text-zinc-100 font-sans font-bold truncate leading-none">{beat.title}</h5>
                                <p className="text-[9px] text-zinc-500 font-mono truncate leading-none pt-1">
                                  {beat.genre} • {beat.bpm} BPM • {beat.duration} • {beat.key}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditClick(beat)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                title="Edit Beat Parameters"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(beat.id)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-955/10 transition-colors"
                                title="Delete Beat From DB"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Genre Management Panel */}
              {activeFormTab === 'genres' && (
                <div className="flex-grow flex flex-col overflow-hidden px-6 py-6 font-sans">
                  <div className="mb-6">
                    <h4 className="text-base font-bold tracking-tight">Genre Architecture</h4>
                    <p className="text-[10px] text-zinc-400 font-mono">Create custom classification tags for your catalog</p>
                  </div>

                  <form onSubmit={handleAddGenre} className="mb-6 flex gap-2">
                    <input 
                      type="text"
                      value={newGenreName}
                      onChange={(e) => setNewGenreName(e.target.value)}
                      placeholder="e.g., Afro-Fusion"
                      className="flex-grow bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                    />
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Genre
                    </button>
                  </form>

                  <div className="flex-grow overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                      {genres.map((genre) => (
                        <div key={genre.id} className="flex items-center justify-between bg-zinc-950/40 border border-zinc-850 px-4 py-3 rounded-2xl group">
                          <span className="text-xs font-mono text-zinc-100">{genre.name}</span>
                          <button 
                            onClick={() => handleDeleteGenre(genre.id)}
                            className="p-1.5 rounded-lg text-zinc-650 hover:text-rose-400 hover:bg-rose-955/10 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Add & Edit Form */}
              {(activeFormTab === 'add' || activeFormTab === 'edit') && (
                <form onSubmit={handleFormSubmit} className="flex-grow flex flex-col overflow-hidden">
                  <div className="px-6 pt-6 pb-2">
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                      <h4 className="text-sm font-mono uppercase tracking-wider text-purple-400 font-extrabold">
                        {activeFormTab === 'edit' ? 'Edit Instrumental parameters' : 'Design new instrumental'}
                      </h4>
                      <button 
                        type="button" 
                        onClick={() => setActiveFormTab('list')}
                        className="text-[10px] font-mono text-zinc-500 hover:text-white"
                      >
                        ← Cancel
                      </button>
                    </div>
                  </div>

                  <div className="flex-grow overflow-y-auto px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Beat Name */}
                      <div>
                        <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1 leading-none">Beat Name/Title</label>
                        <input 
                          type="text" 
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g., Midnight Stars"
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                          required
                        />
                      </div>

                      {/* Tagline */}
                      <div>
                        <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1 leading-none">Short Tagline/Vibe</label>
                        <input 
                          type="text" 
                          value={formData.tagline}
                          onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                          placeholder="e.g., Mellow lo-pass filtered trap backing"
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>

                      {/* BPM */}
                      <div>
                        <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1 leading-none">BPM</label>
                        <input 
                          type="number" 
                          value={formData.bpm}
                          onChange={(e) => setFormData({ ...formData, bpm: Number(e.target.value) })}
                          placeholder="140"
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                          required
                        />
                      </div>

                      {/* Musical Key */}
                      <div>
                        <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1 leading-none">Scale Key</label>
                        <input 
                          type="text" 
                          value={formData.key}
                          onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                          placeholder="e.g., F Minor"
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>

                      {/* Genre selection */}
                      <div>
                        <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1 leading-none">Genre Classification</label>
                        <select 
                          value={formData.genre}
                          onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-300"
                        >
                          {genres.length > 0 ? (
                            genres.map(g => (
                              <option key={g.id} value={g.name}>{g.name}</option>
                            ))
                          ) : (
                            <option value="Trap">Trap</option>
                          )}
                        </select>
                      </div>

                      {/* Mood Selection */}
                      <div>
                        <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1 leading-none">Primary Mood</label>
                        <select 
                          value={formData.mood}
                          onChange={(e) => setFormData({ ...formData, mood: e.target.value as Track['mood'] })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-300"
                        >
                          <option value="Dark">Dark</option>
                          <option value="Chill">Chill</option>
                          <option value="Energetic">Energetic</option>
                          <option value="Inspiring">Inspiring</option>
                          <option value="Hypnotic">Hypnotic</option>
                          <option value="Happy">Happy</option>
                          <option value="Sad">Sad</option>
                          <option value="Intense">Intense</option>
                        </select>
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1 leading-none">Time Duration (MM:SS)</label>
                        <input 
                          type="text" 
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          placeholder="3:45"
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                          required
                        />
                      </div>

                      {/* Artwork URL */}
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1 leading-none">Artwork URL (Unsplash or direct image link)</label>
                        <input 
                          type="text" 
                          value={formData.artwork}
                          onChange={(e) => setFormData({ ...formData, artwork: e.target.value })}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>

                      {/* Beat URL (The music audio track path) */}
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest leading-none">Audio File URL (Direct MP3 Link)</label>
                          <span className="text-[8px] text-purple-400 font-mono leading-none">Must start with files.catbox.moe for best results</span>
                        </div>
                        <input 
                          type="text" 
                          value={formData.beatUrl}
                          onChange={(e) => setFormData({ ...formData, beatUrl: e.target.value })}
                          placeholder="https://files.catbox.moe/abc123.mp3"
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono text-purple-200"
                          required
                        />
                      </div>

                      {/* Semicolon separated tags */}
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1 leading-none">Tags / Styles (Separate by Semicolon)</label>
                        <input 
                          type="text" 
                          value={formData.tagsString}
                          onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
                          placeholder="Chill; Relaxed; Melancholic"
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>

                      {/* Basic Price */}
                      <div>
                        <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1 leading-none">Basic License ($)</label>
                        <input 
                          type="number" 
                          value={formData.priceBasic}
                          onChange={(e) => setFormData({ ...formData, priceBasic: Number(e.target.value) })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>

                      {/* Premium Price */}
                      <div>
                        <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1 leading-none">Premium License ($)</label>
                        <input 
                          type="number" 
                          value={formData.pricePremium}
                          onChange={(e) => setFormData({ ...formData, pricePremium: Number(e.target.value) })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>

                      {/* Unlimited Price */}
                      <div>
                        <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1 leading-none">Unlimited License ($)</label>
                        <input 
                          type="number" 
                          value={formData.priceUnlimited}
                          onChange={(e) => setFormData({ ...formData, priceUnlimited: Number(e.target.value) })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-zinc-850 bg-zinc-950/20 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveFormTab('list')}
                      className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-sans font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-purple-900/20"
                    >
                      {isSubmitting ? (
                        <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Beat Parameter</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Track } from './types';
import { TRACKS } from './data';
import AudioEngine from './utils/AudioEngine';

// Import UI sub-components
import Header from './components/Header';
import Hero from './components/Hero';
import TrackList from './components/TrackList';
import Footer from './components/Footer';
import CustomAudioPlayer from './components/CustomAudioPlayer';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  
  // Track inquiry variables to pass into the footer's contact form
  const [contactPrefill, setContactPrefill] = useState<{
    subject: string;
    message: string;
  } | null>(null);

  // Sync isPlaying & activeTrack with state changes from the central AudioEngine singleton
  useEffect(() => {
    const handleEngineChange = (state: any) => {
      setIsPlaying(state.isPlaying);
      setActiveTrack(state.currentTrack);
    };

    const unsubscribe = AudioEngine.subscribe(handleEngineChange);
    return () => unsubscribe();
  }, []);

  // Play controls
  const handlePlayToggle = (track: Track) => {
    AudioEngine.togglePlay(track);
  };

  // Handle beat inquiry redirection & pre-fill (No licensing or pricing details)
  const handleInquiryClick = (track: Track) => {
    const subject = `Inquiry: "${track.title}"`;
    const message = `Hi beatsbyramz,\n\nI am ultra interested in inquiring about your beat "${track.title}" (${track.genre}, ${track.bpm} BPM).\n\nPlease get back to me with the availability or collaboration options for this beat!`;

    // Set form prefill details
    setContactPrefill({ subject, message });

    // Smooth scroll down to the contact inquiries segment
    setTimeout(() => {
      const contactSec = document.getElementById('contact-section');
      if (contactSec) {
        contactSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Flash visual highlight of the inquiries box for responsive UX
        const formBox = contactSec.querySelector('form');
        if (formBox) {
          formBox.classList.add('neon-border');
          setTimeout(() => {
            formBox.classList.remove('neon-border');
          }, 3000);
        }
      }
    }, 155);
  };

  // Default trending track
  const trendingTrack = TRACKS.length > 0 ? TRACKS[0] : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-purple-600 selection:text-white flex flex-col justify-between transition-colors duration-500">
      
      {/* Upper Navigation Header */}
      <Header />

      {/* Main Core Body */}
      <main className="flex-grow pb-12">
        
        {/* Banner/Hero Section */}
        <Hero 
          trendingTrack={trendingTrack}
          isPlaying={isPlaying}
          isPlayingTrending={!!trendingTrack && activeTrack?.id === trendingTrack.id && isPlaying}
          onPlayToggle={handlePlayToggle}
          onInquiryClick={handleInquiryClick}
        />

        {/* Beats Selector Section */}
        <TrackList 
          tracks={TRACKS}
          onPlayToggle={handlePlayToggle}
          onInquiryClick={handleInquiryClick}
          activeTrackId={activeTrack?.id}
          isPlaying={isPlaying}
        />

      </main>

      {/* Contract comparison & Message grids */}
      <Footer prefill={contactPrefill} />

      {/* Sticky Player HUD */}
      <CustomAudioPlayer 
        onInquiryClick={handleInquiryClick} 
      />

    </div>
  );
}

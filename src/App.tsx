import { useState, useEffect } from 'react';
import { Track, LicenseType } from './types';
import { TRACKS } from './data';
import AudioEngine from './utils/AudioEngine';

// Import UI sub-components
import Header from './components/Header';
import Hero from './components/Hero';
import TrackList from './components/TrackList';
import Footer from './components/Footer';
import CustomAudioPlayer from './components/CustomAudioPlayer';
import LicensingModal from './components/LicensingModal';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [selectedTrackForLicense, setSelectedTrackForLicense] = useState<Track | null>(null);
  
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

  // Licensing modal trigger
  const handleLicensingClick = (track: Track) => {
    setSelectedTrackForLicense(track);
  };

  // Handle licensing inquiry redirection & pre-fill
  const handleInquiryRequest = (track: Track, licenseType: LicenseType, price: number) => {
    const licenseName = licenseType.toUpperCase();
    
    // Choose the closest relevant subject
    const subject = licenseType === 'unlimited' ? 'Exclusive Rights Purchase' : 'Custom Beat Inquiry';
    
    // Pre-create the custom message
    const message = `Hi beatsbyramz,\n\nI am extremely interested in obtaining the ${licenseName} License Lease for your beat "${track.title}" (priced at $${price.toFixed(2)}). \n\nPlease send through the licensing contract or next payment instructions so we can secure this beat for my upcoming release!`;

    // Set form prefill details
    setContactPrefill({ subject, message });

    // Close modal
    setSelectedTrackForLicense(null);

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
    }, 150);
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
          onLicensingClick={handleLicensingClick}
        />

        {/* Beats Selector Section */}
        <TrackList 
          tracks={TRACKS}
          onPlayToggle={handlePlayToggle}
          onLicensingClick={handleLicensingClick}
          activeTrackId={activeTrack?.id}
          isPlaying={isPlaying}
        />

      </main>

      {/* Contract comparison & Message grids */}
      <Footer prefill={contactPrefill} />

      {/* Sticky Player HUD */}
      <CustomAudioPlayer 
        onLicensingClick={handleLicensingClick} 
      />

      {/* Overlays / Triggers */}
      {selectedTrackForLicense && (
        <LicensingModal 
          track={selectedTrackForLicense}
          onClose={() => setSelectedTrackForLicense(null)}
          onInquiryRequest={handleInquiryRequest}
        />
      )}

    </div>
  );
}

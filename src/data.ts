import { Track, ProducerProfile, LicenseOption } from './types';

export const PRODUCER_PROFILE: ProducerProfile = {
  name: "beatsbyramz",
  tagline: "Platinum Multi-Genre Sound Architect",
  about: "Welcome to my portfolio. I engineer top-tier, industry-standard beats ranging from heavy 808 ambient trap, nostalgic low-pass filtered lofi chill, to high energy cybernetic hyperpop. Review the showcase catalog, choose your lease license, and submit an inquiry today to lay down your next masterpiece.",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300",
  socials: {
    instagram: "instagram.com/beatsbyramz",
    youtube: "youtube.com/beatsbyramz",
    twitter: "twitter.com/beatsbyramz",
    soundcloud: "soundcloud.com/beatsbyramz",
    email: "collabs@beatsbyramz.com"
  }
};

export const LICENSE_OPTIONS: LicenseOption[] = [
  {
    type: 'basic',
    name: "MP3 Lease",
    price: 29.99,
    features: [
      "High-quality MP3 file",
      "Sell up to 3,000 copies",
      "Up to 100,000 audio streams",
      "For non-commercial use only",
      "Must credit (Prod. by beatsbyramz)"
    ]
  },
  {
    type: 'premium',
    name: "WAV + Stems lease",
    price: 79.99,
    features: [
      "Premium WAV + individual track stems",
      "Sell up to 15,000 copies",
      "Up to 500,000 audio streams",
      "Commercial distribution allowed",
      "Must credit (Prod. by beatsbyramz)"
    ]
  },
  {
    type: 'unlimited',
    name: "Unlimited Ownership",
    price: 199.99,
    features: [
      "WAV + Stems + MIDI files",
      "Unlimited sales copies",
      "Unlimited commercial streams",
      "100% royalty-free profit splits",
      "No credit restriction"
    ]
  }
];

export const TRACKS: Track[] = [];

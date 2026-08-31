export interface Track {
  id: string;
  title: string;
  tagline: string;
  bpm: number;
  key: string;
  genre: string;
  tags: string[];
  priceBasic: number; // MP3 License price in INR (₹)
  pricePremium: number; // WAV License price in INR (₹)
  priceUnlimited: number; // WAV + Stems License price in INR (₹)
  priceExclusive?: number; // Exclusive License price in INR (₹)
  duration: string;
  artwork: string;
  mood: 'Dark' | 'Chill' | 'Energetic' | 'Inspiring' | 'Hypnotic' | 'Happy' | 'Sad' | 'Intense';
  beatUrl?: string;
  plays?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type LicenseType = 'mp3' | 'wav' | 'stems' | 'exclusive';

export interface LicenseOption {
  type: LicenseType;
  name: string;
  price: number;
  format: string;
  features: string[];
}

export interface CartItem {
  id: string; // unique cart item id (trackId + licenseType)
  track: Track;
  licenseType: LicenseType;
  price: number;
}

export interface ProducerProfile {
  name: string;
  tagline: string;
  avatarUrl: string;
  socials: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
    soundcloud?: string;
    email?: string;
  };
}

export interface Track {
  id: string;
  title: string;
  tagline: string;
  bpm: number;
  key: string;
  genre: string;
  tags: string[];
  priceBasic: number;
  pricePremium: number;
  priceUnlimited: number;
  duration: string;
  artwork: string;
  mood: 'Dark' | 'Chill' | 'Energetic' | 'Inspiring' | 'Hypnotic' | 'Happy' | 'Sad' | 'Intense';
  beatUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type LicenseType = 'basic' | 'premium' | 'unlimited';

export interface LicenseOption {
  type: LicenseType;
  name: string;
  price: number;
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

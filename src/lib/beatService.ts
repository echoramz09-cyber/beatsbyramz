import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Track } from '../types';

const COLLECTION_NAME = 'beats';

const DEFAULT_SEED_BEATS = [
  // OTOTOA GENRE (10 Tracks)
  {
    id: 'ototoa-1',
    title: 'Midnight Echo',
    tagline: 'Deep atmospheric textures with a rhythmic pulse',
    bpm: 128,
    key: 'A Minor',
    genre: 'ototoa',
    tags: ['Ethereal', 'Deep', 'Rhythmic'],
    priceBasic: 25,
    pricePremium: 45,
    priceUnlimited: 125,
    duration: '3:45',
    artwork: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300&h=300',
    beatUrl: 'https://actions.google.com/sounds/v1/music/synth_funk.ogg',
    mood: 'Chill'
  },
  {
    id: 'ototoa-2',
    title: 'Neon Drift',
    tagline: 'Cybernetic melodies for late night sessions',
    bpm: 110,
    key: 'D Major',
    genre: 'ototoa',
    tags: ['Cyber', 'Smooth', 'Analog'],
    priceBasic: 25,
    pricePremium: 45,
    priceUnlimited: 125,
    duration: '4:12',
    artwork: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=300&h=300',
    beatUrl: 'https://actions.google.com/sounds/v1/music/electro_house.ogg',
    mood: 'Energetic'
  },
  {
    id: 'ototoa-3',
    title: 'Silent Horizon',
    tagline: 'Expansive soundscapes and minimal beats',
    bpm: 95,
    key: 'E Minor',
    genre: 'ototoa',
    tags: ['Minimal', 'Ambient', 'Future'],
    priceBasic: 30,
    pricePremium: 55,
    priceUnlimited: 150,
    duration: '3:50',
    artwork: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=300&h=300',
    beatUrl: 'https://actions.google.com/sounds/v1/music/electronic_beat.ogg',
    mood: 'Chill'
  },
  { id: 'ototoa-4', title: 'Quartz Pulse', tagline: 'Crystalline rhythms', bpm: 120, key: 'C Minor', genre: 'ototoa', tags: ['Sharp', 'Digital'], priceBasic: 25, pricePremium: 45, priceUnlimited: 125, duration: '3:20', artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=300&h=300', beatUrl: 'https://actions.google.com/sounds/v1/music/hip_hop_fanfare.ogg', mood: 'Intense' },
  { id: 'ototoa-5', title: 'Velvet Void', tagline: 'Smooth dark textures', bpm: 88, key: 'G Minor', genre: 'ototoa', tags: ['Dark', 'Velvet'], priceBasic: 25, pricePremium: 45, priceUnlimited: 125, duration: '4:05', artwork: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=300&h=300', beatUrl: 'https://actions.google.com/sounds/v1/music/chill_wave.ogg', mood: 'Dark' },
  { id: 'ototoa-6', title: 'Static Rain', tagline: 'Lo-fi glitches and rain', bpm: 92, key: 'F Major', genre: 'ototoa', tags: ['Glitch', 'Lofi'], priceBasic: 25, pricePremium: 45, priceUnlimited: 125, duration: '3:33', artwork: 'https://images.unsplash.com/photo-1543967354-20616198f395?auto=format&fit=crop&q=80&w=300&h=300', beatUrl: 'https://actions.google.com/sounds/v1/music/ambient_piano.ogg', mood: 'Sad' },
  { id: 'ototoa-7', title: 'Solar Flare', tagline: 'Warm cinematic build-up', bpm: 140, key: 'E Major', genre: 'ototoa', tags: ['Epic', 'Solar'], priceBasic: 35, pricePremium: 65, priceUnlimited: 180, duration: '4:45', artwork: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=300&h=300', beatUrl: 'https://actions.google.com/sounds/v1/music/tropical_house.ogg', mood: 'Energetic' },
  { id: 'ototoa-8', title: 'Deep Current', tagline: 'Underwater bass grooves', bpm: 115, key: 'B Minor', genre: 'ototoa', tags: ['Sub', 'Deep'], priceBasic: 25, pricePremium: 45, priceUnlimited: 125, duration: '3:55', artwork: 'https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&q=80&w=300&h=300', beatUrl: 'https://actions.google.com/sounds/v1/music/latin_percussion.ogg', mood: 'Chill' },
  { id: 'ototoa-9', title: 'Ether Gate', tagline: 'Ancestral future fusion', bpm: 105, key: 'A Major', genre: 'ototoa', tags: ['Tribal', 'Future'], priceBasic: 25, pricePremium: 45, priceUnlimited: 125, duration: '3:40', artwork: 'https://images.unsplash.com/photo-1528722828814-77b9b83acf6d?auto=format&fit=crop&q=80&w=300&h=300', beatUrl: 'https://actions.google.com/sounds/v1/music/rock_guitar.ogg', mood: 'Inspiring' },
  { id: 'ototoa-10', title: 'Nebula Step', tagline: 'Fast paced spatial rhythms', bpm: 160, key: 'D Minor', genre: 'ototoa', tags: ['Spacial', 'Fast'], priceBasic: 30, pricePremium: 55, priceUnlimited: 150, duration: '3:15', artwork: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=300&h=300', beatUrl: 'https://actions.google.com/sounds/v1/music/jazz_piano.ogg', mood: 'Energetic' },

  // POP GENRE (10 Tracks)
  {
    id: 'pop-1',
    title: 'Sunset Vibes',
    tagline: 'Upbeat summer anthem for party moods',
    bpm: 124,
    key: 'C Major',
    genre: 'Pop',
    tags: ['Summer', 'Party', 'Bright'],
    priceBasic: 29,
    pricePremium: 49,
    priceUnlimited: 149,
    duration: '3:10',
    artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=300&h=300',
    beatUrl: 'https://actions.google.com/sounds/v1/music/electro_house.ogg',
    mood: 'Happy'
  },
  {
    id: 'pop-2',
    title: 'Electric Love',
    tagline: 'Modern synth-pop with a nostalgic twist',
    bpm: 118,
    key: 'G Major',
    genre: 'Pop',
    tags: ['Modern', 'Synth', 'Radio'],
    priceBasic: 29,
    pricePremium: 49,
    priceUnlimited: 149,
    duration: '3:25',
    artwork: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3c?auto=format&fit=crop&q=80&w=300&h=300',
    beatUrl: 'https://actions.google.com/sounds/v1/music/synth_funk.ogg',
    mood: 'Energetic'
  },
  { id: 'pop-3', title: 'Starlight Anthem', tagline: 'Big room pop hooks', bpm: 128, key: 'D Major', genre: 'Pop', tags: ['Big', 'Hooks'], priceBasic: 29, pricePremium: 49, priceUnlimited: 149, duration: '3:45', artwork: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=300&h=300', beatUrl: 'https://actions.google.com/sounds/v1/music/electronic_beat.ogg', mood: 'Inspiring' },
  { id: 'pop-4', title: 'Urban Dream', tagline: 'R&B infused pop groove', bpm: 100, key: 'F Minor', genre: 'Pop', tags: ['Groove', 'Urban'], priceBasic: 29, pricePremium: 49, priceUnlimited: 149, duration: '3:52', artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300&h=300', beatUrl: 'https://actions.google.com/sounds/v1/music/chill_wave.ogg', mood: 'Chill' },
  { id: 'pop-5', title: 'Candy Gloss', tagline: 'Hyper-sweet bubbly production', bpm: 145, key: 'A Major', genre: 'Pop', tags: ['Bubbly', 'Sweet'], priceBasic: 29, pricePremium: 49, priceUnlimited: 149, duration: '2:58', artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300&h=300', beatUrl: 'https://actions.google.com/sounds/v1/music/tropical_house.ogg', mood: 'Happy' },
  { id: 'pop-6', title: 'Velocity', tagline: 'Fast paced driving synthpop', bpm: 155, key: 'B Major', genre: 'Pop', tags: ['Fast', 'Synth'], priceBasic: 29, pricePremium: 49, priceUnlimited: 149, duration: '3:05', artwork: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300&h=300', beatUrl: 'https://actions.google.com/sounds/v1/music/hip_hop_fanfare.ogg', mood: 'Energetic' },
  { id: 'pop-7', title: 'Midnight Drive', tagline: 'Retrowave pop fusion', bpm: 105, key: 'G Minor', genre: 'Pop', tags: ['Retro', 'Night'], priceBasic: 29, pricePremium: 49, priceUnlimited: 149, duration: '4:20', artwork: 'https://images.unsplash.com/photo-1504173010664-32509aaefe92?auto=format&fit=crop&q=80&w=300&h=300', beatUrl: 'https://actions.google.com/sounds/v1/music/jazz_piano.ogg', mood: 'Chill' },
  { id: 'pop-8', title: 'Diamonds', tagline: 'Crystal clear vocals and beats', bpm: 120, key: 'C# Major', genre: 'Pop', tags: ['Clean', 'High'], priceBasic: 35, pricePremium: 65, priceUnlimited: 199, duration: '3:15', artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=300&h=300', beatUrl: 'https://actions.google.com/sounds/v1/music/rock_guitar.ogg', mood: 'Inspiring' },
  { id: 'pop-9', title: 'Golden Hour', tagline: 'Acoustic elements meet pop', bpm: 90, key: 'E Major', genre: 'Pop', tags: ['Acoustic', 'Warm'], priceBasic: 29, pricePremium: 49, priceUnlimited: 149, duration: '3:40', artwork: 'https://images.unsplash.com/photo-1541689221361-ad95003ea29c?auto=format&fit=crop&q=80&w=300&h=300', beatUrl: 'https://actions.google.com/sounds/v1/music/ambient_piano.ogg', mood: 'Happy' },
  { id: 'pop-10', title: 'The Crowd', tagline: 'Festival ready mainstage pop', bpm: 128, key: 'D Minor', genre: 'Pop', tags: ['Festival', 'Main'], priceBasic: 29, pricePremium: 49, priceUnlimited: 149, duration: '3:30', artwork: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=300&h=300', beatUrl: 'https://actions.google.com/sounds/v1/music/latin_percussion.ogg', mood: 'Energetic' },
];

export async function fetchBeats(): Promise<Track[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    
    let beatsList: Track[] = [];
    let hasSeedMarker = false;

    snapshot.forEach((doc) => {
      if (doc.id === '_seed_marker') {
        hasSeedMarker = true;
      } else {
        beatsList.push({ ...doc.data() } as Track);
      }
    });

    // Sort by createdAt desc locally (handling missing fields gracefully)
    beatsList.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    // Only seed if Firestore has never been initialized with seed marker
    if (!hasSeedMarker && beatsList.length === 0) {
      return seedDefaultBeats();
    }

    return beatsList;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    return [];
  }
}

export async function seedDefaultBeats() {
  console.log('Seeding initial beats catalog to Firestore...');
  const results: Track[] = [];
  
  // Set seed marker
  const markerRef = doc(db, COLLECTION_NAME, '_seed_marker');
  await setDoc(markerRef, { seededAt: new Date().toISOString() });

  for (const defaultBeat of DEFAULT_SEED_BEATS) {
    const docRef = doc(db, COLLECTION_NAME, defaultBeat.id);
    const payload = {
      ...defaultBeat,
      createdAt: new Date().toISOString()
    };
    await setDoc(docRef, payload);
    results.push(payload as Track);
  }
  return results;
}

export async function addBeat(track: Omit<Track, 'id'> & { id?: string }): Promise<Track> {
  const finalId = track.id || `beat-${Date.now()}`;
  const fullTrack: Track = {
    ...track,
    id: finalId,
  };

  try {
    const docRef = doc(db, COLLECTION_NAME, finalId);
    await setDoc(docRef, {
      ...fullTrack,
      createdAt: new Date().toISOString()
    });
    return fullTrack;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${finalId}`);
    throw error;
  }
}

export async function updateBeat(id: string, updates: Partial<Track>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
}

export async function deleteBeat(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
}

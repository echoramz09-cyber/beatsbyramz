import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Track } from '../types';

const COLLECTION_NAME = 'beats';

const DEFAULT_SEED_BEATS = [
  {
    id: 'cyber-nebula',
    title: 'Cyber Nebula',
    tagline: 'High-energy cybernetic synthwaves',
    bpm: 125,
    key: 'E Minor',
    genre: 'Synthwave',
    tags: ['Cyberpunk', 'Futuristic', 'Retro'],
    priceBasic: 29,
    pricePremium: 49,
    priceUnlimited: 149,
    duration: '3:12',
    artwork: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300&h=300',
    mood: 'Hypnotic'
  },
  {
    id: 'midnight-drift',
    title: 'Midnight Drift',
    tagline: 'Mellow low-pass filtered lofi vibe',
    bpm: 85,
    key: 'C Major',
    genre: 'Lofi Chill',
    tags: ['Chill', 'Vintage', 'Mellow'],
    priceBasic: 24,
    pricePremium: 44,
    priceUnlimited: 124,
    duration: '2:45',
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300&h=300',
    mood: 'Chill'
  },
  {
    id: 'gravity-808',
    title: 'Gravity 808',
    tagline: 'Deep bass heavy atmospheric trap',
    bpm: 140,
    key: 'G Minor',
    genre: 'Trap',
    tags: ['Atmospheric', '808', 'Dark'],
    priceBasic: 35,
    pricePremium: 59,
    priceUnlimited: 159,
    duration: '3:30',
    artwork: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=300&h=300',
    mood: 'Dark'
  }
];

export async function fetchBeats(): Promise<Track[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    
    let beatsList: Track[] = [];
    snapshot.forEach((doc) => {
      beatsList.push({ ...doc.data() } as Track);
    });

    // Sort by createdAt desc locally (handling missing fields gracefully)
    beatsList.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    // If Firestore is brand new/empty, automatically seed with high-quality default catalog
    if (beatsList.length === 0) {
      console.log('Seeding initial beats catalog to Firestore...');
      for (const defaultBeat of DEFAULT_SEED_BEATS) {
        const docRef = doc(db, COLLECTION_NAME, defaultBeat.id);
        const seedPayload = {
          ...defaultBeat,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, seedPayload);
        beatsList.push(seedPayload as Track);
      }
    }

    return beatsList;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    return [];
  }
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

import { collection, getDocs, doc, setDoc, deleteDoc, query } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

const COLLECTION_NAME = 'genres';

export interface Genre {
  id: string;
  name: string;
}

const DEFAULT_GENRES: Genre[] = [
  { id: 'trap', name: 'Trap' },
  { id: 'lofi-chill', name: 'Lofi Chill' },
  { id: 'synthwave', name: 'Synthwave' },
  { id: 'hyperpop', name: 'Hyperpop' },
  { id: 'hip-hop', name: 'Hip Hop' }
];

export async function fetchGenres(): Promise<Genre[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    
    let genresList: Genre[] = [];
    snapshot.forEach((doc) => {
      genresList.push({ ...doc.data() } as Genre);
    });

    if (genresList.length === 0 && auth.currentUser) {
      for (const defaultGenre of DEFAULT_GENRES) {
        const docRef = doc(db, COLLECTION_NAME, defaultGenre.id);
        await setDoc(docRef, defaultGenre);
        genresList.push(defaultGenre);
      }
    }

    return genresList;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    return [];
  }
}

export async function addGenre(name: string): Promise<Genre> {
  const id = name.toLowerCase().replace(/\s+/g, '-');
  const newGenre: Genre = { id, name };

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, newGenre);
    return newGenre;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
}

export async function deleteGenre(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
}

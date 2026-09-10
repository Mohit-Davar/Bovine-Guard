import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  writeBatch, 
  onSnapshot,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Animal, ScreeningRecord, AlertItem, VeterinaryOutcome, BarnZone } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID from config if provided
export const db: Firestore = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

export const COLLECTIONS = {
  ANIMALS: 'animals',
  SCREENINGS: 'screenings',
  ALERTS: 'alerts',
  VET_OUTCOMES: 'vetOutcomes',
  BARNS: 'barns'
} as const;

// Fetch all animals from Firestore
export async function getAnimalsFromDb(): Promise<Animal[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.ANIMALS));
    const list: Animal[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Animal);
    });
    return list;
  } catch (err) {
    console.warn('[Firebase] Error getting animals from Firestore:', err);
    return [];
  }
}

// Fetch screenings
export async function getScreeningsFromDb(): Promise<ScreeningRecord[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.SCREENINGS));
    const list: ScreeningRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as ScreeningRecord);
    });
    return list;
  } catch (err) {
    console.warn('[Firebase] Error getting screenings:', err);
    return [];
  }
}

// Fetch alerts
export async function getAlertsFromDb(): Promise<AlertItem[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.ALERTS));
    const list: AlertItem[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as AlertItem);
    });
    return list;
  } catch (err) {
    console.warn('[Firebase] Error getting alerts:', err);
    return [];
  }
}

// Fetch vet outcomes
export async function getVetOutcomesFromDb(): Promise<VeterinaryOutcome[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.VET_OUTCOMES));
    const list: VeterinaryOutcome[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as VeterinaryOutcome);
    });
    return list;
  } catch (err) {
    console.warn('[Firebase] Error getting vet outcomes:', err);
    return [];
  }
}

// Save single animal to Firestore
export async function saveAnimalToDb(animal: Animal): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.ANIMALS, animal.id);
    await setDoc(docRef, animal, { merge: true });
  } catch (err) {
    console.warn('[Firebase] Error saving animal:', err);
  }
}

// Save single screening
export async function saveScreeningToDb(screening: ScreeningRecord): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.SCREENINGS, screening.id);
    await setDoc(docRef, screening, { merge: true });
  } catch (err) {
    console.warn('[Firebase] Error saving screening:', err);
  }
}

// Save single alert
export async function saveAlertToDb(alert: AlertItem): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.ALERTS, alert.id);
    await setDoc(docRef, alert, { merge: true });
  } catch (err) {
    console.warn('[Firebase] Error saving alert:', err);
  }
}

// Save vet outcome
export async function saveVetOutcomeToDb(outcome: VeterinaryOutcome): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.VET_OUTCOMES, outcome.id);
    await setDoc(docRef, outcome, { merge: true });
  } catch (err) {
    console.warn('[Firebase] Error saving vet outcome:', err);
  }
}

// Batch seed initial data if Firestore is empty
export async function seedInitialFirestoreData(
  animals: Animal[],
  screenings: ScreeningRecord[],
  alerts: AlertItem[],
  vetOutcomes: VeterinaryOutcome[]
): Promise<boolean> {
  try {
    const existing = await getDocs(collection(db, COLLECTIONS.ANIMALS));
    if (!existing.empty) {
      // Already populated
      return false;
    }

    const batch = writeBatch(db);

    animals.forEach(cow => {
      const ref = doc(db, COLLECTIONS.ANIMALS, cow.id);
      batch.set(ref, cow);
    });

    screenings.forEach(sc => {
      const ref = doc(db, COLLECTIONS.SCREENINGS, sc.id);
      batch.set(ref, sc);
    });

    alerts.forEach(al => {
      const ref = doc(db, COLLECTIONS.ALERTS, al.id);
      batch.set(ref, al);
    });

    vetOutcomes.forEach(vo => {
      const ref = doc(db, COLLECTIONS.VET_OUTCOMES, vo.id);
      batch.set(ref, vo);
    });

    await batch.commit();
    console.log('[Firebase] Successfully seeded Firestore with initial herd records.');
    return true;
  } catch (err) {
    console.warn('[Firebase] Batch seed error:', err);
    return false;
  }
}

// Force re-seed / restore database
export async function forceReseedFirestore(
  animals: Animal[],
  screenings: ScreeningRecord[],
  alerts: AlertItem[],
  vetOutcomes: VeterinaryOutcome[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    animals.forEach(cow => batch.set(doc(db, COLLECTIONS.ANIMALS, cow.id), cow));
    screenings.forEach(sc => batch.set(doc(db, COLLECTIONS.SCREENINGS, sc.id), sc));
    alerts.forEach(al => batch.set(doc(db, COLLECTIONS.ALERTS, al.id), al));
    vetOutcomes.forEach(vo => batch.set(doc(db, COLLECTIONS.VET_OUTCOMES, vo.id), vo));
    await batch.commit();
  } catch (err) {
    console.warn('[Firebase] Force re-seed error:', err);
  }
}

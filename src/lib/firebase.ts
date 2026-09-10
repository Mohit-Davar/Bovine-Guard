import firebaseConfig from '../../firebase-applet-config.json'
import { AlertItem, Animal, BarnZone, ScreeningRecord, VeterinaryOutcome } from '../types'
import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  Firestore,
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// Initialize Firestore with specific database ID from config if provided
export const db: Firestore = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app)

export const COLLECTIONS = {
  ANIMALS: 'animals',
  SCREENINGS: 'screenings',
  ALERTS: 'alerts',
  VET_OUTCOMES: 'vetOutcomes',
  BARNS: 'barns',
} as const

// Fetch all animals from Firestore
export async function getAnimalsFromDb(): Promise<Animal[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.ANIMALS))
    const list: Animal[] = []
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Animal)
    })
    return list
  } catch (err) {
    console.warn('[Firebase] Error getting animals from Firestore:', err)
    return []
  }
}

// Fetch screenings
export async function getScreeningsFromDb(): Promise<ScreeningRecord[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.SCREENINGS))
    const list: ScreeningRecord[] = []
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as ScreeningRecord)
    })
    return list
  } catch (err) {
    console.warn('[Firebase] Error getting screenings:', err)
    return []
  }
}

// Fetch alerts
export async function getAlertsFromDb(): Promise<AlertItem[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.ALERTS))
    const list: AlertItem[] = []
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as AlertItem)
    })
    return list
  } catch (err) {
    console.warn('[Firebase] Error getting alerts:', err)
    return []
  }
}

// Fetch vet outcomes
export async function getVetOutcomesFromDb(): Promise<VeterinaryOutcome[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.VET_OUTCOMES))
    const list: VeterinaryOutcome[] = []
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as VeterinaryOutcome)
    })
    return list
  } catch (err) {
    console.warn('[Firebase] Error getting vet outcomes:', err)
    return []
  }
}

// Fetch barn zones
export async function getBarnsFromDb(): Promise<BarnZone[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.BARNS))
    const list: BarnZone[] = []
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as BarnZone)
    })
    return list
  } catch (err) {
    console.warn('[Firebase] Error getting barns:', err)
    return []
  }
}

// Save single animal to Firestore
export async function saveAnimalToDb(animal: Animal): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.ANIMALS, animal.id)
    await setDoc(docRef, animal, { merge: true })
  } catch (err) {
    console.warn('[Firebase] Error saving animal:', err)
  }
}

// Save single screening
export async function saveScreeningToDb(screening: ScreeningRecord): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.SCREENINGS, screening.id)
    await setDoc(docRef, screening, { merge: true })
  } catch (err) {
    console.warn('[Firebase] Error saving screening:', err)
  }
}

// Save single alert
export async function saveAlertToDb(alert: AlertItem): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.ALERTS, alert.id)
    await setDoc(docRef, alert, { merge: true })
  } catch (err) {
    console.warn('[Firebase] Error saving alert:', err)
  }
}

// Save vet outcome
export async function saveVetOutcomeToDb(outcome: VeterinaryOutcome): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.VET_OUTCOMES, outcome.id)
    await setDoc(docRef, outcome, { merge: true })
  } catch (err) {
    console.warn('[Firebase] Error saving vet outcome:', err)
  }
}

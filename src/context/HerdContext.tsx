import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Animal,
  ScreeningRecord,
  AlertItem,
  BarnZone,
  VeterinaryOutcome,
  SyncStatus,
  TabType,
  RiskLevel,
  SupportedLanguage,
} from '../types';
import {
  INITIAL_ANIMALS,
  INITIAL_SCREENINGS,
  INITIAL_ALERTS,
  INITIAL_BARN_ZONES,
  INITIAL_VET_OUTCOMES,
} from '../data/mockData';
import { getTranslation } from '../i18n/translations';
import {
  db,
  COLLECTIONS,
  getAnimalsFromDb,
  getScreeningsFromDb,
  getAlertsFromDb,
  getVetOutcomesFromDb,
  saveAnimalToDb,
  saveScreeningToDb,
  saveAlertToDb,
  saveVetOutcomeToDb,
  seedInitialFirestoreData,
  forceReseedFirestore,
} from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  animalId?: string;
}

interface HerdContextType {
  // Localization
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;

  // Navigation & Viewport
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  hmiMode: boolean;
  toggleHmiMode: () => void;

  // Domain Data
  animals: Animal[];
  screenings: ScreeningRecord[];
  alerts: AlertItem[];
  barnZones: BarnZone[];
  vetOutcomes: VeterinaryOutcome[];
  syncStatus: SyncStatus;

  // State Management (Loading, Error, Empty)
  isGlobalLoading: boolean;
  globalError: string | null;
  tabLoading: Record<TabType, boolean>;
  tabError: Record<TabType, string | null>;
  isRetryingTab: Record<TabType, boolean>;

  // Simulation Controls for Farmer / Developer testing
  testModeState: 'normal' | 'loading' | 'error' | 'empty';
  setTestModeState: (mode: 'normal' | 'loading' | 'error' | 'empty') => void;
  retrySync: () => Promise<void>;
  retryTab: (tab: TabType) => Promise<void>;
  resetToSampleData: () => void;
  clearDataset: (target: 'all' | 'actions' | 'animals' | 'screenings' | 'alerts') => void;

  // Dialogs & Modals
  selectedAnimalId: string | null;
  openAnimalProfile: (id: string) => void;
  closeAnimalProfile: () => void;

  outcomeAnimalId: string | null;
  openOutcomeModal: (id: string) => void;
  closeOutcomeModal: () => void;
  recordOutcome: (outcome: Omit<VeterinaryOutcome, 'id' | 'timestamp'>) => void;

  isSyncModalOpen: boolean;
  setSyncModalOpen: (open: boolean) => void;

  isRfidModalOpen: boolean;
  setRfidModalOpen: (open: boolean) => void;

  // Alerts & Notifications
  acknowledgeAlert: (id: string) => void;
  dismissAlert: (id: string) => void;
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;

  // RFID Simulator
  simulateRfidScan: (animalId: string, customScc?: number, customEc?: number) => void;
  toggleOfflineMode: () => void;
}

const HerdContext = createContext<HerdContextType | undefined>(undefined);

export const HerdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const t = (key: string) => getTranslation(key, language);

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [hmiMode, setHmiMode] = useState<boolean>(false);

  // Core Data
  const [animals, setAnimals] = useState<Animal[]>(INITIAL_ANIMALS);
  const [screenings, setScreenings] = useState<ScreeningRecord[]>(INITIAL_SCREENINGS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [barnZones, setBarnZones] = useState<BarnZone[]>(INITIAL_BARN_ZONES);
  const [vetOutcomes, setVetOutcomes] = useState<VeterinaryOutcome[]>(INITIAL_VET_OUTCOMES);

  // Sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    pendingRecordsCount: 0,
    lastSyncTime: 'Just now (07:54 AM)',
    syncInProgress: false,
    syncError: undefined,
  });

  // Global and Tab-specific Loading & Error states
  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [tabLoading, setTabLoading] = useState<Record<TabType, boolean>>({
    dashboard: false,
    actions: false,
    animals: false,
    screenings: false,
    trends: false,
    alerts: false,
    environment: false,
  });

  const [tabError, setTabError] = useState<Record<TabType, string | null>>({
    dashboard: null,
    actions: null,
    animals: null,
    screenings: null,
    trends: null,
    alerts: null,
    environment: null,
  });

  const [isRetryingTab, setIsRetryingTab] = useState<Record<TabType, boolean>>({
    dashboard: false,
    actions: false,
    animals: false,
    screenings: false,
    trends: false,
    alerts: false,
    environment: false,
  });

  const [testModeState, setTestModeState] = useState<'normal' | 'loading' | 'error' | 'empty'>('normal');

  // Modals
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [outcomeAnimalId, setOutcomeAnimalId] = useState<string | null>(null);
  const [isSyncModalOpen, setSyncModalOpen] = useState<boolean>(false);
  const [isRfidModalOpen, setRfidModalOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      dismissToast(id);
    }, 6000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleHmiMode = () => setHmiMode((prev) => !prev);

  // Firestore Realtime Subscription and Seeding
  useEffect(() => {
    let unsubscribeAnimals: () => void;
    let unsubscribeScreenings: () => void;
    let unsubscribeAlerts: () => void;
    let unsubscribeOutcomes: () => void;

    const initializeFirestoreData = async () => {
      try {
        // Seed default dataset if Firestore collections are empty
        await seedInitialFirestoreData(INITIAL_ANIMALS, INITIAL_SCREENINGS, INITIAL_ALERTS, INITIAL_VET_OUTCOMES);

        // Load current snapshot
        const [dbAnimals, dbScreenings, dbAlerts, dbOutcomes] = await Promise.all([
          getAnimalsFromDb(),
          getScreeningsFromDb(),
          getAlertsFromDb(),
          getVetOutcomesFromDb(),
        ]);

        if (dbAnimals.length > 0) setAnimals(dbAnimals);
        if (dbScreenings.length > 0) setScreenings(dbScreenings);
        if (dbAlerts.length > 0) setAlerts(dbAlerts);
        if (dbOutcomes.length > 0) setVetOutcomes(dbOutcomes);

        // Realtime Firestore listeners
        unsubscribeAnimals = onSnapshot(collection(db, COLLECTIONS.ANIMALS), (snap) => {
          if (!snap.empty) {
            const list: Animal[] = [];
            snap.forEach((doc) => list.push(doc.data() as Animal));
            setAnimals(list);
          }
        });

        unsubscribeScreenings = onSnapshot(collection(db, COLLECTIONS.SCREENINGS), (snap) => {
          if (!snap.empty) {
            const list: ScreeningRecord[] = [];
            snap.forEach((doc) => list.push(doc.data() as ScreeningRecord));
            setScreenings(list);
          }
        });

        unsubscribeAlerts = onSnapshot(collection(db, COLLECTIONS.ALERTS), (snap) => {
          if (!snap.empty) {
            const list: AlertItem[] = [];
            snap.forEach((doc) => list.push(doc.data() as AlertItem));
            setAlerts(list);
          }
        });

        unsubscribeOutcomes = onSnapshot(collection(db, COLLECTIONS.VET_OUTCOMES), (snap) => {
          if (!snap.empty) {
            const list: VeterinaryOutcome[] = [];
            snap.forEach((doc) => list.push(doc.data() as VeterinaryOutcome));
            setVetOutcomes(list);
          }
        });

        setSyncStatus((prev) => ({
          ...prev,
          lastSyncTime: 'Cloud Sync Live',
          isOnline: true,
        }));
      } catch (err) {
        console.warn('Firestore initialization fallback to local memory state:', err);
      }
    };

    initializeFirestoreData();

    return () => {
      if (unsubscribeAnimals) unsubscribeAnimals();
      if (unsubscribeScreenings) unsubscribeScreenings();
      if (unsubscribeAlerts) unsubscribeAlerts();
      if (unsubscribeOutcomes) unsubscribeOutcomes();
    };
  }, []);

  // Test mode switcher
  const handleSetTestModeState = (mode: 'normal' | 'loading' | 'error' | 'empty') => {
    setTestModeState(mode);

    if (mode === 'loading') {
      setIsGlobalLoading(true);
      setTabLoading({
        dashboard: true,
        actions: true,
        animals: true,
        screenings: true,
        trends: true,
        alerts: true,
        environment: true,
      });
      setTabError({
        dashboard: null,
        actions: null,
        animals: null,
        screenings: null,
        trends: null,
        alerts: null,
        environment: null,
      });
    } else if (mode === 'error') {
      setIsGlobalLoading(false);
      setTabLoading({
        dashboard: false,
        actions: false,
        animals: false,
        screenings: false,
        trends: false,
        alerts: false,
        environment: false,
      });
      setTabError({
        dashboard: 'Connection to parlor telemetry gateway timed out (ERR_GATEWAY_TIMEOUT)',
        actions: 'Unable to synchronize action dispatch queue with herd management server (ERR_DISPATCH_FAIL)',
        animals: 'Failed to fetch animal registry records from central dairy database (ERR_DB_UNAVAILABLE)',
        screenings: 'Screening history log partition unavailable (ERR_SCREENING_SYNC)',
        trends: 'Telemetry aggregation pipeline returned HTTP 503 Service Unavailable',
        alerts: 'Real-time alert streaming bus disconnected (ERR_ALERT_STREAM)',
        environment: 'Barn weather station telemetry unreachable (ERR_SENSOR_OFFLINE)',
      });
      setSyncStatus((prev) => ({
        ...prev,
        syncError: 'Cloud synchronization failed: network connection to central farm cluster timed out.',
      }));
    } else if (mode === 'empty') {
      setIsGlobalLoading(false);
      setTabLoading({
        dashboard: false,
        actions: false,
        animals: false,
        screenings: false,
        trends: false,
        alerts: false,
        environment: false,
      });
      setTabError({
        dashboard: null,
        actions: null,
        animals: null,
        screenings: null,
        trends: null,
        alerts: null,
        environment: null,
      });
      // Clear data to show empty states
      setAnimals([]);
      setScreenings([]);
      setAlerts([]);
      setBarnZones([]);
    } else {
      // Normal mode: restore sample data and clear loading/error
      setIsGlobalLoading(false);
      setTabLoading({
        dashboard: false,
        actions: false,
        animals: false,
        screenings: false,
        trends: false,
        alerts: false,
        environment: false,
      });
      setTabError({
        dashboard: null,
        actions: null,
        animals: null,
        screenings: null,
        trends: null,
        alerts: null,
        environment: null,
      });
      setAnimals(INITIAL_ANIMALS);
      setScreenings(INITIAL_SCREENINGS);
      setAlerts(INITIAL_ALERTS);
      setBarnZones(INITIAL_BARN_ZONES);
      setVetOutcomes(INITIAL_VET_OUTCOMES);
      setSyncStatus((prev) => ({
        ...prev,
        syncError: undefined,
      }));
    }
  };

  // Retry Tab Action
  const retryTab = async (tab: TabType) => {
    setIsRetryingTab((prev) => ({ ...prev, [tab]: true }));
    setTabLoading((prev) => ({ ...prev, [tab]: true }));

    // Simulate real network fetch with 900ms delay
    await new Promise((resolve) => setTimeout(resolve, 900));

    setIsRetryingTab((prev) => ({ ...prev, [tab]: false }));
    setTabLoading((prev) => ({ ...prev, [tab]: false }));
    setTabError((prev) => ({ ...prev, [tab]: null }));

    // If data was empty, repopulate tab's data
    if (tab === 'animals' && animals.length === 0) {
      setAnimals(INITIAL_ANIMALS);
    }
    if (tab === 'screenings' && screenings.length === 0) {
      setScreenings(INITIAL_SCREENINGS);
    }
    if (tab === 'alerts' && alerts.length === 0) {
      setAlerts(INITIAL_ALERTS);
    }
    if (tab === 'environment' && barnZones.length === 0) {
      setBarnZones(INITIAL_BARN_ZONES);
    }
    if (tab === 'dashboard' || tab === 'actions') {
      if (animals.length === 0) setAnimals(INITIAL_ANIMALS);
      if (alerts.length === 0) setAlerts(INITIAL_ALERTS);
    }

    addToast({
      title: 'Connection Restored',
      message: `Successfully refreshed data for ${tab.toUpperCase()} screen.`,
      type: 'success',
    });
  };

  // Retry Sync Action
  const retrySync = async () => {
    setSyncStatus((prev) => ({
      ...prev,
      syncInProgress: true,
      syncError: undefined,
    }));

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setSyncStatus((prev) => ({
      ...prev,
      syncInProgress: false,
      pendingRecordsCount: 0,
      lastSyncTime: 'Just now (' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ')',
      syncError: undefined,
    }));

    // Clear error states on retry
    setTabError({
      dashboard: null,
      actions: null,
      animals: null,
      screenings: null,
      trends: null,
      alerts: null,
      environment: null,
    });

    if (testModeState === 'error') {
      setTestModeState('normal');
      setAnimals(INITIAL_ANIMALS);
    }

    addToast({
      title: 'Sync Completed',
      message: 'All local parlor records uploaded to Dairy Central Cloud.',
      type: 'success',
    });
  };

  const resetToSampleData = async () => {
    setTestModeState('normal');
    setIsGlobalLoading(false);
    setTabLoading({
      dashboard: false,
      actions: false,
      animals: false,
      screenings: false,
      trends: false,
      alerts: false,
      environment: false,
    });
    setTabError({
      dashboard: null,
      actions: null,
      animals: null,
      screenings: null,
      trends: null,
      alerts: null,
      environment: null,
    });
    setAnimals(INITIAL_ANIMALS);
    setScreenings(INITIAL_SCREENINGS);
    setAlerts(INITIAL_ALERTS);
    setBarnZones(INITIAL_BARN_ZONES);
    setVetOutcomes(INITIAL_VET_OUTCOMES);
    setSyncStatus({
      isOnline: true,
      pendingRecordsCount: 0,
      lastSyncTime: 'Cloud Sync Active',
      syncInProgress: false,
      syncError: undefined,
    });

    try {
      await forceReseedFirestore(INITIAL_ANIMALS, INITIAL_SCREENINGS, INITIAL_ALERTS, INITIAL_VET_OUTCOMES);
    } catch (e) {
      console.warn('Firestore reseed error:', e);
    }

    addToast({
      title: 'Data Reset',
      message: 'Restored baseline herd dataset into Cloud Firestore.',
      type: 'info',
    });
  };

  const clearDataset = (target: 'all' | 'actions' | 'animals' | 'screenings' | 'alerts') => {
    if (target === 'all') {
      setAnimals([]);
      setScreenings([]);
      setAlerts([]);
      setBarnZones([]);
    } else if (target === 'actions') {
      // Set all animals to low risk so no actions are pending
      setAnimals((prev) =>
        prev.map((a) => ({
          ...a,
          currentRisk: 'low' as RiskLevel,
          riskScore: 10,
          scc: 80,
          ec: 4.8,
          recommendedAction: 'Routine management.',
        }))
      );
    } else if (target === 'animals') {
      setAnimals([]);
    } else if (target === 'screenings') {
      setScreenings([]);
    } else if (target === 'alerts') {
      setAlerts([]);
    }

    addToast({
      title: 'Empty State Activated',
      message: `Cleared ${target} dataset to demonstrate empty state handling.`,
      type: 'info',
    });
  };

  const openAnimalProfile = (id: string) => setSelectedAnimalId(id);
  const closeAnimalProfile = () => setSelectedAnimalId(null);

  const openOutcomeModal = (id: string) => setOutcomeAnimalId(id);
  const closeOutcomeModal = () => setOutcomeAnimalId(null);

  const recordOutcome = (data: Omit<VeterinaryOutcome, 'id' | 'timestamp'>) => {
    const newOutcome: VeterinaryOutcome = {
      ...data,
      id: `vet-${Date.now()}`,
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setVetOutcomes((prev) => [newOutcome, ...prev]);
    saveVetOutcomeToDb(newOutcome).catch((e) => console.warn('Error saving outcome to Firestore:', e));

    // Update animal risk if confirmed or resolved
    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id === data.animalId) {
          let updatedCow: Animal;
          if (data.outcome === 'not_mastitis') {
            updatedCow = {
              ...a,
              currentRisk: 'low' as RiskLevel,
              riskScore: 15,
              recommendedAction: 'Cleared by veterinary examination.',
            };
          } else if (data.outcome === 'confirmed_mastitis') {
            updatedCow = {
              ...a,
              currentRisk: 'critical' as RiskLevel,
              riskScore: 98,
              recommendedAction: `Under active veterinary protocol. Milk withheld (${data.milkWithholdDays || 3} days).`,
            };
          } else {
            updatedCow = a;
          }
          saveAnimalToDb(updatedCow).catch((e) => console.warn('Error saving updated animal:', e));
          return updatedCow;
        }
        return a;
      })
    );

    // Queue sync if offline
    if (!syncStatus.isOnline) {
      setSyncStatus((prev) => ({
        ...prev,
        pendingRecordsCount: prev.pendingRecordsCount + 1,
      }));
    }

    addToast({
      title: 'Veterinary Outcome Logged',
      message: `Clinical record saved to Cloud Firestore for cow ${data.animalTag}.`,
      type: 'success',
      animalId: data.animalId,
    });

    closeOutcomeModal();
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((alt) => {
        if (alt.id === id) {
          const updated = { ...alt, acknowledged: true };
          saveAlertToDb(updated).catch((e) => console.warn('Error updating alert in Firestore:', e));
          return updated;
        }
        return alt;
      })
    );
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alt) => alt.id !== id));
  };

  const toggleOfflineMode = () => {
    setSyncStatus((prev) => ({
      ...prev,
      isOnline: !prev.isOnline,
    }));
    addToast({
      title: !syncStatus.isOnline ? 'Online Connection Restored' : 'Offline Hub Mode Active',
      message: !syncStatus.isOnline
        ? 'Connected to cloud. Records will synchronize.'
        : 'Running on local parlor buffer.',
      type: !syncStatus.isOnline ? 'success' : 'warning',
    });
  };

  const simulateRfidScan = (animalId: string, customScc?: number, customEc?: number) => {
    const cow = animals.find((a) => a.id === animalId) || INITIAL_ANIMALS[0];
    const scc = customScc ?? Math.floor(Math.random() * 400 + 80);
    const ec = customEc ?? parseFloat((Math.random() * 2.5 + 4.6).toFixed(1));
    const ph = parseFloat((6.5 + (scc > 250 ? 0.4 : 0.05)).toFixed(2));

    let risk: RiskLevel = 'low';
    let riskScore = 15;
    if (scc > 400 || ec > 6.2) {
      risk = 'critical';
      riskScore = 91;
    } else if (scc > 250 || ec > 5.8) {
      risk = 'high';
      riskScore = 76;
    } else if (scc > 180 || ec > 5.5) {
      risk = 'watch';
      riskScore = 52;
    }

    const newRecord: ScreeningRecord = {
      id: `scr-${Date.now()}`,
      timestamp: 'Just now',
      animalId: cow.id,
      animalTag: cow.tag,
      animalName: cow.name,
      scc,
      ec,
      ph,
      riskScore,
      riskLevel: risk,
      parlorStation: 'Portable Scanner Round',
      automatedFlag: risk === 'high' || risk === 'critical',
      notes: risk === 'critical' ? 'Elevated risk - veterinary examination recommended.' : undefined,
    };

    setScreenings((prev) => [newRecord, ...prev]);
    saveScreeningToDb(newRecord).catch((e) => console.warn('Error saving screening to Firestore:', e));

    // Update animal's current metrics
    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id === cow.id) {
          const updatedCow: Animal = {
            ...a,
            scc,
            ec,
            ph,
            currentRisk: risk,
            riskScore,
            lastScreeningDate: 'Just now',
          };
          saveAnimalToDb(updatedCow).catch((e) => console.warn('Error updating cow in Firestore:', e));
          return updatedCow;
        }
        return a;
      })
    );

    if (risk === 'critical' || risk === 'high') {
      const newAlert: AlertItem = {
        id: `alt-${Date.now()}`,
        timestamp: 'Just now',
        severity: risk === 'critical' ? 'critical' : 'warning',
        title: `${risk.toUpperCase()} Risk Detected: ${cow.name} (${cow.tag})`,
        message: `Portable scanner test recorded SCC ${scc}k cells/ml and EC ${ec} mS/cm. Action recommended.`,
        animalId: cow.id,
        animalTag: cow.tag,
        acknowledged: false,
        recommendedAction: 'Withhold milk and perform paddle California Mastitis Test.',
      };
      setAlerts((prev) => [newAlert, ...prev]);
      saveAlertToDb(newAlert).catch((e) => console.warn('Error saving alert in Firestore:', e));

      addToast({
        title: `Scanner Trigger: ${risk.toUpperCase()} Risk`,
        message: `${cow.name} (#${cow.tag}) flagged for follow-up examination.`,
        type: risk === 'critical' ? 'alert' : 'warning',
        animalId: cow.id,
      });
    } else {
      addToast({
        title: 'Screening Completed',
        message: `${cow.name} (#${cow.tag}) cleared with low mastitis risk.`,
        type: 'success',
        animalId: cow.id,
      });
    }

    if (!syncStatus.isOnline) {
      setSyncStatus((prev) => ({
        ...prev,
        pendingRecordsCount: prev.pendingRecordsCount + 1,
      }));
    }
  };

  return (
    <HerdContext.Provider
      value={{
        language,
        setLanguage,
        t,
        activeTab,
        setActiveTab,
        hmiMode,
        toggleHmiMode,
        animals,
        screenings,
        alerts,
        barnZones,
        vetOutcomes,
        syncStatus,
        isGlobalLoading,
        globalError,
        tabLoading,
        tabError,
        isRetryingTab,
        testModeState,
        setTestModeState: handleSetTestModeState,
        retrySync,
        retryTab,
        resetToSampleData,
        clearDataset,
        selectedAnimalId,
        openAnimalProfile,
        closeAnimalProfile,
        outcomeAnimalId,
        openOutcomeModal,
        closeOutcomeModal,
        recordOutcome,
        isSyncModalOpen,
        setSyncModalOpen,
        isRfidModalOpen,
        setRfidModalOpen,
        acknowledgeAlert,
        dismissAlert,
        toasts,
        addToast,
        dismissToast,
        simulateRfidScan,
        toggleOfflineMode,
      }}
    >
      {children}
    </HerdContext.Provider>
  );
};

export const useHerd = () => {
  const context = useContext(HerdContext);
  if (!context) {
    throw new Error('useHerd must be used within a HerdProvider');
  }
  return context;
};

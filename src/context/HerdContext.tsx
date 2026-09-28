import React, { createContext, useContext, useEffect, useState } from 'react'

import { INDIAN_HERD_ANIMALS, INDIAN_SCREENING_RECORDS } from '../data/indianDairyData'
import { getTranslation } from '../i18n/translations'
import {
  COLLECTIONS,
  db,
  getAlertsFromDb,
  getAnimalsFromDb,
  getBarnsFromDb,
  getScreeningsFromDb,
  getVetOutcomesFromDb,
  saveAlertToDb,
  saveAnimalToDb,
  saveScreeningToDb,
  saveVetOutcomeToDb,
} from '../lib/firebase'
import {
  AlertItem,
  Animal,
  BarnZone,
  RiskLevel,
  ScreeningRecord,
  SupportedLanguage,
  SyncStatus,
  TabType,
  VeterinaryOutcome,
} from '../types'
import { collection, onSnapshot } from 'firebase/firestore'

export interface Toast {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'alert' | 'success'
  animalId?: string
}

interface HerdContextType {
  // Localization
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  t: (key: string, values?: Record<string, string | number>) => string

  // Navigation & Viewport
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  touchMode: boolean
  toggleTouchMode: () => void

  // Domain Data
  animals: Animal[]
  screenings: ScreeningRecord[]
  alerts: AlertItem[]
  barnZones: BarnZone[]
  vetOutcomes: VeterinaryOutcome[]
  syncStatus: SyncStatus

  // State Management (Loading, Error, Empty)
  isGlobalLoading: boolean
  globalError: string | null
  tabLoading: Record<TabType, boolean>
  tabError: Record<TabType, string | null>
  isRetryingTab: Record<TabType, boolean>

  // Simulation Controls for Farmer / Developer testing
  testModeState: 'normal' | 'loading' | 'error' | 'empty'
  setTestModeState: (mode: 'normal' | 'loading' | 'error' | 'empty') => void
  retrySync: () => Promise<void>
  retryTab: (tab: TabType) => Promise<void>
  resetToSampleData: () => void
  clearDataset: (target: 'all' | 'actions' | 'animals' | 'screenings' | 'alerts') => void

  // Dialogs & Modals
  selectedAnimalId: string | null
  openAnimalProfile: (id: string) => void
  closeAnimalProfile: () => void

  outcomeAnimalId: string | null
  openOutcomeModal: (id: string) => void
  closeOutcomeModal: () => void
  recordOutcome: (outcome: Omit<VeterinaryOutcome, 'id' | 'timestamp'>) => void

  appointmentCow: Animal | null
  openAppointmentModal: (cow: Animal) => void
  closeAppointmentModal: () => void

  isSyncModalOpen: boolean
  setSyncModalOpen: (open: boolean) => void

  isQuickCheckModalOpen: boolean
  setQuickCheckModalOpen: (open: boolean) => void

  // Alerts & Notifications
  acknowledgeAlert: (id: string) => void
  dismissAlert: (id: string) => void
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void

  // Quick Check Simulator
  recordQuickCheck: (animalId: string, customEc?: number) => void
  toggleOfflineMode: () => void
}

const HerdContext = createContext<HerdContextType | undefined>(undefined)

export const HerdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('en')
  const t = (key: string, values?: Record<string, string | number>) =>
    getTranslation(key, language, values)

  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [touchMode, setTouchMode] = useState<boolean>(false)

  // Core Data
  const [animals, setAnimals] = useState<Animal[]>([])
  const [screenings, setScreenings] = useState<ScreeningRecord[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [barnZones, setBarnZones] = useState<BarnZone[]>([])
  const [vetOutcomes, setVetOutcomes] = useState<VeterinaryOutcome[]>([])

  // Sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    pendingRecordsCount: 0,
    lastSyncTime: 'Just now (07:54 AM)',
    syncInProgress: false,
    syncError: undefined,
  })

  // Global and Tab-specific Loading & Error states
  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const [tabLoading, setTabLoading] = useState<Record<TabType, boolean>>({
    dashboard: false,
    actions: false,
    animals: false,
    screenings: false,
    trends: false,
    alerts: false,
    environment: false,
  })

  const [tabError, setTabError] = useState<Record<TabType, string | null>>({
    dashboard: null,
    actions: null,
    animals: null,
    screenings: null,
    trends: null,
    alerts: null,
    environment: null,
  })

  const [isRetryingTab, setIsRetryingTab] = useState<Record<TabType, boolean>>({
    dashboard: false,
    actions: false,
    animals: false,
    screenings: false,
    trends: false,
    alerts: false,
    environment: false,
  })

  const [testModeState, setTestModeState] = useState<'normal' | 'loading' | 'error' | 'empty'>(
    'normal',
  )

  // Modals
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null)
  const [outcomeAnimalId, setOutcomeAnimalId] = useState<string | null>(null)
  const [appointmentCow, setAppointmentCow] = useState<Animal | null>(null)
  const [isSyncModalOpen, setSyncModalOpen] = useState<boolean>(false)
  const [isQuickCheckModalOpen, setQuickCheckModalOpen] = useState<boolean>(false)

  const openAppointmentModal = (cow: Animal) => setAppointmentCow(cow)
  const closeAppointmentModal = () => setAppointmentCow(null)

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => {
      dismissToast(id)
    }, 6000)
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const toggleTouchMode = () => setTouchMode((prev) => !prev)

  // Firestore Realtime Subscription and Data Fetching
  useEffect(() => {
    let unsubscribeAnimals: () => void
    let unsubscribeScreenings: () => void
    let unsubscribeAlerts: () => void
    let unsubscribeOutcomes: () => void
    let unsubscribeBarns: () => void

    const initializeFirestoreData = async () => {
      try {
        // Load current snapshot
        const [dbAnimals, dbScreenings, dbAlerts, dbOutcomes, dbBarns] = await Promise.all([
          getAnimalsFromDb(),
          getScreeningsFromDb(),
          getAlertsFromDb(),
          getVetOutcomesFromDb(),
          getBarnsFromDb(),
        ])

        const initialHerd = dbAnimals.length > 0 ? dbAnimals : INDIAN_HERD_ANIMALS
        const initialScreenings = dbScreenings.length > 0 ? dbScreenings : INDIAN_SCREENING_RECORDS

        setAnimals(initialHerd)
        setScreenings(initialScreenings)
        setAlerts(dbAlerts)
        setVetOutcomes(dbOutcomes)
        setBarnZones(dbBarns)

        // Realtime Firestore listeners
        unsubscribeAnimals = onSnapshot(collection(db, COLLECTIONS.ANIMALS), (snap) => {
          if (!snap.empty) {
            const list: Animal[] = []
            snap.forEach((doc) => list.push(doc.data() as Animal))
            setAnimals(list)
          }
        })

        unsubscribeScreenings = onSnapshot(collection(db, COLLECTIONS.SCREENINGS), (snap) => {
          if (!snap.empty) {
            const list: ScreeningRecord[] = []
            snap.forEach((doc) => list.push(doc.data() as ScreeningRecord))
            setScreenings(list)
          }
        })

        unsubscribeAlerts = onSnapshot(collection(db, COLLECTIONS.ALERTS), (snap) => {
          if (!snap.empty) {
            const list: AlertItem[] = []
            snap.forEach((doc) => list.push(doc.data() as AlertItem))
            setAlerts(list)
          }
        })

        unsubscribeOutcomes = onSnapshot(collection(db, COLLECTIONS.VET_OUTCOMES), (snap) => {
          if (!snap.empty) {
            const list: VeterinaryOutcome[] = []
            snap.forEach((doc) => list.push(doc.data() as VeterinaryOutcome))
            setVetOutcomes(list)
          }
        })

        setSyncStatus((prev) => ({
          ...prev,
          lastSyncTime: 'Cloud Sync Live',
          isOnline: true,
        }))
      } catch (err) {
        console.warn('Firestore initialization fallback to local memory state:', err)
      }
    }

    initializeFirestoreData()

    return () => {
      if (unsubscribeAnimals) unsubscribeAnimals()
      if (unsubscribeScreenings) unsubscribeScreenings()
      if (unsubscribeAlerts) unsubscribeAlerts()
      if (unsubscribeOutcomes) unsubscribeOutcomes()
    }
  }, [])

  // Test mode switcher
  const handleSetTestModeState = async (mode: 'normal' | 'loading' | 'error' | 'empty') => {
    setTestModeState(mode)

    if (mode === 'loading') {
      setIsGlobalLoading(true)
      setTabLoading({
        dashboard: true,
        actions: true,
        animals: true,
        screenings: true,
        trends: true,
        alerts: true,
        environment: true,
      })
      setTabError({
        dashboard: null,
        actions: null,
        animals: null,
        screenings: null,
        trends: null,
        alerts: null,
        environment: null,
      })
    } else if (mode === 'error') {
      setIsGlobalLoading(false)
      setTabLoading({
        dashboard: false,
        actions: false,
        animals: false,
        screenings: false,
        trends: false,
        alerts: false,
        environment: false,
      })
      setTabError({
        dashboard: 'Unable to load farm dashboard. Please check network connection.',
        actions: 'Unable to synchronize action items. Please refresh.',
        animals: 'Failed to fetch cow records. Please check connection.',
        screenings: 'Screening history log temporarily unavailable.',
        trends: 'Farm trends data temporarily unavailable.',
        alerts: 'Farm notifications currently offline.',
        environment: 'Barn environmental readings temporarily unreachable.',
      })
      setSyncStatus((prev) => ({
        ...prev,
        syncError:
          'Data synchronization temporarily unavailable. Retrying automatically...',
      }))
    } else if (mode === 'empty') {
      setIsGlobalLoading(false)
      setTabLoading({
        dashboard: false,
        actions: false,
        animals: false,
        screenings: false,
        trends: false,
        alerts: false,
        environment: false,
      })
      setTabError({
        dashboard: null,
        actions: null,
        animals: null,
        screenings: null,
        trends: null,
        alerts: null,
        environment: null,
      })
      // Clear data to show empty states
      setAnimals([])
      setScreenings([])
      setAlerts([])
      setBarnZones([])
    } else {
      // Normal mode: restore sample data and clear loading/error
      setIsGlobalLoading(false)
      setTabLoading({
        dashboard: false,
        actions: false,
        animals: false,
        screenings: false,
        trends: false,
        alerts: false,
        environment: false,
      })
      setTabError({
        dashboard: null,
        actions: null,
        animals: null,
        screenings: null,
        trends: null,
        alerts: null,
        environment: null,
      })
      const [dbAnimals, dbScreenings, dbAlerts, dbOutcomes, dbBarns] = await Promise.all([
        getAnimalsFromDb(),
        getScreeningsFromDb(),
        getAlertsFromDb(),
        getVetOutcomesFromDb(),
        getBarnsFromDb(),
      ])
      setAnimals(dbAnimals)
      setScreenings(dbScreenings)
      setAlerts(dbAlerts)
      setBarnZones(dbBarns)
      setVetOutcomes(dbOutcomes)
      setSyncStatus((prev) => ({
        ...prev,
        syncError: undefined,
      }))
    }
  }

  // Retry Tab Action
  const retryTab = async (tab: TabType) => {
    setIsRetryingTab((prev) => ({ ...prev, [tab]: true }))
    setTabLoading((prev) => ({ ...prev, [tab]: true }))

    try {
      if (tab === 'animals' || tab === 'dashboard' || tab === 'actions') {
        const dbAnimals = await getAnimalsFromDb()
        if (dbAnimals.length > 0) setAnimals(dbAnimals)
      }
      if (tab === 'screenings') {
        const dbScreenings = await getScreeningsFromDb()
        if (dbScreenings.length > 0) setScreenings(dbScreenings)
      }
      if (tab === 'alerts' || tab === 'dashboard' || tab === 'actions') {
        const dbAlerts = await getAlertsFromDb()
        if (dbAlerts.length > 0) setAlerts(dbAlerts)
      }
      if (tab === 'environment') {
        const dbBarns = await getBarnsFromDb()
        if (dbBarns.length > 0) setBarnZones(dbBarns)
      }
    } catch (e) {
      console.warn(`Error retrying tab ${tab}:`, e)
    }

    setIsRetryingTab((prev) => ({ ...prev, [tab]: false }))
    setTabLoading((prev) => ({ ...prev, [tab]: false }))
    setTabError((prev) => ({ ...prev, [tab]: null }))

    addToast({
      title: 'Connection Restored',
      message: `Successfully refreshed data for ${tab.toUpperCase()} screen.`,
      type: 'success',
    })
  }

  // Retry Sync Action
  const retrySync = async () => {
    setSyncStatus((prev) => ({
      ...prev,
      syncInProgress: true,
      syncError: undefined,
    }))

    const [dbAnimals, dbScreenings, dbAlerts, dbOutcomes] = await Promise.all([
      getAnimalsFromDb(),
      getScreeningsFromDb(),
      getAlertsFromDb(),
      getVetOutcomesFromDb(),
    ])

    if (dbAnimals.length > 0) setAnimals(dbAnimals)
    if (dbScreenings.length > 0) setScreenings(dbScreenings)
    if (dbAlerts.length > 0) setAlerts(dbAlerts)
    if (dbOutcomes.length > 0) setVetOutcomes(dbOutcomes)

    setSyncStatus((prev) => ({
      ...prev,
      syncInProgress: false,
      pendingRecordsCount: 0,
      lastSyncTime:
        'Just now (' +
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }) +
        ')',
      syncError: undefined,
    }))

    // Clear error states on retry
    setTabError({
      dashboard: null,
      actions: null,
      animals: null,
      screenings: null,
      trends: null,
      alerts: null,
      environment: null,
    })

    if (testModeState === 'error') {
      setTestModeState('normal')
    }

    addToast({
      title: 'Sync Completed',
      message: 'All local parlor records uploaded to Dairy Central Cloud.',
      type: 'success',
    })
  }

  const resetToSampleData = async () => {
    setTestModeState('normal')
    setIsGlobalLoading(false)
    setTabLoading({
      dashboard: false,
      actions: false,
      animals: false,
      screenings: false,
      trends: false,
      alerts: false,
      environment: false,
    })
    setTabError({
      dashboard: null,
      actions: null,
      animals: null,
      screenings: null,
      trends: null,
      alerts: null,
      environment: null,
    })

    const [dbAnimals, dbScreenings, dbAlerts, dbOutcomes, dbBarns] = await Promise.all([
      getAnimalsFromDb(),
      getScreeningsFromDb(),
      getAlertsFromDb(),
      getVetOutcomesFromDb(),
      getBarnsFromDb(),
    ])

    const initialHerd = dbAnimals.length > 0 ? dbAnimals : INDIAN_HERD_ANIMALS
    const initialScreenings = dbScreenings.length > 0 ? dbScreenings : INDIAN_SCREENING_RECORDS

    setAnimals(initialHerd)
    setScreenings(initialScreenings)
    setAlerts(dbAlerts)
    setVetOutcomes(dbOutcomes)
    setBarnZones(dbBarns)

    setSyncStatus({
      isOnline: true,
      pendingRecordsCount: 0,
      lastSyncTime: 'Cloud Sync Active',
      syncInProgress: false,
      syncError: undefined,
    })

    addToast({
      title: 'Data Reset',
      message: 'Restored baseline herd dataset into Cloud Firestore.',
      type: 'info',
    })
  }

  const clearDataset = (target: 'all' | 'actions' | 'animals' | 'screenings' | 'alerts') => {
    if (target === 'all') {
      setAnimals([])
      setScreenings([])
      setAlerts([])
      setBarnZones([])
    } else if (target === 'actions') {
      // Set all animals to low risk so no actions are pending
      setAnimals((prev) =>
        prev.map((a) => ({
          ...a,
          currentRisk: 'low' as RiskLevel,
          riskScore: 10,
          ec: 4.8,
          recommendedAction: 'Routine management.',
        })),
      )
    } else if (target === 'animals') {
      setAnimals([])
    } else if (target === 'screenings') {
      setScreenings([])
    } else if (target === 'alerts') {
      setAlerts([])
    }

    addToast({
      title: 'Empty State Activated',
      message: `Cleared ${target} dataset to demonstrate empty state handling.`,
      type: 'info',
    })
  }

  const openAnimalProfile = (id: string) => setSelectedAnimalId(id)
  const closeAnimalProfile = () => setSelectedAnimalId(null)

  const openOutcomeModal = (id: string) => setOutcomeAnimalId(id)
  const closeOutcomeModal = () => setOutcomeAnimalId(null)

  const recordOutcome = (data: Omit<VeterinaryOutcome, 'id' | 'timestamp'>) => {
    const newOutcome: VeterinaryOutcome = {
      ...data,
      id: `vet-${Date.now()}`,
      timestamp:
        'Today, ' +
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
    }

    setVetOutcomes((prev) => [newOutcome, ...prev])
    saveVetOutcomeToDb(newOutcome).catch((e) =>
      console.warn('Error saving outcome to Firestore:', e),
    )

    // Update animal risk if confirmed or resolved
    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id === data.animalId) {
          let updatedCow: Animal
          if (data.outcome === 'not_mastitis') {
            updatedCow = {
              ...a,
              currentRisk: 'low' as RiskLevel,
              riskScore: 15,
              recommendedAction: 'Cleared by veterinary examination.',
            }
          } else if (data.outcome === 'confirmed_mastitis') {
            updatedCow = {
              ...a,
              currentRisk: 'critical' as RiskLevel,
              riskScore: 98,
              recommendedAction: `Under active veterinary protocol. Milk withheld (${data.milkWithholdDays || 3} days).`,
            }
          } else {
            updatedCow = a
          }
          saveAnimalToDb(updatedCow).catch((e) => console.warn('Error saving updated animal:', e))
          return updatedCow
        }
        return a
      }),
    )

    // Queue sync if offline
    if (!syncStatus.isOnline) {
      setSyncStatus((prev) => ({
        ...prev,
        pendingRecordsCount: prev.pendingRecordsCount + 1,
      }))
    }

    addToast({
      title: 'Veterinary Outcome Logged',
      message: `Clinical record saved to Cloud Firestore for cow ${data.animalTag}.`,
      type: 'success',
      animalId: data.animalId,
    })

    closeOutcomeModal()
  }

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((alt) => {
        if (alt.id === id) {
          const updated = { ...alt, acknowledged: true }
          saveAlertToDb(updated).catch((e) => console.warn('Error updating alert in Firestore:', e))
          return updated
        }
        return alt
      }),
    )
  }

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alt) => alt.id !== id))
  }

  const toggleOfflineMode = () => {
    setSyncStatus((prev) => ({
      ...prev,
      isOnline: !prev.isOnline,
    }))
    addToast({
      title: !syncStatus.isOnline ? 'Online Connection Restored' : 'Offline Hub Mode Active',
      message: !syncStatus.isOnline
        ? 'Connected to cloud. Records will synchronize.'
        : 'Running in local offline mode.',
      type: !syncStatus.isOnline ? 'success' : 'warning',
    })
  }

  const recordQuickCheck = (animalId: string, customEc?: number) => {
    const cow = animals.find((a) => a.id === animalId) || animals[0]
    if (!cow) return
    const ec = customEc ?? parseFloat((Math.random() * 2.5 + 4.6).toFixed(1))
    const ph = parseFloat((6.5 + (ec > 6.0 ? 0.35 : 0.05)).toFixed(2))

    let risk: RiskLevel = 'low'
    let riskScore = 15
    if (ec > 6.8) {
      risk = 'critical'
      riskScore = 91
    } else if (ec > 5.8) {
      risk = 'high'
      riskScore = 76
    } else if (ec > 5.4) {
      risk = 'watch'
      riskScore = 52
    }

    const newRecord: ScreeningRecord = {
      id: `scr-${Date.now()}`,
      timestamp: 'Just now',
      animalId: cow.id,
      animalTag: cow.tag,
      animalName: cow.name,
      ec,
      ph,
      milkTemp: parseFloat((38.5 + (ec > 6.0 ? 0.6 : 0.1)).toFixed(1)),
      riskScore,
      riskLevel: risk,
      penLocation: cow.assignedPen,
      automatedFlag: risk === 'high' || risk === 'critical',
      notes:
        risk === 'critical' ? 'Elevated conductivity - observation recommended.' : undefined,
    }

    setScreenings((prev) => [newRecord, ...prev])
    saveScreeningToDb(newRecord).catch((e) =>
      console.warn('Error saving screening to Firestore:', e),
    )

    // Update animal's current metrics
    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id === cow.id) {
          const updatedCow: Animal = {
            ...a,
            ec,
            ph,
            currentRisk: risk,
            riskScore,
            lastScreeningDate: 'Just now',
          }
          saveAnimalToDb(updatedCow).catch((e) =>
            console.warn('Error updating cow in Firestore:', e),
          )
          return updatedCow
        }
        return a
      }),
    )

    if (risk === 'critical' || risk === 'high') {
      const newAlert: AlertItem = {
        id: `alt-${Date.now()}`,
        timestamp: 'Just now',
        severity: risk === 'critical' ? 'critical' : 'warning',
        title: `Observation Needed: Cow ${cow.tag} (${cow.name})`,
        message: `Milk test recorded electrical conductivity ${ec} mS/cm. Action recommended.`,
        animalId: cow.id,
        animalTag: cow.tag,
        acknowledged: false,
        recommendedAction: 'Inspect udder and review wearable activity trend.',
      }
      setAlerts((prev) => [newAlert, ...prev])
      saveAlertToDb(newAlert).catch((e) => console.warn('Error saving alert in Firestore:', e))

      addToast({
        title: `Check Flag: Cow ${cow.tag}`,
        message: `Cow ${cow.tag} (${cow.name}) flagged for attention.`,
        type: risk === 'critical' ? 'alert' : 'warning',
        animalId: cow.id,
      })
    } else {
      addToast({
        title: 'Check Completed',
        message: `Cow ${cow.tag} (${cow.name}) parameters normal.`,
        type: 'success',
        animalId: cow.id,
      })
    }

    if (!syncStatus.isOnline) {
      setSyncStatus((prev) => ({
        ...prev,
        pendingRecordsCount: prev.pendingRecordsCount + 1,
      }))
    }
  }

  return (
    <HerdContext.Provider
      value={{
        language,
        setLanguage,
        t,
        activeTab,
        setActiveTab,
        touchMode,
        toggleTouchMode,
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
        appointmentCow,
        openAppointmentModal,
        closeAppointmentModal,
        isSyncModalOpen,
        setSyncModalOpen,
        isQuickCheckModalOpen,
        setQuickCheckModalOpen,
        acknowledgeAlert,
        dismissAlert,
        toasts,
        addToast,
        dismissToast,
        recordQuickCheck,
        toggleOfflineMode,
      }}
    >
      {children}
    </HerdContext.Provider>
  )
}

export const useHerd = () => {
  const context = useContext(HerdContext)
  if (!context) {
    throw new Error('useHerd must be used within a HerdProvider')
  }
  return context
}

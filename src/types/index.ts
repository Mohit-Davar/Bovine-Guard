export type RiskLevel = 'normal' | 'suspected' | 'risked' | 'low' | 'watch' | 'high' | 'critical'

export interface WearableActivity {
  ruminationMinutes: number // minutes/day (normal: 420-550)
  ruminationBaseline: number // average
  activityStatus: 'normal' | 'restless' | 'lethargic' | 'estrus'
  bodyTemp: number // Celsius (normal: 38.5 - 39.3)
  batteryPercent: number
}

export interface Animal {
  id: string
  tag: string // Cow ID/Tag e.g. "024"
  name: string
  breed: string
  ageYears: number
  parity: number // lactation number
  lactationPeriod?: 'early' | 'mid' | 'late' | 'dry'
  daysInMilk?: number
  currentRisk: RiskLevel
  riskScore: number // 0 - 100
  priorMastitisCount: number
  lastScreeningDate: string
  ec: number // Electrical conductivity in mS/cm (normal: 4.5 - 5.5, elevated: > 6.0)
  ph: number // Normal: 6.5 - 6.8
  milkTemp: number // Celsius (normal: 38.0 - 39.0)
  wearable?: WearableActivity
  contributingFactors: string[]
  recommendedAction: string
  assignedPen: string
  assignedBarn?: string
  dailyMilkYieldKg: number
  screeningHistory?: Array<{ date: string; ec: number; yieldKg?: number; activityPct?: number }>
}

export interface ScreeningRecord {
  id: string
  timestamp: string
  animalId: string
  animalTag: string
  animalName: string
  ec: number
  ph: number
  milkTemp: number // Celsius
  riskScore: number
  riskLevel: RiskLevel
  penLocation?: string
  automatedFlag: boolean
  notes?: string
}

export interface ChatGenerativeCard {
  type: 'cow_card' | 'herd_summary' | 'action_prompt'
  cowId?: string
  title?: string
  description?: string
  data?: any
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  timestamp: string
  text: string
  card?: ChatGenerativeCard
}

export interface AlertItem {
  id: string
  timestamp: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  message: string
  animalId?: string
  animalTag?: string
  acknowledged: boolean
  recommendedAction: string
}

export type OutcomeType = 'confirmed_mastitis' | 'not_mastitis' | 'other_disease' | 'inconclusive'

export interface VeterinaryOutcome {
  id: string
  animalId: string
  animalTag: string
  timestamp: string
  outcome: OutcomeType
  mastitisType?: 'clinical' | 'subclinical'
  milkWithholdDays?: number
  treatmentAdministered?: string
  notes: string
  recordedBy: string
}

export interface BarnZone {
  id: string
  name: string
  tempC: number
  humidityPct: number
  thi: number // Temperature-Humidity Index
  status: 'normal' | 'mild_stress' | 'moderate_stress' | 'severe_stress'
  fansActive: boolean
  mistingActive: boolean
}

export interface SyncStatus {
  isOnline: boolean
  pendingRecordsCount: number
  lastSyncTime: string
  syncInProgress: boolean
  syncError?: string
}

export type TabType =
  'dashboard' | 'actions' | 'animals' | 'screenings' | 'trends' | 'alerts' | 'environment'

export type SupportedLanguage = 'en' | 'hi' | 'pa' | 'gu' | 'mr' | 'te' | 'ta'

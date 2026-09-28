import { Animal, ScreeningRecord } from '../types'

export interface FarmEnvironment {
  tempC: number
  tempStatus: 'Normal' | 'Watch' | 'High'
  humidityPct: number
  humidityStatus: 'Normal' | 'Watch' | 'High'
  nh3Ppm: number
  nh3Status: 'Normal' | 'Watch' | 'High'
  thi: number
  thiStatus: 'Normal' | 'Watch' | 'High'
}

export interface PenSummary {
  name: string
  totalCows: number
  checkedToday: number
  suspicious: number
  atRisk: number
  healthy: number
}

export interface BreedSummary {
  breed: string
  total: number
  healthy: number
  atRisk: number
  suspicious: number
}

export interface WearableStats {
  suspiciousCows: number
  suspiciousWithWearable: number
  suspiciousPendingWearable: number
  totalWearables: number
  activeWearables: number
  availableWearables: number
  utilisationPct: number
}

export interface HourlyEnvironmentData {
  time: string
  tempC: number
  humidityPct: number
  thi: number
  nh3Ppm: number
}

export interface HerdDailyTrend {
  date: string
  avgYieldL: number
  avgEc: number
  healthyPct: number
}

export const FARM_ENVIRONMENT: FarmEnvironment = {
  tempC: 29.4,
  tempStatus: 'Normal',
  humidityPct: 68,
  humidityStatus: 'Watch',
  nh3Ppm: 12,
  nh3Status: 'Normal',
  thi: 78,
  thiStatus: 'Watch',
}

export const HOURLY_ENVIRONMENT_TRENDS: HourlyEnvironmentData[] = [
  { time: '04:00 AM', tempC: 23.5, humidityPct: 82, thi: 72, nh3Ppm: 8 },
  { time: '08:00 AM', tempC: 26.8, humidityPct: 74, thi: 75, nh3Ppm: 10 },
  { time: '12:00 PM', tempC: 31.2, humidityPct: 64, thi: 80, nh3Ppm: 14 },
  { time: '03:00 PM', tempC: 32.6, humidityPct: 58, thi: 81, nh3Ppm: 15 },
  { time: '06:00 PM', tempC: 29.4, humidityPct: 68, thi: 78, nh3Ppm: 12 },
  { time: '09:00 PM', tempC: 26.1, humidityPct: 76, thi: 75, nh3Ppm: 9 },
]

export const HERD_DAILY_TRENDS: HerdDailyTrend[] = [
  { date: 'Mon', avgYieldL: 9.8, avgEc: 4.9, healthyPct: 88 },
  { date: 'Tue', avgYieldL: 9.6, avgEc: 5.0, healthyPct: 86 },
  { date: 'Wed', avgYieldL: 9.5, avgEc: 5.1, healthyPct: 85 },
  { date: 'Thu', avgYieldL: 9.4, avgEc: 5.2, healthyPct: 84 },
  { date: 'Fri', avgYieldL: 9.2, avgEc: 5.4, healthyPct: 82 },
  { date: 'Sat', avgYieldL: 9.1, avgEc: 5.5, healthyPct: 80 },
  { date: 'Today', avgYieldL: 8.9, avgEc: 5.6, healthyPct: 78 },
]

export const PEN_SUMMARIES: PenSummary[] = [
  {
    name: 'Pen 1',
    totalCows: 32,
    checkedToday: 24,
    suspicious: 2,
    atRisk: 5,
    healthy: 25,
  },
  {
    name: 'Pen 2',
    totalCows: 28,
    checkedToday: 26,
    suspicious: 1,
    atRisk: 3,
    healthy: 24,
  },
  {
    name: 'Pen 3',
    totalCows: 34,
    checkedToday: 30,
    suspicious: 2,
    atRisk: 4,
    healthy: 28,
  },
  {
    name: 'Pen 4',
    totalCows: 34,
    checkedToday: 36,
    suspicious: 1,
    atRisk: 6,
    healthy: 29,
  },
]

export const BREED_SUMMARIES: BreedSummary[] = [
  { breed: 'Gir', total: 24, healthy: 19, atRisk: 4, suspicious: 1 },
  { breed: 'Sahiwal', total: 18, healthy: 15, atRisk: 2, suspicious: 1 },
  { breed: 'HF Cross', total: 42, healthy: 29, atRisk: 9, suspicious: 4 },
  { breed: 'Tharparkar', total: 22, healthy: 17, atRisk: 4, suspicious: 1 },
  { breed: 'Rathi', total: 12, healthy: 9, atRisk: 3, suspicious: 0 },
  { breed: 'Jersey Cross', total: 10, healthy: 8, atRisk: 2, suspicious: 0 },
]

export const WEARABLE_STATS: WearableStats = {
  suspiciousCows: 6,
  suspiciousWithWearable: 4,
  suspiciousPendingWearable: 2,
  totalWearables: 8,
  activeWearables: 5,
  availableWearables: 3,
  utilisationPct: 62.5,
}

// Indian farm sample cows
export const INDIAN_HERD_ANIMALS: Animal[] = [
  {
    id: 'cow-024',
    tag: '024',
    name: 'Cow 024',
    breed: 'Gir',
    ageYears: 4,
    parity: 2,
    daysInMilk: 110,
    currentRisk: 'suspected', // "Suspicious"
    riskScore: 78,
    priorMastitisCount: 1,
    lastScreeningDate: 'Today, 06:42 AM',
    ec: 7.8,
    ph: 6.8,
    milkTemp: 38.1,
    dailyMilkYieldKg: 5.4,
    assignedPen: 'Pen 2',
    contributingFactors: ['Elevated EC (+18%)', 'Reduced physical activity', 'Increased lying time'],
    recommendedAction: 'Schedule veterinary checkup & verify conductivity in next shift.',
    wearable: {
      ruminationMinutes: 360,
      ruminationBaseline: 460,
      activityStatus: 'lethargic',
      bodyTemp: 39.1,
      batteryPercent: 88,
    },
    screeningHistory: [
      { date: 'Today', ec: 7.8, yieldKg: 5.4, activityPct: 82 },
      { date: 'Yesterday', ec: 6.4, yieldKg: 6.1, activityPct: 88 },
      { date: '2 days ago', ec: 5.1, yieldKg: 6.8, activityPct: 96 },
      { date: '3 days ago', ec: 4.9, yieldKg: 7.0, activityPct: 100 },
      { date: '4 days ago', ec: 5.0, yieldKg: 7.1, activityPct: 98 },
    ],
  },
  {
    id: 'cow-037',
    tag: '037',
    name: 'Cow 037',
    breed: 'HF Cross',
    ageYears: 3,
    parity: 1,
    daysInMilk: 64,
    currentRisk: 'watch', // "At Risk"
    riskScore: 58,
    priorMastitisCount: 0,
    lastScreeningDate: 'Today, 06:55 AM',
    ec: 6.4,
    ph: 6.7,
    milkTemp: 38.5,
    dailyMilkYieldKg: 8.2,
    assignedPen: 'Pen 1',
    contributingFactors: ['Conductivity elevated', 'Milk temp normal'],
    recommendedAction: 'Assign available collar to start physical monitoring.',
    screeningHistory: [
      { date: 'Today', ec: 6.4, yieldKg: 8.2, activityPct: 92 },
      { date: 'Yesterday', ec: 5.9, yieldKg: 8.8, activityPct: 95 },
      { date: '2 days ago', ec: 5.2, yieldKg: 9.4, activityPct: 98 },
      { date: '3 days ago', ec: 5.0, yieldKg: 9.5, activityPct: 100 },
    ],
  },
  {
    id: 'cow-042',
    tag: '042',
    name: 'Cow 042',
    breed: 'Sahiwal',
    ageYears: 5,
    parity: 3,
    daysInMilk: 140,
    currentRisk: 'suspected', // "Suspicious"
    riskScore: 82,
    priorMastitisCount: 1,
    lastScreeningDate: 'Today, 06:30 AM',
    ec: 7.6,
    ph: 6.9,
    milkTemp: 38.6,
    dailyMilkYieldKg: 4.8,
    assignedPen: 'Pen 3',
    contributingFactors: ['High milk EC', 'Yield down 20%', 'Collar movement reduced'],
    recommendedAction: 'Isolate milk bucket and request doctor visit.',
    wearable: {
      ruminationMinutes: 340,
      ruminationBaseline: 480,
      activityStatus: 'lethargic',
      bodyTemp: 39.3,
      batteryPercent: 92,
    },
    screeningHistory: [
      { date: 'Today', ec: 7.6, yieldKg: 4.8, activityPct: 78 },
      { date: 'Yesterday', ec: 7.0, yieldKg: 5.4, activityPct: 84 },
      { date: '2 days ago', ec: 6.2, yieldKg: 6.2, activityPct: 90 },
      { date: '3 days ago', ec: 5.2, yieldKg: 6.9, activityPct: 99 },
    ],
  },
  {
    id: 'cow-058',
    tag: '058',
    name: 'Cow 058',
    breed: 'Rathi',
    ageYears: 4,
    parity: 2,
    daysInMilk: 95,
    currentRisk: 'watch', // "At Risk"
    riskScore: 54,
    priorMastitisCount: 0,
    lastScreeningDate: 'Today, 07:10 AM',
    ec: 6.2,
    ph: 6.7,
    milkTemp: 38.4,
    dailyMilkYieldKg: 7.0,
    assignedPen: 'Pen 3',
    contributingFactors: ['Slight conductivity rise', 'Watch next milking'],
    recommendedAction: 'Start wearable tracking round.',
    screeningHistory: [
      { date: 'Today', ec: 6.2, yieldKg: 7.0, activityPct: 91 },
      { date: 'Yesterday', ec: 5.5, yieldKg: 7.4, activityPct: 95 },
      { date: '2 days ago', ec: 5.1, yieldKg: 7.5, activityPct: 98 },
    ],
  },
  {
    id: 'cow-071',
    tag: '071',
    name: 'Cow 071',
    breed: 'Gir',
    ageYears: 6,
    parity: 4,
    daysInMilk: 210,
    currentRisk: 'suspected', // "Suspicious"
    riskScore: 85,
    priorMastitisCount: 2,
    lastScreeningDate: 'Today, 06:15 AM',
    ec: 8.0,
    ph: 7.0,
    milkTemp: 38.9,
    dailyMilkYieldKg: 3.9,
    assignedPen: 'Pen 4',
    contributingFactors: ['Sharp EC rise (+24%)', 'Milk temp 38.9°C', 'Activity low'],
    recommendedAction: 'Urgent vet review requested. Separate milking order.',
    wearable: {
      ruminationMinutes: 310,
      ruminationBaseline: 450,
      activityStatus: 'lethargic',
      bodyTemp: 39.4,
      batteryPercent: 76,
    },
    screeningHistory: [
      { date: 'Today', ec: 8.0, yieldKg: 3.9, activityPct: 72 },
      { date: 'Yesterday', ec: 7.2, yieldKg: 4.5, activityPct: 80 },
      { date: '2 days ago', ec: 6.5, yieldKg: 5.3, activityPct: 88 },
      { date: '3 days ago', ec: 5.4, yieldKg: 6.0, activityPct: 97 },
    ],
  },
  {
    id: 'cow-089',
    tag: '089',
    name: 'Cow 089',
    breed: 'Tharparkar',
    ageYears: 3,
    parity: 1,
    daysInMilk: 45,
    currentRisk: 'watch', // "At Risk"
    riskScore: 56,
    priorMastitisCount: 0,
    lastScreeningDate: 'Today, 07:22 AM',
    ec: 6.5,
    ph: 6.8,
    milkTemp: 38.4,
    dailyMilkYieldKg: 6.8,
    assignedPen: 'Pen 2',
    contributingFactors: ['Conductivity slightly high', 'Collar pending'],
    recommendedAction: 'Monitor electrical conductivity during evening shift.',
    screeningHistory: [
      { date: 'Today', ec: 6.5, yieldKg: 6.8, activityPct: 90 },
      { date: 'Yesterday', ec: 5.8, yieldKg: 7.2, activityPct: 96 },
      { date: '2 days ago', ec: 5.2, yieldKg: 7.4, activityPct: 100 },
    ],
  },
  {
    id: 'cow-102',
    tag: '102',
    name: 'Cow 102',
    breed: 'HF Cross',
    ageYears: 4,
    parity: 2,
    daysInMilk: 130,
    currentRisk: 'suspected', // "Suspicious"
    riskScore: 80,
    priorMastitisCount: 1,
    lastScreeningDate: 'Today, 06:40 AM',
    ec: 7.4,
    ph: 6.9,
    milkTemp: 38.7,
    dailyMilkYieldKg: 8.5,
    assignedPen: 'Pen 1',
    contributingFactors: ['High EC', 'Collar indicates restless/fever', 'Milk temp 38.7°C'],
    recommendedAction: 'Veterinary assessment scheduled. Physical check required.',
    wearable: {
      ruminationMinutes: 350,
      ruminationBaseline: 470,
      activityStatus: 'restless',
      bodyTemp: 39.2,
      batteryPercent: 84,
    },
    screeningHistory: [
      { date: 'Today', ec: 7.4, yieldKg: 8.5, activityPct: 80 },
      { date: 'Yesterday', ec: 6.8, yieldKg: 9.3, activityPct: 88 },
      { date: '2 days ago', ec: 5.5, yieldKg: 10.2, activityPct: 98 },
    ],
  },
  {
    id: 'cow-001',
    tag: '001',
    name: 'Cow 001',
    breed: 'Gir',
    ageYears: 5,
    parity: 3,
    daysInMilk: 120,
    currentRisk: 'normal', // "Healthy"
    riskScore: 12,
    priorMastitisCount: 0,
    lastScreeningDate: 'Today, 06:10 AM',
    ec: 5.0,
    ph: 6.6,
    milkTemp: 38.2,
    dailyMilkYieldKg: 7.2,
    assignedPen: 'Pen 1',
    contributingFactors: [],
    recommendedAction: 'Routine management.',
    wearable: {
      ruminationMinutes: 490,
      ruminationBaseline: 480,
      activityStatus: 'normal',
      bodyTemp: 38.6,
      batteryPercent: 95,
    },
    screeningHistory: [
      { date: 'Today', ec: 5.0, yieldKg: 7.2, activityPct: 100 },
      { date: 'Yesterday', ec: 4.9, yieldKg: 7.1, activityPct: 99 },
      { date: '2 days ago', ec: 5.1, yieldKg: 7.3, activityPct: 100 },
    ],
  },
  {
    id: 'cow-002',
    tag: '002',
    name: 'Cow 002',
    breed: 'Sahiwal',
    ageYears: 4,
    parity: 2,
    daysInMilk: 80,
    currentRisk: 'normal', // "Healthy"
    riskScore: 10,
    priorMastitisCount: 0,
    lastScreeningDate: 'Today, 06:14 AM',
    ec: 4.9,
    ph: 6.5,
    milkTemp: 38.0,
    dailyMilkYieldKg: 6.9,
    assignedPen: 'Pen 1',
    contributingFactors: [],
    recommendedAction: 'Routine management.',
    screeningHistory: [
      { date: 'Today', ec: 4.9, yieldKg: 6.9, activityPct: 100 },
      { date: 'Yesterday', ec: 4.8, yieldKg: 6.8, activityPct: 100 },
      { date: '2 days ago', ec: 5.0, yieldKg: 7.0, activityPct: 98 },
    ],
  },
  {
    id: 'cow-005',
    tag: '005',
    name: 'Cow 005',
    breed: 'Tharparkar',
    ageYears: 4,
    parity: 2,
    daysInMilk: 105,
    currentRisk: 'normal', // "Healthy"
    riskScore: 14,
    priorMastitisCount: 0,
    lastScreeningDate: 'Today, 06:20 AM',
    ec: 5.1,
    ph: 6.6,
    milkTemp: 38.3,
    dailyMilkYieldKg: 6.5,
    assignedPen: 'Pen 2',
    contributingFactors: [],
    recommendedAction: 'Routine management.',
    screeningHistory: [
      { date: 'Today', ec: 5.1, yieldKg: 6.5, activityPct: 98 },
      { date: 'Yesterday', ec: 5.0, yieldKg: 6.6, activityPct: 99 },
      { date: '2 days ago', ec: 5.2, yieldKg: 6.4, activityPct: 97 },
    ],
  },
  {
    id: 'cow-011',
    tag: '011',
    name: 'Cow 011',
    breed: 'Gir',
    ageYears: 3,
    parity: 1,
    daysInMilk: 50,
    currentRisk: 'normal', // "Healthy"
    riskScore: 11,
    priorMastitisCount: 0,
    lastScreeningDate: 'Today, 06:25 AM',
    ec: 5.2,
    ph: 6.6,
    milkTemp: 38.2,
    dailyMilkYieldKg: 6.8,
    assignedPen: 'Pen 2',
    contributingFactors: [],
    recommendedAction: 'Routine management.',
    screeningHistory: [
      { date: 'Today', ec: 5.2, yieldKg: 6.8, activityPct: 99 },
      { date: 'Yesterday', ec: 5.1, yieldKg: 6.7, activityPct: 100 },
      { date: '2 days ago', ec: 5.0, yieldKg: 6.9, activityPct: 100 },
    ],
  },
  {
    id: 'cow-015',
    tag: '015',
    name: 'Cow 015',
    breed: 'Rathi',
    ageYears: 5,
    parity: 3,
    daysInMilk: 160,
    currentRisk: 'normal', // "Healthy"
    riskScore: 16,
    priorMastitisCount: 0,
    lastScreeningDate: 'Today, 06:32 AM',
    ec: 4.8,
    ph: 6.5,
    milkTemp: 38.1,
    dailyMilkYieldKg: 6.1,
    assignedPen: 'Pen 3',
    contributingFactors: [],
    recommendedAction: 'Routine management.',
    screeningHistory: [
      { date: 'Today', ec: 4.8, yieldKg: 6.1, activityPct: 100 },
      { date: 'Yesterday', ec: 4.9, yieldKg: 6.0, activityPct: 98 },
      { date: '2 days ago', ec: 4.7, yieldKg: 6.2, activityPct: 100 },
    ],
  },
]

export const INDIAN_SCREENING_RECORDS: ScreeningRecord[] = [
  {
    id: 'scr-001',
    timestamp: 'Today, 06:42 AM',
    animalId: 'cow-024',
    animalTag: '024',
    animalName: 'Cow 024',
    ec: 7.8,
    ph: 6.8,
    milkTemp: 38.1,
    riskScore: 78,
    riskLevel: 'suspected',
    penLocation: 'Pen 2',
    automatedFlag: true,
    notes: 'Milk conductivity high (7.8 mS/cm). Wearable shows reduced activity.',
  },
  {
    id: 'scr-002',
    timestamp: 'Today, 06:55 AM',
    animalId: 'cow-037',
    animalTag: '037',
    animalName: 'Cow 037',
    ec: 6.4,
    ph: 6.7,
    milkTemp: 38.5,
    riskScore: 58,
    riskLevel: 'watch',
    penLocation: 'Pen 1',
    automatedFlag: false,
    notes: 'Conductivity elevated. Wearable pending start.',
  },
  {
    id: 'scr-003',
    timestamp: 'Today, 06:30 AM',
    animalId: 'cow-042',
    animalTag: '042',
    animalName: 'Cow 042',
    ec: 7.6,
    ph: 6.9,
    milkTemp: 38.6,
    riskScore: 82,
    riskLevel: 'suspected',
    penLocation: 'Pen 3',
    automatedFlag: true,
    notes: 'Milk yield drop and high conductivity.',
  },
  {
    id: 'scr-004',
    timestamp: 'Today, 07:10 AM',
    animalId: 'cow-058',
    animalTag: '058',
    animalName: 'Cow 058',
    ec: 6.2,
    ph: 6.7,
    milkTemp: 38.4,
    riskScore: 54,
    riskLevel: 'watch',
    penLocation: 'Pen 3',
    automatedFlag: false,
  },
  {
    id: 'scr-005',
    timestamp: 'Today, 06:15 AM',
    animalId: 'cow-071',
    animalTag: '071',
    animalName: 'Cow 071',
    ec: 8.0,
    ph: 7.0,
    milkTemp: 38.9,
    riskScore: 85,
    riskLevel: 'suspected',
    penLocation: 'Pen 4',
    automatedFlag: true,
    notes: 'Critical conductivity spike. Immediate veterinary attention required.',
  },
  {
    id: 'scr-006',
    timestamp: 'Today, 06:10 AM',
    animalId: 'cow-001',
    animalTag: '001',
    animalName: 'Cow 001',
    ec: 5.0,
    ph: 6.6,
    milkTemp: 38.2,
    riskScore: 12,
    riskLevel: 'normal',
    penLocation: 'Pen 1',
    automatedFlag: false,
  },
  {
    id: 'scr-007',
    timestamp: 'Today, 06:14 AM',
    animalId: 'cow-002',
    animalTag: '002',
    animalName: 'Cow 002',
    ec: 4.9,
    ph: 6.5,
    milkTemp: 38.0,
    riskScore: 10,
    riskLevel: 'normal',
    penLocation: 'Pen 1',
    automatedFlag: false,
  },
]

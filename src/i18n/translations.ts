export type SupportedLanguage = 'en' | 'hi' | 'pa' | 'gu' | 'mr' | 'te' | 'ta'

export interface LanguageInfo {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag: string
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🌐',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
  },
]

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  // ============================================================
  // ENGLISH
  // ============================================================
  en: {
    // Nav & System
    appTitle: 'Bovine Guard',
    appSubtitle: 'Mastitis Early Warning & Herd Health',
    tagline: 'Know what needs attention today.',
    tabDashboard: 'Overview',
    tabActions: "Today's Actions",
    tabAnimals: 'Cows',
    tabScreenings: 'Screening Log',
    tabTrends: 'Health Trends',
    tabAlerts: 'Alerts',
    tabEnvironment: 'Barn Environment',
    online: 'Online',
    offline: 'Offline Buffer',
    syncNow: 'Sync Now',
    scanRfid: 'Scan RFID',
    language: 'Language',
    selectLanguage: 'Select Language',

    // Summary Cards
    totalCows: 'Total Cows',
    testedToday: 'Screened Today',
    needAction: 'Needs Attention',
    heatStress: 'Heat Stress (THI)',
    allClear: 'No Immediate Concerns',
    allClearDesc:
      'No cows currently require mastitis-related intervention. Current screening indicators are within the configured monitoring range.',
    activeHerd: 'Active herd',
    coveragePct: 'coverage',
    atRisk: 'At Risk',
    maximumThi: 'Maximum THI',

    // Risk levels
    riskCritical: 'Critical Risk',
    riskHigh: 'High Risk',
    riskWatch: 'Under Observation',
    riskLow: 'Normal',

    // Actions
    actionSeparateVet: 'Separate & Contact Veterinarian',
    actionScreenQuarters: 'Inspect Udder Quarters',
    actionRepeatTest: 'Repeat Screening at Next Milking',
    actionNormalMilking: 'Continue Normal Milking',
    actionDone: 'Mark as Resolved',
    actionViewProfile: 'View Cow Profile',
    actionLogOutcome: 'Log Veterinary Outcome',
    actionRestoreData: 'Reset Demo Data',
    actionRetry: 'Retry Sync',
    outcomeLabel: 'Outcome',

    // Screening & Diagnostics
    sccLabel: 'Somatic Cell Count (SCC)',
    ecLabel: 'Milk Electrical Conductivity (EC)',
    tempLabel: 'Milk Temperature',
    penLabel: 'Pen',
    quarterLabel: 'Udder Quarters',
    ruminationLabel: 'Rumination',
    immediateActionRequired: 'Immediate Attention Required',
    highRiskDetected: 'High Mastitis Risk',
    watchListWarning: 'Under Observation',
    normalStatus: 'Within Normal Range',

    // Search & Filters
    searchPlaceholder: 'Search by cow tag (e.g. 0101) or name...',
    allFilter: 'All',
    filterByRisk: 'Filter by Risk',

    // Dashboard panels
    herdRiskDistribution: 'Herd Risk Distribution',
    currentClassification: 'Current screening classification',
    screeningCoverage: 'Screening Coverage',
    screeningCoverageDesc: 'Milk screening records available for the herd',
    screened: 'screened',
    riskByPen: 'Risk Distribution by Pen',
    riskByPenDesc: 'Compare current health classifications across herd zones',
    sccVsEc: 'SCC vs Milk EC',
    sccVsEcDesc: 'Relationship between two Stage 1 screening parameters',
    noSccData: 'No SCC and EC screening data available.',
    milkScreeningAnalysis: 'Milk Screening Analysis',
    milkScreeningAnalysisDesc: 'Summary of measured Stage 1 parameters',
    avgScc: 'Average SCC',
    acrossScreened: 'Across screened cows',
    elevatedScc: 'Elevated SCC',
    elevatedSccThresh: 'Above 200k cells/mL',
    elevatedEc: 'Elevated EC',
    elevatedEcThresh: 'Above 6.0 mS/cm',
    flaggedHerd: 'Flagged Herd',
    flaggedHerdDesc: 'Suspected + Risked',
    sccEcDisclaimer:
      'SCC and EC are screening indicators. Elevated values identify cows for further assessment and should not be treated as a confirmed diagnosis.',
    stage2Telemetry: 'Stage 2 Telemetry',
    stage2TelemetryDesc: 'Wearable measurements for currently flagged cows',
    flaggedWithWearable: 'Flagged With Wearable',
    avgRumination: 'Avg Rumination',
    noWearableData: 'No wearable telemetry available',
    noWearableDesc: 'Stage 2 data will appear for flagged cows with wearable sensors.',
    heatStressByZone: 'Heat Stress by Zone',
    heatStressByZoneDesc: 'Temperature-humidity index across herd zones',
    herdClear: 'Herd is currently clear',
    herdFlagged: 'cows require attention',
    herdClearDesc: 'No cows are currently classified as suspected or risked.',

    // Actions tab
    actionListDesc:
      'This list shows all cows that require attention based on current screening indicators.',
    allResolvedTitle: 'All Action Items Resolved',
    allResolvedDesc: 'Great work! All flagged cows for this milking shift have been handled.',
    resetCompleted: 'Reset Completed List',

    // Screening History
    screeningLog: 'Screening Log',
    exportCsv: 'Export CSV',
    csvExportTitle: 'CSV Export Generated',
    showAllRecords: 'Show All Records',
    noFurtherAction: 'No Further Action Required',

    // Barn Environment
    fans: 'Fans',
    misting: 'Misting',
    active: 'Active',
    standby: 'Standby',

    // Trends & Map
    trendTabHeatmap: 'Barn Risk Map',
    trendTabOverview: '14-Day Health Trend',
    trendTabQuarters: 'Quarter-Level Analysis',
    trendTabEconomics: 'Udder Health & Milk Loss',
    mapModeContagion: 'Risk Overview',
    mapModeMilkingOrder: 'Milking Sequence',
    mapModeEnvironmental: 'Hygiene & Bedding',
    hotspotAlert: 'High-Risk Area',
    containmentProtocol: 'Control Measures',
    milkLossLabel: 'Estimated Milk Loss',
    bacteriologyLabel: 'Pathogen / Culture Result',
    parlorLinerRisk: 'Milking Equipment Cross-Transmission Risk',
    beddingRisk: 'Wet Bedding & Environmental Risk',
    selectZonePrompt:
      'Select a pen or milking area to review resident cows, screening status and recommended control measures.',
  },

  // ============================================================
  // HINDI
  // ============================================================
  hi: {
    // Nav & System
    appTitle: 'बोवाइनगार्ड (Bovine Guard)',
    appSubtitle: 'थनैला रोग की शुरुआती चेतावनी और झुंड स्वास्थ्य',
    tagline: 'आज किस पर ध्यान देना है, जानें।',
    tabDashboard: 'सारांश',
    tabActions: 'आज के कार्य',
    tabAnimals: 'गायें',
    tabScreenings: 'जांच रिकॉर्ड',
    tabTrends: 'स्वास्थ्य रुझान',
    tabAlerts: 'अलर्ट',
    tabEnvironment: 'गोशाला का वातावरण',
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन डेटा',
    syncNow: 'सिंक करें',
    scanRfid: 'RFID स्कैन करें',
    language: 'भाषा',

    // Summary Cards
    totalCows: 'कुल गायें',
    testedToday: 'आज जांची गईं',
    needAction: 'ध्यान आवश्यक',
    heatStress: 'गर्मी का तनाव (THI)',
    allClear: 'कोई तत्काल चिंता नहीं',
    allClearDesc:
      'फिलहाल किसी गाय में थनैला रोग से संबंधित तत्काल हस्तक्षेप की आवश्यकता नहीं है। वर्तमान जांच संकेतक निर्धारित निगरानी सीमा में हैं।',

    // Risk levels
    riskCritical: 'अत्यधिक जोखिम',
    riskHigh: 'उच्च जोखिम',
    riskWatch: 'निगरानी में',
    riskLow: 'सामान्य',

    // Actions
    actionSeparateVet: 'अलग करें और पशु चिकित्सक से संपर्क करें',
    actionScreenQuarters: 'थन के चारों हिस्सों की जांच करें',
    actionRepeatTest: 'अगली दुहाई में दोबारा जांच करें',
    actionNormalMilking: 'सामान्य दुहाई जारी रखें',
    actionDone: 'समाधान के रूप में दर्ज करें',
    actionViewProfile: 'गाय की प्रोफाइल देखें',
    actionLogOutcome: 'पशु चिकित्सकीय परिणाम दर्ज करें',
    actionRestoreData: 'डेमो डेटा रीसेट करें',
    actionRetry: 'सिंक दोबारा करें',

    // Screening & Diagnostics
    sccLabel: 'सोमैटिक सेल काउंट (SCC)',
    ecLabel: 'दूध की विद्युत चालकता (EC)',
    tempLabel: 'दूध का तापमान',
    penLabel: 'बाड़ा',
    quarterLabel: 'थन के चार हिस्से',
    ruminationLabel: 'जुगाली',
    immediateActionRequired: 'तत्काल ध्यान आवश्यक',
    highRiskDetected: 'थनैला रोग का उच्च जोखिम',
    watchListWarning: 'निगरानी में',
    normalStatus: 'सामान्य सीमा में',

    // Search & Filters
    searchPlaceholder: 'गाय के टैग नंबर (जैसे 0101) या नाम से खोजें...',
    allFilter: 'सभी',
    filterByRisk: 'जोखिम के अनुसार',

    // Barn Environment
    fans: 'पंखे',
    misting: 'पानी का छिड़काव',
    active: 'चालू',
    standby: 'स्टैंडबाय',

    // Trends & Map
    trendTabHeatmap: 'गोशाला जोखिम मानचित्र',
    trendTabOverview: '14-दिन का स्वास्थ्य रुझान',
    trendTabQuarters: 'थन के हिस्सों का विश्लेषण',
    trendTabEconomics: 'थन स्वास्थ्य और दूध की हानि',
    mapModeContagion: 'जोखिम का अवलोकन',
    mapModeMilkingOrder: 'दुहाई का क्रम',
    mapModeEnvironmental: 'स्वच्छता और बिछावन',
    hotspotAlert: 'उच्च जोखिम वाला क्षेत्र',
    containmentProtocol: 'नियंत्रण उपाय',
    milkLossLabel: 'अनुमानित दूध हानि',
    bacteriologyLabel: 'रोगजनक / कल्चर परिणाम',
    parlorLinerRisk: 'दुहाई उपकरण से संक्रमण फैलने का जोखिम',
    beddingRisk: 'गीले बिछावन से पर्यावरणीय संक्रमण का जोखिम',
    selectZonePrompt:
      'उस क्षेत्र की गायों, जांच स्थिति और सुझाए गए नियंत्रण उपायों को देखने के लिए किसी बाड़े या दुहाई क्षेत्र का चयन करें।',
  },

  // ============================================================
  // PUNJABI
  // ============================================================
  pa: {
    // Nav & System
    appTitle: 'ਬੋਵਾਈਨਗਾਰਡ (Bovine Guard)',
    appSubtitle: 'ਥਣਾਂ ਦੀ ਸੋਜ ਦੀ ਸ਼ੁਰੂਆਤੀ ਚੇਤਾਵਨੀ ਅਤੇ ਝੁੰਡ ਦੀ ਸਿਹਤ',
    tagline: 'ਅੱਜ ਕਿਸ ਵੱਲ ਧਿਆਨ ਦੇਣਾ ਹੈ, ਜਾਣੋ।',
    tabDashboard: 'ਸੰਖੇਪ',
    tabActions: 'ਅੱਜ ਦੇ ਕੰਮ',
    tabAnimals: 'ਗਾਵਾਂ',
    tabScreenings: 'ਜਾਂਚ ਰਿਕਾਰਡ',
    tabTrends: 'ਸਿਹਤ ਰੁਝਾਨ',
    tabAlerts: 'ਅਲਰਟ',
    tabEnvironment: 'ਗੋਸ਼ਾਲਾ ਦਾ ਵਾਤਾਵਰਣ',
    online: 'ਔਨਲਾਈਨ',
    offline: 'ਔਫਲਾਈਨ ਡਾਟਾ',
    syncNow: 'ਸਿੰਕ ਕਰੋ',
    scanRfid: 'RFID ਸਕੈਨ ਕਰੋ',
    language: 'ਭਾਸ਼ਾ',

    // Summary Cards
    totalCows: 'ਕੁੱਲ ਗਾਵਾਂ',
    testedToday: 'ਅੱਜ ਜਾਂਚੀਆਂ ਗਾਵਾਂ',
    needAction: 'ਧਿਆਨ ਦੀ ਲੋੜ',
    heatStress: 'ਗਰਮੀ ਦਾ ਤਣਾਅ (THI)',
    allClear: 'ਕੋਈ ਤੁਰੰਤ ਚਿੰਤਾ ਨਹੀਂ',
    allClearDesc:
      'ਫਿਲਹਾਲ ਕਿਸੇ ਵੀ ਗਾਂ ਲਈ ਮਸਟਾਇਟਿਸ ਨਾਲ ਸੰਬੰਧਿਤ ਤੁਰੰਤ ਕਾਰਵਾਈ ਦੀ ਲੋੜ ਨਹੀਂ ਹੈ। ਮੌਜੂਦਾ ਜਾਂਚ ਸੰਕੇਤਕ ਨਿਰਧਾਰਤ ਨਿਗਰਾਨੀ ਹੱਦ ਵਿੱਚ ਹਨ।',

    // Risk levels
    riskCritical: 'ਬਹੁਤ ਵੱਧ ਖ਼ਤਰਾ',
    riskHigh: 'ਵੱਡਾ ਖ਼ਤਰਾ',
    riskWatch: 'ਨਿਗਰਾਨੀ ਹੇਠ',
    riskLow: 'ਆਮ',

    // Actions
    actionSeparateVet: 'ਵੱਖ ਕਰੋ ਅਤੇ ਪਸ਼ੂ ਡਾਕਟਰ ਨਾਲ ਸੰਪਰਕ ਕਰੋ',
    actionScreenQuarters: 'ਥਣ ਦੇ ਚਾਰਾਂ ਹਿੱਸਿਆਂ ਦੀ ਜਾਂਚ ਕਰੋ',
    actionRepeatTest: 'ਅਗਲੀ ਚੁਆਈ ਵੇਲੇ ਦੁਬਾਰਾ ਜਾਂਚ ਕਰੋ',
    actionNormalMilking: 'ਆਮ ਚੁਆਈ ਜਾਰੀ ਰੱਖੋ',
    actionDone: 'ਹੱਲ ਹੋਇਆ ਦਰਜ ਕਰੋ',
    actionViewProfile: 'ਗਾਂ ਦੀ ਪ੍ਰੋਫਾਈਲ ਵੇਖੋ',
    actionLogOutcome: 'ਪਸ਼ੂ ਡਾਕਟਰ ਦਾ ਨਤੀਜਾ ਦਰਜ ਕਰੋ',
    actionRestoreData: 'ਡੈਮੋ ਡਾਟਾ ਰੀਸੈੱਟ ਕਰੋ',
    actionRetry: 'ਸਿੰਕ ਦੁਬਾਰਾ ਕਰੋ',

    // Screening & Diagnostics
    sccLabel: 'ਸੋਮੈਟਿਕ ਸੈੱਲ ਗਿਣਤੀ (SCC)',
    ecLabel: 'ਦੁੱਧ ਦੀ ਬਿਜਲਈ ਚਾਲਕਤਾ (EC)',
    tempLabel: 'ਦੁੱਧ ਦਾ ਤਾਪਮਾਨ',
    penLabel: 'ਵਾੜਾ',
    quarterLabel: 'ਥਣ ਦੇ ਚਾਰ ਹਿੱਸੇ',
    ruminationLabel: 'ਜੁਗਾਲੀ',
    immediateActionRequired: 'ਤੁਰੰਤ ਧਿਆਨ ਦੀ ਲੋੜ',
    highRiskDetected: 'ਮਸਟਾਇਟਿਸ ਦਾ ਵੱਡਾ ਖ਼ਤਰਾ',
    watchListWarning: 'ਨਿਗਰਾਨੀ ਹੇਠ',
    normalStatus: 'ਆਮ ਹੱਦ ਵਿੱਚ',

    // Search & Filters
    searchPlaceholder: 'ਗਾਂ ਦੇ ਟੈਗ ਨੰਬਰ (ਜਿਵੇਂ 0101) ਜਾਂ ਨਾਮ ਨਾਲ ਖੋਜੋ...',
    allFilter: 'ਸਾਰੇ',
    filterByRisk: 'ਖ਼ਤਰੇ ਮੁਤਾਬਕ',

    // Barn Environment
    fans: 'ਪੱਖੇ',
    misting: 'ਪਾਣੀ ਦਾ ਛਿੜਕਾਅ',
    active: 'ਚਾਲੂ',
    standby: 'ਸਟੈਂਡਬਾਈ',

    // Trends & Map
    trendTabHeatmap: 'ਗੋਸ਼ਾਲਾ ਦਾ ਖ਼ਤਰਾ ਨਕਸ਼ਾ',
    trendTabOverview: '14-ਦਿਨ ਦਾ ਸਿਹਤ ਰੁਝਾਨ',
    trendTabQuarters: 'ਥਣ ਦੇ ਹਿੱਸਿਆਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ',
    trendTabEconomics: 'ਥਣ ਦੀ ਸਿਹਤ ਅਤੇ ਦੁੱਧ ਦਾ ਨੁਕਸਾਨ',
    mapModeContagion: 'ਖ਼ਤਰੇ ਦਾ ਜਾਇਜ਼ਾ',
    mapModeMilkingOrder: 'ਚੁਆਈ ਦਾ ਕ੍ਰਮ',
    mapModeEnvironmental: 'ਸਫਾਈ ਅਤੇ ਬਿਸਤਰਾ',
    hotspotAlert: 'ਵੱਧ ਖ਼ਤਰੇ ਵਾਲਾ ਖੇਤਰ',
    containmentProtocol: 'ਨਿਯੰਤਰਣ ਉਪਾਅ',
    milkLossLabel: 'ਅਨੁਮਾਨਿਤ ਦੁੱਧ ਦਾ ਨੁਕਸਾਨ',
    bacteriologyLabel: 'ਰੋਗਜਨਕ / ਕਲਚਰ ਨਤੀਜਾ',
    parlorLinerRisk: 'ਚੁਆਈ ਦੇ ਸਾਜ਼ੋ-ਸਾਮਾਨ ਤੋਂ ਸੰਕਰਮਣ ਫੈਲਣ ਦਾ ਖ਼ਤਰਾ',
    beddingRisk: 'ਗਿੱਲੇ ਬਿਸਤਰੇ ਤੋਂ ਵਾਤਾਵਰਣੀ ਸੰਕਰਮਣ ਦਾ ਖ਼ਤਰਾ',
    selectZonePrompt:
      'ਉਸ ਖੇਤਰ ਦੀਆਂ ਗਾਵਾਂ, ਜਾਂਚ ਸਥਿਤੀ ਅਤੇ ਸੁਝਾਏ ਗਏ ਨਿਯੰਤਰਣ ਉਪਾਅ ਦੇਖਣ ਲਈ ਕਿਸੇ ਵਾੜੇ ਜਾਂ ਚੁਆਈ ਵਾਲੇ ਖੇਤਰ ਨੂੰ ਚੁਣੋ।',
  },

  // ============================================================
  // GUJARATI
  // ============================================================
  gu: {
    // Nav & System
    appTitle: 'બોવાઇનગાર્ડ (Bovine Guard)',
    appSubtitle: 'મસ્ટાઇટિસની વહેલી ચેતવણી અને પશુધન આરોગ્ય',
    tagline: 'આજે કયા પશુ પર ધ્યાન આપવું તે જાણો.',
    tabDashboard: 'સારાંશ',
    tabActions: 'આજના કાર્યો',
    tabAnimals: 'ગાયો',
    tabScreenings: 'તપાસ રેકોર્ડ',
    tabTrends: 'આરોગ્ય ટ્રેન્ડ',
    tabAlerts: 'ચેતવણીઓ',
    tabEnvironment: 'તબેલાનું વાતાવરણ',
    online: 'ઓનલાઇન',
    offline: 'ઓફલાઇન ડેટા',
    syncNow: 'સિંક કરો',
    scanRfid: 'RFID સ્કેન કરો',
    language: 'ભાષા',

    // Summary Cards
    totalCows: 'કુલ ગાયો',
    testedToday: 'આજે તપાસેલી ગાયો',
    needAction: 'ધ્યાન જરૂરી',
    heatStress: 'ગરમીનો તણાવ (THI)',
    allClear: 'કોઈ તાત્કાલિક ચિંતા નથી',
    allClearDesc:
      'હાલમાં કોઈ ગાય માટે મસ્ટાઇટિસ સંબંધિત તાત્કાલિક કાર્યવાહી જરૂરી નથી. વર્તમાન તપાસ સંકેતો નિર્ધારિત મોનિટરિંગ મર્યાદામાં છે.',

    // Risk levels
    riskCritical: 'અતિ ઉચ્ચ જોખમ',
    riskHigh: 'ઉચ્ચ જોખમ',
    riskWatch: 'નિરીક્ષણ હેઠળ',
    riskLow: 'સામાન્ય',

    // Actions
    actionSeparateVet: 'અલગ કરો અને પશુચિકિત્સકનો સંપર્ક કરો',
    actionScreenQuarters: 'આંચળના ચાર ભાગોની તપાસ કરો',
    actionRepeatTest: 'આગામી દોહન સમયે ફરી તપાસો',
    actionNormalMilking: 'સામાન્ય દોહન ચાલુ રાખો',
    actionDone: 'ઉકેલાયેલ તરીકે નોંધો',
    actionViewProfile: 'ગાયની પ્રોફાઇલ જુઓ',
    actionLogOutcome: 'પશુચિકિત્સકનું પરિણામ નોંધો',
    actionRestoreData: 'ડેમો ડેટા રીસેટ કરો',
    actionRetry: 'સિંક ફરી પ્રયાસ કરો',

    // Screening & Diagnostics
    sccLabel: 'સોમેટિક સેલ કાઉન્ટ (SCC)',
    ecLabel: 'દૂધની વિદ્યુત વાહકતા (EC)',
    tempLabel: 'દૂધનું તાપમાન',
    penLabel: 'વાડો',
    quarterLabel: 'આંચળના ચાર ભાગ',
    ruminationLabel: 'વાગોળવું',
    immediateActionRequired: 'તાત્કાલિક ધ્યાન જરૂરી',
    highRiskDetected: 'મસ્ટાઇટિસનું ઉચ્ચ જોખમ',
    watchListWarning: 'નિરીક્ષણ હેઠળ',
    normalStatus: 'સામાન્ય મર્યાદામાં',

    // Search & Filters
    searchPlaceholder: 'ગાયના ટેગ નંબર (જેમ કે 0101) અથવા નામથી શોધો...',
    allFilter: 'બધા',
    filterByRisk: 'જોખમ મુજબ',

    // Barn Environment
    fans: 'પંખા',
    misting: 'પાણીનો છંટકાવ',
    active: 'ચાલુ',
    standby: 'સ્ટેન્ડબાય',

    // Trends & Map
    trendTabHeatmap: 'તબેલાનો જોખમ નકશો',
    trendTabOverview: '14-દિવસનો આરોગ્ય ટ્રેન્ડ',
    trendTabQuarters: 'આંચળના ભાગોનું વિશ્લેષણ',
    trendTabEconomics: 'આંચળનું આરોગ્ય અને દૂધનું નુકસાન',
    mapModeContagion: 'જોખમની સમીક્ષા',
    mapModeMilkingOrder: 'દોહનનો ક્રમ',
    mapModeEnvironmental: 'સ્વચ્છતા અને પથારી',
    hotspotAlert: 'વધુ જોખમવાળો વિસ્તાર',
    containmentProtocol: 'નિયંત્રણના ઉપાયો',
    milkLossLabel: 'અંદાજિત દૂધનું નુકસાન',
    bacteriologyLabel: 'રોગજનક / કલ્ચર પરિણામ',
    parlorLinerRisk: 'દોહન સાધનો દ્વારા ચેપ ફેલાવવાનું જોખમ',
    beddingRisk: 'ભીની પથારીથી પર્યાવરણીય ચેપનું જોખમ',
    selectZonePrompt:
      'તે વિસ્તારની ગાયો, તપાસની સ્થિતિ અને સૂચવાયેલા નિયંત્રણ ઉપાયો જોવા માટે કોઈપણ વાડો અથવા દોહન વિસ્તાર પસંદ કરો.',
  },

  // ============================================================
  // MARATHI
  // ============================================================
  mr: {
    // Nav & System
    appTitle: 'बोवाइनगार्ड (Bovine Guard)',
    appSubtitle: 'स्तनदाहाची लवकर चेतावणी आणि कळपाचे आरोग्य',
    tagline: 'आज कोणत्या गायींकडे लक्ष द्यायचे ते जाणून घ्या.',
    tabDashboard: 'आढावा',
    tabActions: 'आजची कामे',
    tabAnimals: 'गायी',
    tabScreenings: 'तपासणी नोंद',
    tabTrends: 'आरोग्याचा कल',
    tabAlerts: 'सूचना',
    tabEnvironment: 'गोठ्याचे वातावरण',
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन डेटा',
    syncNow: 'सिंक करा',
    scanRfid: 'RFID स्कॅन करा',
    language: 'भाषा',

    // Summary Cards
    totalCows: 'एकूण गायी',
    testedToday: 'आज तपासलेल्या गायी',
    needAction: 'लक्ष देणे आवश्यक',
    heatStress: 'उष्णतेचा ताण (THI)',
    allClear: 'तातडीची चिंता नाही',
    allClearDesc:
      'सध्या कोणत्याही गायीला स्तनदाहासाठी तातडीच्या हस्तक्षेपाची गरज नाही. सध्याचे तपासणी संकेतक निर्धारित निरीक्षण मर्यादेत आहेत.',

    // Risk levels
    riskCritical: 'अतिगंभीर धोका',
    riskHigh: 'उच्च धोका',
    riskWatch: 'निरीक्षणाखाली',
    riskLow: 'सामान्य',

    // Actions
    actionSeparateVet: 'वेगळी करा आणि पशुवैद्यकांशी संपर्क साधा',
    actionScreenQuarters: 'कासेच्या चारही भागांची तपासणी करा',
    actionRepeatTest: 'पुढील दूध काढताना पुन्हा तपासा',
    actionNormalMilking: 'नेहमीप्रमाणे दूध काढणे सुरू ठेवा',
    actionDone: 'निराकरण झाले असे चिन्हांकित करा',
    actionViewProfile: 'गायीची प्रोफाइल पहा',
    actionLogOutcome: 'पशुवैद्यकीय निष्कर्ष नोंदवा',
    actionRestoreData: 'डेमो डेटा रीसेट करा',
    actionRetry: 'सिंक पुन्हा करा',

    // Screening & Diagnostics
    sccLabel: 'सोमॅटिक सेल काउंट (SCC)',
    ecLabel: 'दुधाची विद्युत चालकता (EC)',
    tempLabel: 'दुधाचे तापमान',
    penLabel: 'गोठा विभाग',
    quarterLabel: 'कासेचे चार भाग',
    ruminationLabel: 'रवंथ',
    immediateActionRequired: 'तातडीने लक्ष देणे आवश्यक',
    highRiskDetected: 'स्तनदाहाचा उच्च धोका',
    watchListWarning: 'निरीक्षणाखाली',
    normalStatus: 'सामान्य मर्यादेत',

    // Search & Filters
    searchPlaceholder: 'गायीचा टॅग क्रमांक (उदा. 0101) किंवा नावाने शोधा...',
    allFilter: 'सर्व',
    filterByRisk: 'धोक्यानुसार',

    // Barn Environment
    fans: 'पंखे',
    misting: 'पाण्याचा फवारा',
    active: 'चालू',
    standby: 'स्टँडबाय',

    // Trends & Map
    trendTabHeatmap: 'गोठ्याचा धोका नकाशा',
    trendTabOverview: '14 दिवसांचा आरोग्याचा कल',
    trendTabQuarters: 'कासेच्या भागांचे विश्लेषण',
    trendTabEconomics: 'कासेचे आरोग्य आणि दुधाचे नुकसान',
    mapModeContagion: 'धोक्याचा आढावा',
    mapModeMilkingOrder: 'दूध काढण्याचा क्रम',
    mapModeEnvironmental: 'स्वच्छता आणि बिछाना',
    hotspotAlert: 'उच्च धोका असलेला भाग',
    containmentProtocol: 'नियंत्रण उपाय',
    milkLossLabel: 'अंदाजे दुधाचे नुकसान',
    bacteriologyLabel: 'रोगजंतू / कल्चर निकाल',
    parlorLinerRisk: 'दूध काढण्याच्या उपकरणातून संसर्ग पसरण्याचा धोका',
    beddingRisk: 'ओल्या बिछान्यामुळे पर्यावरणीय संसर्गाचा धोका',
    selectZonePrompt:
      'त्या भागातील गायी, तपासणीची स्थिती आणि सुचवलेले नियंत्रण उपाय पाहण्यासाठी कोणताही गोठा विभाग किंवा दूध काढण्याचा भाग निवडा.',
  },

  // ============================================================
  // TELUGU
  // ============================================================
  te: {
    // Nav & System
    appTitle: 'బోవైన్‌గార్డ్ (Bovine Guard)',
    appSubtitle: 'మస్టైటిస్ ముందస్తు హెచ్చరిక మరియు పశువుల ఆరోగ్యం',
    tagline: 'ఈరోజు ఏ ఆవుపై శ్రద్ధ అవసరమో తెలుసుకోండి.',
    tabDashboard: 'సారాంశం',
    tabActions: 'నేటి పనులు',
    tabAnimals: 'ఆవులు',
    tabScreenings: 'పరీక్షల రికార్డు',
    tabTrends: 'ఆరోగ్య ట్రెండ్',
    tabAlerts: 'హెచ్చరికలు',
    tabEnvironment: 'పాక వాతావరణం',
    online: 'ఆన్‌లైన్',
    offline: 'ఆఫ్‌లైన్ డేటా',
    syncNow: 'సింక్ చేయండి',
    scanRfid: 'RFID స్కాన్ చేయండి',
    language: 'భాష',

    // Summary Cards
    totalCows: 'మొత్తం ఆవులు',
    testedToday: 'ఈరోజు పరీక్షించిన ఆవులు',
    needAction: 'శ్రద్ధ అవసరం',
    heatStress: 'వేడి ఒత్తిడి (THI)',
    allClear: 'తక్షణ ఆందోళన లేదు',
    allClearDesc:
      'ప్రస్తుతం ఏ ఆవుకూ మస్టైటిస్‌కు సంబంధించిన తక్షణ చర్య అవసరం లేదు. ప్రస్తుత పరీక్ష సూచికలు నిర్ణయించిన పర్యవేక్షణ పరిమితిలో ఉన్నాయి.',

    // Risk levels
    riskCritical: 'అత్యధిక ప్రమాదం',
    riskHigh: 'అధిక ప్రమాదం',
    riskWatch: 'పరిశీలనలో',
    riskLow: 'సాధారణం',

    // Actions
    actionSeparateVet: 'వేరు చేసి పశువైద్యుడిని సంప్రదించండి',
    actionScreenQuarters: 'పొదుగు నాలుగు భాగాలను తనిఖీ చేయండి',
    actionRepeatTest: 'తదుపరి పాలు పితికే సమయంలో మళ్లీ పరీక్షించండి',
    actionNormalMilking: 'సాధారణంగా పాలు పితకడం కొనసాగించండి',
    actionDone: 'పరిష్కరించినట్లు గుర్తించండి',
    actionViewProfile: 'ఆవు ప్రొఫైల్ చూడండి',
    actionLogOutcome: 'పశువైద్య ఫలితాన్ని నమోదు చేయండి',
    actionRestoreData: 'డెమో డేటాను రీసెట్ చేయండి',
    actionRetry: 'సింక్ మళ్లీ ప్రయత్నించండి',

    // Screening & Diagnostics
    sccLabel: 'సోమాటిక్ సెల్ కౌంట్ (SCC)',
    ecLabel: 'పాల విద్యుత్ వాహకత (EC)',
    tempLabel: 'పాల ఉష్ణోగ్రత',
    penLabel: 'కొట్టం',
    quarterLabel: 'పొదుగు నాలుగు భాగాలు',
    ruminationLabel: 'నెమరు వేయడం',
    immediateActionRequired: 'తక్షణ శ్రద్ధ అవసరం',
    highRiskDetected: 'మస్టైటిస్ అధిక ప్రమాదం',
    watchListWarning: 'పరిశీలనలో',
    normalStatus: 'సాధారణ పరిమితిలో',

    // Search & Filters
    searchPlaceholder: 'ఆవు ట్యాగ్ నంబర్ (ఉదా. 0101) లేదా పేరుతో వెతకండి...',
    allFilter: 'అన్నీ',
    filterByRisk: 'ప్రమాదం ప్రకారం',

    // Barn Environment
    fans: 'ఫ్యాన్లు',
    misting: 'నీటి తుంపరలు',
    active: 'ఆన్',
    standby: 'స్టాండ్‌బై',

    // Trends & Map
    trendTabHeatmap: 'పాక ప్రమాద మ్యాప్',
    trendTabOverview: '14-రోజుల ఆరోగ్య ట్రెండ్',
    trendTabQuarters: 'పొదుగు భాగాల విశ్లేషణ',
    trendTabEconomics: 'పొదుగు ఆరోగ్యం మరియు పాల నష్టం',
    mapModeContagion: 'ప్రమాద సమీక్ష',
    mapModeMilkingOrder: 'పాలు పితికే క్రమం',
    mapModeEnvironmental: 'పరిశుభ్రత మరియు పరుపు',
    hotspotAlert: 'అధిక ప్రమాద ప్రాంతం',
    containmentProtocol: 'నియంత్రణ చర్యలు',
    milkLossLabel: 'అంచనా పాల నష్టం',
    bacteriologyLabel: 'రోగకారకం / కల్చర్ ఫలితం',
    parlorLinerRisk: 'పాలు పితికే పరికరాల ద్వారా సంక్రమణ వ్యాప్తి ప్రమాదం',
    beddingRisk: 'తడి పరుపు వల్ల పర్యావరణ సంక్రమణ ప్రమాదం',
    selectZonePrompt:
      'ఆ ప్రాంతంలోని ఆవులు, పరీక్ష స్థితి మరియు సూచించిన నియంత్రణ చర్యలను చూడటానికి ఏదైనా కొట్టం లేదా పాలు పితికే ప్రాంతాన్ని ఎంచుకోండి.',
  },

  // ============================================================
  // TAMIL
  // ============================================================
  ta: {
    // Nav & System
    appTitle: 'போவைன்கார்ட் (Bovine Guard)',
    appSubtitle: 'மடிநோய் முன்கூட்டிய எச்சரிக்கை மற்றும் மாடுகளின் ஆரோக்கியம்',
    tagline: 'இன்று எந்த மாட்டிற்கு கவனம் தேவை என்பதை அறியுங்கள்.',
    tabDashboard: 'சுருக்கம்',
    tabActions: 'இன்றைய பணிகள்',
    tabAnimals: 'மாடுகள்',
    tabScreenings: 'பரிசோதனை பதிவு',
    tabTrends: 'ஆரோக்கியப் போக்கு',
    tabAlerts: 'எச்சரிக்கைகள்',
    tabEnvironment: 'கொட்டகை சூழல்',
    online: 'ஆன்லைன்',
    offline: 'ஆஃப்லைன் தரவு',
    syncNow: 'ஒத்திசைக்க',
    scanRfid: 'RFID ஸ்கேன் செய்யவும்',
    language: 'மொழி',

    // Summary Cards
    totalCows: 'மொத்த மாடுகள்',
    testedToday: 'இன்று பரிசோதிக்கப்பட்ட மாடுகள்',
    needAction: 'கவனம் தேவை',
    heatStress: 'வெப்ப அழுத்தம் (THI)',
    allClear: 'உடனடி கவலை இல்லை',
    allClearDesc:
      'தற்போது எந்த மாட்டிற்கும் மடிநோய் தொடர்பான உடனடி நடவடிக்கை தேவையில்லை. தற்போதைய பரிசோதனை குறியீடுகள் நிர்ணயிக்கப்பட்ட கண்காணிப்பு வரம்பிற்குள் உள்ளன.',

    // Risk levels
    riskCritical: 'மிக அதிக ஆபத்து',
    riskHigh: 'அதிக ஆபத்து',
    riskWatch: 'கண்காணிப்பில்',
    riskLow: 'இயல்பு',

    // Actions
    actionSeparateVet: 'தனியாகப் பிரித்து கால்நடை மருத்துவரைத் தொடர்பு கொள்ளவும்',
    actionScreenQuarters: 'மடியின் நான்கு பகுதிகளையும் பரிசோதிக்கவும்',
    actionRepeatTest: 'அடுத்த கறவையில் மீண்டும் பரிசோதிக்கவும்',
    actionNormalMilking: 'வழக்கமான கறவையைத் தொடரவும்',
    actionDone: 'தீர்வு செய்யப்பட்டதாகக் குறிக்கவும்',
    actionViewProfile: 'மாட்டின் சுயவிவரத்தைப் பார்க்கவும்',
    actionLogOutcome: 'கால்நடை மருத்துவரின் முடிவைப் பதிவு செய்யவும்',
    actionRestoreData: 'டெமோ தரவை மீட்டமைக்கவும்',
    actionRetry: 'ஒத்திசைவை மீண்டும் முயற்சிக்கவும்',

    // Screening & Diagnostics
    sccLabel: 'சோமாடிக் செல் எண்ணிக்கை (SCC)',
    ecLabel: 'பாலின் மின் கடத்துத்திறன் (EC)',
    tempLabel: 'பால் வெப்பநிலை',
    penLabel: 'கொட்டகைப் பகுதி',
    quarterLabel: 'மடியின் நான்கு பகுதிகள்',
    ruminationLabel: 'அசைபோடுதல்',
    immediateActionRequired: 'உடனடி கவனம் தேவை',
    highRiskDetected: 'மடிநோய் அதிக ஆபத்து',
    watchListWarning: 'கண்காணிப்பில்',
    normalStatus: 'இயல்பான வரம்பில்',

    // Search & Filters
    searchPlaceholder: 'மாட்டின் டேக் எண் (எ.கா. 0101) அல்லது பெயரால் தேடவும்...',
    allFilter: 'அனைத்தும்',
    filterByRisk: 'ஆபத்து அடிப்படையில்',

    // Barn Environment
    fans: 'மின்விசிறிகள்',
    misting: 'நீர் தெளிப்பு',
    active: 'இயங்குகிறது',
    standby: 'காத்திருப்பு',

    // Trends & Map
    trendTabHeatmap: 'கொட்டகை ஆபத்து வரைபடம்',
    trendTabOverview: '14 நாள் ஆரோக்கியப் போக்கு',
    trendTabQuarters: 'மடியின் பகுதிகள் பகுப்பாய்வு',
    trendTabEconomics: 'மடி ஆரோக்கியம் மற்றும் பால் இழப்பு',
    mapModeContagion: 'ஆபத்து நிலவரம்',
    mapModeMilkingOrder: 'கறவை வரிசை',
    mapModeEnvironmental: 'சுகாதாரம் மற்றும் படுக்கை',
    hotspotAlert: 'அதிக ஆபத்துள்ள பகுதி',
    containmentProtocol: 'கட்டுப்பாட்டு நடவடிக்கைகள்',
    milkLossLabel: 'மதிப்பிடப்பட்ட பால் இழப்பு',
    bacteriologyLabel: 'நோய்க்கிருமி / கல்ச்சர் முடிவு',
    parlorLinerRisk: 'கறவை உபகரணங்கள் மூலம் தொற்று பரவும் ஆபத்து',
    beddingRisk: 'ஈரமான படுக்கையால் சுற்றுச்சூழல் தொற்று ஏற்படும் ஆபத்து',
    selectZonePrompt:
      'அந்தப் பகுதியில் உள்ள மாடுகள், பரிசோதனை நிலை மற்றும் பரிந்துரைக்கப்பட்ட கட்டுப்பாட்டு நடவடிக்கைகளைப் பார்க்க, ஏதேனும் ஒரு கொட்டகைப் பகுதி அல்லது கறவைப் பகுதியைத் தேர்ந்தெடுக்கவும்.',
  },
}

export function getTranslation(key: string, lang: SupportedLanguage = 'en'): string {
  const langDict = translations[lang] || translations.en

  return langDict[key] || translations.en[key] || key
}

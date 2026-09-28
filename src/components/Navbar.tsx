import React, { useState } from 'react'

import { useHerd } from '../context/HerdContext'
import { SUPPORTED_LANGUAGES } from '../i18n/translations'
import { SupportedLanguage, TabType } from '../types'
import {
  Activity,
  Calendar,
  CheckSquare,
  ChevronDown,
  Globe,
  History,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react'

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    animals,
    openAppointmentModal,
    language,
    setLanguage,
    t,
  } = useHerd()

  const [isLangOpen, setIsLangOpen] = useState<boolean>(false)

  // Flagged cows needing action
  const attentionCount = animals.filter(
    (a) =>
      a.currentRisk === 'suspected' ||
      a.currentRisk === 'watch' ||
      a.currentRisk === 'critical' ||
      a.currentRisk === 'high' ||
      a.ec > 6.0,
  ).length

  const currentLangInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0]

  const navItems: {
    id: TabType
    labelKey: string
    icon: React.ReactNode
    badge?: number
    badgeColor?: string
  }[] = [
    {
      id: 'dashboard',
      labelKey: 'tabDashboard',
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: 'actions',
      labelKey: 'tabActions',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: attentionCount > 0 ? attentionCount : undefined,
      badgeColor: 'bg-red-600 text-white',
    },
    {
      id: 'animals',
      labelKey: 'tabAnimals',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'screenings',
      labelKey: 'tabScreenings',
      icon: <History className="w-4 h-4" />,
    },
  ]

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-black/[0.06] sticky top-0 z-40 transition-all">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          {/* Brand & Farm Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#1D1D1F] text-white flex items-center justify-center font-bold shadow-xs shrink-0 tracking-tight">
              <span className="text-sm sm:text-base font-semibold">GS</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-base sm:text-lg tracking-tight leading-none">
                  {t('appTitle')}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/[0.04] text-slate-700 border border-black/[0.06]">
                  Dairy Health
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-none mt-1 hidden xs:block">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Controls: Google Calendar quick link + Language Selector */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Doctor Appointment Button */}
            <button
              type="button"
              onClick={() => {
                const cow24 = animals.find((a) => a.tag === '024') || animals[0]
                if (cow24) openAppointmentModal(cow24)
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1D1D1F] hover:bg-black text-white text-xs font-medium transition-all shadow-sm active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>{t('bookVet')}</span>
            </button>

            {/* Indian & Multi-Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black/[0.04] hover:bg-black/[0.07] text-slate-800 transition-colors"
                title="Change Language / भाषा बदलें"
              >
                <span>{currentLangInfo.flag}</span>
                <span className="hidden sm:inline">{currentLangInfo.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-black/[0.08] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3.5 py-1 text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                      {t('selectLanguage')}
                    </div>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code)
                          setIsLangOpen(false)
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                          language === lang.code
                            ? 'bg-black/[0.05] text-slate-900 font-semibold'
                            : 'text-slate-600 hover:bg-black/[0.03] font-normal'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.nativeName}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">
                          {lang.code}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Row: Apple Segmented Pill Design */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2.5 pt-0.5 overflow-x-auto no-scrollbar">
        <nav className="inline-flex items-center p-1 bg-black/[0.04] rounded-xl gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)] font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {item.icon}
                <span>{t(item.labelKey)}</span>
                {item.badge !== undefined && (
                  <span
                    className={`inline-flex items-center justify-center min-w-4 h-4 px-1.5 text-[10px] rounded-full font-semibold leading-none ${
                      isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

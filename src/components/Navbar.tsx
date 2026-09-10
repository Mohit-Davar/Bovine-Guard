import React, { useState } from 'react';
import { useHerd } from '../context/HerdContext';
import { TabType, SupportedLanguage } from '../types';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { 
  Activity, 
  AlertTriangle, 
  CheckSquare, 
  Users, 
  History, 
  TrendingUp, 
  CloudSun, 
  Languages,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    animals, 
    alerts, 
    language,
    setLanguage,
    t
  } = useHerd();

  const [isLangOpen, setIsLangOpen] = useState<boolean>(false);

  const highRiskCount = animals.filter(a => a.currentRisk === 'critical' || a.currentRisk === 'high').length;
  const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;

  const currentLangInfo = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  const navItems: { id: TabType; labelKey: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      labelKey: 'tabDashboard',
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: 'actions',
      labelKey: 'tabActions',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: highRiskCount > 0 ? highRiskCount : undefined,
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
    {
      id: 'trends',
      labelKey: 'tabTrends',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'alerts',
      labelKey: 'tabAlerts',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      id: 'environment',
      labelKey: 'tabEnvironment',
      icon: <CloudSun className="w-4 h-4" />,
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Brand & Farm Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
              <span className="text-base sm:text-lg font-black tracking-tight">HH</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 text-sm sm:text-base tracking-tight leading-none">
                  {t('appTitle')}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-none mt-1 hidden xs:block">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Controls: Language Selector + Hub Status + Sync Button */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Indian & Multi-Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                title="Change Language / भाषा बदलें"
              >
                <span>{currentLangInfo.flag}</span>
                <span className="font-semibold hidden sm:inline">{currentLangInfo.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLangOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsLangOpen(false)} 
                  />
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Select Language
                    </div>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                          language === lang.code
                            ? 'bg-blue-50 text-blue-800 font-black'
                            : 'text-slate-700 hover:bg-slate-50 font-medium'
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

      {/* Navigation Tabs Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 border-t border-slate-100 overflow-x-auto no-scrollbar">
        <nav className="flex space-x-1 py-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{t(item.labelKey)}</span>
                {item.badge !== undefined && (
                  <span className={`inline-flex items-center justify-center min-w-4.5 h-4 px-1.5 text-[10px] rounded-full font-bold leading-none ${item.badgeColor || 'bg-slate-200 text-slate-800'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

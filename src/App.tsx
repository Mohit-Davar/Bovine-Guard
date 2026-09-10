import React from 'react'

import { AnimalList } from './components/AnimalList'
import { AnimalProfileModal } from './components/AnimalProfileModal'
import { Chatbot } from './components/Chatbot'
import { DashboardOverview } from './components/DashboardOverview'
import { Navbar } from './components/Navbar'
import { ScreeningHistory } from './components/ScreeningHistory'
import { ToastContainer } from './components/ToastContainer'
import { TodaysActions } from './components/TodaysActions'
import { VeterinaryOutcomeModal } from './components/VeterinaryOutcomeModal'
import { HerdProvider, useHerd } from './context/HerdContext'
import { AnimatePresence, motion } from 'framer-motion'
import { WifiOff } from 'lucide-react'

const DashboardContent: React.FC = () => {
  const { activeTab, syncStatus, setSyncModalOpen, hmiMode, t } = useHerd()

  return (
    <div
      className={`min-h-screen bg-slate-100/90 flex flex-col ${hmiMode ? 'hmi-touch-optimized' : ''}`}
    >
      {/* Offline Warning Banner (Shown only when offline buffer mode is active) */}
      {!syncStatus.isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between border-b-2 border-amber-600">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>
              Offline mode: Records are saved locally and will sync when internet is restored (
              {syncStatus.pendingRecordsCount} queued).
            </span>
            <button
              onClick={() => setSyncModalOpen(true)}
              className="ml-auto underline hover:text-slate-900 shrink-0 font-bold"
            >
              View Details &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {activeTab === 'dashboard' && <DashboardOverview />}
            {activeTab === 'actions' && <TodaysActions />}
            {activeTab === 'animals' && <AnimalList />}
            {activeTab === 'screenings' && <ScreeningHistory />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Professional Footer */}
      <footer className="mt-8 border-t border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Bovine Guard</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">Herd Health Monitoring System</span>
          </div>
        </div>
      </footer>

      {/* Global Modals & Overlays */}
      <AnimalProfileModal />
      <VeterinaryOutcomeModal />
      <ToastContainer />
      <Chatbot />
    </div>
  )
}

export default function App() {
  return (
    <HerdProvider>
      <DashboardContent />
    </HerdProvider>
  )
}

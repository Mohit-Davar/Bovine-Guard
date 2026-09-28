import React from 'react'

import { AnimalList } from './components/AnimalList'
import { AnimalProfileModal } from './components/AnimalProfileModal'
import { Chatbot } from './components/Chatbot'
import { DashboardOverview } from './components/DashboardOverview'
import { Navbar } from './components/Navbar'
import { ScreeningHistory } from './components/ScreeningHistory'
import { ToastContainer } from './components/ToastContainer'
import { TodaysActions } from './components/TodaysActions'
import { VetAppointmentModal } from './components/VetAppointmentModal'
import { HerdProvider, useHerd } from './context/HerdContext'
import { AnimatePresence, motion } from 'framer-motion'
import { WifiOff } from 'lucide-react'

const DashboardContent: React.FC = () => {
  const {
    activeTab,
    syncStatus,
    setSyncModalOpen,
    appointmentCow,
    closeAppointmentModal,
    touchMode,
  } = useHerd()

  return (
    <div
      className={`min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col ${touchMode ? 'touch-optimized' : ''}`}
    >
      {/* Offline Warning Banner (Only when offline buffer mode is active) */}
      {!syncStatus.isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between border-b-2 border-amber-600">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>
              Offline mode: Records are saved locally and will sync when internet is restored (
              {syncStatus.pendingRecordsCount} queued).
            </span>
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

      {/* Global Modals & Overlays */}
      <AnimalProfileModal />
      <VetAppointmentModal
        cow={appointmentCow}
        isOpen={Boolean(appointmentCow)}
        onClose={closeAppointmentModal}
      />
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

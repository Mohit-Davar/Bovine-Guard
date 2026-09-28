import React, { useState } from 'react'

import { useHerd } from '../context/HerdContext'
import { Animal } from '../types'
import { EmptyState } from './ui/EmptyState'
import { ErrorState } from './ui/ErrorState'
import { LoadingState } from './ui/LoadingState'
import {
  Calendar,
  ChevronRight,
  Eye,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
} from 'lucide-react'

export const AnimalList: React.FC = () => {
  const {
    animals,
    tabLoading,
    tabError,
    isRetryingTab,
    retryTab,
    openAnimalProfile,
    openAppointmentModal,
    resetToSampleData,
    t,
  } = useHerd()

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedPen, setSelectedPen] = useState<string>('all')
  const [selectedBreed, setSelectedBreed] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  const isLoading = tabLoading.animals
  const error = tabError.animals
  const isRetrying = isRetryingTab.animals

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState
          title={t('tabAnimals')}
          message={t('thinking')}
          variant="table"
          rows={6}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorState
          title={t('tabAnimals')}
          message={error}
          onRetry={() => retryTab('animals')}
          retryLabel={t('reset')}
          isRetrying={isRetrying}
          secondaryAction={{
            label: t('reset'),
            onClick: resetToSampleData,
          }}
        />
      </div>
    )
  }

  // Normalize statuses to: Healthy, At Risk, Suspicious
  const getStatus = (cow: Animal): 'Healthy' | 'At Risk' | 'Suspicious' => {
    if (cow.currentRisk === 'suspected' || cow.currentRisk === 'critical' || cow.riskScore >= 70) {
      return 'Suspicious'
    }
    if (cow.currentRisk === 'watch' || cow.currentRisk === 'high' || cow.ec > 5.8) {
      return 'At Risk'
    }
    return 'Healthy'
  }

  const pens = ['all', 'Pen 1', 'Pen 2', 'Pen 3', 'Pen 4']
  const breeds = ['all', 'Gir', 'Sahiwal', 'HF Cross', 'Tharparkar', 'Rathi', 'Jersey Cross']

  const filteredAnimals = animals.filter((cow) => {
    const status = getStatus(cow)
    const matchesSearch =
      (cow.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cow.tag || '').includes(searchTerm) ||
      (cow.breed || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPen = selectedPen === 'all' || cow.assignedPen === selectedPen
    const matchesBreed = selectedBreed === 'all' || cow.breed === selectedBreed
    const matchesStatus = selectedStatus === 'all' || status === selectedStatus

    return matchesSearch && matchesPen && matchesBreed && matchesStatus
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Search and Filters Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              {t('tabAnimals')}
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-1">
              {t('animalCountLabel', { shown: filteredAnimals.length, total: animals.length })}
            </p>
          </div>

          {/* Apple Segmented View toggle */}
          <div className="inline-flex items-center p-1 bg-black/[0.04] rounded-2xl gap-1 w-fit">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)] font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{t('cards')}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)] font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{t('table')}</span>
            </button>
          </div>
        </div>

        {/* Search Input & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Search cows */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded-full border border-black/[0.08] pl-9 pr-3.5 py-2.5 bg-black/[0.02] focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Pen Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedPen}
              onChange={(e) => setSelectedPen(e.target.value)}
              className="w-full text-xs rounded-full border border-black/[0.08] py-2.5 px-3.5 bg-black/[0.02] focus:bg-white focus:outline-hidden font-normal text-slate-800"
            >
              <option value="all">{t('allPens')}</option>
              <option value="Pen 1">Pen 1</option>
              <option value="Pen 2">Pen 2</option>
              <option value="Pen 3">Pen 3</option>
              <option value="Pen 4">Pen 4</option>
            </select>
          </div>

          {/* Breed Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedBreed}
              onChange={(e) => setSelectedBreed(e.target.value)}
              className="w-full text-xs rounded-full border border-black/[0.08] py-2.5 px-3.5 bg-black/[0.02] focus:bg-white focus:outline-hidden font-normal text-slate-800"
            >
              <option value="all">{t('allBreeds')}</option>
              {breeds
                .filter((b) => b !== 'all')
                .map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs rounded-full border border-black/[0.08] py-2.5 px-3.5 bg-black/[0.02] focus:bg-white focus:outline-hidden font-normal text-slate-800"
            >
              <option value="all">{t('allStatuses')}</option>
              <option value="Healthy">{t('statusHealthy')}</option>
              <option value="At Risk">{t('statusAtRisk')}</option>
              <option value="Suspicious">{t('statusSuspicious')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty Filter State */}
      {filteredAnimals.length === 0 ? (
        <EmptyState
          icon="search"
          title={t('allStock')}
          description={t('searchPlaceholder')}
          primaryAction={{
            label: t('reset'),
            onClick: () => {
              setSearchTerm('')
              setSelectedPen('all')
              setSelectedBreed('all')
              setSelectedStatus('all')
            },
          }}
        />
      ) : viewMode === 'cards' ? (
        /* ================= CARDS VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredAnimals.map((cow) => {
            const rawStatus = getStatus(cow)
            const statusLabel =
              rawStatus === 'Suspicious'
                ? t('statusSuspicious')
                : rawStatus === 'At Risk'
                  ? t('statusAtRisk')
                  : t('statusHealthy')
            const hasWearable = Boolean(cow.wearable)

            return (
              <div
                key={cow.id}
                onClick={() => openAnimalProfile(cow.id)}
                className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:border-black/[0.12] transition-all duration-200 ${rawStatus === 'Suspicious'
                    ? 'border-rose-200/90'
                    : rawStatus === 'At Risk'
                      ? 'border-amber-200/90'
                      : 'border-black/[0.06]'
                  }`}
              >
                <div>
                  {/* Basic Information */}
                  <div className="flex items-start justify-between pb-3.5 border-b border-black/[0.04]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-slate-900 tracking-tight">
                          {cow.name || `${t('cowLabel')} ${cow.tag}`}
                        </span>
                        <span className="text-xs font-normal text-slate-500">
                          {cow.assignedPen || 'Pen 1'}
                        </span>
                      </div>
                      <div className="text-xs font-normal text-slate-500 mt-1">
                        {cow.breed} · {cow.ageYears} yrs · #{cow.parity}
                      </div>
                    </div>

                    <span
                      className={`text-xs font-medium flex items-center gap-1.5 ${rawStatus === 'Suspicious'
                          ? 'text-rose-600'
                          : rawStatus === 'At Risk'
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${rawStatus === 'Suspicious'
                            ? 'bg-rose-500'
                            : rawStatus === 'At Risk'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                      />
                      <span>{statusLabel}</span>
                    </span>
                  </div>

                  {/* Two Parameter Sections */}
                  <div className="grid grid-cols-2 gap-3 my-4">
                    {/* Milk Parameters */}
                    <div className="p-3.5 rounded-2xl bg-[#FBFBFD] border border-black/[0.04] text-xs">
                      <div className="text-xs font-medium text-slate-800 mb-2">
                        {t('milkChecks')}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">{t('ecLabel')}:</span>
                          <span
                            className={`font-semibold ${cow.ec >= 7.0 ? 'text-rose-600' : 'text-slate-800'}`}
                          >
                            {cow.ec}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">{t('phLabel')}:</span>
                          <span className="font-normal text-slate-800">{cow.ph}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">{t('tempLabel')}:</span>
                          <span className="font-normal text-slate-800">{cow.milkTemp}°C</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">{t('yieldLabel')}:</span>
                          <span className="font-normal text-slate-800">
                            {cow.dailyMilkYieldKg} L
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Physical Parameters */}
                    <div className="p-3.5 rounded-2xl bg-[#FBFBFD] border border-black/[0.04] text-xs flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-medium text-slate-800 mb-2">
                          {t('physicalChecks')}
                        </div>
                        {hasWearable ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">{t('activityLabel')}:</span>
                              <span className="font-normal text-slate-800">
                                {rawStatus === 'Suspicious' ? t('low') : t('normalValue')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">{t('movementLabel')}:</span>
                              <span className="font-normal text-slate-800">
                                {rawStatus === 'Suspicious' ? t('reduced') : t('normalValue')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">{t('lyingLabel')}:</span>
                              <span className="font-normal text-slate-800">
                                {rawStatus === 'Suspicious' ? t('elevated') : t('normalValue')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">{t('standingLabel')}:</span>
                              <span className="font-normal text-slate-800">{t('normalValue')}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-3 text-center text-slate-400 font-normal">
                            <span className="block text-xs text-slate-500">{t('wearableUtilisation')}</span>
                            <span className="text-[11px] text-amber-600 mt-0.5 block">{t('pendingStart')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 hover:text-black flex items-center gap-1 transition-colors">
                    <span>{t('viewProfile')}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      openAppointmentModal(cow)
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-slate-800 font-medium text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Calendar className="w-3 h-3 text-blue-500" />
                    <span>{t('doctor')}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ================= TABLE VIEW ================= */
        <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FBFBFD] border-b border-black/[0.04] text-slate-500 font-normal">
                <tr>
                  <th className="py-3.5 px-5 font-medium">{t('tabAnimals')}</th>
                  <th className="py-3.5 px-4 font-medium">{t('penLabel')}</th>
                  <th className="py-3.5 px-4 font-medium">{t('breedLabel')}</th>
                  <th className="py-3.5 px-4 font-medium">{t('statusHealthy')}</th>
                  <th className="py-3.5 px-4 font-medium">{t('ecLabel')}</th>
                  <th className="py-3.5 px-4 font-medium">{t('phLabel')}</th>
                  <th className="py-3.5 px-4 font-medium">{t('yieldLabel')}</th>
                  <th className="py-3.5 px-4 font-medium">{t('wearableUtilisation')}</th>
                  <th className="py-3.5 px-5 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {filteredAnimals.map((cow) => {
                  const rawStatus = getStatus(cow)
                  const statusLabel =
                    rawStatus === 'Suspicious'
                      ? t('statusSuspicious')
                      : rawStatus === 'At Risk'
                        ? t('statusAtRisk')
                        : t('statusHealthy')

                  return (
                    <tr
                      key={cow.id}
                      onClick={() => openAnimalProfile(cow.id)}
                      className="hover:bg-[#FBFBFD] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-5 font-semibold text-slate-900">
                        {cow.name || `${t('cowLabel')} ${cow.tag}`}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{cow.assignedPen || 'Pen 1'}</td>
                      <td className="py-3 px-4 text-slate-600">{cow.breed}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-medium flex items-center gap-1.5 ${rawStatus === 'Suspicious'
                              ? 'text-rose-600'
                              : rawStatus === 'At Risk'
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${rawStatus === 'Suspicious'
                                ? 'bg-rose-500'
                                : rawStatus === 'At Risk'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                          />
                          <span>{statusLabel}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{cow.ec}</td>
                      <td className="py-3 px-4 text-slate-600">{cow.ph}</td>
                      <td className="py-3 px-4 text-slate-600">{cow.dailyMilkYieldKg} L</td>
                      <td className="py-3 px-4 text-slate-500">
                        {cow.wearable ? t('activeWearable') : t('pendingStart')}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

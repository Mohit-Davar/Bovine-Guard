import React, { useState } from 'react'

import { useHerd } from '../context/HerdContext'
import { OutcomeType } from '../types'
import { AlertTriangle, CheckCircle2, HelpCircle, ShieldAlert, Stethoscope, X } from 'lucide-react'

export const VeterinaryOutcomeModal: React.FC = () => {
  const { outcomeAnimalId, closeOutcomeModal, animals, recordOutcome } = useHerd()

  const [outcome, setOutcome] = useState<OutcomeType>('confirmed_mastitis')
  const [mastitisType, setMastitisType] = useState<'clinical' | 'subclinical'>('clinical')
  const [affectedQuarters, setAffectedQuarters] = useState<Array<'FL' | 'FR' | 'RL' | 'RR'>>(['RL'])
  const [milkWithholdDays, setMilkWithholdDays] = useState<number>(3)
  const [treatment, setTreatment] = useState<string>('Intramammary Cefa-Lak (Cephapirin Sodium)')
  const [notes, setNotes] = useState<string>('')
  const [vetName, setVetName] = useState<string>('Dr. Sarah Henderson, DVM')

  if (!outcomeAnimalId) return null

  const cow = animals.find((a) => a.id === outcomeAnimalId)
  if (!cow) return null

  const toggleQuarter = (q: 'FL' | 'FR' | 'RL' | 'RR') => {
    setAffectedQuarters((prev) =>
      prev.includes(q) ? prev.filter((item) => item !== q) : [...prev, q],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    recordOutcome({
      animalId: cow.id,
      animalTag: cow.tag,
      outcome,
      mastitisType: outcome === 'confirmed_mastitis' ? mastitisType : undefined,
      affectedQuarters: outcome === 'confirmed_mastitis' ? affectedQuarters : undefined,
      milkWithholdDays: outcome === 'confirmed_mastitis' ? milkWithholdDays : 0,
      treatmentAdministered: outcome === 'confirmed_mastitis' ? treatment : undefined,
      notes:
        notes ||
        (outcome === 'confirmed_mastitis'
          ? 'Clinical symptoms matched inline EC conductivity spike.'
          : 'Cow inspected and cleared.'),
      recordedBy: vetName,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Log Veterinary Clinical Outcome
              </h2>
              <p className="text-xs text-slate-500">
                Cow: <span className="font-bold text-slate-800">{cow.name}</span> ({cow.tag}) · Pen{' '}
                {cow.assignedPen}
              </p>
            </div>
          </div>

          <button
            onClick={closeOutcomeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Outcome Radio Options */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Clinical Assessment
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  id: 'confirmed_mastitis',
                  label: 'Confirmed Mastitis',
                  icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
                },
                {
                  id: 'not_mastitis',
                  label: 'Not Mastitis (Cleared)',
                  icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
                },
                {
                  id: 'other_disease',
                  label: 'Other Disease / Ketosis',
                  icon: <ShieldAlert className="w-4 h-4 text-amber-600" />,
                },
                {
                  id: 'inconclusive',
                  label: 'Inconclusive / Retest',
                  icon: <HelpCircle className="w-4 h-4 text-slate-600" />,
                },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setOutcome(opt.id as OutcomeType)}
                  className={`p-3 rounded-xl border-2 text-left flex items-center gap-2.5 transition-all text-xs font-bold ${
                    outcome === opt.id
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Mastitis Details */}
          {outcome === 'confirmed_mastitis' && (
            <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              {/* Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mastitis Classification
                </label>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mastitisType"
                      checked={mastitisType === 'clinical'}
                      onChange={() => setMastitisType('clinical')}
                      className="text-blue-600"
                    />
                    <span>Clinical (Visible clots / udder swelling)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mastitisType"
                      checked={mastitisType === 'subclinical'}
                      onChange={() => setMastitisType('subclinical')}
                      className="text-blue-600"
                    />
                    <span>Subclinical (High SCC / EC only)</span>
                  </label>
                </div>
              </div>

              {/* Affected Quarters Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Affected Quarters
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['FL', 'FR', 'RL', 'RR'] as const).map((q) => (
                    <button
                      type="button"
                      key={q}
                      onClick={() => toggleQuarter(q)}
                      className={`py-2 rounded-lg text-xs font-black border transition-all ${
                        affectedQuarters.includes(q)
                          ? 'bg-red-600 text-white border-red-700 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Milk Withholding Days */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Milk Withholding Requirement (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="14"
                  value={milkWithholdDays}
                  onChange={(e) => setMilkWithholdDays(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Treatment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Treatment / Pharmaceutical Administered
                </label>
                <input
                  type="text"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Veterinarian / Technician */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Examining Veterinarian / Technician
            </label>
            <input
              type="text"
              value={vetName}
              onChange={(e) => setVetName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Clinical Findings & Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. CMT score 3 in Front-Right quarter. Teat score normal. Antibiotic therapy initiated."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeOutcomeModal}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
            >
              Save Clinical Record
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'

import { useHerd } from '../context/HerdContext'
import {
  DEFAULT_VET_CONTACTS,
  VetAppointmentRequest,
  VetContact,
  WorkspaceUser,
  auth,
  createGoogleCalendarEvent,
  fetchGoogleContacts,
  getWorkspaceAccessToken,
  initWorkspaceAuth,
  sendGmailReminder,
  signInWithGoogleWorkspace,
  signOutGoogleWorkspace,
} from '../lib/googleWorkspace'
import { Animal } from '../types'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  Phone,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
  X,
} from 'lucide-react'

interface Props {
  cow: Animal | null
  isOpen: boolean
  onClose: () => void
}

export const VetAppointmentModal: React.FC<Props> = ({ cow, isOpen, onClose }) => {
  const { addToast } = useHerd()

  const [workspaceUser, setWorkspaceUser] = useState<WorkspaceUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false)

  // Contacts
  const [contacts, setContacts] = useState<VetContact[]>(DEFAULT_VET_CONTACTS)
  const [selectedContactId, setSelectedContactId] = useState<string>(DEFAULT_VET_CONTACTS[0].id)
  const [customDoctorName, setCustomDoctorName] = useState<string>('')
  const [customDoctorEmail, setCustomDoctorEmail] = useState<string>('')
  const [customDoctorPhone, setCustomDoctorPhone] = useState<string>('')

  // Appointment details
  const todayStr = new Date().toISOString().split('T')[0]
  const [appointmentDate, setAppointmentDate] = useState<string>(todayStr)
  const [appointmentTime, setAppointmentTime] = useState<string>('10:30')
  const [notes, setNotes] = useState<string>('')
  const [addToCalendar, setAddToCalendar] = useState<boolean>(true)
  const [sendEmail, setSendEmail] = useState<boolean>(true)

  // Confirmation step
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [scheduledLink, setScheduledLink] = useState<string | null>(null)

  // Init Workspace Auth listener
  useEffect(() => {
    const unsub = initWorkspaceAuth(
      (user, token) => {
        setWorkspaceUser({
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid,
        })
        setAccessToken(token)
        fetchGoogleContacts(token).then((data) => setContacts(data))
      },
      () => {
        setWorkspaceUser(null)
        setAccessToken(null)
      },
    )

    // Prepopulate notes if cow is selected
    if (cow) {
      const summary = `Cow ${cow.tag || cow.name} in ${cow.assignedPen || 'Pen 1'} (${cow.breed}) flagged with conductivity ${cow.ec} mS/cm. Temperature: ${cow.milkTemp}°C. ${
        cow.wearable ? `Wearable status: ${cow.wearable.activityStatus}, resting altered.` : ''
      }`
      setNotes(summary)
    }

    return () => unsub()
  }, [cow])

  if (!isOpen || !cow) return null

  const handleSignIn = async () => {
    setIsSigningIn(true)
    try {
      const res = await signInWithGoogleWorkspace()
      if (res) {
        setWorkspaceUser({
          displayName: res.user.displayName,
          email: res.user.email,
          photoURL: res.user.photoURL,
          uid: res.user.uid,
        })
        setAccessToken(res.accessToken)
        const contactList = await fetchGoogleContacts(res.accessToken)
        setContacts(contactList)
        addToast({
          title: 'Google Connected',
          message: `Signed in as ${res.user.email}. Google Calendar & Contacts ready.`,
          type: 'success',
        })
      }
    } catch (err: any) {
      addToast({
        title: 'Sign In Failed',
        message: err.message || 'Could not authenticate with Google.',
        type: 'alert',
      })
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSignOut = async () => {
    await signOutGoogleWorkspace()
    setWorkspaceUser(null)
    setAccessToken(null)
    addToast({
      title: 'Google Disconnected',
      message: 'Logged out of Google account.',
      type: 'info',
    })
  }

  const activeContact =
    selectedContactId === 'custom'
      ? {
          id: 'custom',
          name: customDoctorName || 'Doctor',
          email: customDoctorEmail,
          phone: customDoctorPhone,
          role: 'Custom Contact',
        }
      : contacts.find((c) => c.id === selectedContactId) || contacts[0]

  const handleOpenConfirmation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeContact.email && sendEmail) {
      addToast({
        title: 'Missing Doctor Email',
        message: 'Please provide the doctor email address to send the reminder.',
        type: 'warning',
      })
      return
    }
    setShowConfirmation(true)
  }

  const handleExecuteBooking = async () => {
    setIsSubmitting(true)
    const token = accessToken || getWorkspaceAccessToken()

    const appointmentPayload: VetAppointmentRequest = {
      cowId: cow.id,
      cowTag: cow.tag || cow.name,
      cowName: cow.name || `Cow ${cow.tag}`,
      breed: cow.breed,
      pen: cow.assignedPen || 'Pen 1',
      doctorName: activeContact.name,
      doctorEmail: activeContact.email || '',
      doctorPhone: activeContact.phone,
      date: appointmentDate,
      time: appointmentTime,
      notes,
      addToCalendar,
      sendEmailReminder: sendEmail,
    }

    try {
      let calResult = null
      let emailResult = null

      if (token && addToCalendar) {
        calResult = await createGoogleCalendarEvent(token, appointmentPayload)
        if (calResult.success && calResult.htmlLink) {
          setScheduledLink(calResult.htmlLink)
        }
      }

      if (token && sendEmail && workspaceUser?.email) {
        emailResult = await sendGmailReminder(token, appointmentPayload, workspaceUser.email)
      }

      addToast({
        title: 'Appointment Scheduled!',
        message: `Dr. visit confirmed for Cow ${cow.tag} on ${appointmentDate} at ${appointmentTime}. ${
          addToCalendar ? 'Event added to Google Calendar. ' : ''
        }${sendEmail ? 'Email notification sent.' : ''}`,
        type: 'success',
      })

      setShowConfirmation(false)
      onClose()
    } catch (err: any) {
      addToast({
        title: 'Booking Error',
        message: err.message || 'Error communicating with Google APIs.',
        type: 'alert',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/35 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl border border-black/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.12)] max-w-xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-black/[0.06] flex items-center justify-between bg-[#FBFBFD]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1D1D1F] text-white flex items-center justify-center font-bold shadow-xs">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Book Veterinary Visit</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/[0.04] text-slate-700">
                  Google Calendar & Contacts
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Schedule visit for {cow.name} ({cow.assignedPen || 'Pen 1'} · {cow.breed})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Google Workspace Connection Bar */}
        <div className="bg-slate-100/80 px-4 sm:px-5 py-2.5 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
          {workspaceUser ? (
            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Connected as <strong>{workspaceUser.email}</strong>
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="ml-2 text-[11px] text-slate-500 underline hover:text-slate-800"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-slate-600 text-[11px]">
                Connect Google to sync with your Calendar, Contacts & Gmail:
              </span>
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-xs shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Form */}
        <form onSubmit={handleOpenConfirmation} className="p-4 sm:p-5 space-y-4">
          {/* Cow Quick Summary */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-900">
                {cow.name} ({cow.breed})
              </div>
              <div className="text-slate-500">
                {cow.assignedPen || 'Pen 1'} • EC: {cow.ec} mS/cm • pH: {cow.ph}
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                  cow.currentRisk === 'suspected' || cow.currentRisk === 'critical'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {cow.currentRisk === 'suspected' || cow.currentRisk === 'critical'
                  ? 'Suspicious'
                  : 'At Risk'}
              </span>
            </div>
          </div>

          {/* Doctor Selection from Google Contacts */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Select Veterinary Doctor (from Google Contacts)</span>
              </span>
              {workspaceUser && (
                <span className="text-[11px] font-normal text-emerald-600">
                  ✓ {contacts.length} Contacts synced
                </span>
              )}
            </label>

            <select
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="w-full text-xs rounded-xl border-slate-300 py-2.5 px-3 bg-white shadow-2xs focus:border-blue-500 focus:ring-blue-500 font-medium"
            >
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} ({contact.role || 'Doctor'}) — {contact.phone || contact.email}
                </option>
              ))}
              <option value="custom">+ Enter another Doctor / Clinic...</option>
            </select>
          </div>

          {/* Custom Doctor Input if chosen */}
          {selectedContactId === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Doctor Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Name"
                  value={customDoctorName}
                  onChange={(e) => setCustomDoctorName(e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-300 py-1.5 px-2 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Doctor Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="doctor@gmail.com"
                  value={customDoctorEmail}
                  onChange={(e) => setCustomDoctorEmail(e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-300 py-1.5 px-2 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98..."
                  value={customDoctorPhone}
                  onChange={(e) => setCustomDoctorPhone(e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-300 py-1.5 px-2 bg-white"
                />
              </div>
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Appointment Date</span>
              </label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full text-xs rounded-xl border-slate-300 py-2 px-3 bg-white shadow-2xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Time Slot</span>
              </label>
              <input
                type="time"
                required
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full text-xs rounded-xl border-slate-300 py-2 px-3 bg-white shadow-2xs font-medium"
              />
            </div>
          </div>

          {/* Observation & Clinical Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Clinical Symptoms & Notes for Doctor
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs rounded-xl border-slate-300 p-2.5 bg-white shadow-2xs focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe conductivity changes, yield drop, or behavioral changes..."
            />
          </div>

          {/* Integration Checkboxes */}
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2 text-xs">
            <label className="flex items-center gap-2 font-medium text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={addToCalendar}
                onChange={(e) => setAddToCalendar(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Add appointment event to my Google Calendar</span>
            </label>
            <label className="flex items-center gap-2 font-medium text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Send Gmail reminder & cow health summary to Doctor and Farmer</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Review & Schedule</span>
            </button>
          </div>
        </form>

        {/* Explicit Confirmation Dialog (Mandatory User Confirmation per Skill) */}
        {showConfirmation && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-100">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 text-center mb-1">
                Confirm Doctor Appointment
              </h3>
              <p className="text-xs text-slate-500 text-center mb-4">
                Please confirm the appointment details before updating your Google Calendar and
                sending the email reminder.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 mb-5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Cow:</span>
                  <span className="font-bold text-slate-800">
                    {cow.name} ({cow.assignedPen})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor:</span>
                  <span className="font-bold text-slate-800">{activeContact.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-bold text-slate-800">
                    {appointmentDate} at {appointmentTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Google Calendar:</span>
                  <span className="font-semibold text-emerald-600">
                    {addToCalendar ? 'Yes, will add event' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gmail Reminder:</span>
                  <span className="font-semibold text-emerald-600">
                    {sendEmail ? `Send to ${activeContact.email}` : 'No'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 text-xs font-medium text-slate-700 bg-black/[0.04] hover:bg-black/[0.08] rounded-full transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBooking}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 text-xs font-medium text-white bg-[#1D1D1F] hover:bg-black rounded-full shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Scheduling...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Confirm & Book</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

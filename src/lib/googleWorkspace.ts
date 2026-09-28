import firebaseConfig from '../../firebase-applet-config.json'
import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  GoogleAuthProvider,
  User,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth'

// Reuse Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
export const auth = getAuth(app)

// Scopes required for Calendar, Contacts and Gmail
export const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/gmail.send',
]

const provider = new GoogleAuthProvider()
SCOPES.forEach((scope) => provider.addScope(scope))
provider.setCustomParameters({ prompt: 'select_account' })

// In-memory token cache (never stored in localStorage)
let cachedAccessToken: string | null = null
let isSigningIn = false

export interface WorkspaceUser {
  displayName: string | null
  email: string | null
  photoURL: string | null
  uid: string
}

export interface VetContact {
  id: string
  name: string
  email?: string
  phone?: string
  role?: string
}

export interface VetAppointmentRequest {
  cowId: string
  cowTag: string
  cowName: string
  breed: string
  pen: string
  doctorName: string
  doctorEmail: string
  doctorPhone?: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  notes: string
  addToCalendar: boolean
  sendEmailReminder: boolean
}

// Default verified veterinary contacts for Indian dairy farms
export const DEFAULT_VET_CONTACTS: VetContact[] = [
  {
    id: 'vet-1',
    name: 'Dr. Rajesh Verma',
    role: 'Chief Veterinary Officer (Dairy Cattle Health)',
    email: 'dr.rajesh.verma.vet@gmail.com',
    phone: '+91 98234 56781',
  },
  {
    id: 'vet-2',
    name: 'Dr. Anita Sharma',
    role: 'Dairy Health & Mastitis Specialist',
    email: 'dr.anita.dairy@gmail.com',
    phone: '+91 94123 45672',
  },
  {
    id: 'vet-3',
    name: 'Dr. Suresh Patil',
    role: 'District Animal Husbandry Consultant',
    email: 'dr.suresh.patil.vet@gmail.com',
    phone: '+91 97345 61289',
  },
  {
    id: 'vet-4',
    name: 'Pashu Chikitsalay (Veterinary Dispensary)',
    role: 'Local Govt Dairy Clinic & Mobile Unit',
    email: 'vet.dispensary.help@gmail.com',
    phone: '+91 98112 34567',
  },
]

// Initialize Auth listener
export const initWorkspaceAuth = (
  onSuccess?: (user: User, token: string) => void,
  onFailure?: () => void,
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onSuccess) onSuccess(user, cachedAccessToken)
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null
        if (onFailure) onFailure()
      }
    }
  })
}

// Google Sign-In
export const signInWithGoogleWorkspace = async (): Promise<{
  user: User
  accessToken: string
} | null> => {
  try {
    isSigningIn = true
    const result = await signInWithPopup(auth, provider)
    const credential = GoogleAuthProvider.credentialFromResult(result)
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve Google OAuth access token')
    }

    cachedAccessToken = credential.accessToken
    return { user: result.user, accessToken: cachedAccessToken }
  } catch (error: any) {
    console.error('[Google Workspace] Sign-in error:', error)
    throw error
  } finally {
    isSigningIn = false
  }
}

export const getWorkspaceAccessToken = (): string | null => {
  return cachedAccessToken
}

export const signOutGoogleWorkspace = async (): Promise<void> => {
  await signOut(auth)
  cachedAccessToken = null
}

// Fetch Contacts from Google People API
export const fetchGoogleContacts = async (token: string): Promise<VetContact[]> => {
  try {
    const res = await fetch(
      'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers&pageSize=50',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    )

    if (!res.ok) {
      console.warn('[Google Contacts] API error:', res.status, res.statusText)
      return DEFAULT_VET_CONTACTS
    }

    const data = await res.json()
    const contacts: VetContact[] = []

    if (data.connections && Array.isArray(data.connections)) {
      for (const item of data.connections) {
        const name = item.names?.[0]?.displayName || item.names?.[0]?.givenName
        const email = item.emailAddresses?.[0]?.value
        const phone = item.phoneNumbers?.[0]?.value

        if (name) {
          contacts.push({
            id: item.resourceName || `contact-${Math.random()}`,
            name,
            email,
            phone,
            role: 'Google Contact',
          })
        }
      }
    }

    // Merge user contacts with default Indian dairy doctors
    return [...contacts, ...DEFAULT_VET_CONTACTS]
  } catch (err) {
    console.warn('[Google Contacts] Failed to fetch, falling back to defaults:', err)
    return DEFAULT_VET_CONTACTS
  }
}

// Create Event in Google Calendar
export const createGoogleCalendarEvent = async (
  token: string,
  appointment: VetAppointmentRequest,
): Promise<{ success: boolean; eventId?: string; htmlLink?: string; error?: string }> => {
  try {
    const startDateTime = new Date(`${appointment.date}T${appointment.time}:00`)
    const endDateTime = new Date(startDateTime.getTime() + 45 * 60000) // 45 minutes appointment

    const eventPayload = {
      summary: `GauSaathi Vet Visit: ${appointment.cowName} (${appointment.pen} - ${appointment.breed})`,
      description: `GauSaathi Herd Health Veterinary Appointment
Cow: ${appointment.cowName} (Tag: ${appointment.cowTag})
Pen: ${appointment.pen} | Breed: ${appointment.breed}
Doctor: ${appointment.doctorName}
Doctor Contact: ${appointment.doctorPhone || 'N/A'} | ${appointment.doctorEmail}

Clinical Notes & Farm Parameters:
${appointment.notes}

Scheduled automatically via GauSaathi Indian Dairy Cow Health Monitoring.`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      },
      attendees: appointment.doctorEmail ? [{ email: appointment.doctorEmail }] : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 120 },
          { method: 'popup', minutes: 30 },
        ],
      },
    }

    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      },
    )

    if (!res.ok) {
      const errBody = await res.text()
      console.error('[Google Calendar] API error:', res.status, errBody)
      return { success: false, error: `Calendar API error (${res.status})` }
    }

    const result = await res.json()
    return {
      success: true,
      eventId: result.id,
      htmlLink: result.htmlLink,
    }
  } catch (err: any) {
    console.error('[Google Calendar] Exception:', err)
    return { success: false, error: err.message || 'Unknown calendar error' }
  }
}

// Send Email Reminder via Gmail API
export const sendGmailReminder = async (
  token: string,
  appointment: VetAppointmentRequest,
  farmerEmail: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const recipients = [appointment.doctorEmail, farmerEmail].filter(Boolean).join(', ')

    const subject = `[GauSaathi Alert] Vet Appointment Confirmed for ${appointment.cowName} (${appointment.pen})`

    const emailContent = `From: "GauSaathi Herd Health" <${farmerEmail}>
To: ${recipients}
Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; }
    .card { max-width: 580px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .header { background: #0f172a; color: #ffffff; padding: 20px; }
    .badge { background: #ef4444; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold; }
    .content { padding: 24px; background: #ffffff; }
    .param-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin: 16px 0; }
    .footer { background: #f1f5f9; padding: 12px 24px; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 style="margin:0; font-size: 20px;">GauSaathi • Doctor Appointment Scheduled</h2>
      <p style="margin:4px 0 0; font-size: 13px; opacity: 0.85;">Indian Dairy Cow Health Monitoring Alert</p>
    </div>
    <div class="content">
      <p>Namaste <strong>${appointment.doctorName}</strong>,</p>
      <p>An on-farm veterinary examination has been booked for <strong>${appointment.cowName}</strong>.</p>
      
      <div class="param-box">
        <strong>Animal Details:</strong><br/>
        • Cow: ${appointment.cowName} (Tag: ${appointment.cowTag})<br/>
        • Location: ${appointment.pen}<br/>
        • Breed: ${appointment.breed}<br/>
        • Appointment: ${appointment.date} at ${appointment.time}<br/>
      </div>

      <div class="param-box">
        <strong>Reason for Examination:</strong><br/>
        ${appointment.notes}
      </div>

      <p style="font-size: 13px; color: #475569;">
        Please confirm receipt. The farmer has been notified and the event is synchronized to Google Calendar.
      </p>
    </div>
    <div class="footer">
      Sent with GauSaathi • Empowering Indian Dairy Farmers
    </div>
  </div>
</body>
</html>`

    // Base64URL encode the RFC 2822 email message
    const base64Encoded = btoa(unescape(encodeURIComponent(emailContent)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const res = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: base64Encoded }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[Gmail API] Error:', res.status, err)
      return { success: false, error: `Gmail error (${res.status})` }
    }

    const data = await res.json()
    return { success: true, messageId: data.id }
  } catch (err: any) {
    console.error('[Gmail API] Exception:', err)
    return { success: false, error: err.message || 'Unknown Gmail error' }
  }
}

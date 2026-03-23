import { getToken, onMessage } from 'firebase/messaging'
import { getMessagingInstance } from './config'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from './config'

// VAPID key from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates

const VAPID_KEY =  'BIWwaJTfl4yr_jKYMdqzKyeGT7MnlYFo_cjRW_qnu8pUAAlJenyVTzHFANiVXClkVjVrlBAXZHSW-uLh3KlA_xE'


// Request permission + get FCM token, store on user doc
export const requestNotificationPermission = async (uid) => {
  try {
    const messaging = await getMessagingInstance()
    if (!messaging) return null

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
    if (token && uid) {
      await updateDoc(doc(db, 'users', uid), { fcmToken: token })
    }
    return token
  } catch (err) {
    console.error('FCM permission error:', err)
    return null
  }
}

// Listen for foreground messages
export const onForegroundMessage = async (callback) => {
  const messaging = await getMessagingInstance()
  if (!messaging) return () => {}
  return onMessage(messaging, (payload) => {
    callback(payload)
  })
}

// ─── firebase-messaging-sw.js must be in /public ────────────────────────────
// The file public/firebase-messaging-sw.js handles background notifications.
// Its content is generated automatically — see public/firebase-messaging-sw.js

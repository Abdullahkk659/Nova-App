import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, isSupported } from 'firebase/messaging'

// ⚠️  Paste your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyCFF0-V-5Ow_6Tm_kisPkqRTrvNGpRkrT4",
  authDomain: "nova-app-36f71.firebaseapp.com",
  projectId: "nova-app-36f71",
  storageBucket: "nova-app-36f71.firebasestorage.app",
  messagingSenderId: "483545915094",
  appId: "1:483545915094:web:09c3cdd465f83c23e33377",
  measurementId: "G-89VG8QVZNK"
};


const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

export const getMessagingInstance = async () => {
  const supported = await isSupported()
  if (supported) return getMessaging(app)
  return null
}

export default app

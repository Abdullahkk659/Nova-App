import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthChange } from '../firebase/auth'
import { getUserProfile } from '../firebase/firestore'
import { requestNotificationPermission } from '../firebase/messaging'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const prof = await getUserProfile(firebaseUser.uid)
          setProfile(prof)
          requestNotificationPermission(firebaseUser.uid).catch(() => {})
        } catch (err) {
          // Non-fatal — user is still logged in
          console.warn('Could not load profile:', err.message)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const refreshProfile = async () => {
    if (!user) return
    try {
      const prof = await getUserProfile(user.uid)
      setProfile(prof)
    } catch (err) {
      console.warn('Could not refresh profile:', err.message)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

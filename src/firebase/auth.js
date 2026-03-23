import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth'
import { auth, googleProvider } from './config'
import { createUserProfile } from './firestore'

// ─── REGISTER ────────────────────────────────────────────────
export const registerWithEmail = async (email, password, username, displayName) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName })
  await createUserProfile(cred.user.uid, {
    email,
    username: username.toLowerCase(),
    displayName,
    uid: cred.user.uid
  })
  return cred.user
}

// ─── LOGIN ────────────────────────────────────────────────
export const loginWithEmail = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

// ─── GOOGLE ────────────────────────────────────────────────
export const loginWithGoogle = async () => {
  const cred = await signInWithPopup(auth, googleProvider)
  // Create profile only if new user
  await createUserProfile(cred.user.uid, {
    email: cred.user.email,
    displayName: cred.user.displayName,
    username: cred.user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, ''),
    photoURL: cred.user.photoURL,
    uid: cred.user.uid
  })
  return cred.user
}

// ─── LOGOUT ────────────────────────────────────────────────
export const logout = () => signOut(auth)

// ─── PASSWORD RESET ────────────────────────────────────────────────
export const resetPassword = (email) => sendPasswordResetEmail(auth, email)

// ─── UPDATE AUTH EMAIL ────────────────────────────────────────────────
export const changeEmail = async (newEmail, currentPassword) => {
  const cred = EmailAuthProvider.credential(auth.currentUser.email, currentPassword)
  await reauthenticateWithCredential(auth.currentUser, cred)
  await updateEmail(auth.currentUser, newEmail)
}

// ─── UPDATE AUTH PASSWORD ────────────────────────────────────────────────
export const changePassword = async (currentPassword, newPassword) => {
  const cred = EmailAuthProvider.credential(auth.currentUser.email, currentPassword)
  await reauthenticateWithCredential(auth.currentUser, cred)
  await updatePassword(auth.currentUser, newPassword)
}

// ─── AUTH STATE LISTENER ────────────────────────────────────────────────
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback)

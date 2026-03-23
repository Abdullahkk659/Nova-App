import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot,
  arrayUnion, arrayRemove, serverTimestamp,
  increment, setDoc
} from 'firebase/firestore'
import { db } from './config'

// ─── USERS ────────────────────────────────────────────────
export const createUserProfile = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), {
    uid,
    username:       data.username     || '',
    displayName:    data.displayName  || '',
    email:          data.email        || '',
    bio:            '',
    avatarUrl:      data.photoURL     || '',
    website:        '',
    followersCount: 0,
    followingCount: 0,
    postsCount:     0,
    isVerified:     false,
    createdAt:      serverTimestamp(),
    ...data
  }, { merge: true })
}

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() })
}

export const searchUsers = async (queryStr) => {
  if (!queryStr || queryStr.length < 2) return []
  const q = query(
    collection(db, 'users'),
    where('username', '>=', queryStr),
    where('username', '<=', queryStr + '\uf8ff'),
    limit(8)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── FOLLOW ────────────────────────────────────────────────
export const followUser = async (currentUid, targetUid) => {
  await setDoc(doc(db, 'follows', `${currentUid}_${targetUid}`), {
    followerId:  currentUid,
    followingId: targetUid,
    createdAt:   serverTimestamp()
  })
  await Promise.all([
    updateDoc(doc(db, 'users', currentUid), { followingCount: increment(1) }),
    updateDoc(doc(db, 'users', targetUid),  { followersCount: increment(1) })
  ])
}

export const unfollowUser = async (currentUid, targetUid) => {
  await deleteDoc(doc(db, 'follows', `${currentUid}_${targetUid}`))
  await Promise.all([
    updateDoc(doc(db, 'users', currentUid), { followingCount: increment(-1) }),
    updateDoc(doc(db, 'users', targetUid),  { followersCount: increment(-1) })
  ])
}

export const isFollowing = async (currentUid, targetUid) => {
  const snap = await getDoc(doc(db, 'follows', `${currentUid}_${targetUid}`))
  return snap.exists()
}

export const getFollowing = async (uid) => {
  const q = query(collection(db, 'follows'), where('followerId', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data().followingId)
}

// ─── POSTS ────────────────────────────────────────────────
const cleanData = (data) =>
  Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined))

export const createPost = async (data) => {
  const ref = await addDoc(collection(db, 'posts'), {
    ...cleanData(data),
    likesCount:    0,
    commentsCount: 0,
    likedBy:       [],
    createdAt:     serverTimestamp()
  })
  await updateDoc(doc(db, 'users', data.authorId), { postsCount: increment(1) })
  return ref.id
}

export const getPost = async (postId) => {
  const snap = await getDoc(doc(db, 'posts', postId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const deletePost = async (postId, authorId) => {
  await deleteDoc(doc(db, 'posts', postId))
  await updateDoc(doc(db, 'users', authorId), { postsCount: increment(-1) })
}

export const subscribeToFeed = (authorIds, callback) => {
  const ids = authorIds.length > 0 ? authorIds.slice(0, 10) : ['__nobody__']
  const q = query(
    collection(db, 'posts'),
    where('authorId', 'in', ids),
    orderBy('createdAt', 'desc'),
    limit(20)
  )
  return onSnapshot(q, { includeMetadataChanges: false }, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export const subscribeToExplorePosts = (callback) => {
  const q = query(
    collection(db, 'posts'),
    orderBy('likesCount', 'desc'),
    limit(30)
  )
  return onSnapshot(q, { includeMetadataChanges: false }, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export const getUserPosts = async (uid) => {
  const q = query(
    collection(db, 'posts'),
    where('authorId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(30)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── LIKES ────────────────────────────────────────────────
export const likePost = async (postId, uid) => {
  await updateDoc(doc(db, 'posts', postId), {
    likedBy:    arrayUnion(uid),
    likesCount: increment(1)
  })
}

export const unlikePost = async (postId, uid) => {
  await updateDoc(doc(db, 'posts', postId), {
    likedBy:    arrayRemove(uid),
    likesCount: increment(-1)
  })
}

// ─── COMMENTS ────────────────────────────────────────────────
export const addComment = async (postId, data) => {
  const ref = await addDoc(
    collection(db, 'posts', postId, 'comments'),
    { ...cleanData(data), createdAt: serverTimestamp() }
  )
  await updateDoc(doc(db, 'posts', postId), { commentsCount: increment(1) })
  return ref.id
}

export const deleteComment = async (postId, commentId) => {
  await deleteDoc(doc(db, 'posts', postId, 'comments', commentId))
  await updateDoc(doc(db, 'posts', postId), { commentsCount: increment(-1) })
}

export const subscribeToComments = (postId, callback) => {
  const q = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('createdAt', 'asc'),
    limit(50)
  )
  return onSnapshot(q, { includeMetadataChanges: false }, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

// ─── STORIES ────────────────────────────────────────────────
export const createStory = async (data) => {
  await addDoc(collection(db, 'stories'), {
    ...data,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    viewedBy:  [],
    createdAt: serverTimestamp()
  })
}

export const getActiveStories = async (followingIds) => {
  const ids = followingIds.length > 0 ? followingIds.slice(0, 10) : ['__nobody__']
  const q = query(
    collection(db, 'stories'),
    where('authorId', 'in', ids),
    where('expiresAt', '>', new Date()),
    orderBy('expiresAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const markStoryViewed = async (storyId, uid) => {
  await updateDoc(doc(db, 'stories', storyId), { viewedBy: arrayUnion(uid) })
}

// ─── SAVED POSTS ────────────────────────────────────────────────
export const savePost = async (uid, postId) => {
  await setDoc(doc(db, 'users', uid, 'saved', postId), {
    postId, savedAt: serverTimestamp()
  })
}

export const unsavePost = async (uid, postId) => {
  await deleteDoc(doc(db, 'users', uid, 'saved', postId))
}

export const getSavedPosts = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'saved'))
  return snap.docs.map(d => d.data().postId)
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────
export const createNotification = async (targetUid, data) => {
  await addDoc(collection(db, 'users', targetUid, 'notifications'), {
    ...data, read: false, createdAt: serverTimestamp()
  })
}

export const subscribeToNotifications = (uid, callback) => {
  const q = query(
    collection(db, 'users', uid, 'notifications'),
    orderBy('createdAt', 'desc'),
    limit(20)
  )
  return onSnapshot(q, { includeMetadataChanges: false }, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export const markNotificationRead = async (uid, notifId) => {
  await updateDoc(doc(db, 'users', uid, 'notifications', notifId), { read: true })
}

// ─── DIRECT MESSAGES ────────────────────────────────────────────────
export const getOrCreateConversation = async (uid1, uid2) => {
  const convId = [uid1, uid2].sort().join('_')
  const ref    = doc(db, 'conversations', convId)
  const snap   = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      participants:   [uid1, uid2],
      lastMessage:    '',
      lastMessageAt:  serverTimestamp(),
      createdAt:      serverTimestamp()
    })
  }
  return convId
}

export const sendMessage = async (convId, data) => {
  await addDoc(collection(db, 'conversations', convId, 'messages'), {
    ...cleanData(data), createdAt: serverTimestamp()
  })
  await updateDoc(doc(db, 'conversations', convId), {
    lastMessage:   data.text || '📷 Photo',
    lastMessageAt: serverTimestamp(),
    lastSenderId:  data.senderId
  })
}

export const subscribeToMessages = (convId, callback) => {
  const q = query(
    collection(db, 'conversations', convId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(50)
  )
  return onSnapshot(q, { includeMetadataChanges: false }, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export const getUserConversations = (uid, callback) => {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', uid),
    orderBy('lastMessageAt', 'desc'),
    limit(20)
  )
  return onSnapshot(q, { includeMetadataChanges: false }, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

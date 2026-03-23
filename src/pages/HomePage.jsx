import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getFollowing, subscribeToFeed } from '../firebase/firestore'
import PostCard from '../components/PostCard'

export default function HomePage() {
  const { user } = useAuth()
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('foryou')
  const followingRef          = useRef([])
  const unsubRef              = useRef(null)

  const startFeed = useCallback((feedIds) => {
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }
    const ids = feedIds.length > 0 ? feedIds : ['__nobody__']
    unsubRef.current = subscribeToFeed(ids, (newPosts) => {
      setPosts(newPosts)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!user) return

    // 1. Immediately show YOUR own posts while following list loads
    startFeed([user.uid])

    // 2. Load following list in background, then widen the feed
    getFollowing(user.uid).then(ids => {
      followingRef.current = ids
      if (tab === 'foryou') {
        startFeed([user.uid, ...ids])
      }
    })

    return () => { if (unsubRef.current) unsubRef.current() }
  }, [user])

  const handleTabChange = (newTab) => {
    setTab(newTab)
    setLoading(true)
    if (newTab === 'following') {
      startFeed(followingRef.current)
    } else {
      startFeed([user.uid, ...followingRef.current])
    }
  }

  const handleDelete = useCallback((id) => {
    setPosts(p => p.filter(x => x.id !== id))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(15,15,26,.92)', backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 56, flexShrink: 0,
      }}>
        <div style={{
          fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, fontStyle: 'italic',
          background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Nova</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['For You', 'Following'].map(label => {
            const key = label.toLowerCase().replace(' ', '')
            const active = tab === key
            return (
              <button key={key} onClick={() => handleTabChange(key)} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                border: active ? 'none' : '1px solid var(--border2)',
                background: active ? 'var(--gold)' : 'transparent',
                color: active ? '#1a1000' : 'var(--text2)',
                cursor: 'pointer', transition: 'all .15s',
              }}>{label}</button>
            )
          })}
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 16 }}>
          <div className="spinner" />
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>Loading your feed…</div>
        </div>
      ) : posts.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text2)' }}>No posts yet</div>
          <div style={{ fontSize: 14, marginTop: 6 }}>Follow people or share your first post!</div>
        </div>
      ) : (
        posts.map((post, i) => (
          <div key={post.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i * 0.04, 0.25)}s` }}>
            <PostCard post={post} onDelete={handleDelete} />
          </div>
        ))
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribeToExplorePosts } from '../firebase/firestore'

export default function ExplorePage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = subscribeToExplorePosts((p) => {
      setPosts(p)
      setLoading(false)
    })
    return unsub
  }, [])

  return (
    <div>
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(15,15,26,.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px', height: 56, display: 'flex', alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600 }}>Explore</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <div className="spinner" />
        </div>
      ) : posts.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔭</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text2)' }}>Nothing here yet</div>
          <div style={{ fontSize: 14, marginTop: 6 }}>Be the first to post something!</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {posts.map((post, i) => (
            <div key={post.id} onClick={() => navigate(`/post/${post.id}`)}
              className="animate-fade-in"
              style={{
                aspectRatio: '1', cursor: 'pointer', position: 'relative',
                overflow: 'hidden', background: 'var(--bg3)',
                animationDelay: `${i * 0.03}s`,
              }}>
              {post.mediaUrls?.[0] ? (
                post.mediaType === 'video'
                  ? <video src={post.mediaUrls[0]} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <img src={post.mediaUrls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, background: 'var(--bg4)' }}>📷</div>
              )}
              {/* Hover overlay */}
              <div style={{
                position: 'absolute', inset: 0, background: '#00000070',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity .15s',
                gap: 20,
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M8 13s-5.5-3.5-5.5-7A3 3 0 018 4.2 3 3 0 0113.5 6c0 3.5-5.5 7-5.5 7z"/></svg>
                  {post.likesCount || 0}
                </span>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5"><path d="M2 4h12v7a1 1 0 01-1 1H5l-3 2V4z"/></svg>
                  {post.commentsCount || 0}
                </span>
              </div>
              {post.mediaUrls?.length > 1 && (
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><rect x="2" y="5" width="9" height="9" rx="1"/><rect x="5" y="2" width="9" height="9" rx="1" fill="rgba(255,255,255,.6)"/></svg>
                </div>
              )}
              {post.mediaType === 'video' && (
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M4 3l9 5-9 5z"/></svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

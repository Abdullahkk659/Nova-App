// SavedPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSavedPosts, getPost } from '../firebase/firestore'

export function SavedPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getSavedPosts(user.uid).then(async (ids) => {
      const loaded = await Promise.all(ids.map(id => getPost(id)))
      setPosts(loaded.filter(Boolean))
      setLoading(false)
    })
  }, [user])

  return (
    <div>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(15,15,26,.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600 }}>Saved</span>
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔖</div>
          <div style={{ fontSize: 15, color: 'var(--text2)' }}>No saved posts yet</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2 }}>
          {posts.map(p => (
            <div key={p.id} style={{ aspectRatio: '1', cursor: 'pointer', overflow: 'hidden', background: 'var(--bg3)' }} onClick={() => navigate(`/post/${p.id}`)}>
              {p.mediaUrls?.[0]
                ? <img src={p.mediaUrls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📷</div>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SavedPage

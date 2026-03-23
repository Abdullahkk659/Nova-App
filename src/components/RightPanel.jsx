import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { searchUsers, followUser, unfollowUser, isFollowing } from '../firebase/firestore'

const TRENDS = [
  { tag: '#nightphotography', posts: '284K' },
  { tag: '#goldenratio',      posts: '198K' },
  { tag: '#moodygrams',       posts: '445K' },
  { tag: '#architecturephotography', posts: '320K' },
  { tag: '#portraitphotography',     posts: '1.2M' },
]

export default function RightPanel() {
  const { user, profile } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      const r = await searchUsers(query.trim())
      setResults(r.filter(u => u.uid !== user?.uid))
      setSearching(false)
    }, 350)
    return () => clearTimeout(t)
  }, [query])

  return (
    <aside style={{ background: 'var(--bg)', borderLeft: '1px solid var(--border)', overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg3)', borderRadius: 12, padding: '9px 14px', border: '1px solid var(--border)' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" opacity=".5"><circle cx="6" cy="6" r="4.5"/><path d="M10 10l3 3"/></svg>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search creators…" style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13, flex: 1, fontFamily: 'var(--font-sans)' }} />
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px 6px', fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Results</div>
          {results.map(u => (
            <Link key={u.uid} to={`/profile/${u.uid}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--border)', textDecoration: 'none', transition: 'background .12s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text)', flexShrink: 0 }}>{(u.displayName||u.username||'U').slice(0,2).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.displayName}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>@{u.username}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Profile stats */}
      {profile && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {[['Posts', profile.postsCount||0],['Followers', profile.followersCount||0],['Following', profile.followingCount||0]].map(([label, val]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{val >= 1000 ? (val/1000).toFixed(1)+'K' : val}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 600, padding: '14px 14px 8px', color: 'var(--text2)' }}>Trending tags</div>
        {TRENDS.map(t => (
          <div key={t.tag} style={{ padding: '9px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .12s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--gold)' }}>{t.tag}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{t.posts} posts</div>
          </div>
        ))}
      </div>
    </aside>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getFollowing, getActiveStories } from '../firebase/firestore'
import NewPostModal from './NewPostModal'

export default function LeftPanel() {
  const { user } = useAuth()
  const [stories, setStories] = useState([])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const following = await getFollowing(user.uid)
      const allIds = [user.uid, ...following]
      const s = await getActiveStories(allIds)
      setStories(s)
    }
    load()
  }, [user])

  return (
    <aside style={{
      background: 'var(--bg)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
    }}>
      {/* Stories */}
      <div style={{ padding: '20px 16px 12px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Stories</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Add your story */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 12, cursor: 'pointer' }}
            onClick={() => document.dispatchEvent(new CustomEvent('nova:add-story'))}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--bg3)', border: '1.5px dashed var(--border3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--gold)', flexShrink: 0 }}>+</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Your story</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Add to story</div>
            </div>
          </div>
          {stories.slice(0, 8).map(story => (
            <Link key={story.id} to={`/profile/${story.authorId}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 12, textDecoration: 'none', transition: 'background .12s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', padding: 2, background: 'conic-gradient(var(--gold),var(--rose),var(--violet),var(--gold))', flexShrink: 0 }}>
                {story.authorAvatar
                  ? <img src={story.authorAvatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid var(--bg)', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid var(--bg)', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{(story.authorName||'U').slice(0,2).toUpperCase()}</div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>{story.authorName}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>New story</div>
              </div>
              <div style={{ width: 8, height: 8, background: 'var(--gold)', borderRadius: '50%', flexShrink: 0 }} />
            </Link>
          ))}
          {stories.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--text3)', padding: '8px 10px' }}>Follow people to see their stories</div>
          )}
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '4px 16px' }} />

      {/* Reels placeholder */}
      <div style={{ padding: '16px 16px 8px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Reels for you</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {['🌅','🌊','🏙️','🌿','🌌','🦋'].map((e, i) => (
            <div key={i} style={{ borderRadius: 10, overflow: 'hidden', cursor: 'pointer', position: 'relative', aspectRatio: '9/16', border: '1px solid var(--border)', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
              {e}
              <div style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 11, fontWeight: 600, color: '#fff' }}>{Math.floor(Math.random()*90+10)}K</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <button className="btn btn-gold" style={{ margin: 16, borderRadius: 14, padding: '12px 20px' }}
        onClick={() => document.dispatchEvent(new CustomEvent('nova:open-post-modal'))}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2v12M2 8h12"/></svg>
        New Post
      </button>

      <NewPostModal />
    </aside>
  )
}

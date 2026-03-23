import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserProfile, getUserPosts, followUser, unfollowUser, isFollowing } from '../firebase/firestore'
import { uploadAvatar } from '../firebase/storage'
import { updateUserProfile } from '../firebase/firestore'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { uid } = useParams()
  const { user, profile: myProfile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const isOwn = uid === user?.uid

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [p, userPosts] = await Promise.all([
        getUserProfile(uid),
        getUserPosts(uid)
      ])
      setProfile(p)
      setPosts(userPosts)
      if (!isOwn && user) {
        const f = await isFollowing(user.uid, uid)
        setFollowing(f)
      }
      setLoading(false)
    }
    if (uid) load()
  }, [uid, user])

  const handleFollow = async () => {
    if (!user) return
    setFollowing(f => !f)
    setProfile(p => ({
      ...p,
      followersCount: following ? (p.followersCount - 1) : (p.followersCount + 1)
    }))
    if (following) await unfollowUser(user.uid, uid)
    else await followUser(user.uid, uid)
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const url = await uploadAvatar(file, user.uid, () => {})
      await updateUserProfile(user.uid, { avatarUrl: url })
      await refreshProfile()
      setProfile(p => ({ ...p, avatarUrl: url }))
      toast.success('Avatar updated!')
    } catch (err) {
      toast.error('Failed to update avatar')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSaveEdit = async () => {
    try {
      await updateUserProfile(user.uid, editData)
      setProfile(p => ({ ...p, ...editData }))
      await refreshProfile()
      setEditing(false)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <div className="spinner" />
    </div>
  )

  if (!profile) return (
    <div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)' }}>User not found</div>
  )

  const savedPosts = posts.filter(p => p.savedBy?.includes(user?.uid))

  return (
    <div>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(15,15,26,.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: 4 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M13 4l-6 6 6 6"/></svg>
        </button>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600 }}>{profile.username || profile.displayName}</span>
      </div>

      {/* Profile info */}
      <div style={{ padding: '24px 24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 20 }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', padding: 3, background: 'conic-gradient(var(--gold),var(--rose),var(--violet),var(--gold))' }}>
              {profile.avatarUrl
                ? <img src={profile.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', border: '3px solid var(--bg2)', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '3px solid var(--bg2)', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 600, color: 'var(--text)' }}>
                    {(profile.displayName || profile.username || 'U').slice(0,2).toUpperCase()}
                  </div>
              }
            </div>
            {isOwn && (
              <label style={{ position: 'absolute', bottom: 2, right: 2, width: 24, height: 24, background: 'var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12 }}>
                {avatarUploading ? <div className="spinner" style={{ width: 12, height: 12 }} /> : '+'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </label>
            )}
          </div>

          {/* Stats */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
              {[['Posts', posts.length], ['Followers', profile.followersCount||0], ['Following', profile.followingCount||0]].map(([label, val]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700 }}>{val >= 1000 ? (val/1000).toFixed(1)+'K' : val}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
                </div>
              ))}
            </div>
            {isOwn ? (
              <button className="btn btn-outline" style={{ fontSize: 13, padding: '7px 16px' }} onClick={() => { setEditData({ displayName: profile.displayName, bio: profile.bio, website: profile.website }); setEditing(true); }}>Edit Profile</button>
            ) : (
              <button className={`btn ${following ? 'btn-outline' : 'btn-gold'}`} style={{ fontSize: 13, padding: '7px 20px' }} onClick={handleFollow}>
                {following ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        <div style={{ fontSize: 14, fontWeight: 600 }}>{profile.displayName}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>@{profile.username}</div>
        {profile.bio && <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 6, lineHeight: 1.5 }}>{profile.bio}</div>}
        {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--gold)', marginTop: 4, display: 'block' }}>{profile.website}</a>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        {['posts', 'reels', 'saved'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.08em',
            color: activeTab === tab ? 'var(--gold)' : 'var(--text3)',
            borderTop: activeTab === tab ? '2px solid var(--gold)' : '2px solid transparent',
            marginTop: -1, transition: 'all .15s',
          }}>{tab}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        {(activeTab === 'saved' ? savedPosts : posts).map(post => (
          <div key={post.id} style={{ aspectRatio: '1', cursor: 'pointer', position: 'relative', overflow: 'hidden', background: 'var(--bg3)' }}
            onClick={() => navigate(`/post/${post.id}`)}>
            {post.mediaUrls?.[0]
              ? <img src={post.mediaUrls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📷</div>
            }
          </div>
        ))}
        {posts.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: 48, textAlign: 'center', color: 'var(--text3)' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📷</div>
            <div>{isOwn ? 'Share your first photo!' : 'No posts yet'}</div>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000099', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setEditing(false) }}>
          <div className="card animate-fade-up" style={{ width: 440, maxWidth: '92vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600 }}>Edit Profile</span>
              <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: '4px 8px' }}>×</button>
            </div>
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[['displayName','Display name'],['bio','Bio'],['website','Website']].map(([key, label]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>{label}</label>
                  {key === 'bio'
                    ? <textarea className="input" rows={3} style={{ resize: 'none' }} value={editData[key]||''} onChange={e => setEditData(d => ({ ...d, [key]: e.target.value }))} />
                    : <input className="input" style={{ height: 40 }} value={editData[key]||''} onChange={e => setEditData(d => ({ ...d, [key]: e.target.value }))} />
                  }
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-gold" onClick={handleSaveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

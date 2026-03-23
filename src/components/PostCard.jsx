import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { likePost, unlikePost, savePost, unsavePost, deletePost } from '../firebase/firestore'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(post.likedBy?.includes(user?.uid))
  const [likes, setLikes] = useState(post.likesCount || 0)
  const [saved, setSaved] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)

  const mediaUrls = post.mediaUrls || []

  const handleLike = async (e) => {
    e.stopPropagation()
    if (!user) return
    setLiked(l => !l)
    setLikes(n => liked ? n - 1 : n + 1)
    if (liked) await unlikePost(post.id, user.uid)
    else await likePost(post.id, user.uid)
  }

  const handleSave = async (e) => {
    e.stopPropagation()
    if (!user) return
    setSaved(s => !s)
    if (saved) {
      await unsavePost(user.uid, post.id)
      toast.success('Removed from saved')
    } else {
      await savePost(user.uid, post.id)
      toast.success('Saved ✦')
    }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this post?')) return
    await deletePost(post.id, post.authorId)
    toast.success('Post deleted')
    if (onDelete) onDelete(post.id)
  }

  const ts = post.createdAt?.toDate ? post.createdAt.toDate() : new Date()
  const timeAgo = formatDistanceToNow(ts, { addSuffix: true })

  return (
    <article style={{
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg2)',
      transition: 'background .12s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 10px' }}>
        <Link to={`/profile/${post.authorId}`} onClick={e => e.stopPropagation()} style={{
          width: 38, height: 38, borderRadius: '50%', padding: 2, flexShrink: 0,
          background: 'conic-gradient(var(--gold),var(--rose),var(--violet),var(--gold))',
          display: 'block',
        }}>
          {post.authorAvatar
            ? <img src={post.authorAvatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid var(--bg2)', objectFit: 'cover' }} />
            : <div style={{
                width: '100%', height: '100%', borderRadius: '50%', border: '2px solid var(--bg2)',
                background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600, color: 'var(--text)',
              }}>{(post.authorName || 'U').slice(0,2).toUpperCase()}</div>
          }
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Link to={`/profile/${post.authorId}`} onClick={e => e.stopPropagation()} style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
              {post.authorName || 'Unknown'}
            </Link>
            {post.authorVerified && (
              <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#c9a84c"/><path d="M4 7l2 2 4-4" stroke="#1a1000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            )}
          </div>
          {post.location && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{post.location}</div>}
        </div>
        {user?.uid === post.authorId && (
          <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: 'var(--text3)', padding: 4, borderRadius: 6, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        )}
      </div>

      {/* Media */}
      {mediaUrls.length > 0 && (
        <div style={{ position: 'relative', width: '100%', background: 'var(--bg3)', cursor: 'pointer' }} onClick={() => navigate(`/post/${post.id}`)}>
          {post.mediaType === 'video' ? (
            <video
              src={mediaUrls[imgIdx]}
              controls
              style={{ width: '100%', maxHeight: 520, objectFit: 'cover', display: 'block' }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <img
              src={mediaUrls[imgIdx]}
              alt="post"
              style={{ width: '100%', maxHeight: 520, objectFit: 'cover', display: 'block' }}
            />
          )}
          {mediaUrls.length > 1 && (
            <>
              <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
                {mediaUrls.map((_, i) => (
                  <div key={i} onClick={e => { e.stopPropagation(); setImgIdx(i); }} style={{
                    width: i === imgIdx ? 16 : 6, height: 6,
                    borderRadius: i === imgIdx ? 3 : '50%',
                    background: i === imgIdx ? '#fff' : '#ffffff55',
                    cursor: 'pointer', transition: 'all .2s',
                  }} />
                ))}
              </div>
              {imgIdx > 0 && <button onClick={e => { e.stopPropagation(); setImgIdx(i => i - 1); }} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: '#00000088', border: 'none', color: '#fff', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', fontSize: 16 }}>‹</button>}
              {imgIdx < mediaUrls.length - 1 && <button onClick={e => { e.stopPropagation(); setImgIdx(i => i + 1); }} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: '#00000088', border: 'none', color: '#fff', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', fontSize: 16 }}>›</button>}
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 16px 6px' }}>
        <button onClick={handleLike} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px',
          borderRadius: 10, display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 13, color: liked ? 'var(--rose)' : 'var(--text2)', transition: 'all .12s',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill={liked ? 'var(--rose)' : 'none'} stroke="currentColor" strokeWidth="1.7"><path d="M10 16s-7-4.5-7-9A4 4 0 0110 5.5 4 4 0 0117 7c0 4.5-7 9-7 9z"/></svg>
        </button>
        <button onClick={() => navigate(`/post/${post.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text2)' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M2 5h16v9a1 1 0 01-1 1H6l-4 3V5z"/></svg>
        </button>
        <button onClick={() => { navigator.clipboard.writeText(window.location.origin + '/post/' + post.id); toast.success('Link copied!'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text2)' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 3l14 7-14 7V3z"/><path d="M3 10h9"/></svg>
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={handleSave} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px',
          borderRadius: 10, display: 'flex', alignItems: 'center',
          color: saved ? 'var(--gold)' : 'var(--text2)', transition: 'all .12s',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill={saved ? 'var(--gold)' : 'none'} stroke="currentColor" strokeWidth="1.7"><path d="M5 3h10a1 1 0 011 1v13l-6-4-6 4V4a1 1 0 011-1z"/></svg>
        </button>
      </div>

      <div style={{ padding: '0 16px 4px', fontSize: 13, fontWeight: 600 }}>{likes.toLocaleString()} likes</div>

      {post.caption && (
        <div style={{ padding: '2px 16px 8px', fontSize: 14, lineHeight: 1.5, color: 'var(--text2)' }}>
          <Link to={`/profile/${post.authorId}`} style={{ fontWeight: 600, color: 'var(--text)', marginRight: 6 }}>{post.authorName}</Link>
          {post.caption}
          {post.tags?.map(t => (
            <span key={t} style={{ color: 'var(--gold)', marginLeft: 4, cursor: 'pointer' }}>{t}</span>
          ))}
        </div>
      )}

      <div style={{ padding: '0 16px 4px', fontSize: 13, color: 'var(--text3)', cursor: 'pointer' }}
        onClick={() => navigate(`/post/${post.id}`)}>
        View all {post.commentsCount || 0} comments
      </div>
      <div style={{ padding: '0 16px 12px', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{timeAgo}</div>
    </article>
  )
}

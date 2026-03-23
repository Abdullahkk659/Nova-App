import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getPost, subscribeToComments, addComment, deleteComment, likePost, unlikePost } from '../firebase/firestore'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function PostPage() {
  const { postId } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const inputRef = useRef()

  useEffect(() => {
    getPost(postId).then(p => {
      if (p) {
        setPost(p)
        setLiked(p.likedBy?.includes(user?.uid))
        setLikes(p.likesCount || 0)
      }
      setLoading(false)
    })
    const unsub = subscribeToComments(postId, setComments)
    return unsub
  }, [postId, user])

  const handleLike = async () => {
    if (!user) return
    setLiked(l => !l)
    setLikes(n => liked ? n - 1 : n + 1)
    if (liked) await unlikePost(postId, user.uid)
    else await likePost(postId, user.uid)
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!text.trim() || !user) return
    setPosting(true)
    await addComment(postId, {
      text: text.trim(),
      authorId: user.uid,
      authorName: profile?.displayName || profile?.username || user.email,
      authorAvatar: profile?.avatarUrl || '',
    })
    setText('')
    setPosting(false)
    inputRef.current?.focus()
  }

  const handleDeleteComment = async (commentId) => {
    if (!user) return
    await deleteComment(postId, commentId, user.uid)
    toast.success('Comment deleted')
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
  if (!post) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)' }}>Post not found</div>

  const ts = post.createdAt?.toDate ? post.createdAt.toDate() : new Date()

  return (
    <div>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(15,15,26,.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: 4 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M13 4l-6 6 6 6"/></svg>
        </button>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600 }}>Post</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', minHeight: 'calc(100vh - 56px)' }}>
        {/* Media */}
        <div style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          {post.mediaUrls?.[0] ? (
            post.mediaType === 'video'
              ? <video src={post.mediaUrls[0]} controls style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block' }} />
              : <img src={post.mediaUrls[0]} alt="" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }} />
          ) : (
            <div style={{ fontSize: 80, color: 'var(--text3)' }}>📷</div>
          )}
        </div>

        {/* Comments panel */}
        <div style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 56px)', overflowY: 'hidden' }}>
          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <Link to={`/profile/${post.authorId}`} style={{ width: 36, height: 36, borderRadius: '50%', padding: 2, background: 'conic-gradient(var(--gold),var(--rose),var(--violet),var(--gold))', display: 'block', flexShrink: 0 }}>
              {post.authorAvatar
                ? <img src={post.authorAvatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid var(--bg2)', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid var(--bg2)', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{(post.authorName||'U').slice(0,2).toUpperCase()}</div>
              }
            </Link>
            <div style={{ flex: 1 }}>
              <Link to={`/profile/${post.authorId}`} style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{post.authorName}</Link>
              {post.location && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{post.location}</div>}
            </div>
          </div>

          {/* Caption */}
          {post.caption && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginRight: 6 }}>{post.authorName}</span>
              <span style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5 }}>{post.caption}</span>
            </div>
          )}

          {/* Comments list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {comments.length === 0 && (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No comments yet. Be the first!</div>
            )}
            {comments.map(c => {
              const cTime = c.createdAt?.toDate ? formatDistanceToNow(c.createdAt.toDate(), { addSuffix: true }) : ''
              return (
                <div key={c.id} style={{ display: 'flex', gap: 10, padding: '8px 16px', transition: 'background .12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Link to={`/profile/${c.authorId}`} style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: 'var(--text)', flexShrink: 0, textDecoration: 'none' }}>
                    {(c.authorName||'U').slice(0,2).toUpperCase()}
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginRight: 6 }}>{c.authorName}</span>
                    <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{c.text}</span>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{cTime}</div>
                  </div>
                  {(c.authorId === user?.uid || post.authorId === user?.uid) && (
                    <button onClick={() => handleDeleteComment(c.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16, padding: '0 4px', opacity: 0.6 }}>×</button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Actions + like count */}
          <div style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px 4px', gap: 4 }}>
              <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 10, color: liked ? 'var(--rose)' : 'var(--text2)', display: 'flex' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill={liked ? 'var(--rose)' : 'none'} stroke="currentColor" strokeWidth="1.7"><path d="M11 18s-7.5-5-7.5-10A4.5 4.5 0 0111 6.2 4.5 4.5 0 0118.5 8c0 5-7.5 10-7.5 10z"/></svg>
              </button>
              <button onClick={() => inputRef.current?.focus()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 10, color: 'var(--text2)', display: 'flex' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M2 5h18v11a1 1 0 01-1 1H6l-4 3V5z"/></svg>
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 10, color: 'var(--text2)', display: 'flex' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 3l16 8-16 8V3z"/><path d="M3 11h10"/></svg>
              </button>
            </div>
            <div style={{ padding: '0 16px 4px', fontSize: 13, fontWeight: 600 }}>{likes.toLocaleString()} likes</div>
            <div style={{ padding: '0 16px 12px', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {formatDistanceToNow(ts, { addSuffix: true })}
            </div>

            {/* Comment input */}
            <form onSubmit={handleComment} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
              <input
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Add a comment…"
                style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 20, padding: '8px 14px', fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-sans)', outline: 'none' }}
              />
              <button type="submit" disabled={!text.trim() || posting} style={{ background: 'none', border: 'none', color: text.trim() ? 'var(--gold)' : 'var(--text3)', fontSize: 13, fontWeight: 600, cursor: text.trim() ? 'pointer' : 'default' }}>
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

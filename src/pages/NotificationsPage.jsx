import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { subscribeToNotifications, markNotificationRead } from '../firebase/firestore'
import { formatDistanceToNow } from 'date-fns'

const ICONS = {
  like:    { emoji: '❤️', label: 'liked your post' },
  comment: { emoji: '💬', label: 'commented on your post' },
  follow:  { emoji: '✦',  label: 'started following you' },
  mention: { emoji: '@',  label: 'mentioned you' },
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToNotifications(user.uid, (data) => {
      setNotifs(data)
      setLoading(false)
    })
    return unsub
  }, [user])

  const handleRead = async (id) => {
    await markNotificationRead(user.uid, id)
    setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x))
  }

  return (
    <div>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(15,15,26,.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600 }}>Notifications</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
      ) : notifs.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
          <div style={{ fontSize: 15, color: 'var(--text2)' }}>No notifications yet</div>
        </div>
      ) : (
        notifs.map(n => {
          const meta = ICONS[n.type] || { emoji: '✦', label: 'did something' }
          const ts = n.createdAt?.toDate ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : ''
          return (
            <div key={n.id} onClick={() => handleRead(n.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 20px', borderBottom: '1px solid var(--border)',
                cursor: 'pointer', transition: 'background .12s',
                background: n.read ? 'transparent' : 'rgba(201,168,76,.05)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(201,168,76,.05)'}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {meta.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{n.fromName || 'Someone'} </span>
                <span style={{ fontSize: 14, color: 'var(--text2)' }}>{meta.label}</span>
                {n.preview && <span style={{ fontSize: 14, color: 'var(--text3)' }}> · "{n.preview}"</span>}
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{ts}</div>
              </div>
              {!n.read && <div style={{ width: 8, height: 8, background: 'var(--gold)', borderRadius: '50%', flexShrink: 0 }} />}
            </div>
          )
        })
      )}
    </div>
  )
}

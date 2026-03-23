import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getUserConversations, getOrCreateConversation,
  subscribeToMessages, sendMessage, getUserProfile
} from '../firebase/firestore'
import { formatDistanceToNow } from 'date-fns'

export default function MessagesPage() {
  const { convId: paramConvId } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [convos, setConvos] = useState([])
  const [activeConv, setActiveConv] = useState(paramConvId || null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [otherUser, setOtherUser] = useState(null)
  const [newRecipient, setNewRecipient] = useState('')
  const bottomRef = useRef()

  useEffect(() => {
    if (!user) return
    const unsub = getUserConversations(user.uid, setConvos)
    return unsub
  }, [user])

  useEffect(() => {
    if (!activeConv) return
    const unsub = subscribeToMessages(activeConv, (msgs) => {
      setMessages(msgs)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    })
    // Load other user info
    const conv = convos.find(c => c.id === activeConv)
    if (conv) {
      const otherId = conv.participants.find(p => p !== user.uid)
      if (otherId) getUserProfile(otherId).then(setOtherUser)
    }
    return unsub
  }, [activeConv, convos])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || !activeConv || !user) return
    await sendMessage(activeConv, {
      text: text.trim(),
      senderId: user.uid,
      senderName: profile?.displayName || 'Me',
    })
    setText('')
  }

  const startNewConvo = async () => {
    if (!newRecipient.trim() || !user) return
    // In production: search by username, get UID. Here we use UID directly.
    const convId = await getOrCreateConversation(user.uid, newRecipient.trim())
    setActiveConv(convId)
    navigate(`/messages/${convId}`)
    setNewRecipient('')
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: 'calc(100vh - 0px)' }}>
      {/* Conversations list */}
      <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg2)' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600 }}>Messages</span>
        </div>

        {/* New conversation */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}>
          <input
            value={newRecipient} onChange={e => setNewRecipient(e.target.value)}
            placeholder="Recipient UID…" onKeyDown={e => e.key === 'Enter' && startNewConvo()}
            style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 10, padding: '7px 12px', fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-sans)', outline: 'none' }}
          />
          <button onClick={startNewConvo} style={{ background: 'var(--gold)', border: 'none', borderRadius: 10, padding: '7px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#1a1000' }}>+</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {convos.length === 0 && (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No conversations yet</div>
          )}
          {convos.map(c => {
            const otherId = c.participants.find(p => p !== user.uid)
            const ts = c.lastMessageAt?.toDate ? formatDistanceToNow(c.lastMessageAt.toDate(), { addSuffix: true }) : ''
            return (
              <div key={c.id} onClick={() => { setActiveConv(c.id); navigate(`/messages/${c.id}`); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                  cursor: 'pointer', transition: 'background .12s',
                  background: activeConv === c.id ? 'var(--bg4)' : 'transparent',
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={e => { if (activeConv !== c.id) e.currentTarget.style.background = 'var(--bg3)' }}
                onMouseLeave={e => { if (activeConv !== c.id) e.currentTarget.style.background = 'transparent' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text)', flexShrink: 0 }}>{(otherId||'U').slice(0,2).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{otherId}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage || 'No messages yet'}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>{ts}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chat */}
      {activeConv ? (
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg2)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
              {(otherUser?.displayName || 'U').slice(0,2).toUpperCase()}
            </div>
            <span style={{ fontWeight: 600 }}>{otherUser?.displayName || otherUser?.username || 'Unknown'}</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map(m => {
              const isMe = m.senderId === user.uid
              const ts = m.createdAt?.toDate ? formatDistanceToNow(m.createdAt.toDate(), { addSuffix: true }) : ''
              return (
                <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '70%', padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isMe ? 'var(--gold)' : 'var(--bg4)',
                    color: isMe ? '#1a1000' : 'var(--text)',
                    fontSize: 14, lineHeight: 1.5,
                  }}>
                    {m.text}
                    <div style={{ fontSize: 10, opacity: .6, marginTop: 4, textAlign: 'right' }}>{ts}</div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
            <input
              value={text} onChange={e => setText(e.target.value)}
              placeholder="Message…"
              style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 24, padding: '10px 16px', fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-sans)', outline: 'none' }}
            />
            <button type="submit" style={{ background: 'var(--gold)', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#1a1000"><path d="M2 2l12 6-12 6V2z"/><path d="M2 8h8" stroke="#1a1000" strokeWidth="1.5"/></svg>
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text2)' }}>Select a conversation</div>
          <div style={{ fontSize: 14, marginTop: 6 }}>or start a new one above</div>
        </div>
      )}
    </div>
  )
}

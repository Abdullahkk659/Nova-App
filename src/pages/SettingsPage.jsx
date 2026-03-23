import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout } from '../firebase/auth'
import { changePassword } from '../firebase/auth'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [changingPw, setChangingPw] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const handleChangePw = async (e) => {
    e.preventDefault()
    if (newPw.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setChangingPw(true)
    try {
      await changePassword(currentPw, newPw)
      toast.success('Password updated!')
      setCurrentPw(''); setNewPw('')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setChangingPw(false)
    }
  }

  const Section = ({ title, children }) => (
    <div className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 600, color: 'var(--text2)' }}>{title}</div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  )

  return (
    <div>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(15,15,26,.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600 }}>Settings</span>
      </div>

      <div style={{ padding: '24px 24px', maxWidth: 560 }}>
        <Section title="Account">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text3)' }}>Email</span>
              <span style={{ color: 'var(--text2)' }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text3)' }}>Username</span>
              <span style={{ color: 'var(--text2)' }}>@{profile?.username}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text3)' }}>Member since</span>
              <span style={{ color: 'var(--text2)' }}>{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '—'}</span>
            </div>
          </div>
        </Section>

        <Section title="Change password">
          <form onSubmit={handleChangePw} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input className="input" type="password" placeholder="Current password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} style={{ height: 40 }} />
            <input className="input" type="password" placeholder="New password (min. 6 chars)" value={newPw} onChange={e => setNewPw(e.target.value)} style={{ height: 40 }} />
            <button type="submit" className="btn btn-outline" style={{ alignSelf: 'flex-end', padding: '8px 18px', fontSize: 13 }} disabled={changingPw}>
              {changingPw ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </Section>

        <Section title="Notifications">
          {['Likes', 'Comments', 'New followers', 'Direct messages'].map(label => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: 'var(--text2)' }}>{label}</span>
              <div style={{ width: 40, height: 22, background: 'var(--gold)', borderRadius: 11, position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', position: 'absolute', right: 3, top: 3 }} />
              </div>
            </div>
          ))}
        </Section>

        <Section title="Danger zone">
          <button className="btn btn-danger" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center' }}>
            Log out
          </button>
        </Section>
      </div>
    </div>
  )
}

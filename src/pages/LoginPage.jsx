import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginWithEmail, loginWithGoogle } from '../firebase/auth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await loginWithEmail(email, password)
      navigate('/')
    } catch (err) {
      toast.error(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate('/')
    } catch (err) {
      toast.error(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 52, fontWeight: 700, fontStyle: 'italic', background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Nova</div>
          <div style={{ fontSize: 14, color: 'var(--text3)', marginTop: 4 }}>Share your world</div>
        </div>

        <div className="card" style={{ padding: '28px 28px' }}>
          <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: 4 }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button onClick={handleGoogle} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '10px', gap: 8 }} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.6 9.2l-.1-1.8H9v3.4h4.8C13.6 12 13 13 12 13.6v2.2h3a8.8 8.8 0 002.6-6.6z"/><path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-3-2.2a5.4 5.4 0 01-8-2.9H1V13a9 9 0 008 5z"/><path fill="#FBBC05" d="M4 10.7a5.4 5.4 0 010-3.4V5H1a9 9 0 000 8l3-2.3z"/><path fill="#EA4335" d="M9 3.6c1.3 0 2.5.4 3.4 1.3L15 2.3A9 9 0 001 5l3 2.4a5.4 5.4 0 015-3.8z"/></svg>
            Continue with Google
          </button>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text3)' }}>
            No account? <Link to="/register" style={{ color: 'var(--gold)', fontWeight: 500 }}>Sign up</Link>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13 }}>
            <Link to="/forgot-password" style={{ color: 'var(--text3)' }}>Forgot password?</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerWithEmail, loginWithGoogle } from '../firebase/auth'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ displayName: '', username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleRegister = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (form.username.length < 3) { toast.error('Username must be at least 3 characters'); return }
    setLoading(true)
    try {
      await registerWithEmail(form.email, form.password, form.username, form.displayName)
      toast.success('Welcome to Nova! ✦')
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
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 48, fontWeight: 700, fontStyle: 'italic', background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Nova</div>
          <div style={{ fontSize: 14, color: 'var(--text3)', marginTop: 4 }}>Create your account</div>
        </div>

        <div className="card" style={{ padding: '28px 28px' }}>
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input className="input" placeholder="Full name" value={form.displayName} onChange={set('displayName')} required autoFocus />
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 14 }}>@</span>
              <input className="input" placeholder="username" value={form.username} onChange={set('username')} required style={{ paddingLeft: 28 }} />
            </div>
            <input className="input" type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
            <input className="input" type="password" placeholder="Password (min. 6 chars)" value={form.password} onChange={set('password')} required />
            <button type="submit" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', padding: 11, marginTop: 4 }} disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button onClick={handleGoogle} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: 10, gap: 8 }} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.6 9.2l-.1-1.8H9v3.4h4.8C13.6 12 13 13 12 13.6v2.2h3a8.8 8.8 0 002.6-6.6z"/><path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-3-2.2a5.4 5.4 0 01-8-2.9H1V13a9 9 0 008 5z"/><path fill="#FBBC05" d="M4 10.7a5.4 5.4 0 010-3.4V5H1a9 9 0 000 8l3-2.3z"/><path fill="#EA4335" d="M9 3.6c1.3 0 2.5.4 3.4 1.3L15 2.3A9 9 0 001 5l3 2.4a5.4 5.4 0 015-3.8z"/></svg>
            Sign up with Google
          </button>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text3)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 500 }}>Sign in</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
          By signing up you agree to our <span style={{ color: 'var(--gold)' }}>Terms of Service</span> and <span style={{ color: 'var(--gold)' }}>Privacy Policy</span>
        </div>
      </div>
    </div>
  )
}

import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout } from '../firebase/auth'
import toast from 'react-hot-toast'

const NavIcon = ({ to, title, children, badge }) => (
  <NavLink to={to} title={title} style={{ textDecoration: 'none' }}>
    {({ isActive }) => (
      <div style={{
        width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', transition: 'all .15s',
        color: isActive ? 'var(--gold)' : 'var(--text3)',
        background: isActive ? 'var(--bg4)' : 'transparent',
        border: `1px solid ${isActive ? 'var(--border2)' : 'transparent'}`,
        position: 'relative',
      }}>
        {children}
        {badge && (
          <span style={{
            position: 'absolute', top: 8, right: 8, width: 8, height: 8,
            background: 'var(--rose)', borderRadius: '50%',
            border: '2px solid var(--bg)',
          }} />
        )}
      </div>
    )}
  </NavLink>
)

export default function IconNav() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const initials = profile?.displayName?.slice(0,2).toUpperCase() || 'ME'

  return (
    <nav style={{
      background: 'var(--bg)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 0', gap: 4,
    }}>
      <div style={{
        fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700,
        background: 'var(--grad)', WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent', marginBottom: 16, letterSpacing: '-0.5px',
      }}>N</div>

      <NavIcon to="/" title="Home">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 8.5L10 2l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><path d="M7 18V12h6v6"/></svg>
      </NavIcon>
      <NavIcon to="/explore" title="Explore">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="9" cy="9" r="6"/><path d="M15 15l3 3"/></svg>
      </NavIcon>
      <div title="New Post" style={{
        width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', color: 'var(--text3)',
        transition: 'all .15s',
      }}
        onClick={() => document.dispatchEvent(new CustomEvent('nova:open-post-modal'))}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text3)'; }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="14" height="14" rx="3"/><path d="M10 7v6M7 10h6"/></svg>
      </div>
      <NavIcon to="/notifications" title="Notifications" badge>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M10 2a6 6 0 016 6c0 3 1.5 5 2 6H2c.5-1 2-3 2-6a6 6 0 016-6z"/><path d="M8 17a2 2 0 004 0"/></svg>
      </NavIcon>
      <NavIcon to="/messages" title="Messages" badge>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M2 4h16v10a2 2 0 01-2 2H4a2 2 0 01-2-2z"/><path d="M2 4l8 7 8-7"/></svg>
      </NavIcon>
      <NavIcon to="/saved" title="Saved">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5 3h10a1 1 0 011 1v13l-6-4-6 4V4a1 1 0 011-1z"/></svg>
      </NavIcon>

      <div style={{ flex: 1 }} />

      <NavIcon to="/settings" title="Settings">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10" cy="10" r="2.5"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.9 4.9l1.4 1.4M13.7 13.7l1.4 1.4M4.9 15.1l1.4-1.4M13.7 6.3l1.4-1.4"/></svg>
      </NavIcon>
      <NavLink to={`/profile/${user?.uid}`} title="Profile" style={{ textDecoration: 'none', marginTop: 4 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--grad)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#1a1000', cursor: 'pointer',
        }}>{initials}</div>
      </NavLink>
    </nav>
  )
}

export default function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 20,
    }}>
      <div style={{
        fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 700, fontStyle: 'italic',
        background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>Nova</div>
      <div className="spinner" />
    </div>
  )
}

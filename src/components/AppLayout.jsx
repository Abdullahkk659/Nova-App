import { Outlet } from 'react-router-dom'
import IconNav from './IconNav'
import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'

export default function AppLayout() {
  return (
    <div className="app-layout">
      <IconNav />
      <LeftPanel />
      <main style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
      <RightPanel />
    </div>
  )
}

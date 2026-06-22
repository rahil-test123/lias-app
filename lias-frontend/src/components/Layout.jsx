import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Fine barre d'accent en haut */}
        <div style={{ height: 2, background: 'var(--accent)', flexShrink: 0 }} />
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-7 max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

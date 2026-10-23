import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="app-layout flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {menuOpen && <button className="sidebar-overlay" aria-label="Fermer la navigation" onClick={() => setMenuOpen(false)} />}
      <div className={`sidebar-shell ${menuOpen ? 'mobile-open' : ''}`} onClick={e => { if(e.target.closest('a')) setMenuOpen(false) }}><Sidebar /></div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="mobile-toolbar"><span>LIAS · Espace laboratoire</span><button className="btn-secondary" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={18} /> : <Menu size={18} />} Menu</button></div>
        {/* Fine barre d'accent en haut */}
        <div style={{ height: 2, background: 'var(--accent)', flexShrink: 0 }} />
        <main className="flex-1 overflow-y-auto">
          <div className="workspace-content px-8 py-7 max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, Calendar,
  ClipboardList, Bell, History, FileText,
  FolderOpen, FlaskConical, LogOut, Package, UsersRound,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/membres',       icon: Users,            label: 'Membres'         },
  { to: '/equipes',       icon: UsersRound,       label: 'Équipes'         },
  { to: '/publications',  icon: BookOpen,         label: 'Publications'    },
  { to: '/evenements',    icon: Calendar,         label: 'Événements'      },
  { to: '/materiels',     icon: Package,          label: 'Matériels'       },
  { to: '/notifications', icon: Bell,             label: 'Notifications'   },
  { to: '/mon-profil',    icon: Users,            label: 'Mon profil'      },
]

const NAV_ADMIN = [
  { to: '/adhesions',  icon: ClipboardList, label: 'Adhésions'  },
  { to: '/historique', icon: History,       label: 'Historique' },
  { to: '/rapports',   icon: FileText,      label: 'Rapports'   },
  { to: '/documents',  icon: FolderOpen,    label: 'Documents'  },
]

const ROLE_LABEL = {
  ROLE_ADMIN:     'Administrateur',
  ROLE_DIRECTEUR: 'Directeur',
  ROLE_MEMBRE:    'Membre chercheur',
  ROLE_DOCTORANT: 'Doctorant',
}

export default function Sidebar() {
  const { user, logout, isAdmin, isDirecteur } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user
    ? `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase()
    : '?'

  return (
    <aside
      className="flex flex-col h-full select-none shrink-0"
      style={{
        width: 232,
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid var(--sidebar-border)' }}
      >
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 32, height: 32,
            background: 'var(--accent)',
            borderRadius: 6,
          }}
        >
          <FlaskConical size={17} className="text-white" strokeWidth={1.8} />
        </div>
        <div>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#FAFAF8',
            letterSpacing: '-.02em',
            lineHeight: 1,
          }}>
            LIAS
          </p>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '.58rem',
            color: 'rgba(255,255,255,.28)',
            marginTop: 3,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
          }}>
            Laboratoire Informatique
          </p>
        </div>
      </div>

      {/* ── Navigation principale ── */}
      <nav className="flex-1 overflow-y-auto py-4" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <p className="sidebar-section-label px-5 pb-2 pt-1">Navigation</p>

        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
            style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem' }}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={15}
                  strokeWidth={isActive ? 2 : 1.6}
                  className="shrink-0"
                />
                <span style={{ fontSize: '.82rem' }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* ── Administration ── */}
        {(isAdmin || isDirecteur) && (
          <>
            <div
              className="mx-5 my-3"
              style={{ borderTop: '1px solid var(--sidebar-border)' }}
            />
            <p className="sidebar-section-label px-5 pb-2">Administration</p>

            {NAV_ADMIN.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-link-active' : ''}`
                }
                style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem' }}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={15}
                      strokeWidth={isActive ? 2 : 1.6}
                      className="shrink-0"
                    />
                    <span style={{ fontSize: '.82rem' }}>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* ── Bloc utilisateur ── */}
      <div
        className="px-4 py-4"
        style={{ borderTop: '1px solid var(--sidebar-border)' }}
      >
        {/* Infos utilisateur */}
        <div
          className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded"
          style={{ background: 'rgba(255,255,255,.04)', borderRadius: 6 }}
        >
          <div
            className="flex items-center justify-center shrink-0 text-white font-semibold"
            style={{
              width: 30, height: 30,
              background: 'var(--accent)',
              borderRadius: '50%',
              fontSize: '.72rem',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '.02em',
            }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p
              className="truncate text-white"
              style={{ fontFamily: 'var(--font-sans)', fontSize: '.78rem', fontWeight: 600, lineHeight: 1.3 }}
            >
              {user?.prenom} {user?.nom}
            </p>
            <p
              className="truncate"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '.58rem',
                color: 'rgba(255,255,255,.30)',
                letterSpacing: '.03em',
              }}
            >
              {ROLE_LABEL[user?.role] ?? user?.role}
            </p>
          </div>
        </div>

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-sm"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '.78rem',
            color: 'rgba(255,255,255,.30)',
            borderRadius: 6,
            transition: 'background var(--dur) var(--ease), color var(--dur) var(--ease)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(153,27,27,.18)'
            e.currentTarget.style.color = '#FCA5A5'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'rgba(255,255,255,.30)'
          }}
        >
          <LogOut size={13} strokeWidth={1.8} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}

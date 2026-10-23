import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
const HomePage = lazy(() => import('./pages/public/HomePage'))
const ReunionsPage = lazy(() => import('./pages/reunions/ReunionsPage'))
const DossiersPage = lazy(() => import('./pages/membres/DossiersPage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const MembresPage = lazy(() => import('./pages/membres/MembresPage'))
const MembreDetailPage = lazy(() => import('./pages/membres/MembreDetailPage'))
const MonProfilPage = lazy(() => import('./pages/membres/MonProfilPage'))
const PublicationsPage = lazy(() => import('./pages/publications/PublicationsPage'))
const EvenementsPage = lazy(() => import('./pages/evenements/EvenementsPage'))
const EvenementDetailPage = lazy(() => import('./pages/evenements/EvenementDetailPage'))
const DocumentsPage = lazy(() => import('./pages/documents/DocumentsPage'))
const MaterielsPage = lazy(() => import('./pages/materiels/GestionStockPage'))
const AdhesionsPage = lazy(() => import('./pages/adhesions/AdhesionsPage'))
const RejoindreePage = lazy(() => import('./pages/adhesions/RejoindreePage'))
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'))
const RapportsPage = lazy(() => import('./pages/rapports/RapportsPage'))
const HistoriquePage = lazy(() => import('./pages/historique/HistoriquePage'))
const EquipesPage = lazy(() => import('./pages/equipes/EquipesPage'))
const EquipeDetailPage = lazy(() => import('./pages/equipes/EquipeDetailPage'))

export default function App() {
  return (
    <Suspense fallback={<div role="status" className="p-8">Chargement…</div>}>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/inscription" element={<RejoindreePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/rejoindre" element={<RejoindreePage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/reunions" element={<ReunionsPage />} />
          <Route path="/mon-profil" element={<MonProfilPage />} />
          <Route element={<ProtectedRoute roles={['ROLE_ADMIN']} />}><Route path="/utilisateurs" element={<DossiersPage />} /></Route>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/membres" element={<MembresPage />} />
          <Route path="/membres/:id" element={<MembreDetailPage />} />
          <Route path="/profil" element={<MonProfilPage />} />
          <Route path="/publications" element={<PublicationsPage />} />
          <Route path="/evenements" element={<EvenementsPage />} />
          <Route path="/evenements/:id" element={<EvenementDetailPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/materiels" element={<MaterielsPage />} />
          <Route element={<ProtectedRoute roles={['ROLE_ADMIN','ROLE_DIRECTEUR']} />}><Route path="/adhesions" element={<AdhesionsPage />} /></Route>
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route element={<ProtectedRoute roles={['ROLE_ADMIN','ROLE_DIRECTEUR']} />}><Route path="/rapports" element={<RapportsPage />} /></Route>
          <Route element={<ProtectedRoute roles={['ROLE_ADMIN','ROLE_DIRECTEUR']} />}><Route path="/historique" element={<HistoriquePage />} /></Route>
          <Route path="/equipes" element={<EquipesPage />} />
          <Route path="/equipes/:id" element={<EquipeDetailPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  )
}

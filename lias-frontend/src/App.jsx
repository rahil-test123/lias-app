import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardPage from './pages/dashboard/DashboardPage'
import MembresPage from './pages/membres/MembresPage'
import MembreDetailPage from './pages/membres/MembreDetailPage'
import MonProfilPage from './pages/membres/MonProfilPage'
import PublicationsPage from './pages/publications/PublicationsPage'
import EvenementsPage from './pages/evenements/EvenementsPage'
import EvenementDetailPage from './pages/evenements/EvenementDetailPage'
import DocumentsPage from './pages/documents/DocumentsPage'
import MaterielsPage from './pages/materiels/MaterielsPage'
import AdhesionsPage from './pages/adhesions/AdhesionsPage'
import RejoindreePage from './pages/adhesions/RejoindreePage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import RapportsPage from './pages/rapports/RapportsPage'
import HistoriquePage from './pages/historique/HistoriquePage'
import EquipesPage from './pages/equipes/EquipesPage'
import EquipeDetailPage from './pages/equipes/EquipeDetailPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/rejoindre" element={<RejoindreePage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/membres" element={<MembresPage />} />
          <Route path="/membres/:id" element={<MembreDetailPage />} />
          <Route path="/profil" element={<MonProfilPage />} />
          <Route path="/publications" element={<PublicationsPage />} />
          <Route path="/evenements" element={<EvenementsPage />} />
          <Route path="/evenements/:id" element={<EvenementDetailPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/materiels" element={<MaterielsPage />} />
          <Route path="/adhesions" element={<AdhesionsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/rapports" element={<RapportsPage />} />
          <Route path="/historique" element={<HistoriquePage />} />
          <Route path="/equipes" element={<EquipesPage />} />
          <Route path="/equipes/:id" element={<EquipeDetailPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

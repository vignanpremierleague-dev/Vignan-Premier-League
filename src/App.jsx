import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLogin     from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import Team           from './pages/Team'
import RulesPage      from './pages/RulesPage'
import SchedulesPage  from './pages/SchedulesPage'
import RegisterPage   from './pages/RegisterPage'
import ContactPage    from './pages/ContactPage'
import MainSite       from './MainSite'
import SiteBlockGate  from './components/SiteBlockGate'
import AuctionPortal  from './pages/AuctionPortal'

function ProtectedAdmin() {
  if (!localStorage.getItem('vpl_admin')) return <Navigate to="/admin" replace />
  return <AdminDashboard />
}

function ProtectedAdminAuction() {
  if (!localStorage.getItem('vpl_admin')) return <Navigate to="/admin" replace />
  return <AuctionPortal mode="host" />
}


export default function App() {
  console.log('VPL Auction App Loaded - Cache Break')
  return (
    <BrowserRouter>
      <SiteBlockGate>
        <Routes>
          <Route path="/"                element={<MainSite />} />
          <Route path="/team"            element={<Team />} />
          <Route path="/rules"           element={<RulesPage />} />
          <Route path="/schedule"        element={<SchedulesPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/contact"         element={<ContactPage />} />
          <Route path="/admin"           element={<AdminLogin />} />
          <Route path="/dboard"          element={<ProtectedAdmin />} />
          <Route path="/admin/auction"   element={<ProtectedAdminAuction />} />
          <Route path="/auction" element={<AuctionPortal mode="display" />} />
          <Route path="*"                element={<Navigate to="/" replace />} />
        </Routes>
      </SiteBlockGate>
    </BrowserRouter>
  )
}

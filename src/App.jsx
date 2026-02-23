import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLogin     from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import MainSite       from './MainSite'

function ProtectedAdmin() {
  if (!sessionStorage.getItem('vpl_admin_token')) return <Navigate to="/admin" replace />
  return <AdminDashboard />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                 element={<MainSite />} />
        <Route path="/admin"            element={<AdminLogin />} />
        <Route path="/admin/dashboard"  element={<ProtectedAdmin />} />
        {/* Catch-all → main site */}
        <Route path="*"                 element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

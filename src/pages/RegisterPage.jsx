import { ClipboardList } from 'lucide-react'
import Registration from '../components/Registration'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

export default function RegisterPage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0f0f0f',
      fontFamily: '"DM Sans",system-ui,sans-serif', color: '#efefef',
      display: 'flex', flexDirection: 'column',
    }}>
      <Navbar breadcrumb="Register" />

      <main style={{ flex: 1 }}>
        <Registration />
      </main>

      <Footer />
    </div>
  )
}

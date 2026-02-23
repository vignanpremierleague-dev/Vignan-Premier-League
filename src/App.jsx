import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import HowItWorks from './components/HowItWorks'
import Timeline from './components/Timeline'
import Rules from './components/Rules'
import Schedule from './components/Schedule'
import Prizes from './components/Prizes'
import Registration from './components/Registration'
import Terms from './components/Terms'
import Contact from './components/Contact'
import Footer from './components/Footer'
import EmberParticles from './components/EmberParticles'

function App() {
  return (
    <div className="relative min-h-screen bg-dark text-text-primary font-outfit">
      <EmberParticles />
      <Navbar />
      <main>
        <Hero />
        <About />
        <HowItWorks />
        <Timeline />
        <Rules />
        <Schedule />
        <Prizes />
        <Registration />
        <Terms />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App

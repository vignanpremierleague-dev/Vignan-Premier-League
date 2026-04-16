import { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import { fetchSiteSettings } from '../lib/adminApi'
import { UserRound, ShieldCheck } from 'lucide-react'

/* ── Data ──────────────────────────────────────────────────────────────────── */
const patrons = [
  {
    name: 'Dr. Lavu Rathaiah',
    title: 'Chairman',
    bio: 'Founder and Chairman of Vignan Group of Institutions. His four decades of dedication to higher education and holistic student development perfectly aligns with the vision of VPL.',
    img: '/chairman.jpg',
    accent: '#ffb800',
  },
  {
    name: 'Sri. L Sri Krishna Devarayalu',
    title: 'Vice Chairman',
    bio: 'Vice Chairman of Vignan Group. His deep commitment to progressive institutional policies and extracurricular excellence drives the spirit of VPL.',
    img: '/vicechairman.png',
    accent: '#ffb800',
  },
]

const leadership = [
  {
    name: 'Dr. Poonam Malakondaiah, IAS',
    title: 'Advisor',
    bio: "Distinguished IAS officer and University Advisor. Her administrative expertise and strong belief in sports for building character heavily supports VPL.",
    img: '/advisor.png',
    accent: '#ff6b22',
  },
  {
    name: 'Prof. Y. V. Daseswara Rao',
    title: 'Director',
    bio: 'Director of Vignan University. His philosophy of sports as a driver for discipline helped transform this tournament into a college-wide spectacle.',
    img: '/director.png',
    accent: '#ff6b22',
  },
]

const facultyMembers = [
  {
    name: 'Dr. Baddam Anil Kumar',
    title: 'Faculty Member',
    bio: "Senior Assistant Professor. His active involvement in the organising committee ensures that VPL upholds the highest standards of discipline and fair play.",
    img: '/faculty.jpeg',
    accent: '#ff6b22',
  },
  {
    name: 'Pastham Sreenu',
    title: 'Sports Coach',
    bio: 'Sports Coach at VFSTR. Holding PGDs in both Fitness Management and Yoga, his expertise ensures athletes in the VPL are fit, focused, and performing at their peak.',
    img: '/sportscoach.png',
    accent: '#ff6b22',
  },
]

const fallbackStudents = [
  { name: 'D. sai suraj', section: 'Student Coordinator' },
  { name: 'K.Revanth sai', section: 'Student Coordinator' },
  { name: 'K.Rohith kumar', section: 'Student Coordinator' },
  { name: 'M.Aravind Reddy', section: 'Student Coordinator' },
  { name: 'M.Harish', section: 'Student Coordinator' },
  { name: 'M. Sai Charan', section: 'Student Coordinator' },
  { name: 'M.v.janardhan', section: 'Student Coordinator' },
  { name: 'N.gagan', section: 'Student Coordinator' },
  { name: 'P.Sagar', section: 'Student Coordinator' },
  { name: 'Sk.Imam', section: 'Student Coordinator' },
  { name: 'T.Revanth Goud', section: 'Student Coordinator' },
]

/* ── Helpers ───────────────────────────────────────────────────────────────── */
function useFadeIn(delay = 0) {
  const [v, setV] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setV(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return v
}

function SectionDivider({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '24px 0 16px' }}>
      <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg,transparent,rgba(255,107,34,.5))' }} />
      <span style={{ fontFamily: '"Syne"', fontSize: '1.2rem', fontWeight: 900, letterSpacing: '.15em', textTransform: 'uppercase', color: '#ff6b22', whiteSpace: 'nowrap' }}>{text}</span>
      <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg,rgba(255,107,34,.5),transparent)' }} />
    </div>
  )
}

/* ── Person Card ───────────────────────────────────────────────────────────── */
function PersonCard({ person, index, delay = 100, large = false }) {
  const visible = useFadeIn(delay + index * 120)
  const [expanded, setExpanded] = useState(false)
  const acc = person.accent

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity .55s ease, transform .55s ease',
        borderRadius: 16,
        overflow: 'hidden',
        border: `1px solid ${acc === '#ffb800' ? 'rgba(255,184,0,.18)' : 'rgba(255,107,34,.15)'}`,
        background: acc === '#ffb800' ? 'rgba(20,14,6,.97)' : 'rgba(18,18,18,.94)',
        boxShadow: '0 4px 32px rgba(0,0,0,.45)',
      }}
    >
      {/* ── Desktop: side-by-side. Mobile: photo-top stacked ── */}
      <div className={`pc-inner ${large ? 'pc-large' : 'pc-regular'}`}>

        {/* PHOTO */}
        <div className={`pc-photo ${large ? 'pc-photo-large' : 'pc-photo-regular'}`}>
          <img
            src={person.img}
            alt={person.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 15%',
              display: 'block',
            }}
          />
        </div>

        {/* ACCENT BAR */}
        <div className="pc-accent" style={{ background: `linear-gradient(180deg,${acc},${acc === '#ffb800' ? '#ff6b22' : '#e63946'})` }} />

        {/* TEXT */}
        <div className="pc-text">
          <span style={{
            fontFamily: '"DM Sans"', fontSize: '.62rem', fontWeight: 800,
            letterSpacing: '.2em', textTransform: 'uppercase', color: acc,
          }}>{person.title}</span>

          <h3 style={{
            fontFamily: '"Syne"', fontWeight: 900, margin: '6px 0 0',
            lineHeight: 1.2, color: acc === '#ffb800' ? '#f5f0e8' : '#efefef',
            fontSize: large ? 'clamp(1.1rem,3vw,1.55rem)' : 'clamp(.95rem,2.5vw,1.28rem)',
          }}>{person.name}</h3>

          <div style={{ width: 30, height: 2, background: acc, borderRadius: 2, margin: '10px 0' }} />

          <p className="pc-bio" style={{
            fontFamily: '"DM Sans"', fontSize: '.84rem', color: '#bbb',
            lineHeight: 1.6, margin: 0,
          }}>{person.bio}</p>
        </div>
      </div>
    </div>
  )
}

/* ── Student Card ──────────────────────────────────────────────────────────── */
function StudentCard({ student, index }) {
  const visible = useFadeIn(700 + index * 55)
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity .4s ease, transform .4s ease',
        display: 'flex', alignItems: 'center', gap: 11,
        padding: '12px 14px',
        border: '1px solid rgba(255,255,255,.07)',
        borderRadius: 12,
        background: 'rgba(18,18,18,.88)',
        flex: '1 1 180px',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: 'rgba(255,107,34,.09)', border: '1px solid rgba(255,107,34,.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <UserRound size={14} color="#ff6b22" strokeWidth={2} />
        <ShieldCheck
          size={10}
          color="#ffb800"
          strokeWidth={2.1}
          style={{ position: 'absolute', right: -4, bottom: -4, background: '#141414', borderRadius: 999, padding: 1 }}
        />
      </div>
      <div>
        <p style={{ fontFamily: '"Syne"', fontSize: '.83rem', fontWeight: 700, color: '#efefef', margin: 0, lineHeight: 1.25 }}>{student.name}</p>
        <p style={{ fontFamily: '"DM Sans"', fontSize: '.65rem', fontWeight: 600, color: '#ff6b22', margin: '3px 0 0', letterSpacing: '.05em', textTransform: 'uppercase' }}>
          {student.section || student.role || [student.branch, student.section].filter(Boolean).join(' · ') || 'Student Coordinator'}
        </p>
      </div>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function Team() {
  const headVis = useFadeIn(50)
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetchSiteSettings().then(setSettings).catch(() => {})
  }, [])

  const students = (settings?.studentCoordinators?.length ? settings.studentCoordinators : fallbackStudents)
    .map((s) => ({
      name: s?.name || '',
      section: s?.section || s?.role || [s?.branch, s?.section].filter(Boolean).join(' · '),
      role: s?.role || '',
      branch: s?.branch || '',
    }))

  return (
    <div style={{
      minHeight: '100vh', background: '#070707',
      fontFamily: '"DM Sans",system-ui,sans-serif', color: '#efefef',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,184,0,.04) 0%,transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-8%', left: '-8%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,107,34,.04) 0%,transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar breadcrumb="Dignitaries" />

      <main style={{ flex: 1, maxWidth: 880, width: '100%', margin: '0 auto', padding: '44px 16px 60px', position: 'relative', zIndex: 1 }}>

        <div style={{
          opacity: headVis ? 1 : 0, transform: headVis ? 'none' : 'translateY(-14px)',
          transition: 'all .55s ease', textAlign: 'center', marginBottom: 44,
        }}>
          <h1 className="section-heading" style={{ color: '#d4d4d4', margin: '0 0 10px' }}>
            Dignitaries & Leadership
          </h1>
          <p style={{ color: '#bbb', fontSize: '.85rem', lineHeight: 1.7, maxWidth: 460, margin: '0 auto' }}>
            Guided by the distinguished leaders of Vignan University.
          </p>
          <div style={{ width: 40, height: 3, background: 'linear-gradient(90deg,#ffb800,#ff6b22)', borderRadius: 2, margin: '16px auto 0' }} />
        </div>

        <div className="sections-wrap" style={{ display: 'flex', flexDirection: 'column' }}>

          <section className="section-item" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionDivider text="Patrons" />
            <div className="section-cards" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 2 }}>
              {patrons.map((p, i) => <PersonCard key={p.name} person={p} index={i} delay={80} large />)}
            </div>
          </section>

          <section className="section-item" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionDivider text="Leadership" />
            <div className="section-cards" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 2 }}>
              {leadership.map((p, i) => <PersonCard key={p.name} person={p} index={i} delay={450} />)}
            </div>
          </section>

          <section className="section-item" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionDivider text="Faculty & Coaches" />
            <div className="section-cards" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 2 }}>
              {facultyMembers.map((p, i) => <PersonCard key={p.name} person={p} index={i} delay={650} />)}
            </div>
          </section>

          <section className="section-item" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionDivider text="Student Coordinators" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
              {students.map((s, i) => <StudentCard key={s.name} student={s} index={i} />)}
            </div>
          </section>

        </div>
      </main>

      <Footer />

      <style>{`
        /* ── Card inner — desktop: row ── */
        .pc-inner {
          display: flex;
          flex-direction: row;
          align-items: stretch;
        }

        /* Desktop photo sizes */
        .pc-photo { position: relative; flex-shrink: 0; overflow: hidden; background: #111; }
        .pc-photo-large   { width: 240px; min-height: 260px; }
        .pc-photo-regular { width: 190px; min-height: 210px; }

        /* Desktop gradient overlay */
        .pc-photo::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 60%, rgba(12,10,6,.7) 100%);
          pointer-events: none;
        }

        /* Accent bar */
        .pc-accent { width: 3px; flex-shrink: 0; }

        /* Section spacing — desktop */
        .section-item { margin-bottom: 36px; }
        .section-item:last-child { margin-bottom: 0; }

        /* Override global mobile section padding from index.css for this page */
        @media (max-width: 768px) {
          .section-item {
            padding-top: 0 !important;
            padding-bottom: 1 !important;
          }
          .section-item:last-child { margin-bottom: 0 !important; }
        }

        /* Text */
        .pc-text {
          flex: 1; min-width: 0;
          padding: 24px 26px;
          display: flex; flex-direction: column;
          justify-content: center;
        }

        /* ── Mobile overrides ≤ 600px ── */
        @media (max-width: 600px) {
          .pc-inner {
            flex-direction: column !important;
          }

          /* Tighten section spacing on mobile */
          .section-item { margin-bottom: 12px !important; }
          .section-cards { gap: 6px !important; }

          /* Image: full width, fixed height — shows the person clearly */
          .pc-photo-large,
          .pc-photo-regular {
            width: 100% !important;
            min-height: unset !important;
            height: 320px !important;
          }

          /* On mobile overlay fades from bottom so face stays clear */
          .pc-photo::after {
            background: linear-gradient(180deg, transparent 55%, rgba(12,10,6,.72) 100%) !important;
          }

          /* Accent bar becomes horizontal line  */
          .pc-accent {
            width: 100% !important;
            height: 2px !important;
          }

          /* Tighter text padding */
          .pc-text {
            padding: 16px 16px 18px !important;
            justify-content: flex-start !important;
          }

          /* Student grid: 2 per row */
          .student-card { flex: 1 1 calc(50% - 8px) !important; min-width: 130px; }
        }
      `}</style>
    </div>
  )
}

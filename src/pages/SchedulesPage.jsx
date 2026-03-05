import { Flame, Trophy, CalendarDays, Users, Swords, Shield, ScrollText, ArrowDown } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

/* ── Data: 10 Teams, 2 Groups (with dummy stats for Points Table) ── */
const teams = {
  A: [
    { name: 'Team 1', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    { name: 'Team 2', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    { name: 'Team 3', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    { name: 'Team 4', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    { name: 'Team 5', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
  ],
  B: [
    { name: 'Team 6', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    { name: 'Team 7', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    { name: 'Team 8', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    { name: 'Team 9', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    { name: 'Team 10', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
  ]
}

/* ── Data: League Stage (20 matches: 10 per group) ───────────────────────── */
const leagueMatches = [
  // Group A
  { id: 1, grp: 'A', t1: 'Team 1', t2: 'Team 2', date: 'TBD', time: 'TBD' },
  { id: 2, grp: 'A', t1: 'Team 3', t2: 'Team 4', date: 'TBD', time: 'TBD' },
  { id: 3, grp: 'A', t1: 'Team 5', t2: 'Team 1', date: 'TBD', time: 'TBD' },
  { id: 4, grp: 'A', t1: 'Team 2', t2: 'Team 3', date: 'TBD', time: 'TBD' },
  { id: 5, grp: 'A', t1: 'Team 4', t2: 'Team 5', date: 'TBD', time: 'TBD' },
  { id: 6, grp: 'A', t1: 'Team 1', t2: 'Team 3', date: 'TBD', time: 'TBD' },
  { id: 7, grp: 'A', t1: 'Team 2', t2: 'Team 4', date: 'TBD', time: 'TBD' },
  { id: 8, grp: 'A', t1: 'Team 3', t2: 'Team 5', date: 'TBD', time: 'TBD' },
  { id: 9, grp: 'A', t1: 'Team 1', t2: 'Team 4', date: 'TBD', time: 'TBD' },
  { id: 10, grp: 'A', t1: 'Team 2', t2: 'Team 5', date: 'TBD', time: 'TBD' },

  // Group B
  { id: 11, grp: 'B', t1: 'Team 6', t2: 'Team 7', date: 'TBD', time: 'TBD' },
  { id: 12, grp: 'B', t1: 'Team 8', t2: 'Team 9', date: 'TBD', time: 'TBD' },
  { id: 13, grp: 'B', t1: 'Team 10', t2: 'Team 6', date: 'TBD', time: 'TBD' },
  { id: 14, grp: 'B', t1: 'Team 7', t2: 'Team 8', date: 'TBD', time: 'TBD' },
  { id: 15, grp: 'B', t1: 'Team 9', t2: 'Team 10', date: 'TBD', time: 'TBD' },
  { id: 16, grp: 'B', t1: 'Team 6', t2: 'Team 8', date: 'TBD', time: 'TBD' },
  { id: 17, grp: 'B', t1: 'Team 7', t2: 'Team 9', date: 'TBD', time: 'TBD' },
  { id: 18, grp: 'B', t1: 'Team 8', t2: 'Team 10', date: 'TBD', time: 'TBD' },
  { id: 19, grp: 'B', t1: 'Team 6', t2: 'Team 9', date: 'TBD', time: 'TBD' },
  { id: 20, grp: 'B', t1: 'Team 7', t2: 'Team 10', date: 'TBD', time: 'TBD' },
]

/* ── Component: Match Table (Reverting to original design) ── */
function MatchTable({ label, accent, matches }) {
  return (
    <div className="sched-card sched-anim" style={{ marginBottom: 32 }}>
      {/* Stage header */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent, flexShrink: 0, boxShadow: `0 0 8px ${accent}80` }} />
        <span style={{ fontFamily: '"Syne",system-ui,sans-serif', fontWeight: 700, fontSize: '.88rem', color: accent }}>{label}</span>
      </div>

      {/* Desktop & Mobile Native Table */}
      <table className="sched-table" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"DM Sans",system-ui,sans-serif' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            {['Match', 'Team 1', '', 'Team 2', 'Date'].map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matches.map((m, mi) => (
            <tr key={mi} className="tbl-row">
              <td className="t-match">
                {m.type === 'final' ? 'Final' : m.type === 'knockout' ? `SF ${m.id}` : `M${m.id}`}
              </td>
              <td className="t-team">{m.t1}</td>
              <td className="t-vs">VS</td>
              <td className="t-team">{m.t2}</td>
              <td className="t-dt">TBD</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Component: Points Table ── */
function PointsTable({ label, accent, teamData }) {
  return (
    <div className="group-card">
      <div className="gc-header" style={{ borderBottom: `1px solid ${accent}40` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={18} color={accent} />
          <h3 style={{ fontFamily: '"Syne"', margin: 0, fontSize: '1.1rem', color: accent }}>{label}</h3>
        </div>
      </div>
      <div className="gc-body" style={{ padding: 0 }}>
        <table className="points-table" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"DM Sans",system-ui,sans-serif' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
              {['Team', 'P', 'W', 'L', 'Pts', 'NRR'].map((h, i) => (
                <th key={h} className={i === 0 ? 'th-left' : 'th-center'}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamData.map((t, i) => (
              <tr key={t.name} style={{ borderBottom: i < teamData.length - 1 ? '1px solid rgba(255,255,255,.03)' : 'none' }}>
                <td className="pt-team">
                  <span style={{ color: '#555', marginRight: 8, fontSize: '.7rem' }}>{i + 1}</span>
                  <span>{t.name}</span>
                </td>
                <td className="pt-p">{t.p}</td>
                <td className="pt-w">{t.w}</td>
                <td className="pt-l">{t.l}</td>
                <td className="pt-pts">{t.pts}</td>
                <td className="pt-nrr">{t.nrr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Component: Tournament Bracket (Tree) ── */
function TournamentBracket() {
  return (
    <div className="sched-anim bracket-wrapper">
      <div className="bracket-container">

        {/* Semi-Finals Column */}
        <div className="bracket-col">
          {/* SF 1 */}
          <div className="bracket-match">
            <div className="bm-label" style={{ color: '#ff3366' }}>Semi-Final 1</div>
            <div className="bm-team"><span className="seed">A1</span> Group A Winner</div>
            <div className="bm-team"><span className="seed">B2</span> Group B Runner-up</div>
            <div className="connector-h c-h-right" />
            <div className="connector-v c-v-down" />
          </div>

          {/* SF 2 */}
          <div className="bracket-match">
            <div className="bm-label" style={{ color: '#ff3366' }}>Semi-Final 2</div>
            <div className="bm-team"><span className="seed">B1</span> Group B Winner</div>
            <div className="bm-team"><span className="seed">A2</span> Group A Runner-up</div>
            <div className="connector-h c-h-right" />
            <div className="connector-v c-v-up" />
          </div>
        </div>

        {/* Finals Column */}
        <div className="bracket-col bracket-col-center">
          <div className="bracket-match bm-final">
            <div className="bm-label" style={{ color: '#ffb800', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Trophy size={14} color="#ffb800" /> Grand Finale
            </div>
            <div className="bm-team">Winner SF1</div>
            <div className="bm-team">Winner SF2</div>
            <div className="connector-h c-h-final" />
          </div>
        </div>

      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function SchedulesPage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#070707',
      fontFamily: '"DM Sans",system-ui,sans-serif', color: '#efefef',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <Navbar breadcrumb="Schedules" />

      {/* Decorative ambient blobs */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,107,34,.05) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,.04) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <main style={{ flex: 1, maxWidth: 960, width: '100%', margin: '0 auto', padding: '60px 20px 80px', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <div className="sched-anim" style={{ textAlign: 'center', marginBottom: 54 }}>
          <h1 style={{ fontFamily: '"Syne"', fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 900, lineHeight: 1.1, color: '#efefef', margin: '0 0 12px' }}>
            Tournament Fixtures
          </h1>
          <p style={{ color: '#bbb', fontSize: '.9rem', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
            10 Teams. 2 Groups. 23 Matches. One Champions Trophy. Check back after the auction for finalized dates and team names.
          </p>
          <div style={{ width: 40, height: 3, background: 'linear-gradient(90deg,#ff6b22,#ffb800)', borderRadius: 2, margin: '20px auto 0' }} />
        </div>

        {/* ── Groups Overview (Points Tables) ── */}
        <div className="sched-anim" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 50, animationDelay: '0.1s' }}>
          <PointsTable label="Group A Standings" accent="#ff6b22" teamData={teams.A} />
          <PointsTable label="Group B Standings" accent="#3b82f6" teamData={teams.B} />
        </div>

        <div className="sched-anim" style={{ marginTop: 24, animationDelay: '0.2s' }}>

          {/* League Stage View */}
          <div style={{ marginBottom: 60 }}>
            <h2 style={{ fontFamily: '"Syne"', fontSize: '1.8rem', color: '#efefef', margin: '0 0 24px', textAlign: 'center' }}>
              League Stage
            </h2>
            <MatchTable
              label="Group A Fixtures"
              accent="#ff6b22"
              matches={leagueMatches.filter(m => m.grp === 'A')}
            />
            <MatchTable
              label="Group B Fixtures"
              accent="#3b82f6"
              matches={leagueMatches.filter(m => m.grp === 'B')}
            />
          </div>

          {/* Knockout Stage View (Tournament Bracket Tree) */}
          <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.05)' }}>
            <h2 style={{ fontFamily: '"Syne"', fontSize: '1.8rem', color: '#ffb800', margin: '0 0 10px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Trophy size={24} color="#ffb800" /> Knockout Stage
            </h2>
            <TournamentBracket />
          </div>
        </div>

      </main>

      <Footer />

      {/* ── Styles ── */}
      <style>{`
        /* Animations */
        .sched-anim {
          animation: schedIn .5s cubic-bezier(.16,1,.3,1) both;
        }
        @keyframes schedIn {
          from { opacity: 0; transform: translateY(15px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Points Table Cards */
        .group-card {
          background: rgba(18,18,18,.8);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 16px;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }
        .gc-header { padding: 16px 20px; background: rgba(255,255,255,.015); }

        /* Match & Points Table Base Styles */
        .sched-card {
          background: rgba(18,18,18,.92);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px;
          overflow: hidden;
        }
        .sched-table { display: table; width: 100%; font-size: 0.9rem; }
        .points-table { width: 100%; font-size: 0.9rem; }
        .tbl-row:not(:last-child) { border-bottom: 1px solid rgba(255,255,255,.04); }
        .tbl-row:hover { background: rgba(255,255,255,.02); }

        /* Typography & Padding (Desktop) */
        th { color: #8a8a8a; font-weight: 600; font-size: 0.90rem; text-transform: uppercase; letter-spacing: .08em; padding: 12px 18px; text-align: left; }
        .th-center { text-align: center; }
        .th-left { text-align: left; }

        /* Sched Cells */
        td { padding: 13px 18px; }
        .t-match { font-weight: 600; color: #d2d2d2; }
        .t-team  { color: #aaaaaa; }
        .t-dt    { color: #f5a100; font-weight: 600; font-size: 0.9rem; }
        .t-vs    { color: #ff6b22; font-weight: 800; font-size: 0.9rem; text-align: center; padding: 8px 6px; }
        
        /* Points Cells */
        .pt-team { font-weight: 600; color: #efefef; white-space: nowrap; }
        .pt-p    { text-align: center; color: #aaa; }
        .pt-w    { text-align: center; color: #4ade80; }
        .pt-l    { text-align: center; color: #f87171; }
        .pt-pts  { text-align: center; color: #ffb800; font-weight: 700; }
        .pt-nrr  { text-align: center; color: #888; font-size: .9rem; }

        /* Bracket Tree Styles */
        .bracket-wrapper {
          width: 100%; overflow-x: auto; padding: 40px 20px;
        }
        .bracket-container {
          display: flex; align-items: center; justify-content: center; gap: 80px;
          min-width: max-content; margin: 0 auto;
        }
        .bracket-col {
          display: flex; flex-direction: column; gap: 80px; position: relative;
        }
        .bracket-match {
          background: rgba(18,18,18,.95); border: 1px solid rgba(255,255,255,.06);
          border-radius: 16px; width: 340px; position: relative; z-index: 2;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.6);
        }
        /* Glowing Final focus */
        .bm-final {
          border-color: rgba(255,184,0,0.3);
          box-shadow: 0 10px 40px -10px rgba(255,184,0,0.15);
        }
        
        .bm-label {
          background: rgba(255,255,255,.015); padding: 12px 18px;
          font-family: "Syne"; font-size: .85rem; font-weight: 800; text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,.04); letter-spacing: .1em;
          display: flex; align-items: center; justify-content: space-between;
          white-space: nowrap;
        }
        .bm-team {
          padding: 16px 18px; font-family: "DM Sans"; font-size: 1.05rem; color: #efefef; font-weight: 600;
          display: flex; align-items: center;
        }
        .bm-team:first-of-type { border-bottom: 1px solid rgba(255,255,255,.04); }
        .seed { 
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; background: rgba(255,255,255,.08); 
          border-radius: 6px; font-size: .75rem; color: #bbb; margin-right: 12px; font-weight: 700;
        }

        /* ── Animated Golden Aura Connectors ── */
        .connector-h, .connector-v {
          position: absolute; background: rgba(255,255,255,.06); overflow: hidden;
          border-radius: 2px; z-index: 1;
        }
        .connector-h::after, .connector-v::after {
          content: ''; position: absolute; inset: 0;
          box-shadow: 0 0 12px rgba(255,184,0,0.8);
        }
        
        .c-h-right { right: -40px; top: 50%; width: 40px; height: 4px; transform: translateY(-50%); }
        .c-v-down  { right: -40px; top: 50%; width: 4px; height: calc(50% + 40px + 2px); }
        .c-v-up    { right: -40px; bottom: 50%; width: 4px; height: calc(50% + 40px + 2px); }
        .c-h-final { left: -40px; top: 50%; width: 40px; height: 4px; transform: translateY(-50%); }

        .c-h-right::after { background: linear-gradient(90deg, transparent, #ffb800, #fff); animation: flowH_SF 2.4s linear infinite; }
        .c-v-down::after  { background: linear-gradient(180deg, transparent, #ffb800, #fff); animation: flowV_Down 2.4s linear infinite; }
        .c-v-up::after    { background: linear-gradient(0deg, transparent, #ffb800, #fff); animation: flowV_Up 2.4s linear infinite; }
        .c-h-final::after { background: linear-gradient(90deg, transparent, #ffb800, #fff); animation: flowH_Final 2.4s linear infinite; }
        
        @keyframes flowH_SF {
          0%   { transform: translateX(-100%); opacity: 0; }
          2%   { transform: translateX(-100%); opacity: 1; }
          25%  { transform: translateX(100%); opacity: 1; }
          27%  { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(100%); opacity: 0; }
        }

        @keyframes flowV_Down {
          0%   { transform: translateY(-100%); opacity: 0; }
          23%  { transform: translateY(-100%); opacity: 0; }
          25%  { transform: translateY(-100%); opacity: 1; }
          65%  { transform: translateY(100%); opacity: 1; }
          67%  { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(100%); opacity: 0; }
        }

        @keyframes flowV_Up {
          0%   { transform: translateY(100%); opacity: 0; }
          23%  { transform: translateY(100%); opacity: 0; }
          25%  { transform: translateY(100%); opacity: 1; }
          65%  { transform: translateY(-100%); opacity: 1; }
          67%  { transform: translateY(-100%); opacity: 0; }
          100% { transform: translateY(-100%); opacity: 0; }
        }

        @keyframes flowH_Final {
          0%   { transform: translateX(-100%); opacity: 0; }
          63%  { transform: translateX(-100%); opacity: 0; }
          65%  { transform: translateX(-100%); opacity: 1; }
          90%  { transform: translateX(100%); opacity: 1; }
          92%  { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(100%); opacity: 0; }
        }

        /* Responsive Screen Scales */
        @media (max-width: 650px) {
          
          /* Scaled & Legible Mobile Tables */
          .sched-table, .points-table { font-size: 0.90rem; }
          th { padding: 12px 8px; font-size: 0.95rem; letter-spacing: 0; }
          td { padding: 12px 8px; }
          
          .t-vs { font-size: 0.7rem; padding: 6px 4px; }
          .pt-team, .t-team, .t-match { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 85px; }
          .t-dt { font-size: 0.9rem; }
          
          /* Vertical Stack Bracket on Mobile */
          .bracket-wrapper { padding: 20px 0; overflow-x: hidden; }
          .bracket-container { flex-direction: column-reverse; gap: 40px; min-width: auto; }
          
          /* Semis side-by-side */
          .bracket-col { flex-direction: row; gap: 12px; align-items: flex-start; width: 100%; justify-content: center; }
          
          .bracket-match { width: 50%; max-width: 160px; }
          .bm-final { width: 100%; max-width: 250px; }
          
          /* Prevent squash on small cards */
          .bm-label { font-size: 0.75rem; padding: 10px 8px; white-space: nowrap; }
          .bm-team { font-size: 0.85rem; padding: 12px 8px; flex-wrap: wrap; }
          .seed { width: 22px; height: 22px; font-size: .65rem; margin-right: 6px; }
          
          /* Golden Aura Flow Upwards to Final */
          .c-h-right, .c-h-final { display: none; }
          
          /* Drop lines from bottom of Final to top of both Semis */
          .c-v-down, .c-v-up { 
            display: block; left: 50%; right: auto; top: -40px; bottom: auto; 
            width: 4px; height: 40px; transform: translateX(-50%); 
            background: rgba(255,255,255,.06);
          }
          
          .c-v-down::after, .c-v-up::after { 
            background: linear-gradient(0deg, transparent, #ffb800, #fff); 
            animation: flowV_Up 2.4s linear infinite; 
          }
        }
      `}</style>
    </div>
  )
}

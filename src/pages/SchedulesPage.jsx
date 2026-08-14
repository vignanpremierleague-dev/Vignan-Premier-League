import { Flame, Trophy, CalendarDays, Users, Swords, Shield, ScrollText, ArrowDown } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

import { useEffect, useState, useRef } from 'react'
import { fetchSiteSettings } from '../lib/adminApi'

/* ── Default Fallback Data ── */
const defaultTeams = {
  A: [
    { name: 'Warriors', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    { name: 'Knights', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    { name: 'Marvels', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    { name: 'Thunderbolts', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    { name: 'Royals', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
  ],
  B: [
    { name: 'Lions', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    { name: 'Titans', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    { name: 'Panthers', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    { name: 'Gladiators', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
    { name: 'Dominators', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.000' },
  ]
}

const defaultLeagueMatches = [
  { id: 1,  grp: 'A', t1: 'Warriors',     t2: 'Knights',      date: 'Day 1',  time: 'TBD', status: 'UPCOMING' },
  { id: 2,  grp: 'B', t1: 'Lions',        t2: 'Titans',       date: 'Day 2',  time: 'TBD', status: 'UPCOMING' },
  { id: 3,  grp: 'A', t1: 'Marvels',      t2: 'Thunderbolts', date: 'Day 3',  time: 'TBD', status: 'UPCOMING' },
  { id: 4,  grp: 'B', t1: 'Panthers',     t2: 'Gladiators',   date: 'Day 4',  time: 'TBD', status: 'UPCOMING' },
  { id: 5,  grp: 'A', t1: 'Royals',       t2: 'Warriors',     date: 'Day 5',  time: 'TBD', status: 'UPCOMING' },
  { id: 6,  grp: 'B', t1: 'Dominators',   t2: 'Lions',        date: 'Day 6',  time: 'TBD', status: 'UPCOMING' },
  { id: 7,  grp: 'A', t1: 'Knights',      t2: 'Marvels',      date: 'Day 7',  time: 'TBD', status: 'UPCOMING' },
  { id: 8,  grp: 'B', t1: 'Titans',       t2: 'Panthers',     date: 'Day 8',  time: 'TBD', status: 'UPCOMING' },
  { id: 9,  grp: 'A', t1: 'Thunderbolts', t2: 'Royals',       date: 'Day 9',  time: 'TBD', status: 'UPCOMING' },
  { id: 10, grp: 'B', t1: 'Gladiators',   t2: 'Dominators',   date: 'Day 10', time: 'TBD', status: 'UPCOMING' },
  { id: 11, grp: 'A', t1: 'Marvels',      t2: 'Royals',       date: 'Day 11', time: 'TBD', status: 'UPCOMING' },
  { id: 12, grp: 'B', t1: 'Lions',        t2: 'Panthers',     date: 'Day 12', time: 'TBD', status: 'UPCOMING' },
  { id: 13, grp: 'A', t1: 'Warriors',     t2: 'Thunderbolts', date: 'Day 13', time: 'TBD', status: 'UPCOMING' },
  { id: 14, grp: 'B', t1: 'Titans',       t2: 'Gladiators',   date: 'Day 14', time: 'TBD', status: 'UPCOMING' },
  { id: 15, grp: 'A', t1: 'Knights',      t2: 'Royals',       date: 'Day 15', time: 'TBD', status: 'UPCOMING' },
  { id: 16, grp: 'B', t1: 'Panthers',     t2: 'Dominators',   date: 'Day 16', time: 'TBD', status: 'UPCOMING' },
  { id: 17, grp: 'A', t1: 'Marvels',      t2: 'Warriors',     date: 'Day 17', time: 'TBD', status: 'UPCOMING' },
  { id: 18, grp: 'B', t1: 'Lions',        t2: 'Gladiators',   date: 'Day 18', time: 'TBD', status: 'UPCOMING' },
  { id: 19, grp: 'A', t1: 'Knights',      t2: 'Thunderbolts', date: 'Day 19', time: 'TBD', status: 'UPCOMING' },
  { id: 20, grp: 'B', t1: 'Titans',       t2: 'Dominators',   date: 'Day 20', time: 'TBD', status: 'UPCOMING' }
]
const defaultKnockout = {
  qualifier1: { label: 'Qualifier 1', team1Seed: 'A1', team1Name: 'Pool A 1st', team2Seed: 'B1', team2Name: 'Pool B 1st' },
  eliminator: { label: 'Eliminator', team1Seed: 'A2', team1Name: 'Pool A 2nd', team2Seed: 'B2', team2Name: 'Pool B 2nd' },
  qualifier2: { label: 'Qualifier 2', team1Name: 'Loser Q1', team2Name: 'Winner Eliminator' },
  final: { label: 'Finals', team1Name: 'Winner Q1', team2Name: 'Winner Q2' },
}

/* ── Component: Match Cards (IPL Style) ── */
function MatchTable({ label, matches }) {
  const statusTone = (status) => {
    if (status === 'LIVE') return { bg: 'rgba(239,68,68,.16)', color: '#ef4444', border: 'rgba(239,68,68,.45)' }
    if (status === 'COMPLETED') return { bg: 'rgba(74,222,128,.16)', color: '#4ade80', border: 'rgba(74,222,128,.35)' }
    if (status === 'ABANDONED') return { bg: 'rgba(248,113,113,.16)', color: '#f87171', border: 'rgba(248,113,113,.35)' }
    return { bg: 'rgba(245,158,11,.16)', color: '#f5a100', border: 'rgba(245,158,11,.35)' }
  }

  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ padding: '8px 0 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff6b22', flexShrink: 0, boxShadow: `0 0 10px #ff6b2280` }} />
        <span style={{ fontFamily: '"Syne",system-ui,sans-serif', fontWeight: 800, fontSize: '1.05rem', color: '#ff6b22', textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
        {matches.map((m, i) => {
          const cardAccent = m.grp === 'A' ? '#ff6b22' : '#3b82f6'
          return (
            <div key={i} className="match-card">
              <div className="match-card-head" style={{ borderBottom: `1px solid ${cardAccent}30` }}>
                <span className="match-id" style={{ color: cardAccent }}>
                  {m.type === 'final' ? 'Final' : m.type === 'knockout' ? `SF ${m.id}` : `Pool ${m.grp} · Match ${m.id}`}
                </span>
                <span className="match-status" style={{ background: statusTone(m.status).bg, color: statusTone(m.status).color, borderColor: statusTone(m.status).border }}>
                  {m.status === 'LIVE' && <span className="live-dot" />}
                  {m.status === 'LIVE' ? 'Live' : m.status === 'COMPLETED' ? 'Ended' : m.status === 'ABANDONED' ? 'Abandoned' : 'Upcoming'}
                </span>
              </div>

              <div className="match-card-body">
                <div className="fixture-row">
                  <div className="fixture-team fixture-team-left">
                    <span className="team-pip" style={{ background: `${cardAccent}20`, borderColor: `${cardAccent}55`, color: cardAccent }}>1</span>
                    <span className="team-name">{m.t1}</span>
                  </div>

                  <span className="vs-pill" style={{ color: cardAccent, borderColor: `${cardAccent}45` }}>VS</span>

                  <div className="fixture-team fixture-team-right">
                    <span className="team-name">{m.t2}</span>
                    <span className="team-pip" style={{ background: `${cardAccent}20`, borderColor: `${cardAccent}55`, color: cardAccent }}>2</span>
                  </div>
                </div>
              </div>

              <div className="match-card-foot">
                {m.status === 'COMPLETED' || m.status === 'ABANDONED' ? (
                  <p className="match-result">
                    {m.result || (m.winner ? `${m.winner} won` : 'Match Ended')}
                  </p>
                ) : (
                  <div className="match-meta">
                    <span><CalendarDays size={14}/> {m.date}</span>
                    <span className="meta-dot">•</span>
                    <span>{m.time}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Component: Points Table ── */
function PointsTable({ label, accent, teamData = [] }) {
  const sortedTeamData = [...(teamData || [])].sort((a, b) => {
    // 1. Points (Pts) - Descending
    const ptsA = Number(a.pts) || 0
    const ptsB = Number(b.pts) || 0
    if (ptsB !== ptsA) return ptsB - ptsA

    // 2. Wins (W) - Descending
    const wA = Number(a.w) || 0
    const wB = Number(b.w) || 0
    if (wB !== wA) return wB - wA

    // 3. Net Run Rate (NRR) - Descending
    const nrrA = parseFloat(a.nrr) || 0
    const nrrB = parseFloat(b.nrr) || 0
    if (nrrB !== nrrA) return nrrB - nrrA

    // 4. Team Name (Alphabetical) - Ascending
    return (a.name || '').localeCompare(b.name || '')
  })

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
            {sortedTeamData.map((t, i) => (
              <tr key={t.name} style={{ borderBottom: i < sortedTeamData.length - 1 ? '1px solid rgba(255,255,255,.03)' : 'none' }}>
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
function FlowingConnector({ className, pathType, delayStr }) {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  let pathData = '';
  const { w, h } = size;
  const R = 16; // Curve radius

  if (w > 0 && h > 0) {
    if (pathType === 'q1-drop') {
      pathData = `M 0 0 L ${w - R} 0 Q ${w} 0 ${w} ${R} L ${w} ${h}`;
    } else if (pathType === 'elim-up') {
      pathData = `M 0 ${h} L ${w - R} ${h} Q ${w} ${h} ${w} ${h - R} L ${w} 0`;
    } else if (pathType === 'horizontal') {
      pathData = `M 0 ${h/2} L ${w} ${h/2}`;
    }
  }

  return (
    <div ref={ref} className={`c-base ${className}`}>
      {w > 0 && h > 0 && (
        <svg width="100%" height="100%" style={{ overflow: 'visible', position: 'absolute', top: 0, left: 0 }}>
          <path d={pathData} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
          <path 
            d={pathData} 
            fill="none" 
            stroke="#ffb800" 
            strokeWidth="8" 
            strokeDasharray="80 1000"
            style={{ animation: 'svgFlow 3s infinite linear', animationDelay: delayStr, filter: 'blur(4px)' }}
          />
          <path 
            d={pathData} 
            fill="none" 
            stroke="#fff" 
            strokeWidth="2" 
            strokeDasharray="80 1000"
            style={{ animation: 'svgFlow 3s infinite linear', animationDelay: delayStr }}
          />
        </svg>
      )}
    </div>
  );
}

function TournamentBracket({ knockout }) {
  return (
    <div className="sched-anim bracket-wrapper">
      <div className="bracket-container">

        {/* Qualifier 1 and Eliminator Column */}
        <div className="bracket-col">
          {/* Qualifier 1 */}
          <div className="bracket-match">
            <div className="bm-label" style={{ color: '#ff3366' }}>{knockout.qualifier1.label}</div>
            <div className="bm-team"><span className="seed">{knockout.qualifier1.team1Seed}</span> {knockout.qualifier1.team1Name}</div>
            <div className="bm-team"><span className="seed">{knockout.qualifier1.team2Seed}</span> {knockout.qualifier1.team2Name}</div>
            <FlowingConnector className="c-q1-q2" pathType="q1-drop" delayStr="0s" />
            <FlowingConnector className="c-q1-final" pathType="q1-drop" delayStr="1.5s" />
          </div>

          {/* Eliminator */}
          <div className="bracket-match">
            <div className="bm-label" style={{ color: '#3b82f6' }}>{knockout.eliminator.label}</div>
            <div className="bm-team"><span className="seed">{knockout.eliminator.team1Seed}</span> {knockout.eliminator.team1Name}</div>
            <div className="bm-team"><span className="seed">{knockout.eliminator.team2Seed}</span> {knockout.eliminator.team2Name}</div>
            <FlowingConnector className="c-elim-q2" pathType="elim-up" delayStr="0s" />
          </div>
        </div>

        {/* Qualifier 2 Column */}
        <div className="bracket-col bracket-col-center">
          <div className="bracket-match">
            <div className="bm-label" style={{ color: '#a855f7' }}>{knockout.qualifier2.label}</div>
            <div className="bm-team">{knockout.qualifier2.team1Name}</div>
            <div className="bm-team">{knockout.qualifier2.team2Name}</div>
            <FlowingConnector className="c-entry-q2" pathType="horizontal" delayStr="0.8s" />
            <FlowingConnector className="c-exit-q2" pathType="horizontal" delayStr="1.6s" />
          </div>
        </div>

        {/* Finals Column */}
        <div className="bracket-col bracket-col-center">
          <div className="bracket-match bm-final match-final">
            <div className="bm-label" style={{ color: '#ffb800', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Trophy size={14} color="#ffb800" /> {knockout.final.label}
            </div>
            <div className="bm-team">{knockout.final.team1Name}</div>
            <div className="bm-team">{knockout.final.team2Name}</div>
            
            <FlowingConnector className="c-entry-final" pathType="horizontal" delayStr="2.4s" />
          </div>
        </div>

      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function SchedulesPage() {
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetchSiteSettings().then(setSettings).catch(console.error)
  }, [])

  const teams = settings?.teams || defaultTeams
  const leagueMatches = settings?.leagueMatches || defaultLeagueMatches
  const knockout = {
    qualifier1: settings?.knockout?.qualifier1 || defaultKnockout.qualifier1,
    eliminator: settings?.knockout?.eliminator || defaultKnockout.eliminator,
    qualifier2: settings?.knockout?.qualifier2 || defaultKnockout.qualifier2,
    final: settings?.knockout?.final || defaultKnockout.final,
  }

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

      <main style={{ flex: 1, maxWidth: 1240, width: '100%', margin: '0 auto', padding: '60px 20px 80px', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <div className="sched-anim" style={{ textAlign: 'center', marginBottom: 54 }}>
          <h1 className="section-heading" style={{ color: '#efefef', margin: '0 0 12px' }}>
            Tournament Fixtures
          </h1>
          <p style={{ color: '#bbb', fontSize: '.9rem', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
            10 Teams. 2 Groups. 23 Matches. One Champions Trophy. The tournament runs across July - August, with finalized fixture dates and team names updated here.
          </p>
          <div style={{ width: 40, height: 3, background: 'linear-gradient(90deg,#ff6b22,#ffb800)', borderRadius: 2, margin: '20px auto 0' }} />
        </div>

        {/* ── Groups Overview (Points Tables) ── */}
        <div className="sched-anim" style={{ animationDelay: '0.1s' }}>
          <h2 style={{ fontFamily: '"Syne"', fontSize: '1.8rem', color: '#efefef', margin: '0 0 24px', textAlign: 'center' }}>
            Points Table
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 50 }}>
          <PointsTable label="Group A Standings" accent="#ff6b22" teamData={teams.A} />
          <PointsTable label="Group B Standings" accent="#3b82f6" teamData={teams.B} />
          </div>
        </div>

        <div className="sched-anim" style={{ marginTop: 24, animationDelay: '0.2s' }}>

          {/* League Stage View */}
          <div style={{ marginBottom: 60 }}>
            <h2 style={{ fontFamily: '"Syne"', fontSize: '1.8rem', color: '#efefef', margin: '0 0 24px', textAlign: 'center' }}>
              League Stage
            </h2>
            <MatchTable
              label="League Fixtures"
              matches={[...leagueMatches].sort((a, b) => a.id - b.id)}
            />
          </div>

          {/* Knockout Stage View (Tournament Bracket Tree) */}
          <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.05)' }}>
            <h2 style={{ fontFamily: '"Syne"', fontSize: '1.8rem', color: '#ffb800', margin: '0 0 10px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Trophy size={24} color="#ffb800" /> Knockout Stage
            </h2>
            <TournamentBracket knockout={knockout} />
          </div>
        </div>

      </main>

      <Footer />

      {/* ── Styles ── */}
      <style>{`
        /* Animations */
        @keyframes pulsate { 0% { opacity: .5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } 100% { opacity: .5; transform: scale(1); } }
        .sched-anim {
          animation: schedIn .5s cubic-bezier(.16,1,.3,1) both;
        }
        .match-card {
          background: #111214;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px;
          overflow: hidden;
          transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
        }
        .match-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,.14);
          box-shadow: 0 16px 30px rgba(0,0,0,.28);
        }
        .match-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 14px;
          background: rgba(255,255,255,.015);
        }
        .match-id {
          font-size: .72rem;
          text-transform: uppercase;
          letter-spacing: .09em;
          font-weight: 800;
          color: #9a9a9a;
        }
        .match-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid;
          border-radius: 999px;
          padding: 3px 10px;
          font-size: .66rem;
          text-transform: uppercase;
          letter-spacing: .08em;
          font-weight: 800;
        }
        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #ef4444;
          animation: pulsate 1.5s infinite;
        }
        .match-card-body {
          padding: 16px 14px;
        }
        .fixture-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .fixture-team {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          flex: 1;
        }
        .fixture-team-right {
          justify-content: flex-end;
        }
        .team-pip {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          border: 1px solid;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: .68rem;
          font-weight: 800;
          flex-shrink: 0;
        }
        .team-name {
          font-family: "Syne",system-ui,sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: #efefef;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .vs-pill {
          border: 1px solid;
          border-radius: 999px;
          padding: 4px 12px;
          font-size: .66rem;
          letter-spacing: .08em;
          font-weight: 800;
          flex-shrink: 0;
        }
        .match-card-foot {
          border-top: 1px solid rgba(255,255,255,.06);
          background: rgba(0,0,0,.16);
          min-height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 12px;
        }
        .match-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8f8f8f;
          font-size: .78rem;
          font-weight: 600;
        }
        .match-meta span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .meta-dot {
          color: #5f5f5f;
        }
        .match-result {
          margin: 0;
          color: #ffb800;
          font-size: .83rem;
          font-weight: 700;
          line-height: 1.4;
          text-align: center;
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

        /* ── Schedules Bracket ── */
        .bracket-wrapper {
          display: flex; flex-direction: column; width: 100%; 
          overflow-x: auto; -webkit-overflow-scrolling: touch;
          padding-bottom: 30px;
        }
        
        .bracket-wrapper::-webkit-scrollbar { height: 6px; }
        .bracket-wrapper::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .bracket-wrapper::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }

        .bracket-container {
          display: flex; align-items: center;
          gap: 60px; margin: 20px auto 0 auto; 
          padding: 20px; width: max-content;
        }
        .bracket-col {
          display: flex; flex-direction: column; gap: 60px; position: relative;
        }
        .bracket-match {
          background: rgba(18,18,18,.95); border: 1px solid rgba(255,255,255,.06);
          border-radius: 16px; width: 290px; position: relative; z-index: 2;
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

        /* ── SVG Flowing Connectors ── */
        .c-base {
          position: absolute; z-index: 1; pointer-events: none;
        }

        .c-q1-q2 {
          left: 100%; top: 50%;
          width: 30px; height: calc(50% + 30px + 2px);
        }

        .c-elim-q2 {
          left: 100%; bottom: 50%;
          width: 30px; height: calc(50% + 30px + 2px);
        }

        .c-q1-final {
          left: 100%; top: 50%;
          width: 380px; height: calc(50% + 30px + 2px);
        }

        .c-entry-q2 {
          left: -30px; top: 50%;
          width: 30px; height: 4px;
          transform: translateY(-50%);
        }

        .c-exit-q2 {
          left: 100%; top: 50%;
          width: 30px; height: 4px;
          transform: translateY(-50%);
        }

        .c-entry-final {
          left: -30px; top: 50%;
          width: 30px; height: 4px;
          transform: translateY(-50%);
        }

        @keyframes svgFlow {
          from { stroke-dashoffset: 1080; }
          to { stroke-dashoffset: 0; }
        }

        /* Responsive Screen Scales */
        /* Responsive Screen Scales */
        @media (max-width: 1024px) {
          
          /* Scaled & Legible Mobile Tables */
          .sched-table, .points-table { font-size: 0.90rem; }
          th { padding: 12px 8px; font-size: 0.95rem; letter-spacing: 0; }
          td { padding: 12px 8px; }
          
          .t-vs { font-size: 0.7rem; padding: 6px 4px; }
          .pt-team, .t-team, .t-match { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 85px; }
          .t-dt { font-size: 0.9rem; }
          .team-name { font-size: 1rem; }
          .match-meta { font-size: .74rem; }
          
          /* Full Screen Design made Vertical */
          .bracket-wrapper { padding: 20px 0; overflow-x: hidden; }
          
          .bracket-container { 
            display: flex; flex-direction: column-reverse; align-items: center; 
            gap: 50px; margin: 0 auto; padding: 0; width: 100%; min-width: auto;
          }
          
          .bracket-col { 
            display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center; 
            align-items: center; width: 100%; gap: 30px; position: relative;
          }
          
          /* Force Q1 and Elim to stay side-by-side on small screens */
          .bracket-col:first-child { 
            flex-wrap: nowrap; gap: 12px; width: 100%; padding: 0 10px; box-sizing: border-box;
          }
          .bracket-col:first-child .bm-label { font-size: 0.65rem; padding: 6px; }
          .bracket-col:first-child .bm-team { font-size: 0.75rem; padding: 8px 6px; }
          .bracket-col:first-child .seed { width: 16px; height: 16px; font-size: 0.6rem; margin-right: 4px; line-height: 16px; }
          
          /* Identical Card Sizes to Desktop */
          .bracket-match { width: 100%; max-width: 290px; }
          .bm-final { transform: none; margin: 0; }
          
          /* Hide Desktop Connectors */
          .c-base { display: none !important; }
          
          /* Simple Vertical Hierarchy Lines */
          /* Line from Final down to Q2 */
          .bracket-col:nth-child(2)::before {
            content: ''; position: absolute;
            top: -40px; left: 50%; width: 2px; height: 30px;
            background: rgba(255,184,0,0.5); transform: translateX(-50%);
          }
          
          /* Line from Q2 down to Q1/Elim Fork */
          .bracket-col:nth-child(1)::before {
            content: ''; position: absolute;
            top: -40px; left: 50%; width: 2px; height: 30px;
            background: rgba(255,184,0,0.5); transform: translateX(-50%);
          }
          
          /* Perfect T-Junction Fork for Q1 and Elim */
          /* Q1 (Left) draws line from center to middle of the 12px gap */
          .bracket-col:nth-child(1) .bracket-match:nth-child(1)::before {
            content: ''; position: absolute;
            top: -10px; left: 50%; right: -6px; height: 2px;
            background: rgba(255,184,0,0.5);
          }
          .bracket-col:nth-child(1) .bracket-match:nth-child(1)::after {
            content: ''; position: absolute;
            top: -10px; left: 50%; width: 2px; height: 10px;
            background: rgba(255,184,0,0.5); transform: translateX(-50%);
          }
          
          /* Elim (Right) draws line from middle of 12px gap to its center */
          .bracket-col:nth-child(1) .bracket-match:nth-child(2)::before {
            content: ''; position: absolute;
            top: -10px; left: -6px; right: 50%; height: 2px;
            background: rgba(255,184,0,0.5);
          }
          .bracket-col:nth-child(1) .bracket-match:nth-child(2)::after {
            content: ''; position: absolute;
            top: -10px; left: 50%; width: 2px; height: 10px;
            background: rgba(255,184,0,0.5); transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}

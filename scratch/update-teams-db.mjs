import pg from 'pg'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const { Client } = pg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.join(__dirname, '..', '.env')

if (existsSync(envPath)) {
  const text = readFileSync(envPath, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const sep = line.indexOf('=')
    if (sep > 0) process.env[line.slice(0, sep).trim()] = line.slice(sep + 1).trim()
  }
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('Missing DATABASE_URL in environment.')
  process.exit(1)
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

const newTeams = {
  A: [
    { name: "Warriors", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" },
    { name: "Knights", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" },
    { name: "Marvels", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" },
    { name: "Thunderbolts", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" },
    { name: "Royals", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" }
  ],
  B: [
    { name: "Lions", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" },
    { name: "Titans", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" },
    { name: "Panthers", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" },
    { name: "Gladiators", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" },
    { name: "Dominators", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" }
  ]
}

const newLeagueMatches = [
  { id: 1,  grp: "A", t1: "Warriors",     t2: "Knights",      date: "Day 1",  time: "TBD", status: "UPCOMING" },
  { id: 2,  grp: "B", t1: "Lions",        t2: "Titans",       date: "Day 2",  time: "TBD", status: "UPCOMING" },
  { id: 3,  grp: "A", t1: "Marvels",      t2: "Thunderbolts", date: "Day 3",  time: "TBD", status: "UPCOMING" },
  { id: 4,  grp: "B", t1: "Panthers",     t2: "Gladiators",   date: "Day 4",  time: "TBD", status: "UPCOMING" },
  { id: 5,  grp: "A", t1: "Royals",       t2: "Warriors",     date: "Day 5",  time: "TBD", status: "UPCOMING" },
  { id: 6,  grp: "B", t1: "Dominators",   t2: "Lions",        date: "Day 6",  time: "TBD", status: "UPCOMING" },
  { id: 7,  grp: "A", t1: "Knights",      t2: "Marvels",      date: "Day 7",  time: "TBD", status: "UPCOMING" },
  { id: 8,  grp: "B", t1: "Titans",       t2: "Panthers",     date: "Day 8",  time: "TBD", status: "UPCOMING" },
  { id: 9,  grp: "A", t1: "Thunderbolts", t2: "Royals",       date: "Day 9",  time: "TBD", status: "UPCOMING" },
  { id: 10, grp: "B", t1: "Gladiators",   t2: "Dominators",   date: "Day 10", time: "TBD", status: "UPCOMING" },
  { id: 11, grp: "A", t1: "Marvels",      t2: "Royals",       date: "Day 11", time: "TBD", status: "UPCOMING" },
  { id: 12, grp: "B", t1: "Lions",        t2: "Panthers",     date: "Day 12", time: "TBD", status: "UPCOMING" },
  { id: 13, grp: "A", t1: "Warriors",     t2: "Thunderbolts", date: "Day 13", time: "TBD", status: "UPCOMING" },
  { id: 14, grp: "B", t1: "Titans",       t2: "Gladiators",   date: "Day 14", time: "TBD", status: "UPCOMING" },
  { id: 15, grp: "A", t1: "Knights",      t2: "Royals",       date: "Day 15", time: "TBD", status: "UPCOMING" },
  { id: 16, grp: "B", t1: "Panthers",     t2: "Dominators",   date: "Day 16", time: "TBD", status: "UPCOMING" },
  { id: 17, grp: "A", t1: "Marvels",      t2: "Warriors",     date: "Day 17", time: "TBD", status: "UPCOMING" },
  { id: 18, grp: "B", t1: "Lions",        t2: "Gladiators",   date: "Day 18", time: "TBD", status: "UPCOMING" },
  { id: 19, grp: "A", t1: "Knights",      t2: "Thunderbolts", date: "Day 19", time: "TBD", status: "UPCOMING" },
  { id: 20, grp: "B", t1: "Titans",       t2: "Dominators",   date: "Day 20", time: "TBD", status: "UPCOMING" }
]

async function run() {
  try {
    await client.connect()
    
    // Fetch current setting content
    const selectRes = await client.query("SELECT content FROM public.vpl_site_settings WHERE slug = 'primary'")
    if (selectRes.rows.length === 0) {
      console.log('No primary setting found to update.')
      return
    }

    const content = selectRes.rows[0].content
    content.teams = newTeams
    content.leagueMatches = newLeagueMatches

    // Update marquee message
    content.marqueeMessage = "🔥 VPL matches have started! Stay tuned for real-time scores, team standings, and league schedules. Let the games begin!"

    // Update T10 / 10 Over references in the DB settings content
    if (content.heroSubtitle) {
      content.heroSubtitle = content.heroSubtitle.replace(/T10/g, '8 Over')
    }
    if (Array.isArray(content.timelineEvents)) {
      content.timelineEvents = content.timelineEvents.map(event => {
        if (event && event.desc) {
          event.desc = event.desc.replace(/T10/g, '8 Over')
        }
        return event
      })
    }

    // Update back to DB
    await client.query(
      "UPDATE public.vpl_site_settings SET content = $1, updated_at = now() WHERE slug = 'primary'",
      [JSON.stringify(content)]
    )

    console.log('✅ Success! Overwrote teams and leagueMatches in public.vpl_site_settings.')
    console.log('Groups team count A:', content.teams.A.length, 'B:', content.teams.B.length)
    console.log('Matches count:', content.leagueMatches.length)
  } catch (err) {
    console.error('Database update failed:', err.message)
  } finally {
    await client.end()
  }
}

run()

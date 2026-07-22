/**
 * Merges missing fields (teams, leagueMatches) into the existing
 * vpl_site_settings row without overwriting anything already set.
 * Run: node patch-settings.mjs
 */
import pg from 'pg'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const { Client } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '.env')

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const sep = line.indexOf('=')
    if (sep > 0) process.env[line.slice(0, sep).trim()] = line.slice(sep + 1).trim()
  }
}

const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

const patch = {
  teams: {
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
  },
  leagueMatches: [
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
}

async function run() {
  try {
    await client.connect()
    // Merge patch into existing content using jsonb || operator (right side wins to overwrite fields)
    await client.query(
      `UPDATE public.vpl_site_settings
       SET content = content || $1::jsonb,
           updated_at = now()
       WHERE slug = 'primary'`,
      [JSON.stringify(patch)]
    )
    const { rows } = await client.query(`SELECT content FROM public.vpl_site_settings WHERE slug = 'primary'`)
    const c = rows[0]?.content
    console.log('✅  Patched! Keys now in content:', Object.keys(c || {}))
  } catch (err) {
    console.error('❌  Patch failed:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()

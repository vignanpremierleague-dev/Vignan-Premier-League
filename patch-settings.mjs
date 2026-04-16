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
      { name: "Team 1", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" },
      { name: "Team 2", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" },
      { name: "Team 3", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" },
      { name: "Team 4", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" },
      { name: "Team 5", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" }
    ],
    B: [
      { name: "Team 6", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" },
      { name: "Team 7", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" },
      { name: "Team 8", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" },
      { name: "Team 9", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" },
      { name: "Team 10", p: 0, w: 0, l: 0, pts: 0, nrr: "+0.000" }
    ]
  },
  leagueMatches: [
    { id: 1,  grp: "A", t1: "Team 1",  t2: "Team 2",  date: "TBD", time: "TBD" },
    { id: 2,  grp: "A", t1: "Team 3",  t2: "Team 4",  date: "TBD", time: "TBD" },
    { id: 3,  grp: "A", t1: "Team 5",  t2: "Team 1",  date: "TBD", time: "TBD" },
    { id: 4,  grp: "A", t1: "Team 2",  t2: "Team 3",  date: "TBD", time: "TBD" },
    { id: 5,  grp: "A", t1: "Team 4",  t2: "Team 5",  date: "TBD", time: "TBD" },
    { id: 6,  grp: "A", t1: "Team 1",  t2: "Team 3",  date: "TBD", time: "TBD" },
    { id: 7,  grp: "A", t1: "Team 2",  t2: "Team 4",  date: "TBD", time: "TBD" },
    { id: 8,  grp: "A", t1: "Team 3",  t2: "Team 5",  date: "TBD", time: "TBD" },
    { id: 9,  grp: "A", t1: "Team 1",  t2: "Team 4",  date: "TBD", time: "TBD" },
    { id: 10, grp: "A", t1: "Team 2",  t2: "Team 5",  date: "TBD", time: "TBD" },
    { id: 11, grp: "B", t1: "Team 6",  t2: "Team 7",  date: "TBD", time: "TBD" },
    { id: 12, grp: "B", t1: "Team 8",  t2: "Team 9",  date: "TBD", time: "TBD" },
    { id: 13, grp: "B", t1: "Team 10", t2: "Team 6",  date: "TBD", time: "TBD" },
    { id: 14, grp: "B", t1: "Team 7",  t2: "Team 8",  date: "TBD", time: "TBD" },
    { id: 15, grp: "B", t1: "Team 9",  t2: "Team 10", date: "TBD", time: "TBD" },
    { id: 16, grp: "B", t1: "Team 6",  t2: "Team 8",  date: "TBD", time: "TBD" },
    { id: 17, grp: "B", t1: "Team 7",  t2: "Team 9",  date: "TBD", time: "TBD" },
    { id: 18, grp: "B", t1: "Team 8",  t2: "Team 10", date: "TBD", time: "TBD" },
    { id: 19, grp: "B", t1: "Team 6",  t2: "Team 9",  date: "TBD", time: "TBD" },
    { id: 20, grp: "B", t1: "Team 7",  t2: "Team 10", date: "TBD", time: "TBD" }
  ]
}

async function run() {
  try {
    await client.connect()
    // Merge patch into existing content using jsonb || operator (right side wins only for missing keys)
    await client.query(
      `UPDATE public.vpl_site_settings
       SET content = $1::jsonb || content,
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

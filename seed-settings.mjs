/**
 * Seeds the vpl_site_settings table with default data.
 * Run: node seed-settings.mjs
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

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const defaultContent = {
  registrationsOpen: true,
  marqueeMessage: "🔥 Welcome to VPL 2025! Registrations are now LIVE! Secure your spot before slots fill up.",
  contactEmail: "support@vignanpremierleague.com",
  contactPhone: "+91 99999 99999",
  whatsappLink: "https://chat.whatsapp.com/L7HXdLMblNRGTNwJbMZPVE?mode=gi_t",
  winners: [],
  studentCoordinators: [],
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
    { id: 1, grp: "A", t1: "Team 1", t2: "Team 2", date: "TBD", time: "TBD" },
    { id: 2, grp: "A", t1: "Team 3", t2: "Team 4", date: "TBD", time: "TBD" },
    { id: 3, grp: "A", t1: "Team 5", t2: "Team 1", date: "TBD", time: "TBD" },
    { id: 4, grp: "A", t1: "Team 2", t2: "Team 3", date: "TBD", time: "TBD" },
    { id: 5, grp: "A", t1: "Team 4", t2: "Team 5", date: "TBD", time: "TBD" },
    { id: 6, grp: "A", t1: "Team 1", t2: "Team 3", date: "TBD", time: "TBD" },
    { id: 7, grp: "A", t1: "Team 2", t2: "Team 4", date: "TBD", time: "TBD" },
    { id: 8, grp: "A", t1: "Team 3", t2: "Team 5", date: "TBD", time: "TBD" },
    { id: 9, grp: "A", t1: "Team 1", t2: "Team 4", date: "TBD", time: "TBD" },
    { id: 10, grp: "A", t1: "Team 2", t2: "Team 5", date: "TBD", time: "TBD" },
    { id: 11, grp: "B", t1: "Team 6", t2: "Team 7", date: "TBD", time: "TBD" },
    { id: 12, grp: "B", t1: "Team 8", t2: "Team 9", date: "TBD", time: "TBD" },
    { id: 13, grp: "B", t1: "Team 10", t2: "Team 6", date: "TBD", time: "TBD" },
    { id: 14, grp: "B", t1: "Team 7", t2: "Team 8", date: "TBD", time: "TBD" },
    { id: 15, grp: "B", t1: "Team 9", t2: "Team 10", date: "TBD", time: "TBD" },
    { id: 16, grp: "B", t1: "Team 6", t2: "Team 8", date: "TBD", time: "TBD" },
    { id: 17, grp: "B", t1: "Team 7", t2: "Team 9", date: "TBD", time: "TBD" },
    { id: 18, grp: "B", t1: "Team 8", t2: "Team 10", date: "TBD", time: "TBD" },
    { id: 19, grp: "B", t1: "Team 6", t2: "Team 9", date: "TBD", time: "TBD" },
    { id: 20, grp: "B", t1: "Team 7", t2: "Team 10", date: "TBD", time: "TBD" }
  ]
}

async function seed() {
  try {
    await client.connect()
    await client.query(
      `INSERT INTO public.vpl_site_settings (slug, content)
       VALUES ('primary', $1)
       ON CONFLICT (slug) DO NOTHING`,
      [JSON.stringify(defaultContent)]
    )
    const { rows } = await client.query(`SELECT slug, updated_at FROM public.vpl_site_settings`)
    console.log('✅  Seeded! Rows in vpl_site_settings:', rows)
  } catch (err) {
    console.error('❌  Seed failed:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

seed()

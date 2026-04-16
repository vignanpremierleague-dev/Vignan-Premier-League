/**
 * One-time script to create the vpl_site_settings table in Supabase
 * using the REST Management API (no DATABASE_URL needed).
 * Run: node create-settings-table.mjs
 */

import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '.env')

// Load .env manually
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const sep = line.indexOf('=')
    if (sep > 0) process.env[line.slice(0, sep).trim()] = line.slice(sep + 1).trim()
  }
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_KEY  = process.env.VITE_SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_KEY in .env')
  process.exit(1)
}

// Hit the Supabase SQL REST endpoint directly
const sql = `
CREATE TABLE IF NOT EXISTS public.vpl_site_settings (
  slug        text PRIMARY KEY,
  content     jsonb NOT NULL DEFAULT '{}',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Seed with defaults if the row doesn't already exist
INSERT INTO public.vpl_site_settings (slug, content)
VALUES ('primary', '{
  "registrationsOpen": true,
  "marqueeMessage": "🔥 Welcome to VPL 2025! Registrations are now LIVE!",
  "contactEmail": "support@vignanpremierleague.com",
  "contactPhone": "+91 99999 99999",
  "whatsappLink": "https://chat.whatsapp.com/L7HXdLMblNRGTNwJbMZPVE?mode=gi_t",
  "winners": [],
  "studentCoordinators": [],
  "teams": {
    "A": [
      {"name":"Team 1","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"},
      {"name":"Team 2","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"},
      {"name":"Team 3","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"},
      {"name":"Team 4","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"},
      {"name":"Team 5","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"}
    ],
    "B": [
      {"name":"Team 6","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"},
      {"name":"Team 7","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"},
      {"name":"Team 8","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"},
      {"name":"Team 9","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"},
      {"name":"Team 10","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"}
    ]
  },
  "leagueMatches": [
    {"id":1,"grp":"A","t1":"Team 1","t2":"Team 2","date":"TBD","time":"TBD"},
    {"id":2,"grp":"A","t1":"Team 3","t2":"Team 4","date":"TBD","time":"TBD"},
    {"id":3,"grp":"A","t1":"Team 5","t2":"Team 1","date":"TBD","time":"TBD"},
    {"id":4,"grp":"A","t1":"Team 2","t2":"Team 3","date":"TBD","time":"TBD"},
    {"id":5,"grp":"A","t1":"Team 4","t2":"Team 5","date":"TBD","time":"TBD"},
    {"id":6,"grp":"A","t1":"Team 1","t2":"Team 3","date":"TBD","time":"TBD"},
    {"id":7,"grp":"A","t1":"Team 2","t2":"Team 4","date":"TBD","time":"TBD"},
    {"id":8,"grp":"A","t1":"Team 3","t2":"Team 5","date":"TBD","time":"TBD"},
    {"id":9,"grp":"A","t1":"Team 1","t2":"Team 4","date":"TBD","time":"TBD"},
    {"id":10,"grp":"A","t1":"Team 2","t2":"Team 5","date":"TBD","time":"TBD"},
    {"id":11,"grp":"B","t1":"Team 6","t2":"Team 7","date":"TBD","time":"TBD"},
    {"id":12,"grp":"B","t1":"Team 8","t2":"Team 9","date":"TBD","time":"TBD"},
    {"id":13,"grp":"B","t1":"Team 10","t2":"Team 6","date":"TBD","time":"TBD"},
    {"id":14,"grp":"B","t1":"Team 7","t2":"Team 8","date":"TBD","time":"TBD"},
    {"id":15,"grp":"B","t1":"Team 9","t2":"Team 10","date":"TBD","time":"TBD"},
    {"id":16,"grp":"B","t1":"Team 6","t2":"Team 8","date":"TBD","time":"TBD"},
    {"id":17,"grp":"B","t1":"Team 7","t2":"Team 9","date":"TBD","time":"TBD"},
    {"id":18,"grp":"B","t1":"Team 8","t2":"Team 10","date":"TBD","time":"TBD"},
    {"id":19,"grp":"B","t1":"Team 6","t2":"Team 9","date":"TBD","time":"TBD"},
    {"id":20,"grp":"B","t1":"Team 7","t2":"Team 10","date":"TBD","time":"TBD"}
  ]
}')
ON CONFLICT (slug) DO NOTHING;
`

const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0]
const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/database/query`

const res = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
  body: JSON.stringify({ query: sql }),
})

if (!res.ok) {
  // Fallback: try direct SQL via Supabase REST (pg-meta)
  console.log('Management API failed, trying pg-meta endpoint...')
  const res2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  })
  
  if (!res2.ok) {
    const text = await res2.text()
    console.error('❌ Both endpoints failed.\n', text)
    console.log('\n📋 Please run this SQL manually in your Supabase SQL Editor:\n')
    console.log(sql)
    process.exit(1)
  }
  console.log('✅ Table created successfully via pg-meta!')
} else {
  const data = await res.json()
  if (data.error) {
    console.error('❌ SQL error:', data.error)
    console.log('\n📋 Please run this SQL manually in your Supabase SQL Editor:\n')
    console.log(sql)
    process.exit(1)
  }
  console.log('✅ vpl_site_settings table created and seeded successfully!')
}

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
  "marqueeMessage": "🔥 VPL matches have started! Stay tuned for real-time scores, team standings, and league schedules. Let the games begin!",
  "contactEmail": "support@vignanpremierleague.com",
  "contactPhone": "+91 99999 99999",
  "whatsappLink": "https://chat.whatsapp.com/L7HXdLMblNRGTNwJbMZPVE?mode=gi_t",
  "winners": [],
  "studentCoordinators": [],
  "teams": {
    "A": [
      {"name":"Warriors","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"},
      {"name":"Knights","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"},
      {"name":"Marvels","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"},
      {"name":"Thunderbolts","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"},
      {"name":"Royals","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"}
    ],
    "B": [
      {"name":"Lions","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"},
      {"name":"Titans","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"},
      {"name":"Panthers","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"},
      {"name":"Gladiators","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"},
      {"name":"Dominators","p":0,"w":0,"l":0,"pts":0,"nrr":"+0.000"}
    ]
  },
  "leagueMatches": [
    {"id":1,"grp":"A","t1":"Warriors","t2":"Knights","date":"Day 1","time":"TBD","status":"UPCOMING"},
    {"id":2,"grp":"B","t1":"Lions","t2":"Titans","date":"Day 2","time":"TBD","status":"UPCOMING"},
    {"id":3,"grp":"A","t1":"Marvels","t2":"Thunderbolts","date":"Day 3","time":"TBD","status":"UPCOMING"},
    {"id":4,"grp":"B","t1":"Panthers","t2":"Gladiators","date":"Day 4","time":"TBD","status":"UPCOMING"},
    {"id":5,"grp":"A","t1":"Royals","t2":"Warriors","date":"Day 5","time":"TBD","status":"UPCOMING"},
    {"id":6,"grp":"B","t1":"Dominators","t2":"Lions","date":"Day 6","time":"TBD","status":"UPCOMING"},
    {"id":7,"grp":"A","t1":"Knights","t2":"Marvels","date":"Day 7","time":"TBD","status":"UPCOMING"},
    {"id":8,"grp":"B","t1":"Titans","t2":"Panthers","date":"Day 8","time":"TBD","status":"UPCOMING"},
    {"id":9,"grp":"A","t1":"Thunderbolts","t2":"Royals","date":"Day 9","time":"TBD","status":"UPCOMING"},
    {"id":10,"grp":"B","t1":"Gladiators","t2":"Dominators","date":"Day 10","time":"TBD","status":"UPCOMING"},
    {"id":11,"grp":"A","t1":"Marvels","t2":"Royals","date":"Day 11","time":"TBD","status":"UPCOMING"},
    {"id":12,"grp":"B","t1":"Lions","t2":"Panthers","date":"Day 12","time":"TBD","status":"UPCOMING"},
    {"id":13,"grp":"A","t1":"Warriors","t2":"Thunderbolts","date":"Day 13","time":"TBD","status":"UPCOMING"},
    {"id":14,"grp":"B","t1":"Titans","t2":"Gladiators","date":"Day 14","time":"TBD","status":"UPCOMING"},
    {"id":15,"grp":"A","t1":"Knights","t2":"Royals","date":"Day 15","time":"TBD","status":"UPCOMING"},
    {"id":16,"grp":"B","t1":"Panthers","t2":"Dominators","date":"Day 16","time":"TBD","status":"UPCOMING"},
    {"id":17,"grp":"A","t1":"Marvels","t2":"Warriors","date":"Day 17","time":"TBD","status":"UPCOMING"},
    {"id":18,"grp":"B","t1":"Lions","t2":"Gladiators","date":"Day 18","time":"TBD","status":"UPCOMING"},
    {"id":19,"grp":"A","t1":"Knights","t2":"Thunderbolts","date":"Day 19","time":"TBD","status":"UPCOMING"},
    {"id":20,"grp":"B","t1":"Titans","t2":"Dominators","date":"Day 20","time":"TBD","status":"UPCOMING"}
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

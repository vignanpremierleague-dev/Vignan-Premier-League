import pg from 'pg'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const { Client } = pg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.join(__dirname, '.env')

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

const SQL = `
ALTER TABLE public.vpl_players
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS is_verified boolean not null default false,
  ADD COLUMN IF NOT EXISTS device_fingerprint text,
  ADD COLUMN IF NOT EXISTS registration_ip text,
  ADD COLUMN IF NOT EXISTS registration_user_agent text,
  ADD COLUMN IF NOT EXISTS device_blocked_at timestamp with time zone;

CREATE TABLE IF NOT EXISTS public.vpl_site_settings (
  slug text PRIMARY KEY,
  content jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vpl_device_blocks (
  id bigserial PRIMARY KEY,
  device_fingerprint text NOT NULL UNIQUE,
  blocked_player_id text,
  blocked_registration_id text,
  blocked_ip text,
  blocked_user_agent text,
  blocked_reason text,
  created_at timestamp with time zone DEFAULT now()
);
`

async function migrate() {
  try {
    console.log('Connecting...')
    await client.connect()
    await client.query(SQL)
    console.log('Migration completed successfully.')
  } catch (err) {
    console.error('Migration failed:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

migrate()

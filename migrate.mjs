import pg from 'pg'
const { Client } = pg

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
  ADD COLUMN IF NOT EXISTS photo_url    text,
  ADD COLUMN IF NOT EXISTS is_verified  boolean not null default false;
`

async function migrate() {
  try {
    console.log('Connecting...')
    await client.connect()
    await client.query(SQL)
    console.log('✅  Columns photo_url and is_verified added!')
  } catch (err) {
    console.error('❌  Migration failed:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

migrate()

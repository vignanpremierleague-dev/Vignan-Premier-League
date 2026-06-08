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

async function run() {
  try {
    await client.connect()
    
    // Check primary site setting
    const stateRes = await client.query("SELECT * FROM public.vpl_site_settings WHERE slug = 'primary'")
    console.log('Primary setting content in DB:')
    if (stateRes.rows.length > 0) {
      console.log(JSON.stringify(stateRes.rows[0].content, null, 2))
    } else {
      console.log('No primary settings found in DB.')
    }
    
  } catch (err) {
    console.error('Database query failed:', err.message)
  } finally {
    await client.end()
  }
}

run()

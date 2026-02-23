import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnon)

if (!hasSupabaseEnv) {
  console.error(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Set both variables in your deployment environment and redeploy.',
  )
}

export const supabase = hasSupabaseEnv
  ? createClient(supabaseUrl, supabaseAnon)
  : null

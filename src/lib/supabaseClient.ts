import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const getConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
    )
  }

  return { url, anonKey }
}

let cached: SupabaseClient | null = null

export const getSupabase = (): SupabaseClient => {
  if (cached) return cached
  const { url, anonKey } = getConfig()
  if (!url || !anonKey) {
    throw new Error('Supabase configuration missing (url or anon key)')
  }
  cached = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  return cached
}

/**
 * Get the Supabase URL from configuration
 */
export const getSupabaseUrl = (): string => {
  return getConfig().url
}

export default getSupabase











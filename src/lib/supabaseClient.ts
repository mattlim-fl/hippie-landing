import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Hardcoded Supabase configuration (same as Manor - shared backend)
const getConfig = () => {
  return {
    url: 'https://plksvatjdylpuhjitbfc.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsa3N2YXRqZHlscHVoaml0YmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjQ5MzMsImV4cCI6MjA2NjM0MDkzM30.IdM8u1iq88C0ruwp7IkMB7PxwnfwmRyl6uLnBmZq5ys'
  }
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

export default getSupabase








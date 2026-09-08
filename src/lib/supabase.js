import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** True when a Supabase project is connected via .env */
export const supabaseConfigured = Boolean(url && anonKey)

/** Shared Supabase client (null in demo mode — the site still fully works on mock data) */
export const supabase = supabaseConfigured
  ? createClient(url, anonKey, {
      // Verbose auth logs (token calls, PKCE exchange, errors) when VITE_DEBUG=true.
      // Dev-only: keep false/empty in production — it prints session tokens.
      auth: { debug: import.meta.env.VITE_DEBUG === 'true' },
    })
  : null

/**
 * Public site URL used for auth email redirects (confirmation, recovery).
 * Set VITE_SITE_URL in production (e.g. https://alegrexgoodhabits.com);
 * falls back to the current origin in dev.
 */
export const siteUrl = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '') ||
  (typeof window !== 'undefined' ? window.location.origin : '')

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseConfigured, siteUrl } from '../lib/supabase'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

const DEMO_KEY = 'gh_demo_user'
const DEMO_USER = {
  id: 'demo-user',
  email: 'guest@alegrexgoodhabits.com',
  full_name: 'Guest Habits',
  phone: '+63 917 000 0000',
  points: 1240,
  role: 'customer',
  demo: true,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Demo mode — restore the local session so account pages stay explorable.
    if (supabaseConfigured) return null
    try {
      return JSON.parse(localStorage.getItem(DEMO_KEY) || 'null')
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(supabaseConfigured)

  async function loadProfile(authUser) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle()
    setUser({
      id: authUser.id,
      email: authUser.email,
      full_name: profile?.full_name || authUser.user_metadata?.full_name || '',
      phone: profile?.phone || authUser.user_metadata?.phone || '',
      points: profile?.points ?? 0,
      role: profile?.role || 'customer',
      demo: false,
    })
  }

  useEffect(() => {
    if (!supabaseConfigured) return
    let ignore = false

    supabase.auth.getSession().then(async ({ data }) => {
      if (ignore) return
      if (data?.session?.user) await loadProfile(data.session.user)
      if (!ignore) setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (ignore) return
      if (session?.user) await loadProfile(session.user)
      else setUser(null)
    })
    return () => { ignore = true; sub.subscription.unsubscribe() }
  }, [])

  async function signIn(email, password) {
    if (!supabaseConfigured) {
      localStorage.setItem(DEMO_KEY, JSON.stringify(DEMO_USER))
      setUser(DEMO_USER)
      return { demo: true }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return {}
  }

  /**
   * Registers with email + password. Supabase sends the confirmation email
   * automatically when "Confirm email" is enabled (recommended for live).
   * Returns { confirmationSent: true } when the inbox step is required,
   * otherwise the session is active and the caller can navigate in.
   */
  async function signUp({ full_name, phone, email, password }) {
    if (!supabaseConfigured) {
      localStorage.setItem(DEMO_KEY, JSON.stringify({ ...DEMO_USER, email, full_name, phone }))
      setUser({ ...DEMO_USER, email, full_name, phone })
      return { demo: true }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, phone },
        emailRedirectTo: `${siteUrl}/auth/callback?next=/account`,
      },
    })
    if (error) throw error
    // No session + a user object = confirmation email is on its way.
    if (!data.session) return { confirmationSent: true, email }
    return {}
  }

  /** Re-sends the signup confirmation email (unconfirmed login, expired link…). */
  async function resendConfirmation(email) {
    if (!supabaseConfigured) return { demo: true }
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${siteUrl}/auth/callback?next=/account` },
    })
    if (error) throw error
    return {}
  }

  /** Sends the password-reset email. Supabase handles delivery automatically. */
  async function resetPassword(email) {
    if (!supabaseConfigured) return { demo: true }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/auth/reset`,
    })
    if (error) throw error
    return {}
  }

  /** Sets a new password (used on /auth/reset after the recovery link). */
  async function updatePassword(password) {
    if (!supabaseConfigured) return { demo: true }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    return {}
  }

  async function signOut() {
    if (supabaseConfigured) await supabase.auth.signOut()
    localStorage.removeItem(DEMO_KEY)
    setUser(null)
  }

  async function updateProfile(patch) {
    if (!user) return
    if (user.demo || !supabaseConfigured) {
      const next = { ...user, ...patch }
      localStorage.setItem(DEMO_KEY, JSON.stringify(next))
      setUser(next)
      return
    }
    await supabase.from('profiles').update(patch).eq('id', user.id)
    setUser((u) => ({ ...u, ...patch }))
  }

  const isAdmin = Boolean(user && !user.demo && user.role === 'admin')

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, signIn, signUp, signOut, updateProfile, resendConfirmation, resetPassword, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}

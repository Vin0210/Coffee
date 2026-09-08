import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Page } from '../components/Reveal'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useMeta } from '../hooks'
import { cx } from '../lib/format'
import { ease } from '../components/Reveal'
import { supabaseConfigured } from '../lib/supabase'

const EMAIL_RE = /^\S+@\S+\.\S+$/

export default function Auth({ initialMode = 'login' }) {
  useMeta({ title: initialMode === 'reset' ? 'Set a new password' : 'Sign in' })
  const { user, signIn, signUp, resendConfirmation, resetPassword, updatePassword } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const next = location.state?.next || '/account'

  const [mode, setMode] = useState(initialMode) // login | register | forgot | checkEmail | reset
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '', confirm: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const switchMode = (m) => { setMode(m); setError(''); setNotice('') }

  const cleanError = (err) =>
    err?.message?.replace(/.*message=|.*"message": "|".*$/, '') || 'Something went wrong.'

  const submitLogin = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await signIn(form.email.trim(), form.password)
      toast(res.demo ? 'Signed in — demo session (no Supabase connected)' : 'Welcome back.')
      navigate(next)
    } catch (err) {
      const msg = cleanError(err)
      setError(msg)
      if (/confirm/i.test(msg)) setPendingEmail(form.email.trim())
    } finally {
      setBusy(false)
    }
  }

  const submitRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.full_name.trim()) { setError('Tell us your name.'); return }
    if (!EMAIL_RE.test(form.email.trim())) { setError('Enter a valid email address.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setBusy(true)
    try {
      const res = await signUp({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      if (res.demo) {
        toast('Account created — demo session')
        navigate(next)
      } else if (res.confirmationSent) {
        setPendingEmail(form.email.trim())
        setMode('checkEmail')
      } else {
        toast('Account created. Welcome to good habits.')
        navigate(next)
      }
    } catch (err) {
      setError(cleanError(err))
    } finally {
      setBusy(false)
    }
  }

  const submitForgot = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    if (!EMAIL_RE.test(form.email.trim())) { setError('Enter a valid email address.'); return }
    setBusy(true)
    try {
      const res = await resetPassword(form.email.trim())
      if (res.demo) {
        setNotice('Demo mode — no email was sent. Connect Supabase for real password resets.')
      } else {
        setPendingEmail(form.email.trim())
        setMode('checkEmail')
        setNotice('')
      }
    } catch (err) {
      setError(cleanError(err))
    } finally {
      setBusy(false)
    }
  }

  const submitReset = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setBusy(true)
    try {
      await updatePassword(form.password)
      toast('Password updated — you are signed in.')
      navigate('/account')
    } catch (err) {
      setError(cleanError(err))
    } finally {
      setBusy(false)
    }
  }

  const resend = async () => {
    setError('')
    setBusy(true)
    try {
      await resendConfirmation(pendingEmail)
      toast('Confirmation email re-sent — check your inbox.')
    } catch (err) {
      setError(cleanError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page>
      <div className="auth">
        <div className="auth__panel">
          <p className="eyebrow auth__panel-eyebrow">Alegre × Good Habits</p>
          <h2>Good habits<br /><em>begin here.</em></h2>
          <p className="auth__panel-copy">
            One account for both obsessions — track coffee orders, save thrift pieces,
            and earn Good Habits Rewards.
          </p>
          <ul className="auth__panel-list">
            <li>Order tracking, start to finish</li>
            <li>Favorite pieces before they sell</li>
            <li>Points on every coffee and find</li>
          </ul>
        </div>

        <div className="auth__form-wrap">
          {(mode === 'login' || mode === 'register') && (
            <div className="auth__tabs" role="tablist">
              <button type="button" role="tab" aria-selected={mode === 'login'} className={cx('auth__tab', mode === 'login' && 'is-active')} onClick={() => switchMode('login')}>Sign in</button>
              <button type="button" role="tab" aria-selected={mode === 'register'} className={cx('auth__tab', mode === 'register' && 'is-active')} onClick={() => switchMode('register')}>Register</button>
            </div>
          )}

          {!supabaseConfigured && (
            <p className="auth__demo">Demo mode — any details will sign you into a sample account. Connect Supabase in <code>.env</code> for real accounts.</p>
          )}

          {mode === 'checkEmail' && (
            <div className="resv-confirm" style={{ paddingBlock: 8 }}>
              <span className="resv-confirm__check"><Check size={22} strokeWidth={2.4} /></span>
              <h2 className="resv-confirm__title">Check your inbox<em>.</em></h2>
              <p className="resv-confirm__note">
                We emailed <strong>{pendingEmail}</strong> with a confirmation link.
                Open it to activate your account — the link expires in 24 hours.
              </p>
              <p className="resv-confirm__note">Nothing arrived? Check spam, then request a fresh link.</p>
              {error && <p className="auth__error" role="alert">{error}</p>}
              <div className="resv-confirm__ctas">
                <button type="button" className="btn btn--line btn--sm" onClick={resend} disabled={busy || !pendingEmail}>
                  {busy ? 'Sending…' : 'Resend email'}
                </button>
                <button type="button" className="btn btn--solid btn--sm" onClick={() => switchMode('login')}>Back to sign in</button>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <form className="auth__form" onSubmit={submitLogin}>
              <label className="field"><span>Email</span>
                <input className="input" type="email" required autoComplete="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@email.com" />
              </label>
              <label className="field"><span>Password</span>
                <input className="input" type="password" required autoComplete="current-password" value={form.password} onChange={(e) => set({ password: e.target.value })} placeholder="••••••••" />
              </label>
              {error && <p className="auth__error" role="alert">{error}</p>}
              {pendingEmail && /confirm/i.test(error) && (
                <p className="auth__demo">
                  Haven't confirmed yet?{' '}
                  <button type="button" className="cartpage__clear" onClick={resend} disabled={busy}>
                    {busy ? 'Sending…' : 'Resend confirmation email'}
                  </button>
                </p>
              )}
              <button type="submit" className="btn btn--solid btn--full" disabled={busy}>
                {busy ? 'One sec…' : 'Sign in'}
              </button>
              <p className="auth__fine">
                <button type="button" className="cartpage__clear" onClick={() => switchMode('forgot')}>Forgot your password?</button>
              </p>
            </form>
          )}

          {mode === 'register' && (
            <form className="auth__form" onSubmit={submitRegister}>
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.4, ease }} style={{ overflow: 'hidden' }}>
                <label className="field"><span>Full name</span>
                  <input className="input" value={form.full_name} onChange={(e) => set({ full_name: e.target.value })} placeholder="Juan dela Cruz" autoComplete="name" />
                </label>
                <label className="field"><span>Phone</span>
                  <input className="input" value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+63 917 000 0000" autoComplete="tel" />
                </label>
              </motion.div>
              <label className="field"><span>Email</span>
                <input className="input" type="email" required value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@email.com" autoComplete="email" />
              </label>
              <label className="field"><span>Password · min 8 characters</span>
                <input className="input" type="password" required value={form.password} onChange={(e) => set({ password: e.target.value })} placeholder="••••••••" autoComplete="new-password" />
              </label>
              {error && <p className="auth__error" role="alert">{error}</p>}
              <button type="submit" className="btn btn--solid btn--full" disabled={busy}>
                {busy ? 'One sec…' : 'Create account'}
              </button>
              <p className="auth__fine">
                We'll email you a confirmation link. By continuing you agree to be excellent to each other.
              </p>
            </form>
          )}

          {mode === 'forgot' && (
            <form className="auth__form" onSubmit={submitForgot}>
              <h3 className="resv-confirm__title" style={{ fontSize: '1.8rem' }}>Reset password</h3>
              <p className="auth__fine">Enter your account email — we'll send a reset link.</p>
              <label className="field"><span>Email</span>
                <input className="input" type="email" required value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@email.com" autoComplete="email" />
              </label>
              {error && <p className="auth__error" role="alert">{error}</p>}
              {notice && <p className="auth__demo">{notice}</p>}
              <button type="submit" className="btn btn--solid btn--full" disabled={busy}>
                {busy ? 'Sending…' : 'Send reset link'}
              </button>
              <p className="auth__fine">
                <button type="button" className="cartpage__clear" onClick={() => switchMode('login')}>Back to sign in</button>
              </p>
            </form>
          )}

          {mode === 'reset' && (
            supabaseConfigured && !user ? (
              <div>
                <h3 className="resv-confirm__title" style={{ fontSize: '1.8rem' }}>Set a new password</h3>
                <p className="auth__fine">This page needs a valid reset session — open the link from your email (it expires in 1 hour).</p>
                <p className="auth__fine" style={{ marginTop: 12 }}>
                  <button type="button" className="cartpage__clear" onClick={() => switchMode('forgot')}>Request a fresh link</button>
                </p>
              </div>
            ) : (
              <form className="auth__form" onSubmit={submitReset}>
                <h3 className="resv-confirm__title" style={{ fontSize: '1.8rem' }}>Set a new password</h3>
                <label className="field"><span>New password · min 8 characters</span>
                  <input className="input" type="password" required value={form.password} onChange={(e) => set({ password: e.target.value })} placeholder="••••••••" autoComplete="new-password" />
                </label>
                <label className="field"><span>Confirm password</span>
                  <input className="input" type="password" required value={form.confirm} onChange={(e) => set({ confirm: e.target.value })} placeholder="••••••••" autoComplete="new-password" />
                </label>
                {error && <p className="auth__error" role="alert">{error}</p>}
                <button type="submit" className="btn btn--solid btn--full" disabled={busy}>
                  {busy ? 'Saving…' : 'Update password'}
                </button>
              </form>
            )
          )}
        </div>
      </div>
    </Page>
  )
}

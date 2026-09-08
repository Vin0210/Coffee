import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Page } from '../components/Reveal'
import { EmptyState } from '../components/SectionHead'
import { useMeta } from '../hooks'
import { supabase, supabaseConfigured } from '../lib/supabase'

/**
 * Landing page for Supabase email links (signup confirmation, password
 * recovery, magic links). Exchanges the `?code=` for a session, then
 * continues to `?next=` (default /account).
 */
export default function AuthCallback() {
  useMeta({ title: 'Confirming…' })
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const next = params.get('next') || '/account'

  useEffect(() => {
    if (!supabaseConfigured) {
      navigate('/auth', { replace: true })
      return
    }
    const code = params.get('code')
    if (!code) {
      // Legacy hash-token links land here already signed in — just continue.
      navigate(next, { replace: true })
      return
    }
    let cancelled = false
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (cancelled) return
      if (error) setError(error.message)
      else navigate(next, { replace: true })
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return (
      <Page>
        <div className="wrap section">
          <EmptyState
            title="That link didn't work"
            sub="Links expire after a while — request a fresh one and try again."
            action={<Link to="/auth" className="btn btn--solid btn--sm">Back to sign in</Link>}
          />
          <p className="auth__error" role="alert" style={{ textAlign: 'center', marginTop: 12 }}>{error}</p>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div className="route-loader" role="status" aria-label="Confirming your email">
        <span className="route-loader__mark">×</span>
      </div>
    </Page>
  )
}

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { staticCatalog, fetchLiveCatalog, createSelectors } from '../lib/catalog'

const CatalogContext = createContext(null)
export const useCatalog = () => useContext(CatalogContext)

/**
 * Catalog provider — live Supabase data when connected, static fallback
 * otherwise (demo mode) or when the fetch fails. Selectors keep the same
 * names as the old static api, so components read one hook either way.
 * `source` is 'live' | 'static' for badges/debugging.
 */
export function CatalogProvider({ children }) {
  const [data, setData] = useState(staticCatalog)
  const [source, setSource] = useState('static')
  const [loading, setLoading] = useState(supabaseConfigured)
  const [error, setError] = useState(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!supabaseConfigured) return
    let cancelled = false
    fetchLiveCatalog(supabase)
      .then((live) => {
        if (cancelled) return
        // Empty live catalog (fresh project, seeds not run) → keep static
        // so the storefront never renders blank.
        if (live.coffee.length === 0 && live.thrift.length === 0) {
          setSource('static')
        } else {
          setData(live)
          setSource('live')
        }
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Catalog failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [revision])

  const value = useMemo(() => ({
    coffee: data.coffee,
    thrift: data.thrift,
    events: data.events,
    pairs: data.pairs,
    loading,
    error,
    source,
    /** Silently re-fetch the live catalog (call after admin mutations). */
    refresh: () => setRevision((r) => r + 1),
    ...createSelectors(data),
  }), [data, loading, error, source])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

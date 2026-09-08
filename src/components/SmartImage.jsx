import { useState } from 'react'
import { phDataUri } from '../lib/placeholder'
import { resolveImage, buildSrcSet } from '../lib/images'
import { cx } from '../lib/format'

/**
 * Image slot with a designed placeholder underlay.
 * Renders the editorial SVG placeholder always; when a real `src` exists it
 * fades in above it (and silently falls back on error).
 * - `sb://…` paths resolve to Supabase Storage (see lib/images.js)
 * - Unsplash URLs get an automatic responsive srcSet
 */
export default function SmartImage({
  src, label = 'Alegre × Good Habits', tone = 'sand', kind = 'arch',
  ratio = '4/5', className = '', alt, priority = false,
  sizes = '(max-width: 640px) 50vw, 33vw', children,
}) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const resolved = resolveImage(src)
  const srcSet = buildSrcSet(src)
  const showReal = resolved && !failed

  return (
    <figure
      className={cx('ph', className)}
      style={{ aspectRatio: ratio }}
    >
      <img
        className="ph__bg"
        src={phDataUri({ label, tone, kind })}
        alt=""
        aria-hidden="true"
        draggable="false"
      />
      {showReal && (
        <img
          className={cx('ph__img', loaded && 'is-loaded')}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          src={resolved}
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
          alt={alt || `${label} — Alegre × Good Habits`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {children}
    </figure>
  )
}

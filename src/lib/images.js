import { supabaseConfigured } from './supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

/**
 * Resolve an image `src` to a displayable URL.
 * - `sb://path/to/file.jpg` → Supabase Storage public URL (product-images bucket)
 * - `https://…` / `/…` → returned as-is (Unsplash hotlinks work today)
 * - falsy → null (callers fall back to the SVG placeholder)
 */
export function resolveImage(src) {
  if (!src) return null
  if (src.startsWith('sb://')) {
    const path = src.replace('sb://', '')
    if (supabaseConfigured && SUPABASE_URL) {
      return `${SUPABASE_URL}/storage/v1/object/public/product-images/${path}`
    }
    return null
  }
  return src
}

/** Rewrite an Unsplash URL to a given width, preserving other params. */
export function unsplashAt(src, width) {
  if (!src || !src.includes('images.unsplash.com')) return src
  try {
    const u = new URL(src)
    u.searchParams.set('w', String(width))
    if (!u.searchParams.has('q')) u.searchParams.set('q', '80')
    if (!u.searchParams.has('auto')) u.searchParams.set('auto', 'format')
    return u.toString()
  } catch {
    return src
  }
}

/** Build a srcSet for Unsplash URLs; returns undefined for non-Unsplash. */
export function buildSrcSet(src) {
  const resolved = resolveImage(src)
  if (!resolved || !resolved.includes('images.unsplash.com')) return undefined
  return [400, 600, 800, 1200].map((w) => `${unsplashAt(resolved, w)} ${w}w`).join(', ')
}

/** Look up a product's image even for stale cart lines saved before `src` existed. */
export function imageForItem(item, lookupById) {
  if (item?.src) return resolveImage(item.src)
  if (lookupById && item?.productId) {
    const found = lookupById(item.productId)
    if (found?.src) return resolveImage(found.src)
  }
  return null
}

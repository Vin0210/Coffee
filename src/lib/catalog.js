import { coffeeProducts } from '../data/coffee'
import { thriftProducts } from '../data/thrift'
import { events as staticEvents } from '../data/events'
import { pairs as staticPairs } from '../data/misc'

/**
 * Catalog layer — one normalized product shape, two sources.
 * Static files are the built-in fallback (demo mode / offline);
 * Supabase rows are normalized to the exact same shape when connected.
 */

// Placeholder art lookup so live rows keep the editorial look for
// slugs we know; unknown slugs get a deterministic fallback.
const phBySlug = new Map([
  ...coffeeProducts.map((p) => [p.slug, p.ph]),
  ...thriftProducts.map((p) => [p.slug, p.ph]),
  ...staticEvents.map((e) => [e.slug, e.ph]),
])
const FALLBACK_TONES = ['sand', 'wash', 'olive', 'clay', 'cocoa', 'espresso']
const FALLBACK_KINDS = ['arch', 'cup', 'tee', 'stripe', 'stitch', 'rings']
function fallbackPh(slug) {
  let h = 0
  for (const c of String(slug)) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return {
    label: String(slug).replace(/-/g, ' '),
    tone: FALLBACK_TONES[h % FALLBACK_TONES.length],
    kind: FALLBACK_KINDS[h % FALLBACK_KINDS.length],
  }
}
const phFor = (slug) => phBySlug.get(slug) || fallbackPh(slug)

const num = (v, d = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}

export function toCoffee(row, imageByProductId) {
  const o = row.options || {}
  return {
    id: row.slug,
    slug: row.slug,
    type: 'coffee',
    category: row.category,
    name: row.name,
    short: row.short_desc || '',
    description: row.description || '',
    price: num(row.price),
    sizes: o.sizes ?? null,
    milks: o.milks ?? null,
    addons: o.addons ?? [],
    sugar: o.sugar ?? false,
    notes: o.notes || null,
    src: (imageByProductId && imageByProductId[row.id]) || row.src || null,
    featured: Boolean(row.is_featured),
    ph: phFor(row.slug),
  }
}

export function toThrift(row, imageByProductId) {
  return {
    id: row.slug,
    slug: row.slug,
    type: 'thrift',
    brand: row.brand || 'Vintage Unbranded',
    category: row.category,
    name: row.name,
    short: row.short_desc || '',
    description: row.description || '',
    price: num(row.price),
    size: row.size || 'OS',
    condition: row.condition_grade ?? 8,
    measurements: row.measurements || {},
    status: row.is_available ? 'available' : 'sold',
    src: (imageByProductId && imageByProductId[row.id]) || row.src || null,
    featured: Boolean(row.is_featured),
    collection: row.collection || null,
    ph: phFor(row.slug),
  }
}

export function toEvent(row) {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description || '',
    date: row.date,
    time: row.time || '',
    location: row.location || '',
    slots: row.slots || '',
    status: row.status || 'upcoming',
    kind: row.kind,
    src: row.image || row.src || null,
    ph: phFor(row.slug),
  }
}

/** Static catalog — identical shape, used in demo mode and as fallback. */
function buildStatic() {
  const coffee = coffeeProducts.map((p) => ({ ...p, id: p.id ?? p.slug }))
  const thrift = thriftProducts.map((p) => ({ ...p, id: p.id ?? p.slug }))
  const events = staticEvents.map((e) => ({ ...e }))
  return { coffee, thrift, events, pairs: staticPairs }
}
export const staticCatalog = buildStatic()

/** Fetch + normalize the live catalog. Throws on network/DB error. */
export async function fetchLiveCatalog(client) {
  const [{ data: products, error: pErr }, { data: images, error: iErr }, { data: events, error: eErr }] =
    await Promise.all([
      client.from('products').select('*').order('created_at', { ascending: true }),
      client.from('product_images').select('product_id, url, sort').order('sort', { ascending: true }),
      client.from('events').select('*').order('date', { ascending: true }),
    ])
  if (pErr) throw pErr
  if (eErr) throw eErr
  if (iErr) throw iErr

  const imageByProductId = {}
  for (const img of images || []) {
    if (img.product_id && img.url && !(img.product_id in imageByProductId)) {
      imageByProductId[img.product_id] = img.url
    }
  }
  const coffee = (products || []).filter((p) => p.type === 'coffee').map((p) => toCoffee(p, imageByProductId))
  const thrift = (products || []).filter((p) => p.type === 'thrift').map((p) => toThrift(p, imageByProductId))
  return { coffee, thrift, events: (events || []).map(toEvent), pairs: staticPairs }
}

/** Pure selectors over any { coffee, thrift, events, pairs } catalog. */
export function createSelectors(catalog) {
  const { coffee, thrift, events, pairs } = catalog
  const allProducts = () => [...coffee, ...thrift]
  const coffeeBySlug = (slug) => coffee.find((p) => p.slug === slug)
  const thriftBySlug = (slug) => thrift.find((p) => p.slug === slug)
  const featuredCoffee = () => coffee.filter((p) => p.featured)
  const featuredThrift = () => thrift.filter((p) => p.featured)
  const dropItems = () => thrift.filter((p) => p.collection === 'drop-04')
  const upcomingEvents = () => events.filter((e) => e.status === 'upcoming')
  const pastEvents = () => events.filter((e) => e.status === 'past')

  function related(product, n = 4) {
    const pool = (product.type === 'coffee' ? coffee : thrift).filter((p) => p.slug !== product.slug)
    const sameCat = pool.filter((p) => p.category === product.category)
    const rest = pool.filter((p) => p.category !== product.category)
    return [...sameCat, ...rest].slice(0, n)
  }

  function resolvePair(pair) {
    if (!pair) return null
    return { ...pair, coffeeProduct: coffeeBySlug(pair.coffee), thriftProduct: thriftBySlug(pair.thrift) }
  }
  const pairFor = (coffeeSlug) => resolvePair(pairs.find((pr) => pr.coffee === coffeeSlug))
  const pairById = (id) => resolvePair(pairs.find((pr) => pr.id === id))

  function searchAll(q) {
    const s = q.trim().toLowerCase()
    if (!s) return []
    return allProducts()
      .filter((p) =>
        [p.name, p.brand, p.category, p.short].filter(Boolean).some((f) => f.toLowerCase().includes(s))
      )
      .slice(0, 8)
  }

  return {
    allProducts, coffeeBySlug, thriftBySlug, featuredCoffee, featuredThrift,
    dropItems, upcomingEvents, pastEvents, related, pairFor, pairById, searchAll,
  }
}

import { supabase, supabaseConfigured } from './supabase'

/**
 * Admin data layer — live Supabase CRUD for every /admin page.
 * All functions throw on error; callers toast + keep mock data in demo mode
 * (when Supabase isn't connected these are never called).
 * Writes require the signed-in user to have role = 'admin' (RLS).
 */

const needLive = () => {
  if (!supabaseConfigured || !supabase) throw new Error('Supabase is not connected.')
}

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item'

async function uniqueSlug(table, base) {
  let slug = slugify(base)
  let n = 2
  for (;;) {
    const { data } = await supabase.from(table).select('id').eq('slug', slug).maybeSingle()
    if (!data) return slug
    slug = `${slugify(base)}-${n++}`
  }
}

/* ---------------- products ---------------- */

const DEFAULT_COFFEE_OPTIONS = {
  sizes: [{ label: '8oz', delta: 0 }, { label: '12oz', delta: 25 }],
  milks: ['Whole', 'Oat', 'Almond', 'None'],
  addons: [
    { label: 'Extra shot', price: 35 },
    { label: 'Vanilla syrup', price: 20 },
    { label: 'Caramel syrup', price: 20 },
    { label: 'Cinnamon dust', price: 10 },
  ],
  sugar: true,
}

/** Raw DB row → admin form shape (superset of the table columns). */
export function productToForm(row, image) {
  const o = row.options || {}
  return {
    id: row.id,
    slug: row.slug,
    name: row.name || '',
    type: row.type || 'coffee',
    category: row.category || '',
    price: Number(row.price) || 0,
    stock: row.stock ?? 0,
    brand: row.brand || '',
    size: row.size || '',
    condition: row.condition_grade ?? 8,
    short: row.short_desc || '',
    description: row.description || '',
    featured: Boolean(row.is_featured),
    collection: row.collection || '',
    available: row.is_available !== false,
    image: image || null,
    measurements: row.measurements || {},
    options: o,
  }
}

/** Admin form → DB row. New coffee gets standard options when absent. */
export function formToRow(form, isNew) {
  const row = {
    name: form.name.trim(),
    type: form.type,
    category: form.category,
    price: Number(form.price) || 0,
    stock: Math.max(0, Number(form.stock) || 0),
    short_desc: (form.short || '').trim(),
    description: (form.description || '').trim(),
    is_featured: Boolean(form.featured),
    is_available: form.available !== false,
  }
  if (form.type === 'thrift') {
    row.brand = (form.brand || '').trim() || null
    row.size = (form.size || '').trim() || null
    row.condition_grade = Math.min(10, Math.max(1, Number(form.condition) || 8))
    row.measurements = form.measurements || {}
    row.options = {}
    row.collection = (form.collection || '').trim() || null
  } else {
    row.brand = null
    row.size = null
    row.condition_grade = null
    row.measurements = {}
    row.options = form.options && Object.keys(form.options).length ? form.options : { ...DEFAULT_COFFEE_OPTIONS }
    row.collection = null
  }
  if (isNew) row.slug = form.slug || null // resolved by caller via uniqueSlug
  return row
}

export async function listProducts() {
  needLive()
  const [{ data: products, error }, { data: images, error: imgErr }] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('product_images').select('product_id, url, sort').order('sort', { ascending: true }),
  ])
  if (error) throw error
  if (imgErr) throw imgErr
  const firstImage = {}
  for (const img of images || []) {
    if (!(img.product_id in firstImage)) firstImage[img.product_id] = img.url
  }
  return (products || []).map((p) => productToForm(p, firstImage[p.id] || null))
}

export async function createProduct(form) {
  needLive()
  const slug = await uniqueSlug('products', form.slug?.trim() || form.name)
  const { data, error } = await supabase
    .from('products')
    .insert({ ...formToRow(form, true), slug })
    .select('*')
    .single()
  if (error) throw error
  return productToForm(data, null)
}

export async function updateProduct(id, form) {
  needLive()
  const { data, error } = await supabase
    .from('products')
    .update(formToRow(form, false))
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return productToForm(data, form.image || null)
}

export async function deleteProduct(id) {
  needLive()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function uploadProductImage(productId, file) {
  needLive()
  const safe = String(file.name || 'photo').replace(/[^a-zA-Z0-9.\-_]+/g, '_').slice(0, 80)
  const path = `${productId}/${Date.now()}-${safe}`
  const { error: upErr } = await supabase.storage.from('product-images').upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
  })
  if (upErr) throw upErr
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  const url = data.publicUrl
  const { error: rowErr } = await supabase
    .from('product_images')
    .insert({ product_id: productId, url, sort: 0 })
  if (rowErr) throw rowErr
  return url
}

/* ---------------- orders ---------------- */

export async function listOrders(limit = 100) {
  needLive()
  const { data, error } = await supabase
    .from('orders')
    .select('id, ref, customer_name, customer_phone, customer_email, order_type, address, delivery_lat, delivery_lng, note, subtotal, fee, total, status, payment_status, created_at, order_items(id, name, qty)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data || []).map((o) => ({
    id: o.id,
    ref: o.ref,
    customer: o.customer_name || 'Guest',
    phone: o.customer_phone || '',
    customer_email: o.customer_email || '',
    order_type: o.order_type || 'pickup',
    address: o.address || '',
    delivery_lat: o.delivery_lat ?? null,
    delivery_lng: o.delivery_lng ?? null,
    note: o.note || '',
    items: (o.order_items || []).reduce((n, i) => n + (i.qty || 0), 0),
    lines: (o.order_items || []).map((i) => ({ name: i.name, qty: i.qty })),
    total: Number(o.total) || 0,
    type: o.order_type === 'delivery' ? 'Delivery' : 'Pickup',
    status: o.status,
    date: o.created_at,
  }))
}

export async function updateOrderStatus(id, status) {
  needLive()
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}

export async function dashboardStats() {
  needLive()
  const dayStart = new Date()
  dayStart.setHours(0, 0, 0, 0)
  const iso = dayStart.toISOString()
  const [
    { data: today, error: tErr },
    { data: pending, error: pErr },
    { data: reservations, error: rErr },
    { data: lowStock, error: sErr },
    { data: recent, error: recErr },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('total, status, order_items(qty, line_total, product_id, products(type))')
      .gte('created_at', iso)
      .neq('status', 'cancelled'),
    supabase.from('orders').select('id', { count: 'exact', head: false }).in('status', ['received', 'confirmed', 'preparing']),
    supabase.from('reservations').select('id', { count: 'exact', head: false }).gte('date', new Date().toISOString().slice(0, 10)).neq('status', 'cancelled'),
    supabase.from('products').select('id, name, stock').eq('is_available', true).lte('stock', 5).order('stock', { ascending: true }).limit(5),
    supabase
      .from('orders')
      .select('ref, customer_name, total, order_type, status, created_at, order_items(qty)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])
  if (tErr) throw tErr
  if (pErr) throw pErr
  if (rErr) throw rErr
  if (sErr) throw sErr
  if (recErr) throw recErr

  let sales = 0
  let coffeeOrders = 0
  let thriftOrders = 0
  for (const o of today || []) {
    sales += Number(o.total) || 0
    const types = new Set((o.order_items || []).map((i) => i.products?.type).filter(Boolean))
    if (types.has('coffee')) coffeeOrders += 1
    if (types.has('thrift')) thriftOrders += 1
  }
  return {
    sales,
    coffeeOrders,
    thriftOrders,
    pending: (pending || []).length,
    reservationsToday: (reservations || []).length,
    lowStock: (lowStock || []).map((p) => ({ name: p.name, stock: p.stock })),
    recent: (recent || []).map((o) => ({
      ref: o.ref,
      customer: o.customer_name || 'Guest',
      items: (o.order_items || []).reduce((n, i) => n + (i.qty || 0), 0),
      total: Number(o.total) || 0,
      type: o.order_type === 'delivery' ? 'Delivery' : 'Pickup',
      status: o.status,
      date: o.created_at,
    })),
  }
}

export async function salesReport(days = 7) {
  needLive()
  const since = new Date()
  since.setDate(since.getDate() - (days - 1))
  since.setHours(0, 0, 0, 0)
  const monthAgo = new Date()
  monthAgo.setDate(monthAgo.getDate() - 30)
  const [
    { data: orders, error: oErr },
    { data: items, error: iErr },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('total, created_at')
      .gte('created_at', since.toISOString())
      .neq('status', 'cancelled'),
    supabase
      .from('order_items')
      .select('name, qty, line_total, created_at, products(type)')
      .gte('created_at', monthAgo.toISOString()),
  ])
  if (oErr) throw oErr
  if (iErr) throw iErr

  const buckets = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    buckets.push({ key: d.toISOString().slice(0, 10), day: d.toLocaleDateString('en-US', { weekday: 'short' }), v: 0 })
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]))
  for (const o of orders || []) {
    const b = byKey.get(String(o.created_at).slice(0, 10))
    if (b) b.v += Number(o.total) || 0
  }
  const byName = new Map()
  for (const i of items || []) {
    const cur = byName.get(i.name) || { name: i.name, count: 0, revenue: 0, type: i.products?.type || 'thrift' }
    cur.count += i.qty || 0
    cur.revenue += Number(i.line_total) || 0
    byName.set(i.name, cur)
  }
  const topSellers = [...byName.values()].sort((a, b) => b.count - a.count).slice(0, 5)
  const weekTotal = buckets.reduce((n, b) => n + b.v, 0)
  const orderCount = (orders || []).length
  const coffeeRevenue = [...byName.values()].filter((t) => t.type === 'coffee').reduce((n, t) => n + t.revenue, 0)
  return {
    salesWeek: buckets,
    weekTotal,
    averageOrder: orderCount ? Math.round(weekTotal / orderCount) : 0,
    coffeeShare: weekTotal ? Math.round((coffeeRevenue / weekTotal) * 100) : 62,
    topSellers,
  }
}

/* ---------------- reservations ---------------- */

export async function listReservations(limit = 100) {
  needLive()
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function updateReservationStatus(id, status) {
  needLive()
  const { error } = await supabase.from('reservations').update({ status }).eq('id', id)
  if (error) throw error
}

/* ---------------- events ---------------- */

export async function listEvents() {
  needLive()
  const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createEvent({ title, date, time, slots, description }) {
  needLive()
  const slug = await uniqueSlug('events', `${title} ${date}`)
  const { data, error } = await supabase
    .from('events')
    .insert({ slug, title: title.trim(), description: (description || '').trim(), date, time: (time || '').trim(), slots: (slots || '').trim(), status: 'upcoming' })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateEvent(id, patch) {
  needLive()
  const { data, error } = await supabase.from('events').update(patch).eq('id', id).select('*').single()
  if (error) throw error
  return data
}

/* ---------------- promotions ---------------- */

export async function listPromotions() {
  needLive()
  const { data, error } = await supabase.from('promotions').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map((p) => ({
    id: p.id,
    code: p.code,
    desc: p.description || '',
    kind: p.kind,
    uses: p.uses ?? 0,
    active: p.active !== false,
  }))
}

export async function togglePromotion(id, active) {
  needLive()
  const { error } = await supabase.from('promotions').update({ active }).eq('id', id)
  if (error) throw error
}

/* ---------------- customers ---------------- */

const tierFor = (points) => (points >= 2000 ? 'Gold' : points >= 800 ? 'Silver' : 'Member')

export async function listCustomers(limit = 100) {
  needLive()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, phone, points, created_at, orders(count)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data || []).map((p) => {
    const points = p.points ?? 0
    const joined = p.created_at
      ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : '—'
    return {
      id: p.id,
      name: p.full_name || 'Guest',
      email: p.email || '—',
      phone: p.phone || '',
      orders: p.orders?.[0]?.count ?? 0,
      points,
      tier: tierFor(points),
      joined,
    }
  })
}

/* ---------------- supplies (consumables) ---------------- */

export async function listSupplies() {
  needLive()
  const { data, error } = await supabase.from('supplies').select('*').order('name', { ascending: true })
  if (error) throw error
  return data || []
}

export async function updateSupply(id, patch) {
  needLive()
  const { data, error } = await supabase.from('supplies').update(patch).eq('id', id).select('*').single()
  if (error) throw error
  return data
}

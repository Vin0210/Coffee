export const BRAND = {
  name: 'Alegre × Good Habits',
  tagline: 'Coffee. Clothes. Good Habits.',
  address: 'Tumaga - Putik Rd, Zamboanga City',
  hours: [
    { day: 'Monday – Thursday', time: '8:00 AM – 9:00 PM' },
    { day: 'Friday – Saturday', time: '8:00 AM – 12:00 MN' },
    { day: 'Sunday', time: '9:00 AM – 8:00 PM' },
  ],
  socials: [
    { label: 'Instagram', handle: '@alegrexgoodhabits', href: 'https://instagram.com' },
    { label: 'TikTok', handle: '@alegrexgoodhabits', href: 'https://tiktok.com' },
    { label: 'Facebook', handle: 'Alegre × Good Habits', href: 'https://facebook.com' },
  ],
}

export const DROP = {
  number: '04',
  targetKey: 'gh_drop_target',
  offsetMs: ((2 * 24 + 14) * 3600 + 36 * 60) * 1000, // 2d 14h 36m
}

export const pairs = [
  {
    id: 'p1', coffee: 'iced-spanish-latte', thrift: 'vintage-denim-jacket',
    note: 'Sweet, cold, and broken in. The Saturday 11am combination.',
  },
  {
    id: 'p2', coffee: 'cold-brew', thrift: 'workwear-jacket',
    note: 'Low acid, high durability. Built for long shifts and longer walks.',
  },
  {
    id: 'p3', coffee: 'matcha-latte', thrift: 'graphic-tee',
    note: 'Grassy, green, and slightly loud. Wear the print, drink the calm.',
  },
]

export const spaceGallery = [
  { label: 'The coffee bar', tone: 'espresso', kind: 'arch', ratio: '3/4', caption: '01 — Coffee bar, first light', src: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80' },
  { label: 'Clothing racks', tone: 'olive', kind: 'tee', ratio: '4/5', caption: '02 — The racks, restocked weekly', src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80' },
  { label: 'Window seating', tone: 'sand', kind: 'stripe', ratio: '1/1', caption: '03 — Window seats', src: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80' },
  { label: 'Regulars', tone: 'clay', kind: 'x', ratio: '3/4', caption: '04 — Regulars doing their thing', src: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80' },
  { label: 'Pour over ritual', tone: 'cocoa', kind: 'cup', ratio: '4/5', caption: '05 — Slow brewing', src: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80' },
  { label: 'Thrift corner', tone: 'wash', kind: 'stitch', ratio: '1/1', caption: '06 — One-of-one corner', src: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80' },
  { label: 'Event nights', tone: 'wine', kind: 'rings', ratio: '4/3', caption: '07 — Event nights', src: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80' },
]

export const socialPosts = [
  { label: 'Morning rush', tone: 'clay', kind: 'cup', src: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=600&q=80' },
  { label: 'New arrivals', tone: 'olive', kind: 'tee', src: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80' },
  { label: 'Latte art', tone: 'cream', kind: 'arch', src: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&q=80' },
  { label: 'Fit check', tone: 'espresso', kind: 'x', src: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80' },
  { label: 'Drop day', tone: 'wine', kind: 'stripe', src: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80' },
  { label: 'Closing time', tone: 'cocoa', kind: 'rings', src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80' },
]

export const rewardsTiers = [
  { points: 500, title: 'Free Coffee', desc: 'Any handcrafted drink, on the house.' },
  { points: 1000, title: '₱200 Shop Voucher', desc: 'Off any thrift piece, no minimum.' },
  { points: 1500, title: 'Coffee + Thrift Reward', desc: 'A free drink and ₱300 off a piece. The full habit.' },
]

export const pickupTimes = ['ASAP (15–20 min)', '11:00 AM', '12:00 NN', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM']
export const deliveryFee = 59

export const reservationSlots = ['10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM', '7:00 PM', '8:30 PM']

export const sampleOrders = [
  {
    ref: 'GH-K8X2M', status: 'completed', created_at: '2026-09-02T10:24:00+08:00', order_type: 'pickup',
    customer_name: 'Guest', pickup_time: '11:00 AM', subtotal: 1195, fee: 0, total: 1195,
    items: [
      { name: 'Iced Spanish Latte', unit_price: 170, qty: 1, options: { size: '12oz', milk: 'Oat', sugar: '50%', addons: ['Extra shot'] }, line_total: 225 },
      { name: 'Butter Croissant', unit_price: 120, qty: 1, options: {}, line_total: 120 },
      { name: 'Vintage Denim Jacket', unit_price: 850, qty: 1, options: { size: 'L', condition: '9/10' }, line_total: 850 },
    ],
  },
  {
    ref: 'GH-Q3T9W', status: 'ready', created_at: '2026-09-07T09:02:00+08:00', order_type: 'delivery',
    customer_name: 'Guest', address: 'Tumaga, Zamboanga City', subtotal: 450, fee: 59, total: 509,
    items: [
      { name: 'Cold Brew', unit_price: 170, qty: 1, options: { size: '16oz' }, line_total: 170 },
      { name: 'Canvas Tote', unit_price: 280, qty: 1, options: { size: 'OS' }, line_total: 280 },
    ],
  },
]

export const adminMock = {
  stats: [
    { label: "Today's Sales", value: '₱12,480', delta: '+18% vs yesterday', icon: 'trend' },
    { label: 'Coffee Orders', value: '34', delta: '+6 today', icon: 'coffee' },
    { label: 'Thrift Orders', value: '12', delta: '+3 today', icon: 'shirt' },
    { label: 'Pending Orders', value: '7', delta: 'needs confirmation', icon: 'clock' },
    { label: 'Low Stock', value: '5', delta: 'beans · vanilla · oat', icon: 'alert' },
    { label: 'Reservations', value: '4', delta: 'for today', icon: 'calendar' },
  ],
  recentOrders: [
    { ref: 'GH-K8X2M', customer: 'Mara V.', items: 3, total: 1120, type: 'Pickup', status: 'completed', date: '2026-09-07T10:24:00' },
    { ref: 'GH-Q3T9W', customer: 'Jico R.', items: 2, total: 379, type: 'Delivery', status: 'ready', date: '2026-09-07T09:02:00' },
    { ref: 'GH-B7N1P', customer: 'Ana L.', items: 4, total: 690, type: 'Pickup', status: 'preparing', date: '2026-09-07T08:41:00' },
    { ref: 'GH-M4Z8C', customer: 'Toff D.', items: 1, total: 1450, type: 'Pickup', status: 'confirmed', date: '2026-09-06T17:15:00' },
    { ref: 'GH-T2Y6K', customer: 'Rae S.', items: 5, total: 1840, type: 'Delivery', status: 'cancelled', date: '2026-09-06T14:03:00' },
  ],
  supplies: [
    { name: 'House blend beans', unit: 'kg', stock: 4, par: 12 },
    { name: 'Single origin — Ethiopia', unit: 'kg', stock: 7, par: 8 },
    { name: 'Whole milk', unit: 'L', stock: 20, par: 24 },
    { name: 'Oat milk', unit: 'L', stock: 12, par: 18 },
    { name: 'Vanilla syrup', unit: 'bottles', stock: 2, par: 6 },
    { name: 'Caramel syrup', unit: 'bottles', stock: 8, par: 6 },
    { name: '8oz cups', unit: 'pcs', stock: 350, par: 400 },
    { name: '12oz cups', unit: 'pcs', stock: 180, par: 400 },
    { name: 'Croissants (frozen)', unit: 'pcs', stock: 24, par: 30 },
    { name: 'Matcha (ceremonial)', unit: 'g', stock: 900, par: 1000 },
  ],
  customers: [
    { name: 'Mara Villanueva', email: 'mara@hey.com', orders: 14, points: 1240, tier: 'Silver', joined: 'Feb 2026' },
    { name: 'Jico Ramos', email: 'jico@mail.com', orders: 9, points: 860, tier: 'Silver', joined: 'Mar 2026' },
    { name: 'Ana Lim', email: 'ana@post.com', orders: 22, points: 2310, tier: 'Gold', joined: 'Nov 2025' },
    { name: 'Toff Delgado', email: 'toff@work.co', orders: 5, points: 410, tier: 'Member', joined: 'Jun 2026' },
    { name: 'Rae Santos', email: 'rae@ink.ph', orders: 31, points: 3450, tier: 'Gold', joined: 'Sep 2025' },
  ],
  promos: [
    { code: 'DROP04', desc: '10% off thrift during drop weekend', kind: '% off thrift', uses: 38, active: true },
    { code: 'FIRSTCUP', desc: 'Free size up on first order', kind: 'Perk', uses: 112, active: true },
    { code: 'SWAPDAY', desc: '₱50 off ₱500+ during clothing swap', kind: '₱50 off', uses: 21, active: false },
    { code: 'GOODMORNING', desc: 'Free croissant with any 8am order', kind: 'Perk', uses: 64, active: true },
  ],
  salesWeek: [
    { day: 'Mon', v: 8200 }, { day: 'Tue', v: 7400 }, { day: 'Wed', v: 9600 },
    { day: 'Thu', v: 10400 }, { day: 'Fri', v: 15800 }, { day: 'Sat', v: 19200 }, { day: 'Sun', v: 12100 },
  ],
  topSellers: [
    { name: 'Iced Spanish Latte', count: 182, type: 'coffee' },
    { name: 'Vintage Denim Jacket', count: 3, type: 'thrift' },
    { name: 'Cold Brew', count: 141, type: 'coffee' },
    { name: 'Workwear Jacket', count: 2, type: 'thrift' },
    { name: 'Butter Croissant', count: 120, type: 'coffee' },
  ],
}

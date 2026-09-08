const event = (o) => ({ location: 'Alegre × Good Habits — Tumaga - Putik Rd, Zamboanga City', status: 'upcoming', ...o })

export const events = [
  event({
    slug: 'thrift-drop-04', title: 'THRIFT DROP 04', date: '2026-09-11', time: '7:00 PM',
    kind: 'drop',
    description: 'Forty new one-of-one pieces go live in-store and online. First come, first kept — doors at 7, espresso bar stays open late.',
    slots: '40 pieces', ph: { tone: 'espresso', kind: 'tee' },
    src: 'https://images.unsplash.com/photo-1489987707025-afc232f7bdaf?w=800&q=80',
  }),
  event({
    slug: 'live-dj-night', title: 'LIVE DJ NIGHT', date: '2026-09-19', time: '8:00 PM',
    description: 'Vinyl-only sets from residents Blandine and Kuya Aero. Disco, city pop, and quiet-storm between clothing racks.',
    slots: '80 slots', ph: { tone: 'wine', kind: 'rings' },
    src: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
  }),
  event({
    slug: 'coffee-workshop-pour-over', title: 'COFFEE WORKSHOP — POUR OVER BASICS', date: '2026-09-26', time: '2:00 PM',
    description: 'Ninety minutes on grind size, water, and patience. Take home a bag of the beans you brewed and a lifetime of opinions about kettles.',
    slots: '12 slots', ph: { tone: 'olive', kind: 'cup' },
    src: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
  }),
  event({
    slug: 'popup-market', title: 'POP-UP MARKET', date: '2026-10-03', time: '10:00 AM',
    description: 'Local makers take over the parking lot — ceramics, prints, plants, and vintage dealers we personally vouch for.',
    slots: 'Free entry', ph: { tone: 'sand', kind: 'stripe' },
    src: 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=800&q=80',
  }),
  event({
    slug: 'clothing-swap', title: 'CLOTHING SWAP', date: '2026-10-10', time: '1:00 PM',
    description: 'Bring three pieces you are done with, take home someone else\'s future favorite. Leftovers go to our donation partner.',
    slots: '60 slots', ph: { tone: 'clay', kind: 'stitch' },
    src: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80',
  }),
  event({
    slug: 'acoustic-session', title: 'ACOUSTIC SESSION', date: '2026-08-29', time: '7:30 PM',
    status: 'past', kind: 'past',
    description: 'Two guitars, one cajón, and a setlist of OPM deep cuts. The night we ran out of cold brew by 9pm.',
    slots: 'Waitlist only', ph: { tone: 'cocoa', kind: 'rings' },
    src: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80',
  }),
  event({
    slug: 'denim-repair-workshop', title: 'DENIM REPAIR WORKSHOP', date: '2026-07-18', time: '2:00 PM',
    status: 'past', kind: 'past',
    description: 'Visible mending 101 — sashiko patches, iron-on art, and the philosophy of wearing your repairs proudly.',
    slots: 'Sold out', ph: { tone: 'moss', kind: 'stitch' },
    src: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80',
  }),
]

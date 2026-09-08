const HOT = [{ label: '8oz', delta: 0 }, { label: '12oz', delta: 25 }]
const COLD = [{ label: '12oz', delta: 0 }, { label: '16oz', delta: 30 }]
const MILKS = ['Whole', 'Oat', 'Almond', 'None']
export const MILK_EXTRA = 25
const ADDONS = [
  { label: 'Extra shot', price: 35 },
  { label: 'Vanilla syrup', price: 20 },
  { label: 'Caramel syrup', price: 20 },
  { label: 'Cinnamon dust', price: 10 },
]

const drink = (o) => ({ type: 'coffee', sizes: HOT, milks: MILKS, addons: ADDONS, sugar: true, id: o.slug, ...o })
const bake = (o) => ({ type: 'coffee', sizes: null, milks: null, addons: [], sugar: false, id: o.slug, ...o })

export const coffeeCategories = [
  { slug: 'espresso', name: 'Espresso' },
  { slug: 'milk-coffee', name: 'Milk Coffee' },
  { slug: 'cold-coffee', name: 'Cold Coffee' },
  { slug: 'specialty', name: 'Specialty' },
  { slug: 'non-coffee', name: 'Non-Coffee' },
  { slug: 'pastries', name: 'Pastries' },
]

export const coffeeProducts = [
  drink({
    slug: 'espresso', name: 'Espresso', category: 'espresso', price: 110, featured: true,
    short: 'Double shot, pulled short and syrupy.',
    description: 'A double ristretto-style shot of our house blend — chocolatey, heavy, and sweet enough to drink bare. Served in ceramics, never paper, when you stay.',
    notes: 'House blend — cocoa · panela · dried fig',
    src: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&q=80',
    ph: { label: 'Espresso', tone: 'espresso', kind: 'cup' },
  }),
  drink({
    slug: 'americano', name: 'Americano', category: 'espresso', price: 120, featured: true,
    short: 'Long, black, and honest.',
    description: 'Two shots lengthened with hot water. Clean and quiet — the drink we judge the beans by.',
    notes: 'House blend — almond · brown sugar',
    src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    ph: { label: 'Americano', tone: 'cocoa', kind: 'cup' },
  }),
  drink({
    slug: 'cortado', name: 'Cortado', category: 'espresso', price: 140,
    short: 'Equal parts espresso and steamed milk.',
    description: 'A small, no-foam classic. Cut, not covered — for people who want milk as a supporting act.',
    notes: 'House blend — hazelnut · caramel',
    src: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&q=80',
    ph: { label: 'Cortado', tone: 'clay', kind: 'cup' },
  }),
  drink({
    slug: 'cappuccino', name: 'Cappuccino', category: 'milk-coffee', price: 150, featured: true,
    short: 'Dense foam, decent dusting of cocoa.',
    description: 'The old-school third. Thick microfoam over a double shot, finished with a heavier hand of cocoa than we probably should.',
    notes: 'House blend — milk chocolate',
    src: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
    ph: { label: 'Cappuccino', tone: 'sand', kind: 'cup' },
  }),
  drink({
    slug: 'latte', name: 'Latte', category: 'milk-coffee', price: 155,
    short: 'Silky, simple, done right.',
    description: 'Our default for a reason — a double shot folded into steamed milk, poured with whatever the barista feels like drawing that day.',
    notes: 'House blend — butter · graham',
    src: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&q=80',
    ph: { label: 'Latte', tone: 'cream', kind: 'cup' },
  }),
  drink({
    slug: 'spanish-latte', name: 'Spanish Latte', category: 'milk-coffee', price: 165, featured: true,
    short: 'Condensed milk. No apologies.',
    description: 'Sweet, thick, and unreasonably good. Espresso cut with condensed milk and steamed milk — our most-ordered drink two seasons running.',
    notes: 'House blend — dulce de leche',
    src: 'https://images.unsplash.com/photo-1522992319-0365e5f11656?w=600&q=80',
    ph: { label: 'Spanish Latte', tone: 'clay', kind: 'cup' },
  }),
  drink({
    slug: 'iced-spanish-latte', name: 'Iced Spanish Latte', category: 'cold-coffee', price: 170,
    short: 'The cold one everyone talks about.',
    description: 'Condensed milk stirred cold with a double shot and poured over big cubes. Comes with our honest recommendation to pair it with denim.',
    notes: 'House blend — dulce · vanilla',
    src: 'https://images.unsplash.com/photo-1517959105821-eaf2591984ca?w=600&q=80',
    ph: { label: 'Iced Latte', tone: 'burgundy', kind: 'cup' },
  }),
  drink({
    slug: 'cold-brew', name: 'Cold Brew', category: 'cold-coffee', price: 170, featured: true,
    short: 'Steeped for 18 hours. Worth all of them.',
    description: 'Coarse-ground single origin steeped overnight, served over ice with a splash of orange peel if you ask nicely. Low acid, high focus.',
    notes: 'Single origin — dark cherry · cacao nib',
    sizes: COLD, milks: ['None', 'Oat'],
    src: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&q=80',
    ph: { label: 'Cold Brew', tone: 'espresso', kind: 'rings' },
  }),
  drink({
    slug: 'espresso-tonic', name: 'Espresso Tonic', category: 'specialty', price: 180,
    short: 'Bright, bitter, sparkling.',
    description: 'A shot poured over chilled tonic and ice, built against the glass so the crema ribbons. Summer in a highball.',
    notes: 'Ethiopia — citrus · juniper · fizz',
    sizes: [{ label: '10oz', delta: 0 }], milks: ['None'],
    src: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80',
    ph: { label: 'Espresso Tonic', tone: 'olive', kind: 'rings' },
  }),
  drink({
    slug: 'honey-oat-latte', name: 'Honey Oat Latte', category: 'specialty', price: 180,
    short: 'Local honey, oat milk, warm mug.',
    description: 'Wild honey from Batangas whisked into oat milk and espresso. Comfort structured as a beverage.',
    notes: 'Oat · wildflower honey · toast',
    src: 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=600&q=80',
    ph: { label: 'Honey Oat', tone: 'wash', kind: 'cup' },
  }),
  drink({
    slug: 'matcha-latte', name: 'Matcha Latte', category: 'non-coffee', price: 170, featured: true,
    short: 'Ceremonial grade, whisked to order.',
    description: 'Stone-ground ceremonial matcha whisked into a paste, then topped with steamed milk of your choosing. Grassy, sweet, and quietly caffeinated.',
    notes: 'Uji, Kyoto — sweet grass · umami',
    src: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80',
    ph: { label: 'Matcha', tone: 'olive', kind: 'cup' },
  }),
  drink({
    slug: 'iced-chocolate', name: 'Iced Chocolate', category: 'non-coffee', price: 160,
    short: '70% dark, shaken cold.',
    description: 'Tablea from Davao melted into dark chocolate, shaken with milk and poured over ice. Not a hot chocolate that got cold — its own thing.',
    notes: 'Davao tablea — dark cocoa · cherry',
    sizes: COLD, milks: ['Whole', 'Oat'],
    src: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=600&q=80',
    ph: { label: 'Chocolate', tone: 'wine', kind: 'rings' },
  }),
  bake({
    slug: 'butter-croissant', name: 'Butter Croissant', category: 'pastries', price: 120, featured: true,
    short: 'Laminated in-house, baked at 6am.',
    description: 'Twenty-seven layers of butter, folded the night before and baked every morning. Shatters when you look at it.',
    src: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80',
    ph: { label: 'Croissant', tone: 'sand', kind: 'arch' },
  }),
  bake({
    slug: 'chocolate-croissant', name: 'Chocolate Croissant', category: 'pastries', price: 140,
    short: 'Same lamination, dark center.',
    description: 'The butter croissant with two batons of 64% dark chocolate rolled inside. Best with an americano, honestly.',
    src: 'https://images.unsplash.com/photo-1623334044303-241021148842?w=600&q=80',
    ph: { label: 'Choco Cross', tone: 'cocoa', kind: 'arch' },
  }),
  bake({
    slug: 'banana-bread', name: 'Banana Bread', category: 'pastries', price: 110,
    short: 'Toasted, with salted butter.',
    description: 'Saba banana loaf with walnuts, served toasted with a slick of salted butter. Pairs suspiciously well with the cold brew.',
    src: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80',
    ph: { label: 'Banana Bread', tone: 'clay', kind: 'stripe' },
  }),
]

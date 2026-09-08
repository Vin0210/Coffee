-- ============================================================
-- ALEGRE × GOOD HABITS — sample image seed
-- Run AFTER products exist (matching slugs in src/data/*.js).
-- Mirrors the Unsplash sample URLs into public.product_images (sort 0).
-- Later: upload your own photos to the `product-images` bucket and
-- either update these URLs or use `sb://filename.jpg` in product src
-- (resolved by src/lib/images.js).
-- Idempotent: skips slugs that already have images.
-- ============================================================

insert into public.product_images (product_id, url, sort)
select p.id, v.url, 0
from public.products p
join (values
  ('espresso', 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&q=80'),
  ('americano', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80'),
  ('cortado', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&q=80'),
  ('cappuccino', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80'),
  ('latte', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&q=80'),
  ('spanish-latte', 'https://images.unsplash.com/photo-1522992319-0365e5f11656?w=600&q=80'),
  ('iced-spanish-latte', 'https://images.unsplash.com/photo-1517959105821-eaf2591984ca?w=600&q=80'),
  ('cold-brew', 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&q=80'),
  ('espresso-tonic', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80'),
  ('honey-oat-latte', 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=600&q=80'),
  ('matcha-latte', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80'),
  ('iced-chocolate', 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=600&q=80'),
  ('butter-croissant', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80'),
  ('chocolate-croissant', 'https://images.unsplash.com/photo-1623334044303-241021148842?w=600&q=80'),
  ('banana-bread', 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80'),
  ('vintage-denim-jacket', 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&q=80'),
  ('workwear-jacket', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80'),
  ('vintage-polo', 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=80'),
  ('graphic-tee', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&q=80'),
  ('cargo-pants', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80'),
  ('vintage-levis-501', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80'),
  ('canvas-tote', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80'),
  ('vintage-sneakers', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80'),
  ('corduroy-shirt', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80'),
  ('pleated-trousers', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80'),
  ('fleece-jacket', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80'),
  ('silk-scarf', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80'),
  ('checkerboard-vans', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80'),
  ('chore-coat', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80')
) as v(slug, url) on p.slug = v.slug
where not exists (
  select 1 from public.product_images pi where pi.product_id = p.id
);

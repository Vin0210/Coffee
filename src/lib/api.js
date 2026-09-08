/**
 * @deprecated — static-only compatibility shim.
 * New code should use `useCatalog()` from `../context/CatalogContext`,
 * which serves live Supabase data with this same selector API and falls
 * back to the static catalog when offline. Kept so older imports keep
 * working against the static dataset.
 */
import { staticCatalog, createSelectors } from './catalog'

export const {
  allProducts,
  coffeeBySlug,
  thriftBySlug,
  featuredCoffee,
  featuredThrift,
  dropItems,
  upcomingEvents,
  pastEvents,
  related,
  pairFor,
  pairById,
  searchAll,
} = createSelectors(staticCatalog)

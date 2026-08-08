/**
 * Homepage art direction.
 *
 * The hero deliberately does NOT use "whatever Shopify sorts first". The
 * catalog mixes cutout-on-white studio shots with dark lifestyle room shots,
 * and only the latter work full-bleed, a centred cutout gets cropped out of
 * frame by object-cover and the panel reads as empty.
 *
 * List preferred hero products in order. The first one that resolves and has
 * an image wins; if none resolve we fall back to the first chandelier, which
 * is degraded but never blank. Changing the hero is a one-line edit here.
 */
export const HERO_CANDIDATES = [
  'equator-modernist-dining-chandelier',
  'crescendo-wave-crystal-dining-chandelier',
  'golden-eclaire-luxe-chandelier',
] as const;

/** Editorial blocks under the hero. Images come from each collection's lead product. */
export const HOMEPAGE_BLOCKS = [
  {
    slug: 'hanging-pendant',
    name: 'Pendants',
    blurb:
      'Marble, opal and smoked glass suspended over dining tables and kitchen islands.',
  },
  {
    slug: 'wall-lights',
    name: 'Wall Lights',
    blurb:
      'Sconces, mirror lights and reading arms that wash a room in low, warm light.',
  },
] as const;

/**
 * Homepage art direction.
 *
 * The hero and the editorial blocks use a lifestyle frame, object-cover,
 * with no text set over the photo. The frame is chosen in the homepage
 * from the first fitting in that range that has a room shot. A white
 * cutout is the wrong hero.
 */

export const HOMEPAGE_BLOCKS = [
  {
    slug: 'hanging-pendant',
    name: 'Pendants',
    blurb:
      'Crystal pendants in chrome, with gold and silver finishes where the page lists them. Price and lead time are confirmed on WhatsApp.',
  },
  {
    slug: 'wall-lights',
    name: 'Wall Lights',
    blurb:
      'Wall sconces in chrome and clear crystal, with other finishes where the page lists them. Price and finish are confirmed on WhatsApp.',
  },
] as const;

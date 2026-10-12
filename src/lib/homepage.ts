/**
 * Homepage art direction.
 *
 * The hero is a lifestyle frame, object-cover, with no text on the photo.
 * A white cutout is the wrong hero. No frame from this range was publishable:
 * the overlay sits on the glass, and cleaning the letters would invent detail.
 * The right panel stays an empty well until a clean frame exists.
 */
export const HERO_IMAGE = null;

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

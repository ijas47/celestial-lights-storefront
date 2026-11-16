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
      'Pendants and hanging lights in the current range. Purchase by contact or WhatsApp.',
  },
  {
    slug: 'wall-lights',
    name: 'Wall Lights',
    blurb:
      'Wall lights in the current range. Purchase by contact or WhatsApp.',
  },
] as const;

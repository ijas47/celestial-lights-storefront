export type Category = {
  slug: string;
  name: string;
  shortName?: string;
  description: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: 'chandeliers',
    name: 'Chandeliers',
    description:
      'Crystal chandeliers in chrome, gold and antique finishes, with the light count and size printed for each fitting. Price and finish are confirmed on WhatsApp.',
  },
  {
    slug: 'hanging-pendant',
    name: 'Pendants',
    description:
      'Crystal pendants in chrome, with gold and silver finishes where the page lists them. Price and lead time are confirmed on WhatsApp.',
  },
  {
    slug: 'table-floor-lamps',
    name: 'Table & Floor Lamps',
    shortName: 'Lamps',
    description:
      'Table lamps and floor lamps, in chrome and other printed finishes, some with a lampshade. Seen in the Kannur and Calicut showrooms.',
  },
  {
    slug: 'wall-lights',
    name: 'Wall Lights',
    description:
      'Wall sconces in chrome and clear crystal, with other finishes where the page lists them. Price and finish are confirmed on WhatsApp.',
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

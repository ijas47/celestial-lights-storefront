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
      'Chandeliers in the current range. Purchase by contact or WhatsApp.',
  },
  {
    slug: 'hanging-pendant',
    name: 'Pendants',
    description:
      'Pendants and hanging lights in the current range. Purchase by contact or WhatsApp.',
  },
  {
    slug: 'table-floor-lamps',
    name: 'Table & Floor Lamps',
    shortName: 'Lamps',
    description:
      'Table lamps and floor lamps from the current range. Seen in the Kannur and Calicut showrooms.',
  },
  {
    slug: 'wall-lights',
    name: 'Wall Lights',
    description:
      'Wall lights in the current range. Purchase by contact or WhatsApp.',
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

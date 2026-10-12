export type Spec = {
  label: string;
  value: string;
};

export type CatalogueImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type Product = {
  slug: string;
  model: string;
  title: string;
  categorySlug: string;
  summary: string;
  description: string;
  specs: Spec[];
  price: null;
  images: CatalogueImage[];
  sourcePage: number;
};

export type SortOption = 'featured' | 'model';

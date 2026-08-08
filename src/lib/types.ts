export type Money = {
  amount: string;
  currencyCode: string;
};

export type ShopImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ProductCardData = {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  featuredImage: ShopImage | null;
  priceRange: {
    minVariantPrice: Money;
  };
  compareAtPriceRange: {
    minVariantPrice: Money;
  };
};

export type ProductOption = {
  name: string;
  optionValues: {
    name: string;
  }[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
  compareAtPrice: Money | null;
  image: ShopImage | null;
};

export type FullProduct = {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  vendor: string;
  availableForSale: boolean;
  featuredImage: ShopImage | null;
  images: ShopImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  seo: {
    title: string | null;
    description: string | null;
  };
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    price: Money;
    compareAtPrice: Money | null;
    image: ShopImage | null;
    product: {
      handle: string;
      title: string;
      featuredImage: ShopImage | null;
    };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  lines: CartLine[];
};

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

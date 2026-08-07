import 'server-only';
import type {
  ProductCardData,
  FullProduct,
  Cart,
  SortOption,
  ShopImage,
  ProductVariant,
  CartLine,
} from './types';
import { getCategory } from './categories';

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!domain || !token) {
  throw new Error(
    'Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local'
  );
}

const endpoint = `https://${domain}/api/2025-10/graphql.json`;

export async function shopifyFetch<T>({
  query,
  variables,
  revalidate = 1800,
  tags,
  cache,
}: {
  query: string;
  variables?: Record<string, unknown>;
  revalidate?: number;
  tags?: string[];
  cache?: 'no-store';
}): Promise<T> {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Shopify-Storefront-Private-Token': token!,
    },
    body: JSON.stringify({ query, variables }),
  };

  if (cache === 'no-store') {
    options.cache = 'no-store';
  } else {
    options.next = {
      revalidate,
      tags: tags ?? ['products'],
    };
  }

  const res = await fetch(endpoint, options);

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await res.json();
  if (json.errors) {
    throw new Error(
      `Shopify GraphQL error: ${json.errors.map((e: { message: string }) => e.message).join(', ')}`
    );
  }

  return json.data as T;
}

// GraphQL Fragments
const PRODUCT_CARD_FRAGMENT = `
  fragment ProductCard on Product {
    id
    handle
    title
    availableForSale
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
`;

const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              selectedOptions {
                name
                value
              }
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              image {
                url
                altText
                width
                height
              }
              product {
                handle
                title
                featuredImage {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  }
`;

// GraphQL Queries
const CATEGORY_PRODUCTS_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query CategoryProducts(
    $query: String!
    $first: Int!
    $after: String
    $sortKey: ProductSortKeys!
    $reverse: Boolean!
  ) {
    products(
      query: $query
      first: $first
      after: $after
      sortKey: $sortKey
      reverse: $reverse
    ) {
      edges {
        node {
          ...ProductCard
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      descriptionHtml
      productType
      tags
      vendor
      availableForSale
      featuredImage {
        url
        altText
        width
        height
      }
      images(first: 8) {
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
      options {
        name
        optionValues {
          name
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
      seo {
        title
        description
      }
    }
  }
`;

const RECOMMENDATIONS_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query Recommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...ProductCard
    }
  }
`;

const SEARCH_PRODUCTS_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query SearchProducts($q: String!, $first: Int!, $after: String) {
    search(
      query: $q
      first: $first
      after: $after
      types: [PRODUCT]
      unavailableProducts: LAST
    ) {
      edges {
        node {
          ... on Product {
            ...ProductCard
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

const PREDICTIVE_SEARCH_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query PredictiveSearch($q: String!) {
    predictiveSearch(query: $q, limit: 8, types: [PRODUCT]) {
      products {
        ...ProductCard
      }
    }
  }
`;

const ALL_PRODUCT_HANDLES_QUERY = `
  query AllProductHandles($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          handle
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const GET_CART_QUERY = `
  ${CART_FRAGMENT}
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }
`;

const CREATE_CART_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const ADD_CART_LINES_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_CART_LINES_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const REMOVE_CART_LINES_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Helper to flatten edges array
function flattenEdges<T>(
  edges: { node: T }[]
): T[] {
  return edges.map((e) => e.node);
}

// Helper to flatten image array
function flattenImages(
  edges: { node: ShopImage }[]
): ShopImage[] {
  return edges.map((e) => e.node);
}

// Helper to flatten variant array
function flattenVariants(
  edges: { node: Omit<ProductVariant, 'image'> & { image: ShopImage | null } }[]
): ProductVariant[] {
  return edges.map((e) => e.node);
}

// Helper to flatten cart lines
function flattenCartLines(
  edges: { node: CartLine }[]
): CartLine[] {
  return edges.map((e) => e.node);
}

export async function getCategoryProducts(
  categorySlug: string,
  opts?: { first?: number; after?: string; sort?: SortOption }
): Promise<{
  products: ProductCardData[];
  hasNextPage: boolean;
  endCursor: string | null;
}> {
  const category = getCategory(categorySlug);
  if (!category) {
    throw new Error(`Unknown category slug: ${categorySlug}`);
  }

  const first = opts?.first ?? 24;
  const sort = opts?.sort ?? 'featured';

  let sortKey: string;
  let reverse: boolean;

  switch (sort) {
    case 'price-asc':
      sortKey = 'PRICE';
      reverse = false;
      break;
    case 'price-desc':
      sortKey = 'PRICE';
      reverse = true;
      break;
    case 'newest':
      sortKey = 'CREATED_AT';
      reverse = true;
      break;
    case 'featured':
    default:
      sortKey = 'BEST_SELLING';
      reverse = false;
      break;
  }

  const data = await shopifyFetch<{
    products: { edges: { node: ProductCardData }[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
  }>({
    query: CATEGORY_PRODUCTS_QUERY,
    variables: {
      query: category.query,
      first,
      after: opts?.after ?? null,
      sortKey,
      reverse,
    },
    revalidate: 1800,
  });

  return {
    products: flattenEdges(data.products.edges),
    hasNextPage: data.products.pageInfo.hasNextPage,
    endCursor: data.products.pageInfo.endCursor,
  };
}

export async function getProduct(handle: string): Promise<FullProduct | null> {
  const data = await shopifyFetch<{
    product: Omit<FullProduct, 'images' | 'variants'> & {
      images: { edges: { node: ShopImage }[] };
      variants: { edges: { node: Omit<ProductVariant, 'image'> & { image: ShopImage | null } }[] };
    } | null;
  }>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    revalidate: 3600,
  });

  if (!data.product) return null;

  return {
    ...data.product,
    images: flattenImages(data.product.images.edges),
    variants: flattenVariants(data.product.variants.edges),
  };
}

export async function getRecommendations(
  productId: string
): Promise<ProductCardData[]> {
  try {
    const data = await shopifyFetch<{
      productRecommendations: ProductCardData[];
    }>({
      query: RECOMMENDATIONS_QUERY,
      variables: { productId },
      revalidate: 3600,
    });

    return data.productRecommendations ?? [];
  } catch {
    return [];
  }
}

export async function searchProducts(
  q: string,
  opts?: { first?: number; after?: string }
): Promise<{
  products: ProductCardData[];
  hasNextPage: boolean;
  endCursor: string | null;
  totalCount: number;
}> {
  const first = opts?.first ?? 24;

  const data = await shopifyFetch<{
    search: {
      edges: { node: ProductCardData }[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      totalCount: number;
    };
  }>({
    query: SEARCH_PRODUCTS_QUERY,
    variables: { q, first, after: opts?.after ?? null },
    revalidate: 300,
  });

  return {
    products: flattenEdges(data.search.edges),
    hasNextPage: data.search.pageInfo.hasNextPage,
    endCursor: data.search.pageInfo.endCursor,
    totalCount: data.search.totalCount,
  };
}

export async function predictiveSearch(
  q: string
): Promise<ProductCardData[]> {
  const data = await shopifyFetch<{
    predictiveSearch: { products: ProductCardData[] };
  }>({
    query: PREDICTIVE_SEARCH_QUERY,
    variables: { q },
    revalidate: 300,
  });

  return data.predictiveSearch.products;
}

type AllHandlesResponse = {
  products: {
    edges: { node: { handle: string; updatedAt: string } }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

export async function getAllProductHandles(): Promise<
  { handle: string; updatedAt: string }[]
> {
  const allHandles: { handle: string; updatedAt: string }[] = [];
  let after: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const result: AllHandlesResponse = await shopifyFetch<AllHandlesResponse>({
      query: ALL_PRODUCT_HANDLES_QUERY,
      variables: { first: 250, after },
      revalidate: 86400,
    });

    const handles = result.products.edges.map(
      (e: { node: { handle: string; updatedAt: string } }) => e.node
    );
    allHandles.push(...handles);

    hasNextPage = result.products.pageInfo.hasNextPage;
    after = result.products.pageInfo.endCursor;
  }

  return allHandles;
}

export async function getCart(cartId: string): Promise<Cart | null> {
  try {
    const data = await shopifyFetch<{
      cart: Omit<Cart, 'lines'> & {
        lines: { edges: { node: CartLine }[] };
      } | null;
    }>({
      query: GET_CART_QUERY,
      variables: { cartId },
      cache: 'no-store',
    });

    if (!data.cart) return null;

    return {
      ...data.cart,
      lines: flattenCartLines(data.cart.lines.edges),
    };
  } catch {
    return null;
  }
}

export async function createCart(
  lines?: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartCreate: {
      cart: Omit<Cart, 'lines'> & {
        lines: { edges: { node: CartLine }[] };
      };
      userErrors: { field?: string; message: string }[];
    };
  }>({
    query: CREATE_CART_MUTATION,
    variables: { lines: lines ?? [] },
    cache: 'no-store',
  });

  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(
      data.cartCreate.userErrors
        .map((e) => e.message)
        .join(', ')
    );
  }

  return {
    ...data.cartCreate.cart,
    lines: flattenCartLines(data.cartCreate.cart.lines.edges),
  };
}

export async function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesAdd: {
      cart: Omit<Cart, 'lines'> & {
        lines: { edges: { node: CartLine }[] };
      };
      userErrors: { field?: string; message: string }[];
    };
  }>({
    query: ADD_CART_LINES_MUTATION,
    variables: { cartId, lines },
    cache: 'no-store',
  });

  if (data.cartLinesAdd.userErrors.length > 0) {
    throw new Error(
      data.cartLinesAdd.userErrors
        .map((e) => e.message)
        .join(', ')
    );
  }

  return {
    ...data.cartLinesAdd.cart,
    lines: flattenCartLines(data.cartLinesAdd.cart.lines.edges),
  };
}

export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesUpdate: {
      cart: Omit<Cart, 'lines'> & {
        lines: { edges: { node: CartLine }[] };
      };
      userErrors: { field?: string; message: string }[];
    };
  }>({
    query: UPDATE_CART_LINES_MUTATION,
    variables: { cartId, lines },
    cache: 'no-store',
  });

  if (data.cartLinesUpdate.userErrors.length > 0) {
    throw new Error(
      data.cartLinesUpdate.userErrors
        .map((e) => e.message)
        .join(', ')
    );
  }

  return {
    ...data.cartLinesUpdate.cart,
    lines: flattenCartLines(data.cartLinesUpdate.cart.lines.edges),
  };
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesRemove: {
      cart: Omit<Cart, 'lines'> & {
        lines: { edges: { node: CartLine }[] };
      };
      userErrors: { field?: string; message: string }[];
    };
  }>({
    query: REMOVE_CART_LINES_MUTATION,
    variables: { cartId, lineIds },
    cache: 'no-store',
  });

  if (data.cartLinesRemove.userErrors.length > 0) {
    throw new Error(
      data.cartLinesRemove.userErrors
        .map((e) => e.message)
        .join(', ')
    );
  }

  return {
    ...data.cartLinesRemove.cart,
    lines: flattenCartLines(data.cartLinesRemove.cart.lines.edges),
  };
}

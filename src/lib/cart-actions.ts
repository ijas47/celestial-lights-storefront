'use server';

import { cookies } from 'next/headers';
import {
  getCart,
  createCart,
  addCartLines,
  updateCartLines,
  removeCartLines,
} from './shopify';
import type { Cart } from './types';

const CART_COOKIE_NAME = 'cartId';
const CART_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
};

export async function getCartAction(): Promise<Cart | null> {
  try {
    const store = await cookies();
    const cartId = store.get(CART_COOKIE_NAME)?.value;

    if (!cartId) {
      return null;
    }

    const cart = await getCart(cartId);

    // If cart is expired (null), delete the cookie
    if (!cart) {
      store.delete(CART_COOKIE_NAME);
      return null;
    }

    return cart;
  } catch {
    return null;
  }
}

export async function addToCartAction(
  variantId: string,
  quantity = 1
): Promise<{ cart: Cart } | { error: string }> {
  try {
    const store = await cookies();
    const cartId = store.get(CART_COOKIE_NAME)?.value;

    let cart: Cart;

    if (!cartId) {
      // No existing cart, create new one
      cart = await createCart([{ merchandiseId: variantId, quantity }]);
      store.set(CART_COOKIE_NAME, cart.id, CART_COOKIE_OPTIONS);
    } else {
      // Try to add to existing cart
      try {
        cart = await addCartLines(cartId, [
          { merchandiseId: variantId, quantity },
        ]);
      } catch {
        // Cart ID may be stale, create a new one
        cart = await createCart([{ merchandiseId: variantId, quantity }]);
        store.set(CART_COOKIE_NAME, cart.id, CART_COOKIE_OPTIONS);
      }
    }

    return { cart };
  } catch {
    return { error: 'Could not add to cart. Please try again.' };
  }
}

export async function updateLineAction(
  lineId: string,
  quantity: number
): Promise<{ cart: Cart } | { error: string }> {
  try {
    const store = await cookies();
    const cartId = store.get(CART_COOKIE_NAME)?.value;

    if (!cartId) {
      return { error: 'No cart' };
    }

    let cart: Cart;

    if (quantity <= 0) {
      cart = await removeCartLines(cartId, [lineId]);
    } else {
      cart = await updateCartLines(cartId, [{ id: lineId, quantity }]);
    }

    return { cart };
  } catch {
    return { error: 'Could not update cart. Please try again.' };
  }
}

export async function removeLineAction(
  lineId: string
): Promise<{ cart: Cart } | { error: string }> {
  try {
    const store = await cookies();
    const cartId = store.get(CART_COOKIE_NAME)?.value;

    if (!cartId) {
      return { error: 'No cart' };
    }

    const cart = await removeCartLines(cartId, [lineId]);
    return { cart };
  } catch {
    return { error: 'Could not remove from cart. Please try again.' };
  }
}

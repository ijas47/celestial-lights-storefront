'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useTransition } from 'react';
import type { Cart } from '@/lib/types';
import { getCartAction } from '@/lib/cart-actions';

export type CartContextValue = {
  cart: Cart | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setCart: (cart: Cart | null) => void;
  pending: boolean;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  // Load cart on mount
  useEffect(() => {
    startTransition(async () => {
      const loadedCart = await getCartAction();
      setCart(loadedCart);
    });
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart,
        closeCart,
        setCart,
        pending: isPending,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

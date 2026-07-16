"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  variantId?: string | null;
  name: string;
  slug: string;
  price: number;
  image?: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "kanchkart-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((current) => {
      const existing = current.find(
        (entry) => entry.productId === item.productId && entry.variantId === item.variantId
      );
      if (existing) {
        return current.map((entry) =>
          entry.productId === item.productId && entry.variantId === item.variantId
            ? { ...entry, quantity: Math.min(50, entry.quantity + quantity) }
            : entry
        );
      }
      return [...current, { ...item, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string, variantId?: string | null) => {
    setItems((current) =>
      current.filter((entry) => entry.productId !== productId || entry.variantId !== variantId)
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string | null) => {
    setItems((current) =>
      current.map((entry) =>
        entry.productId === productId && entry.variantId === variantId
          ? { ...entry, quantity: Math.max(1, Math.min(50, quantity)) }
          : entry
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      addItem,
      removeItem,
      updateQuantity,
      clearCart
    }),
    [addItem, clearCart, items, removeItem, updateQuantity]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}


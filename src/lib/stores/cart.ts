/**
 * Cart Store - Client-side cart management using localStorage
 * Manages cart state and persistence
 */

import { writable } from "svelte/store";
import type { Product } from "$lib/types";

export interface CartItem {
  product: Product;
  quantity: number;
}

const CART_STORAGE_KEY = "tinyshop_cart";

// Initialize cart from localStorage
function getInitialCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }

  return [];
}

// Create writable store
function createCartStore() {
  const { subscribe, set, update } = writable<CartItem[]>(getInitialCart());

  return {
    subscribe,

    // Add item to cart or update quantity
    addItem: (product: Product, quantity: number = 1) => {
      update((items) => {
        const existingIndex = items.findIndex(
          (item) => item.product.id === product.id
        );

        if (existingIndex >= 0) {
          // Update existing item quantity
          items[existingIndex].quantity += quantity;
        } else {
          // Add new item
          items.push({ product, quantity });
        }

        // Persist to localStorage
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        return items;
      });
    },

    // Update item quantity
    updateQuantity: (productId: string, quantity: number) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return;
      }

      update((items) => {
        const item = items.find((item) => item.product.id === productId);
        if (item) {
          item.quantity = quantity;
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        }
        return items;
      });
    },

    // Remove item from cart
    removeItem: (productId: string) => {
      update((items) => {
        const filtered = items.filter((item) => item.product.id !== productId);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(filtered));
        return filtered;
      });
    },

    // Clear entire cart
    clear: () => {
      set([]);
      localStorage.removeItem(CART_STORAGE_KEY);
    },

    // Get total items count
    getItemCount: (items: CartItem[]): number => {
      return items.reduce((sum, item) => sum + item.quantity, 0);
    },

    // Get total price
    getTotalPrice: (items: CartItem[]): number => {
      return items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
    },
  };
}

export const cart = createCartStore();

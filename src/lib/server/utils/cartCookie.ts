import type { Cookies } from "@sveltejs/kit";
import type { CartItem } from "../services/cartService";

const CART_COOKIE_NAME = "cart";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Get cart items from cookies
 */
export function getCartFromCookies(cookies: Cookies): CartItem[] {
  const cartCookie = cookies.get(CART_COOKIE_NAME);
  if (!cartCookie) return [];

  try {
    return JSON.parse(cartCookie) as CartItem[];
  } catch (error) {
    console.error("Error parsing cart cookie:", error);
    return [];
  }
}

/**
 * Save cart items to cookies
 */
export function saveCartToCookies(cookies: Cookies, items: CartItem[]): void {
  cookies.set(CART_COOKIE_NAME, JSON.stringify(items), {
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: true, // Server-side only for security
  });
}

/**
 * Add item to cart
 */
export function addToCart(
  cookies: Cookies,
  productId: string,
  quantity: number = 1
): CartItem[] {
  const items = getCartFromCookies(cookies);
  const existingIndex = items.findIndex((item) => item.productId === productId);

  if (existingIndex >= 0) {
    items[existingIndex].quantity += quantity;
  } else {
    items.push({ productId, quantity });
  }

  saveCartToCookies(cookies, items);
  return items;
}

/**
 * Update cart item quantity
 */
export function updateCartItem(
  cookies: Cookies,
  productId: string,
  quantity: number
): CartItem[] {
  const items = getCartFromCookies(cookies);
  const existingIndex = items.findIndex((item) => item.productId === productId);

  if (existingIndex >= 0) {
    if (quantity <= 0) {
      items.splice(existingIndex, 1);
    } else {
      items[existingIndex].quantity = quantity;
    }
  }

  saveCartToCookies(cookies, items);
  return items;
}

/**
 * Remove item from cart
 */
export function removeFromCart(
  cookies: Cookies,
  productId: string
): CartItem[] {
  const items = getCartFromCookies(cookies);
  const filtered = items.filter((item) => item.productId !== productId);
  saveCartToCookies(cookies, filtered);
  return filtered;
}

/**
 * Clear entire cart
 */
export function clearCart(cookies: Cookies): void {
  cookies.delete(CART_COOKIE_NAME, { path: "/" });
}

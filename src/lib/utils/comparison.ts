// UTILS: Product comparison utilities
import type { Product } from '$lib/models/Product';

const COMPARISON_STORAGE_KEY = 'product_comparison';
const MAX_COMPARISON_ITEMS = 4; // Maximum products that can be compared

/**
 * Get all products in comparison
 */
export function getComparisonProducts(): string[] {
	if (typeof window === 'undefined') return [];
	
	try {
		const stored = localStorage.getItem(COMPARISON_STORAGE_KEY);
		if (!stored) return [];
		return JSON.parse(stored);
	} catch (error) {
		console.error('Error reading comparison from localStorage:', error);
		return [];
	}
}

/**
 * Add a product to comparison
 */
export function addToComparison(productId: string): { success: boolean; message: string } {
	if (typeof window === 'undefined') {
		return { success: false, message: 'Not available' };
	}

	try {
		const current = getComparisonProducts();
		
		if (current.includes(productId)) {
			return { success: false, message: 'Product already in comparison' };
		}

		if (current.length >= MAX_COMPARISON_ITEMS) {
			return { success: false, message: `Maximum ${MAX_COMPARISON_ITEMS} products can be compared` };
		}

		current.push(productId);
		localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(current));
		return { success: true, message: 'Product added to comparison' };
	} catch (error) {
		console.error('Error adding to comparison:', error);
		return { success: false, message: 'Failed to add product' };
	}
}

/**
 * Remove a product from comparison
 */
export function removeFromComparison(productId: string): void {
	if (typeof window === 'undefined') return;

	try {
		const current = getComparisonProducts();
		const updated = current.filter((id) => id !== productId);
		localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(updated));
	} catch (error) {
		console.error('Error removing from comparison:', error);
	}
}

/**
 * Check if a product is in comparison
 */
export function isInComparison(productId: string): boolean {
	if (typeof window === 'undefined') return false;
	return getComparisonProducts().includes(productId);
}

/**
 * Clear all products from comparison
 */
export function clearComparison(): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(COMPARISON_STORAGE_KEY);
}

/**
 * Get comparison count
 */
export function getComparisonCount(): number {
	return getComparisonProducts().length;
}


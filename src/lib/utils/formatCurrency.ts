/**
 * Format a number as currency (BDT - Bangladeshi Taka)
 * @param amount - Amount to format
 * @returns Formatted currency string with ৳ symbol
 */
export function formatCurrency(amount: number): string {
	return `${amount.toFixed(2)}৳`;
}


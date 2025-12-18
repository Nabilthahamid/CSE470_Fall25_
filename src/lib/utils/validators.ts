/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Validate slug format (lowercase, alphanumeric, hyphens, underscores)
 * @param slug - Slug to validate
 * @returns True if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
	const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
	return slugRegex.test(slug);
}

/**
 * Sanitize slug (convert to valid slug format)
 * @param text - Text to sanitize
 * @returns Sanitized slug
 */
export function sanitizeSlug(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}


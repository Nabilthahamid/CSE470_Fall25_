// UTILS: Authentication helper functions
import { redirect } from '@sveltejs/kit';
import type { AuthUser } from '$lib/models/User';

/**
 * Require authentication - redirect to login if not authenticated
 */
export function requireAuth(user: AuthUser | null): asserts user is AuthUser {
	if (!user) {
		throw redirect(302, '/auth/login');
	}
}

/**
 * Require admin role - redirect to home if not admin
 */
export function requireAdmin(user: AuthUser | null) {
	requireAuth(user);
	if (user.role !== 'admin') {
		throw redirect(302, '/');
	}
}

/**
 * Require guest - redirect to home if already authenticated
 */
export function requireGuest(user: AuthUser | null) {
	if (user) {
		throw redirect(302, '/');
	}
}


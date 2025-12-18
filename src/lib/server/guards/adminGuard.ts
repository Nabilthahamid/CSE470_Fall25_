import { error, redirect } from '@sveltejs/kit';
import { getProfileById } from '../models/users';

/**
 * Admin Guard - Checks if user is authenticated and has admin role
 * @param userId - User ID from session
 * @throws 401 if not authenticated, 403 if not admin
 */
export async function requireAdmin(userId: string | undefined): Promise<void> {
	if (!userId) {
		throw redirect(303, '/auth/login?redirectTo=/admin');
	}

	const profile = await getProfileById(userId);
	
	if (!profile) {
		throw error(401, 'User not found');
	}

	if (profile.role !== 'admin') {
		throw error(403, 'Access denied. Admin privileges required.');
	}
}

/**
 * Check if user has admin role
 * @param userId - User ID from session
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(userId: string | undefined): Promise<boolean> {
	if (!userId) return false;
	
	const profile = await getProfileById(userId);
	return profile?.role === 'admin';
}


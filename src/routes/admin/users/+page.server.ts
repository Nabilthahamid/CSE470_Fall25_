// CONTROLLER: Admin users page (protected - admin only)
import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { userService } from '$lib/services/UserService';
import { orderService } from '$lib/services/OrderService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, url }) => {
	requireAdmin(locals.user);

	try {
		const searchQuery = url.searchParams.get('search') || '';
		const roleFilter = url.searchParams.get('role') || 'all';

		// Get all users
		let users = await userService.getAllUsers();

		// Apply role filter
		if (roleFilter !== 'all') {
			users = users.filter(user => user.role === roleFilter);
		}

		// Apply search filter
		if (searchQuery.trim()) {
			const searchLower = searchQuery.toLowerCase();
			users = users.filter(user => 
				user.email.toLowerCase().includes(searchLower) ||
				user.name?.toLowerCase().includes(searchLower) ||
				user.customer_name?.toLowerCase().includes(searchLower)
			);
		}

		// Get order statistics for each user
		const usersWithStats = await Promise.all(
			users.map(async (user) => {
				try {
					const orders = await orderService.getAllOrders({ userId: user.id });
					const totalOrders = orders.length;
					const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
					
					return {
						...user,
						totalOrders,
						totalSpent,
						lastOrderDate: orders.length > 0 && orders[0].created_at
							? orders.sort((a, b) => {
								const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
								const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
								return dateB - dateA;
							})[0].created_at
							: null
					};
				} catch (error) {
					console.error(`Error fetching orders for user ${user.id}:`, error);
					// If orders can't be fetched, continue without stats
					return {
						...user,
						totalOrders: 0,
						totalSpent: 0,
						lastOrderDate: null
					};
				}
			})
		);

		return {
			users: usersWithStats,
			searchQuery,
			filters: {
				role: roleFilter
			},
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			users: [],
			searchQuery: '',
			filters: {
				role: 'all'
			},
			error: message
		};
	}
};


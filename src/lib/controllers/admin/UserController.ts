// CONTROLLER: Admin user management controller
import { BaseController } from '../BaseController';
import { requireAdmin } from '$lib/utils/auth';
import { UserModel } from '$lib/models/UserModel';
import { OrderModel } from '$lib/models/OrderModel';

export class UserController extends BaseController {
	/**
	 * Load users list with filters and stats
	 */
	async loadUsersList() {
		requireAdmin(this.getUser());

		try {
			const searchQuery = this.getQueryParam('search');
			const roleFilter = this.getQueryParam('role', 'all');

			// Get all users
			let usersModels = await UserModel.getAll();
			let users = usersModels.map((u) => u.toJSON());

			// Apply role filter
			if (roleFilter !== 'all') {
				users = users.filter((user) => user.role === roleFilter);
			}

			// Apply search filter
			if (searchQuery.trim()) {
				const searchLower = searchQuery.toLowerCase();
				users = users.filter(
					(user) =>
						user.email.toLowerCase().includes(searchLower) ||
						user.name?.toLowerCase().includes(searchLower) ||
						user.customer_name?.toLowerCase().includes(searchLower)
				);
			}

			// Get order statistics for each user
			const usersWithStats = await Promise.all(
				users.map(async (user) => {
					try {
						const ordersModels = await OrderModel.getAll({ userId: user.id });
						const orders = ordersModels.map((o) => o.toJSON());
						const totalOrders = orders.length;
						const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

						return {
							...user,
							totalOrders,
							totalSpent,
							lastOrderDate:
								orders.length > 0 && orders[0].created_at
									? orders.sort((a, b) => {
											const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
											const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
											return dateB - dateA;
										})[0].created_at
									: null
						};
					} catch (error) {
						console.error(`Error loading stats for user ${user.id}:`, error);
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
			const { message } = this.handleError(error);
			return {
				users: [],
				searchQuery: '',
				roleFilter: 'all',
				error: message
			};
		}
	}
}

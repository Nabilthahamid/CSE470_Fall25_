// SERVICE: Notification business logic and data access layer
import { supabase } from '$lib/config/supabase';
import type {
	Notification,
	CreateNotificationDTO,
	NotificationRepository,
	NotificationFilters
} from '$lib/models/Notification';

class NotificationRepositoryImpl implements NotificationRepository {
	async getAll(userId?: string, filters?: NotificationFilters): Promise<Notification[]> {
		let query = supabase
			.from('notifications')
			.select(
				`
				*,
				products(name)
			`
			)
			.order('created_at', { ascending: false });

		if (userId) {
			query = query.eq('user_id', userId);
		}

		if (filters?.type) {
			query = query.eq('type', filters.type);
		}

		if (filters?.is_read !== undefined) {
			query = query.eq('is_read', filters.is_read);
		}

		const { data, error } = await query;

		if (error) throw new Error(`Failed to fetch notifications: ${error.message}`);

		return (data || []).map((notif: any) => ({
			...notif,
			product_name: notif.products?.name
		}));
	}

	async getById(id: string): Promise<Notification | null> {
		const { data, error } = await supabase
			.from('notifications')
			.select(
				`
				*,
				products(name)
			`
			)
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch notification: ${error.message}`);
		}

		return {
			...data,
			product_name: data.products?.name
		};
	}

	async getUnreadCount(userId?: string): Promise<number> {
		try {
			let query = supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('is_read', false);

			if (userId) {
				query = query.eq('user_id', userId);
			}

			const { count, error } = await query;

			if (error) {
				// If table doesn't exist or network error, return 0
				if (error.code === 'PGRST301' || error.message.includes('fetch')) {
					return 0;
				}
				throw new Error(`Failed to fetch unread count: ${error.message}`);
			}
			return count || 0;
		} catch (error) {
			// Handle any network or unexpected errors gracefully
			console.error('Error getting unread count:', error);
			return 0;
		}
	}

	async create(input: CreateNotificationDTO): Promise<Notification> {
		const { data, error } = await supabase
			.from('notifications')
			.insert(input)
			.select()
			.single();

		if (error) throw new Error(`Failed to create notification: ${error.message}`);
		return data;
	}

	async markAsRead(id: string, userId?: string): Promise<void> {
		let query = supabase.from('notifications').update({ is_read: true }).eq('id', id);

		if (userId) {
			query = query.eq('user_id', userId);
		}

		const { error } = await query;
		if (error) throw new Error(`Failed to mark notification as read: ${error.message}`);
	}

	async markAllAsRead(userId?: string): Promise<void> {
		let query = supabase.from('notifications').update({ is_read: true });

		if (userId) {
			query = query.eq('user_id', userId);
		}

		const { error } = await query;
		if (error) throw new Error(`Failed to mark all notifications as read: ${error.message}`);
	}

	async delete(id: string): Promise<void> {
		const { error } = await supabase.from('notifications').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete notification: ${error.message}`);
	}
}

// SERVICE: Business logic layer
export class NotificationService {
	private repository: NotificationRepository;

	constructor(repository?: NotificationRepository) {
		this.repository = repository || new NotificationRepositoryImpl();
	}

	async getAllNotifications(userId?: string, filters?: NotificationFilters): Promise<Notification[]> {
		return await this.repository.getAll(userId, filters);
	}

	async getNotificationById(id: string): Promise<Notification> {
		if (!id) throw new Error('Notification ID is required');
		const notification = await this.repository.getById(id);
		if (!notification) throw new Error('Notification not found');
		return notification;
	}

	async getUnreadCount(userId?: string): Promise<number> {
		return await this.repository.getUnreadCount(userId);
	}

	async createNotification(input: CreateNotificationDTO): Promise<Notification> {
		if (!input.title) throw new Error('Title is required');
		if (!input.message) throw new Error('Message is required');
		if (!input.type) throw new Error('Type is required');

		return await this.repository.create(input);
	}

	async markAsRead(id: string, userId?: string): Promise<void> {
		if (!id) throw new Error('Notification ID is required');
		await this.repository.markAsRead(id, userId);
	}

	async markAllAsRead(userId?: string): Promise<void> {
		await this.repository.markAllAsRead(userId);
	}

	async deleteNotification(id: string): Promise<void> {
		if (!id) throw new Error('Notification ID is required');
		await this.repository.delete(id);
	}

	async checkLowStockAndNotify(): Promise<void> {
		try {
			// Try to use the RPC function first (if it exists)
			const { data: lowStockProducts, error } = await supabase.rpc('check_low_stock');

			if (error) {
				// RPC function might not exist yet, use manual check
				if (error.code === '42883' || error.message.includes('function') || error.message.includes('does not exist')) {
					// Function doesn't exist, use manual check
					return this.checkLowStockManually();
				}
				console.error('Error checking low stock:', error);
				// Fallback: manually check for low stock products
				return this.checkLowStockManually();
			}

			if (!lowStockProducts || lowStockProducts.length === 0) {
				return;
			}

			// Get admin users
			const { data: admins, error: adminError } = await supabase
				.from('users')
				.select('id')
				.eq('role', 'admin');

			if (adminError || !admins || admins.length === 0) {
				console.error('Error fetching admin users:', adminError);
				return;
			}

			// Create notifications for each admin
			for (const product of lowStockProducts) {
				for (const admin of admins) {
					try {
						await this.repository.create({
							user_id: admin.id,
							type: 'low_stock',
							title: 'Low Stock Alert',
							message: `Product "${product.product_name}" has only ${product.stock} items remaining in stock. Please restock soon.`,
							product_id: product.product_id
						});
					} catch (err) {
						console.error('Error creating notification:', err);
					}
				}
			}
		} catch (error) {
			console.error('Error in checkLowStockAndNotify:', error);
			// Silently fail - don't break the page load
		}
	}

	private async checkLowStockManually(): Promise<void> {
		try {
			// Check if notifications table exists by trying to query it
			const { error: tableCheckError } = await supabase
				.from('notifications')
				.select('id')
				.limit(1);

			if (tableCheckError) {
				// Table doesn't exist yet, skip
				return;
			}

			// Get products with stock ≤ 3
			const { data: products, error: productsError } = await supabase
				.from('products')
				.select('id, name, stock')
				.lte('stock', 3)
				.gte('stock', 0);

			if (productsError || !products || products.length === 0) {
				return;
			}

			// Check for existing notifications in the last 24 hours
			const oneDayAgo = new Date();
			oneDayAgo.setHours(oneDayAgo.getHours() - 24);

			for (const product of products) {
				// Check if notification already exists
				const { data: existingNotifications } = await supabase
					.from('notifications')
					.select('id')
					.eq('product_id', product.id)
					.eq('type', 'low_stock')
					.eq('is_read', false)
					.gte('created_at', oneDayAgo.toISOString());

				if (existingNotifications && existingNotifications.length > 0) {
					continue; // Skip if notification already exists
				}

				// Get admin users
				const { data: admins } = await supabase
					.from('users')
					.select('id')
					.eq('role', 'admin');

				if (!admins || admins.length === 0) {
					continue;
				}

				// Create notifications for each admin
				for (const admin of admins) {
					try {
						await this.repository.create({
							user_id: admin.id,
							type: 'low_stock',
							title: 'Low Stock Alert',
							message: `Product "${product.name}" has only ${product.stock} items remaining in stock. Please restock soon.`,
							product_id: product.id
						});
					} catch (err) {
						console.error('Error creating notification:', err);
					}
				}
			}
		} catch (error) {
			console.error('Error in checkLowStockManually:', error);
			// Silently fail - don't break the page load
		}
	}
}

// Export singleton instance
export const notificationService = new NotificationService();


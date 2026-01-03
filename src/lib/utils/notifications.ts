// UTILITY: Notification helper functions
import { supabase } from '$lib/config/supabase';
import type { Notification, CreateNotificationDTO, NotificationFilters } from '$lib/models/Notification';
import { ProductModel } from '$lib/models/ProductModel';

/**
 * Get all notifications
 */
export async function getAllNotifications(
	userId?: string,
	filters?: NotificationFilters
): Promise<Notification[]> {
	try {
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

		if (error) {
			if (error.code === '42P01') return [];
			throw new Error(`Failed to fetch notifications: ${error.message}`);
		}

		return (data || []).map((notif: any) => ({
			...notif,
			product_name: notif.products?.name
		}));
	} catch (error) {
		return [];
	}
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId?: string): Promise<number> {
	try {
		let query = supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('is_read', false);

		if (userId) {
			query = query.eq('user_id', userId);
		}

		const { count, error } = await query;

		if (error) {
			if (error.code === 'PGRST301' || error.code === '42P01') return 0;
			throw new Error(`Failed to fetch unread count: ${error.message}`);
		}
		return count || 0;
	} catch (error) {
		return 0;
	}
}

/**
 * Create notification
 */
export async function createNotification(input: CreateNotificationDTO): Promise<Notification> {
	const { data, error } = await supabase
		.from('notifications')
		.insert({ ...input, is_read: false, created_at: new Date().toISOString() })
		.select(
			`
			*,
			products(name)
		`
		)
		.single();

	if (error) throw new Error(`Failed to create notification: ${error.message}`);
	return {
		...data,
		product_name: (data as any).products?.name
	};
}

/**
 * Mark notification as read
 */
export async function markAsRead(id: string, userId?: string): Promise<void> {
	let query = supabase.from('notifications').update({ is_read: true }).eq('id', id);

	if (userId) {
		query = query.eq('user_id', userId);
	}

	const { error } = await query;
	if (error) throw new Error(`Failed to mark notification as read: ${error.message}`);
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId?: string): Promise<void> {
	let query = supabase.from('notifications').update({ is_read: true });

	if (userId) {
		query = query.eq('user_id', userId);
	}

	const { error } = await query;
	if (error) throw new Error(`Failed to mark all notifications as read: ${error.message}`);
}

/**
 * Check low stock and create notifications
 */
export async function checkLowStockAndNotify(): Promise<void> {
	try {
		const products = await ProductModel.getAll();
		const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock < 10);

		for (const product of lowStockProducts) {
			try {
				// Check if notification already exists
				const { data: existing } = await supabase
					.from('notifications')
					.select('id')
					.eq('type', 'low_stock')
					.eq('product_id', product.id)
					.eq('is_read', false)
					.maybeSingle();

				if (!existing) {
					await createNotification({
						type: 'low_stock',
						title: 'Low Stock Alert',
						message: `${product.name} is running low (${product.stock} units remaining)`,
						product_id: product.id
					});
				}
			} catch (error) {
				console.error(`Failed to create notification for product ${product.id}:`, error);
			}
		}
	} catch (error) {
		console.error('Error checking low stock:', error);
	}
}


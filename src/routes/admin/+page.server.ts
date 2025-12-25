// CONTROLLER: Admin page (protected - admin only)
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { notificationService } from '$lib/services/NotificationService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals.user);

	try {
		// Check for low stock and create notifications (non-blocking)
		notificationService.checkLowStockAndNotify().catch((err) => {
			console.error('Background low stock check failed:', err);
		});

		// Get notifications for the admin
		let notifications = [];
		let unreadCount = 0;

		try {
			notifications = await notificationService.getAllNotifications(locals.user.id, {
				is_read: false
			});
			unreadCount = await notificationService.getUnreadCount(locals.user.id);
		} catch (notifError) {
			console.error('Error loading notifications:', notifError);
			// Notifications table might not exist yet, continue with empty arrays
		}

		return {
			user: locals.user,
			notifications,
			unreadCount
		};
	} catch (error) {
		console.error('Error loading admin page:', error);
		return {
			user: locals.user,
			notifications: [],
			unreadCount: 0
		};
	}
};

export const actions: Actions = {
	markNotificationRead: async ({ request, locals }) => {
		requireAdmin(locals.user);
		const formData = await request.formData();
		const notificationId = formData.get('id')?.toString();

		if (!notificationId) {
			return { error: 'Notification ID is required' };
		}

		try {
			await notificationService.markAsRead(notificationId, locals.user.id);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},
	markAllRead: async ({ locals }) => {
		requireAdmin(locals.user);
		try {
			await notificationService.markAllAsRead(locals.user.id);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	}
};


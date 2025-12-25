// API: Check low stock and create notifications
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { notificationService } from '$lib/services/NotificationService';
import { handleError } from '$lib/utils/errors';

export const POST: RequestHandler = async ({ locals }) => {
	requireAdmin(locals.user);

	try {
		await notificationService.checkLowStockAndNotify();
		return json({ success: true, message: 'Low stock check completed' });
	} catch (error) {
		const { message } = handleError(error);
		return json({ success: false, error: message }, { status: 500 });
	}
};


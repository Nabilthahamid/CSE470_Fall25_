// CONTROLLER: Profile page (protected route)
import type { PageServerLoad, Actions } from './$types';
import { requireAuth } from '$lib/utils/auth';
import { userService } from '$lib/services/UserService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals }) => {
	requireAuth(locals.user);

	try {
		// Get full user data from database
		const user = await userService.getUserById(locals.user.id);
		return {
			user,
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			user: locals.user,
			error: message
		};
	}
};

export const actions: Actions = {
	update: async ({ request, locals }) => {
		requireAuth(locals.user);

		const formData = await request.formData();
		const customer_name = formData.get('customer_name')?.toString() || '';
		const customer_address = formData.get('customer_address')?.toString() || '';
		const customer_phone = formData.get('customer_phone')?.toString() || '';
		const customer_city = formData.get('customer_city')?.toString() || '';
		const customer_postal_code = formData.get('customer_postal_code')?.toString() || '';
		const customer_country = formData.get('customer_country')?.toString() || 'Bangladesh';

		try {
			await userService.updateUser(locals.user.id, {
				customer_name: customer_name || undefined,
				customer_address: customer_address || undefined,
				customer_phone: customer_phone || undefined,
				customer_city: customer_city || undefined,
				customer_postal_code: customer_postal_code || undefined,
				customer_country: customer_country || undefined
			});

			return {
				success: true,
				message: 'Profile updated successfully!'
			};
		} catch (error) {
			const { message } = handleError(error);
			return {
				error: message
			};
		}
	}
};


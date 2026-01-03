// CONTROLLER: Profile controller (Pure MVC)
import { BaseController } from '../BaseController';
import { requireAuth } from '$lib/utils/auth';
import { UserModel } from '$lib/models/UserModel';

export class ProfileController extends BaseController {
	/**
	 * Load user profile
	 */
	async loadProfile() {
		requireAuth(this.getUser());

		try {
			const user = await UserModel.getById(this.getUser()!.id);
			if (!user) throw new Error('User not found');
			return {
				user: user.toJSON(),
				error: null
			};
		} catch (error) {
			const { message } = this.handleError(error);
			return {
				user: this.getUser(),
				error: message
			};
		}
	}

	/**
	 * Update user profile
	 */
	async updateProfile() {
		requireAuth(this.getUser());
		const formData = await this.getFormData();
		
		const customer_name = formData.get('customer_name')?.toString() || '';
		const customer_address = formData.get('customer_address')?.toString() || '';
		const customer_phone = formData.get('customer_phone')?.toString() || '';
		const customer_city = formData.get('customer_city')?.toString() || '';
		const customer_postal_code = formData.get('customer_postal_code')?.toString() || '';
		const customer_country = formData.get('customer_country')?.toString() || 'Bangladesh';

		try {
			const user = await UserModel.getById(this.getUser()!.id);
			if (!user) throw new Error('User not found');
			
			await user.update({
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
			const { message } = this.handleError(error);
			return {
				error: message
			};
		}
	}
}


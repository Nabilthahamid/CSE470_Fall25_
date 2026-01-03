// CONTROLLER: Product Templates Page
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
// ProductTemplateService - TODO: Convert to Model or utils if needed
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals.user);

	try {
		// TODO: Create ProductTemplateModel if needed
		const templates: any[] = [];
		return { templates, error: null };
	} catch (error) {
		const { message } = handleError(error);
		return { templates: [], error: message };
	}
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const template = {
			name: formData.get('name')?.toString() || '',
			description: formData.get('description')?.toString() || undefined,
			category_id: formData.get('category_id')?.toString() || undefined,
			brand: formData.get('brand')?.toString() || undefined,
			base_price: parseFloat(formData.get('base_price')?.toString() || '0'),
			cost_price: formData.get('cost_price') ? parseFloat(formData.get('cost_price')?.toString() || '0') : undefined,
			specifications: formData.get('specifications')?.toString() || undefined,
			default_stock: parseInt(formData.get('default_stock')?.toString() || '0'),
			tags: formData.get('tags')?.toString()?.split(',').map(t => t.trim()).filter(Boolean) || undefined
		};

		try {
			// TODO: Implement with ProductTemplateModel
			throw new Error('Product templates not yet converted to Model');
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';

		try {
			// TODO: Implement with ProductTemplateModel
			throw new Error('Product templates not yet converted to Model');
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	createFromTemplate: async ({ request }) => {
		const formData = await request.formData();
		const templateId = formData.get('template_id')?.toString() || '';
		const productName = formData.get('product_name')?.toString() || '';

		try {
			// TODO: Implement with ProductTemplateModel
			throw new Error('Product templates not yet converted to Model');
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	}
};


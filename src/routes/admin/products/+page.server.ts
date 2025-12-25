// CONTROLLER: Admin products list page with actions
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { productService } from '$lib/services/ProductService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals.user);

	try {
		const products = await productService.getAllProducts();
		return {
			products,
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			products: [],
			error: message
		};
	}
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString() || '';
		const description = formData.get('description')?.toString() || '';
		const price = parseFloat(formData.get('price')?.toString() || '0');
		const cost_price = parseFloat(formData.get('cost_price')?.toString() || '0');
		const stock = parseInt(formData.get('stock')?.toString() || '0');
		const image_url = formData.get('image_url')?.toString() || null;
		const image_file = formData.get('image_file') as File | null;

		let finalImageUrl = image_url || null;

		// Handle file upload if provided
		if (image_file && image_file.size > 0) {
			try {
				const { uploadImage } = await import('$lib/utils/storage');
				finalImageUrl = await uploadImage(image_file);
			} catch (error) {
				const { message } = handleError(error);
				return {
					error: `Image upload failed: ${message}`,
					name,
					description,
					price,
					stock,
					image_url
				};
			}
		}

		try {
			await productService.createProduct({ name, description, price, cost_price, stock, image_url: finalImageUrl });
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return {
				error: message,
				name,
				description,
				price,
				stock,
				image_url
			};
		}
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';

		try {
			await productService.deleteProduct(id);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	}
};

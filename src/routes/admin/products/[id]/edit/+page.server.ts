// CONTROLLER: Edit product page
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { productService } from '$lib/services/ProductService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ params, locals }) => {
	requireAdmin(locals.user);

	try {
		const product = await productService.getProductById(params.id);
		return { product };
	} catch (error) {
		const { message } = handleError(error);
		throw redirect(302, '/admin/products?error=' + encodeURIComponent(message));
	}
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString();
		const price = formData.get('price')?.toString();
		const cost_price = formData.get('cost_price')?.toString();
		const stock = formData.get('stock')?.toString();
		const image_url = formData.get('image_url')?.toString();
		const image_file = formData.get('image_file') as File | null;
		const delete_image = formData.get('delete_image')?.toString() === 'true';

		const updateData: any = {};
		if (name) updateData.name = name;
		if (description) updateData.description = description;
		if (price) updateData.price = parseFloat(price);
		if (cost_price) updateData.cost_price = parseFloat(cost_price);
		if (stock) updateData.stock = parseInt(stock);

		// Handle image: file upload takes priority, then URL, then deletion
		if (image_file && image_file.size > 0) {
			try {
				const { uploadImage } = await import('$lib/utils/storage');
				updateData.image_url = await uploadImage(image_file);
			} catch (error) {
				const { message } = handleError(error);
				return { error: `Image upload failed: ${message}` };
			}
		} else if (delete_image) {
			updateData.image_url = null;
		} else if (image_url !== null && image_url !== undefined) {
			updateData.image_url = image_url || null;
		}

		try {
			await productService.updateProduct(params.id, updateData);
			throw redirect(302, '/admin/products');
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error && error.status === 302) {
				throw error;
			}
			const { message } = handleError(error);
			return { error: message };
		}
	}
};


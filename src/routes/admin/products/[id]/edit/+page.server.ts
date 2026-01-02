// CONTROLLER: Edit product page
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { productService } from '$lib/services/ProductService';
import { pcBuildService } from '$lib/services/PCBuildService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ params, locals }) => {
	requireAdmin(locals.user);

	try {
		const product = await productService.getProductById(params.id);
		
		// Load component categories (handle gracefully if table doesn't exist)
		let categories = [];
		try {
			categories = await pcBuildService.getAllCategories();
		} catch (error) {
			console.error('Error loading component categories:', error);
			// Continue without categories
		}

		// Load all products for related products selection
		let allProducts = [];
		try {
			allProducts = await productService.getAllProducts();
		} catch (error) {
			console.error('Error loading products:', error);
		}
		
		return { product, categories, allProducts };
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
		const component_category_id = formData.get('component_category_id')?.toString() || null;
		const brand = formData.get('brand')?.toString() || null;
		const specifications = formData.get('specifications')?.toString() || null;
		const tags = formData.get('tags')?.toString() || '';
		const related_product_ids = formData.get('related_product_ids')?.toString() || '';
		const slug = formData.get('slug')?.toString() || null;
		const meta_title = formData.get('meta_title')?.toString() || null;
		const meta_description = formData.get('meta_description')?.toString() || null;
		const images = formData.get('images')?.toString() || '';

		const updateData: any = {};
		if (name) updateData.name = name;
		if (description) updateData.description = description;
		if (price) updateData.price = parseFloat(price);
		if (cost_price) updateData.cost_price = parseFloat(cost_price);
		if (stock) updateData.stock = parseInt(stock);
		if (component_category_id !== null) updateData.component_category_id = component_category_id || null;
		if (brand !== null) updateData.brand = brand || null;
		if (specifications !== null) updateData.specifications = specifications || null;
		if (tags) updateData.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
		if (related_product_ids) updateData.related_product_ids = related_product_ids.split(',').map(id => id.trim()).filter(Boolean);
		if (slug !== null) updateData.slug = slug || null;
		if (meta_title !== null) updateData.meta_title = meta_title || null;
		if (meta_description !== null) updateData.meta_description = meta_description || null;
		if (images) updateData.images = images.split(',').map(img => img.trim()).filter(Boolean);

		// Handle image: file upload takes priority, then URL, then deletion
		let newImageUrl: string | null = null;
		if (image_file && image_file.size > 0) {
			try {
				const { uploadImage } = await import('$lib/utils/storage');
				newImageUrl = await uploadImage(image_file);
				updateData.image_url = newImageUrl;
			} catch (error) {
				const { message } = handleError(error);
				return { error: `Image upload failed: ${message}` };
			}
		} else if (delete_image) {
			updateData.image_url = null;
		} else if (image_url !== null && image_url !== undefined) {
			newImageUrl = image_url || null;
			updateData.image_url = image_url || null;
		}

		try {
			const product = await productService.getById(params.id);
			if (!product) {
				return { error: 'Product not found' };
			}

			// Track old image URL for removal
			const oldImageUrl = product.image_url;

			await productService.updateProduct(params.id, updateData);

			// Track media usage for new image
			if (newImageUrl) {
				try {
					const { mediaService } = await import('$lib/services/MediaService');
					// Remove old usage if image changed
					if (oldImageUrl && oldImageUrl !== newImageUrl) {
						await mediaService.removeProductMediaUsage(params.id, oldImageUrl).catch((err) => {
							console.warn('Failed to remove old media usage (non-critical):', err.message);
						});
					}
					// Track new usage
					await mediaService.trackProductMediaUsage(params.id, newImageUrl, product.name).catch((err) => {
						console.warn('Failed to track media usage (non-critical):', err.message);
					});
				} catch (error: any) {
					// Silently fail if import fails or service doesn't exist
					console.warn('Media service not available (non-critical):', error?.message || error);
				}
			} else if (delete_image && oldImageUrl) {
				// Remove usage if image was deleted
				try {
					const { mediaService } = await import('$lib/services/MediaService');
					await mediaService.removeProductMediaUsage(params.id, oldImageUrl).catch((err) => {
						console.warn('Failed to remove media usage (non-critical):', err.message);
					});
				} catch (error: any) {
					console.warn('Media service not available (non-critical):', error?.message || error);
				}
			}

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


// CONTROLLER: PC Builder page
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAuth } from '$lib/utils/auth';
import { pcBuildService } from '$lib/services/PCBuildService';
import { productService } from '$lib/services/ProductService';
import { cartService } from '$lib/services/CartService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals }) => {
	requireAuth(locals.user);

	try {
		const [categories, allProducts] = await Promise.all([
			pcBuildService.getAllCategories(),
			productService.getAllProducts()
		]);

		// Group products by component category
		const productsByCategory: Record<string, any[]> = {};
		categories.forEach((cat) => {
			productsByCategory[cat.id] = allProducts.filter(
				(p) => (p as any).component_category_id === cat.id
			);
		});

		// Get user's saved builds
		const savedBuilds = await pcBuildService.getAllBuilds(locals.user.id);

		return {
			categories,
			productsByCategory,
			savedBuilds,
			error: null
		};
	} catch (err) {
		const { message, statusCode } = handleError(err);
		throw error(statusCode, message);
	}
};

export const actions: Actions = {
	saveBuild: async ({ request, locals }) => {
		requireAuth(locals.user);

		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString() || null;
		const componentsJson = formData.get('components')?.toString();

		if (!name || !componentsJson) {
			return { error: 'Name and components are required' };
		}

		try {
			const components = JSON.parse(componentsJson);
			const build = await pcBuildService.createBuild(locals.user.id, {
				name,
				description,
				components
			});

			return {
				success: `PC build "${name}" saved successfully!`,
				buildId: build.id,
				data: { buildId: build.id }
			};
		} catch (err) {
			const { message } = handleError(err);
			return { error: message };
		}
	},

	addToCart: async ({ request, locals }) => {
		requireAuth(locals.user);

		const formData = await request.formData();
		const componentsJson = formData.get('components')?.toString();

		if (!componentsJson) {
			return { error: 'No components selected' };
		}

		try {
			const components = JSON.parse(componentsJson);

			if (!Array.isArray(components) || components.length === 0) {
				return { error: 'No components selected' };
			}

			// Validate and add each component to cart
			const errors: string[] = [];
			const added: string[] = [];

			for (const comp of components) {
				if (!comp.product_id) {
					errors.push('Product ID is required for all components');
					continue;
				}

				try {
					await cartService.addToCart(locals.user.id, {
						product_id: comp.product_id,
						quantity: comp.quantity || 1
					});
					added.push(comp.product_id);
				} catch (err) {
					const errorMessage = err instanceof Error ? err.message : 'Failed to add product';
					errors.push(errorMessage);
				}
			}

			if (errors.length > 0 && added.length === 0) {
				return { error: errors.join('; ') };
			}

			if (errors.length > 0) {
				// Some items added, some failed
				return {
					error: `Some items could not be added: ${errors.join('; ')}`,
					success: `${added.length} item(s) added to cart`
				};
			}

			// Return success message instead of redirecting immediately
			// This allows the notification to show before redirect
			return {
				success: `PC build added to cart successfully! Redirecting to cart...`,
				redirect: '/cart'
			};
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) {
				throw err; // Re-throw redirect
			}
			const { message } = handleError(err);
			return { error: message };
		}
	}
};

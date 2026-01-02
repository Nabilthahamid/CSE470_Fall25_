// CONTROLLER: Admin products list page with actions
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { productService } from '$lib/services/ProductService';
import { pcBuildService } from '$lib/services/PCBuildService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, url }) => {
	try {
		requireAdmin(locals.user);
	} catch (authError) {
		// If auth fails, it will redirect - let it propagate
		throw authError;
	}

	try {
		// Get all filter parameters
		const searchQuery = url.searchParams.get('search') || '';
		const categoryId = url.searchParams.get('category') || '';
		const brand = url.searchParams.get('brand') || '';
		const stockStatus = url.searchParams.get('stockStatus') || 'all';
		const minPrice = url.searchParams.get('minPrice') ? parseFloat(url.searchParams.get('minPrice')!) : undefined;
		const maxPrice = url.searchParams.get('maxPrice') ? parseFloat(url.searchParams.get('maxPrice')!) : undefined;
		const startDate = url.searchParams.get('startDate') || '';
		const endDate = url.searchParams.get('endDate') || '';

		// Check if any filters are applied
		const hasFilters = searchQuery || categoryId || brand || stockStatus !== 'all' || minPrice !== undefined || maxPrice !== undefined || startDate || endDate;

		let products: any[] = [];
		try {
			products = hasFilters
				? await productService.filterProducts({
						search: searchQuery || undefined,
						categoryId: categoryId || undefined,
						brand: brand || undefined,
						stockStatus: stockStatus as any,
						minPrice,
						maxPrice,
						startDate: startDate || undefined,
						endDate: endDate || undefined
					})
				: await productService.getAllProducts();
		} catch (productError: any) {
			console.error('Error loading products:', productError);
			// If products table doesn't exist or other error, continue with empty array
			products = [];
		}
		
		// Load component categories (handle gracefully if table doesn't exist)
		let categories = [];
		try {
			categories = await pcBuildService.getAllCategories();
		} catch (error) {
			console.error('Error loading component categories:', error);
			// Continue without categories
		}

		// Get unique brands for filter dropdown
		let brands: string[] = [];
		try {
			// Use the already loaded products if available, otherwise fetch
			const allProducts = products.length > 0 ? products : await productService.getAllProducts();
			brands = [...new Set(allProducts.map((p: any) => p.brand).filter(Boolean))] as string[];
			brands.sort();
		} catch (error: any) {
			console.error('Error loading brands:', error);
			// Continue with empty brands array
			brands = [];
		}
		
		return {
			products,
			categories,
			brands,
			searchQuery,
			filters: {
				categoryId,
				brand,
				stockStatus,
				minPrice: minPrice?.toString() || '',
				maxPrice: maxPrice?.toString() || '',
				startDate,
				endDate
			},
			error: null
		};
	} catch (error: any) {
		console.error('Error in products page load:', error);
		const { message } = handleError(error);
		// Return safe defaults instead of throwing
		return {
			products: [],
			categories: [],
			brands: [],
			searchQuery: '',
			filters: {
				categoryId: '',
				brand: '',
				stockStatus: 'all',
				minPrice: '',
				maxPrice: '',
				startDate: '',
				endDate: ''
			},
			error: message || 'Failed to load products'
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
		const component_category_id = formData.get('component_category_id')?.toString() || null;
		const brand = formData.get('brand')?.toString() || null;
		const specifications = formData.get('specifications')?.toString() || null;

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
			const product = await productService.createProduct({ 
				name, 
				description, 
				price, 
				cost_price, 
				stock, 
				image_url: finalImageUrl,
				component_category_id: component_category_id || null,
				brand: brand || null,
				specifications: specifications || null
			});

			// Track media usage if image was uploaded
			if (finalImageUrl) {
				try {
					const { mediaService } = await import('$lib/services/MediaService');
					// Only track if media_files table exists
					await mediaService.trackProductMediaUsage(product.id, finalImageUrl, name).catch((err) => {
						// Silently fail if table doesn't exist or other errors
						console.warn('Media tracking failed (non-critical):', err.message);
					});
				} catch (error: any) {
					// Silently fail if import fails or service doesn't exist
					console.warn('Media service not available (non-critical):', error?.message || error);
				}
			}

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

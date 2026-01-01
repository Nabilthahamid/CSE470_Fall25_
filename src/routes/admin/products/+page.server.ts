// CONTROLLER: Admin products list page with actions
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { productService } from '$lib/services/ProductService';
import { pcBuildService } from '$lib/services/PCBuildService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, url }) => {
	requireAdmin(locals.user);

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

		const products = hasFilters
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
			const allProducts = await productService.getAllProducts();
			brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))] as string[];
			brands.sort();
		} catch (error) {
			console.error('Error loading brands:', error);
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
	} catch (error) {
		const { message } = handleError(error);
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
			await productService.createProduct({ 
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

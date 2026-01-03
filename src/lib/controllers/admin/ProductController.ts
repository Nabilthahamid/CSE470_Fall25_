// CONTROLLER: Product management controller (Pure MVC)
import { redirect } from '@sveltejs/kit';
import { BaseController } from '../BaseController';
import { requireAdmin } from '$lib/utils/auth';
import { ProductModel } from '$lib/models/ProductModel';
import { getAllCategories } from '$lib/utils/pc-builder';
import { trackProductMediaUsage } from '$lib/utils/media';

export class ProductController extends BaseController {
	/**
	 * Load products list with filters
	 */
	async loadProductsList() {
		try {
			requireAdmin(this.getUser());
		} catch (authError) {
			// If auth fails, it will redirect - let it propagate
			throw authError;
		}

		try {
			// Get all filter parameters
			const searchQuery = this.getQueryParam('search');
			const categoryId = this.getQueryParam('category');
			const brand = this.getQueryParam('brand');
			const stockStatus = this.getQueryParam('stockStatus', 'all');
			const minPrice = this.getQueryParamAsNumber('minPrice');
			const maxPrice = this.getQueryParamAsNumber('maxPrice');
			const startDate = this.getQueryParam('startDate');
			const endDate = this.getQueryParam('endDate');

			// Check if any filters are applied
			const hasFilters = searchQuery || categoryId || brand || stockStatus !== 'all' || 
				minPrice !== undefined || maxPrice !== undefined || startDate || endDate;

			let products: any[] = [];
			try {
				products = hasFilters
					? await ProductModel.filter({
							search: searchQuery || undefined,
							categoryId: categoryId || undefined,
							brand: brand || undefined,
							stockStatus: stockStatus as any,
							minPrice,
							maxPrice,
							startDate: startDate || undefined,
							endDate: endDate || undefined
						})
					: await ProductModel.getAll();
			} catch (productError: any) {
				console.error('Error loading products:', productError);
				products = [];
			}
			
			// Load component categories (handle gracefully if table doesn't exist)
			let categories = [];
			try {
				categories = await getAllCategories();
			} catch (error) {
				console.error('Error loading component categories:', error);
			}

			// Get unique brands for filter dropdown
			let brands: string[] = [];
			try {
				const allProducts = products.length > 0 ? products : await ProductModel.getAll();
				brands = [...new Set(allProducts.map((p: any) => p.brand).filter(Boolean))] as string[];
				brands.sort();
			} catch (error: any) {
				console.error('Error loading brands:', error);
				brands = [];
			}
			
			return {
				products: products.map(p => p.toJSON ? p.toJSON() : p),
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
			const { message } = this.handleError(error);
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
	}

	/**
	 * Create a new product
	 */
	async createProduct() {
		requireAdmin(this.getUser());
		const formData = await this.getFormData();
		
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
				const { message } = this.handleError(error);
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
			const product = await ProductModel.create({ 
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
					await trackProductMediaUsage(product.id, finalImageUrl, name).catch((err) => {
						console.warn('Media tracking failed (non-critical):', err.message);
					});
				} catch (error: any) {
					console.warn('Media tracking not available (non-critical):', error?.message || error);
				}
			}

			return { success: true };
		} catch (error) {
			const { message } = this.handleError(error);
			return {
				error: message,
				name,
				description,
				price,
				stock,
				image_url
			};
		}
	}

	/**
	 * Delete a product
	 */
	async deleteProduct() {
		requireAdmin(this.getUser());
		const formData = await this.getFormData();
		const id = formData.get('id')?.toString() || '';

		try {
			const product = await ProductModel.getById(id);
			if (!product) {
				return { error: 'Product not found' };
			}
			await product.delete();
			return { success: true };
		} catch (error) {
			const { message } = this.handleError(error);
			return { error: message };
		}
	}
}


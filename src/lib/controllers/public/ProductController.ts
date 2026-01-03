// CONTROLLER: Public product controller (Pure MVC)
import { BaseController } from '../BaseController';
import { ProductModel } from '$lib/models/ProductModel';
import { getCategoryById } from '$lib/utils/pc-builder';

export class PublicProductController extends BaseController {
	/**
	 * Load products list (public view)
	 */
	async loadProductsList() {
		try {
			const searchQuery = this.getQueryParam('search');
			const categoryId = this.getQueryParam('category');
			const error = this.getQueryParam('error');
			const success = this.getQueryParam('success');

			let products;
			let category = null;
			
			if (categoryId) {
				// Filter by category
				products = await ProductModel.getByCategory(categoryId);
				// Get category info
				try {
					category = await getCategoryById(categoryId);
				} catch (err) {
					console.error('Error loading category:', err);
				}
			} else if (searchQuery.trim()) {
				// Search products
				products = await ProductModel.search(searchQuery);
			} else {
				// Get all products
				products = await ProductModel.getAll();
			}

			return {
				products: products.map(p => p.toJSON()),
				searchQuery: searchQuery,
				categoryId: categoryId,
				category: category,
				error: error ? decodeURIComponent(error) : null,
				success: success ? decodeURIComponent(success) : null
			};
		} catch (error) {
			const { message } = this.handleError(error);
			return {
				products: [],
				searchQuery: '',
				categoryId: '',
				category: null,
				error: message,
				success: null
			};
		}
	}

	/**
	 * Load single product details
	 */
	async loadProductDetails(productId: string) {
		try {
			const product = await ProductModel.getById(productId);
			if (!product) {
				return {
					product: null,
					error: 'Product not found'
				};
			}
			return {
				product: product.toJSON(),
				error: null
			};
		} catch (error) {
			const { message } = this.handleError(error);
			return {
				product: null,
				error: message
			};
		}
	}
}


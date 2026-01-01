// SERVICE: Product Bundles Management
import { supabase } from '$lib/config/supabase';
import { productService } from './ProductService';
import type {
	ProductBundle,
	CreateProductBundleDTO,
	UpdateProductBundleDTO
} from '$lib/models/ProductBundle';

export class ProductBundleService {
	/**
	 * Get all bundles
	 */
	async getAllBundles(): Promise<ProductBundle[]> {
		try {
			const { data, error } = await supabase
				.from('product_bundles')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) {
				if (error.code === '42P01') return [];
				throw new Error(`Failed to fetch bundles: ${error.message}`);
			}
			return data || [];
		} catch (error) {
			return [];
		}
	}

	/**
	 * Get bundle by ID
	 */
	async getBundleById(id: string): Promise<ProductBundle | null> {
		const { data, error } = await supabase
			.from('product_bundles')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch bundle: ${error.message}`);
		}
		return data;
	}

	/**
	 * Create bundle
	 */
	async createBundle(bundle: CreateProductBundleDTO): Promise<ProductBundle> {
		// Calculate regular price
		const products = await productService.getAllProducts();
		let regularPrice = 0;

		for (const bundleProduct of bundle.products) {
			const product = products.find(p => p.id === bundleProduct.product_id);
			if (product) {
				regularPrice += (bundleProduct.price || product.price) * bundleProduct.quantity;
			}
		}

		const discountPercentage = regularPrice > 0
			? ((regularPrice - bundle.bundle_price) / regularPrice) * 100
			: 0;

		const { data, error } = await supabase
			.from('product_bundles')
			.insert({
				...bundle,
				regular_price: regularPrice,
				discount_percentage: discountPercentage,
				created_at: new Date().toISOString()
			})
			.select()
			.single();

		if (error) throw new Error(`Failed to create bundle: ${error.message}`);
		return data;
	}

	/**
	 * Update bundle
	 */
	async updateBundle(id: string, bundle: UpdateProductBundleDTO): Promise<ProductBundle> {
		// Recalculate if products or price changed
		if (bundle.products || bundle.bundle_price !== undefined) {
			const existing = await this.getBundleById(id);
			if (existing) {
				const products = bundle.products || existing.products;
				const bundlePrice = bundle.bundle_price || existing.bundle_price;

				const allProducts = await productService.getAllProducts();
				let regularPrice = 0;

				for (const bundleProduct of products) {
					const product = allProducts.find(p => p.id === bundleProduct.product_id);
					if (product) {
						regularPrice += (bundleProduct.price || product.price) * bundleProduct.quantity;
					}
				}

				const discountPercentage = regularPrice > 0
					? ((regularPrice - bundlePrice) / regularPrice) * 100
					: 0;

				bundle.regular_price = regularPrice;
				bundle.discount_percentage = discountPercentage;
			}
		}

		const { data, error } = await supabase
			.from('product_bundles')
			.update({ ...bundle, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update bundle: ${error.message}`);
		return data;
	}

	/**
	 * Delete bundle
	 */
	async deleteBundle(id: string): Promise<void> {
		const { error } = await supabase.from('product_bundles').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete bundle: ${error.message}`);
	}
}

export const productBundleService = new ProductBundleService();


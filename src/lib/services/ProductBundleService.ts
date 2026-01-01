// SERVICE: Product Bundles Management
import { supabase } from '$lib/config/supabase';
import { productService } from './ProductService';
import { enhancedAIService } from './EnhancedAIService';
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

	/**
	 * AI: Suggest smart bundles based on purchase patterns
	 */
	async suggestSmartBundles(productId?: string, limit: number = 5): Promise<Array<{
		products: Array<{ productId: string; productName: string; price: number }>;
		totalPrice: number;
		bundlePrice: number;
		savings: number;
		reason: string;
	}>> {
		try {
			const allProducts = await productService.getAllProducts();
			const bundles: Array<{
				products: Array<{ productId: string; productName: string; price: number }>;
				totalPrice: number;
				bundlePrice: number;
				savings: number;
				reason: string;
			}> = [];

			// If productId provided, suggest bundles including that product
			if (productId) {
				const baseProduct = allProducts.find(p => p.id === productId);
				if (baseProduct) {
					// Find complementary products
					const complementary = this.findComplementaryProducts(baseProduct, allProducts);
					
					complementary.slice(0, 3).forEach(comp => {
						const totalPrice = baseProduct.price + comp.price;
						const bundlePrice = totalPrice * 0.9; // 10% discount
						bundles.push({
							products: [
								{ productId: baseProduct.id, productName: baseProduct.name, price: baseProduct.price },
								{ productId: comp.id, productName: comp.name, price: comp.price }
							],
							totalPrice,
							bundlePrice,
							savings: totalPrice - bundlePrice,
							reason: 'Frequently bought together'
						});
					});
				}
			} else {
				// Suggest general bundles (e.g., complete setups)
				const gamingSetup = this.createGamingSetupBundle(allProducts);
				if (gamingSetup) bundles.push(gamingSetup);

				const officeSetup = this.createOfficeSetupBundle(allProducts);
				if (officeSetup) bundles.push(officeSetup);
			}

			return bundles.slice(0, limit);
		} catch (error) {
			console.error('Error suggesting bundles:', error);
			return [];
		}
	}

	/**
	 * Find complementary products
	 */
	private findComplementaryProducts(product: any, allProducts: any[]): any[] {
		// Use EnhancedAIService to find similar/complementary products
		const similar = enhancedAIService.findSimilarProducts(product, allProducts);
		return similar.map(s => s.product).slice(0, 5);
	}

	/**
	 * Create gaming setup bundle
	 */
	private createGamingSetupBundle(products: any[]): any | null {
		// Find gaming-related products
		const gamingProducts = products
			.filter(p => {
				const text = `${p.name} ${p.description}`.toLowerCase();
				return text.includes('gaming') || text.includes('gpu') || text.includes('rgb');
			})
			.slice(0, 3);

		if (gamingProducts.length < 2) return null;

		const totalPrice = gamingProducts.reduce((sum, p) => sum + p.price, 0);
		const bundlePrice = totalPrice * 0.85; // 15% discount

		return {
			products: gamingProducts.map(p => ({
				productId: p.id,
				productName: p.name,
				price: p.price
			})),
			totalPrice,
			bundlePrice,
			savings: totalPrice - bundlePrice,
			reason: 'Complete Gaming Setup Bundle'
		};
	}

	/**
	 * Create office setup bundle
	 */
	private createOfficeSetupBundle(products: any[]): any | null {
		const officeProducts = products
			.filter(p => {
				const text = `${p.name} ${p.description}`.toLowerCase();
				return text.includes('keyboard') || text.includes('mouse') || text.includes('monitor');
			})
			.slice(0, 3);

		if (officeProducts.length < 2) return null;

		const totalPrice = officeProducts.reduce((sum, p) => sum + p.price, 0);
		const bundlePrice = totalPrice * 0.9; // 10% discount

		return {
			products: officeProducts.map(p => ({
				productId: p.id,
				productName: p.name,
				price: p.price
			})),
			totalPrice,
			bundlePrice,
			savings: totalPrice - bundlePrice,
			reason: 'Complete Office Setup Bundle'
		};
	}
}

export const productBundleService = new ProductBundleService();


// SERVICE: Product Variants Management
import { supabase } from '$lib/config/supabase';
import type {
	ProductVariant,
	CreateProductVariantDTO,
	UpdateProductVariantDTO,
	VariantAttribute
} from '$lib/models/ProductVariant';

export class ProductVariantService {
	/**
	 * Get all variants for a product
	 */
	async getVariantsByProduct(productId: string): Promise<ProductVariant[]> {
		try {
			const { data, error } = await supabase
				.from('product_variants')
				.select('*')
				.eq('product_id', productId)
				.order('created_at', { ascending: true });

			if (error) {
				if (error.code === '42P01') return [];
				throw new Error(`Failed to fetch variants: ${error.message}`);
			}
			return data || [];
		} catch (error) {
			return [];
		}
	}

	/**
	 * Get variant by ID
	 */
	async getVariantById(id: string): Promise<ProductVariant | null> {
		const { data, error } = await supabase
			.from('product_variants')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch variant: ${error.message}`);
		}
		return data;
	}

	/**
	 * Create variant
	 */
	async createVariant(variant: CreateProductVariantDTO): Promise<ProductVariant> {
		const { data, error } = await supabase
			.from('product_variants')
			.insert({ ...variant, created_at: new Date().toISOString() })
			.select()
			.single();

		if (error) throw new Error(`Failed to create variant: ${error.message}`);
		return data;
	}

	/**
	 * Bulk create variants
	 */
	async bulkCreateVariants(variants: CreateProductVariantDTO[]): Promise<ProductVariant[]> {
		const { data, error } = await supabase
			.from('product_variants')
			.insert(variants.map(v => ({ ...v, created_at: new Date().toISOString() })))
			.select();

		if (error) throw new Error(`Failed to create variants: ${error.message}`);
		return data || [];
	}

	/**
	 * Update variant
	 */
	async updateVariant(id: string, variant: UpdateProductVariantDTO): Promise<ProductVariant> {
		const { data, error } = await supabase
			.from('product_variants')
			.update({ ...variant, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update variant: ${error.message}`);
		return data;
	}

	/**
	 * Delete variant
	 */
	async deleteVariant(id: string): Promise<void> {
		const { error } = await supabase.from('product_variants').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete variant: ${error.message}`);
	}

	/**
	 * Generate variants from attributes (e.g., all combinations of color and size)
	 */
	generateVariantCombinations(
		productId: string,
		attributes: VariantAttribute[],
		basePrice?: number,
		baseStock: number = 0
	): CreateProductVariantDTO[] {
		if (attributes.length === 0) return [];

		// Generate all combinations
		const combinations: Record<string, string>[] = [];
		const generate = (current: Record<string, string>, index: number) => {
			if (index === attributes.length) {
				combinations.push({ ...current });
				return;
			}

			const attr = attributes[index];
			for (const value of attr.values) {
				generate({ ...current, [attr.name]: value }, index + 1);
			}
		};

		generate({}, 0);

		// Convert to variant DTOs
		return combinations.map((attrs, index) => {
			const name = Object.entries(attrs)
				.map(([key, value]) => `${key}: ${value}`)
				.join(', ');
			const sku = `VAR-${productId.slice(0, 8)}-${index + 1}`;

			return {
				product_id: productId,
				name,
				sku,
				attributes: attrs,
				price: basePrice,
				stock: baseStock,
				is_active: true
			};
		});
	}
}

export const productVariantService = new ProductVariantService();


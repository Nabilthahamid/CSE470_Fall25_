// SERVICE: Product business logic and data access layer
import { supabase } from '$lib/config/supabase';
import type { Product, CreateProductDTO, UpdateProductDTO, ProductRepository } from '$lib/models/Product';

class ProductRepositoryImpl implements ProductRepository {
	async getAll(): Promise<Product[]> {
		const { data, error } = await supabase
			.from('products')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) throw new Error(`Failed to fetch products: ${error.message}`);
		return data || [];
	}

	async search(query: string): Promise<Product[]> {
		if (!query || query.trim().length === 0) {
			return this.getAll();
		}

		const searchTerm = `%${query.trim()}%`;
		
		// Search in both name and description fields
		const { data: nameData } = await supabase
			.from('products')
			.select('*')
			.ilike('name', searchTerm)
			.order('created_at', { ascending: false });
		
		const { data: descData } = await supabase
			.from('products')
			.select('*')
			.ilike('description', searchTerm)
			.order('created_at', { ascending: false });
		
		// Combine and deduplicate results
		const combined = [...(nameData || []), ...(descData || [])];
		const unique = combined.filter((product, index, self) => 
			index === self.findIndex(p => p.id === product.id)
		);
		
		return unique;
	}

	async getByCategory(categoryId: string): Promise<Product[]> {
		const { data, error } = await supabase
			.from('products')
			.select('*')
			.eq('component_category_id', categoryId)
			.order('created_at', { ascending: false });

		if (error) throw new Error(`Failed to fetch products by category: ${error.message}`);
		return data || [];
	}

	async getById(id: string): Promise<Product | null> {
		const { data, error } = await supabase.from('products').select('*').eq('id', id).single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw new Error(`Failed to fetch product: ${error.message}`);
		}
		return data;
	}

	async create(input: CreateProductDTO): Promise<Product> {
		const insertData = {
			...input,
			cost_price: input.cost_price ?? 0,
			component_category_id: input.component_category_id || null,
			brand: input.brand || null,
			specifications: input.specifications || null
		};
		const { data, error } = await supabase.from('products').insert(insertData).select().single();

		if (error) throw new Error(`Failed to create product: ${error.message}`);
		return data;
	}

	async update(id: string, input: UpdateProductDTO): Promise<Product> {
		const { data, error } = await supabase
			.from('products')
			.update({ ...input, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update product: ${error.message}`);
		return data;
	}

	async delete(id: string): Promise<void> {
		const { error } = await supabase.from('products').delete().eq('id', id);

		if (error) throw new Error(`Failed to delete product: ${error.message}`);
	}
}

// SERVICE: Business logic layer
export class ProductService {
	private repository: ProductRepository;

	constructor(repository?: ProductRepository) {
		this.repository = repository || new ProductRepositoryImpl();
	}

	/**
	 * Get all products
	 */
	async getAllProducts(): Promise<Product[]> {
		return await this.repository.getAll();
	}

	/**
	 * Search products by name or description
	 */
	async searchProducts(query: string): Promise<Product[]> {
		return await this.repository.search(query);
	}

	/**
	 * Get products by category ID
	 */
	async getProductsByCategory(categoryId: string): Promise<Product[]> {
		if (!categoryId) throw new Error('Category ID is required');
		return await this.repository.getByCategory(categoryId);
	}

	/**
	 * Filter products with advanced filters
	 */
	async filterProducts(filters: {
		search?: string;
		categoryId?: string;
		brand?: string;
		stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'all';
		minPrice?: number;
		maxPrice?: number;
		startDate?: string;
		endDate?: string;
	}): Promise<Product[]> {
		let query = supabase
			.from('products')
			.select('*')
			.order('created_at', { ascending: false });

		// Search filter
		if (filters.search && filters.search.trim()) {
			const searchTerm = `%${filters.search.trim()}%`;
			query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`);
		}

		// Category filter
		if (filters.categoryId) {
			query = query.eq('component_category_id', filters.categoryId);
		}

		// Brand filter
		if (filters.brand) {
			query = query.ilike('brand', `%${filters.brand}%`);
		}

		// Stock status filter
		if (filters.stockStatus) {
			switch (filters.stockStatus) {
				case 'in_stock':
					query = query.gt('stock', 0);
					break;
				case 'low_stock':
					query = query.gt('stock', 0).lte('stock', 10);
					break;
				case 'out_of_stock':
					query = query.eq('stock', 0);
					break;
				// 'all' doesn't add any filter
			}
		}

		// Price range filter
		if (filters.minPrice !== undefined) {
			query = query.gte('price', filters.minPrice);
		}
		if (filters.maxPrice !== undefined) {
			query = query.lte('price', filters.maxPrice);
		}

		// Date range filter (created_at)
		if (filters.startDate) {
			query = query.gte('created_at', filters.startDate);
		}
		if (filters.endDate) {
			query = query.lte('created_at', filters.endDate);
		}

		const { data, error } = await query;

		if (error) throw new Error(`Failed to filter products: ${error.message}`);
		return data || [];
	}

	/**
	 * Get product by ID
	 */
	async getProductById(id: string): Promise<Product> {
		if (!id) throw new Error('Product ID is required');

		const product = await this.repository.getById(id);
		if (!product) throw new Error('Product not found');

		return product;
	}

	/**
	 * Create product with validation
	 */
	async createProduct(input: CreateProductDTO): Promise<Product> {
		// Validate name
		if (!input.name || input.name.trim().length < 2) {
			throw new Error('Product name must be at least 2 characters');
		}

		// Validate description
		if (!input.description || input.description.trim().length < 5) {
			throw new Error('Product description must be at least 5 characters');
		}

		// Validate price
		if (input.price < 0) {
			throw new Error('Price cannot be negative');
		}

		// Validate cost_price
		const costPrice = input.cost_price || 0;
		if (costPrice < 0) {
			throw new Error('Cost price cannot be negative');
		}

		// Validate stock
		if (input.stock < 0) {
			throw new Error('Stock cannot be negative');
		}

		return await this.repository.create(input);
	}

	/**
	 * Update product with validation
	 */
	async updateProduct(id: string, input: UpdateProductDTO): Promise<Product> {
		if (!id) throw new Error('Product ID is required');

		if (input.name && input.name.trim().length < 2) {
			throw new Error('Product name must be at least 2 characters');
		}

		if (input.description && input.description.trim().length < 5) {
			throw new Error('Product description must be at least 5 characters');
		}

		if (input.price !== undefined && input.price < 0) {
			throw new Error('Price cannot be negative');
		}

		if (input.cost_price !== undefined && input.cost_price < 0) {
			throw new Error('Cost price cannot be negative');
		}

		if (input.stock !== undefined && input.stock < 0) {
			throw new Error('Stock cannot be negative');
		}

		return await this.repository.update(id, input);
	}

	/**
	 * Delete product
	 */
	async deleteProduct(id: string): Promise<void> {
		if (!id) throw new Error('Product ID is required');
		await this.repository.delete(id);
	}
}

// Export singleton instance
export const productService = new ProductService();


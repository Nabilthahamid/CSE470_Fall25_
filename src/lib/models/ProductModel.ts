// MODEL: Product Model (Pure MVC - Data + Business Logic + Data Access)
import { supabase } from '$lib/config/supabase';
import type { Product, CreateProductDTO, UpdateProductDTO } from './Product';

export class ProductModel {
	// Data properties
	id: string;
	name: string;
	description: string;
	price: number;
	cost_price: number;
	stock: number;
	image_url?: string | null;
	component_category_id?: string | null;
	brand?: string | null;
	specifications?: string | null;
	tags?: string[];
	related_product_ids?: string[];
	slug?: string;
	meta_title?: string;
	meta_description?: string;
	images?: string[];
	created_at?: string;
	updated_at?: string;
	component_category_name?: string;

	constructor(data: Product) {
		this.id = data.id;
		this.name = data.name;
		this.description = data.description;
		this.price = data.price;
		this.cost_price = data.cost_price ?? 0;
		this.stock = data.stock ?? 0;
		this.image_url = data.image_url ?? null;
		this.component_category_id = data.component_category_id ?? null;
		this.brand = data.brand ?? null;
		this.specifications = data.specifications ?? null;
		this.tags = data.tags;
		this.related_product_ids = data.related_product_ids;
		this.slug = data.slug;
		this.meta_title = data.meta_title;
		this.meta_description = data.meta_description;
		this.images = data.images;
		this.created_at = data.created_at;
		this.updated_at = data.updated_at;
		this.component_category_name = data.component_category_name;
	}

	// BUSINESS LOGIC: Validation
	validate(): void {
		if (!this.name || this.name.trim().length < 2) {
			throw new Error('Product name must be at least 2 characters');
		}

		if (!this.description || this.description.trim().length < 5) {
			throw new Error('Product description must be at least 5 characters');
		}

		if (this.price < 0) {
			throw new Error('Product price cannot be negative');
		}

		if (this.cost_price < 0) {
			throw new Error('Product cost price cannot be negative');
		}

		if (this.stock < 0) {
			throw new Error('Product stock cannot be negative');
		}
	}

	validateUpdate(input: UpdateProductDTO): void {
		if (input.name !== undefined && input.name.trim().length < 2) {
			throw new Error('Product name must be at least 2 characters');
		}

		if (input.description !== undefined && input.description.trim().length < 5) {
			throw new Error('Product description must be at least 5 characters');
		}

		if (input.price !== undefined && input.price < 0) {
			throw new Error('Product price cannot be negative');
		}

		if (input.cost_price !== undefined && input.cost_price < 0) {
			throw new Error('Product cost price cannot be negative');
		}

		if (input.stock !== undefined && input.stock < 0) {
			throw new Error('Product stock cannot be negative');
		}
	}

	// BUSINESS LOGIC: Check if product is in stock
	isInStock(quantity: number = 1): boolean {
		return this.stock >= quantity;
	}

	// BUSINESS LOGIC: Check if product is low stock
	isLowStock(threshold: number = 10): boolean {
		return this.stock > 0 && this.stock <= threshold;
	}

	// BUSINESS LOGIC: Check if product is out of stock
	isOutOfStock(): boolean {
		return this.stock === 0;
	}

	// DATA ACCESS: Get all products (static method)
	static async getAll(): Promise<ProductModel[]> {
		const { data, error } = await supabase
			.from('products')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			if (error.code === '42P01' || error.message.includes('does not exist')) {
				return [];
			}
			throw new Error(`Failed to fetch products: ${error.message}`);
		}
		
		return (data || []).map(item => new ProductModel(item as Product));
	}

	// DATA ACCESS: Get product by ID (static method)
	static async getById(id: string): Promise<ProductModel | null> {
		if (!id) throw new Error('Product ID is required');

		const { data, error } = await supabase
			.from('products')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw new Error(`Failed to fetch product: ${error.message}`);
		}

		return data ? new ProductModel(data as Product) : null;
	}

	// DATA ACCESS: Search products (static method)
	static async search(query: string): Promise<ProductModel[]> {
		if (!query || query.trim().length === 0) {
			return await this.getAll();
		}

		const searchTerm = `%${query.trim()}%`;
		
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
		
		return unique.map(item => new ProductModel(item as Product));
	}

	// DATA ACCESS: Get products by category (static method)
	static async getByCategory(categoryId: string): Promise<ProductModel[]> {
		if (!categoryId) throw new Error('Category ID is required');

		const { data, error } = await supabase
			.from('products')
			.select('*')
			.eq('component_category_id', categoryId)
			.order('created_at', { ascending: false });

		if (error) throw new Error(`Failed to fetch products by category: ${error.message}`);
		return (data || []).map(item => new ProductModel(item as Product));
	}

	// DATA ACCESS: Filter products (static method)
	static async filter(filters: {
		search?: string;
		categoryId?: string;
		brand?: string;
		stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'all';
		minPrice?: number;
		maxPrice?: number;
		startDate?: string;
		endDate?: string;
	}): Promise<ProductModel[]> {
		try {
			// If search is provided, use search method and then apply other filters
			if (filters.search && filters.search.trim()) {
				const searchResults = await this.search(filters.search);
				return this.applyFilters(searchResults, filters);
			}

			// Build query for non-search filters
			let query = supabase
				.from('products')
				.select('*')
				.order('created_at', { ascending: false });

			if (filters.categoryId) {
				query = query.eq('component_category_id', filters.categoryId);
			}

			if (filters.brand) {
				query = query.ilike('brand', `%${filters.brand}%`);
			}

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
				}
			}

			if (filters.minPrice !== undefined) {
				query = query.gte('price', filters.minPrice);
			}
			if (filters.maxPrice !== undefined) {
				query = query.lte('price', filters.maxPrice);
			}

			if (filters.startDate) {
				query = query.gte('created_at', filters.startDate);
			}
			if (filters.endDate) {
				query = query.lte('created_at', filters.endDate);
			}

			const { data, error } = await query;

			if (error) {
				if (error.code === '42P01' || error.message.includes('does not exist')) {
					return [];
				}
				throw new Error(`Failed to filter products: ${error.message}`);
			}
			
			return (data || []).map(item => new ProductModel(item as Product));
		} catch (error: any) {
			if (error.code === '42P01' || error?.message?.includes('does not exist')) {
				return [];
			}
			throw error;
		}
	}

	// BUSINESS LOGIC: Apply filters to array of products (private static method)
	private static applyFilters(products: ProductModel[], filters: {
		categoryId?: string;
		brand?: string;
		stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'all';
		minPrice?: number;
		maxPrice?: number;
		startDate?: string;
		endDate?: string;
	}): ProductModel[] {
		let filtered = [...products];

		if (filters.categoryId) {
			filtered = filtered.filter(p => p.component_category_id === filters.categoryId);
		}

		if (filters.brand) {
			const brandLower = filters.brand.toLowerCase();
			filtered = filtered.filter(p => p.brand?.toLowerCase().includes(brandLower));
		}

		if (filters.stockStatus) {
			switch (filters.stockStatus) {
				case 'in_stock':
					filtered = filtered.filter(p => p.stock > 0);
					break;
				case 'low_stock':
					filtered = filtered.filter(p => p.isLowStock());
					break;
				case 'out_of_stock':
					filtered = filtered.filter(p => p.isOutOfStock());
					break;
			}
		}

		if (filters.minPrice !== undefined) {
			filtered = filtered.filter(p => p.price >= filters.minPrice!);
		}
		if (filters.maxPrice !== undefined) {
			filtered = filtered.filter(p => p.price <= filters.maxPrice!);
		}

		if (filters.startDate) {
			filtered = filtered.filter(p => {
				if (!p.created_at) return false;
				return p.created_at >= filters.startDate!;
			});
		}
		if (filters.endDate) {
			filtered = filtered.filter(p => {
				if (!p.created_at) return false;
				return p.created_at <= filters.endDate!;
			});
		}

		return filtered;
	}

	// DATA ACCESS: Create product (static method)
	static async create(input: CreateProductDTO): Promise<ProductModel> {
		// Create instance to validate
		const tempProduct = new ProductModel({
			id: '', // Temporary
			name: input.name,
			description: input.description,
			price: input.price,
			cost_price: input.cost_price ?? 0,
			stock: input.stock,
			image_url: input.image_url ?? null,
			component_category_id: input.component_category_id ?? null,
			brand: input.brand ?? null,
			specifications: input.specifications ?? null,
			tags: input.tags,
			related_product_ids: input.related_product_ids,
			slug: input.slug,
			meta_title: input.meta_title,
			meta_description: input.meta_description,
			images: input.images
		});

		// BUSINESS LOGIC: Validate
		tempProduct.validate();

		// DATA ACCESS: Insert into database
		const insertData = {
			...input,
			cost_price: input.cost_price ?? 0,
			component_category_id: input.component_category_id || null,
			brand: input.brand || null,
			specifications: input.specifications || null
		};

		const { data, error } = await supabase
			.from('products')
			.insert(insertData)
			.select()
			.single();

		if (error) throw new Error(`Failed to create product: ${error.message}`);
		
		return new ProductModel(data as Product);
	}

	// DATA ACCESS: Update product (instance method)
	async update(input: UpdateProductDTO): Promise<ProductModel> {
		// BUSINESS LOGIC: Validate update
		this.validateUpdate(input);

		// DATA ACCESS: Update in database
		const { data, error } = await supabase
			.from('products')
			.update({ ...input, updated_at: new Date().toISOString() })
			.eq('id', this.id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update product: ${error.message}`);

		// Update instance
		return new ProductModel(data as Product);
	}

	// DATA ACCESS: Delete product (instance method)
	async delete(): Promise<void> {
		const { error } = await supabase
			.from('products')
			.delete()
			.eq('id', this.id);

		if (error) throw new Error(`Failed to delete product: ${error.message}`);
	}

	// Convert to plain object (for compatibility with interfaces)
	toJSON(): Product {
		return {
			id: this.id,
			name: this.name,
			description: this.description,
			price: this.price,
			cost_price: this.cost_price,
			stock: this.stock,
			image_url: this.image_url,
			component_category_id: this.component_category_id,
			brand: this.brand,
			specifications: this.specifications,
			tags: this.tags,
			related_product_ids: this.related_product_ids,
			slug: this.slug,
			meta_title: this.meta_title,
			meta_description: this.meta_description,
			images: this.images,
			created_at: this.created_at,
			updated_at: this.updated_at,
			component_category_name: this.component_category_name
		};
	}
}

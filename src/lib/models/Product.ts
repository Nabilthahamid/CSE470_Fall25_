// MODEL: Product data structure and types
export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	cost_price: number;
	stock: number;
	image_url?: string | null;
	component_category_id?: string | null;
	brand?: string | null;
	specifications?: string | null; // JSON string or text
	tags?: string[]; // Product tags
	related_product_ids?: string[]; // Related/upsell products
	slug?: string; // URL-friendly slug
	meta_title?: string; // SEO meta title
	meta_description?: string; // SEO meta description
	images?: string[]; // Image gallery
	created_at?: string;
	updated_at?: string;
	// Joined data
	component_category_name?: string;
}

export interface CreateProductDTO {
	name: string;
	description: string;
	price: number;
	cost_price?: number;
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
}

export interface UpdateProductDTO {
	name?: string;
	description?: string;
	price?: number;
	cost_price?: number;
	stock?: number;
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
}

export interface ProductRepository {
	getAll(): Promise<Product[]>;
	getById(id: string): Promise<Product | null>;
	create(data: CreateProductDTO): Promise<Product>;
	update(id: string, data: UpdateProductDTO): Promise<Product>;
	delete(id: string): Promise<void>;
	search(query: string): Promise<Product[]>;
	getByCategory(categoryId: string): Promise<Product[]>;
}


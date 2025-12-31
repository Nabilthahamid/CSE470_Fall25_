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
}

export interface ProductRepository {
	getAll(): Promise<Product[]>;
	getById(id: string): Promise<Product | null>;
	create(data: CreateProductDTO): Promise<Product>;
	update(id: string, data: UpdateProductDTO): Promise<Product>;
	delete(id: string): Promise<void>;
	search(query: string): Promise<Product[]>;
}


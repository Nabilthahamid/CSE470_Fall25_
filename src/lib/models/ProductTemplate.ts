// MODEL: Product Templates data structures
export interface ProductTemplate {
	id?: string;
	name: string;
	description?: string;
	category_id?: string;
	brand?: string;
	base_price: number;
	cost_price?: number;
	specifications?: string;
	default_stock: number;
	tags?: string[];
	created_at?: string;
	updated_at?: string;
}

export interface CreateProductTemplateDTO {
	name: string;
	description?: string;
	category_id?: string;
	brand?: string;
	base_price: number;
	cost_price?: number;
	specifications?: string;
	default_stock: number;
	tags?: string[];
}

export interface UpdateProductTemplateDTO {
	name?: string;
	description?: string;
	category_id?: string;
	brand?: string;
	base_price?: number;
	cost_price?: number;
	specifications?: string;
	default_stock?: number;
	tags?: string[];
}


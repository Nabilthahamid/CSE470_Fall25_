// MODEL: Product Variants data structures
export interface ProductVariant {
	id?: string;
	product_id: string;
	name: string; // e.g., "Red - Large", "Blue - Small"
	sku?: string;
	attributes: Record<string, string>; // e.g., { color: "red", size: "large" }
	price?: number; // Variant-specific price (overrides product price if set)
	stock: number;
	image_url?: string;
	is_active: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface CreateProductVariantDTO {
	product_id: string;
	name: string;
	sku?: string;
	attributes: Record<string, string>;
	price?: number;
	stock: number;
	image_url?: string;
	is_active: boolean;
}

export interface UpdateProductVariantDTO {
	name?: string;
	sku?: string;
	attributes?: Record<string, string>;
	price?: number;
	stock?: number;
	image_url?: string;
	is_active?: boolean;
}

export interface VariantAttribute {
	name: string; // e.g., "Color", "Size"
	values: string[]; // e.g., ["Red", "Blue", "Green"]
}


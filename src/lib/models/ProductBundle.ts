// MODEL: Product Bundles data structures
export interface ProductBundle {
	id?: string;
	name: string;
	description?: string;
	bundle_price: number;
	regular_price: number; // Sum of individual product prices
	discount_percentage: number;
	products: BundleProduct[];
	is_active: boolean;
	image_url?: string;
	created_at?: string;
	updated_at?: string;
}

export interface BundleProduct {
	product_id: string;
	product_name?: string;
	quantity: number;
	price?: number; // Price at time of bundle creation
}

export interface CreateProductBundleDTO {
	name: string;
	description?: string;
	bundle_price: number;
	products: BundleProduct[];
	is_active: boolean;
	image_url?: string;
}

export interface UpdateProductBundleDTO {
	name?: string;
	description?: string;
	bundle_price?: number;
	products?: BundleProduct[];
	is_active?: boolean;
	image_url?: string;
}


// MODEL: Product Reviews data structures
export interface ProductReview {
	id?: string;
	product_id: string;
	user_id: string;
	user_name?: string;
	rating: number; // 1-5
	title?: string;
	comment?: string;
	is_verified_purchase: boolean;
	is_approved: boolean;
	is_featured: boolean;
	helpful_count: number;
	created_at?: string;
	updated_at?: string;
}

export interface CreateProductReviewDTO {
	product_id: string;
	user_id: string;
	rating: number;
	title?: string;
	comment?: string;
	is_verified_purchase: boolean;
}

export interface UpdateProductReviewDTO {
	rating?: number;
	title?: string;
	comment?: string;
	is_approved?: boolean;
	is_featured?: boolean;
}


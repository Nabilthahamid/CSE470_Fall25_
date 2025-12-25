// MODEL: Review data structure and types
export interface Review {
	id: string;
	product_id: string;
	user_id: string;
	rating: number;
	comment?: string | null;
	created_at?: string;
	updated_at?: string;
	// Joined data
	user_name?: string;
	product_name?: string;
}

export interface CreateReviewDTO {
	product_id: string;
	rating: number;
	comment?: string | null;
}

export interface UpdateReviewDTO {
	rating?: number;
	comment?: string | null;
}

export interface ReviewRepository {
	getAll(filters?: ReviewFilters): Promise<Review[]>;
	getById(id: string): Promise<Review | null>;
	getByProduct(productId: string): Promise<Review[]>;
	getByUser(userId: string): Promise<Review[]>;
	create(data: CreateReviewDTO, userId: string): Promise<Review>;
	update(id: string, userId: string, data: UpdateReviewDTO): Promise<Review>;
	delete(id: string, userId: string): Promise<void>;
	getProductAverageRating(productId: string): Promise<number>;
}

export interface ReviewFilters {
	productId?: string;
	userId?: string;
	minRating?: number;
}


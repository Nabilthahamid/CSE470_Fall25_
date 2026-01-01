// MODEL: PC Build data structure and types
import type { Product } from './Product';

export interface ComponentCategory {
	id: string;
	name: string;
	display_name: string;
	is_required: boolean;
	display_order: number;
	created_at?: string;
	updated_at?: string;
}

export interface PCBuildComponent {
	id: string;
	build_id: string;
	product_id: string;
	component_category_id: string;
	quantity: number;
	created_at?: string;
	// Joined data
	product?: Product;
	category?: ComponentCategory;
}

export interface PCBuild {
	id: string;
	user_id: string;
	name: string;
	description?: string | null;
	total_price: number;
	created_at?: string;
	updated_at?: string;
	// Community features
	is_public?: boolean;
	likes_count?: number;
	views_count?: number;
	average_rating?: number;
	ratings_count?: number;
	use_case?: string | null; // e.g., 'gaming', 'workstation', 'streaming', 'editing'
	tags?: string[] | null;
	featured?: boolean;
	image_url?: string | null;
	// Joined data
	components?: PCBuildComponent[];
	user?: { id: string; name: string; email: string };
	is_liked?: boolean; // Whether current user liked this build
	user_rating?: number; // Current user's rating if exists
}

export interface CreatePCBuildDTO {
	name: string;
	description?: string | null;
	components?: {
		product_id: string;
		component_category_id: string;
		quantity?: number;
	}[];
	is_public?: boolean;
	use_case?: string;
	tags?: string[];
	image_url?: string;
}

export interface UpdatePCBuildDTO {
	name?: string;
	description?: string | null;
	components?: {
		product_id: string;
		component_category_id: string;
		quantity?: number;
	}[];
	is_public?: boolean;
	use_case?: string;
	tags?: string[];
	image_url?: string;
	featured?: boolean;
}

export interface PCBuildRepository {
	getAll(userId?: string): Promise<PCBuild[]>;
	getById(id: string, userId?: string): Promise<PCBuild | null>;
	create(userId: string, data: CreatePCBuildDTO): Promise<PCBuild>;
	update(id: string, userId: string, data: UpdatePCBuildDTO): Promise<PCBuild>;
	delete(id: string, userId: string): Promise<void>;
}

export interface ComponentCategoryRepository {
	getAll(): Promise<ComponentCategory[]>;
	getById(id: string): Promise<ComponentCategory | null>;
	getByName(name: string): Promise<ComponentCategory | null>;
}

// Community Build Models
export interface BuildLike {
	id: string;
	build_id: string;
	user_id: string;
	created_at?: string;
	user?: { id: string; name: string };
}

export interface BuildComment {
	id: string;
	build_id: string;
	user_id: string;
	comment: string;
	created_at?: string;
	updated_at?: string;
	user?: { id: string; name: string; email: string };
}

export interface BuildRating {
	id: string;
	build_id: string;
	user_id: string;
	rating: number; // 1-5
	created_at?: string;
	updated_at?: string;
	user?: { id: string; name: string };
}

export interface CommunityBuildFilters {
	use_case?: string;
	min_price?: number;
	max_price?: number;
	min_rating?: number;
	sort_by?: 'popular' | 'recent' | 'rating' | 'price_low' | 'price_high';
	search?: string;
	tags?: string[];
	featured?: boolean;
}


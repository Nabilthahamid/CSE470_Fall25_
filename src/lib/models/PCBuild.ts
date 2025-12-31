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
	// Joined data
	components?: PCBuildComponent[];
}

export interface CreatePCBuildDTO {
	name: string;
	description?: string | null;
	components?: {
		product_id: string;
		component_category_id: string;
		quantity?: number;
	}[];
}

export interface UpdatePCBuildDTO {
	name?: string;
	description?: string | null;
	components?: {
		product_id: string;
		component_category_id: string;
		quantity?: number;
	}[];
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


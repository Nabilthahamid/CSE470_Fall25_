// MODEL: PC Build Model (Pure MVC - Data + Business Logic + Data Access)
import { supabase } from '$lib/config/supabase';
import type {
	PCBuild,
	PCBuildComponent,
	ComponentCategory,
	CreatePCBuildDTO,
	UpdatePCBuildDTO
} from './PCBuild';
import { ProductModel } from './ProductModel';

export class ComponentCategoryModel {
	// Data properties
	id: string;
	name: string;
	display_name: string;
	is_required: boolean;
	display_order: number;
	created_at?: string;
	updated_at?: string;

	constructor(data: ComponentCategory) {
		this.id = data.id;
		this.name = data.name;
		this.display_name = data.display_name;
		this.is_required = data.is_required;
		this.display_order = data.display_order;
		this.created_at = data.created_at;
		this.updated_at = data.updated_at;
	}

	// DATA ACCESS: Get all categories (static method)
	static async getAll(): Promise<ComponentCategoryModel[]> {
		try {
			const { data, error } = await supabase
				.from('component_categories')
				.select('*')
				.order('display_order', { ascending: true });

			if (error) {
				if (error.code === '42P01') return [];
				throw new Error(`Failed to fetch component categories: ${error.message}`);
			}
			return (data || []).map((item) => new ComponentCategoryModel(item as ComponentCategory));
		} catch (error) {
			return [];
		}
	}

	// DATA ACCESS: Get category by ID (static method)
	static async getById(id: string): Promise<ComponentCategoryModel | null> {
		if (!id) throw new Error('Category ID is required');

		const { data, error } = await supabase
			.from('component_categories')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch component category: ${error.message}`);
		}

		return data ? new ComponentCategoryModel(data as ComponentCategory) : null;
	}

	// DATA ACCESS: Get category by name (static method)
	static async getByName(name: string): Promise<ComponentCategoryModel | null> {
		if (!name) throw new Error('Category name is required');

		const { data, error } = await supabase
			.from('component_categories')
			.select('*')
			.eq('name', name)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch component category: ${error.message}`);
		}

		return data ? new ComponentCategoryModel(data as ComponentCategory) : null;
	}

	// Convert to plain object
	toJSON(): ComponentCategory {
		return {
			id: this.id,
			name: this.name,
			display_name: this.display_name,
			is_required: this.is_required,
			display_order: this.display_order,
			created_at: this.created_at,
			updated_at: this.updated_at
		};
	}
}

export class PCBuildComponentModel {
	// Data properties
	id: string;
	build_id: string;
	product_id: string;
	component_category_id: string;
	quantity: number;
	created_at?: string;
	product?: any;
	category?: ComponentCategory;

	constructor(data: PCBuildComponent) {
		this.id = data.id;
		this.build_id = data.build_id;
		this.product_id = data.product_id;
		this.component_category_id = data.component_category_id;
		this.quantity = data.quantity;
		this.created_at = data.created_at;
		this.product = data.product;
		this.category = data.category;
	}

	// Convert to plain object
	toJSON(): PCBuildComponent {
		return {
			id: this.id,
			build_id: this.build_id,
			product_id: this.product_id,
			component_category_id: this.component_category_id,
			quantity: this.quantity,
			created_at: this.created_at,
			product: this.product,
			category: this.category
		};
	}
}

export class PCBuildModel {
	// Data properties
	id: string;
	user_id: string;
	name: string;
	description?: string | null;
	total_price: number;
	created_at?: string;
	updated_at?: string;
	is_public?: boolean;
	likes_count?: number;
	views_count?: number;
	average_rating?: number;
	ratings_count?: number;
	use_case?: string | null;
	tags?: string[] | null;
	featured?: boolean;
	image_url?: string | null;
	components?: PCBuildComponent[];
	user?: { id: string; name: string; email: string };
	is_liked?: boolean;
	user_rating?: number;

	constructor(data: PCBuild) {
		this.id = data.id;
		this.user_id = data.user_id;
		this.name = data.name;
		this.description = data.description;
		this.total_price = data.total_price;
		this.created_at = data.created_at;
		this.updated_at = data.updated_at;
		this.is_public = data.is_public;
		this.likes_count = data.likes_count;
		this.views_count = data.views_count;
		this.average_rating = data.average_rating;
		this.ratings_count = data.ratings_count;
		this.use_case = data.use_case;
		this.tags = data.tags;
		this.featured = data.featured;
		this.image_url = data.image_url;
		this.components = data.components;
		this.user = data.user;
		this.is_liked = data.is_liked;
		this.user_rating = data.user_rating;
	}

	// BUSINESS LOGIC: Validation
	validate(): void {
		if (!this.name || this.name.trim().length === 0) {
			throw new Error('Build name is required');
		}
	}

	// DATA ACCESS: Get all builds (static method)
	static async getAll(userId?: string): Promise<PCBuildModel[]> {
		let query = supabase.from('pc_builds').select('*');

		if (userId) {
			query = query.eq('user_id', userId);
		}

		const { data, error } = await query.order('created_at', { ascending: false });

		if (error) throw new Error(`Failed to fetch PC builds: ${error.message}`);

		const builds = (data || []).map((item) => new PCBuildModel(item as PCBuild));
		
		// Load components for each build
		for (const build of builds) {
			build.components = await this.getBuildComponents(build.id);
		}

		return builds;
	}

	// DATA ACCESS: Get build by ID (static method)
	static async getById(id: string, userId?: string): Promise<PCBuildModel | null> {
		if (!id) throw new Error('Build ID is required');

		let query = supabase.from('pc_builds').select('*').eq('id', id);

		if (userId) {
			query = query.eq('user_id', userId);
		}

		const { data, error } = await query.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch PC build: ${error.message}`);
		}

		if (!data) return null;

		const build = new PCBuildModel(data as PCBuild);
		build.components = await this.getBuildComponents(id);
		return build;
	}

	// DATA ACCESS: Get build components (static method)
	static async getBuildComponents(buildId: string): Promise<PCBuildComponent[]> {
		const { data, error } = await supabase
			.from('pc_build_components')
			.select('*')
			.eq('build_id', buildId);

		if (error) throw new Error(`Failed to fetch build components: ${error.message}`);

		// Load product and category data
		const componentsWithData = await Promise.all(
			(data || []).map(async (component) => {
				const [productModel, categoryData] = await Promise.all([
					ProductModel.getById(component.product_id),
					supabase
						.from('component_categories')
						.select('*')
						.eq('id', component.component_category_id)
						.single()
				]);

				return {
					...component,
					product: productModel ? productModel.toJSON() : undefined,
					category: categoryData.data || undefined
				};
			})
		);

		return componentsWithData;
	}

	// DATA ACCESS: Create build (static method)
	static async create(userId: string, input: CreatePCBuildDTO): Promise<PCBuildModel> {
		// BUSINESS LOGIC: Validate
		if (!input.name || input.name.trim().length === 0) {
			throw new Error('Build name is required');
		}

		// BUSINESS LOGIC: Calculate total price
		let totalPrice = 0;
		if (input.components && input.components.length > 0) {
			for (const comp of input.components) {
				const productModel = await ProductModel.getById(comp.product_id);
				if (productModel) {
					totalPrice += productModel.price * (comp.quantity || 1);
				}
			}
		}

		// DATA ACCESS: Create build
		const { data: buildData, error: buildError } = await supabase
			.from('pc_builds')
			.insert({
				user_id: userId,
				name: input.name,
				description: input.description || null,
				total_price: totalPrice,
				is_public: input.is_public !== undefined ? input.is_public : true,
				use_case: input.use_case || null,
				tags: input.tags || null,
				image_url: input.image_url || null
			})
			.select()
			.single();

		if (buildError) throw new Error(`Failed to create PC build: ${buildError.message}`);

		// Add components
		if (input.components && input.components.length > 0) {
			const componentsToInsert = input.components.map((comp) => ({
				build_id: buildData.id,
				product_id: comp.product_id,
				component_category_id: comp.component_category_id,
				quantity: comp.quantity || 1
			}));

			const { error: compError } = await supabase
				.from('pc_build_components')
				.insert(componentsToInsert);

			if (compError) {
				// Rollback: delete the build
				await supabase.from('pc_builds').delete().eq('id', buildData.id);
				throw new Error(`Failed to add components: ${compError.message}`);
			}
		}

		const build = await this.getById(buildData.id, userId);
		if (!build) throw new Error('Failed to retrieve created build');
		return build;
	}

	// DATA ACCESS: Update build (instance method)
	async update(userId: string, input: UpdatePCBuildDTO): Promise<PCBuildModel> {
		// BUSINESS LOGIC: Verify ownership
		if (this.user_id !== userId) {
			throw new Error('Access denied');
		}

		// BUSINESS LOGIC: Calculate total price if components are being updated
		let totalPrice = this.total_price;
		if (input.components) {
			totalPrice = 0;
			for (const comp of input.components) {
				const productModel = await ProductModel.getById(comp.product_id);
				if (productModel) {
					totalPrice += productModel.price * (comp.quantity || 1);
				}
			}
		}

		// DATA ACCESS: Update build
		const updateData: any = {};
		if (input.name !== undefined) updateData.name = input.name;
		if (input.description !== undefined) updateData.description = input.description;
		if (input.components) updateData.total_price = totalPrice;
		if (input.is_public !== undefined) updateData.is_public = input.is_public;
		if (input.use_case !== undefined) updateData.use_case = input.use_case;
		if (input.tags !== undefined) updateData.tags = input.tags;
		if (input.image_url !== undefined) updateData.image_url = input.image_url;
		if (input.featured !== undefined) updateData.featured = input.featured;

		if (Object.keys(updateData).length > 0) {
			updateData.updated_at = new Date().toISOString();
			const { error } = await supabase
				.from('pc_builds')
				.update(updateData)
				.eq('id', this.id)
				.eq('user_id', userId);

			if (error) throw new Error(`Failed to update PC build: ${error.message}`);
		}

		// Update components if provided
		if (input.components) {
			// Delete existing components
			await supabase.from('pc_build_components').delete().eq('build_id', this.id);

			// Insert new components
			if (input.components.length > 0) {
				const componentsToInsert = input.components.map((comp) => ({
					build_id: this.id,
					product_id: comp.product_id,
					component_category_id: comp.component_category_id,
					quantity: comp.quantity || 1
				}));

				const { error: compError } = await supabase
					.from('pc_build_components')
					.insert(componentsToInsert);

				if (compError) {
					throw new Error(`Failed to update components: ${compError.message}`);
				}
			}
		}

		const updated = await PCBuildModel.getById(this.id, userId);
		if (!updated) throw new Error('Failed to retrieve updated build');
		return updated;
	}

	// DATA ACCESS: Delete build (instance method)
	async delete(userId: string): Promise<void> {
		// BUSINESS LOGIC: Verify ownership
		if (this.user_id !== userId) {
			throw new Error('Access denied');
		}

		const { error } = await supabase
			.from('pc_builds')
			.delete()
			.eq('id', this.id)
			.eq('user_id', userId);

		if (error) throw new Error(`Failed to delete PC build: ${error.message}`);
	}

	// Convert to plain object
	toJSON(): PCBuild {
		return {
			id: this.id,
			user_id: this.user_id,
			name: this.name,
			description: this.description,
			total_price: this.total_price,
			created_at: this.created_at,
			updated_at: this.updated_at,
			is_public: this.is_public,
			likes_count: this.likes_count,
			views_count: this.views_count,
			average_rating: this.average_rating,
			ratings_count: this.ratings_count,
			use_case: this.use_case,
			tags: this.tags,
			featured: this.featured,
			image_url: this.image_url,
			components: this.components,
			user: this.user,
			is_liked: this.is_liked,
			user_rating: this.user_rating
		};
	}
}


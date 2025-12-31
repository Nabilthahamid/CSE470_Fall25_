// SERVICE: PC Build business logic and data access layer
import { supabase } from '$lib/config/supabase';
import type {
	PCBuild,
	PCBuildComponent,
	ComponentCategory,
	CreatePCBuildDTO,
	UpdatePCBuildDTO,
	PCBuildRepository,
	ComponentCategoryRepository
} from '$lib/models/PCBuild';
import { productService } from './ProductService';

class ComponentCategoryRepositoryImpl implements ComponentCategoryRepository {
	async getAll(): Promise<ComponentCategory[]> {
		const { data, error } = await supabase
			.from('component_categories')
			.select('*')
			.order('display_order', { ascending: true });

		if (error) {
			// If table doesn't exist, return empty array
			if (error.code === '42P01' || error.message.includes('does not exist')) {
				return [];
			}
			throw new Error(`Failed to fetch component categories: ${error.message}`);
		}
		return data || [];
	}

	async getById(id: string): Promise<ComponentCategory | null> {
		const { data, error } = await supabase
			.from('component_categories')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch component category: ${error.message}`);
		}
		return data;
	}

	async getByName(name: string): Promise<ComponentCategory | null> {
		const { data, error } = await supabase
			.from('component_categories')
			.select('*')
			.eq('name', name)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch component category: ${error.message}`);
		}
		return data;
	}
}

class PCBuildRepositoryImpl implements PCBuildRepository {
	async getAll(userId?: string): Promise<PCBuild[]> {
		let query = supabase.from('pc_builds').select('*');

		if (userId) {
			query = query.eq('user_id', userId);
		}

		const { data, error } = await query.order('created_at', { ascending: false });

		if (error) throw new Error(`Failed to fetch PC builds: ${error.message}`);
		return data || [];
	}

	async getById(id: string, userId?: string): Promise<PCBuild | null> {
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

		// Load components
		const components = await this.getBuildComponents(id);
		return { ...data, components };
	}

	async getBuildComponents(buildId: string): Promise<PCBuildComponent[]> {
		const { data, error } = await supabase
			.from('pc_build_components')
			.select('*')
			.eq('build_id', buildId);

		if (error) throw new Error(`Failed to fetch build components: ${error.message}`);

		// Load product and category data
		const componentsWithData = await Promise.all(
			(data || []).map(async (component) => {
				const [product, category] = await Promise.all([
					productService.getProductById(component.product_id),
					supabase
						.from('component_categories')
						.select('*')
						.eq('id', component.component_category_id)
						.single()
				]);

				return {
					...component,
					product: product || undefined,
					category: category.data || undefined
				};
			})
		);

		return componentsWithData;
	}

	async create(userId: string, input: CreatePCBuildDTO): Promise<PCBuild> {
		// Calculate total price
		let totalPrice = 0;
		if (input.components && input.components.length > 0) {
			for (const comp of input.components) {
				const product = await productService.getProductById(comp.product_id);
				if (product) {
					totalPrice += product.price * (comp.quantity || 1);
				}
			}
		}

		// Create build
		const { data: buildData, error: buildError } = await supabase
			.from('pc_builds')
			.insert({
				user_id: userId,
				name: input.name,
				description: input.description || null,
				total_price: totalPrice
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

		return await this.getById(buildData.id, userId) || buildData;
	}

	async update(id: string, userId: string, input: UpdatePCBuildDTO): Promise<PCBuild> {
		// Verify ownership
		const existing = await this.getById(id, userId);
		if (!existing) {
			throw new Error('PC build not found or access denied');
		}

		// Calculate total price if components are being updated
		let totalPrice = existing.total_price;
		if (input.components) {
			totalPrice = 0;
			for (const comp of input.components) {
				const product = await productService.getProductById(comp.product_id);
				if (product) {
					totalPrice += product.price * (comp.quantity || 1);
				}
			}
		}

		// Update build
		const updateData: any = {};
		if (input.name !== undefined) updateData.name = input.name;
		if (input.description !== undefined) updateData.description = input.description;
		if (input.components) updateData.total_price = totalPrice;

		if (Object.keys(updateData).length > 0) {
			const { error } = await supabase
				.from('pc_builds')
				.update(updateData)
				.eq('id', id)
				.eq('user_id', userId);

			if (error) throw new Error(`Failed to update PC build: ${error.message}`);
		}

		// Update components if provided
		if (input.components) {
			// Delete existing components
			await supabase.from('pc_build_components').delete().eq('build_id', id);

			// Insert new components
			if (input.components.length > 0) {
				const componentsToInsert = input.components.map((comp) => ({
					build_id: id,
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

		return await this.getById(id, userId) || existing;
	}

	async delete(id: string, userId: string): Promise<void> {
		// Verify ownership
		const existing = await this.getById(id, userId);
		if (!existing) {
			throw new Error('PC build not found or access denied');
		}

		const { error } = await supabase
			.from('pc_builds')
			.delete()
			.eq('id', id)
			.eq('user_id', userId);

		if (error) throw new Error(`Failed to delete PC build: ${error.message}`);
	}
}

// SERVICE: Business logic layer
export class PCBuildService {
	private repository: PCBuildRepository;
	private categoryRepository: ComponentCategoryRepository;

	constructor(
		repository?: PCBuildRepository,
		categoryRepository?: ComponentCategoryRepository
	) {
		this.repository = repository || new PCBuildRepositoryImpl();
		this.categoryRepository = categoryRepository || new ComponentCategoryRepositoryImpl();
	}

	async getAllBuilds(userId?: string): Promise<PCBuild[]> {
		return await this.repository.getAll(userId);
	}

	async getBuildById(id: string, userId?: string): Promise<PCBuild> {
		const build = await this.repository.getById(id, userId);
		if (!build) throw new Error('PC build not found');
		return build;
	}

	async createBuild(userId: string, input: CreatePCBuildDTO): Promise<PCBuild> {
		if (!input.name || input.name.trim().length === 0) {
			throw new Error('Build name is required');
		}
		return await this.repository.create(userId, input);
	}

	async updateBuild(id: string, userId: string, input: UpdatePCBuildDTO): Promise<PCBuild> {
		return await this.repository.update(id, userId, input);
	}

	async deleteBuild(id: string, userId: string): Promise<void> {
		return await this.repository.delete(id, userId);
	}

	async getAllCategories(): Promise<ComponentCategory[]> {
		return await this.categoryRepository.getAll();
	}

	async getCategoryById(id: string): Promise<ComponentCategory> {
		const category = await this.categoryRepository.getById(id);
		if (!category) throw new Error('Component category not found');
		return category;
	}

	async getCategoryByName(name: string): Promise<ComponentCategory> {
		const category = await this.categoryRepository.getByName(name);
		if (!category) throw new Error('Component category not found');
		return category;
	}
}

export const pcBuildService = new PCBuildService();


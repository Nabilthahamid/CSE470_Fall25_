// SERVICE: Product Templates Management
import { supabase } from '$lib/config/supabase';
import type {
	ProductTemplate,
	CreateProductTemplateDTO,
	UpdateProductTemplateDTO
} from '$lib/models/ProductTemplate';

export class ProductTemplateService {
	/**
	 * Get all templates
	 */
	async getAllTemplates(): Promise<ProductTemplate[]> {
		try {
			const { data, error } = await supabase
				.from('product_templates')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) {
				if (error.code === '42P01') return [];
				throw new Error(`Failed to fetch templates: ${error.message}`);
			}
			return data || [];
		} catch (error) {
			return [];
		}
	}

	/**
	 * Get template by ID
	 */
	async getTemplateById(id: string): Promise<ProductTemplate | null> {
		const { data, error } = await supabase
			.from('product_templates')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch template: ${error.message}`);
		}
		return data;
	}

	/**
	 * Create template
	 */
	async createTemplate(template: CreateProductTemplateDTO): Promise<ProductTemplate> {
		const { data, error } = await supabase
			.from('product_templates')
			.insert({ ...template, created_at: new Date().toISOString() })
			.select()
			.single();

		if (error) throw new Error(`Failed to create template: ${error.message}`);
		return data;
	}

	/**
	 * Update template
	 */
	async updateTemplate(id: string, template: UpdateProductTemplateDTO): Promise<ProductTemplate> {
		const { data, error } = await supabase
			.from('product_templates')
			.update({ ...template, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update template: ${error.message}`);
		return data;
	}

	/**
	 * Delete template
	 */
	async deleteTemplate(id: string): Promise<void> {
		const { error } = await supabase.from('product_templates').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete template: ${error.message}`);
	}

	/**
	 * Create product from template
	 */
	async createProductFromTemplate(
		templateId: string,
		productName: string,
		overrides?: Partial<ProductTemplate>
	): Promise<any> {
		const template = await this.getTemplateById(templateId);
		if (!template) throw new Error('Template not found');

		// Import ProductService to create product
		const { productService } = await import('./ProductService');
		
		return productService.createProduct({
			name: productName,
			description: overrides?.description || template.description || '',
			price: overrides?.base_price || template.base_price,
			cost_price: overrides?.cost_price || template.cost_price,
			stock: overrides?.default_stock || template.default_stock,
			component_category_id: overrides?.category_id || template.category_id || null,
			brand: overrides?.brand || template.brand || null,
			specifications: overrides?.specifications || template.specifications || null,
			tags: overrides?.tags || template.tags
		});
	}
}

export const productTemplateService = new ProductTemplateService();


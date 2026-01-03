// MODEL: Campaign Model (Pure MVC - Data + Business Logic + Data Access)
import { supabase } from '$lib/config/supabase';
import type {
	PromotionalCampaign,
	CreateCampaignDTO,
	UpdateCampaignDTO,
	CampaignProduct
} from './Campaign';

export class CampaignModel {
	// Data properties
	id?: string;
	name: string;
	description?: string;
	campaign_type: 'flash_sale' | 'limited_time' | 'buy_x_get_y' | 'seasonal' | 'other';
	start_date: string;
	end_date: string;
	is_active: boolean;
	discount_id?: string;
	products?: CampaignProduct[];
	buy_x_get_y_config?: {
		buy_quantity: number;
		get_quantity: number;
		product_id?: string;
		discount_type: 'percentage' | 'fixed_amount' | 'free';
		discount_value?: number;
	};
	image_url?: string;
	created_at?: string;
	updated_at?: string;

	constructor(data: PromotionalCampaign) {
		this.id = data.id;
		this.name = data.name;
		this.description = data.description;
		this.campaign_type = data.campaign_type;
		this.start_date = data.start_date;
		this.end_date = data.end_date;
		this.is_active = data.is_active ?? false;
		this.discount_id = data.discount_id;
		this.products = data.products;
		this.buy_x_get_y_config = data.buy_x_get_y_config;
		this.image_url = data.image_url;
		this.created_at = data.created_at;
		this.updated_at = data.updated_at;
	}

	// BUSINESS LOGIC: Validation
	validate(): void {
		if (!this.name || this.name.trim().length < 2) {
			throw new Error('Campaign name must be at least 2 characters');
		}

		if (!this.start_date) {
			throw new Error('Start date is required');
		}

		if (!this.end_date) {
			throw new Error('End date is required');
		}

		const startDate = new Date(this.start_date);
		const endDate = new Date(this.end_date);

		if (isNaN(startDate.getTime())) {
			throw new Error('Invalid start date format');
		}

		if (isNaN(endDate.getTime())) {
			throw new Error('Invalid end date format');
		}

		if (endDate <= startDate) {
			throw new Error('End date must be after start date');
		}

		if (this.campaign_type === 'buy_x_get_y' && !this.buy_x_get_y_config) {
			throw new Error('Buy X Get Y configuration is required for this campaign type');
		}
	}

	validateUpdate(input: UpdateCampaignDTO): void {
		if (input.name !== undefined && input.name.trim().length < 2) {
			throw new Error('Campaign name must be at least 2 characters');
		}

		if (input.start_date !== undefined && input.end_date !== undefined) {
			const startDate = new Date(input.start_date);
			const endDate = new Date(input.end_date);

			if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
				throw new Error('Invalid date format');
			}

			if (endDate <= startDate) {
				throw new Error('End date must be after start date');
			}
		} else if (input.start_date !== undefined) {
			const startDate = new Date(input.start_date);
			const endDate = new Date(this.end_date);

			if (isNaN(startDate.getTime())) {
				throw new Error('Invalid start date format');
			}

			if (endDate <= startDate) {
				throw new Error('End date must be after start date');
			}
		} else if (input.end_date !== undefined) {
			const startDate = new Date(this.start_date);
			const endDate = new Date(input.end_date);

			if (isNaN(endDate.getTime())) {
				throw new Error('Invalid end date format');
			}

			if (endDate <= startDate) {
				throw new Error('End date must be after start date');
			}
		}
	}

	// BUSINESS LOGIC: Check if campaign is currently active
	isCurrentlyActive(): boolean {
		if (!this.is_active) return false;

		const now = new Date();
		const startDate = new Date(this.start_date);
		const endDate = new Date(this.end_date);

		return now >= startDate && now <= endDate;
	}

	// BUSINESS LOGIC: Check if campaign is upcoming
	isUpcoming(): boolean {
		if (!this.is_active) return false;

		const now = new Date();
		const startDate = new Date(this.start_date);

		return now < startDate;
	}

	// BUSINESS LOGIC: Check if campaign is expired
	isExpired(): boolean {
		const now = new Date();
		const endDate = new Date(this.end_date);

		return now > endDate;
	}

	// BUSINESS LOGIC: Convert to plain object for JSON serialization
	toJSON(): PromotionalCampaign {
		return {
			id: this.id,
			name: this.name,
			description: this.description,
			campaign_type: this.campaign_type,
			start_date: this.start_date,
			end_date: this.end_date,
			is_active: this.is_active,
			discount_id: this.discount_id,
			products: this.products,
			buy_x_get_y_config: this.buy_x_get_y_config,
			image_url: this.image_url,
			created_at: this.created_at,
			updated_at: this.updated_at
		};
	}

	// DATA ACCESS: Get all campaigns
	static async getAll(): Promise<CampaignModel[]> {
		try {
			const { data, error } = await supabase
				.from('promotional_campaigns')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) {
				if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
					return [];
				}
				throw new Error(`Failed to fetch campaigns: ${error.message}`);
			}

			return (data || []).map((item) => new CampaignModel(item as PromotionalCampaign));
		} catch (error) {
			console.error('Error fetching campaigns:', error);
			return [];
		}
	}

	// DATA ACCESS: Get campaign by ID
	static async getById(id: string): Promise<CampaignModel | null> {
		try {
			const { data, error } = await supabase
				.from('promotional_campaigns')
				.select('*')
				.eq('id', id)
				.single();

			if (error) {
				if (error.code === 'PGRST116') {
					return null; // Not found
				}
				if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
					return null;
				}
				throw new Error(`Failed to fetch campaign: ${error.message}`);
			}

			return data ? new CampaignModel(data as PromotionalCampaign) : null;
		} catch (error) {
			console.error('Error fetching campaign:', error);
			return null;
		}
	}

	// DATA ACCESS: Get active campaigns
	static async getActive(): Promise<CampaignModel[]> {
		try {
			const now = new Date().toISOString();
			const { data, error } = await supabase
				.from('promotional_campaigns')
				.select('*')
				.eq('is_active', true)
				.lte('start_date', now)
				.gte('end_date', now)
				.order('created_at', { ascending: false });

			if (error) {
				if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
					return [];
				}
				throw new Error(`Failed to fetch active campaigns: ${error.message}`);
			}

			// Filter campaigns that are currently active (between start and end date)
			const campaigns = (data || []).map((item) => new CampaignModel(item as PromotionalCampaign));
			return campaigns.filter((campaign) => campaign.isCurrentlyActive());
		} catch (error) {
			console.error('Error fetching active campaigns:', error);
			return [];
		}
	}

	// DATA ACCESS: Create campaign
	static async create(dto: CreateCampaignDTO): Promise<CampaignModel> {
		const campaign = new CampaignModel({
			...dto,
			id: undefined,
			created_at: undefined,
			updated_at: undefined
		});

		campaign.validate();

		try {
			// Prepare data for database (handle JSON fields)
			const dbData: any = {
				name: campaign.name,
				description: campaign.description,
				campaign_type: campaign.campaign_type,
				start_date: campaign.start_date,
				end_date: campaign.end_date,
				is_active: campaign.is_active,
				discount_id: campaign.discount_id,
				image_url: campaign.image_url
			};

			// Handle JSON fields
			if (campaign.products) {
				dbData.products = JSON.stringify(campaign.products);
			}

			if (campaign.buy_x_get_y_config) {
				dbData.buy_x_get_y_config = JSON.stringify(campaign.buy_x_get_y_config);
			}

			const { data, error } = await supabase
				.from('promotional_campaigns')
				.insert(dbData)
				.select()
				.single();

			if (error) {
				if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
					throw new Error('Promotional campaigns table does not exist. Please create the table in your database first.');
				}
				throw new Error(`Failed to create campaign: ${error.message}`);
			}

			// Parse JSON fields back
			if (data.products && typeof data.products === 'string') {
				data.products = JSON.parse(data.products);
			}

			if (data.buy_x_get_y_config && typeof data.buy_x_get_y_config === 'string') {
				data.buy_x_get_y_config = JSON.parse(data.buy_x_get_y_config);
			}

			return new CampaignModel(data as PromotionalCampaign);
		} catch (error) {
			console.error('Error creating campaign:', error);
			throw error;
		}
	}

	// DATA ACCESS: Update campaign
	static async update(id: string, dto: UpdateCampaignDTO): Promise<CampaignModel> {
		const existing = await CampaignModel.getById(id);
		if (!existing) {
			throw new Error('Campaign not found');
		}

		// Create temporary instance for validation
		const tempCampaign = new CampaignModel({
			...existing.toJSON(),
			...dto
		});

		tempCampaign.validateUpdate(dto);

		try {
			// Prepare update data
			const updateData: any = {};

			if (dto.name !== undefined) updateData.name = dto.name;
			if (dto.description !== undefined) updateData.description = dto.description;
			if (dto.campaign_type !== undefined) updateData.campaign_type = dto.campaign_type;
			if (dto.start_date !== undefined) updateData.start_date = dto.start_date;
			if (dto.end_date !== undefined) updateData.end_date = dto.end_date;
			if (dto.is_active !== undefined) updateData.is_active = dto.is_active;
			if (dto.discount_id !== undefined) updateData.discount_id = dto.discount_id;
			if (dto.image_url !== undefined) updateData.image_url = dto.image_url;

			// Handle JSON fields
			if (dto.products !== undefined) {
				updateData.products = JSON.stringify(dto.products);
			}

			if (dto.buy_x_get_y_config !== undefined) {
				updateData.buy_x_get_y_config = JSON.stringify(dto.buy_x_get_y_config);
			}

			updateData.updated_at = new Date().toISOString();

			const { data, error } = await supabase
				.from('promotional_campaigns')
				.update(updateData)
				.eq('id', id)
				.select()
				.single();

			if (error) {
				if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
					throw new Error('Promotional campaigns table does not exist.');
				}
				throw new Error(`Failed to update campaign: ${error.message}`);
			}

			// Parse JSON fields back
			if (data.products && typeof data.products === 'string') {
				data.products = JSON.parse(data.products);
			}

			if (data.buy_x_get_y_config && typeof data.buy_x_get_y_config === 'string') {
				data.buy_x_get_y_config = JSON.parse(data.buy_x_get_y_config);
			}

			return new CampaignModel(data as PromotionalCampaign);
		} catch (error) {
			console.error('Error updating campaign:', error);
			throw error;
		}
	}

	// DATA ACCESS: Delete campaign
	static async delete(id: string): Promise<void> {
		try {
			const { error } = await supabase.from('promotional_campaigns').delete().eq('id', id);

			if (error) {
				if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
					throw new Error('Promotional campaigns table does not exist.');
				}
				throw new Error(`Failed to delete campaign: ${error.message}`);
			}
		} catch (error) {
			console.error('Error deleting campaign:', error);
			throw error;
		}
	}
}


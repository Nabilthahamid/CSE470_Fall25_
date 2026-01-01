// SERVICE: Promotional Campaigns Management
import { supabase } from '$lib/config/supabase';
import type {
	PromotionalCampaign,
	CreateCampaignDTO,
	UpdateCampaignDTO
} from '$lib/models/Campaign';

export class CampaignService {
	/**
	 * Get all campaigns
	 */
	async getAllCampaigns(): Promise<PromotionalCampaign[]> {
		try {
			const { data, error } = await supabase
				.from('promotional_campaigns')
				.select('*')
				.order('start_date', { ascending: false });

			if (error) {
				if (error.code === '42P01') return [];
				throw new Error(`Failed to fetch campaigns: ${error.message}`);
			}
			return data || [];
		} catch (error) {
			return [];
		}
	}

	/**
	 * Get active campaigns
	 */
	async getActiveCampaigns(): Promise<PromotionalCampaign[]> {
		const campaigns = await this.getAllCampaigns();
		const now = new Date().toISOString();
		return campaigns.filter(
			(c) =>
				c.is_active &&
				c.start_date <= now &&
				c.end_date >= now
		);
	}

	/**
	 * Get campaign by ID
	 */
	async getCampaignById(id: string): Promise<PromotionalCampaign | null> {
		const { data, error } = await supabase
			.from('promotional_campaigns')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch campaign: ${error.message}`);
		}
		return data;
	}

	/**
	 * Create campaign
	 */
	async createCampaign(campaign: CreateCampaignDTO): Promise<PromotionalCampaign> {
		const { data, error } = await supabase
			.from('promotional_campaigns')
			.insert({ ...campaign, created_at: new Date().toISOString() })
			.select()
			.single();

		if (error) throw new Error(`Failed to create campaign: ${error.message}`);
		return data;
	}

	/**
	 * Update campaign
	 */
	async updateCampaign(id: string, campaign: UpdateCampaignDTO): Promise<PromotionalCampaign> {
		const { data, error } = await supabase
			.from('promotional_campaigns')
			.update({ ...campaign, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update campaign: ${error.message}`);
		return data;
	}

	/**
	 * Delete campaign
	 */
	async deleteCampaign(id: string): Promise<void> {
		const { error } = await supabase.from('promotional_campaigns').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete campaign: ${error.message}`);
	}

	/**
	 * Get campaigns by type
	 */
	async getCampaignsByType(type: string): Promise<PromotionalCampaign[]> {
		const campaigns = await this.getAllCampaigns();
		return campaigns.filter((c) => c.campaign_type === type);
	}

	/**
	 * Get upcoming campaigns
	 */
	async getUpcomingCampaigns(): Promise<PromotionalCampaign[]> {
		const campaigns = await this.getAllCampaigns();
		const now = new Date().toISOString();
		return campaigns.filter((c) => c.is_active && c.start_date > now);
	}
}

export const campaignService = new CampaignService();


// SERVICE: Email Marketing Management
import { supabase } from '$lib/config/supabase';
import type {
	Newsletter,
	EmailSequence,
	EmailCampaign,
	CreateNewsletterDTO,
	CreateEmailSequenceDTO,
	CreateEmailCampaignDTO,
	EmailAnalytics
} from '$lib/models/EmailMarketing';

export class EmailMarketingService {
	/**
	 * Get all newsletters
	 */
	async getAllNewsletters(): Promise<Newsletter[]> {
		try {
			const { data, error } = await supabase
				.from('newsletters')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) {
				if (error.code === '42P01') return [];
				throw new Error(`Failed to fetch newsletters: ${error.message}`);
			}
			return data || [];
		} catch (error) {
			return [];
		}
	}

	/**
	 * Create newsletter
	 */
	async createNewsletter(newsletter: CreateNewsletterDTO): Promise<Newsletter> {
		const { data, error } = await supabase
			.from('newsletters')
			.insert({
				...newsletter,
				status: newsletter.scheduled_at ? 'scheduled' : 'draft',
				opened_count: 0,
				clicked_count: 0,
				created_at: new Date().toISOString()
			})
			.select()
			.single();

		if (error) throw new Error(`Failed to create newsletter: ${error.message}`);
		return data;
	}

	/**
	 * Update newsletter
	 */
	async updateNewsletter(id: string, newsletter: Partial<CreateNewsletterDTO>): Promise<Newsletter> {
		const { data, error } = await supabase
			.from('newsletters')
			.update({ ...newsletter, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update newsletter: ${error.message}`);
		return data;
	}

	/**
	 * Delete newsletter
	 */
	async deleteNewsletter(id: string): Promise<void> {
		const { error } = await supabase.from('newsletters').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete newsletter: ${error.message}`);
	}

	/**
	 * Get all email sequences
	 */
	async getAllSequences(): Promise<EmailSequence[]> {
		try {
			const { data, error } = await supabase
				.from('email_sequences')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) {
				if (error.code === '42P01') return [];
				throw new Error(`Failed to fetch sequences: ${error.message}`);
			}
			return data || [];
		} catch (error) {
			return [];
		}
	}

	/**
	 * Create email sequence
	 */
	async createSequence(sequence: CreateEmailSequenceDTO): Promise<EmailSequence> {
		const { data, error } = await supabase
			.from('email_sequences')
			.insert({ ...sequence, created_at: new Date().toISOString() })
			.select()
			.single();

		if (error) throw new Error(`Failed to create sequence: ${error.message}`);
		return data;
	}

	/**
	 * Update email sequence
	 */
	async updateSequence(id: string, sequence: Partial<CreateEmailSequenceDTO>): Promise<EmailSequence> {
		const { data, error } = await supabase
			.from('email_sequences')
			.update({ ...sequence, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update sequence: ${error.message}`);
		return data;
	}

	/**
	 * Delete email sequence
	 */
	async deleteSequence(id: string): Promise<void> {
		const { error } = await supabase.from('email_sequences').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete sequence: ${error.message}`);
	}

	/**
	 * Get all email campaigns
	 */
	async getAllCampaigns(): Promise<EmailCampaign[]> {
		try {
			const { data, error } = await supabase
				.from('email_campaigns')
				.select('*')
				.order('created_at', { ascending: false });

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
	 * Get email campaign by ID
	 */
	async getCampaignById(id: string): Promise<EmailCampaign | null> {
		const { data, error } = await supabase
			.from('email_campaigns')
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
	 * Create email campaign
	 */
	async createCampaign(campaign: CreateEmailCampaignDTO): Promise<EmailCampaign> {
		const { data, error } = await supabase
			.from('email_campaigns')
			.insert({
				...campaign,
				sent_count: 0,
				opened_count: 0,
				clicked_count: 0,
				bounced_count: 0,
				unsubscribed_count: 0,
				status: campaign.status || 'draft',
				created_at: new Date().toISOString()
			})
			.select()
			.single();

		if (error) throw new Error(`Failed to create campaign: ${error.message}`);
		return data;
	}

	/**
	 * Update email campaign
	 */
	async updateCampaign(id: string, campaign: Partial<CreateEmailCampaignDTO>): Promise<EmailCampaign> {
		const { data, error } = await supabase
			.from('email_campaigns')
			.update({ ...campaign, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update campaign: ${error.message}`);
		return data;
	}

	/**
	 * Delete email campaign
	 */
	async deleteCampaign(id: string): Promise<void> {
		const { error } = await supabase.from('email_campaigns').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete campaign: ${error.message}`);
	}

	/**
	 * Get email analytics
	 */
	async getEmailAnalytics(startDate?: string, endDate?: string): Promise<EmailAnalytics> {
		const campaigns = await this.getAllCampaigns();
		const newsletters = await this.getAllNewsletters();

		// Filter by date if provided
		let filteredCampaigns = campaigns;
		let filteredNewsletters = newsletters;

		if (startDate || endDate) {
			filteredCampaigns = campaigns.filter((c) => {
				if (startDate && c.created_at && c.created_at < startDate) return false;
				if (endDate && c.created_at && c.created_at > endDate) return false;
				return true;
			});

			filteredNewsletters = newsletters.filter((n) => {
				if (startDate && n.created_at && n.created_at < startDate) return false;
				if (endDate && n.created_at && n.created_at > endDate) return false;
				return true;
			});
		}

		const totalSent =
			filteredCampaigns.reduce((sum, c) => sum + c.sent_count, 0) +
			filteredNewsletters.reduce((sum, n) => sum + (n.recipient_count || 0), 0);

		const totalOpened =
			filteredCampaigns.reduce((sum, c) => sum + c.opened_count, 0) +
			filteredNewsletters.reduce((sum, n) => sum + n.opened_count, 0);

		const totalClicked =
			filteredCampaigns.reduce((sum, c) => sum + c.clicked_count, 0) +
			filteredNewsletters.reduce((sum, n) => sum + n.clicked_count, 0);

		const totalBounced = filteredCampaigns.reduce((sum, c) => sum + c.bounced_count, 0);
		const totalUnsubscribed = filteredCampaigns.reduce((sum, c) => sum + c.unsubscribed_count, 0);

		const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
		const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
		const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;
		const unsubscribeRate = totalSent > 0 ? (totalUnsubscribed / totalSent) * 100 : 0;

		// By campaign
		const byCampaign = filteredCampaigns.map((c) => ({
			campaign: c.name,
			sent: c.sent_count,
			opened: c.opened_count,
			clicked: c.clicked_count,
			openRate: c.sent_count > 0 ? (c.opened_count / c.sent_count) * 100 : 0,
			clickRate: c.sent_count > 0 ? (c.clicked_count / c.sent_count) * 100 : 0
		}));

		// By month
		const monthlyMap = new Map<string, { sent: number; opened: number; clicked: number }>();
		
		[...filteredCampaigns, ...filteredNewsletters].forEach((item) => {
			if (!item.created_at) return;
			const date = new Date(item.created_at);
			const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
			const existing = monthlyMap.get(monthKey) || { sent: 0, opened: 0, clicked: 0 };
			const sent = 'sent_count' in item ? item.sent_count : (item.recipient_count || 0);
			monthlyMap.set(monthKey, {
				sent: existing.sent + sent,
				opened: existing.opened + ('opened_count' in item ? item.opened_count : item.opened_count),
				clicked: existing.clicked + ('clicked_count' in item ? item.clicked_count : item.clicked_count)
			});
		});

		const byMonth = Array.from(monthlyMap.entries())
			.map(([month, data]) => ({ month, ...data }))
			.sort((a, b) => a.month.localeCompare(b.month));

		return {
			totalSent,
			totalOpened,
			totalClicked,
			openRate,
			clickRate,
			bounceRate,
			unsubscribeRate,
			byCampaign,
			byMonth
		};
	}
}

export const emailMarketingService = new EmailMarketingService();


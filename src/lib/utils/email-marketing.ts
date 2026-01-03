// UTILITY: Email marketing helper functions
import { supabase } from '$lib/config/supabase';

/**
 * Get all newsletters
 */
export async function getAllNewsletters(): Promise<any[]> {
	try {
		const { data, error } = await supabase
			.from('email_newsletters')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			// Handle table not found - return empty array
			if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
				return [];
			}
			throw new Error(`Failed to fetch newsletters: ${error.message}`);
		}
		return data || [];
	} catch (error) {
		return [];
	}
}

/**
 * Get all email sequences
 */
export async function getAllSequences(): Promise<any[]> {
	try {
		const { data, error } = await supabase
			.from('email_sequences')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			// Handle table not found - return empty array
			if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
				return [];
			}
			throw new Error(`Failed to fetch sequences: ${error.message}`);
		}
		return data || [];
	} catch (error) {
		return [];
	}
}

/**
 * Get all email campaigns
 */
export async function getAllCampaigns(): Promise<any[]> {
	try {
		const { data, error } = await supabase
			.from('email_campaigns')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			// Handle table not found - return empty array
			if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
				return [];
			}
			throw new Error(`Failed to fetch campaigns: ${error.message}`);
		}
		return data || [];
	} catch (error) {
		return [];
	}
}

/**
 * Get email analytics
 */
export async function getEmailAnalytics(startDate?: string, endDate?: string): Promise<any> {
	try {
		// Basic analytics - can be enhanced with actual email tracking data
		return {
			totalSent: 0,
			totalOpened: 0,
			totalClicked: 0,
			openRate: 0,
			clickRate: 0,
			bounceRate: 0,
			unsubscribeRate: 0,
			byCampaign: [],
			byMonth: []
		};
	} catch (error) {
		return {
			totalSent: 0,
			totalOpened: 0,
			totalClicked: 0,
			openRate: 0,
			clickRate: 0,
			bounceRate: 0,
			unsubscribeRate: 0,
			byCampaign: [],
			byMonth: []
		};
	}
}

/**
 * Create newsletter
 */
export async function createNewsletter(newsletter: any): Promise<any> {
	const { data, error } = await supabase
		.from('email_newsletters')
		.insert({ ...newsletter, created_at: new Date().toISOString() })
		.select()
		.single();

	if (error) {
		// Handle table not found error
		if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
			throw new Error('Email newsletters table does not exist. Please create the table in your database first.');
		}
		throw new Error(`Failed to create newsletter: ${error.message}`);
	}
	return data;
}

/**
 * Delete newsletter
 */
export async function deleteNewsletter(id: string): Promise<void> {
	const { error } = await supabase
		.from('email_newsletters')
		.delete()
		.eq('id', id);

	if (error) {
		if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
			throw new Error('Email newsletters table does not exist.');
		}
		throw new Error(`Failed to delete newsletter: ${error.message}`);
	}
}

/**
 * Create email sequence
 */
export async function createSequence(sequence: any): Promise<any> {
	const { data, error } = await supabase
		.from('email_sequences')
		.insert({ ...sequence, created_at: new Date().toISOString() })
		.select()
		.single();

	if (error) {
		if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
			throw new Error('Email sequences table does not exist. Please create the table in your database first.');
		}
		throw new Error(`Failed to create sequence: ${error.message}`);
	}
	return data;
}

/**
 * Delete email sequence
 */
export async function deleteSequence(id: string): Promise<void> {
	const { error } = await supabase
		.from('email_sequences')
		.delete()
		.eq('id', id);

	if (error) {
		if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
			throw new Error('Email sequences table does not exist.');
		}
		throw new Error(`Failed to delete sequence: ${error.message}`);
	}
}

/**
 * Create email campaign
 */
export async function createCampaign(campaign: any): Promise<any> {
	const { data, error } = await supabase
		.from('email_campaigns')
		.insert({ ...campaign, created_at: new Date().toISOString() })
		.select()
		.single();

	if (error) {
		if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
			throw new Error('Email campaigns table does not exist. Please create the table in your database first.');
		}
		throw new Error(`Failed to create campaign: ${error.message}`);
	}
	return data;
}

/**
 * Update email campaign
 */
export async function updateCampaign(id: string, campaign: any): Promise<any> {
	const { data, error } = await supabase
		.from('email_campaigns')
		.update({ ...campaign, updated_at: new Date().toISOString() })
		.eq('id', id)
		.select()
		.single();

	if (error) {
		if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
			throw new Error('Email campaigns table does not exist.');
		}
		throw new Error(`Failed to update campaign: ${error.message}`);
	}
	return data;
}

/**
 * Delete email campaign
 */
export async function deleteCampaign(id: string): Promise<void> {
	const { error } = await supabase
		.from('email_campaigns')
		.delete()
		.eq('id', id);

	if (error) {
		if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
			throw new Error('Email campaigns table does not exist.');
		}
		throw new Error(`Failed to delete campaign: ${error.message}`);
	}
}


// CONTROLLER: Email Marketing Page
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { emailMarketingService } from '$lib/services/EmailMarketingService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, url }) => {
	requireAdmin(locals.user);

	try {
		const startDate = url.searchParams.get('startDate') || undefined;
		const endDate = url.searchParams.get('endDate') || undefined;
		const activeTab = url.searchParams.get('tab') || 'newsletters';

		const [newsletters, sequences, campaigns, analytics] = await Promise.all([
			emailMarketingService.getAllNewsletters(),
			emailMarketingService.getAllSequences(),
			emailMarketingService.getAllCampaigns(),
			emailMarketingService.getEmailAnalytics(startDate, endDate)
		]);

		return {
			activeTab,
			newsletters,
			sequences,
			campaigns,
			analytics,
			startDate: startDate || '',
			endDate: endDate || '',
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			activeTab: 'newsletters',
			newsletters: [],
			sequences: [],
			campaigns: [],
			analytics: {
				totalSent: 0,
				totalOpened: 0,
				totalClicked: 0,
				openRate: 0,
				clickRate: 0,
				bounceRate: 0,
				unsubscribeRate: 0,
				byCampaign: [],
				byMonth: []
			},
			startDate: '',
			endDate: '',
			error: message
		};
	}
};

export const actions: Actions = {
	createNewsletter: async ({ request }) => {
		const formData = await request.formData();
		const newsletter = {
			name: formData.get('name')?.toString() || '',
			subject: formData.get('subject')?.toString() || '',
			content: formData.get('content')?.toString() || '',
			content_type: (formData.get('content_type')?.toString() || 'html') as 'html' | 'text',
			recipient_type: (formData.get('recipient_type')?.toString() || 'all') as any,
			recipient_segment: formData.get('recipient_segment')?.toString() || undefined,
			scheduled_at: formData.get('scheduled_at')?.toString() || undefined
		};

		try {
			await emailMarketingService.createNewsletter(newsletter);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	deleteNewsletter: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';

		try {
			await emailMarketingService.deleteNewsletter(id);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	createSequence: async ({ request }) => {
		const formData = await request.formData();
		const emailsJson = formData.get('emails')?.toString() || '[]';

		const sequence = {
			name: formData.get('name')?.toString() || '',
			trigger: (formData.get('trigger')?.toString() || 'welcome') as any,
			trigger_delay: formData.get('trigger_delay') ? parseInt(formData.get('trigger_delay')?.toString() || '0') : undefined,
			emails: JSON.parse(emailsJson),
			is_active: formData.get('is_active')?.toString() === 'true'
		};

		try {
			await emailMarketingService.createSequence(sequence);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	deleteSequence: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';

		try {
			await emailMarketingService.deleteSequence(id);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	}
};


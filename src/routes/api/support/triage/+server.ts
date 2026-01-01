// API: Customer support triage
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { customerSupportTriageService } from '$lib/services/CustomerSupportTriageService';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { message } = await request.json();
		const userId = locals.user?.id;

		if (!message || typeof message !== 'string' || message.trim().length === 0) {
			return json({ error: 'Message is required' }, { status: 400 });
		}

		const triage = await customerSupportTriageService.triageInquiry(message.trim(), userId);
		const supportChannel = customerSupportTriageService.getSupportChannel(triage);

		return json({ triage, supportChannel });
	} catch (error: any) {
		console.error('Support triage error:', error);
		return json({ error: error.message || 'Failed to triage inquiry' }, { status: 500 });
	}
};


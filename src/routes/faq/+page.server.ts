// CONTROLLER: FAQ Page
import type { PageServerLoad } from './$types';
import { contentService } from '$lib/services/ContentService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async () => {
	try {
		const faqs = await contentService.getAllFAQs();
		// Filter published FAQs
		const publishedFAQs = faqs.filter((faq) => faq.is_published);
		// Sort by order
		publishedFAQs.sort((a, b) => (a.order || 0) - (b.order || 0));

		// Group by category if categories exist
		const faqsByCategory: Record<string, any[]> = {};
		const uncategorizedFAQs: any[] = [];

		publishedFAQs.forEach((faq) => {
			if (faq.category) {
				if (!faqsByCategory[faq.category]) {
					faqsByCategory[faq.category] = [];
				}
				faqsByCategory[faq.category].push(faq);
			} else {
				uncategorizedFAQs.push(faq);
			}
		});

		return {
			faqs: publishedFAQs,
			faqsByCategory,
			uncategorizedFAQs,
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			faqs: [],
			faqsByCategory: {},
			uncategorizedFAQs: [],
			error: message
		};
	}
};


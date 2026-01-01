// CONTROLLER: FAQ Page
import type { PageServerLoad } from './$types';
import { contentService } from '$lib/services/ContentService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async () => {
	try {
		const faqs = await contentService.getAllFAQs();
		
		// Debug: Log all FAQs to see what we're getting
		console.log('All FAQs from database:', faqs);
		console.log('Total FAQs found:', faqs.length);
		
		// Filter published FAQs
		const publishedFAQs = faqs.filter((faq) => faq.is_published);
		const unpublishedFAQs = faqs.filter((faq) => !faq.is_published);
		
		console.log('Published FAQs:', publishedFAQs.length);
		console.log('Unpublished FAQs:', unpublishedFAQs.length);
		
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
			totalFAQs: faqs.length,
			publishedCount: publishedFAQs.length,
			unpublishedCount: unpublishedFAQs.length,
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		console.error('Error loading FAQs:', error);
		return {
			faqs: [],
			faqsByCategory: {},
			uncategorizedFAQs: [],
			totalFAQs: 0,
			publishedCount: 0,
			unpublishedCount: 0,
			error: message
		};
	}
};


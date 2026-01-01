// CONTROLLER: Content Management Page
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { contentService } from '$lib/services/ContentService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, url }) => {
	requireAdmin(locals.user);

	try {
		const activeTab = url.searchParams.get('tab') || 'homepage';

		// Use Promise.allSettled to handle individual service errors gracefully
		const results = await Promise.allSettled([
			contentService.getHomepageContent(),
			contentService.getAllBanners(),
			contentService.getAllPages(),
			contentService.getAllFAQs()
		]);

		const homepageContent = results[0].status === 'fulfilled' ? results[0].value : null;
		const banners = results[1].status === 'fulfilled' ? results[1].value : [];
		const pages = results[2].status === 'fulfilled' ? results[2].value : [];
		const faqs = results[3].status === 'fulfilled' ? results[3].value : [];

		return {
			activeTab,
			homepageContent,
			banners,
			pages,
			faqs,
			error: null
		};
	} catch (error) {
		console.error('Error loading content page:', error);
		const { message } = handleError(error);
		return {
			activeTab: 'homepage',
			homepageContent: null,
			banners: [],
			pages: [],
			faqs: [],
			error: message
		};
	}
};

export const actions: Actions = {
	updateHomepage: async ({ request }) => {
		const formData = await request.formData();
		const homepageContent = {
			hero_title: formData.get('hero_title')?.toString() || null,
			hero_subtitle: formData.get('hero_subtitle')?.toString() || null,
			hero_image_url: formData.get('hero_image_url')?.toString() || null,
			featured_section_title: formData.get('featured_section_title')?.toString() || null,
			featured_section_content: formData.get('featured_section_content')?.toString() || null
		};

		try {
			await contentService.updateHomepageContent(homepageContent);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	createBanner: async ({ request }) => {
		const formData = await request.formData();
		const banner = {
			title: formData.get('title')?.toString() || '',
			image_url: formData.get('image_url')?.toString() || '',
			link_url: formData.get('link_url')?.toString() || null,
			link_text: formData.get('link_text')?.toString() || null,
			position: (formData.get('position')?.toString() || 'top') as 'top' | 'middle' | 'bottom',
			order: parseInt(formData.get('order')?.toString() || '0'),
			is_active: formData.get('is_active')?.toString() === 'true',
			start_date: formData.get('start_date')?.toString() || null,
			end_date: formData.get('end_date')?.toString() || null
		};

		try {
			await contentService.createBanner(banner);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	updateBanner: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';
		const banner: any = {};

		if (formData.get('title')) banner.title = formData.get('title')?.toString();
		if (formData.get('image_url')) banner.image_url = formData.get('image_url')?.toString();
		if (formData.get('link_url')) banner.link_url = formData.get('link_url')?.toString() || null;
		if (formData.get('link_text')) banner.link_text = formData.get('link_text')?.toString() || null;
		if (formData.get('position')) banner.position = formData.get('position')?.toString();
		if (formData.get('order')) banner.order = parseInt(formData.get('order')?.toString() || '0');
		if (formData.get('is_active') !== null) banner.is_active = formData.get('is_active')?.toString() === 'true';
		if (formData.get('start_date')) banner.start_date = formData.get('start_date')?.toString() || null;
		if (formData.get('end_date')) banner.end_date = formData.get('end_date')?.toString() || null;

		try {
			await contentService.updateBanner(id, banner);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	deleteBanner: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';

		try {
			await contentService.deleteBanner(id);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	createPage: async ({ request }) => {
		const formData = await request.formData();
		const page = {
			slug: formData.get('slug')?.toString() || '',
			title: formData.get('title')?.toString() || '',
			content: formData.get('content')?.toString() || '',
			meta_title: formData.get('meta_title')?.toString() || null,
			meta_description: formData.get('meta_description')?.toString() || null,
			is_published: formData.get('is_published')?.toString() === 'true'
		};

		try {
			await contentService.createPage(page);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	updatePage: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';
		const page: any = {};

		if (formData.get('slug')) page.slug = formData.get('slug')?.toString();
		if (formData.get('title')) page.title = formData.get('title')?.toString();
		if (formData.get('content')) page.content = formData.get('content')?.toString();
		if (formData.get('meta_title')) page.meta_title = formData.get('meta_title')?.toString() || null;
		if (formData.get('meta_description')) page.meta_description = formData.get('meta_description')?.toString() || null;
		if (formData.get('is_published') !== null) page.is_published = formData.get('is_published')?.toString() === 'true';

		try {
			await contentService.updatePage(id, page);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	deletePage: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';

		try {
			await contentService.deletePage(id);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	createFAQ: async ({ request }) => {
		const formData = await request.formData();
		const faq = {
			question: formData.get('question')?.toString() || '',
			answer: formData.get('answer')?.toString() || '',
			category: formData.get('category')?.toString() || null,
			order: parseInt(formData.get('order')?.toString() || '0'),
			is_published: formData.get('is_published')?.toString() === 'true'
		};

		try {
			await contentService.createFAQ(faq);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	updateFAQ: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';
		const faq: any = {};

		if (formData.get('question')) faq.question = formData.get('question')?.toString();
		if (formData.get('answer')) faq.answer = formData.get('answer')?.toString();
		if (formData.get('category')) faq.category = formData.get('category')?.toString() || null;
		if (formData.get('order')) faq.order = parseInt(formData.get('order')?.toString() || '0');
		if (formData.get('is_published') !== null) faq.is_published = formData.get('is_published')?.toString() === 'true';

		try {
			await contentService.updateFAQ(id, faq);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	deleteFAQ: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';

		try {
			await contentService.deleteFAQ(id);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	}
};


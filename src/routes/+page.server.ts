// CONTROLLER: Home page with products
import type { PageServerLoad } from './$types';
import { productService } from '$lib/services/ProductService';
import { pcBuildService } from '$lib/services/PCBuildService';
import { contentService } from '$lib/services/ContentService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ url }) => {
	try {
		const products = await productService.getAllProducts();
		
		// Try to get categories, but handle gracefully if table doesn't exist
		let categories = [];
		try {
			categories = await pcBuildService.getAllCategories();
		} catch (error) {
			console.error('Error loading component categories:', error);
			// Continue without categories
		}

		// Load content management data
		let homepageContent = null;
		let banners: any[] = [];
		let faqs: any[] = [];
		
		try {
			homepageContent = await contentService.getHomepageContent();
		} catch (error) {
			console.error('Error loading homepage content:', error);
		}

		try {
			banners = await contentService.getAllBanners();
			// Filter active banners and check date ranges
			const now = new Date().toISOString();
			banners = banners.filter((banner) => {
				if (!banner.is_active) return false;
				if (banner.start_date && banner.start_date > now) return false;
				if (banner.end_date && banner.end_date < now) return false;
				return true;
			});
			// Sort by order
			banners.sort((a, b) => (a.order || 0) - (b.order || 0));
		} catch (error) {
			console.error('Error loading banners:', error);
		}

		try {
			faqs = await contentService.getAllFAQs();
			// Filter published FAQs
			faqs = faqs.filter((faq) => faq.is_published);
			// Sort by order
			faqs.sort((a, b) => (a.order || 0) - (b.order || 0));
		} catch (error) {
			console.error('Error loading FAQs:', error);
		}

		// Group products by category
		const productsByCategory: Record<string, any[]> = {};
		const regularProducts: any[] = [];

		products.forEach((product) => {
			const productWithCategory = product as any;
			if (productWithCategory.component_category_id) {
				const catId = productWithCategory.component_category_id;
				if (!productsByCategory[catId]) {
					productsByCategory[catId] = [];
				}
				productsByCategory[catId].push(product);
			} else {
				regularProducts.push(product);
			}
		});

		// Map category IDs to category names
		const categoryMap: Record<string, string> = {};
		categories.forEach((cat) => {
			categoryMap[cat.id] = cat.display_name;
		});

		// Group banners by position
		const bannersByPosition: Record<string, any[]> = {
			top: [],
			middle: [],
			bottom: []
		};
		banners.forEach((banner) => {
			if (bannersByPosition[banner.position]) {
				bannersByPosition[banner.position].push(banner);
			}
		});

		const error = url.searchParams.get('error');
		const success = url.searchParams.get('success');
		return {
			products,
			productsByCategory,
			regularProducts,
			categories,
			categoryMap,
			homepageContent,
			banners: bannersByPosition,
			faqs,
			error: error ? decodeURIComponent(error) : null,
			success: success ? decodeURIComponent(success) : null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			products: [],
			productsByCategory: {},
			regularProducts: [],
			categories: [],
			categoryMap: {},
			homepageContent: null,
			banners: { top: [], middle: [], bottom: [] },
			faqs: [],
			error: message,
			success: null
		};
	}
};


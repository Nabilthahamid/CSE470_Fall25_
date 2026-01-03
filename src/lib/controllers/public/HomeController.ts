// CONTROLLER: Home page controller
import { BaseController } from '../BaseController';
import { ProductModel } from '$lib/models/ProductModel';
import { getAllCategories } from '$lib/utils/pc-builder';
import { getHomepageContent, getAllBanners, getAllFAQs } from '$lib/utils/content';

export class HomeController extends BaseController {
	/**
	 * Load home page data
	 */
	async loadHome() {
		try {
			const productsModels = await ProductModel.getAll();
			const products = productsModels.map((p) => p.toJSON());

			// Try to get categories, but handle gracefully if table doesn't exist
			let categories = [];
			try {
				categories = await getAllCategories();
			} catch (error) {
				console.error('Error loading component categories:', error);
			}

			// Load content management data
			let homepageContent = null;
			let banners: any[] = [];
			let faqs: any[] = [];

			try {
				homepageContent = await getHomepageContent();
			} catch (error) {
				console.error('Error loading homepage content:', error);
			}

			try {
				banners = await getAllBanners();
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
				faqs = await getAllFAQs();
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

			const error = this.getQueryParam('error');
			const success = this.getQueryParam('success');

			return {
				products: products,
				productsByCategory: Object.fromEntries(
					Object.entries(productsByCategory).map(([key, prods]) => [
						key,
						prods
					])
				),
				regularProducts: regularProducts,
				categories,
				categoryMap,
				homepageContent,
				banners: bannersByPosition,
				faqs,
				error: error ? decodeURIComponent(error) : null,
				success: success ? decodeURIComponent(success) : null
			};
		} catch (error) {
			const { message } = this.handleError(error);
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
	}
}

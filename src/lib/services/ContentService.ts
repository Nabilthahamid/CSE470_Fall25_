// SERVICE: Content Management System (CMS)
import { supabase, getSupabaseAdmin } from '$lib/config/supabase';
import type {
	HomepageContent,
	Banner,
	StaticPage,
	FAQ,
	CreateBannerDTO,
	UpdateBannerDTO,
	CreateStaticPageDTO,
	UpdateStaticPageDTO,
	CreateFAQDTO,
	UpdateFAQDTO
} from '$lib/models/Content';

export class ContentService {
	// Homepage Content
	async getHomepageContent(): Promise<HomepageContent | null> {
		try {
			const { data, error } = await supabase
				.from('homepage_content')
				.select('*')
				.maybeSingle();

			if (error) {
				if (error.code === 'PGRST116' || error.code === '42P01') return null; // Not found or table doesn't exist
				throw new Error(`Failed to fetch homepage content: ${error.message}`);
			}
			return data;
		} catch (error: any) {
			// Table might not exist or other error
			if (error.code === '42P01') return null; // Table doesn't exist
			return null;
		}
	}

	async updateHomepageContent(content: Partial<HomepageContent>): Promise<HomepageContent> {
		try {
			const { data: existing, error: checkError } = await supabase
				.from('homepage_content')
				.select('id')
				.limit(1)
				.maybeSingle();

			if (checkError) {
				if (checkError.code === '42P01') {
					// Table doesn't exist - return a default object
					return {
						id: 'default',
						hero_title: null,
						hero_subtitle: null,
						hero_image_url: null,
						featured_section_title: null,
						featured_section_content: null,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString()
					} as HomepageContent;
				}
				throw new Error(`Failed to check homepage content: ${checkError.message}`);
			}

			if (existing) {
				const { data, error } = await supabase
					.from('homepage_content')
					.update({ ...content, updated_at: new Date().toISOString() })
					.eq('id', existing.id)
					.select()
					.single();

				if (error) throw new Error(`Failed to update homepage content: ${error.message}`);
				return data;
			} else {
				const { data, error } = await supabase
					.from('homepage_content')
					.insert({ ...content, created_at: new Date().toISOString() })
					.select()
					.single();

				if (error) {
					if (error.code === '42P01') {
						// Table doesn't exist - return a default object
						return {
							id: 'default',
							hero_title: null,
							hero_subtitle: null,
							hero_image_url: null,
							featured_section_title: null,
							featured_section_content: null,
							created_at: new Date().toISOString(),
							updated_at: new Date().toISOString()
						} as HomepageContent;
					}
					throw new Error(`Failed to create homepage content: ${error.message}`);
				}
				return data;
			}
		} catch (error: any) {
			if (error.code === '42P01') {
				// Table doesn't exist - return a default object
				return {
					id: 'default',
					hero_title: null,
					hero_subtitle: null,
					hero_image_url: null,
					featured_section_title: null,
					featured_section_content: null,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				} as HomepageContent;
			}
			throw error;
		}
	}

	// Banners
	async getAllBanners(): Promise<Banner[]> {
		try {
			const { data, error } = await supabase
				.from('banners')
				.select('*')
				.order('order', { ascending: true });

			if (error) {
				if (error.code === '42P01') return []; // Table doesn't exist
				throw new Error(`Failed to fetch banners: ${error.message}`);
			}
			return data || [];
		} catch (error) {
			return [];
		}
	}

	async getBannerById(id: string): Promise<Banner | null> {
		const { data, error } = await supabase.from('banners').select('*').eq('id', id).single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch banner: ${error.message}`);
		}
		return data;
	}

	async createBanner(banner: CreateBannerDTO): Promise<Banner> {
		const { data, error } = await supabase
			.from('banners')
			.insert({ ...banner, created_at: new Date().toISOString() })
			.select()
			.single();

		if (error) throw new Error(`Failed to create banner: ${error.message}`);
		return data;
	}

	async updateBanner(id: string, banner: UpdateBannerDTO): Promise<Banner> {
		const { data, error } = await supabase
			.from('banners')
			.update({ ...banner, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update banner: ${error.message}`);
		return data;
	}

	async deleteBanner(id: string): Promise<void> {
		const { error } = await supabase.from('banners').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete banner: ${error.message}`);
	}

	// Static Pages
	async getAllPages(): Promise<StaticPage[]> {
		try {
			const { data, error } = await supabase
				.from('static_pages')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) {
				if (error.code === '42P01') return [];
				throw new Error(`Failed to fetch pages: ${error.message}`);
			}
			return data || [];
		} catch (error) {
			return [];
		}
	}

	async getPageBySlug(slug: string): Promise<StaticPage | null> {
		const { data, error } = await supabase.from('static_pages').select('*').eq('slug', slug).single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch page: ${error.message}`);
		}
		return data;
	}

	async createPage(page: CreateStaticPageDTO): Promise<StaticPage> {
		const { data, error } = await supabase
			.from('static_pages')
			.insert({ ...page, created_at: new Date().toISOString() })
			.select()
			.single();

		if (error) throw new Error(`Failed to create page: ${error.message}`);
		return data;
	}

	async updatePage(id: string, page: UpdateStaticPageDTO): Promise<StaticPage> {
		const { data, error } = await supabase
			.from('static_pages')
			.update({ ...page, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update page: ${error.message}`);
		return data;
	}

	async deletePage(id: string): Promise<void> {
		const { error } = await supabase.from('static_pages').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete page: ${error.message}`);
	}

	// FAQs
	async getAllFAQs(): Promise<FAQ[]> {
		try {
			const { data, error } = await supabase
				.from('faqs')
				.select('*')
				.order('order', { ascending: true });

			if (error) {
				if (error.code === '42P01') return [];
				throw new Error(`Failed to fetch FAQs: ${error.message}`);
			}
			return data || [];
		} catch (error) {
			return [];
		}
	}

	async getFAQById(id: string): Promise<FAQ | null> {
		const { data, error } = await supabase.from('faqs').select('*').eq('id', id).single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch FAQ: ${error.message}`);
		}
		return data;
	}

	async createFAQ(faq: CreateFAQDTO): Promise<FAQ> {
		// Use admin client to bypass RLS for admin operations
		const { data, error } = await getSupabaseAdmin()
			.from('faqs')
			.insert({ ...faq, created_at: new Date().toISOString() })
			.select()
			.single();

		if (error) {
			console.error('FAQ create error:', error);
			throw new Error(`Failed to create FAQ: ${error.message}`);
		}
		return data;
	}

	async updateFAQ(id: string, faq: UpdateFAQDTO): Promise<FAQ> {
		// Use admin client to bypass RLS for admin operations
		const { data, error } = await getSupabaseAdmin()
			.from('faqs')
			.update({ ...faq, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error('FAQ update error:', error);
			throw new Error(`Failed to update FAQ: ${error.message}`);
		}
		return data;
	}

	async deleteFAQ(id: string): Promise<void> {
		// Use admin client to bypass RLS for admin operations
		const { error } = await getSupabaseAdmin().from('faqs').delete().eq('id', id);
		if (error) {
			console.error('FAQ delete error:', error);
			throw new Error(`Failed to delete FAQ: ${error.message}`);
		}
	}
}

export const contentService = new ContentService();


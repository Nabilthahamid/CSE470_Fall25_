// MODEL: Content Management System (CMS) data structures
export interface HomepageContent {
	id?: string;
	hero_title?: string;
	hero_subtitle?: string;
	hero_image_url?: string;
	featured_section_title?: string;
	featured_section_content?: string;
	created_at?: string;
	updated_at?: string;
}

export interface Banner {
	id?: string;
	title: string;
	image_url: string;
	link_url?: string;
	link_text?: string;
	position: 'top' | 'middle' | 'bottom';
	order: number;
	is_active: boolean;
	start_date?: string;
	end_date?: string;
	created_at?: string;
	updated_at?: string;
}

export interface StaticPage {
	id?: string;
	slug: string;
	title: string;
	content: string;
	meta_title?: string;
	meta_description?: string;
	is_published: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface FAQ {
	id?: string;
	question: string;
	answer: string;
	category?: string;
	order: number;
	is_published: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface CreateBannerDTO {
	title: string;
	image_url: string;
	link_url?: string;
	link_text?: string;
	position: 'top' | 'middle' | 'bottom';
	order: number;
	is_active: boolean;
	start_date?: string;
	end_date?: string;
}

export interface UpdateBannerDTO {
	title?: string;
	image_url?: string;
	link_url?: string;
	link_text?: string;
	position?: 'top' | 'middle' | 'bottom';
	order?: number;
	is_active?: boolean;
	start_date?: string;
	end_date?: string;
}

export interface CreateStaticPageDTO {
	slug: string;
	title: string;
	content: string;
	meta_title?: string;
	meta_description?: string;
	is_published: boolean;
}

export interface UpdateStaticPageDTO {
	slug?: string;
	title?: string;
	content?: string;
	meta_title?: string;
	meta_description?: string;
	is_published?: boolean;
}

export interface CreateFAQDTO {
	question: string;
	answer: string;
	category?: string;
	order: number;
	is_published: boolean;
}

export interface UpdateFAQDTO {
	question?: string;
	answer?: string;
	category?: string;
	order?: number;
	is_published?: boolean;
}


// MODEL: Promotional Campaigns data structures
export interface PromotionalCampaign {
	id?: string;
	name: string;
	description?: string;
	campaign_type: 'flash_sale' | 'limited_time' | 'buy_x_get_y' | 'seasonal' | 'other';
	start_date: string;
	end_date: string;
	is_active: boolean;
	discount_id?: string; // Link to discount code
	products?: CampaignProduct[];
	buy_x_get_y_config?: {
		buy_quantity: number;
		get_quantity: number;
		product_id?: string; // Specific product or all
		discount_type: 'percentage' | 'fixed_amount' | 'free';
		discount_value?: number;
	};
	image_url?: string;
	created_at?: string;
	updated_at?: string;
}

export interface CampaignProduct {
	product_id: string;
	product_name?: string;
	special_price?: number;
	discount_percentage?: number;
}

export interface CreateCampaignDTO {
	name: string;
	description?: string;
	campaign_type: 'flash_sale' | 'limited_time' | 'buy_x_get_y' | 'seasonal' | 'other';
	start_date: string;
	end_date: string;
	is_active: boolean;
	discount_id?: string;
	products?: CampaignProduct[];
	buy_x_get_y_config?: {
		buy_quantity: number;
		get_quantity: number;
		product_id?: string;
		discount_type: 'percentage' | 'fixed_amount' | 'free';
		discount_value?: number;
	};
	image_url?: string;
}

export interface UpdateCampaignDTO {
	name?: string;
	description?: string;
	campaign_type?: 'flash_sale' | 'limited_time' | 'buy_x_get_y' | 'seasonal' | 'other';
	start_date?: string;
	end_date?: string;
	is_active?: boolean;
	discount_id?: string;
	products?: CampaignProduct[];
	buy_x_get_y_config?: {
		buy_quantity: number;
		get_quantity: number;
		product_id?: string;
		discount_type: 'percentage' | 'fixed_amount' | 'free';
		discount_value?: number;
	};
	image_url?: string;
}


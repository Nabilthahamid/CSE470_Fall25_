// MODEL: Shipping Management data structures
export interface ShippingProvider {
	id?: string;
	name: string;
	code: string;
	api_key?: string;
	api_secret?: string;
	is_active: boolean;
	base_rate: number;
	rate_per_kg?: number;
	rate_per_km?: number;
	estimated_days_min: number;
	estimated_days_max: number;
	config?: Record<string, any>;
	created_at?: string;
	updated_at?: string;
}

export interface ShippingZone {
	id?: string;
	name: string;
	description?: string;
	country?: string;
	regions: string[]; // Array of region names
	base_rate: number;
	rate_per_kg?: number;
	provider_id?: string;
	is_active: boolean;
	estimated_days_min: number;
	estimated_days_max: number;
	created_at?: string;
	updated_at?: string;
}

export interface ShippingRate {
	provider: string;
	zone: string;
	rate: number;
	estimated_days: number;
	currency: string;
}

export interface ShippingCalculation {
	weight: number; // in kg
	dimensions?: {
		length: number;
		width: number;
		height: number;
	};
	destination: {
		country: string;
		region?: string;
		city?: string;
		postal_code?: string;
	};
	value?: number; // order value for insurance
}

export interface CreateShippingProviderDTO {
	name: string;
	code: string;
	api_key?: string;
	api_secret?: string;
	is_active: boolean;
	base_rate: number;
	rate_per_kg?: number;
	rate_per_km?: number;
	estimated_days_min: number;
	estimated_days_max: number;
	config?: Record<string, any>;
}

export interface UpdateShippingProviderDTO {
	name?: string;
	api_key?: string;
	api_secret?: string;
	is_active?: boolean;
	base_rate?: number;
	rate_per_kg?: number;
	rate_per_km?: number;
	estimated_days_min?: number;
	estimated_days_max?: number;
	config?: Record<string, any>;
}

export interface CreateShippingZoneDTO {
	name: string;
	description?: string;
	country?: string;
	regions: string[];
	base_rate: number;
	rate_per_kg?: number;
	provider_id?: string;
	is_active: boolean;
	estimated_days_min: number;
	estimated_days_max: number;
}

export interface UpdateShippingZoneDTO {
	name?: string;
	description?: string;
	country?: string;
	regions?: string[];
	base_rate?: number;
	rate_per_kg?: number;
	provider_id?: string;
	is_active?: boolean;
	estimated_days_min?: number;
	estimated_days_max?: number;
}


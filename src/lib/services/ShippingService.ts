// SERVICE: Shipping Management
import { supabase } from '$lib/config/supabase';
import type {
	ShippingProvider,
	ShippingZone,
	ShippingRate,
	ShippingCalculation,
	CreateShippingProviderDTO,
	UpdateShippingProviderDTO,
	CreateShippingZoneDTO,
	UpdateShippingZoneDTO
} from '$lib/models/Shipping';

export class ShippingService {
	/**
	 * Get all shipping providers
	 */
	async getAllProviders(): Promise<ShippingProvider[]> {
		try {
			const { data, error } = await supabase
				.from('shipping_providers')
				.select('*')
				.order('name', { ascending: true });

			if (error) {
				if (error.code === '42P01') return [];
				throw new Error(`Failed to fetch providers: ${error.message}`);
			}
			return data || [];
		} catch (error) {
			return [];
		}
	}

	/**
	 * Get active shipping providers
	 */
	async getActiveProviders(): Promise<ShippingProvider[]> {
		const providers = await this.getAllProviders();
		return providers.filter((p) => p.is_active);
	}

	/**
	 * Get provider by ID
	 */
	async getProviderById(id: string): Promise<ShippingProvider | null> {
		const { data, error } = await supabase
			.from('shipping_providers')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch provider: ${error.message}`);
		}
		return data;
	}

	/**
	 * Create shipping provider
	 */
	async createProvider(provider: CreateShippingProviderDTO): Promise<ShippingProvider> {
		const { data, error } = await supabase
			.from('shipping_providers')
			.insert({ ...provider, created_at: new Date().toISOString() })
			.select()
			.single();

		if (error) throw new Error(`Failed to create provider: ${error.message}`);
		return data;
	}

	/**
	 * Update shipping provider
	 */
	async updateProvider(id: string, provider: UpdateShippingProviderDTO): Promise<ShippingProvider> {
		const { data, error } = await supabase
			.from('shipping_providers')
			.update({ ...provider, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update provider: ${error.message}`);
		return data;
	}

	/**
	 * Delete shipping provider
	 */
	async deleteProvider(id: string): Promise<void> {
		const { error } = await supabase.from('shipping_providers').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete provider: ${error.message}`);
	}

	/**
	 * Get all shipping zones
	 */
	async getAllZones(): Promise<ShippingZone[]> {
		try {
			const { data, error } = await supabase
				.from('shipping_zones')
				.select('*')
				.order('name', { ascending: true });

			if (error) {
				if (error.code === '42P01') return [];
				throw new Error(`Failed to fetch zones: ${error.message}`);
			}
			return data || [];
		} catch (error) {
			return [];
		}
	}

	/**
	 * Get active shipping zones
	 */
	async getActiveZones(): Promise<ShippingZone[]> {
		const zones = await this.getAllZones();
		return zones.filter((z) => z.is_active);
	}

	/**
	 * Get zone by ID
	 */
	async getZoneById(id: string): Promise<ShippingZone | null> {
		const { data, error } = await supabase
			.from('shipping_zones')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch zone: ${error.message}`);
		}
		return data;
	}

	/**
	 * Get zones by destination
	 */
	async getZonesByDestination(country: string, region?: string): Promise<ShippingZone[]> {
		const zones = await this.getActiveZones();
		return zones.filter((z) => {
			if (z.country && z.country !== country) return false;
			if (region && z.regions && !z.regions.includes(region)) return false;
			return true;
		});
	}

	/**
	 * Create shipping zone
	 */
	async createZone(zone: CreateShippingZoneDTO): Promise<ShippingZone> {
		const { data, error } = await supabase
			.from('shipping_zones')
			.insert({ ...zone, created_at: new Date().toISOString() })
			.select()
			.single();

		if (error) throw new Error(`Failed to create zone: ${error.message}`);
		return data;
	}

	/**
	 * Update shipping zone
	 */
	async updateZone(id: string, zone: UpdateShippingZoneDTO): Promise<ShippingZone> {
		const { data, error } = await supabase
			.from('shipping_zones')
			.update({ ...zone, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update zone: ${error.message}`);
		return data;
	}

	/**
	 * Delete shipping zone
	 */
	async deleteZone(id: string): Promise<void> {
		const { error } = await supabase.from('shipping_zones').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete zone: ${error.message}`);
	}

	/**
	 * Calculate shipping rates
	 */
	async calculateShippingRates(calculation: ShippingCalculation): Promise<ShippingRate[]> {
		const zones = await this.getZonesByDestination(
			calculation.destination.country,
			calculation.destination.region
		);
		const providers = await this.getActiveProviders();

		const rates: ShippingRate[] = [];

		for (const zone of zones) {
			for (const provider of providers) {
				// Calculate base rate
				let rate = zone.base_rate || provider.base_rate;

				// Add weight-based rate
				if (zone.rate_per_kg && calculation.weight > 0) {
					rate += calculation.weight * zone.rate_per_kg;
				} else if (provider.rate_per_kg && calculation.weight > 0) {
					rate += calculation.weight * provider.rate_per_kg;
				}

				// Calculate estimated days (average of min and max)
				const estimatedDays = Math.ceil(
					(zone.estimated_days_min + zone.estimated_days_max) / 2 ||
						(provider.estimated_days_min + provider.estimated_days_max) / 2
				);

				rates.push({
					provider: provider.name,
					zone: zone.name,
					rate,
					estimated_days: estimatedDays,
					currency: 'BDT'
				});
			}
		}

		// If no zones found, use default provider rates
		if (rates.length === 0) {
			for (const provider of providers) {
				let rate = provider.base_rate;
				if (provider.rate_per_kg && calculation.weight > 0) {
					rate += calculation.weight * provider.rate_per_kg;
				}

				rates.push({
					provider: provider.name,
					zone: 'Default',
					rate,
					estimated_days: Math.ceil((provider.estimated_days_min + provider.estimated_days_max) / 2),
					currency: 'BDT'
				});
			}
		}

		return rates.sort((a, b) => a.rate - b.rate);
	}

	/**
	 * Get delivery time estimate
	 */
	async getDeliveryTimeEstimate(
		destination: { country: string; region?: string },
		providerId?: string
	): Promise<{ min: number; max: number; average: number }> {
		const zones = await this.getZonesByDestination(destination.country, destination.region);

		if (zones.length === 0) {
			// Default estimate
			return { min: 3, max: 7, average: 5 };
		}

		const zone = zones[0];
		return {
			min: zone.estimated_days_min,
			max: zone.estimated_days_max,
			average: Math.ceil((zone.estimated_days_min + zone.estimated_days_max) / 2)
		};
	}
}

export const shippingService = new ShippingService();


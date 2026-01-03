// UTILITY: Shipping helper functions
import { supabase } from '$lib/config/supabase';

/**
 * Get all shipping providers
 */
export async function getAllProviders(): Promise<any[]> {
	try {
		const { data, error } = await supabase
			.from('shipping_providers')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			if (error.code === '42P01') return [];
			throw new Error(`Failed to fetch shipping providers: ${error.message}`);
		}
		return data || [];
	} catch (error) {
		return [];
	}
}

/**
 * Get all shipping zones
 */
export async function getAllZones(): Promise<any[]> {
	try {
		const { data, error } = await supabase
			.from('shipping_zones')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			if (error.code === '42P01') return [];
			throw new Error(`Failed to fetch shipping zones: ${error.message}`);
		}
		return data || [];
	} catch (error) {
		return [];
	}
}

/**
 * Create shipping provider
 */
export async function createProvider(provider: any): Promise<any> {
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
export async function updateProvider(id: string, provider: any): Promise<any> {
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
export async function deleteProvider(id: string): Promise<void> {
	const { error } = await supabase
		.from('shipping_providers')
		.delete()
		.eq('id', id);

	if (error) throw new Error(`Failed to delete provider: ${error.message}`);
}

/**
 * Create shipping zone
 */
export async function createZone(zone: any): Promise<any> {
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
export async function updateZone(id: string, zone: any): Promise<any> {
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
export async function deleteZone(id: string): Promise<void> {
	const { error } = await supabase
		.from('shipping_zones')
		.delete()
		.eq('id', id);

	if (error) throw new Error(`Failed to delete zone: ${error.message}`);
}

/**
 * Calculate shipping rates
 */
export async function calculateShippingRates(calculation: {
	weight: number;
	destination: {
		country: string;
		region?: string;
		city?: string;
		postal_code?: string;
	};
	value?: number;
}): Promise<any[]> {
	try {
		// Get active providers and zones
		const [providers, zones] = await Promise.all([
			getAllProviders(),
			getAllZones()
		]);

		const activeProviders = providers.filter(p => p.is_active);
		const activeZones = zones.filter(z => z.is_active);

		const rates: any[] = [];

		// Calculate rates for each provider/zone combination
		for (const provider of activeProviders) {
			for (const zone of activeZones) {
				// Check if destination matches zone
				const matchesZone = 
					(!zone.country || zone.country === calculation.destination.country) &&
					(!zone.regions || zone.regions.length === 0 || 
					 (calculation.destination.region && zone.regions.includes(calculation.destination.region)));

				if (matchesZone || !zone.provider_id || zone.provider_id === provider.id) {
					// Calculate rate
					let rate = provider.base_rate || 0;
					
					if (provider.rate_per_kg && calculation.weight > 0) {
						rate += provider.rate_per_kg * calculation.weight;
					}
					
					if (zone.base_rate) {
						rate += zone.base_rate;
					}
					
					if (zone.rate_per_kg && calculation.weight > 0) {
						rate += zone.rate_per_kg * calculation.weight;
					}

					const estimatedDays = zone.estimated_days_min && zone.estimated_days_max
						? `${zone.estimated_days_min}-${zone.estimated_days_max}`
						: provider.estimated_days_min && provider.estimated_days_max
						? `${provider.estimated_days_min}-${provider.estimated_days_max}`
						: '3-7';

					rates.push({
						provider: provider.name,
						zone: zone.name,
						rate: Math.round(rate * 100) / 100,
						estimated_days: estimatedDays
					});
				}
			}
		}

		// If no zone matches, use provider base rates
		if (rates.length === 0) {
			for (const provider of activeProviders) {
				let rate = provider.base_rate || 0;
				if (provider.rate_per_kg && calculation.weight > 0) {
					rate += provider.rate_per_kg * calculation.weight;
				}

				const estimatedDays = provider.estimated_days_min && provider.estimated_days_max
					? `${provider.estimated_days_min}-${provider.estimated_days_max}`
					: '3-7';

				rates.push({
					provider: provider.name,
					zone: 'Default',
					rate: Math.round(rate * 100) / 100,
					estimated_days: estimatedDays
				});
			}
		}

		return rates.sort((a, b) => a.rate - b.rate);
	} catch (error: any) {
		throw new Error(`Failed to calculate shipping rates: ${error.message}`);
	}
}


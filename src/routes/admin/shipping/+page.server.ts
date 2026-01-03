// CONTROLLER: Shipping Management Page
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { getAllProviders, getAllZones, createProvider, updateProvider, deleteProvider, createZone, updateZone, deleteZone, calculateShippingRates } from '$lib/utils/shipping';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, url }) => {
	requireAdmin(locals.user);

	try {
		const activeTab = url.searchParams.get('tab') || 'providers';

		const [providers, zones] = await Promise.all([
			getAllProviders(),
			getAllZones()
		]);

		return {
			activeTab,
			providers,
			zones,
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			activeTab: 'providers',
			providers: [],
			zones: [],
			error: message
		};
	}
};

export const actions: Actions = {
	createProvider: async ({ request }) => {
		const formData = await request.formData();
		const provider = {
			name: formData.get('name')?.toString() || '',
			code: formData.get('code')?.toString() || '',
			api_key: formData.get('api_key')?.toString() || undefined,
			api_secret: formData.get('api_secret')?.toString() || undefined,
			is_active: formData.get('is_active')?.toString() === 'true',
			base_rate: parseFloat(formData.get('base_rate')?.toString() || '0'),
			rate_per_kg: formData.get('rate_per_kg') ? parseFloat(formData.get('rate_per_kg')?.toString() || '0') : undefined,
			rate_per_km: formData.get('rate_per_km') ? parseFloat(formData.get('rate_per_km')?.toString() || '0') : undefined,
			estimated_days_min: parseInt(formData.get('estimated_days_min')?.toString() || '1'),
			estimated_days_max: parseInt(formData.get('estimated_days_max')?.toString() || '7')
		};

		try {
			await createProvider(provider);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	updateProvider: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';
		if (!id) {
			return { error: 'Provider ID is required' };
		}

		const provider: any = {};

		const name = formData.get('name')?.toString();
		if (name !== null) provider.name = name;

		const apiKey = formData.get('api_key')?.toString();
		if (apiKey !== null) provider.api_key = apiKey || undefined;

		const apiSecret = formData.get('api_secret')?.toString();
		if (apiSecret !== null) provider.api_secret = apiSecret || undefined;

		const isActive = formData.get('is_active')?.toString();
		if (isActive !== null) provider.is_active = isActive === 'true';

		const baseRate = formData.get('base_rate')?.toString();
		if (baseRate) provider.base_rate = parseFloat(baseRate);

		const ratePerKg = formData.get('rate_per_kg')?.toString();
		if (ratePerKg !== null && ratePerKg !== '') {
			provider.rate_per_kg = parseFloat(ratePerKg) || undefined;
		}

		const ratePerKm = formData.get('rate_per_km')?.toString();
		if (ratePerKm !== null && ratePerKm !== '') {
			provider.rate_per_km = parseFloat(ratePerKm) || undefined;
		}

		const daysMin = formData.get('estimated_days_min')?.toString();
		if (daysMin) provider.estimated_days_min = parseInt(daysMin);

		const daysMax = formData.get('estimated_days_max')?.toString();
		if (daysMax) provider.estimated_days_max = parseInt(daysMax);

		try {
			await updateProvider(id, provider);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	deleteProvider: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';

		try {
			await deleteProvider(id);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	createZone: async ({ request }) => {
		const formData = await request.formData();
		const regionsStr = formData.get('regions')?.toString() || '';
		const regions = regionsStr.split(',').map(r => r.trim()).filter(Boolean);

		const zone = {
			name: formData.get('name')?.toString() || '',
			description: formData.get('description')?.toString() || undefined,
			country: formData.get('country')?.toString() || undefined,
			regions,
			base_rate: parseFloat(formData.get('base_rate')?.toString() || '0'),
			rate_per_kg: formData.get('rate_per_kg') ? parseFloat(formData.get('rate_per_kg')?.toString() || '0') : undefined,
			provider_id: formData.get('provider_id')?.toString() || undefined,
			is_active: formData.get('is_active')?.toString() === 'true',
			estimated_days_min: parseInt(formData.get('estimated_days_min')?.toString() || '1'),
			estimated_days_max: parseInt(formData.get('estimated_days_max')?.toString() || '7')
		};

		try {
			await createZone(zone);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	updateZone: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';
		if (!id) {
			return { error: 'Zone ID is required' };
		}

		const zone: any = {};

		const name = formData.get('name')?.toString();
		if (name !== null) zone.name = name;

		const description = formData.get('description')?.toString();
		if (description !== null) zone.description = description || undefined;

		const country = formData.get('country')?.toString();
		if (country !== null) zone.country = country || undefined;

		const regions = formData.get('regions')?.toString();
		if (regions !== null) {
			zone.regions = regions ? regions.split(',').map((r: string) => r.trim()).filter(Boolean) : [];
		}

		const baseRate = formData.get('base_rate')?.toString();
		if (baseRate) zone.base_rate = parseFloat(baseRate);

		const ratePerKg = formData.get('rate_per_kg')?.toString();
		if (ratePerKg !== null && ratePerKg !== '') {
			zone.rate_per_kg = parseFloat(ratePerKg) || undefined;
		}

		const providerId = formData.get('provider_id')?.toString();
		if (providerId !== null) zone.provider_id = providerId || undefined;

		const isActive = formData.get('is_active')?.toString();
		if (isActive !== null) zone.is_active = isActive === 'true';

		const daysMin = formData.get('estimated_days_min')?.toString();
		if (daysMin) zone.estimated_days_min = parseInt(daysMin);

		const daysMax = formData.get('estimated_days_max')?.toString();
		if (daysMax) zone.estimated_days_max = parseInt(daysMax);

		try {
			await updateZone(id, zone);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	deleteZone: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';

		try {
			await deleteZone(id);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	calculateRate: async ({ request }) => {
		const formData = await request.formData();
		const calculation = {
			weight: parseFloat(formData.get('weight')?.toString() || '0'),
			destination: {
				country: formData.get('country')?.toString() || '',
				region: formData.get('region')?.toString() || undefined,
				city: formData.get('city')?.toString() || undefined,
				postal_code: formData.get('postal_code')?.toString() || undefined
			},
			value: formData.get('value') ? parseFloat(formData.get('value')?.toString() || '0') : undefined
		};

		try {
			const rates = await calculateShippingRates(calculation);
			return { success: true, rates };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	}
};


// UTILITY: Energy efficiency calculation functions
import type { Product } from '$lib/models/Product';
import type { ComponentCategory } from '$lib/models/PCBuild';
import type { BuildEnergyAnalysis, PowerSupplyRecommendation, EnergyEfficientAlternative } from '$lib/models/Energy';
import { DEFAULT_POWER_CONSUMPTION, ELECTRICITY_RATE, CARBON_FACTOR } from '$lib/models/Energy';

/**
 * Get power consumption for a component based on category
 */
function getComponentPowerConsumption(categoryName: string): { idle: number; load: number; peak: number } {
	const normalizedName = categoryName.toLowerCase().replace(/\s+/g, '_');
	
	// Map common category names to power consumption keys
	const categoryMap: Record<string, string> = {
		'cpu': 'cpu',
		'processor': 'cpu',
		'graphics_card': 'graphics_card',
		'gpu': 'graphics_card',
		'video_card': 'graphics_card',
		'ram': 'ram',
		'memory': 'ram',
		'storage': 'storage',
		'hard_drive': 'storage',
		'ssd': 'storage',
		'hdd': 'storage',
		'motherboard': 'motherboard',
		'mainboard': 'motherboard',
		'mobo': 'motherboard',
		'power_supply': 'power_supply',
		'psu': 'power_supply',
		'case': 'casing_cooler',
		'chassis': 'casing_cooler',
		'cpu_cooler': 'cpu_cooler',
		'cooler': 'cpu_cooler',
		'monitor': 'monitor',
		'display': 'monitor',
		'keyboard': 'keyboard',
		'mouse': 'mouse',
		'speakers': 'speakers',
		'headphone': 'headphone',
		'wifi_adapter': 'wifi_adapter',
		'ups': 'ups'
	};

	const powerKey = categoryMap[normalizedName] || normalizedName;
	const defaultPower = DEFAULT_POWER_CONSUMPTION[powerKey] || DEFAULT_POWER_CONSUMPTION['cpu'];

	return {
		idle: defaultPower.idle,
		load: defaultPower.load,
		peak: defaultPower.peak || defaultPower.load
	};
}

/**
 * Calculate energy consumption for a PC build
 */
export async function calculateBuildEnergy(
	components: Array<{ product: Product; category: ComponentCategory }>
): Promise<BuildEnergyAnalysis> {
	let totalIdleWatts = 0;
	let totalLoadWatts = 0;
	let totalPeakWatts = 0;

	const componentAnalysis = components.map(({ product, category }) => {
		const power = getComponentPowerConsumption(category.name || category.display_name);
		
		totalIdleWatts += power.idle;
		totalLoadWatts += power.load;
		totalPeakWatts += power.peak;

		return {
			product,
			category: category.display_name || category.name || 'Unknown',
			idle_watts: power.idle,
			load_watts: power.load
		};
	});

	// Recommended PSU: 120% of peak power (20% headroom)
	const recommendedPsuWatts = Math.ceil(totalPeakWatts * 1.2 / 50) * 50; // Round up to nearest 50W

	// Calculate costs (assuming 8 hours load, 16 hours idle per day)
	const dailyKwh = (totalIdleWatts * 16 + totalLoadWatts * 8) / 1000;
	const monthlyKwh = dailyKwh * 30;
	const yearlyKwh = dailyKwh * 365;

	const dailyCost = dailyKwh * ELECTRICITY_RATE;
	const monthlyCost = monthlyKwh * ELECTRICITY_RATE;
	const yearlyCost = yearlyKwh * ELECTRICITY_RATE;

	// Carbon footprint
	const carbonFootprint = yearlyKwh * CARBON_FACTOR;

	return {
		total_idle_watts: totalIdleWatts,
		total_load_watts: totalLoadWatts,
		total_peak_watts: totalPeakWatts,
		recommended_psu_watts: recommendedPsuWatts,
		monthly_electricity_cost: monthlyCost,
		yearly_electricity_cost: yearlyCost,
		daily_cost: dailyCost,
		carbon_footprint_kg: carbonFootprint,
		components: componentAnalysis
	};
}

/**
 * Recommend power supply based on power requirements
 */
export function recommendPowerSupply(
	totalPeakWatts: number,
	availablePSUs: Product[]
): PowerSupplyRecommendation {
	// Recommended PSU: 120% of peak power (20% headroom)
	const recommendedWatts = Math.ceil(totalPeakWatts * 1.2 / 50) * 50; // Round up to nearest 50W

	// Determine efficiency rating based on wattage
	let recommendedEfficiency: '80+ Bronze' | '80+ Silver' | '80+ Gold' | '80+ Platinum' | '80+ Titanium';
	if (recommendedWatts <= 450) {
		recommendedEfficiency = '80+ Bronze';
	} else if (recommendedWatts <= 650) {
		recommendedEfficiency = '80+ Silver';
	} else if (recommendedWatts <= 850) {
		recommendedEfficiency = '80+ Gold';
	} else if (recommendedWatts <= 1000) {
		recommendedEfficiency = '80+ Platinum';
	} else {
		recommendedEfficiency = '80+ Titanium';
	}

	const reason = `Your system requires ${totalPeakWatts}W under peak load. A ${recommendedWatts}W ${recommendedEfficiency} PSU provides 20% headroom for efficiency and future upgrades.`;

	// Find available PSU options
	const options = availablePSUs
		.filter(psu => {
			const wattage = extractWattage(psu.name);
			return wattage >= recommendedWatts * 0.9 && wattage <= recommendedWatts * 1.5;
		})
		.slice(0, 5)
		.map(psu => ({
			wattage: extractWattage(psu.name) || recommendedWatts,
			efficiency: extractEfficiency(psu.name) || recommendedEfficiency,
			estimated_cost: psu.price
		}));

	return {
		recommended_watts: recommendedWatts,
		recommended_efficiency: recommendedEfficiency,
		reason,
		options
	};
}

/**
 * Extract wattage from product name
 */
function extractWattage(name: string): number | null {
	const match = name.match(/(\d+)\s*W/);
	return match ? parseInt(match[1]) : null;
}

/**
 * Extract efficiency rating from product name
 */
function extractEfficiency(name: string): string | null {
	const efficiencyPatterns = ['Titanium', 'Platinum', 'Gold', 'Silver', 'Bronze'];
	for (const pattern of efficiencyPatterns) {
		if (name.includes(pattern)) {
			return `80+ ${pattern}`;
		}
	}
	return null;
}

/**
 * Find energy-efficient alternatives for components
 */
export async function findEnergyEfficientAlternatives(
	components: Array<{ product: Product; category: ComponentCategory }>,
	allProducts: Product[]
): Promise<EnergyEfficientAlternative[]> {
	const alternatives: EnergyEfficientAlternative[] = [];

	for (const { product, category } of components) {
		// Find products in the same category
		const sameCategoryProducts = allProducts.filter(
			p => p.component_category_id === category.id && p.id !== product.id && p.stock > 0
		);

		if (sameCategoryProducts.length === 0) continue;

		// Get power consumption for current product
		const currentPower = getComponentPowerConsumption(category.name || category.display_name);

		// Find products with lower power consumption (within reasonable price range)
		const energyEfficientOptions = sameCategoryProducts
			.filter(p => {
				// Price should be within 150% of current product
				return p.price <= product.price * 1.5;
			})
			.slice(0, 3); // Limit to 3 alternatives

		// For simplicity, assume alternatives have 10-30% lower power consumption
		// In a real implementation, you'd query product specifications
		for (const altProduct of energyEfficientOptions) {
			const powerReduction = 0.15 + Math.random() * 0.15; // 15-30% reduction
			const powerSavings = Math.round(currentPower.load * powerReduction);

			// Calculate savings
			const dailyKwhSavings = (powerSavings * 8) / 1000; // 8 hours load
			const monthlySavings = dailyKwhSavings * 30 * ELECTRICITY_RATE;
			const yearlySavings = dailyKwhSavings * 365 * ELECTRICITY_RATE;

			alternatives.push({
				original_product: product,
				alternative_product: altProduct,
				power_savings_watts: powerSavings,
				monthly_savings_taka: monthlySavings,
				yearly_savings_taka: yearlySavings,
				performance_impact: altProduct.price < product.price * 0.8 ? 'moderate' : 'minimal',
				reason: `${altProduct.name} offers similar performance with ${powerSavings}W lower power consumption.`
			});
		}
	}

	return alternatives;
}

/**
 * Calculate energy savings from alternatives
 */
export function calculateEnergySavings(
	originalAnalysis: BuildEnergyAnalysis,
	alternatives: EnergyEfficientAlternative[]
): {
	total_power_savings_watts: number;
	monthly_savings_taka: number;
	yearly_savings_taka: number;
	carbon_reduction_kg: number;
} {
	const totalPowerSavings = alternatives.reduce((sum, alt) => sum + alt.power_savings_watts, 0);
	const totalYearlySavings = alternatives.reduce((sum, alt) => sum + alt.yearly_savings_taka, 0);
	const totalMonthlySavings = totalYearlySavings / 12;

	// Calculate carbon reduction
	const dailyKwhSavings = (totalPowerSavings * 8) / 1000; // 8 hours load
	const yearlyKwhSavings = dailyKwhSavings * 365;
	const carbonReduction = yearlyKwhSavings * CARBON_FACTOR;

	return {
		total_power_savings_watts: totalPowerSavings,
		monthly_savings_taka: totalMonthlySavings,
		yearly_savings_taka: totalYearlySavings,
		carbon_reduction_kg: carbonReduction
	};
}


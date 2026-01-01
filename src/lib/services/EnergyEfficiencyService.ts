// SERVICE: Energy Efficiency Calculator and Optimizer
import type { Product } from '$lib/models/Product';
import type { ComponentCategory } from '$lib/models/PCBuild';
import type {
	BuildEnergyAnalysis,
	EnergyEfficientAlternative,
	PowerSupplyRecommendation,
	ComponentPowerConsumption
} from '$lib/models/Energy';
import {
	DEFAULT_POWER_CONSUMPTION,
	ELECTRICITY_RATE,
	CARBON_FACTOR
} from '$lib/models/Energy';
import { productService } from './ProductService';
import { EnhancedAIService } from './EnhancedAIService';

export class EnergyEfficiencyService {
	private aiService: EnhancedAIService;

	constructor() {
		this.aiService = new EnhancedAIService();
	}

	/**
	 * Extract power consumption from product specifications or use defaults
	 */
	private getComponentPowerConsumption(
		product: Product,
		categoryName: string
	): { idle: number; load: number; peak: number } {
		// Try to parse from specifications
		if (product.specifications) {
			try {
				const specs = typeof product.specifications === 'string'
					? JSON.parse(product.specifications)
					: product.specifications;

				if (specs.power_consumption) {
					return {
						idle: specs.power_consumption.idle || 0,
						load: specs.power_consumption.load || 0,
						peak: specs.power_consumption.peak || 0
					};
				}

				// Try to extract from text specifications
				const specText = typeof specs === 'string' ? specs : JSON.stringify(specs);
				const tdpMatch = specText.match(/tdp[:\s]+(\d+)\s*w/i);
				if (tdpMatch) {
					const tdp = parseInt(tdpMatch[1]);
					return {
						idle: tdp * 0.2,
						load: tdp * 0.8,
						peak: tdp
					};
				}
			} catch (e) {
				// Invalid JSON, continue to defaults
			}
		}

		// Use default power consumption based on category
		const categoryKey = categoryName.toLowerCase().replace(/\s+/g, '_');
		const defaults = DEFAULT_POWER_CONSUMPTION[categoryKey] || DEFAULT_POWER_CONSUMPTION['cpu'];
		
		return {
			idle: defaults.idle,
			load: defaults.load,
			peak: defaults.peak || defaults.load * 1.2
		};
	}

	/**
	 * Calculate total power consumption for a PC build
	 */
	async calculateBuildEnergy(
		components: Array<{ product: Product; category: ComponentCategory }>
	): Promise<BuildEnergyAnalysis> {
		let totalIdle = 0;
		let totalLoad = 0;
		let totalPeak = 0;

		const componentAnalysis = components.map(({ product, category }) => {
			const power = this.getComponentPowerConsumption(product, category.name);
			totalIdle += power.idle;
			totalLoad += power.load;
			totalPeak += power.peak;

			return {
				product,
				category: category.display_name,
				idle_watts: power.idle,
				load_watts: power.load
			};
		});

		// Add 20% overhead for PSU efficiency and system overhead
		const recommendedPSU = Math.ceil(totalPeak * 1.2);

		// Calculate electricity costs
		// Assume 8 hours load, 16 hours idle per day
		const daily_kWh = (totalLoad * 8 + totalIdle * 16) / 1000;
		const monthly_kWh = daily_kWh * 30;
		const yearly_kWh = daily_kWh * 365;

		const monthlyCost = monthly_kWh * ELECTRICITY_RATE;
		const yearlyCost = yearly_kWh * ELECTRICITY_RATE;
		const dailyCost = daily_kWh * ELECTRICITY_RATE;

		// Calculate carbon footprint
		const carbonFootprint = yearly_kWh * CARBON_FACTOR;

		return {
			total_idle_watts: Math.round(totalIdle),
			total_load_watts: Math.round(totalLoad),
			total_peak_watts: Math.round(totalPeak),
			recommended_psu_watts: recommendedPSU,
			monthly_electricity_cost: Math.round(monthlyCost * 100) / 100,
			yearly_electricity_cost: Math.round(yearlyCost * 100) / 100,
			daily_cost: Math.round(dailyCost * 100) / 100,
			carbon_footprint_kg: Math.round(carbonFootprint * 100) / 100,
			components: componentAnalysis
		};
	}

	/**
	 * Find energy-efficient alternatives for components
	 */
	async findEnergyEfficientAlternatives(
		components: Array<{ product: Product; category: ComponentCategory }>,
		allProducts: Product[]
	): Promise<EnergyEfficientAlternative[]> {
		const alternatives: EnergyEfficientAlternative[] = [];

		for (const { product, category } of components) {
			// Find similar products in same category
			const categoryProducts = allProducts.filter(
				p => p.component_category_id === category.id && p.id !== product.id
			);

			if (categoryProducts.length === 0) continue;

			// Get current power consumption
			const currentPower = this.getComponentPowerConsumption(product, category.name);

			// Find products with lower power consumption
			const efficientProducts = await Promise.all(
				categoryProducts.map(async (altProduct) => {
					const altPower = this.getComponentPowerConsumption(altProduct, category.name);
					const powerSavings = currentPower.load - altPower.load;

					if (powerSavings > 0) {
						// Calculate savings
						const daily_kWh_savings = (powerSavings * 8) / 1000; // 8 hours load
						const monthlySavings = daily_kWh_savings * 30 * ELECTRICITY_RATE;
						const yearlySavings = daily_kWh_savings * 365 * ELECTRICITY_RATE;

						// Estimate performance impact (simplified)
						let performanceImpact: 'none' | 'minimal' | 'moderate' | 'significant' = 'none';
						const priceDiff = Math.abs(altProduct.price - product.price) / product.price;
						
						if (priceDiff > 0.3) {
							performanceImpact = 'moderate';
						} else if (priceDiff > 0.15) {
							performanceImpact = 'minimal';
						}

						return {
							original_product: product,
							alternative_product: altProduct,
							power_savings_watts: Math.round(powerSavings),
							monthly_savings_taka: Math.round(monthlySavings * 100) / 100,
							yearly_savings_taka: Math.round(yearlySavings * 100) / 100,
							performance_impact: performanceImpact,
							reason: `Saves ${Math.round(powerSavings)}W under load, ${Math.round(monthlySavings)}৳/month`
						};
					}
					return null;
				})
			);

			// Get best alternative (highest savings)
			const validAlternatives = efficientProducts.filter(a => a !== null) as EnergyEfficientAlternative[];
			if (validAlternatives.length > 0) {
				validAlternatives.sort((a, b) => b.yearly_savings_taka - a.yearly_savings_taka);
				alternatives.push(validAlternatives[0]);
			}
		}

		return alternatives;
	}

	/**
	 * Recommend optimal power supply
	 */
	recommendPowerSupply(
		totalPeakWatts: number,
		availablePSUs: Product[]
	): PowerSupplyRecommendation {
		// Recommended wattage with 20% headroom
		const recommendedWatts = Math.ceil(totalPeakWatts * 1.2);

		// Round to nearest standard PSU wattage
		const standardWattages = [450, 550, 650, 750, 850, 1000, 1200];
		const optimalWattage = standardWattages.find(w => w >= recommendedWatts) || recommendedWatts;

		// Determine efficiency rating based on build quality
		let efficiency: '80+ Bronze' | '80+ Silver' | '80+ Gold' | '80+ Platinum' | '80+ Titanium';
		if (totalPeakWatts > 800) {
			efficiency = '80+ Gold';
		} else if (totalPeakWatts > 500) {
			efficiency = '80+ Silver';
		} else {
			efficiency = '80+ Bronze';
		}

		// Find matching PSUs
		const matchingPSUs = availablePSUs
			.filter(psu => {
				// Try to extract wattage from name or specs
				const wattageMatch = psu.name.match(/(\d+)\s*w/i);
				if (wattageMatch) {
					const psuWattage = parseInt(wattageMatch[1]);
					return psuWattage >= recommendedWatts && psuWattage <= recommendedWatts * 1.5;
				}
				return false;
			})
			.slice(0, 3);

		const options = matchingPSUs.map(psu => {
			const wattageMatch = psu.name.match(/(\d+)\s*w/i);
			return {
				wattage: wattageMatch ? parseInt(wattageMatch[1]) : optimalWattage,
				efficiency: efficiency,
				estimated_cost: psu.price
			};
		});

		// If no matching PSUs found, provide generic recommendations
		if (options.length === 0) {
			options.push({
				wattage: optimalWattage,
				efficiency: efficiency,
				estimated_cost: 0
			});
		}

		return {
			recommended_watts: optimalWattage,
			recommended_efficiency: efficiency,
			reason: `Your build requires ~${Math.round(totalPeakWatts)}W. A ${optimalWattage}W ${efficiency} PSU provides optimal efficiency and headroom.`,
			options
		};
	}

	/**
	 * Calculate energy savings if switching to alternatives
	 */
	calculateEnergySavings(
		originalAnalysis: BuildEnergyAnalysis,
		alternatives: EnergyEfficientAlternative[]
	): {
		total_power_savings_watts: number;
		monthly_savings_taka: number;
		yearly_savings_taka: number;
		carbon_reduction_kg: number;
	} {
		const totalPowerSavings = alternatives.reduce(
			(sum, alt) => sum + alt.power_savings_watts,
			0
		);

		const daily_kWh_savings = (totalPowerSavings * 8) / 1000; // 8 hours load
		const monthlySavings = daily_kWh_savings * 30 * ELECTRICITY_RATE;
		const yearlySavings = daily_kWh_savings * 365 * ELECTRICITY_RATE;
		const carbonReduction = daily_kWh_savings * 365 * CARBON_FACTOR;

		return {
			total_power_savings_watts: totalPowerSavings,
			monthly_savings_taka: Math.round(monthlySavings * 100) / 100,
			yearly_savings_taka: Math.round(yearlySavings * 100) / 100,
			carbon_reduction_kg: Math.round(carbonReduction * 100) / 100
		};
	}
}

export const energyEfficiencyService = new EnergyEfficiencyService();


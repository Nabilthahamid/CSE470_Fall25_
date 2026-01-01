// MODEL: Energy Efficiency data structures
import type { Product } from './Product';

export interface ComponentPowerConsumption {
	product_id: string;
	category: string;
	idle_watts: number; // Power consumption at idle
	load_watts: number; // Power consumption under load
	peak_watts?: number; // Peak power consumption
}

export interface BuildEnergyAnalysis {
	total_idle_watts: number;
	total_load_watts: number;
	total_peak_watts: number;
	recommended_psu_watts: number;
	monthly_electricity_cost: number; // In BDT (Taka)
	yearly_electricity_cost: number;
	daily_cost: number;
	carbon_footprint_kg: number; // CO2 emissions per year
	components: Array<{
		product: Product;
		category: string;
		idle_watts: number;
		load_watts: number;
	}>;
}

export interface EnergyEfficientAlternative {
	original_product: Product;
	alternative_product: Product;
	power_savings_watts: number;
	monthly_savings_taka: number;
	yearly_savings_taka: number;
	performance_impact: 'none' | 'minimal' | 'moderate' | 'significant';
	reason: string;
}

export interface PowerSupplyRecommendation {
	recommended_watts: number;
	recommended_efficiency: '80+ Bronze' | '80+ Silver' | '80+ Gold' | '80+ Platinum' | '80+ Titanium';
	reason: string;
	options: Array<{
		wattage: number;
		efficiency: string;
		estimated_cost: number;
	}>;
}

// Power consumption database (can be extended or moved to database)
export const DEFAULT_POWER_CONSUMPTION: Record<string, {
	idle: number;
	load: number;
	peak?: number;
}> = {
	// CPU
	'cpu': { idle: 15, load: 65, peak: 95 },
	// GPU
	'graphics_card': { idle: 20, load: 200, peak: 350 },
	// RAM
	'ram': { idle: 2, load: 3, peak: 4 },
	// Storage
	'storage': { idle: 1, load: 5, peak: 8 },
	// Motherboard
	'motherboard': { idle: 20, load: 40, peak: 50 },
	// PSU (efficiency loss)
	'power_supply': { idle: 0, load: 0, peak: 0 }, // PSU doesn't consume, it supplies
	// Case fans
	'casing_cooler': { idle: 2, load: 5, peak: 8 },
	// CPU Cooler
	'cpu_cooler': { idle: 1, load: 3, peak: 5 },
	// Monitor
	'monitor': { idle: 15, load: 30, peak: 50 },
	// Keyboard
	'keyboard': { idle: 0.5, load: 0.5, peak: 0.5 },
	// Mouse
	'mouse': { idle: 0.5, load: 0.5, peak: 0.5 },
	// Speakers
	'speakers': { idle: 5, load: 20, peak: 30 },
	// Headphone
	'headphone': { idle: 0.1, load: 0.1, peak: 0.1 },
	// WiFi Adapter
	'wifi_adapter': { idle: 1, load: 2, peak: 3 },
	// UPS
	'ups': { idle: 10, load: 20, peak: 30 }
};

// Electricity cost in Bangladesh (BDT per kWh)
export const ELECTRICITY_RATE = 6.5; // Average cost per kWh in BDT

// Carbon emission factor (kg CO2 per kWh) - Bangladesh grid average
export const CARBON_FACTOR = 0.6; // kg CO2 per kWh


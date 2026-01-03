// API: AI Pre-built Configurations endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ProductModel } from '$lib/models/ProductModel';
import { getAllCategories } from '$lib/utils/pc-builder';
import { requireAuth } from '$lib/utils/auth';
import type { Product } from '$lib/models/Product';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DEFAULT_POWER_CONSUMPTION } from '$lib/models/Energy';

interface BuildComponent {
	categoryId: string;
	categoryName: string;
	productId: string;
	productName: string;
	price: number;
	powerConsumption?: {
		idleWatts: number;
		loadWatts: number;
		peakWatts?: number;
	};
	productDetails?: string; // AI-generated product details
	imageUrl?: string | null;
	brand?: string | null;
	description?: string;
}

interface PreBuiltBuild {
	name: string;
	description: string;
	aiDescription?: string; // Detailed description from Gemini
	totalPrice: number;
	totalPowerConsumption?: {
		idleWatts: number;
		loadWatts: number;
		peakWatts: number;
	};
	components: BuildComponent[];
	isBest?: boolean; // Marked by Gemini as best option
	whyBest?: string; // Reason why this is the best
}

// Get Gemini API key
async function getGeminiApiKey(): Promise<string | undefined> {
	try {
		const env = await import('$env/static/private');
		return (env as any).GEMINI_API_KEY as string | undefined;
	} catch {
		return undefined;
	}
}

/**
 * Estimate power consumption for a product based on category
 */
function estimatePowerConsumption(product: Product, categoryName: string): {
	idleWatts: number;
	loadWatts: number;
	peakWatts?: number;
} {
	// Normalize category name
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
		idleWatts: defaultPower.idle,
		loadWatts: defaultPower.load,
		peakWatts: defaultPower.peak
	};
}

/**
 * Get product details and analysis from Gemini AI
 */
async function getGeminiProductAnalysis(
	product: Product,
	categoryName: string,
	useCase: string
): Promise<string | null> {
	try {
		const apiKey = await getGeminiApiKey();
		if (!apiKey) return null;

		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

		const prompt = `Analyze this PC component for a ${useCase} build:

Product: ${product.name}
Brand: ${product.brand || 'Unknown'}
Category: ${categoryName}
Description: ${product.description || 'No description'}
Price: ${product.price} Taka

Provide a brief analysis (2-3 sentences) focusing on:
1. Performance characteristics for ${useCase}
2. Value proposition
3. Key features that make it suitable

Keep it concise and informative.`;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		return response.text();
	} catch (error) {
		console.error('Gemini product analysis error:', error);
		return null;
	}
}

/**
 * Get Gemini recommendation on which build is best
 */
async function getGeminiBestBuildRecommendation(
	builds: PreBuiltBuild[],
	useCase: string,
	budget: number
): Promise<{ bestIndex: number; reason: string } | null> {
	try {
		const apiKey = await getGeminiApiKey();
		if (!apiKey || builds.length === 0) return null;

		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

		const buildsSummary = builds.map((build, index) => ({
			index,
			name: build.name,
			price: build.totalPrice,
			powerLoad: build.totalPowerConsumption?.loadWatts || 0,
			components: build.components.length
		}));

		const prompt = `Analyze these ${builds.length} PC builds for a ${useCase} build with a budget of ${budget} Taka:

${JSON.stringify(buildsSummary, null, 2)}

Determine which build is the BEST option for ${useCase} considering:
1. Performance-to-price ratio
2. Component quality and balance
3. Suitability for ${useCase}
4. Value for money

Respond in JSON format:
{
  "bestIndex": 0,
  "reason": "Brief explanation (2-3 sentences) why this build is best"
}`;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = response.text();

		// Try to parse JSON from response
		const jsonMatch = text.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			const parsed = JSON.parse(jsonMatch[0]);
			if (parsed.bestIndex >= 0 && parsed.bestIndex < builds.length) {
				return {
					bestIndex: parsed.bestIndex,
					reason: parsed.reason || 'Recommended as the best option'
				};
			}
		}

		// Fallback: return first build as best
		return {
			bestIndex: 0,
			reason: 'This build offers the best balance for your needs'
		};
	} catch (error) {
		console.error('Gemini best build recommendation error:', error);
		return null;
	}
}

/**
 * Generate pre-built PC builds based on use case and budget
 */
async function generatePreBuiltBuilds(
	products: Product[],
	categories: Array<{ id: string; display_name: string; is_required: boolean }>,
	useCase: string,
	budget: number
): Promise<PreBuiltBuild[]> {
	// Filter products by stock availability
	const availableProducts = products.filter(p => p.stock > 0);

	// Group products by category
	const productsByCategory: Record<string, Product[]> = {};
	categories.forEach(cat => {
		productsByCategory[cat.id] = availableProducts.filter(
			p => p.component_category_id === cat.id
		);
	});

	// Get required categories
	const requiredCategories = categories.filter(c => c.is_required);

	// Use case specific filtering
	const useCaseFilters: Record<string, (name: string, description: string) => boolean> = {
		gaming: (name, desc) => {
			const text = `${name} ${desc}`.toLowerCase();
			return text.includes('gaming') || text.includes('gpu') || text.includes('rtx') || 
				text.includes('gtx') || text.includes('radeon') || text.includes('ryzen') || 
				text.includes('intel core');
		},
		work: (name, desc) => {
			const text = `${name} ${desc}`.toLowerCase();
			return text.includes('professional') || text.includes('business') || 
				text.includes('workstation') || text.includes('intel') || text.includes('amd');
		},
		'content-creation': (name, desc) => {
			const text = `${name} ${desc}`.toLowerCase();
			return text.includes('creative') || text.includes('studio') || 
				text.includes('video') || text.includes('editing') || text.includes('rtx');
		}
	};

	const filterFn = useCaseFilters[useCase] || (() => true);

	// Generate multiple build variations
	const builds: PreBuiltBuild[] = [];
	const maxBuilds = 3;
	const budgetRange = budget * 0.1; // Allow 10% variance

	for (let buildIndex = 0; buildIndex < maxBuilds; buildIndex++) {
		const buildComponents: BuildComponent[] = [];
		let totalPrice = 0;
		const usedCategories = new Set<string>();

		// Select one product from each required category
		for (const category of requiredCategories) {
			const categoryProducts = productsByCategory[category.id] || [];
			
			// Filter by use case if filter exists
			let filteredProducts = categoryProducts;
			if (filterFn) {
				filteredProducts = categoryProducts.filter(p => 
					filterFn(p.name, p.description || '')
				);
			}

			// If filtered products are empty, use all products
			if (filteredProducts.length === 0) {
				filteredProducts = categoryProducts;
			}

			if (filteredProducts.length === 0) continue;

			// Select product based on build variation
			let selectedProduct: Product | null = null;

			if (buildIndex === 0) {
				// Build 1: Budget-friendly (lowest price within budget)
				const affordable = filteredProducts
					.filter(p => totalPrice + p.price <= budget + budgetRange)
					.sort((a, b) => a.price - b.price);
				selectedProduct = affordable[0] || null;
			} else if (buildIndex === 1) {
				// Build 2: Balanced (mid-range price)
				const sorted = filteredProducts
					.filter(p => totalPrice + p.price <= budget + budgetRange)
					.sort((a, b) => a.price - b.price);
				const midIndex = Math.floor(sorted.length / 2);
				selectedProduct = sorted[midIndex] || sorted[0] || null;
			} else {
				// Build 3: Performance (higher price, closer to budget)
				const sorted = filteredProducts
					.filter(p => totalPrice + p.price <= budget + budgetRange)
					.sort((a, b) => b.price - a.price);
				selectedProduct = sorted[0] || null;
			}

			if (selectedProduct && !usedCategories.has(category.id)) {
				const powerConsumption = estimatePowerConsumption(selectedProduct, category.display_name);
				
				buildComponents.push({
					categoryId: category.id,
					categoryName: category.display_name,
					productId: selectedProduct.id,
					productName: selectedProduct.name,
					price: selectedProduct.price,
					powerConsumption,
					imageUrl: selectedProduct.image_url,
					brand: selectedProduct.brand,
					description: selectedProduct.description
				});
				totalPrice += selectedProduct.price;
				usedCategories.add(category.id);
			}
		}

		// Add optional components if budget allows
		const optionalCategories = categories.filter(c => !c.is_required);
		const remainingBudget = budget - totalPrice;

		if (remainingBudget > 0 && buildComponents.length > 0) {
			for (const category of optionalCategories) {
				if (usedCategories.has(category.id)) continue;

				const categoryProducts = productsByCategory[category.id] || [];
				if (categoryProducts.length === 0) continue;

				const affordable = categoryProducts
					.filter(p => p.price <= remainingBudget * 0.3) // Use max 30% of remaining budget per optional
					.sort((a, b) => b.price - a.price); // Prefer higher value options

				if (affordable.length > 0 && Math.random() > 0.5) { // 50% chance to add optional
					const selectedProduct = affordable[0];
					const powerConsumption = estimatePowerConsumption(selectedProduct, category.display_name);
					
					buildComponents.push({
						categoryId: category.id,
						categoryName: category.display_name,
						productId: selectedProduct.id,
						productName: selectedProduct.name,
						price: selectedProduct.price,
						powerConsumption,
						imageUrl: selectedProduct.image_url,
						brand: selectedProduct.brand,
						description: selectedProduct.description
					});
					totalPrice += selectedProduct.price;
				}
			}
		}

		// Only add build if it has all required components and is within reasonable budget
		if (buildComponents.length >= requiredCategories.length && totalPrice <= budget + budgetRange) {
			// Calculate total power consumption
			const totalPowerConsumption = {
				idleWatts: buildComponents.reduce((sum, comp) => sum + (comp.powerConsumption?.idleWatts || 0), 0),
				loadWatts: buildComponents.reduce((sum, comp) => sum + (comp.powerConsumption?.loadWatts || 0), 0),
				peakWatts: buildComponents.reduce((sum, comp) => sum + (comp.powerConsumption?.peakWatts || comp.powerConsumption?.loadWatts || 0), 0)
			};

			const buildNames = [
				`${useCase.charAt(0).toUpperCase() + useCase.slice(1)} Build - Budget Option`,
				`${useCase.charAt(0).toUpperCase() + useCase.slice(1)} Build - Balanced`,
				`${useCase.charAt(0).toUpperCase() + useCase.slice(1)} Build - Performance`
			];

			const descriptions = [
				`A budget-friendly ${useCase} PC build optimized for value while maintaining performance.`,
				`A well-balanced ${useCase} PC build offering great performance-to-price ratio.`,
				`A high-performance ${useCase} PC build maximizing power within your budget.`
			];

			builds.push({
				name: buildNames[buildIndex] || `${useCase} Build ${buildIndex + 1}`,
				description: descriptions[buildIndex] || `A custom ${useCase} PC build.`,
				totalPrice,
				totalPowerConsumption,
				components: buildComponents
			});
		}
	}

	return builds;
}

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		requireAuth(locals.user);

		const { useCase, budget } = await request.json();

		if (!useCase || !budget) {
			return json({ error: 'Use case and budget are required' }, { status: 400 });
		}

		if (typeof budget !== 'number' || budget <= 0) {
			return json({ error: 'Budget must be a positive number' }, { status: 400 });
		}

		// Get available products and categories
		const [productsModels, categories] = await Promise.all([
			ProductModel.getAll(),
			getAllCategories()
		]);
		const products = productsModels.map(p => p.toJSON());

		if (categories.length === 0) {
			return json({ 
				error: 'No component categories found. Please set up categories first.' 
			}, { status: 404 });
		}

		// Generate pre-built builds
		const builds = await generatePreBuiltBuilds(products, categories, useCase, budget);

		if (builds.length === 0) {
			return json({ 
				error: `No builds could be generated for ${useCase} with budget ${budget}. Please try a higher budget or different use case.`,
				builds: []
			}, { status: 400 });
		}

		// Enhance builds with Gemini AI product details
		const enhancedBuilds = await Promise.all(
			builds.map(async (build) => {
				// Get AI product details for each component
				const enhancedComponents = await Promise.all(
					build.components.map(async (component) => {
						const product = products.find(p => p.id === component.productId);
						if (product) {
							const productDetails = await getGeminiProductAnalysis(
								product,
								component.categoryName,
								useCase
							);
							return {
								...component,
								productDetails: productDetails || undefined
							};
						}
						return component;
					})
				);

				return {
					...build,
					components: enhancedComponents
				};
			})
		);

		// Get Gemini recommendation on which build is best
		const bestBuildRec = await getGeminiBestBuildRecommendation(enhancedBuilds, useCase, budget);
		
		// Mark the best build
		if (bestBuildRec) {
			enhancedBuilds[bestBuildRec.bestIndex].isBest = true;
			enhancedBuilds[bestBuildRec.bestIndex].whyBest = bestBuildRec.reason;
			
			// Generate detailed AI description for the best build
			try {
				const apiKey = await getGeminiApiKey();
				if (apiKey) {
					const genAI = new GoogleGenerativeAI(apiKey);
					const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
					
					const bestBuild = enhancedBuilds[bestBuildRec.bestIndex];
					const componentsList = bestBuild.components
						.map(c => `- ${c.categoryName}: ${c.productName} (${c.brand || 'Unknown'}) - Tk ${c.price.toFixed(2)}`)
						.join('\n');

					const prompt = `Write a detailed 3-4 sentence description for this ${useCase} PC build (budget: ${budget} Taka, total: ${bestBuild.totalPrice.toFixed(2)} Taka):

Components:
${componentsList}

Power Consumption: ${bestBuild.totalPowerConsumption?.loadWatts}W under load

Write why this build is excellent for ${useCase}, highlighting key components and performance characteristics.`;

					const result = await model.generateContent(prompt);
					const response = await result.response;
					bestBuild.aiDescription = response.text();
				}
			} catch (error) {
				console.error('Error generating AI description:', error);
			}
		}

		return json({ builds: enhancedBuilds });
	} catch (error: any) {
		console.error('AI Pre-built Builds error:', error);
		return json(
			{ error: error.message || 'Failed to generate pre-built builds' },
			{ status: 500 }
		);
	}
};


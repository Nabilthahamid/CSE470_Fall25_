// SERVICE: Enhanced AI statistical methods and business logic
import type { Sale } from '$lib/models/Sale';
import type { Product } from '$lib/models/Product';
import type { Order } from '$lib/models/Order';
import type { User } from '$lib/models/User';

export interface SalesPredictionEnhanced {
	predictedSales: number;
	predictedRevenue: number;
	trend: 'increasing' | 'decreasing' | 'stable';
	confidence: number; // 0-1 scale
	scenarios: {
		optimistic: number;
		realistic: number;
		pessimistic: number;
	};
	factors: string[];
	timeHorizons: {
		'7days': { sales: number; revenue: number };
		'14days': { sales: number; revenue: number };
		'30days': { sales: number; revenue: number };
		'90days': { sales: number; revenue: number };
	};
}

export interface StockRecommendationEnhanced {
	productId: string;
	productName: string;
	currentStock: number;
	recommendedOrder: number;
	urgency: 'high' | 'medium' | 'low';
	reason: string;
	estimatedStockoutDate: string;
	priorityScore: number; // 0-1 scale
	salesVelocity: number; // units per day
	leadTime: number; // days
	reorderPoint: number;
	safetyStock: number;
	eoq: number; // Economic Order Quantity
}

export interface RFMSegment {
	userId: string;
	userName: string;
	recency: number; // days since last order
	frequency: number; // orders count
	monetary: number; // total spent
	segment: 'Champion' | 'Loyal' | 'At Risk' | 'New' | 'Lost';
	score: number; // 0-1 scale
}

export interface CustomerInsightsEnhanced {
	totalCustomers: number;
	averageOrderValue: number;
	customerLifetimeValue: number;
	topCustomers: Array<{ userId: string; userName: string; totalSpent: number; orderCount: number }>;
	churnRiskCustomers: Array<{
		userId: string;
		userName: string;
		churnProbability: number;
		riskFactors: string[];
	}>;
	segments: {
		champions: number;
		loyal: number;
		atRisk: number;
		new: number;
		lost: number;
	};
	recommendations: string[];
}

export interface OrderRiskScore {
	orderId: string;
	riskScore: number; // 0-1 scale
	riskLevel: 'high' | 'medium' | 'low';
	factors: string[];
	recommendations: string[];
}

export interface ProductPerformanceAnalysis {
	productId: string;
	productName: string;
	salesVelocity: number; // units per day
	revenueContribution: number; // percentage
	profitMargin: number; // percentage
	customerSatisfaction: number; // 0-5 scale (from reviews)
	returnRate: number; // percentage
	stockTurnover: number; // ratio
	recommendations: string[];
}

export interface Anomaly {
	date: string;
	type: 'spike' | 'drop' | 'unusual_pattern';
	severity: 'high' | 'medium' | 'low';
	explanation: string;
	recommendedAction: string;
	value: number;
	deviation: number; // percentage deviation from expected
}

export interface CLV {
	currentValue: number;
	predictedValue: number;
	purchaseFrequency: number; // orders per month
	averageOrderValue: number;
	customerLifespan: number; // months
	segment: 'high' | 'medium' | 'low';
}

export interface ChurnPrediction {
	userId: string;
	userName: string;
	churnProbability: number; // 0-1 scale
	riskFactors: string[];
	recommendedActions: string[];
	daysSinceLastOrder: number;
}

export class EnhancedAIService {
	/**
	 * Calculate simple moving average
	 */
	calculateSimpleMovingAverage(data: number[], period: number): number[] {
		const result: number[] = [];
		for (let i = 0; i < data.length; i++) {
			if (i < period - 1) {
				result.push(NaN);
			} else {
				const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
				result.push(sum / period);
			}
		}
		return result;
	}

	/**
	 * Calculate weighted moving average
	 */
	calculateWeightedMovingAverage(data: number[], period: number): number[] {
		const result: number[] = [];
		const weights = Array.from({ length: period }, (_, i) => i + 1);
		const weightSum = weights.reduce((a, b) => a + b, 0);

		for (let i = 0; i < data.length; i++) {
			if (i < period - 1) {
				result.push(NaN);
			} else {
				const slice = data.slice(i - period + 1, i + 1);
				const weightedSum = slice.reduce((sum, value, idx) => sum + value * weights[idx], 0);
				result.push(weightedSum / weightSum);
			}
		}
		return result;
	}

	/**
	 * Calculate exponential moving average
	 */
	calculateExponentialMovingAverage(data: number[], alpha: number): number[] {
		if (data.length === 0) return [];
		const result: number[] = [data[0]]; // First value is the first data point

		for (let i = 1; i < data.length; i++) {
			const ema = alpha * data[i] + (1 - alpha) * result[i - 1];
			result.push(ema);
		}
		return result;
	}

	/**
	 * Detect trend in data
	 */
	detectTrend(data: number[]): 'increasing' | 'decreasing' | 'stable' {
		if (data.length < 2) return 'stable';

		// Use linear regression to detect trend
		const n = data.length;
		const x = Array.from({ length: n }, (_, i) => i);
		const sumX = x.reduce((a, b) => a + b, 0);
		const sumY = data.reduce((a, b) => a + b, 0);
		const sumXY = x.reduce((sum, xi, i) => sum + xi * data[i], 0);
		const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

		const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

		if (slope > 0.1) return 'increasing';
		if (slope < -0.1) return 'decreasing';
		return 'stable';
	}

	/**
	 * Calculate Z-score for anomaly detection
	 */
	calculateZScore(value: number, mean: number, stdDev: number): number {
		if (stdDev === 0) return 0;
		return (value - mean) / stdDev;
	}

	/**
	 * Calculate reorder point: (daily sales × lead time) + safety stock
	 */
	calculateReorderPoint(salesVelocity: number, leadTime: number, safetyStock: number): number {
		return Math.ceil(salesVelocity * leadTime + safetyStock);
	}

	/**
	 * Calculate Economic Order Quantity (EOQ)
	 * EOQ = sqrt((2 × D × S) / H)
	 * D = annual demand, S = ordering cost, H = holding cost per unit
	 */
	calculateEOQ(demand: number, orderingCost: number, holdingCost: number): number {
		if (holdingCost === 0) return demand;
		const eoq = Math.sqrt((2 * demand * orderingCost) / holdingCost);
		return Math.ceil(eoq);
	}

	/**
	 * Calculate safety stock based on demand variability and lead time
	 */
	calculateSafetyStock(
		averageDemand: number,
		demandStdDev: number,
		leadTime: number,
		serviceLevel: number = 0.95
	): number {
		// Z-score for service level (95% = 1.65)
		const zScore = serviceLevel === 0.95 ? 1.65 : serviceLevel === 0.99 ? 2.33 : 1.28;
		const safetyStock = zScore * demandStdDev * Math.sqrt(leadTime);
		return Math.ceil(Math.max(safetyStock, averageDemand * 0.1)); // At least 10% of average demand
	}

	/**
	 * Perform RFM Analysis (Recency, Frequency, Monetary)
	 */
	performRFMAnalysis(
		customers: Array<{
			userId: string;
			userName: string;
			lastOrderDate: string | null;
			orderCount: number;
			totalSpent: number;
		}>
	): RFMSegment[] {
		const segments: RFMSegment[] = [];
		const now = Date.now();

		for (const customer of customers) {
			const recency = customer.lastOrderDate
				? Math.floor((now - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
				: 999;

			// Score each dimension (1-5 scale)
			let recencyScore = 5;
			if (recency <= 30) recencyScore = 5;
			else if (recency <= 60) recencyScore = 4;
			else if (recency <= 90) recencyScore = 3;
			else if (recency <= 180) recencyScore = 2;
			else recencyScore = 1;

			const frequencyScore = Math.min(5, Math.max(1, Math.ceil(customer.orderCount / 2)));

			// Calculate monetary score based on average spending
			const avgOrderValue = customer.orderCount > 0 ? customer.totalSpent / customer.orderCount : 0;
			let monetaryScore = 1;
			if (avgOrderValue >= 10000) monetaryScore = 5;
			else if (avgOrderValue >= 5000) monetaryScore = 4;
			else if (avgOrderValue >= 2000) monetaryScore = 3;
			else if (avgOrderValue >= 1000) monetaryScore = 2;

			// Determine segment
			let segment: RFMSegment['segment'] = 'New';
			if (recencyScore >= 4 && frequencyScore >= 4 && monetaryScore >= 4) {
				segment = 'Champion';
			} else if (recencyScore >= 3 && frequencyScore >= 3) {
				segment = 'Loyal';
			} else if (recencyScore <= 2 && frequencyScore >= 2) {
				segment = 'At Risk';
			} else if (recency <= 30 && customer.orderCount === 1) {
				segment = 'New';
			} else if (recency > 180) {
				segment = 'Lost';
			}

			const score = (recencyScore + frequencyScore + monetaryScore) / 15; // Normalize to 0-1

			segments.push({
				userId: customer.userId,
				userName: customer.userName,
				recency,
				frequency: customer.orderCount,
				monetary: customer.totalSpent,
				segment,
				score
			});
		}

		return segments;
	}

	/**
	 * Calculate Customer Lifetime Value (CLV)
	 * CLV = Average Order Value × Purchase Frequency × Customer Lifespan
	 */
	calculateCLV(avgOrderValue: number, purchaseFrequency: number, customerLifespan: number): number {
		return avgOrderValue * purchaseFrequency * customerLifespan;
	}

	/**
	 * Detect anomalies in sales data using statistical methods
	 */
	detectAnomalies(salesData: Sale[]): Anomaly[] {
		if (salesData.length < 7) return []; // Need at least 7 days of data

		// Group by date
		const salesByDate = salesData.reduce(
			(acc, sale) => {
				if (!sale.created_at) return acc;
				const date = new Date(sale.created_at).toDateString();
				if (!acc[date]) acc[date] = { revenue: 0, count: 0 };
				acc[date].revenue += sale.total_amount;
				acc[date].count += sale.quantity;
				return acc;
			},
			{} as Record<string, { revenue: number; count: number }>
		);

		const dates = Object.keys(salesByDate).sort();
		const revenues = dates.map((date) => salesByDate[date].revenue);

		// Calculate mean and standard deviation
		const mean = revenues.reduce((a, b) => a + b, 0) / revenues.length;
		const variance =
			revenues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / revenues.length;
		const stdDev = Math.sqrt(variance);

		// Calculate moving average for comparison
		const movingAvg = this.calculateSimpleMovingAverage(revenues, 7).filter((v) => !isNaN(v));
		const avgMovingAvg = movingAvg.reduce((a, b) => a + b, 0) / movingAvg.length;

		const anomalies: Anomaly[] = [];

		dates.forEach((date, index) => {
			const revenue = revenues[index];
			const zScore = this.calculateZScore(revenue, mean, stdDev);

			// Detect spikes (Z-score > 2)
			if (zScore > 2) {
				anomalies.push({
					date,
					type: 'spike',
					severity: zScore > 3 ? 'high' : 'medium',
					explanation: `Sales increased ${((revenue / mean - 1) * 100).toFixed(1)}% compared to average`,
					recommendedAction: 'Investigate marketing campaign impact or external factors',
					value: revenue,
					deviation: (revenue / mean - 1) * 100
				});
			}
			// Detect drops (Z-score < -2)
			else if (zScore < -2 && revenue > 0) {
				anomalies.push({
					date,
					type: 'drop',
					severity: zScore < -3 ? 'high' : 'medium',
					explanation: `Sales decreased ${((1 - revenue / mean) * 100).toFixed(1)}% compared to average`,
					recommendedAction: 'Review inventory availability and marketing strategies',
					value: revenue,
					deviation: (1 - revenue / mean) * 100
				});
			}
			// Detect unusual patterns (deviation from moving average > 50%)
			else if (index >= 6) {
				const maIndex = index - 6;
				if (maIndex < movingAvg.length && movingAvg[maIndex] > 0) {
					const deviation = Math.abs((revenue - movingAvg[maIndex]) / movingAvg[maIndex]);
					if (deviation > 0.5 && deviation < 2) {
						// Not a spike/drop but unusual
						anomalies.push({
							date,
							type: 'unusual_pattern',
							severity: deviation > 0.75 ? 'medium' : 'low',
							explanation: `Sales deviated ${(deviation * 100).toFixed(1)}% from 7-day moving average`,
							recommendedAction: 'Monitor for patterns or seasonal effects',
							value: revenue,
							deviation: deviation * 100
						});
					}
				}
			}
		});

		return anomalies.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
	}

	/**
	 * Find similar products based on name, description, price, and specs
	 */
	findSimilarProducts(
		product: Product,
		allProducts: Product[]
	): Array<{ product: Product; similarityScore: number }> {
		const similar: Array<{ product: Product; similarityScore: number }> = [];

		for (const other of allProducts) {
			if (other.id === product.id) continue;

			let score = 0;
			let maxScore = 0;

			// Name similarity (40% weight)
			const nameSimilarity = this.calculateStringSimilarity(
				product.name.toLowerCase(),
				other.name.toLowerCase()
			);
			score += nameSimilarity * 0.4;
			maxScore += 0.4;

			// Description similarity (30% weight)
			if (product.description && other.description) {
				const descSimilarity = this.calculateStringSimilarity(
					product.description.toLowerCase(),
					other.description.toLowerCase()
				);
				score += descSimilarity * 0.3;
				maxScore += 0.3;
			}

			// Price similarity (20% weight) - products within 20% price range
			const priceDiff =
				Math.abs(product.price - other.price) / Math.max(product.price, other.price);
			const priceSimilarity = Math.max(0, 1 - priceDiff * 5); // 0-20% diff = high similarity
			score += priceSimilarity * 0.2;
			maxScore += 0.2;

			// Brand similarity (10% weight)
			if (product.brand && other.brand && product.brand === other.brand) {
				score += 0.1;
				maxScore += 0.1;
			}

			const finalScore = maxScore > 0 ? score / maxScore : 0;

			if (finalScore > 0.5) {
				similar.push({ product: other, similarityScore: finalScore });
			}
		}

		return similar.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 10);
	}

	/**
	 * Calculate string similarity using Jaccard similarity (word-based)
	 */
	private calculateStringSimilarity(str1: string, str2: string): number {
		const words1 = new Set(str1.split(/\s+/).filter((w) => w.length > 2));
		const words2 = new Set(str2.split(/\s+/).filter((w) => w.length > 2));

		const intersection = new Set([...words1].filter((w) => words2.has(w)));
		const union = new Set([...words1, ...words2]);

		return union.size > 0 ? intersection.size / union.size : 0;
	}

	/**
	 * Suggest product category based on name and description
	 */
	suggestCategory(product: Product): Array<{ category: string; score: number }> {
		const text = `${product.name} ${product.description || ''}`.toLowerCase();
		const suggestions: Array<{ category: string; score: number }> = [];

		// Category keywords mapping
		const categoryKeywords: Record<string, string[]> = {
			CPU: ['cpu', 'processor', 'intel', 'amd', 'ryzen', 'core i'],
			GPU: ['gpu', 'graphics', 'video card', 'rtx', 'gtx', 'radeon'],
			RAM: ['ram', 'memory', 'ddr'],
			Storage: ['ssd', 'hdd', 'hard drive', 'storage', 'nvme'],
			Motherboard: ['motherboard', 'mobo', 'mainboard'],
			PSU: ['psu', 'power supply'],
			Case: ['case', 'chassis', 'tower'],
			Cooling: ['cooler', 'fan', 'cooling', 'heatsink'],
			Monitor: ['monitor', 'display', 'screen'],
			Keyboard: ['keyboard'],
			Mouse: ['mouse'],
			Headphone: ['headphone', 'headset', 'earphone'],
			Speaker: ['speaker'],
			Laptop: ['laptop', 'notebook']
		};

		for (const [category, keywords] of Object.entries(categoryKeywords)) {
			const matches = keywords.filter((keyword) => text.includes(keyword)).length;
			if (matches > 0) {
				suggestions.push({
					category,
					score: matches / keywords.length
				});
			}
		}

		return suggestions.sort((a, b) => b.score - a.score).slice(0, 3);
	}
}

// Export singleton instance
export const enhancedAIService = new EnhancedAIService();

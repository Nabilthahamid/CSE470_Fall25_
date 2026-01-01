// SERVICE: AI business logic and data access layer
import type { Product } from '$lib/models/Product';
import type { Sale } from '$lib/models/Sale';
import OpenAI from 'openai';
import { env } from '$env/dynamic/private';
import { productService } from './ProductService';
import { saleService } from './SaleService';

export interface ComparisonInsight {
	bestValue: {
		productId: string;
		reason: string;
	};
	bestForGaming?: {
		productId: string;
		reason: string;
	};
	bestForWork?: {
		productId: string;
		reason: string;
	};
	bestPerformance?: {
		productId: string;
		reason: string;
	};
	summary: string;
	recommendation: string;
}

export class AIService {
	/**
	 * Analyze products and provide AI insights for comparison
	 * This uses a rule-based approach that can be enhanced with OpenAI API later
	 */
	async analyzeComparison(products: Product[]): Promise<ComparisonInsight> {
		if (products.length === 0) {
			throw new Error('No products to analyze');
		}

		if (products.length === 1) {
			return {
				bestValue: {
					productId: products[0].id,
					reason: 'Only one product in comparison'
				},
				summary: 'Add more products to compare and get AI insights.',
				recommendation: 'Consider adding similar products to compare features, prices, and value.'
			};
		}

		// Analyze products for best value (price/performance)
		const bestValue = this.findBestValue(products);
		
		// Analyze for gaming suitability
		const bestForGaming = this.findBestForGaming(products);
		
		// Analyze for work/productivity
		const bestForWork = this.findBestForWork(products);
		
		// Find best performance
		const bestPerformance = this.findBestPerformance(products);

		// Generate summary
		const summary = this.generateSummary(products, bestValue, bestForGaming, bestForWork);
		
		// Generate recommendation
		const recommendation = this.generateRecommendation(products, bestValue, bestForGaming, bestForWork);

		return {
			bestValue,
			bestForGaming,
			bestForWork,
			bestPerformance,
			summary,
			recommendation
		};
	}

	/**
	 * Find best value product (best price/performance ratio)
	 */
	private findBestValue(products: Product[]): { productId: string; reason: string } {
		// Calculate value score (lower price with good specs = better value)
		const scored = products.map(product => {
			// Simple value calculation: consider price and specifications
			const priceScore = 1000 / (product.price || 1); // Lower price = higher score
			const specScore = this.extractSpecScore(product);
			const valueScore = (specScore * 0.7) + (priceScore * 0.3);
			
			return {
				productId: product.id,
				product,
				valueScore
			};
		});

		const best = scored.reduce((prev, current) => 
			current.valueScore > prev.valueScore ? current : prev
		);

		const price = best.product.price.toFixed(2);
		return {
			productId: best.productId,
			reason: `Best value for money at Tk ${price}. Offers excellent features at a competitive price point.`
		};
	}

	/**
	 * Find best product for gaming
	 */
	private findBestForGaming(products: Product[]): { productId: string; reason: string } | undefined {
		// Look for gaming-related keywords in name, description, or specs
		const gamingKeywords = ['gaming', 'gpu', 'graphics', 'rgb', 'performance', 'fps', 'rtx', 'gtx'];
		
		const scored = products.map(product => {
			const text = `${product.name} ${product.description} ${product.specifications || ''}`.toLowerCase();
			const gamingScore = gamingKeywords.reduce((score, keyword) => {
				return score + (text.includes(keyword) ? 1 : 0);
			}, 0);
			
			// Also consider if it's a GPU or has high performance specs
			const isGPU = text.includes('graphics') || text.includes('gpu') || text.includes('video card');
			const hasHighPerf = text.includes('high performance') || text.includes('powerful');
			
			return {
				productId: product.id,
				product,
				gamingScore: gamingScore + (isGPU ? 3 : 0) + (hasHighPerf ? 2 : 0)
			};
		});

		const best = scored.reduce((prev, current) => 
			current.gamingScore > prev.gamingScore ? current : prev
		);

		if (best.gamingScore === 0) {
			return undefined; // No gaming-specific products found
		}

		return {
			productId: best.productId,
			reason: `Best for gaming with gaming-optimized features and performance specifications.`
		};
	}

	/**
	 * Find best product for work/productivity
	 */
	private findBestForWork(products: Product[]): { productId: string; reason: string } | undefined {
		// Look for work/productivity keywords
		const workKeywords = ['office', 'productivity', 'business', 'professional', 'workstation', 'efficient', 'reliable'];
		
		const scored = products.map(product => {
			const text = `${product.name} ${product.description} ${product.specifications || ''}`.toLowerCase();
			const workScore = workKeywords.reduce((score, keyword) => {
				return score + (text.includes(keyword) ? 1 : 0);
			}, 0);
			
			// Consider reliability and efficiency
			const isReliable = text.includes('reliable') || text.includes('durable') || text.includes('quality');
			const isEfficient = text.includes('efficient') || text.includes('energy') || text.includes('low power');
			
			return {
				productId: product.id,
				product,
				workScore: workScore + (isReliable ? 2 : 0) + (isEfficient ? 1 : 0)
			};
		});

		const best = scored.reduce((prev, current) => 
			current.workScore > prev.workScore ? current : prev
		);

		if (best.workScore === 0) {
			return undefined; // No work-specific products found
		}

		return {
			productId: best.productId,
			reason: `Best for work and productivity with reliable performance and professional features.`
		};
	}

	/**
	 * Find best performance product
	 */
	private findBestPerformance(products: Product[]): { productId: string; reason: string } | undefined {
		// Consider price as indicator of performance (usually higher price = better performance)
		// Also look for performance keywords
		const performanceKeywords = ['high performance', 'powerful', 'fast', 'speed', 'premium', 'flagship'];
		
		const scored = products.map(product => {
			const text = `${product.name} ${product.description} ${product.specifications || ''}`.toLowerCase();
			const perfScore = performanceKeywords.reduce((score, keyword) => {
				return score + (text.includes(keyword) ? 1 : 0);
			}, 0);
			
			// Price can indicate performance level (but not always)
			const priceScore = product.price / 10000; // Normalize price
			const specScore = this.extractSpecScore(product);
			
			return {
				productId: product.id,
				product,
				performanceScore: (perfScore * 2) + (specScore * 0.5) + (priceScore * 0.3)
			};
		});

		const best = scored.reduce((prev, current) => 
			current.performanceScore > prev.performanceScore ? current : prev
		);

		return {
			productId: best.productId,
			reason: `Best overall performance with high-end specifications and premium features.`
		};
	}

	/**
	 * Extract a score from product specifications
	 */
	private extractSpecScore(product: Product): number {
		const text = `${product.specifications || ''} ${product.description || ''}`.toLowerCase();
		
		// Look for numeric indicators of performance
		let score = 0;
		
		// CPU indicators
		if (text.includes('i9') || text.includes('ryzen 9')) score += 10;
		else if (text.includes('i7') || text.includes('ryzen 7')) score += 7;
		else if (text.includes('i5') || text.includes('ryzen 5')) score += 5;
		else if (text.includes('i3') || text.includes('ryzen 3')) score += 3;
		
		// RAM indicators
		const ramMatch = text.match(/(\d+)\s*gb\s*(?:ram|memory)/i);
		if (ramMatch) {
			const ramGB = parseInt(ramMatch[1]);
			score += Math.min(ramGB / 4, 5); // Max 5 points for RAM
		}
		
		// Storage indicators
		if (text.includes('ssd') || text.includes('nvme')) score += 3;
		if (text.includes('1tb') || text.includes('2tb')) score += 2;
		
		// GPU indicators
		if (text.includes('rtx 40') || text.includes('rtx 30')) score += 8;
		else if (text.includes('rtx') || text.includes('gtx')) score += 5;
		
		return score;
	}

	/**
	 * Generate summary of comparison
	 */
	private generateSummary(
		products: Product[],
		bestValue: { productId: string; reason: string },
		bestForGaming?: { productId: string; reason: string },
		bestForWork?: { productId: string; reason: string }
	): string {
		const bestValueProduct = products.find(p => p.id === bestValue.productId);
		const insights: string[] = [];
		
		if (bestValueProduct) {
			insights.push(`Best Value: ${bestValueProduct.name} offers the best price-to-performance ratio.`);
		}
		
		if (bestForGaming) {
			const gamingProduct = products.find(p => p.id === bestForGaming.productId);
			if (gamingProduct) {
				insights.push(`Best for Gaming: ${gamingProduct.name} is optimized for gaming performance.`);
			}
		}
		
		if (bestForWork) {
			const workProduct = products.find(p => p.id === bestForWork.productId);
			if (workProduct) {
				insights.push(`Best for Work: ${workProduct.name} excels in productivity and professional tasks.`);
			}
		}
		
		return insights.join(' ') || `Comparing ${products.length} products. Each has unique strengths based on your needs.`;
	}

	/**
	 * Generate recommendation
	 */
	private generateRecommendation(
		products: Product[],
		bestValue: { productId: string; reason: string },
		bestForGaming?: { productId: string; reason: string },
		bestForWork?: { productId: string; reason: string }
	): string {
		const priceRange = {
			min: Math.min(...products.map(p => p.price)),
			max: Math.max(...products.map(p => p.price))
		};
		
		const priceDiff = ((priceRange.max - priceRange.min) / priceRange.min) * 100;
		
		if (priceDiff > 50) {
			return `There's a significant price difference (${priceDiff.toFixed(0)}%) between these products. Consider your budget and specific needs. The best value option provides excellent features at a competitive price.`;
		} else if (priceDiff > 20) {
			return `These products are in a similar price range. Choose based on your specific use case - gaming, work, or general use.`;
		} else {
			return `These products are similarly priced. The choice depends on your specific requirements and preferences.`;
		}
	}

	/**
	 * Enhanced AI analysis using OpenAI (optional - requires API key)
	 * This uses OpenAI GPT for more sophisticated analysis
	 */
	async analyzeComparisonWithAI(products: Product[]): Promise<ComparisonInsight> {
		// Check if OpenAI is available
		const openaiApiKey = process.env.OPENAI_API_KEY;
		
		if (!openaiApiKey) {
			// Fallback to rule-based analysis
			return this.analyzeComparison(products);
		}

		try {
			const openai = new OpenAI({
				apiKey: openaiApiKey
			});

			// Prepare product data for AI analysis
			const productData = products.map(p => ({
				name: p.name,
				price: p.price,
				description: p.description,
				brand: p.brand,
				specifications: p.specifications,
				stock: p.stock
			}));

			// Create a detailed prompt for AI analysis
			const prompt = `You are an expert tech product analyst. Analyze these ${products.length} products and provide detailed comparison insights.

Products to compare:
${productData.map((p, i) => `
Product ${i + 1}:
- Name: ${p.name}
- Price: ${p.price} Taka (Bangladeshi currency)
- Brand: ${p.brand || 'Not specified'}
- Description: ${p.description}
- Specifications: ${p.specifications || 'Not provided'}
- Stock: ${p.stock} units
`).join('\n')}

Please provide a JSON response with the following structure:
{
  "bestValue": {
    "productIndex": 0,
    "reason": "Detailed reason why this is the best value"
  },
  "bestForGaming": {
    "productIndex": 0,
    "reason": "Detailed reason why this is best for gaming"
  },
  "bestForWork": {
    "productIndex": 0,
    "reason": "Detailed reason why this is best for work/productivity"
  },
  "bestPerformance": {
    "productIndex": 0,
    "reason": "Detailed reason why this has best performance"
  },
  "summary": "A comprehensive summary comparing all products",
  "recommendation": "A personalized buying recommendation based on different use cases"
}

Important:
- Use productIndex (0-based: 0, 1, 2, etc.) to reference products
- Provide detailed, specific reasons for each recommendation
- Consider price, specifications, brand reputation, and use cases
- Be specific about gaming, work, and performance characteristics
- Return ONLY valid JSON, no additional text`;

			const response = await openai.chat.completions.create({
				model: 'gpt-3.5-turbo', // Using GPT-3.5 for cost efficiency, can upgrade to GPT-4
				messages: [
					{
						role: 'system',
						content: 'You are an expert tech product analyst specializing in computer hardware and electronics. Provide detailed, accurate, and helpful product comparison insights.'
					},
					{
						role: 'user',
						content: prompt
					}
				],
				temperature: 0.7,
				max_tokens: 1500
			});

			const aiResponse = response.choices[0]?.message?.content;
			
			if (!aiResponse) {
				throw new Error('No response from AI');
			}

			// Parse AI response (it might have markdown code blocks)
			let jsonText = aiResponse.trim();
			if (jsonText.startsWith('```json')) {
				jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
			} else if (jsonText.startsWith('```')) {
				jsonText = jsonText.replace(/```\n?/g, '');
			}

			const aiAnalysis = JSON.parse(jsonText);

			// Convert productIndex to productId
			const convertToProductId = (index: number) => {
				if (index >= 0 && index < products.length) {
					return products[index].id;
				}
				return products[0].id; // Fallback
			};

			// Build the insight object
			const insights: ComparisonInsight = {
				bestValue: {
					productId: convertToProductId(aiAnalysis.bestValue?.productIndex ?? 0),
					reason: aiAnalysis.bestValue?.reason || 'Best value based on price and features'
				},
				summary: aiAnalysis.summary || 'AI analysis of product comparison',
				recommendation: aiAnalysis.recommendation || 'Consider your specific needs and budget when choosing'
			};

			// Add optional insights
			if (aiAnalysis.bestForGaming) {
				insights.bestForGaming = {
					productId: convertToProductId(aiAnalysis.bestForGaming.productIndex),
					reason: aiAnalysis.bestForGaming.reason
				};
			}

			if (aiAnalysis.bestForWork) {
				insights.bestForWork = {
					productId: convertToProductId(aiAnalysis.bestForWork.productIndex),
					reason: aiAnalysis.bestForWork.reason
				};
			}

			if (aiAnalysis.bestPerformance) {
				insights.bestPerformance = {
					productId: convertToProductId(aiAnalysis.bestPerformance.productIndex),
					reason: aiAnalysis.bestPerformance.reason
				};
			}

			return insights;

		} catch (error) {
			console.error('AI analysis failed, using rule-based fallback:', error);
			// Fallback to rule-based analysis if AI fails
			return this.analyzeComparison(products);
		}
	}

	/**
	 * Handle chatbot messages with context-aware responses
	 */
	async handleChatMessage(
		message: string,
		userId: string | null,
		conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
	): Promise<string> {
		const openaiApiKey = env.OPENAI_API_KEY;

		if (!openaiApiKey) {
			// Fallback to rule-based responses
			return this.handleChatMessageRuleBased(message, userId);
		}

		try {
			const openai = new OpenAI({
				apiKey: openaiApiKey
			});

			// Get context data (with error handling)
			let context = '';
			try {
				context = await this.getChatContext(userId);
			} catch (error) {
				console.warn('Could not build chat context, continuing without it:', error);
			}

			// Build system prompt with context
			const systemPrompt = `You are a helpful AI assistant for TinyTech, an e-commerce platform specializing in computers, laptops, gaming PCs, and tech products in Bangladesh.

Your role:
- Answer product questions accurately
- Help customers with order status inquiries
- Provide product recommendations based on customer needs
- Be friendly, professional, and concise
- Always provide helpful information about TinyTech products

${context}

Important guidelines:
- If asked about orders, check the order information provided in context
- If asked about products, ALWAYS suggest specific products from the context with their IDs in format: /products/{id}
- When suggesting products, include: product name, price (Tk), and link in format: **Product Name** - Tk {price} | View: /products/{id}
- If customer asks for a product type (e.g., "monitor", "laptop"), search the product list and suggest matching products
- If you don't have specific information, suggest the customer contact support
- Always be helpful and try to guide customers to find what they need
- Prices are in Bangladeshi Taka (Tk)
- Keep responses concise but informative
- Always include clickable product links when suggesting products`;

			// Build conversation history
			const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
				{ role: 'system', content: systemPrompt },
				...conversationHistory.slice(-10), // Keep last 10 messages for context
				{ role: 'user', content: message }
			];

			const response = await openai.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: messages,
				temperature: 0.7,
				max_tokens: 500
			});

			const aiResponse = response.choices[0]?.message?.content;
			return aiResponse || 'I apologize, but I couldn\'t generate a response. Please try again.';
		} catch (error: any) {
			console.error('Chatbot error:', error);
			
			// Check for quota/rate limit errors and fallback gracefully
			if (error?.status === 429 || error?.code === 'insufficient_quota' || error?.code === 'rate_limit_exceeded') {
				console.warn('OpenAI API quota exceeded, using rule-based fallback');
				return this.handleChatMessageRuleBased(message, userId);
			}
			
			// For other errors, also fallback to rule-based
			return this.handleChatMessageRuleBased(message, userId);
		}
	}

	/**
	 * Get context data for chatbot (products, orders, etc.)
	 */
	private async getChatContext(userId: string | null): Promise<string> {
		let context = '';

		try {
			// Get recent products for context
			const products = await productService.getAllProducts();
			const recentProducts = products.slice(0, 10).map(p => ({
				name: p.name,
				price: p.price,
				description: p.description?.substring(0, 100),
				brand: p.brand
			}));

			context += `\n\nAvailable Products (sample):\n${JSON.stringify(recentProducts, null, 2)}\n`;

			// Get user orders if userId is provided
			if (userId) {
				try {
					const sales = await saleService.getAll({ userId });
					if (sales.length > 0) {
						const recentOrders = sales.slice(0, 5).map(s => ({
							id: s.id,
							product_name: (s as any).product_name || 'Unknown',
							quantity: s.quantity,
							total: s.total,
							created_at: s.created_at
						}));
						context += `\n\nUser's Recent Orders:\n${JSON.stringify(recentOrders, null, 2)}\n`;
					}
				} catch (error) {
					// Orders might not be available, continue without them
					console.warn('Could not fetch orders for chat context:', error);
				}
			}
		} catch (error) {
			console.warn('Error building chat context:', error);
		}

		return context;
	}

	/**
	 * Rule-based fallback for chatbot when AI is not available
	 */
	private async handleChatMessageRuleBased(
		message: string,
		userId: string | null
	): Promise<string> {
		const lowerMessage = message.toLowerCase();

		// Order status inquiries
		if (lowerMessage.includes('order') || lowerMessage.includes('status') || lowerMessage.includes('track')) {
			if (userId) {
				try {
					const sales = await saleService.getAll({ userId });
					if (sales.length > 0) {
						const recentOrder = sales[0];
						return `Your most recent order (ID: ${recentOrder.id}) was placed on ${new Date(recentOrder.created_at).toLocaleDateString()}. Total: Tk ${recentOrder.total.toFixed(2)}. For detailed tracking, please check your profile or contact our support team.`;
					}
					return 'You don\'t have any orders yet. Browse our products and make your first purchase!';
				} catch (error) {
					return 'I couldn\'t retrieve your order information. Please contact our support team for assistance.';
				}
			}
			return 'Please log in to check your order status. You can view all your orders in your profile.';
		}

		// Product search - extract keywords and search for products
		const productKeywords = this.extractProductKeywords(lowerMessage);
		if (productKeywords.length > 0 || this.isProductQuery(lowerMessage)) {
			try {
				// Try searching with extracted keywords
				let searchResults: Product[] = [];
				
				if (productKeywords.length > 0) {
					// Search with each keyword and combine results
					for (const keyword of productKeywords) {
						const results = await productService.searchProducts(keyword);
						searchResults = [...searchResults, ...results];
					}
					// Remove duplicates
					searchResults = searchResults.filter((product, index, self) =>
						index === self.findIndex(p => p.id === product.id)
					);
				} else {
					// If no keywords extracted, try searching the whole message
					searchResults = await productService.searchProducts(message);
				}

				if (searchResults.length > 0) {
					// Limit to top 5 results
					const topProducts = searchResults.slice(0, 5);
					const productList = topProducts.map(p => {
						const stockStatus = p.stock > 0 ? '✓ In Stock' : '✗ Out of Stock';
						return `• **${p.name}**\n  Price: Tk ${p.price.toFixed(2)} | ${stockStatus}\n  View: /products/${p.id}`;
					}).join('\n\n');

					return `I found ${searchResults.length} product${searchResults.length > 1 ? 's' : ''} matching your search:\n\n${productList}\n\nClick on any product link above to view details, or browse all products at /products`;
				} else {
					// No exact matches, suggest similar products
					const allProducts = await productService.getAllProducts();
					if (allProducts.length > 0) {
						// Find products with similar keywords in description
						const similarProducts = allProducts
							.filter(p => {
								const productText = `${p.name} ${p.description} ${p.brand || ''}`.toLowerCase();
								return productKeywords.some(keyword => productText.includes(keyword));
							})
							.slice(0, 3);

						if (similarProducts.length > 0) {
							const similarList = similarProducts.map(p => 
								`• **${p.name}** - Tk ${p.price.toFixed(2)} | View: /products/${p.id}`
							).join('\n');

							return `I couldn't find exact matches, but here are some similar products you might like:\n\n${similarList}\n\nYou can also browse all products at /products or search with different keywords.`;
						}
					}
					return `I couldn't find products matching "${message}". Try browsing our products at /products or search with different keywords like "laptop", "monitor", "keyboard", etc.`;
				}
			} catch (error) {
				console.error('Error searching products:', error);
				return 'I encountered an error while searching for products. Please try browsing our products page at /products.';
			}
		}

		// Product recommendations
		if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('best')) {
			try {
				const products = await productService.getAllProducts();
				if (products.length > 0) {
					// Get products with stock
					const inStockProducts = products.filter(p => p.stock > 0);
					const featured = (inStockProducts.length > 0 ? inStockProducts : products).slice(0, 3);
					const productList = featured.map(p => 
						`• **${p.name}** - Tk ${p.price.toFixed(2)} | View: /products/${p.id}`
					).join('\n');
					return `Here are some popular products:\n\n${productList}\n\nWould you like more details about any of these? You can also browse all products on our products page.`;
				}
			} catch (error) {
				// Continue to generic response
			}
		}

		// Greetings
		if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
			return 'Hello! I\'m here to help you with product questions, order status, and recommendations. How can I assist you today?';
		}

		// Help
		if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
			return 'I can help you with:\n\n• Product questions and recommendations\n• Order status inquiries\n• General shopping assistance\n\nJust ask me anything!';
		}

		// Default response - try to search anyway
		try {
			const searchResults = await productService.searchProducts(message);
			if (searchResults.length > 0) {
				const topProducts = searchResults.slice(0, 3);
				const productList = topProducts.map(p => 
					`• **${p.name}** - Tk ${p.price.toFixed(2)} | View: /products/${p.id}`
				).join('\n');
				return `I found some products that might interest you:\n\n${productList}\n\nWould you like to see more? Browse all products at /products`;
			}
		} catch (error) {
			// Continue to default
		}

		return 'I\'m here to help with product questions, order status, and recommendations. Try asking about specific products like "monitor", "laptop", or "gaming PC", or browse our products at /products';
	}

	/**
	 * Extract product-related keywords from user message
	 */
	private extractProductKeywords(message: string): string[] {
		// Common product keywords with typo corrections
		const productMap: Record<string, string[]> = {
			'monitor': ['monitor', 'moniter', 'display', 'screen'],
			'laptop': ['laptop', 'notebook', 'computer'],
			'desktop': ['desktop', 'pc', 'computer'],
			'keyboard': ['keyboard', 'keybord'],
			'mouse': ['mouse', 'mice'],
			'headphone': ['headphone', 'headphones', 'headset'],
			'speaker': ['speaker', 'speakers'],
			'webcam': ['webcam', 'camera'],
			'microphone': ['microphone', 'mic'],
			'printer': ['printer', 'print'],
			'scanner': ['scanner', 'scan'],
			'router': ['router', 'wifi'],
			'ram': ['ram', 'memory'],
			'storage': ['storage', 'ssd', 'hard drive', 'hdd'],
			'graphics': ['graphics', 'gpu', 'video card'],
			'processor': ['processor', 'cpu'],
			'motherboard': ['motherboard', 'mobo'],
			'power supply': ['power supply', 'psu'],
			'case': ['case', 'chassis'],
			'cooling': ['cooling', 'fan', 'cooler'],
			'gaming': ['gaming', 'game']
		};

		const keywords: string[] = [];
		const lowerMessage = message.toLowerCase();

		// Check for each product type
		for (const [canonical, variants] of Object.entries(productMap)) {
			if (variants.some(variant => lowerMessage.includes(variant))) {
				keywords.push(canonical);
			}
		}

		// Also extract any words that might be product names (3+ characters, not common words)
		const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'];
		const words = lowerMessage.split(/\s+/).filter(word => 
			word.length >= 3 && 
			!commonWords.includes(word) &&
			!keywords.some(k => word.includes(k) || k.includes(word))
		);
		
		// Add unique words that might be product-related
		words.forEach(word => {
			if (!keywords.includes(word) && word.length >= 3) {
				keywords.push(word);
			}
		});

		return keywords.slice(0, 5); // Limit to 5 keywords
	}

	/**
	 * Check if message is a product query
	 */
	private isProductQuery(message: string): boolean {
		const productIndicators = [
			'need', 'want', 'looking for', 'search', 'find', 'show', 'buy', 'purchase',
			'product', 'item', 'thing', 'recommend', 'suggest', 'best'
		];
		return productIndicators.some(indicator => message.includes(indicator));
	}

	/**
	 * AI Sales Predictions - Predict sales for next month
	 */
	async predictSales(sales: Sale[]): Promise<{
		predictedSales: number;
		predictedRevenue: number;
		confidence: string;
		trend: 'increasing' | 'decreasing' | 'stable';
		insights: string[];
	}> {
		if (sales.length === 0) {
			return {
				predictedSales: 0,
				predictedRevenue: 0,
				confidence: 'Low',
				trend: 'stable',
				insights: ['Insufficient data for predictions']
			};
		}

		// Calculate average sales per day
		const salesByDate = sales.reduce((acc, sale) => {
			const date = sale.created_at ? new Date(sale.created_at).toDateString() : 'unknown';
			if (!acc[date]) acc[date] = { count: 0, revenue: 0 };
			acc[date].count += sale.quantity;
			acc[date].revenue += sale.total_amount;
			return acc;
		}, {} as Record<string, { count: number; revenue: number }>);

		const dates = Object.keys(salesByDate);
		const avgDailySales = dates.length > 0 
			? dates.reduce((sum, date) => sum + salesByDate[date].count, 0) / dates.length 
			: 0;
		const avgDailyRevenue = dates.length > 0
			? dates.reduce((sum, date) => sum + salesByDate[date].revenue, 0) / dates.length
			: 0;

		// Predict for next 30 days
		const predictedSales = Math.round(avgDailySales * 30);
		const predictedRevenue = avgDailyRevenue * 30;

		// Determine trend
		const recentSales = sales.slice(-10);
		const olderSales = sales.slice(-20, -10);
		const recentAvg = recentSales.length > 0 
			? recentSales.reduce((sum, s) => sum + s.quantity, 0) / recentSales.length 
			: 0;
		const olderAvg = olderSales.length > 0
			? olderSales.reduce((sum, s) => sum + s.quantity, 0) / olderSales.length
			: 0;

		let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
		if (recentAvg > olderAvg * 1.1) trend = 'increasing';
		else if (recentAvg < olderAvg * 0.9) trend = 'decreasing';

		const confidence = sales.length > 30 ? 'High' : sales.length > 10 ? 'Medium' : 'Low';

		const insights: string[] = [];
		if (trend === 'increasing') {
			insights.push('Sales trend is increasing - consider increasing inventory');
		} else if (trend === 'decreasing') {
			insights.push('Sales trend is decreasing - review marketing strategies');
		}
		insights.push(`Based on ${sales.length} historical sales records`);
		insights.push(`Average daily sales: ${avgDailySales.toFixed(1)} units`);

		return {
			predictedSales,
			predictedRevenue,
			confidence,
			trend,
			insights
		};
	}

	/**
	 * AI Stock Recommendations - Suggest products that need restocking
	 */
	async getStockRecommendations(products: Product[], sales: Sale[]): Promise<Array<{
		productId: string;
		productName: string;
		currentStock: number;
		recommendedStock: number;
		urgency: 'high' | 'medium' | 'low';
		reason: string;
	}>> {
		const recommendations: Array<{
			productId: string;
			productName: string;
			currentStock: number;
			recommendedStock: number;
			urgency: 'high' | 'medium' | 'low';
			reason: string;
		}> = [];

		for (const product of products) {
			// Calculate average sales per month for this product
			const productSales = sales.filter(s => s.product_id === product.id);
			if (productSales.length === 0) continue;

			const totalSold = productSales.reduce((sum, s) => sum + s.quantity, 0);
			const daysOfData = productSales.length > 0 ? 30 : 1; // Assume 30 days if we have sales
			const avgDailySales = totalSold / daysOfData;
			const monthlyDemand = avgDailySales * 30;

			// Recommended stock = 1.5x monthly demand (safety buffer)
			const recommendedStock = Math.ceil(monthlyDemand * 1.5);

			if (product.stock < recommendedStock) {
				const stockRatio = product.stock / recommendedStock;
				let urgency: 'high' | 'medium' | 'low' = 'low';
				if (stockRatio < 0.3) urgency = 'high';
				else if (stockRatio < 0.6) urgency = 'medium';

				let reason = '';
				if (product.stock === 0) {
					reason = 'Out of stock - immediate restock needed';
				} else if (stockRatio < 0.3) {
					reason = `Very low stock (${product.stock} units). Expected to run out soon based on sales history.`;
				} else {
					reason = `Stock below recommended level. Current: ${product.stock}, Recommended: ${recommendedStock}`;
				}

				recommendations.push({
					productId: product.id,
					productName: product.name,
					currentStock: product.stock,
					recommendedStock,
					urgency,
					reason
				});
			}
		}

		// Sort by urgency
		return recommendations.sort((a, b) => {
			const urgencyOrder = { high: 3, medium: 2, low: 1 };
			return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
		});
	}

	/**
	 * AI Customer Insights - Analyze customer behavior
	 */
	async getCustomerInsights(sales: Sale[]): Promise<{
		topCustomers: Array<{ userId: string; userName: string; totalSpent: number; orderCount: number }>;
		averageOrderValue: number;
		customerRetentionRate: string;
		insights: string[];
	}> {
		if (sales.length === 0) {
			return {
				topCustomers: [],
				averageOrderValue: 0,
				customerRetentionRate: '0%',
				insights: ['No sales data available']
			};
		}

		// Group by user
		const customerData = sales.reduce((acc, sale) => {
			const userId = sale.user_id || 'guest';
			if (!acc[userId]) {
				acc[userId] = {
					userId,
					userName: sale.user_name || 'Guest',
					totalSpent: 0,
					orderCount: 0
				};
			}
			acc[userId].totalSpent += sale.total_amount;
			acc[userId].orderCount += 1;
			return acc;
		}, {} as Record<string, { userId: string; userName: string; totalSpent: number; orderCount: number }>);

		const customers = Object.values(customerData);
		const topCustomers = customers
			.sort((a, b) => b.totalSpent - a.totalSpent)
			.slice(0, 5);

		const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
		const averageOrderValue = totalRevenue / sales.length;

		// Calculate retention (users with multiple orders)
		const repeatCustomers = customers.filter(c => c.orderCount > 1).length;
		const customerRetentionRate = customers.length > 0
			? ((repeatCustomers / customers.length) * 100).toFixed(1)
			: '0';

		const insights: string[] = [];
		insights.push(`Total customers: ${customers.length}`);
		insights.push(`Repeat customers: ${repeatCustomers} (${customerRetentionRate}%)`);
		insights.push(`Average order value: Tk ${averageOrderValue.toFixed(2)}`);
		if (topCustomers.length > 0) {
			insights.push(`Top customer: ${topCustomers[0].userName} (Tk ${topCustomers[0].totalSpent.toFixed(2)})`);
		}

		return {
			topCustomers,
			averageOrderValue,
			customerRetentionRate: `${customerRetentionRate}%`,
			insights
		};
	}

	/**
	 * AI Sales Analytics - Trend analysis and anomaly detection
	 */
	async analyzeSales(sales: Sale[]): Promise<{
		trend: 'increasing' | 'decreasing' | 'stable';
		trendStrength: number;
		anomalies: Array<{ date: string; type: 'spike' | 'drop'; value: number; reason: string }>;
		insights: string[];
	}> {
		if (sales.length === 0) {
			return {
				trend: 'stable',
				trendStrength: 0,
				anomalies: [],
				insights: ['No sales data available']
			};
		}

		// Group sales by date
		const salesByDate = sales.reduce((acc, sale) => {
			if (!sale.created_at) return acc;
			const date = new Date(sale.created_at).toDateString();
			if (!acc[date]) acc[date] = { revenue: 0, count: 0 };
			acc[date].revenue += sale.total_amount;
			acc[date].count += sale.quantity;
			return acc;
		}, {} as Record<string, { revenue: number; count: number }>);

		const dates = Object.keys(salesByDate).sort();
		const revenues = dates.map(date => salesByDate[date].revenue);

		// Calculate trend
		const firstHalf = revenues.slice(0, Math.floor(revenues.length / 2));
		const secondHalf = revenues.slice(Math.floor(revenues.length / 2));
		const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
		const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;

		let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
		const change = ((secondAvg - firstAvg) / (firstAvg || 1)) * 100;
		if (change > 10) trend = 'increasing';
		else if (change < -10) trend = 'decreasing';

		const trendStrength = Math.abs(change);

		// Detect anomalies (spikes/drops)
		const mean = revenues.reduce((a, b) => a + b, 0) / revenues.length;
		const variance = revenues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / revenues.length;
		const stdDev = Math.sqrt(variance);
		const threshold = mean + (2 * stdDev); // 2 standard deviations

		const anomalies: Array<{ date: string; type: 'spike' | 'drop'; value: number; reason: string }> = [];
		dates.forEach((date, index) => {
			const revenue = revenues[index];
			if (revenue > threshold) {
				anomalies.push({
					date,
					type: 'spike',
					value: revenue,
					reason: `Unusual sales spike detected (${((revenue / mean - 1) * 100).toFixed(1)}% above average)`
				});
			} else if (revenue < mean - (2 * stdDev) && revenue > 0) {
				anomalies.push({
					date,
					type: 'drop',
					value: revenue,
					reason: `Unusual sales drop detected (${((1 - revenue / mean) * 100).toFixed(1)}% below average)`
				});
			}
		});

		const insights: string[] = [];
		insights.push(`Sales trend: ${trend} (${trendStrength.toFixed(1)}% change)`);
		if (anomalies.length > 0) {
			insights.push(`Detected ${anomalies.length} anomaly/anomalies in sales patterns`);
		}
		insights.push(`Average daily revenue: Tk ${mean.toFixed(2)}`);

		return {
			trend,
			trendStrength,
			anomalies,
			insights
		};
	}

	/**
	 * AI Inventory Predictions - Predict demand and suggest reorder points
	 */
	async predictInventory(products: Product[], sales: Sale[]): Promise<Array<{
		productId: string;
		productName: string;
		currentStock: number;
		predictedDemand: number;
		daysUntilStockout: number;
		reorderPoint: number;
		suggestedOrderQuantity: number;
	}>> {
		const predictions: Array<{
			productId: string;
			productName: string;
			currentStock: number;
			predictedDemand: number;
			daysUntilStockout: number;
			reorderPoint: number;
			suggestedOrderQuantity: number;
		}> = [];

		for (const product of products) {
			const productSales = sales.filter(s => s.product_id === product.id);
			
			if (productSales.length === 0) {
				// No sales history - use default prediction
				predictions.push({
					productId: product.id,
					productName: product.name,
					currentStock: product.stock,
					predictedDemand: 10, // Default
					daysUntilStockout: product.stock > 0 ? 30 : 0,
					reorderPoint: 20,
					suggestedOrderQuantity: 30
				});
				continue;
			}

			// Calculate average daily demand
			const totalSold = productSales.reduce((sum, s) => sum + s.quantity, 0);
			const daysOfData = Math.max(30, productSales.length); // At least 30 days
			const avgDailyDemand = totalSold / daysOfData;
			const monthlyDemand = avgDailyDemand * 30;

			// Predict days until stockout
			const daysUntilStockout = product.stock > 0 && avgDailyDemand > 0
				? Math.floor(product.stock / avgDailyDemand)
				: 0;

			// Reorder point = 1.2x monthly demand (safety buffer)
			const reorderPoint = Math.ceil(monthlyDemand * 1.2);
			const suggestedOrderQuantity = Math.ceil(monthlyDemand * 1.5);

			predictions.push({
				productId: product.id,
				productName: product.name,
				currentStock: product.stock,
				predictedDemand: Math.ceil(monthlyDemand),
				daysUntilStockout,
				reorderPoint,
				suggestedOrderQuantity
			});
		}

		return predictions.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
	}

	/**
	 * AI Price Optimization - Suggest optimal prices
	 */
	async optimizePrices(products: Product[], sales: Sale[]): Promise<Array<{
		productId: string;
		productName: string;
		currentPrice: number;
		suggestedPrice: number;
		priceChange: number;
		reason: string;
		expectedImpact: string;
	}>> {
		const optimizations: Array<{
			productId: string;
			productName: string;
			currentPrice: number;
			suggestedPrice: number;
			priceChange: number;
			reason: string;
			expectedImpact: string;
		}> = [];

		for (const product of products) {
			const productSales = sales.filter(s => s.product_id === product.id);
			const salesCount = productSales.length;
			
			// Calculate price elasticity based on sales
			// If product has low sales and high stock, suggest price reduction
			// If product has high sales and low stock, suggest price increase
			
			const stockRatio = product.stock / Math.max(1, salesCount * 2); // Normalize
			const salesVelocity = salesCount / 30; // Sales per day (rough estimate)

			let suggestedPrice = product.price;
			let reason = '';
			let expectedImpact = '';

			if (product.stock > 50 && salesVelocity < 0.5) {
				// High stock, low sales - suggest price reduction
				suggestedPrice = product.price * 0.9; // 10% reduction
				reason = 'High inventory and low sales velocity - price reduction may boost demand';
				expectedImpact = 'Expected 15-20% increase in sales volume';
			} else if (product.stock < 10 && salesVelocity > 1) {
				// Low stock, high sales - suggest price increase
				suggestedPrice = product.price * 1.1; // 10% increase
				reason = 'High demand and low inventory - price increase to maximize revenue';
				expectedImpact = 'Expected 5-10% increase in revenue despite lower volume';
			} else if (product.stock === 0) {
				// Out of stock - keep current price
				suggestedPrice = product.price;
				reason = 'Product is out of stock - maintain price when restocked';
				expectedImpact = 'No change recommended';
			} else {
				// Balanced - suggest minor optimization
				if (product.price / (product.cost_price || 1) > 2) {
					// High margin - can reduce slightly
					suggestedPrice = product.price * 0.95; // 5% reduction
					reason = 'High profit margin allows for competitive pricing';
					expectedImpact = 'Expected 5-10% increase in sales';
				} else {
					// Low margin - maintain or slight increase
					suggestedPrice = product.price;
					reason = 'Price is well-optimized for current market conditions';
					expectedImpact = 'No change needed';
				}
			}

			const priceChange = ((suggestedPrice - product.price) / product.price) * 100;

			// Only include if there's a meaningful change
			if (Math.abs(priceChange) > 1) {
				optimizations.push({
					productId: product.id,
					productName: product.name,
					currentPrice: product.price,
					suggestedPrice: Math.round(suggestedPrice * 100) / 100,
					priceChange: Math.round(priceChange * 10) / 10,
					reason,
					expectedImpact
				});
			}
		}

		return optimizations.sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange));
	}

	/**
	 * AI PC Builder Assistant - Suggest components based on requirements
	 */
	async suggestPCBuild(
		requirements: {
			budget: number;
			useCase: string; // 'gaming', 'work', 'content-creation', etc.
			preferences?: string;
		},
		availableProducts: Product[],
		categories: Array<{ id: string; name: string; is_required: boolean }>
	): Promise<{
		suggestions: Array<{
			categoryId: string;
			categoryName: string;
			productId: string;
			productName: string;
			price: number;
			reason: string;
		}>;
		totalPrice: number;
		explanation: string;
	}> {
		const suggestions: Array<{
			categoryId: string;
			categoryName: string;
			productId: string;
			productName: string;
			price: number;
			reason: string;
		}> = [];

		const requiredCategories = categories.filter(c => c.is_required);
		const budgetPerCategory = requirements.budget / requiredCategories.length;
		let remainingBudget = requirements.budget;

		for (const category of requiredCategories) {
			const categoryProducts = availableProducts.filter(
				p => (p as any).component_category_id === category.id && p.stock > 0
			);

			if (categoryProducts.length === 0) continue;

			// Score products based on use case
			const scored = categoryProducts.map(product => {
				const productText = `${product.name} ${product.description} ${product.specifications || ''}`.toLowerCase();
				let score = 0;

				// Budget fit score
				const budgetFit = 1 - Math.abs(product.price - budgetPerCategory) / requirements.budget;
				score += budgetFit * 0.4;

				// Use case matching
				if (requirements.useCase === 'gaming') {
					if (productText.includes('gaming') || productText.includes('gpu') || productText.includes('graphics')) {
						score += 0.3;
					}
					if (productText.includes('rgb') || productText.includes('performance')) {
						score += 0.2;
					}
				} else if (requirements.useCase === 'work' || requirements.useCase === 'productivity') {
					if (productText.includes('professional') || productText.includes('business') || productText.includes('office')) {
						score += 0.3;
					}
					if (productText.includes('reliable') || productText.includes('efficient')) {
						score += 0.2;
					}
				} else if (requirements.useCase === 'content-creation') {
					if (productText.includes('video') || productText.includes('editing') || productText.includes('rendering')) {
						score += 0.3;
					}
					if (productText.includes('high performance') || productText.includes('workstation')) {
						score += 0.2;
					}
				}

				// Price within budget
				if (product.price <= remainingBudget) {
					score += 0.1;
				}

				return { product, score };
			});

			// Sort by score and pick best
			scored.sort((a, b) => b.score - a.score);
			const best = scored[0];

			if (best && best.product.price <= remainingBudget) {
				suggestions.push({
					categoryId: category.id,
					categoryName: category.name,
					productId: best.product.id,
					productName: best.product.name,
					price: best.product.price,
					reason: `Best ${category.name.toLowerCase()} for ${requirements.useCase} within budget`
				});
				remainingBudget -= best.product.price;
			} else if (scored.length > 0) {
				// Find cheapest option that fits
				const affordable = scored.filter(s => s.product.price <= remainingBudget);
				if (affordable.length > 0) {
					const cheapest = affordable.sort((a, b) => a.product.price - b.product.price)[0];
					suggestions.push({
						categoryId: category.id,
						categoryName: category.name,
						productId: cheapest.product.id,
						productName: cheapest.product.name,
						price: cheapest.product.price,
						reason: `Affordable ${category.name.toLowerCase()} option`
					});
					remainingBudget -= cheapest.product.price;
				}
			}
		}

		const totalPrice = suggestions.reduce((sum, s) => sum + s.price, 0);
		const explanation = `I've selected ${suggestions.length} components optimized for ${requirements.useCase} within your budget of Tk ${requirements.budget.toFixed(2)}. Total cost: Tk ${totalPrice.toFixed(2)}.`;

		return { suggestions, totalPrice, explanation };
	}

	/**
	 * AI Build Optimization - Optimize existing build for better value/performance
	 */
	async optimizeBuild(
		currentBuild: Array<{ categoryId: string; productId: string; price: number }>,
		availableProducts: Product[],
		categories: Array<{ id: string; name: string }>,
		optimizationGoal: 'value' | 'performance' | 'budget'
	): Promise<{
		optimizations: Array<{
			categoryId: string;
			categoryName: string;
			currentProductId: string;
			currentProductName: string;
			currentPrice: number;
			suggestedProductId: string;
			suggestedProductName: string;
			suggestedPrice: number;
			savings: number;
			reason: string;
		}>;
		totalSavings: number;
		explanation: string;
	}> {
		const optimizations: Array<{
			categoryId: string;
			categoryName: string;
			currentProductId: string;
			currentProductName: string;
			currentPrice: number;
			suggestedProductId: string;
			suggestedProductName: string;
			suggestedPrice: number;
			savings: number;
			reason: string;
		}> = [];

		for (const component of currentBuild) {
			const category = categories.find(c => c.id === component.categoryId);
			if (!category) continue;

			const categoryProducts = availableProducts.filter(
				p => (p as any).component_category_id === component.categoryId && p.stock > 0 && p.id !== component.productId
			);

			if (categoryProducts.length === 0) continue;

			const currentProduct = availableProducts.find(p => p.id === component.productId);
			if (!currentProduct) continue;

			let bestAlternative: Product | null = null;
			let reason = '';

			if (optimizationGoal === 'value') {
				// Find better value (similar performance, lower price)
				const alternatives = categoryProducts
					.filter(p => p.price < currentProduct.price)
					.sort((a, b) => b.price - a.price); // Higher price but still cheaper
				
				if (alternatives.length > 0) {
					bestAlternative = alternatives[0];
					reason = `Better value option with similar performance`;
				}
			} else if (optimizationGoal === 'performance') {
				// Find better performance at similar price
				const alternatives = categoryProducts
					.filter(p => Math.abs(p.price - currentProduct.price) / currentProduct.price < 0.2) // Within 20% price
					.sort((a, b) => b.price - a.price); // Higher price = likely better performance
				
				if (alternatives.length > 0) {
					bestAlternative = alternatives[0];
					reason = `Better performance at similar price point`;
				}
			} else if (optimizationGoal === 'budget') {
				// Find cheapest option
				const alternatives = categoryProducts
					.sort((a, b) => a.price - b.price);
				
				if (alternatives.length > 0 && alternatives[0].price < currentProduct.price) {
					bestAlternative = alternatives[0];
					reason = `More budget-friendly option`;
				}
			}

			if (bestAlternative) {
				optimizations.push({
					categoryId: component.categoryId,
					categoryName: category.name,
					currentProductId: currentProduct.id,
					currentProductName: currentProduct.name,
					currentPrice: currentProduct.price,
					suggestedProductId: bestAlternative.id,
					suggestedProductName: bestAlternative.name,
					suggestedPrice: bestAlternative.price,
					savings: currentProduct.price - bestAlternative.price,
					reason
				});
			}
		}

		const totalSavings = optimizations.reduce((sum, opt) => sum + opt.savings, 0);
		const explanation = `Found ${optimizations.length} optimization${optimizations.length !== 1 ? 's' : ''} that could ${optimizationGoal === 'budget' ? 'save' : 'improve'} your build${totalSavings > 0 ? ` by Tk ${totalSavings.toFixed(2)}` : ''}.`;

		return { optimizations, totalSavings, explanation };
	}

	/**
	 * AI Pre-built Configurations - Generate pre-configured builds
	 */
	async generatePrebuiltBuilds(
		useCase: string,
		budget: number,
		availableProducts: Product[],
		categories: Array<{ id: string; name: string; is_required: boolean }>
	): Promise<Array<{
		name: string;
		description: string;
		components: Array<{
			categoryId: string;
			productId: string;
			productName: string;
			price: number;
		}>;
		totalPrice: number;
	}>> {
		type BuildComponent = {
			categoryId: string;
			productId: string;
			productName: string;
			price: number;
		};
		
		type PrebuiltBuild = {
			name: string;
			description: string;
			components: BuildComponent[];
			totalPrice: number;
		};
		
		const builds: PrebuiltBuild[] = [];

		// Generate 3 builds: Budget, Mid-range, High-end
		const budgetTiers = [
			{ name: 'Budget', multiplier: 0.7, description: 'Affordable build for basic needs' },
			{ name: 'Mid-Range', multiplier: 1.0, description: 'Balanced performance and price' },
			{ name: 'High-End', multiplier: 1.5, description: 'Premium performance build' }
		];

		for (const tier of budgetTiers) {
			const tierBudget = budget * tier.multiplier;
			const suggestion = await this.suggestPCBuild(
				{ budget: tierBudget, useCase, preferences: tier.name },
				availableProducts,
				categories
			);

			if (suggestion.suggestions.length > 0) {
				builds.push({
					name: `${tier.name} ${useCase.charAt(0).toUpperCase() + useCase.slice(1)} Build`,
					description: `${tier.description} - ${suggestion.explanation}`,
					components: suggestion.suggestions.map(s => ({
						categoryId: s.categoryId,
						productId: s.productId,
						productName: s.productName,
						price: s.price
					})),
					totalPrice: suggestion.totalPrice
				});
			}
		}

		return builds;
	}

	/**
	 * AI Review Sentiment Analysis - Analyze review sentiment and extract features
	 */
	async analyzeReviewSentiment(review: { rating: number; comment?: string | null }): Promise<{
		sentiment: 'positive' | 'negative' | 'neutral';
		confidence: number;
		keyFeatures: string[];
		isFakeRisk: boolean;
		fakeRiskReason?: string;
	}> {
		const comment = review.comment || '';
		const rating = review.rating;

		// Rule-based sentiment analysis
		const lowerComment = comment.toLowerCase();
		
		// Positive keywords
		const positiveKeywords = ['great', 'excellent', 'amazing', 'love', 'perfect', 'good', 'wonderful', 'fantastic', 'awesome', 'best', 'recommend', 'satisfied', 'happy', 'pleased'];
		// Negative keywords
		const negativeKeywords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'disappointed', 'waste', 'poor', 'broken', 'defective', 'faulty', 'useless', 'regret'];
		
		let positiveScore = 0;
		let negativeScore = 0;

		positiveKeywords.forEach(keyword => {
			if (lowerComment.includes(keyword)) positiveScore++;
		});

		negativeKeywords.forEach(keyword => {
			if (lowerComment.includes(keyword)) negativeScore++;
		});

		// Determine sentiment based on rating and keywords
		let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
		let confidence = 0.5;

		if (rating >= 4 && positiveScore > negativeScore) {
			sentiment = 'positive';
			confidence = 0.7 + (positiveScore * 0.1);
		} else if (rating <= 2 && negativeScore > positiveScore) {
			sentiment = 'negative';
			confidence = 0.7 + (negativeScore * 0.1);
		} else if (rating === 3 || (positiveScore === 0 && negativeScore === 0)) {
			sentiment = 'neutral';
			confidence = 0.6;
		} else {
			// Mixed signals - use rating as primary indicator
			if (rating >= 4) sentiment = 'positive';
			else if (rating <= 2) sentiment = 'negative';
			confidence = 0.5;
		}

		// Extract key features mentioned
		const featureKeywords: Record<string, string[]> = {
			'Battery Life': ['battery', 'charge', 'power', 'endurance', 'lasts'],
			'Performance': ['fast', 'speed', 'performance', 'quick', 'smooth', 'responsive'],
			'Display': ['screen', 'display', 'resolution', 'quality', 'bright', 'clear'],
			'Design': ['design', 'looks', 'appearance', 'beautiful', 'stylish', 'build quality'],
			'Price': ['price', 'value', 'affordable', 'expensive', 'worth', 'cost'],
			'Processor': ['processor', 'cpu', 'intel', 'amd', 'ryzen', 'core'],
			'Storage': ['storage', 'memory', 'ram', 'ssd', 'hard drive', 'space'],
			'Graphics': ['graphics', 'gpu', 'video', 'gaming', 'graphics card'],
			'Camera': ['camera', 'photo', 'picture', 'image', 'quality'],
			'Connectivity': ['wifi', 'bluetooth', 'usb', 'ports', 'connection']
		};

		const keyFeatures: string[] = [];
		for (const [feature, keywords] of Object.entries(featureKeywords)) {
			if (keywords.some(keyword => lowerComment.includes(keyword))) {
				keyFeatures.push(feature);
			}
		}

		// Detect potential fake reviews
		let isFakeRisk = false;
		let fakeRiskReason = '';

		// Check for suspicious patterns
		if (comment.length < 10 && rating === 5) {
			isFakeRisk = true;
			fakeRiskReason = 'Very short review with perfect rating';
		} else if (comment.length > 500 && rating === 5) {
			isFakeRisk = true;
			fakeRiskReason = 'Unusually long review with perfect rating';
		} else if (rating === 5 && negativeScore > 0) {
			isFakeRisk = true;
			fakeRiskReason = 'Perfect rating but contains negative keywords';
		} else if (rating === 1 && positiveScore > 2) {
			isFakeRisk = true;
			fakeRiskReason = 'Low rating but contains many positive keywords';
		}

		confidence = Math.min(confidence, 0.95);

		return {
			sentiment,
			confidence,
			keyFeatures,
			isFakeRisk,
			fakeRiskReason: isFakeRisk ? fakeRiskReason : undefined
		};
	}

	/**
	 * AI Review Summary - Generate "What customers love" summary
	 */
	async generateReviewSummary(reviews: Array<{ rating: number; comment?: string | null }>): Promise<{
		summary: string;
		positiveAspects: string[];
		negativeAspects: string[];
		averageSentiment: 'positive' | 'negative' | 'neutral';
		keyThemes: Array<{ theme: string; mentions: number; sentiment: 'positive' | 'negative' }>;
	}> {
		if (reviews.length === 0) {
			return {
				summary: 'No reviews available yet.',
				positiveAspects: [],
				negativeAspects: [],
				averageSentiment: 'neutral',
				keyThemes: []
			};
		}

		// Analyze all reviews
		const sentiments = await Promise.all(
			reviews.map(review => this.analyzeReviewSentiment(review))
		);

		// Calculate average sentiment
		const sentimentScores = sentiments.map(s => s.sentiment === 'positive' ? 1 : s.sentiment === 'negative' ? -1 : 0);
		const avgScore = sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;
		const averageSentiment: 'positive' | 'negative' | 'neutral' = avgScore > 0.2 ? 'positive' : avgScore < -0.2 ? 'negative' : 'neutral';

		// Collect all key features
		const allFeatures: Record<string, { count: number; positive: number; negative: number }> = {};
		sentiments.forEach((sentiment, index) => {
			sentiment.keyFeatures.forEach(feature => {
				if (!allFeatures[feature]) {
					allFeatures[feature] = { count: 0, positive: 0, negative: 0 };
				}
				allFeatures[feature].count++;
				if (sentiment.sentiment === 'positive') allFeatures[feature].positive++;
				if (sentiment.sentiment === 'negative') allFeatures[feature].negative++;
			});
		});

		// Get top themes
		const keyThemes = Object.entries(allFeatures)
			.map(([theme, data]) => ({
				theme,
				mentions: data.count,
				sentiment: data.positive > data.negative ? 'positive' as const : data.negative > data.positive ? 'negative' as const : 'neutral' as const
			}))
			.sort((a, b) => b.mentions - a.mentions)
			.slice(0, 5);

		// Extract positive and negative aspects
		const positiveAspects: string[] = [];
		const negativeAspects: string[] = [];

		keyThemes.forEach(theme => {
			if (theme.sentiment === 'positive') {
				positiveAspects.push(theme.theme);
			} else if (theme.sentiment === 'negative') {
				negativeAspects.push(theme.theme);
			}
		});

		// Generate summary
		const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
		let summary = `Based on ${reviews.length} review${reviews.length !== 1 ? 's' : ''}, customers ${averageSentiment === 'positive' ? 'love' : averageSentiment === 'negative' ? 'have concerns about' : 'have mixed feelings about'} this product. `;
		
		if (positiveAspects.length > 0) {
			summary += `Most praised aspects include: ${positiveAspects.slice(0, 3).join(', ')}. `;
		}
		
		if (negativeAspects.length > 0) {
			summary += `Areas mentioned for improvement: ${negativeAspects.slice(0, 2).join(', ')}. `;
		}

		summary += `Average rating: ${avgRating.toFixed(1)}/5.`;

		return {
			summary,
			positiveAspects,
			negativeAspects,
			averageSentiment,
			keyThemes
		};
	}

	/**
	 * AI Review Moderation - Detect spam/fake/inappropriate content
	 */
	async moderateReview(review: { rating: number; comment?: string | null; user_id?: string }): Promise<{
		isSpam: boolean;
		isFake: boolean;
		isInappropriate: boolean;
		flags: string[];
		confidence: number;
		recommendation: 'approve' | 'review' | 'reject';
	}> {
		const comment = review.comment || '';
		const lowerComment = comment.toLowerCase();

		const flags: string[] = [];
		let isSpam = false;
		let isFake = false;
		let isInappropriate = false;

		// Spam detection
		const spamPatterns = [
			/^[a-z0-9]+@[a-z0-9]+\.[a-z]+$/i, // Email addresses
			/https?:\/\/[^\s]+/i, // URLs
			/(buy|purchase|cheap|discount|offer|deal)[\s\w]*\d+/i, // Promotional content
			/(click|visit|call|contact)[\s\w]*now/i
		];

		if (spamPatterns.some(pattern => pattern.test(comment))) {
			isSpam = true;
			flags.push('Contains promotional/spam content');
		}

		// Fake review detection
		const sentiment = await this.analyzeReviewSentiment(review);
		if (sentiment.isFakeRisk) {
			isFake = true;
			flags.push(sentiment.fakeRiskReason || 'Suspicious review pattern');
		}

		// Check for repetitive content (potential fake)
		if (comment.length > 0) {
			const words = comment.split(/\s+/);
			const uniqueWords = new Set(words);
			if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
				isFake = true;
				flags.push('Highly repetitive content');
			}
		}

		// Inappropriate content detection
		const inappropriateKeywords = ['hate', 'stupid', 'idiot', 'crap', 'suck', 'trash', 'garbage'];
		const hasInappropriate = inappropriateKeywords.some(keyword => lowerComment.includes(keyword));
		
		if (hasInappropriate && review.rating <= 2) {
			// Low rating with inappropriate language might be legitimate frustration
			// But we still flag it for review
			flags.push('Contains strong negative language');
		} else if (hasInappropriate && review.rating >= 4) {
			// High rating with inappropriate language is suspicious
			isInappropriate = true;
			flags.push('Inappropriate language with high rating');
		}

		// Very short or very long reviews might be fake
		if (comment.length < 5 && review.rating === 5) {
			isFake = true;
			flags.push('Extremely short perfect review');
		}

		// Determine recommendation
		let recommendation: 'approve' | 'review' | 'reject' = 'approve';
		if (isSpam || isInappropriate) {
			recommendation = 'reject';
		} else if (isFake || flags.length > 0) {
			recommendation = 'review';
		}

		const confidence = flags.length > 0 ? Math.min(0.7 + (flags.length * 0.1), 0.95) : 0.5;

		return {
			isSpam,
			isFake,
			isInappropriate,
			flags,
			confidence,
			recommendation
		};
	}

	/**
	 * AI Cart Recommendations - Suggest complementary products based on cart contents
	 */
	async recommendCartProducts(cartItems: Array<{ product_id: string; product?: any }>, allProducts: any[]): Promise<{
		recommendations: Array<{ product: any; reason: string; category: 'complementary' | 'complete_build' }>;
		summary: string;
	}> {
		if (cartItems.length === 0) {
			return {
				recommendations: [],
				summary: 'Add items to your cart to get personalized recommendations.'
			};
		}

		const cartProductIds = cartItems.map(item => item.product_id);
		const cartProducts = cartItems
			.map(item => item.product)
			.filter(Boolean) as any[];

		if (cartProducts.length === 0) {
			return {
				recommendations: [],
				summary: 'Unable to analyze cart contents.'
			};
		}

		// Analyze cart contents
		const productCategories = new Set<string>();
		const productBrands = new Set<string>();
		const productTypes: string[] = [];

		cartProducts.forEach(product => {
			if (product.component_category_id) {
				productCategories.add(product.component_category_id);
			}
			if (product.brand) {
				productBrands.add(product.brand);
			}
			// Extract product type from name/description
			const nameLower = (product.name || '').toLowerCase();
			const descLower = (product.description || '').toLowerCase();
			
			if (nameLower.includes('laptop') || descLower.includes('laptop')) productTypes.push('laptop');
			if (nameLower.includes('desktop') || descLower.includes('desktop')) productTypes.push('desktop');
			if (nameLower.includes('keyboard') || descLower.includes('keyboard')) productTypes.push('keyboard');
			if (nameLower.includes('mouse') || descLower.includes('mouse')) productTypes.push('mouse');
			if (nameLower.includes('monitor') || descLower.includes('monitor')) productTypes.push('monitor');
			if (nameLower.includes('headphone') || descLower.includes('headphone')) productTypes.push('headphone');
			if (nameLower.includes('speaker') || descLower.includes('speaker')) productTypes.push('speaker');
			if (nameLower.includes('cable') || descLower.includes('cable')) productTypes.push('cable');
			if (nameLower.includes('charger') || descLower.includes('charger')) productTypes.push('charger');
			if (nameLower.includes('bag') || descLower.includes('bag')) productTypes.push('bag');
		});

		// Get PC component categories (for "Complete your build")
		const pcComponentCategories = [
			'CPU', 'Motherboard', 'RAM', 'Storage', 'GPU', 'PSU', 'Case', 'Cooling',
			'CPU Cooler', 'Graphics Card', 'Power Supply', 'Computer Case'
		];

		// Filter out products already in cart
		const availableProducts = allProducts.filter(p => 
			!cartProductIds.includes(p.id) && p.stock > 0
		);

		const recommendations: Array<{ product: any; reason: string; category: 'complementary' | 'complete_build' }> = [];
		const recommendedIds = new Set<string>();

		// 1. "Complete your build" recommendations (for PC components)
		const hasPCComponents = Array.from(productCategories).length > 0;
		if (hasPCComponents) {
			// Check what PC components are missing
			const cartCategories = Array.from(productCategories);
			
			// Fetch component categories to match names
			let categoryMap: Record<string, string> = {};
			try {
				const { pcBuildService } = await import('./PCBuildService');
				const categories = await pcBuildService.getAllCategories();
				categories.forEach(cat => {
					categoryMap[cat.id] = cat.name;
				});
			} catch (error) {
				console.error('Error fetching categories:', error);
			}
			
			// Suggest missing essential PC components
			const essentialCategoryKeywords = ['cpu', 'processor', 'motherboard', 'ram', 'memory', 'storage', 'ssd', 'hdd', 'gpu', 'graphics', 'psu', 'power supply', 'cooler', 'case'];
			
			for (const product of availableProducts) {
				if (recommendedIds.has(product.id)) continue;
				if (recommendations.length >= 8) break;
				
				// Check if product has a component category
				if (!product.component_category_id) continue;
				
				const categoryId = product.component_category_id;
				const categoryName = categoryMap[categoryId] || 'Component';
				const productName = (product.name || '').toLowerCase();
				const productDesc = (product.description || '').toLowerCase();
				
				// Check if this is an essential PC component not in cart
				const isEssential = essentialCategoryKeywords.some(keyword => 
					productName.includes(keyword) || productDesc.includes(keyword) || categoryName.toLowerCase().includes(keyword)
				);
				
				if (isEssential && !cartCategories.includes(categoryId)) {
					recommendations.push({
						product,
						reason: `Complete your build: Add ${categoryName} for a full PC setup`,
						category: 'complete_build'
					});
					recommendedIds.add(product.id);
				}
			}
		}

		// 2. Complementary product recommendations
		// For laptops/desktops: suggest accessories
		if (productTypes.includes('laptop') || productTypes.includes('desktop')) {
			const accessoryKeywords = ['mouse', 'keyboard', 'monitor', 'headphone', 'speaker', 'bag', 'cable', 'charger'];
			
			for (const product of availableProducts) {
				if (recommendedIds.has(product.id)) continue;
				if (recommendations.length >= 8) break;

				const nameLower = (product.name || '').toLowerCase();
				const descLower = (product.description || '').toLowerCase();
				
				const isAccessory = accessoryKeywords.some(keyword => 
					nameLower.includes(keyword) || descLower.includes(keyword)
				);

				if (isAccessory) {
					recommendations.push({
						product,
						reason: `You might also need: ${product.name} to complete your setup`,
						category: 'complementary'
					});
					recommendedIds.add(product.id);
				}
			}
		}

		// For keyboards: suggest mouse, mousepad
		if (productTypes.includes('keyboard')) {
			for (const product of availableProducts) {
				if (recommendedIds.has(product.id)) continue;
				if (recommendations.length >= 8) break;

				const nameLower = (product.name || '').toLowerCase();
				if (nameLower.includes('mouse') && !productTypes.includes('mouse')) {
					recommendations.push({
						product,
						reason: 'You might also need: A mouse to pair with your keyboard',
						category: 'complementary'
					});
					recommendedIds.add(product.id);
				}
			}
		}

		// For monitors: suggest cables, stands
		if (productTypes.includes('monitor')) {
			for (const product of availableProducts) {
				if (recommendedIds.has(product.id)) continue;
				if (recommendations.length >= 8) break;

				const nameLower = (product.name || '').toLowerCase();
				if (nameLower.includes('cable') || nameLower.includes('stand')) {
					recommendations.push({
						product,
						reason: 'You might also need: Accessories for your monitor',
						category: 'complementary'
					});
					recommendedIds.add(product.id);
				}
			}
		}

		// Same brand recommendations
		if (productBrands.size > 0) {
			const brandArray = Array.from(productBrands);
			for (const product of availableProducts) {
				if (recommendedIds.has(product.id)) continue;
				if (recommendations.length >= 8) break;

				if (product.brand && brandArray.includes(product.brand)) {
					recommendations.push({
						product,
						reason: `You might also need: More products from ${product.brand}`,
						category: 'complementary'
					});
					recommendedIds.add(product.id);
				}
			}
		}

		// If no recommendations yet, add fallback recommendations (popular products)
		if (recommendations.length === 0 && availableProducts.length > 0) {
			// Get some random popular products (products with stock)
			const fallbackProducts = availableProducts
				.filter(p => p.stock > 0)
				.slice(0, 4);
			
			fallbackProducts.forEach(product => {
				if (!recommendedIds.has(product.id)) {
					recommendations.push({
						product,
						reason: 'You might also like this popular item',
						category: 'complementary' as const
					});
					recommendedIds.add(product.id);
				}
			});
		}

		// Generate summary
		let summary = '';
		if (recommendations.length === 0) {
			summary = 'No recommendations available at the moment.';
		} else {
			const completeBuildCount = recommendations.filter(r => r.category === 'complete_build').length;
			const complementaryCount = recommendations.filter(r => r.category === 'complementary').length;
			
			if (completeBuildCount > 0 && complementaryCount > 0) {
				summary = `Based on your cart, we've found ${completeBuildCount} item(s) to complete your build and ${complementaryCount} complementary product(s).`;
			} else if (completeBuildCount > 0) {
				summary = `Complete your PC build! We've found ${completeBuildCount} essential component(s) you might be missing.`;
			} else {
				summary = `You might also need ${complementaryCount} item(s) to enhance your setup.`;
			}
		}

		// Limit to 6 recommendations
		return {
			recommendations: recommendations.slice(0, 6),
			summary
		};
	}

	/**
	 * AI Product Description Generator
	 * Generates SEO-optimized product descriptions from product information
	 */
	async generateProductDescription(product: {
		name: string;
		brand?: string | null;
		specifications?: string | null;
		price?: number;
		component_category_name?: string | null;
	}): Promise<{
		description: string;
		keywords: string[];
		variations?: string[];
	}> {
		const openaiApiKey = env.OPENAI_API_KEY;

		if (!openaiApiKey) {
			// Fallback to rule-based description generation
			return this.generateProductDescriptionRuleBased(product);
		}

		try {
			const openai = new OpenAI({
				apiKey: openaiApiKey
			});

			const prompt = `You are an expert e-commerce product description writer. Generate a compelling, SEO-optimized product description for the following product.

Product Information:
- Name: ${product.name}
${product.brand ? `- Brand: ${product.brand}` : ''}
${product.component_category_name ? `- Category: ${product.component_category_name}` : ''}
${product.specifications ? `- Specifications: ${product.specifications}` : ''}
${product.price ? `- Price: ${product.price} Taka (Bangladeshi currency)` : ''}

Requirements:
1. Write a professional, engaging product description (150-300 words)
2. Include key features and benefits
3. Use SEO-friendly language
4. Highlight unique selling points
5. Make it compelling for potential buyers
6. Include relevant technical details if specifications are provided

Return a JSON object with this structure:
{
  "description": "The full product description text",
  "keywords": ["keyword1", "keyword2", "keyword3", ...],
  "variations": [
    "Alternative description variation 1 (shorter, 50-100 words)",
    "Alternative description variation 2 (longer, 200-300 words)"
  ]
}

Important: Return ONLY valid JSON, no additional text or markdown formatting.`;

			const response = await openai.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content: 'You are an expert e-commerce copywriter specializing in tech products. Generate compelling, SEO-optimized product descriptions that help customers make informed purchasing decisions.'
					},
					{
						role: 'user',
						content: prompt
					}
				],
				temperature: 0.7,
				max_tokens: 1000,
				response_format: { type: 'json_object' }
			});

			const aiResponse = response.choices[0]?.message?.content;
			
			if (!aiResponse) {
				throw new Error('No response from AI');
			}

			const parsed = JSON.parse(aiResponse);
			
			return {
				description: parsed.description || '',
				keywords: parsed.keywords || [],
				variations: parsed.variations || []
			};
		} catch (error: any) {
			// Handle quota/rate limit errors gracefully
			if (error?.status === 429 || error?.code === 'insufficient_quota' || error?.code === 'rate_limit_exceeded') {
				console.warn('OpenAI API quota exceeded or rate limited. Using rule-based description generation.');
			} else {
				console.error('Error generating product description with AI:', error);
			}
			// Fallback to rule-based generation
			return this.generateProductDescriptionRuleBased(product);
		}
	}

	/**
	 * Rule-based product description generator (fallback)
	 */
	private generateProductDescriptionRuleBased(product: {
		name: string;
		brand?: string | null;
		specifications?: string | null;
		price?: number;
		component_category_name?: string | null;
	}): {
		description: string;
		keywords: string[];
		variations?: string[];
	} {
		const parts: string[] = [];
		const keywords: string[] = [];

		// Start with product name
		parts.push(`Introducing the ${product.name}`);
		
		if (product.brand) {
			parts.push(`from ${product.brand}`);
			keywords.push(product.brand.toLowerCase());
		}

		// Add category information
		if (product.component_category_name) {
			parts.push(`- a premium ${product.component_category_name.toLowerCase()} designed for exceptional performance.`);
			keywords.push(product.component_category_name.toLowerCase());
		} else {
			parts.push(`- a high-quality product designed for exceptional performance.`);
		}

		// Parse specifications if available
		if (product.specifications) {
			parts.push(`\n\nKey Features:\n${product.specifications}`);
			
			// Extract keywords from specifications
			const specWords = product.specifications.toLowerCase().match(/\b\w{4,}\b/g) || [];
			keywords.push(...specWords.slice(0, 5));
		}

		// Add price information if available
		if (product.price) {
			parts.push(`\n\nAvailable at an attractive price of Tk ${product.price.toFixed(2)}, this product offers excellent value for money.`);
		}

		// Add closing
		parts.push(`\n\nPerfect for both professionals and enthusiasts, this product combines quality, performance, and reliability. Order now and experience the difference!`);

		const description = parts.join(' ');
		
		// Generate keywords from product name
		const nameWords = product.name.toLowerCase().split(/\s+/).filter(w => w.length > 3);
		keywords.push(...nameWords.slice(0, 5));

		// Remove duplicates and limit
		const uniqueKeywords = [...new Set(keywords)].slice(0, 10);

		// Generate variations
		const shortVariation = `${product.name}${product.brand ? ` by ${product.brand}` : ''}. ${product.specifications ? product.specifications.split('\n').slice(0, 2).join('. ') : 'High-quality product with excellent features.'} Available now!`;
		
		const longVariation = description;

		return {
			description,
			keywords: uniqueKeywords,
			variations: [shortVariation, longVariation]
		};
	}
}

// Export singleton instance
export const aiService = new AIService();


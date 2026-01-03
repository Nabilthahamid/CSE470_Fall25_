// UTILITY: AI helper functions
import type { Order } from '$lib/models/Order';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProductModel } from '$lib/models/ProductModel';

// Get Gemini API key function - safely gets the API key at runtime
async function getGeminiApiKey(): Promise<string | undefined> {
	try {
		const env = await import('$env/static/private');
		return (env as any).GEMINI_API_KEY as string | undefined;
	} catch {
		// GEMINI_API_KEY not set in environment
		return undefined;
	}
}

/**
 * Moderate review using AI
 */
export async function moderateReview(data: {
	rating: number;
	comment: string | null;
	user_id: string;
}): Promise<{
	recommendation: 'approve' | 'review' | 'reject';
	flags: string[];
	confidence: number;
}> {
	// AI moderation logic here
	console.log('Moderating review:', data);
	// TODO: Implement actual AI moderation
	return {
		recommendation: 'approve',
		flags: [],
		confidence: 0.9
	};
}

/**
 * Analyze review sentiment
 */
export async function analyzeReviewSentiment(data: {
	rating: number;
	comment: string | null;
}): Promise<{
	sentiment: 'positive' | 'neutral' | 'negative';
	score: number;
	keywords: string[];
}> {
	// AI sentiment analysis logic here
	console.log('Analyzing sentiment:', data);
	// TODO: Implement actual AI sentiment analysis
	return {
		sentiment: data.rating >= 4 ? 'positive' : data.rating <= 2 ? 'negative' : 'neutral',
		score: data.rating / 5,
		keywords: []
	};
}

/**
 * Score order risk using AI
 */
export async function scoreOrderRisk(order: Order): Promise<{
	riskScore: number;
	riskLevel: 'low' | 'medium' | 'high';
	reasons: string[];
}> {
	// AI risk scoring logic here
	console.log('Scoring order risk for order:', order.id);
	// TODO: Implement actual AI risk scoring
	return {
		riskScore: 0.3,
		riskLevel: 'low',
		reasons: []
	};
}

/**
 * Handle chat message for AI assistant with Gemini integration
 */
export async function handleChatMessage(
	message: string,
	userId?: string | null,
	conversationHistory: Array<{ role: string; content: string }> = []
): Promise<{ response: string; products?: Array<{ id: string; name: string; price: number; image_url?: string }> }> {
	try {
		// Get Gemini API response
		let geminiResponse = '';
		const apiKey = await getGeminiApiKey();
		
		if (apiKey) {
			try {
				const genAI = new GoogleGenerativeAI(apiKey);
				const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

				// Build conversation history
				const history = conversationHistory.map(msg => ({
					role: msg.role === 'user' ? 'user' : 'model',
					parts: [{ text: msg.content }]
				}));

				// Add current message
				const chat = model.startChat({
					history: history.length > 0 ? history : undefined,
					generationConfig: {
						temperature: 0.7,
						topK: 40,
						topP: 0.95,
						maxOutputTokens: 1024,
					},
				});

				const prompt = `You are a helpful AI assistant for TinyTech, a PC component e-commerce store. 
Help users with PC building questions, product recommendations, and technical advice.
Be friendly, informative, and suggest relevant products when appropriate.
Keep responses concise and helpful.

User message: ${message}`;

				const result = await chat.sendMessage(prompt);
				const response = await result.response;
				geminiResponse = response.text();
			} catch (error) {
				console.error('Gemini API error:', error);
				// Fallback to keyword-based responses
				geminiResponse = getFallbackResponse(message);
			}
		} else {
			// No API key, use fallback
			geminiResponse = getFallbackResponse(message);
		}

		// Extract keywords from user message and Gemini response to find products
		const searchTerms = extractSearchTerms(message, geminiResponse);
		
		// Search for relevant products
		let suggestedProducts: Array<{ id: string; name: string; price: number; image_url?: string }> = [];
		
		if (searchTerms.length > 0) {
			try {
				const allProducts = await ProductModel.getAll();
				const products = allProducts.map(p => p.toJSON());
				
				// Filter products based on search terms
				const matchingProducts = products.filter(product => {
					const productText = `${product.name} ${product.description || ''} ${product.brand || ''} ${product.tags?.join(' ') || ''}`.toLowerCase();
					return searchTerms.some(term => productText.includes(term.toLowerCase()));
				});

				// Limit to top 5 most relevant products
				suggestedProducts = matchingProducts
					.slice(0, 5)
					.map(p => ({
						id: p.id,
						name: p.name,
						price: p.price,
						image_url: p.image_url || undefined
					}));
			} catch (error) {
				console.error('Error searching products:', error);
			}
		}

		return {
			response: geminiResponse,
			products: suggestedProducts.length > 0 ? suggestedProducts : undefined
		};
	} catch (error) {
		console.error('Error in handleChatMessage:', error);
		return {
			response: getFallbackResponse(message)
		};
	}
}

/**
 * Extract search terms from user message and AI response
 */
function extractSearchTerms(userMessage: string, aiResponse: string): string[] {
	const terms: string[] = [];
	const text = `${userMessage} ${aiResponse}`.toLowerCase();

	// Component keywords
	const componentKeywords = [
		'ram', 'memory', 'ddr4', 'ddr5',
		'cpu', 'processor', 'intel', 'amd', 'ryzen', 'core i',
		'gpu', 'graphics', 'nvidia', 'rtx', 'gtx', 'radeon',
		'motherboard', 'mobo', 'board',
		'ssd', 'hdd', 'storage', 'nvme', 'm.2',
		'psu', 'power supply',
		'case', 'chassis',
		'cooler', 'fan', 'heatsink',
		'monitor', 'display',
		'keyboard', 'mouse', 'peripheral'
	];

	componentKeywords.forEach(keyword => {
		if (text.includes(keyword)) {
			terms.push(keyword);
		}
	});

	// Extract product names or brands mentioned
	const brandPatterns = [
		/\b(intel|amd|nvidia|asus|msi|gigabyte|evga|corsair|g\.skill|samsung|western digital|seagate)\b/gi
	];

	brandPatterns.forEach(pattern => {
		const matches = text.match(pattern);
		if (matches) {
			terms.push(...matches.map(m => m.toLowerCase()));
		}
	});

	return [...new Set(terms)]; // Remove duplicates
}

/**
 * Fallback response when Gemini API is not available
 */
function getFallbackResponse(message: string): string {
	const lowerMessage = message.toLowerCase().trim();

	if (lowerMessage.includes('ram') || lowerMessage.includes('memory')) {
		return `I can help you find RAM! Here are some options:\n\n• Check our RAM products in the PC Builder section\n• Filter by capacity (8GB, 16GB, 32GB, etc.)\n• Consider DDR4 or DDR5 based on your motherboard\n\nWould you like me to help you find specific RAM for your build?`;
	}

	if (lowerMessage.includes('cpu') || lowerMessage.includes('processor')) {
		return `I can help you choose a CPU! Here's what to consider:\n\n• Intel or AMD processors\n• Core count for your use case (gaming, work, etc.)\n• Compatibility with your motherboard socket\n\nUse our PC Builder tool to see compatible CPUs for your build!`;
	}

	if (lowerMessage.includes('gpu') || lowerMessage.includes('graphics') || lowerMessage.includes('video card')) {
		return `I can help you find a graphics card! Consider:\n\n• NVIDIA or AMD GPUs\n• VRAM amount (4GB, 8GB, 16GB+)\n• Power requirements\n• Your monitor resolution and refresh rate\n\nCheck our GPU section in the PC Builder!`;
	}

	if (lowerMessage.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/)) {
		return `Hello! I'm your AI PC Builder Assistant at TinyTech. I can help you with:\n\n• Product questions and recommendations\n• PC building guidance\n• Component compatibility\n• Budget planning\n• Order status inquiries\n\nWhat would you like help with today?`;
	}

	return `I'm here to help you with PC building and product questions! I can assist with:\n\n• Finding specific components (RAM, CPU, GPU, etc.)\n• Building a complete PC\n• Compatibility questions\n• Budget planning\n• Product recommendations\n\nFor detailed component selection, please use the PC Builder tool. You can also ask me specific questions about components, compatibility, or your build!`;
}


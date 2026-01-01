// SERVICE: Product Q&A assistant business logic
import { supabase } from '$lib/config/supabase';
import { productService } from './ProductService';
import { reviewService } from './ReviewService';
import { aiService } from './AIService';
import type { Product } from '$lib/models/Product';

export interface ProductQA {
	id: string;
	product_id: string;
	question: string;
	answer: string;
	user_id?: string;
	created_at: string;
	helpful_count: number;
}

export interface CreateQADTO {
	product_id: string;
	question: string;
	user_id?: string;
}

export class ProductQAService {
	/**
	 * Answer a question about a product using AI
	 */
	async answerQuestion(
		productId: string,
		question: string,
		userId?: string
	): Promise<string> {
		try {
			// Get product details
			const product = await productService.getProductById(productId);
			if (!product) {
				throw new Error('Product not found');
			}

			// Get product reviews for additional context
			const reviews = await reviewService.getReviewsByProduct(productId);

			// Build context for AI
			const context = `
Product Information:
- Name: ${product.name}
- Description: ${product.description}
- Specifications: ${product.specifications || 'Not provided'}
- Brand: ${product.brand || 'Not specified'}
- Price: Tk ${product.price.toFixed(2)}

Customer Reviews (sample):
${reviews.slice(0, 5).map(r => `- Rating: ${r.rating}/5 - ${r.comment || 'No comment'}`).join('\n')}
`;

			// Use AI to answer the question
			const prompt = `You are a helpful product assistant. Answer the following question about this product based on the provided information. If the information is not available, say so politely.

${context}

Question: ${question}

Provide a clear, concise answer. If the answer can be found in the specifications or reviews, cite that information.`;

			// Try to use AI service, fallback to rule-based
			try {
				const answer = await this.answerWithAI(prompt, product, reviews);
				if (answer) {
					// Store Q&A for future reference
					await this.storeQA(productId, question, answer, userId);
					return answer;
				}
			} catch (error) {
				console.warn('AI answer failed, using rule-based:', error);
			}

			// Rule-based fallback
			return this.answerRuleBased(question, product, reviews);
		} catch (error: any) {
			console.error('Error answering question:', error);
			throw new Error(`Failed to answer question: ${error.message}`);
		}
	}

	/**
	 * Answer question using AI
	 */
	private async answerWithAI(
		prompt: string,
		product: Product,
		reviews: any[]
	): Promise<string | null> {
		// This would use OpenAI/Gemini API
		// For now, return null to use rule-based
		return null;
	}

	/**
	 * Rule-based answer generation
	 */
	private answerRuleBased(question: string, product: Product, reviews: any[]): string {
		const lowerQuestion = question.toLowerCase();

		// Compatibility questions
		if (lowerQuestion.includes('compatible') || lowerQuestion.includes('compatibility')) {
			if (product.specifications) {
				return `Based on the product specifications, ${product.name} has the following compatibility information: ${product.specifications.substring(0, 200)}. For detailed compatibility, please check the full specifications on the product page or contact our support team.`;
			}
			return `For compatibility information about ${product.name}, please check the product specifications on the product page or contact our support team for assistance.`;
		}

		// Warranty questions
		if (lowerQuestion.includes('warranty') || lowerQuestion.includes('guarantee')) {
			return `Warranty information for ${product.name} is typically provided at the time of purchase. Please contact our support team or check the product documentation for specific warranty details.`;
		}

		// Performance questions
		if (lowerQuestion.includes('performance') || lowerQuestion.includes('speed') || lowerQuestion.includes('fast')) {
			if (product.specifications) {
				return `Based on the specifications, ${product.name} offers: ${product.specifications.substring(0, 200)}. For detailed performance metrics, please check the full specifications or customer reviews.`;
			}
			return `For performance details about ${product.name}, please check the product specifications and customer reviews on the product page.`;
		}

		// Review-based answers
		if (reviews.length > 0) {
			const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
			const positiveReviews = reviews.filter(r => r.rating >= 4);
			
			if (lowerQuestion.includes('good') || lowerQuestion.includes('quality') || lowerQuestion.includes('worth')) {
				return `${product.name} has an average rating of ${avgRating.toFixed(1)}/5 based on ${reviews.length} review(s). ${positiveReviews.length > 0 ? `${positiveReviews.length} customers rated it 4 or 5 stars.` : ''} Check the reviews section for detailed customer feedback.`;
			}
		}

		// Default answer
		return `I can help you with information about ${product.name}. For specific questions about compatibility, warranty, performance, or features, please check the product specifications on the product page or contact our support team for detailed assistance.`;
	}

	/**
	 * Store Q&A for future reference
	 */
	async storeQA(
		productId: string,
		question: string,
		answer: string,
		userId?: string
	): Promise<void> {
		try {
			await supabase.from('product_qa').insert({
				product_id: productId,
				question,
				answer,
				user_id: userId,
				helpful_count: 0,
				created_at: new Date().toISOString()
			});
		} catch (error) {
			// Ignore if table doesn't exist
			if (error && typeof error === 'object' && 'message' in error) {
				if (!(error as any).message.includes('does not exist')) {
					console.error('Error storing QA:', error);
				}
			}
		}
	}

	/**
	 * Get existing Q&A for a product
	 */
	async getProductQA(productId: string, limit: number = 10): Promise<ProductQA[]> {
		try {
			const { data, error } = await supabase
				.from('product_qa')
				.select('*')
				.eq('product_id', productId)
				.order('helpful_count', { ascending: false })
				.order('created_at', { ascending: false })
				.limit(limit);

			if (error) {
				if (error.message.includes('does not exist')) {
					return [];
				}
				throw error;
			}

			return (data || []) as ProductQA[];
		} catch (error) {
			console.error('Error getting product QA:', error);
			return [];
		}
	}

	/**
	 * Mark Q&A as helpful
	 */
	async markAsHelpful(qaId: string): Promise<void> {
		try {
			await supabase
				.from('product_qa')
				.update({ helpful_count: supabase.raw('helpful_count + 1') })
				.eq('id', qaId);
		} catch (error) {
			console.error('Error marking QA as helpful:', error);
		}
	}
}

export const productQAService = new ProductQAService();


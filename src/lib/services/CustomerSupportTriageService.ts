// SERVICE: Customer support triage with AI routing
import { aiService } from './AIService';

export type SupportCategory = 
	| 'order_inquiry' 
	| 'product_question' 
	| 'technical_support' 
	| 'billing' 
	| 'return_refund' 
	| 'general';

export interface SupportTriage {
	category: SupportCategory;
	priority: 'high' | 'medium' | 'low';
	canAutoResolve: boolean;
	suggestedResponse?: string;
	needsHuman: boolean;
	estimatedWaitTime?: string;
}

export class CustomerSupportTriageService {
	/**
	 * Triage customer inquiry
	 */
	async triageInquiry(message: string, userId?: string): Promise<SupportTriage> {
		const lowerMessage = message.toLowerCase();

		// Categorize inquiry
		const category = this.categorizeInquiry(lowerMessage);

		// Determine priority
		const priority = this.determinePriority(lowerMessage, category);

		// Check if can be auto-resolved
		const canAutoResolve = this.canAutoResolve(category, lowerMessage);

		// Generate suggested response
		let suggestedResponse: string | undefined;
		if (canAutoResolve) {
			suggestedResponse = this.generateAutoResponse(category, lowerMessage);
		}

		// Determine if needs human
		const needsHuman = !canAutoResolve || priority === 'high';

		// Estimate wait time
		const estimatedWaitTime = this.estimateWaitTime(priority, category);

		return {
			category,
			priority,
			canAutoResolve,
			suggestedResponse,
			needsHuman,
			estimatedWaitTime
		};
	}

	/**
	 * Categorize inquiry
	 */
	private categorizeInquiry(message: string): SupportCategory {
		// Order inquiries
		if (
			message.includes('order') ||
			message.includes('track') ||
			message.includes('delivery') ||
			message.includes('shipping') ||
			message.includes('status')
		) {
			return 'order_inquiry';
		}

		// Product questions
		if (
			message.includes('product') ||
			message.includes('spec') ||
			message.includes('compatible') ||
			message.includes('feature') ||
			message.includes('does it') ||
			message.includes('can it')
		) {
			return 'product_question';
		}

		// Technical support
		if (
			message.includes('not working') ||
			message.includes('broken') ||
			message.includes('defect') ||
			message.includes('issue') ||
			message.includes('problem') ||
			message.includes('error')
		) {
			return 'technical_support';
		}

		// Billing
		if (
			message.includes('payment') ||
			message.includes('billing') ||
			message.includes('charge') ||
			message.includes('refund') ||
			message.includes('money')
		) {
			return 'billing';
		}

		// Return/Refund
		if (
			message.includes('return') ||
			message.includes('exchange') ||
			message.includes('cancel')
		) {
			return 'return_refund';
		}

		return 'general';
	}

	/**
	 * Determine priority
	 */
	private determinePriority(message: string, category: SupportCategory): 'high' | 'medium' | 'low' {
		// High priority keywords
		const highPriorityKeywords = ['urgent', 'emergency', 'broken', 'defect', 'not working', 'refund'];
		if (highPriorityKeywords.some(keyword => message.includes(keyword))) {
			return 'high';
		}

		// Category-based priority
		if (category === 'technical_support' || category === 'billing') {
			return 'high';
		}

		if (category === 'order_inquiry' || category === 'return_refund') {
			return 'medium';
		}

		return 'low';
	}

	/**
	 * Check if inquiry can be auto-resolved
	 */
	private canAutoResolve(category: SupportCategory, message: string): boolean {
		// Simple questions can be auto-resolved
		if (category === 'product_question') {
			return true;
		}

		// Order status can sometimes be auto-resolved
		if (category === 'order_inquiry' && message.includes('status')) {
			return true;
		}

		// General questions
		if (category === 'general' && !message.includes('urgent')) {
			return true;
		}

		return false;
	}

	/**
	 * Generate auto-response
	 */
	private generateAutoResponse(category: SupportCategory, message: string): string {
		if (category === 'product_question') {
			return 'I can help you with product information. Please check the product page for detailed specifications, or let me know what specific information you need.';
		}

		if (category === 'order_inquiry') {
			return 'I can help you track your order. Please provide your order number, or check your order history in your profile.';
		}

		return 'Thank you for contacting us. How can I assist you today?';
	}

	/**
	 * Estimate wait time
	 */
	private estimateWaitTime(priority: SupportCategory['priority'], category: SupportCategory): string {
		if (priority === 'high') {
			return '5-10 minutes';
		}

		if (priority === 'medium') {
			return '15-30 minutes';
		}

		return '1-2 hours';
	}

	/**
	 * Route to appropriate support channel
	 */
	getSupportChannel(triage: SupportTriage): string {
		if (triage.category === 'technical_support') {
			return 'technical-support';
		}

		if (triage.category === 'billing') {
			return 'billing-support';
		}

		if (triage.category === 'return_refund') {
			return 'returns-support';
		}

		return 'general-support';
	}
}

export const customerSupportTriageService = new CustomerSupportTriageService();


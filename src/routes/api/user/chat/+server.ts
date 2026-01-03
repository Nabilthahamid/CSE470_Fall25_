// API: User-specific chat endpoint with enhanced context
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CartModel } from '$lib/models/CartModel';
import { OrderModel } from '$lib/models/OrderModel';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { message, conversationHistory } = await request.json();

		if (!message || typeof message !== 'string' || message.trim().length === 0) {
			return json({ error: 'Message is required' }, { status: 400 });
		}

		const userId = locals.user?.id || null;

		// Get enhanced context (cart items, order history, current page)
		let enhancedContext = '';
		if (userId) {
			try {
				// Get cart items
				const cartItems = await CartModel.getCartItems(userId);
				if (cartItems.length > 0) {
					enhancedContext += `\nUser's Cart Items:\n${cartItems.map(item => `- ${item.product?.name || 'Unknown'} (Qty: ${item.quantity})`).join('\n')}\n`;
				}

				// Get recent orders
				const ordersModels = await OrderModel.getByUser(userId);
				const orders = ordersModels.map(o => o.toJSON());
				if (orders.length > 0) {
					const recentOrders = orders.slice(0, 3);
					enhancedContext += `\nRecent Orders:\n${recentOrders.map(order => `- Order #${order.id.substring(0, 8)}: ${order.status} (${new Date(order.created_at).toLocaleDateString()})`).join('\n')}\n`;
				}
			} catch (error) {
				console.warn('Could not fetch enhanced context:', error);
			}
		}

		// Basic chat response (AI service removed)
		const response = {
			message: `Thank you for your message: "${message.trim()}". For detailed assistance, please contact our support team.`,
			context: enhancedContext ? 'Enhanced context available' : 'No context'
		};

		return json({ response });
	} catch (error) {
		console.error('User chat API error:', error);
		return json(
			{ error: 'Failed to process chat message. Please try again.' },
			{ status: 500 }
		);
	}
};


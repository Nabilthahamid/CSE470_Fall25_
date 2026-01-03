// UTILITY: Email sending functions
import type { Order } from '$lib/models/Order';

/**
 * Send invoice email
 */
export async function sendInvoice(order: Order): Promise<void> {
	// Email sending logic here
	// This is a utility function, not a data model
	console.log('Sending invoice email for order:', order.id);
	// TODO: Implement actual email sending
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(order: Order): Promise<void> {
	console.log('Sending order confirmation for order:', order.id);
	// TODO: Implement actual email sending
}


// SERVICE: Email service for sending invoices
import type { Order } from '$lib/models/Order';

export interface EmailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
}

export class EmailService {
	/**
	 * Send email using Resend API or console fallback
	 * To enable real emails:
	 * 1. Get API key from https://resend.com
	 * 2. Add RESEND_API_KEY to your .env file
	 * 3. Set RESEND_FROM_EMAIL to your verified domain email
	 */
	async sendEmail(options: EmailOptions): Promise<void> {
		const RESEND_API_KEY = process.env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
		const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || import.meta.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

		// If Resend API key is configured, send real email
		if (RESEND_API_KEY) {
			try {
				const response = await fetch('https://api.resend.com/emails', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${RESEND_API_KEY}`
					},
					body: JSON.stringify({
						from: RESEND_FROM_EMAIL,
						to: options.to,
						subject: options.subject,
						html: options.html,
						text: options.text
					})
				});

				if (!response.ok) {
					const error = await response.json();
					console.error('Resend API error:', error);
					throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
				}

				const result = await response.json();
				console.log('✅ Email sent successfully:', result.id);
				return;
			} catch (error) {
				console.error('❌ Email sending failed, falling back to console:', error);
				// Fall through to console logging
			}
		}

		// Fallback: Log to console (for development/testing)
		console.log('📧 [EMAIL MOCK] Email would be sent:');
		console.log('To:', options.to);
		console.log('Subject:', options.subject);
		console.log('---');
		console.log('HTML Content:');
		console.log(options.html.substring(0, 200) + '...');
		console.log('---');
		console.log('💡 To enable real emails, set RESEND_API_KEY in your .env file');
	}

	/**
	 * Generate invoice HTML from order
	 */
	generateInvoiceHTML(order: Order): string {
		const orderDate = order.created_at
			? new Date(order.created_at).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})
			: 'N/A';

		return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Invoice #${order.id.substring(0, 8)}</title>
	<style>
		body {
			font-family: Arial, sans-serif;
			line-height: 1.6;
			color: #333;
			max-width: 800px;
			margin: 0 auto;
			padding: 20px;
			background-color: #f5f5f5;
		}
		.invoice-container {
			background: white;
			padding: 40px;
			border-radius: 8px;
			box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		}
		.header {
			text-align: center;
			margin-bottom: 40px;
			border-bottom: 2px solid #4f46e5;
			padding-bottom: 20px;
		}
		.header h1 {
			margin: 0;
			color: #4f46e5;
			font-size: 32px;
		}
		.header p {
			margin: 5px 0;
			color: #666;
		}
		.info-section {
			display: flex;
			justify-content: space-between;
			margin-bottom: 30px;
		}
		.info-box {
			flex: 1;
		}
		.info-box h3 {
			margin-top: 0;
			color: #4f46e5;
			font-size: 16px;
		}
		.info-box p {
			margin: 5px 0;
		}
		table {
			width: 100%;
			border-collapse: collapse;
			margin-bottom: 30px;
		}
		thead {
			background-color: #4f46e5;
			color: white;
		}
		th, td {
			padding: 12px;
			text-align: left;
			border-bottom: 1px solid #ddd;
		}
		tbody tr:hover {
			background-color: #f9f9f9;
		}
		.total-section {
			text-align: right;
			margin-top: 20px;
		}
		.total-row {
			font-size: 18px;
			font-weight: bold;
			color: #4f46e5;
			padding: 10px 0;
		}
		.footer {
			text-align: center;
			margin-top: 40px;
			padding-top: 20px;
			border-top: 1px solid #ddd;
			color: #666;
			font-size: 14px;
		}
		.status-badge {
			display: inline-block;
			padding: 5px 15px;
			border-radius: 20px;
			font-size: 14px;
			font-weight: bold;
			background-color: #10b981;
			color: white;
		}
	</style>
</head>
<body>
	<div class="invoice-container">
		<div class="header">
			<h1>INVOICE</h1>
			<p>Order #${order.id.substring(0, 8).toUpperCase()}</p>
			<p>Date: ${orderDate}</p>
		</div>

		<div class="info-section">
			<div class="info-box">
				<h3>Bill To:</h3>
				<p><strong>${this.escapeHtml(order.customer_name)}</strong></p>
				<p>${this.escapeHtml(order.customer_email)}</p>
				${order.customer_address ? `<p>${this.escapeHtml(order.customer_address)}</p>` : ''}
				${order.customer_phone ? `<p>Phone: ${this.escapeHtml(order.customer_phone)}</p>` : ''}
			</div>
			<div class="info-box" style="text-align: right;">
				<h3>Order Status:</h3>
				<span class="status-badge">${order.status.toUpperCase()}</span>
			</div>
		</div>

		<table>
			<thead>
				<tr>
					<th>Item</th>
					<th>Quantity</th>
					<th>Unit Price</th>
					<th>Total</th>
				</tr>
			</thead>
			<tbody>
				${order.items
					?.map(
						(item) => `
					<tr>
						<td>${this.escapeHtml(item.product_name)}</td>
						<td>${item.quantity}</td>
						<td>$${item.unit_price.toFixed(2)}</td>
						<td>$${item.total_price.toFixed(2)}</td>
					</tr>
				`
					)
					.join('') || ''}
			</tbody>
		</table>

		<div class="total-section">
			<div class="total-row">
				Total Amount: $${order.total_amount.toFixed(2)}
			</div>
		</div>

		<div class="footer">
			<p>Thank you for your business!</p>
			<p>If you have any questions about this invoice, please contact us.</p>
		</div>
	</div>
</body>
</html>
		`;
	}

	/**
	 * Generate plain text invoice
	 */
	generateInvoiceText(order: Order): string {
		const orderDate = order.created_at
			? new Date(order.created_at).toLocaleDateString()
			: 'N/A';

		let text = `INVOICE\n`;
		text += `Order #${order.id.substring(0, 8).toUpperCase()}\n`;
		text += `Date: ${orderDate}\n\n`;
		text += `Bill To:\n`;
		text += `${order.customer_name}\n`;
		text += `${order.customer_email}\n`;
		if (order.customer_address) text += `${order.customer_address}\n`;
		if (order.customer_phone) text += `Phone: ${order.customer_phone}\n`;
		text += `\nOrder Status: ${order.status.toUpperCase()}\n\n`;
		text += `Items:\n`;
		text += `----------------------------\n`;

		order.items?.forEach((item) => {
			text += `${item.product_name} - Qty: ${item.quantity} x $${item.unit_price.toFixed(2)} = $${item.total_price.toFixed(2)}\n`;
		});

		text += `----------------------------\n`;
		text += `Total Amount: $${order.total_amount.toFixed(2)}\n\n`;
		text += `Thank you for your business!`;

		return text;
	}

	/**
	 * Send invoice email
	 */
	async sendInvoice(order: Order): Promise<void> {
		const html = this.generateInvoiceHTML(order);
		const text = this.generateInvoiceText(order);

		await this.sendEmail({
			to: order.customer_email,
			subject: `Invoice #${order.id.substring(0, 8).toUpperCase()} - Your Order`,
			html,
			text
		});
	}

	/**
	 * Escape HTML to prevent XSS
	 */
	private escapeHtml(text: string): string {
		const map: Record<string, string> = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};
		return text.replace(/[&<>"']/g, (m) => map[m]);
	}
}

// Export singleton instance
export const emailService = new EmailService();


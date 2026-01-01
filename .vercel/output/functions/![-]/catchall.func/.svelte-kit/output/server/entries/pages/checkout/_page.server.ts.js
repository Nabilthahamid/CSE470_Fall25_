import { redirect } from "@sveltejs/kit";
import { c as cartService } from "../../../chunks/CartService.js";
import { o as orderService } from "../../../chunks/OrderService.js";
import { h as handleError } from "../../../chunks/errors.js";
class EmailService {
  /**
   * Send email using Resend API or console fallback
   * To enable real emails:
   * 1. Get API key from https://resend.com
   * 2. Add RESEND_API_KEY to your .env file
   * 3. Set RESEND_FROM_EMAIL to your verified domain email
   */
  async sendEmail(options) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY || void 0;
    const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || void 0 || "onboarding@resend.dev";
    if (RESEND_API_KEY) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`
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
          console.error("Resend API error:", error);
          throw new Error(`Failed to send email: ${error.message || "Unknown error"}`);
        }
        const result = await response.json();
        console.log("✅ Email sent successfully:", result.id);
        return;
      } catch (error) {
        console.error("❌ Email sending failed, falling back to console:", error);
      }
    }
    console.log("📧 [EMAIL MOCK] Email would be sent:");
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("---");
    console.log("HTML Content:");
    console.log(options.html.substring(0, 200) + "...");
    console.log("---");
    console.log("💡 To enable real emails, set RESEND_API_KEY in your .env file");
  }
  /**
   * Generate invoice HTML from order
   */
  generateInvoiceHTML(order) {
    const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }) : "N/A";
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
				${order.customer_address ? `<p>${this.escapeHtml(order.customer_address)}</p>` : ""}
				${order.customer_phone ? `<p>Phone: ${this.escapeHtml(order.customer_phone)}</p>` : ""}
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
				${order.items?.map(
      (item) => `
					<tr>
						<td>${this.escapeHtml(item.product_name)}</td>
						<td>${item.quantity}</td>
						<td>$${item.unit_price.toFixed(2)}</td>
						<td>$${item.total_price.toFixed(2)}</td>
					</tr>
				`
    ).join("") || ""}
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
  generateInvoiceText(order) {
    const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A";
    let text = `INVOICE
`;
    text += `Order #${order.id.substring(0, 8).toUpperCase()}
`;
    text += `Date: ${orderDate}

`;
    text += `Bill To:
`;
    text += `${order.customer_name}
`;
    text += `${order.customer_email}
`;
    if (order.customer_address) text += `${order.customer_address}
`;
    if (order.customer_phone) text += `Phone: ${order.customer_phone}
`;
    text += `
Order Status: ${order.status.toUpperCase()}

`;
    text += `Items:
`;
    text += `----------------------------
`;
    order.items?.forEach((item) => {
      text += `${item.product_name} - Qty: ${item.quantity} x $${item.unit_price.toFixed(2)} = $${item.total_price.toFixed(2)}
`;
    });
    text += `----------------------------
`;
    text += `Total Amount: $${order.total_amount.toFixed(2)}

`;
    text += `Thank you for your business!`;
    return text;
  }
  /**
   * Send invoice email
   */
  async sendInvoice(order) {
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
  escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
const emailService = new EmailService();
const load = async ({ locals }) => {
  try {
    const userId = locals.user?.id || void 0;
    const cartItems = await cartService.getCartItems(userId);
    const total = await cartService.getCartTotal(userId);
    if (cartItems.length === 0) {
      throw redirect(302, "/cart");
    }
    let userProfile = null;
    if (userId) {
      try {
        const { userService } = await import("../../../chunks/UserService.js");
        const user = await userService.getUserById(userId);
        userProfile = {
          customer_name: user.customer_name || "",
          customer_email: user.email || "",
          customer_address: user.customer_address || "",
          customer_phone: user.customer_phone || "",
          customer_city: user.customer_city || "",
          customer_postal_code: user.customer_postal_code || "",
          customer_country: user.customer_country || "Bangladesh"
        };
      } catch (e) {
        console.error("Error loading user profile:", e);
      }
    }
    return {
      cartItems,
      total,
      user: locals.user,
      userProfile,
      error: null
    };
  } catch (error) {
    if (error && typeof error === "object" && "status" in error && error.status === 302) {
      throw error;
    }
    const { message } = handleError(error);
    throw redirect(302, "/cart?error=" + encodeURIComponent(message));
  }
};
const actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();
    const customer_name = formData.get("customer_name")?.toString() || "";
    const customer_email = formData.get("customer_email")?.toString() || "";
    const customer_address = formData.get("customer_address")?.toString() || "";
    const customer_phone = formData.get("customer_phone")?.toString() || "";
    const customer_city = formData.get("customer_city")?.toString() || "";
    const customer_postal_code = formData.get("customer_postal_code")?.toString() || "";
    const customer_country = formData.get("customer_country")?.toString() || "Bangladesh";
    const shipping_method = formData.get("shipping_method")?.toString() || "inside_dhaka";
    const payment_method = formData.get("payment_method")?.toString() || "cod";
    const shipping_cost = parseFloat(formData.get("shipping_cost")?.toString() || "0");
    const fullAddress = [
      customer_address,
      customer_city,
      customer_postal_code,
      customer_country
    ].filter(Boolean).join(", ");
    if (!customer_name || !customer_email) {
      return {
        error: "Name and email are required"
      };
    }
    try {
      const userId = locals.user?.id || void 0;
      const order = await orderService.createOrder(
        {
          customer_name,
          customer_email,
          customer_address: fullAddress || customer_address || null,
          customer_phone: customer_phone || null,
          customer_city: customer_city || null,
          customer_postal_code: customer_postal_code || null,
          customer_country: customer_country || null,
          shipping_method: shipping_method || null,
          payment_method: payment_method || null,
          shipping_cost: shipping_cost || 0
        },
        userId
      );
      const saveInfo = formData.get("save_info")?.toString() === "true";
      if (saveInfo && locals.user?.id) {
        try {
          const { userService } = await import("../../../chunks/UserService.js");
          await userService.updateUser(locals.user.id, {
            customer_name: customer_name || void 0,
            customer_address: customer_address || void 0,
            customer_phone: customer_phone || void 0,
            customer_city: customer_city || void 0,
            customer_postal_code: customer_postal_code || void 0,
            customer_country: customer_country || void 0
          });
        } catch (profileError) {
          console.error("Failed to save profile information:", profileError);
        }
      }
      try {
        await emailService.sendInvoice(order);
      } catch (emailError) {
        console.error("Failed to send invoice email:", emailError);
      }
      throw redirect(302, `/checkout/success?order_id=${order.id}`);
    } catch (error) {
      if (error && typeof error === "object" && "status" in error && error.status === 302) {
        throw error;
      }
      const { message } = handleError(error);
      return {
        error: message
      };
    }
  }
};
export {
  actions,
  load
};

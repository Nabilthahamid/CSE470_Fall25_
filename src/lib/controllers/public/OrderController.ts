// CONTROLLER: Public order controller
import { BaseController } from '../BaseController';
import { requireAuth } from '$lib/utils/auth';
import { OrderModel } from '$lib/models/OrderModel';
import { ReturnModel } from '$lib/models/ReturnModel';

export class PublicOrderController extends BaseController {
	/**
	 * Load user's orders
	 */
	async loadUserOrders() {
		requireAuth(this.getUser());

		try {
			const userId = this.getUser()!.id;
			const ordersModels = await OrderModel.getByUser(userId);
			const orders = ordersModels.map((o) => o.toJSON());

			// Load return requests for all orders
			let allReturnRequests: any[] = [];
			try {
				const returnModels = await ReturnModel.getAll({ userId });
				allReturnRequests = returnModels.map((r) => r.toJSON());
			} catch (err) {
				console.error('Error loading return requests:', err);
			}

			// Map return requests to orders
			const ordersWithReturns = orders.map((order) => {
				const orderReturns = allReturnRequests.filter((r) => r.order_id === order.id);
				return {
					...order,
					returnRequests: orderReturns
				};
			});

			return {
				orders: ordersWithReturns,
				user: this.getUser()
			};
		} catch (error) {
			const { message } = this.handleError(error);
			return {
				orders: [],
				user: this.getUser(),
				error: message
			};
		}
	}

	/**
	 * Load single order details
	 */
	async loadOrderDetails(orderId: string) {
		requireAuth(this.getUser());

		try {
			const orderModel = await OrderModel.getById(orderId);
			if (!orderModel) {
				return {
					order: null,
					error: 'Order not found'
				};
			}

			const order = orderModel.toJSON();
			
			// Verify user owns this order
			if (order.user_id !== this.getUser()!.id) {
				return {
					order: null,
					error: 'Order not found'
				};
			}

			return {
				order,
				error: null
			};
		} catch (error) {
			const { message } = this.handleError(error);
			return {
				order: null,
				error: message
			};
		}
	}
}


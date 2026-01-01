// SERVICE: Order business logic and data access layer
import { supabase } from '$lib/config/supabase';
import type {
	Order,
	OrderItem,
	CreateOrderDTO,
	OrderRepository,
	OrderFilters,
	OrderItemInput,
	OrderStatus
} from '$lib/models/Order';
import { saleService } from './SaleService';
import { cartService } from './CartService';

class OrderRepositoryImpl implements OrderRepository {
	async getAll(filters?: OrderFilters): Promise<Order[]> {
		let query = supabase
			.from('orders')
			.select(
				`
				*,
				order_items(*)
			`
			)
			.order('created_at', { ascending: false });

		if (filters?.userId) {
			query = query.eq('user_id', filters.userId);
		}

		if (filters?.status) {
			query = query.eq('status', filters.status);
		}

		if (filters?.startDate) {
			query = query.gte('created_at', filters.startDate);
		}

		if (filters?.endDate) {
			query = query.lte('created_at', filters.endDate);
		}

		const { data, error } = await query;

		if (error) throw new Error(`Failed to fetch orders: ${error.message}`);

		return (data || []).map((order: any) => ({
			...order,
			items: order.order_items || []
		}));
	}

	async getById(id: string): Promise<Order | null> {
		const { data, error } = await supabase
			.from('orders')
			.select(
				`
				*,
				order_items(*)
			`
			)
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch order: ${error.message}`);
		}

		// Fetch status history
		const { data: history } = await supabase
			.from('order_status_history')
			.select('*')
			.eq('order_id', id)
			.order('created_at', { ascending: true });

		return {
			...data,
			items: data.order_items || [],
			status_history: history || []
		};
	}

	async getByUser(userId: string): Promise<Order[]> {
		return this.getAll({ userId });
	}

	async create(orderData: CreateOrderDTO, items: OrderItemInput[]): Promise<Order> {
		// Calculate total (including shipping cost)
		const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
		const totalAmount = subtotal + (orderData.shipping_cost || 0);

		// Create order
		const { data: order, error: orderError } = await supabase
			.from('orders')
			.insert({
				user_id: orderData.user_id,
				customer_name: orderData.customer_name,
				customer_email: orderData.customer_email,
				customer_address: orderData.customer_address || null,
				customer_phone: orderData.customer_phone || null,
				customer_city: orderData.customer_city || null,
				customer_postal_code: orderData.customer_postal_code || null,
				customer_country: orderData.customer_country || null,
				shipping_method: orderData.shipping_method || null,
				payment_method: orderData.payment_method || null,
				shipping_cost: orderData.shipping_cost || 0,
				total_amount: totalAmount,
				status: 'pending'
			})
			.select()
			.single();

		if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);

		// Create order items
		const orderItems = items.map((item) => ({
			order_id: order.id,
			product_id: item.product_id,
			product_name: item.product_name,
			quantity: item.quantity,
			unit_price: item.unit_price,
			total_price: item.total_price
		}));

		const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

		if (itemsError) {
			// Rollback: delete order
			await supabase.from('orders').delete().eq('id', order.id);
			throw new Error(`Failed to create order items: ${itemsError.message}`);
		}

		// Create sales records for reporting (stock already updated by order_items trigger)
		// Note: Sales are created for profit/loss tracking, stock is handled by order_items trigger
		for (const item of items) {
			try {
				await saleService.createSale({
					product_id: item.product_id,
					user_id: orderData.user_id || null,
					quantity: item.quantity,
					skipStockCheck: true // Stock already updated by order_items trigger
				});
			} catch (error) {
				console.error(`Failed to create sale for product ${item.product_id}:`, error);
				// Continue with other items - sale creation failure shouldn't break order
			}
		}

		// Return complete order
		const completeOrder = await this.getById(order.id);
		if (!completeOrder) throw new Error('Failed to retrieve created order');
		return completeOrder;
	}

	async updateStatus(id: string, status: OrderStatus, trackingNumber?: string, notes?: string, updatedBy?: string): Promise<Order> {
		const updateData: any = {
			status,
			updated_at: new Date().toISOString()
		};

		// Set shipping_date when status changes to 'shipped'
		if (status === 'shipped') {
			updateData.shipping_date = new Date().toISOString();
		}

		// Set delivery_date when status changes to 'delivered'
		if (status === 'delivered') {
			updateData.delivery_date = new Date().toISOString();
		}

		// Add tracking number if provided
		if (trackingNumber) {
			updateData.tracking_number = trackingNumber;
		}

		// Update order (don't use .single() on update, just check for errors)
		const { error: updateError } = await supabase
			.from('orders')
			.update(updateData)
			.eq('id', id);

		if (updateError) throw new Error(`Failed to update order status: ${updateError.message}`);

		// Status history is automatically logged by trigger, but we can add notes if provided
		if (notes) {
			await supabase
				.from('order_status_history')
				.insert({
					order_id: id,
					status,
					notes,
					updated_by: updatedBy || null
				});
		}

		// Fetch the updated order with all relationships
		const order = await this.getById(id);
		if (!order) throw new Error('Failed to retrieve updated order');
		return order;
	}
}

// SERVICE: Business logic layer
export class OrderService {
	private repository: OrderRepository;

	constructor(repository?: OrderRepository) {
		this.repository = repository || new OrderRepositoryImpl();
	}

	async getAllOrders(filters?: OrderFilters): Promise<Order[]> {
		return await this.repository.getAll(filters);
	}

	async getOrderById(id: string): Promise<Order> {
		if (!id) throw new Error('Order ID is required');
		const order = await this.repository.getById(id);
		if (!order) throw new Error('Order not found');
		return order;
	}

	async getOrdersByUser(userId: string): Promise<Order[]> {
		return await this.repository.getByUser(userId);
	}

	async createOrder(orderData: CreateOrderDTO, userId?: string): Promise<Order> {
		if (!orderData.customer_name) throw new Error('Customer name is required');
		if (!orderData.customer_email) throw new Error('Customer email is required');

		// Get cart items
		const cartItems = await cartService.getCartItems(userId);

		if (cartItems.length === 0) {
			throw new Error('Cart is empty');
		}

		// Prepare order items
		const orderItems: OrderItemInput[] = cartItems.map((item) => {
			if (!item.product) {
				throw new Error(`Product not found for cart item ${item.id}`);
			}

			return {
				product_id: item.product.id,
				product_name: item.product.name,
				quantity: item.quantity,
				unit_price: item.product.price,
				total_price: item.product.price * item.quantity
			};
		});

		// Create order (this will also create sales and update stock)
		const order = await this.repository.create(
			{ ...orderData, user_id: userId || null },
			orderItems
		);

		// Clear cart after successful order
		await cartService.clearCart(userId);

		return order;
	}

	async updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string, notes?: string, updatedBy?: string): Promise<Order> {
		return await this.repository.updateStatus(id, status, trackingNumber, notes, updatedBy);
	}
}

// Export singleton instance
export const orderService = new OrderService();


// MODEL: Order Model (Pure MVC - Data + Business Logic + Data Access)
import { supabase } from '$lib/config/supabase';
import type {
	Order,
	OrderItem,
	CreateOrderDTO,
	OrderFilters,
	OrderItemInput,
	OrderStatus,
	OrderStatusHistory
} from './Order';
import { CartModel } from './CartModel';
import { ProductModel } from './ProductModel';
import { SaleModel } from './SaleModel';

export class OrderModel {
	// Data properties
	id: string;
	user_id?: string | null;
	customer_name: string;
	customer_email: string;
	customer_address?: string | null;
	customer_phone?: string | null;
	customer_city?: string | null;
	customer_postal_code?: string | null;
	customer_country?: string | null;
	shipping_method?: string | null;
	payment_method?: string | null;
	shipping_cost?: number;
	coupon_code?: string | null;
	coupon_id?: string | null;
	discount_amount?: number;
	total_amount: number;
	status: OrderStatus;
	tracking_number?: string | null;
	shipping_date?: string | null;
	delivery_date?: string | null;
	created_at?: string;
	updated_at?: string;
	items?: OrderItem[];
	status_history?: OrderStatusHistory[];

	constructor(data: Order) {
		this.id = data.id;
		this.user_id = data.user_id ?? null;
		this.customer_name = data.customer_name;
		this.customer_email = data.customer_email;
		this.customer_address = data.customer_address;
		this.customer_phone = data.customer_phone;
		this.customer_city = data.customer_city;
		this.customer_postal_code = data.customer_postal_code;
		this.customer_country = data.customer_country;
		this.shipping_method = data.shipping_method;
		this.payment_method = data.payment_method;
		this.shipping_cost = data.shipping_cost;
		this.coupon_code = data.coupon_code;
		this.coupon_id = data.coupon_id;
		this.discount_amount = data.discount_amount;
		this.total_amount = data.total_amount;
		this.status = data.status;
		this.tracking_number = data.tracking_number;
		this.shipping_date = data.shipping_date;
		this.delivery_date = data.delivery_date;
		this.created_at = data.created_at;
		this.updated_at = data.updated_at;
		this.items = data.items;
		this.status_history = data.status_history;
	}

	// BUSINESS LOGIC: Validate order data
	validate(): void {
		if (!this.customer_name || this.customer_name.trim().length < 2) {
			throw new Error('Customer name must be at least 2 characters');
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(this.customer_email)) {
			throw new Error('Invalid email format');
		}

		if (this.total_amount < 0) {
			throw new Error('Total amount cannot be negative');
		}
	}

	// DATA ACCESS: Get all orders (static method)
	static async getAll(filters?: OrderFilters): Promise<OrderModel[]> {
		let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

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

		const orders = (data || []).map((item: any) => new OrderModel(item as Order));

		// Load items and history for each order
		for (const order of orders) {
			try {
				order.items = await this.getOrderItems(order.id);
				order.status_history = await this.getOrderStatusHistory(order.id);
			} catch (err) {
				console.warn(`Could not load items/history for order ${order.id}:`, err);
			}
		}

		return orders;
	}

	// DATA ACCESS: Get order by ID (static method)
	static async getById(id: string): Promise<OrderModel | null> {
		if (!id) throw new Error('Order ID is required');

		try {
			const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();

			if (error) {
				if (error.code === 'PGRST116') return null;
				throw new Error(`Failed to fetch order: ${error.message}`);
			}

			if (!data) return null;

			const order = new OrderModel(data as Order);
			order.items = await this.getOrderItems(id);
			order.status_history = await this.getOrderStatusHistory(id);

			return order;
		} catch (err: any) {
			console.error('Error in OrderModel.getById:', err);
			throw err;
		}
	}

	// DATA ACCESS: Get orders by user (static method)
	static async getByUser(userId: string): Promise<OrderModel[]> {
		if (!userId) throw new Error('User ID is required');
		return this.getAll({ userId });
	}

	// DATA ACCESS: Helper - Get order items
	private static async getOrderItems(orderId: string): Promise<OrderItem[]> {
		try {
			const { data, error } = await supabase
				.from('order_items')
				.select('*')
				.eq('order_id', orderId)
				.order('created_at', { ascending: true });

			if (error) {
				console.warn('Could not fetch order items:', error);
				return [];
			}

			return data || [];
		} catch (err) {
			console.warn('Error fetching order items:', err);
			return [];
		}
	}

	// DATA ACCESS: Helper - Get order status history
	private static async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
		try {
			const { data, error } = await supabase
				.from('order_status_history')
				.select('*')
				.eq('order_id', orderId)
				.order('created_at', { ascending: true });

			if (error) {
				console.warn('Could not fetch order status history:', error);
				return [];
			}

			return data || [];
		} catch (err) {
			console.warn('Error fetching order status history:', err);
			return [];
		}
	}

	// DATA ACCESS: Create order (static method)
	static async create(
		orderData: CreateOrderDTO,
		items: OrderItemInput[],
		userId?: string
	): Promise<OrderModel> {
		// BUSINESS LOGIC: Validate
		if (!orderData.customer_name) throw new Error('Customer name is required');
		if (!orderData.customer_email) throw new Error('Customer email is required');

		// BUSINESS LOGIC: Get cart items if not provided
		let orderItems: OrderItemInput[] = items;
		if (!items || items.length === 0) {
			const cartItems = await CartModel.getCartItems(userId);
			if (cartItems.length === 0) {
				throw new Error('Cart is empty');
			}

			orderItems = cartItems.map((item) => {
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
		}

		// BUSINESS LOGIC: Calculate total
		const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);
		const discountAmount = orderData.discount_amount || 0;
		const shippingCost = orderData.shipping_cost || 0;
		const totalAmount = subtotal - discountAmount + shippingCost;

		// DATA ACCESS: Create order
		const { data: order, error: orderError } = await supabase
			.from('orders')
			.insert({
				user_id: userId || orderData.user_id || null,
				customer_name: orderData.customer_name,
				customer_email: orderData.customer_email,
				customer_address: orderData.customer_address || null,
				customer_phone: orderData.customer_phone || null,
				customer_city: orderData.customer_city || null,
				customer_postal_code: orderData.customer_postal_code || null,
				customer_country: orderData.customer_country || null,
				shipping_method: orderData.shipping_method || null,
				payment_method: orderData.payment_method || null,
				shipping_cost: shippingCost,
				coupon_code: orderData.coupon_code || null,
				coupon_id: orderData.coupon_id || null,
				discount_amount: discountAmount,
				total_amount: totalAmount,
				status: 'pending'
			})
			.select()
			.single();

		if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);

		// DATA ACCESS: Create order items
		const orderItemsData = orderItems.map((item) => ({
			order_id: order.id,
			product_id: item.product_id,
			product_name: item.product_name,
			quantity: item.quantity,
			unit_price: item.unit_price,
			total_price: item.total_price
		}));

		const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);

		if (itemsError) {
			// Rollback: delete order
			await supabase.from('orders').delete().eq('id', order.id);
			throw new Error(`Failed to create order items: ${itemsError.message}`);
		}

		// BUSINESS LOGIC: Create sales records (for profit/loss tracking)
		// Stock is updated by database trigger on order_items
		for (const item of orderItems) {
			try {
				await SaleModel.create({
					product_id: item.product_id,
					user_id: userId || orderData.user_id || null,
					order_id: order.id,
					quantity: item.quantity,
					skipStockCheck: true // Stock already updated by trigger
				});
			} catch (error) {
				console.error(`Failed to create sale for product ${item.product_id}:`, error);
				// Continue - sale creation failure shouldn't break order
			}
		}

		// BUSINESS LOGIC: Clear cart after successful order
		try {
			await CartModel.clearCart(userId);
		} catch (error) {
			console.error('Failed to clear cart:', error);
			// Continue - cart clearing failure shouldn't break order
		}

		// Return complete order
		const completeOrder = await this.getById(order.id);
		if (!completeOrder) throw new Error('Failed to retrieve created order');
		return completeOrder;
	}

	// DATA ACCESS: Update order status (instance method)
	async updateStatus(
		status: OrderStatus,
		trackingNumber?: string,
		notes?: string,
		updatedBy?: string
	): Promise<OrderModel> {
		const previousStatus = this.status;
		const isCancelling = status === 'cancelled' && previousStatus !== 'cancelled';
		const wasCancelled = previousStatus === 'cancelled' && status !== 'cancelled';

		// BUSINESS LOGIC: If cancelling, restore stock and delete sales
		if (isCancelling) {
			for (const item of this.items || []) {
				try {
					const product = await ProductModel.getById(item.product_id);
					if (product) {
						await product.update({ stock: (product.stock || 0) + item.quantity });
					}
				} catch (error) {
					console.error(`Failed to restore stock for product ${item.product_id}:`, error);
				}
			}

			// Delete sales records
			try {
				const { SaleModel } = await import('./SaleModel');
				await SaleModel.deleteByOrderId(this.id);
			} catch (error) {
				console.error(`Failed to delete sales for order ${this.id}:`, error);
			}
		}

		// BUSINESS LOGIC: If reactivating cancelled order, reduce stock and create sales
		if (wasCancelled && status !== 'cancelled') {
			for (const item of this.items || []) {
				try {
					const product = await ProductModel.getById(item.product_id);
					if (product && product.isInStock(item.quantity)) {
						await product.update({ stock: (product.stock || 0) - item.quantity });

						const { SaleModel } = await import('./SaleModel');
						await SaleModel.create({
							product_id: item.product_id,
							user_id: this.user_id || null,
							order_id: this.id,
							quantity: item.quantity,
							skipStockCheck: true
						});
					}
				} catch (error) {
					console.error(`Failed to reactivate order item ${item.product_id}:`, error);
				}
			}
		}

		// DATA ACCESS: Update order
		const updateData: any = {
			status,
			updated_at: new Date().toISOString()
		};

		if (status === 'shipped') {
			updateData.shipping_date = new Date().toISOString();
		}

		if (status === 'delivered') {
			updateData.delivery_date = new Date().toISOString();
		}

		if (trackingNumber) {
			updateData.tracking_number = trackingNumber;
		}

		const { error: updateError } = await supabase
			.from('orders')
			.update(updateData)
			.eq('id', this.id);

		if (updateError) throw new Error(`Failed to update order status: ${updateError.message}`);

		// Add status history note if provided
		if (notes) {
			try {
				await supabase.from('order_status_history').insert({
					order_id: this.id,
					status,
					notes,
					updated_by: updatedBy || null
				});
			} catch (error) {
				console.error('Failed to add status history:', error);
			}
		}

		// Fetch updated order
		const updatedOrder = await OrderModel.getById(this.id);
		if (!updatedOrder) throw new Error('Failed to retrieve updated order');
		return updatedOrder;
	}

	// Convert to plain object (for compatibility)
	toJSON(): Order {
		return {
			id: this.id,
			user_id: this.user_id,
			customer_name: this.customer_name,
			customer_email: this.customer_email,
			customer_address: this.customer_address,
			customer_phone: this.customer_phone,
			customer_city: this.customer_city,
			customer_postal_code: this.customer_postal_code,
			customer_country: this.customer_country,
			shipping_method: this.shipping_method,
			payment_method: this.payment_method,
			shipping_cost: this.shipping_cost,
			coupon_code: this.coupon_code,
			coupon_id: this.coupon_id,
			discount_amount: this.discount_amount,
			total_amount: this.total_amount,
			status: this.status,
			tracking_number: this.tracking_number,
			shipping_date: this.shipping_date,
			delivery_date: this.delivery_date,
			created_at: this.created_at,
			updated_at: this.updated_at,
			items: this.items,
			status_history: this.status_history
		};
	}
}

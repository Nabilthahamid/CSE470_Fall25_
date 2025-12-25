// MODEL: Order data structure and types
export interface Order {
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
	total_amount: number;
	status: OrderStatus;
	created_at?: string;
	updated_at?: string;
	// Joined data
	items?: OrderItem[];
}

export interface OrderItem {
	id: string;
	order_id: string;
	product_id: string;
	product_name: string;
	quantity: number;
	unit_price: number;
	total_price: number;
	created_at?: string;
}

export type OrderStatus = 'completed' | 'pending' | 'cancelled';

export interface CreateOrderDTO {
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
	email_newsletter?: boolean;
}

export interface OrderRepository {
	getAll(filters?: OrderFilters): Promise<Order[]>;
	getById(id: string): Promise<Order | null>;
	getByUser(userId: string): Promise<Order[]>;
	create(orderData: CreateOrderDTO, items: OrderItemInput[]): Promise<Order>;
	updateStatus(id: string, status: OrderStatus): Promise<Order>;
}

export interface OrderFilters {
	userId?: string;
	status?: OrderStatus;
	startDate?: string;
	endDate?: string;
}

export interface OrderItemInput {
	product_id: string;
	product_name: string;
	quantity: number;
	unit_price: number;
}


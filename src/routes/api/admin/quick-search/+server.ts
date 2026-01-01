// API: Quick Search for Quick Actions Panel
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { productService } from '$lib/services/ProductService';
import { orderService } from '$lib/services/OrderService';
import { userService } from '$lib/services/UserService';
import { handleError } from '$lib/utils/errors';

export const GET: RequestHandler = async ({ url, locals }) => {
	requireAdmin(locals.user);

	try {
		const query = url.searchParams.get('q') || '';
		if (!query.trim()) {
			return json({ products: [], orders: [], users: [] });
		}

		const searchTerm = query.trim().toLowerCase();

		// Search products
		let products: any[] = [];
		try {
			const allProducts = await productService.getAllProducts();
			products = allProducts.filter(
				(p) =>
					p.name.toLowerCase().includes(searchTerm) ||
					p.description?.toLowerCase().includes(searchTerm) ||
					p.brand?.toLowerCase().includes(searchTerm)
			);
		} catch (error) {
			console.error('Product search error:', error);
		}

		// Search orders
		let orders: any[] = [];
		try {
			const allOrders = await orderService.getAllOrders();
			orders = allOrders.filter(
				(o) =>
					o.id.toLowerCase().includes(searchTerm) ||
					o.customer_name?.toLowerCase().includes(searchTerm) ||
					o.customer_email?.toLowerCase().includes(searchTerm) ||
					o.status?.toLowerCase().includes(searchTerm)
			);
		} catch (error) {
			console.error('Order search error:', error);
		}

		// Search users
		let users: any[] = [];
		try {
			const allUsers = await userService.getAllUsers();
			users = allUsers.filter(
				(u) =>
					u.name?.toLowerCase().includes(searchTerm) ||
					u.email.toLowerCase().includes(searchTerm)
			);
		} catch (error) {
			console.error('User search error:', error);
		}

		return json({
			products: products.slice(0, 5),
			orders: orders.slice(0, 5),
			users: users.slice(0, 5)
		});
	} catch (error) {
		const { message } = handleError(error);
		return json({ error: message }, { status: 500 });
	}
};


// API: Quick Search for Quick Actions Panel
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { ProductModel } from '$lib/models/ProductModel';
import { OrderModel } from '$lib/models/OrderModel';
import { UserModel } from '$lib/models/UserModel';
import { handleError } from '$lib/utils/errors';

export const GET: RequestHandler = async ({ url, locals }) => {
	requireAdmin(locals.user);

	try {
		const query = url.searchParams.get('q') || '';
		const searchTerm = query.trim().toLowerCase();

		// Search products
		let products: any[] = [];
		try {
			const allProductsModels = await ProductModel.getAll();
			const allProducts = allProductsModels.map(p => p.toJSON());
			
			if (searchTerm) {
				// Filter by search term
				products = allProducts.filter(
					(p) =>
						p.name.toLowerCase().includes(searchTerm) ||
						p.description?.toLowerCase().includes(searchTerm) ||
						p.brand?.toLowerCase().includes(searchTerm)
				);
			} else {
				// Return all products if no search term
				products = allProducts;
			}
		} catch (error) {
			console.error('Product search error:', error);
		}

		// Search orders
		let orders: any[] = [];
		try {
			const allOrdersModels = await OrderModel.getAll();
			const allOrders = allOrdersModels.map(o => o.toJSON());
			
			if (searchTerm) {
				orders = allOrders.filter(
					(o) =>
						o.id.toLowerCase().includes(searchTerm) ||
						o.customer_name?.toLowerCase().includes(searchTerm) ||
						o.customer_email?.toLowerCase().includes(searchTerm) ||
						o.status?.toLowerCase().includes(searchTerm)
				);
			} else {
				orders = allOrders;
			}
		} catch (error) {
			console.error('Order search error:', error);
		}

		// Search users
		let users: any[] = [];
		try {
			const allUsersModels = await UserModel.getAll();
			const allUsers = allUsersModels.map(u => u.toJSON());
			
			if (searchTerm) {
				users = allUsers.filter(
					(u) =>
						u.name?.toLowerCase().includes(searchTerm) ||
						u.email.toLowerCase().includes(searchTerm)
				);
			} else {
				users = allUsers;
			}
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


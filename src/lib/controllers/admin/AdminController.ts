// CONTROLLER: Admin dashboard controller
import { BaseController } from '../BaseController';
import { requireAdmin } from '$lib/utils/auth';
import { checkLowStockAndNotify, getAllNotifications, getUnreadCount, markAsRead, markAllAsRead } from '$lib/utils/notifications';
import { ProductModel } from '$lib/models/ProductModel';
import { OrderModel } from '$lib/models/OrderModel';
import { SaleModel } from '$lib/models/SaleModel';

export class AdminController extends BaseController {
	/**
	 * Load dashboard data
	 */
	async loadDashboard() {
		requireAdmin(this.getUser());

		try {
			// Check for low stock and create notifications (non-blocking)
			checkLowStockAndNotify().catch((err) => {
				console.error('Background low stock check failed:', err);
			});

			// Get notifications for the admin
			let notifications = [];
			let unreadCount = 0;

			try {
				notifications = await getAllNotifications(this.getUser()!.id, {
					is_read: false
				});
				unreadCount = await getUnreadCount(this.getUser()!.id);
			} catch (notifError) {
				console.error('Error loading notifications:', notifError);
				// Notifications table might not exist yet, continue with empty arrays
			}

			// Fetch dashboard statistics
			let stats = {
				totalProducts: 0,
				lowStockCount: 0,
				outOfStockCount: 0,
				totalOrders: 0,
				pendingOrders: 0,
				todayRevenue: 0,
				weekRevenue: 0,
				monthRevenue: 0,
				todayOrders: 0,
				weekOrders: 0,
				monthOrders: 0
			};

			try {
				// Get all products
				const productsModels = await ProductModel.getAll();
				const products = productsModels.map((p) => p.toJSON());
				stats.totalProducts = products.length;
				stats.lowStockCount = products.filter(p => p.stock > 0 && p.stock < 10).length;
				stats.outOfStockCount = products.filter(p => p.stock === 0).length;

				// Get all orders
				const ordersModels = await OrderModel.getAll();
				const orders = ordersModels.map((o) => o.toJSON());
				stats.totalOrders = orders.length;
				stats.pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;

				// Calculate date ranges
				const now = new Date();
				const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

				// Get sales for revenue calculation (exclude cancelled orders)
				const allSalesModels = await SaleModel.getAll(undefined, true);
				const allSales = allSalesModels.map((s) => s.toJSON());
				
				// Filter sales by date ranges
				const todaySales = allSales.filter(s => {
					const saleDate = new Date(s.created_at || '');
					return saleDate >= todayStart;
				});
				const weekSales = allSales.filter(s => {
					const saleDate = new Date(s.created_at || '');
					return saleDate >= weekStart;
				});
				const monthSales = allSales.filter(s => {
					const saleDate = new Date(s.created_at || '');
					return saleDate >= monthStart;
				});

				// Calculate revenue
				stats.todayRevenue = todaySales.reduce((sum, s) => sum + s.total_amount, 0);
				stats.weekRevenue = weekSales.reduce((sum, s) => sum + s.total_amount, 0);
				stats.monthRevenue = monthSales.reduce((sum, s) => sum + s.total_amount, 0);

				// Count orders by date ranges
				stats.todayOrders = orders.filter(o => {
					const orderDate = new Date(o.created_at || '');
					return orderDate >= todayStart;
				}).length;
				stats.weekOrders = orders.filter(o => {
					const orderDate = new Date(o.created_at || '');
					return orderDate >= weekStart;
				}).length;
				stats.monthOrders = orders.filter(o => {
					const orderDate = new Date(o.created_at || '');
					return orderDate >= monthStart;
				}).length;
			} catch (statsError) {
				console.error('Error loading dashboard statistics:', statsError);
				// Continue with default stats
			}

			return {
				user: this.getUser(),
				notifications,
				unreadCount,
				stats
			};
		} catch (error) {
			console.error('Error loading admin page:', error);
			return {
				user: this.getUser(),
				notifications: [],
				unreadCount: 0,
				stats: {
					totalProducts: 0,
					lowStockCount: 0,
					outOfStockCount: 0,
					totalOrders: 0,
					pendingOrders: 0,
					todayRevenue: 0,
					weekRevenue: 0,
					monthRevenue: 0,
					todayOrders: 0,
					weekOrders: 0,
					monthOrders: 0
				}
			};
		}
	}

	/**
	 * Mark notification as read
	 */
	async markNotificationRead() {
		requireAdmin(this.getUser());
		const formData = await this.getFormData();
		const notificationId = formData.get('id')?.toString();

		if (!notificationId) {
			return { error: 'Notification ID is required' };
		}

		try {
			await markAsRead(notificationId, this.getUser()!.id);
			return { success: true };
		} catch (error) {
			const { message } = this.handleError(error);
			return { error: message };
		}
	}

	/**
	 * Mark all notifications as read
	 */
	async markAllNotificationsRead() {
		requireAdmin(this.getUser());
		try {
			await markAllAsRead(this.getUser()!.id);
			return { success: true };
		} catch (error) {
			const { message } = this.handleError(error);
			return { error: message };
		}
	}
}


// CONTROLLER: Sales report page
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { saleService } from '$lib/services/SaleService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, url }) => {
	requireAdmin(locals.user);

	try {
		const startDate = url.searchParams.get('startDate') || undefined;
		const endDate = url.searchParams.get('endDate') || undefined;
		const productId = url.searchParams.get('productId') || undefined;

		const filters: any = {};
		if (startDate) filters.startDate = startDate;
		if (endDate) filters.endDate = endDate;
		if (productId) filters.productId = productId;

		const sales = await saleService.getAllSales(filters);

		return {
			sales,
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			sales: [],
			error: message
		};
	}
};

export const actions: Actions = {
	export: async ({ url }) => {
		const startDate = url.searchParams.get('startDate') || undefined;
		const endDate = url.searchParams.get('endDate') || undefined;
		const productId = url.searchParams.get('productId') || undefined;

		const filters: any = {};
		if (startDate) filters.startDate = startDate;
		if (endDate) filters.endDate = endDate;
		if (productId) filters.productId = productId;

		try {
			const csvContent = await saleService.exportSalesReport(filters);
			return {
				csvContent,
				filename: `sales-report-${new Date().toISOString().split('T')[0]}.csv`
			};
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	}
};


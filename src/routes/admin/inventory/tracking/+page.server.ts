// CONTROLLER: Inventory Tracking Page
import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { inventoryService } from '$lib/services/InventoryService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, url }) => {
	requireAdmin(locals.user);

	try {
		const productId = url.searchParams.get('productId') || undefined;
		const daysThreshold = parseInt(url.searchParams.get('daysThreshold') || '90');

		const [movementHistory, valuation, abcAnalysis, deadStock, stockAging] = await Promise.all([
			inventoryService.getStockMovementHistory(productId),
			inventoryService.getInventoryValuation(),
			inventoryService.getABCAnalysis(),
			inventoryService.getDeadStock(daysThreshold),
			inventoryService.getStockAgingReport()
		]);

		return {
			movementHistory,
			valuation,
			abcAnalysis,
			deadStock,
			stockAging,
			daysThreshold,
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			movementHistory: [],
			valuation: {
				totalCostValue: 0,
				totalRetailValue: 0,
				totalProducts: 0,
				byCategory: []
			},
			abcAnalysis: [],
			deadStock: [],
			stockAging: [],
			daysThreshold: 90,
			error: message
		};
	}
};


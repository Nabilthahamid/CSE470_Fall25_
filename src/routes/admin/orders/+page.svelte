<!-- VIEW: Admin orders management page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	export let params: Record<string, string> = {};

	let selectedOrderId = '';
	let selectedStatus = 'pending';
	let trackingNumber = '';
	let statusNotes = '';
	let showStatusModal = false;

	function getRiskBadgeClass(riskLevel: string): string {
		switch (riskLevel) {
			case 'high':
				return 'bg-red-100 text-red-700 border-red-300';
			case 'medium':
				return 'bg-yellow-100 text-yellow-700 border-yellow-300';
			case 'low':
				return 'bg-green-100 text-green-700 border-green-300';
			default:
				return 'bg-gray-100 text-gray-700 border-gray-300';
		}
	}
	
	// Advanced Filters
	let showFilters = false;
	let searchInput = data.searchQuery || '';
	let filterStartDate = data.filters?.startDate || '';
	let filterEndDate = data.filters?.endDate || '';

	function openStatusModal(orderId: string, currentStatus: string) {
		selectedOrderId = orderId;
		selectedStatus = currentStatus;
		trackingNumber = '';
		statusNotes = '';
		showStatusModal = true;
	}

	function closeStatusModal() {
		showStatusModal = false;
		selectedOrderId = '';
		selectedStatus = 'pending';
		trackingNumber = '';
		statusNotes = '';
	}

	function applyFilters() {
		const params = new URLSearchParams();
		
		if (data.currentFilter !== 'all') {
			params.set('status', data.currentFilter);
		}
		if (searchInput.trim()) {
			params.set('search', searchInput.trim());
		}
		if (filterStartDate) {
			params.set('startDate', filterStartDate);
		}
		if (filterEndDate) {
			params.set('endDate', filterEndDate);
		}
		
		const queryString = params.toString();
		goto(`/admin/orders${queryString ? '?' + queryString : ''}`);
	}

	function clearFilters() {
		searchInput = '';
		filterStartDate = '';
		filterEndDate = '';
		goto('/admin/orders');
	}

	function filterByStatus(status: string) {
		const params = new URLSearchParams();
		if (status !== 'all') {
			params.set('status', status);
		}
		if (searchInput.trim()) {
			params.set('search', searchInput.trim());
		}
		if (filterStartDate) {
			params.set('startDate', filterStartDate);
		}
		if (filterEndDate) {
			params.set('endDate', filterEndDate);
		}
		
		const queryString = params.toString();
		goto(`/admin/orders${queryString ? '?' + queryString : ''}`);
	}

	function exportOrders() {
		// Create CSV content
		const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Status', 'Total Amount', 'Created At', 'Tracking Number'];
		const rows = data.orders.map(order => [
			order.id,
			order.customer_name || 'N/A',
			order.customer_email || 'N/A',
			order.status,
			order.total_amount.toFixed(2),
			order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A',
			order.tracking_number || 'N/A'
		]);

		const csvContent = [
			headers.join(','),
			...rows.map(row => row.map(cell => `"${cell}"`).join(','))
		].join('\n');

		// Create and download file
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}


	function getStatusColor(status: string): string {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 border-yellow-300';
			case 'processing':
				return 'bg-blue-100 text-blue-800 border-blue-300';
			case 'shipped':
				return 'bg-purple-100 text-purple-800 border-purple-300';
			case 'delivered':
				return 'bg-green-100 text-green-800 border-green-300';
			case 'cancelled':
				return 'bg-red-100 text-red-800 border-red-300';
			case 'completed':
				return 'bg-gray-100 text-gray-800 border-gray-300';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-300';
		}
	}

	function formatDate(dateString?: string): string {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	$: if (form?.success) {
		closeStatusModal();
		// Reload page after a short delay
		setTimeout(() => {
			window.location.reload();
		}, 1000);
	}
</script>

<svelte:head>
	<title>Order Management - Admin Dashboard</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Order Management</h1>
		<button
			type="button"
			on:click={exportOrders}
			class="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
			</svg>
			Export CSV
		</button>
	</div>

	<!-- Advanced Search & Filter Panel -->
	<div class="bg-white rounded-lg shadow-md p-4 mb-6">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold text-gray-900">Search & Filter Orders</h2>
			<button
				type="button"
				on:click={() => showFilters = !showFilters}
				class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
				</svg>
				{showFilters ? 'Hide Filters' : 'Show Filters'}
			</button>
		</div>

		<!-- Search -->
		<div class="mb-4">
			<label for="orderSearch" class="block mb-2 font-medium text-sm text-gray-700">Search</label>
			<div class="flex gap-2">
				<input
					type="text"
					id="orderSearch"
					bind:value={searchInput}
					placeholder="Search by Order ID, Customer Name, Email, or Tracking Number..."
					class="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
					on:keydown={(e) => {
						if (e.key === 'Enter') {
							applyFilters();
						}
					}}
				/>
				<button
					type="button"
					on:click={applyFilters}
					class="bg-indigo-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer transition-colors hover:bg-indigo-700"
				>
					Search
				</button>
				<button
					type="button"
					on:click={clearFilters}
					class="bg-gray-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-700"
				>
					Clear
				</button>
			</div>
		</div>

		<!-- Advanced Filters (Collapsible) -->
		{#if showFilters}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
				<div>
					<label for="filterStartDate" class="block mb-2 font-medium text-sm text-gray-700">Order Date From</label>
					<input
						type="date"
						id="filterStartDate"
						bind:value={filterStartDate}
						class="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
					/>
				</div>
				<div>
					<label for="filterEndDate" class="block mb-2 font-medium text-sm text-gray-700">Order Date To</label>
					<input
						type="date"
						id="filterEndDate"
						bind:value={filterEndDate}
						class="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
					/>
				</div>
			</div>
		{/if}
	</div>

	<!-- Status Filter -->
	<div class="bg-white rounded-lg shadow-md p-4 mb-6">
		<div class="flex flex-wrap gap-2">
			<button
				type="button"
				on:click={() => filterByStatus('all')}
				class="px-4 py-2 rounded-lg font-semibold transition-colors {data.currentFilter === 'all'
					? 'bg-indigo-600 text-white'
					: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
			>
				All Orders
			</button>
			<button
				type="button"
				on:click={() => filterByStatus('pending')}
				class="px-4 py-2 rounded-lg font-semibold transition-colors {data.currentFilter === 'pending'
					? 'bg-yellow-600 text-white'
					: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
			>
				Pending
			</button>
			<button
				type="button"
				on:click={() => filterByStatus('processing')}
				class="px-4 py-2 rounded-lg font-semibold transition-colors {data.currentFilter === 'processing'
					? 'bg-blue-600 text-white'
					: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
			>
				Processing
			</button>
			<button
				type="button"
				on:click={() => filterByStatus('shipped')}
				class="px-4 py-2 rounded-lg font-semibold transition-colors {data.currentFilter === 'shipped'
					? 'bg-purple-600 text-white'
					: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
			>
				Shipped
			</button>
			<button
				type="button"
				on:click={() => filterByStatus('delivered')}
				class="px-4 py-2 rounded-lg font-semibold transition-colors {data.currentFilter === 'delivered'
					? 'bg-green-600 text-white'
					: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
			>
				Delivered
			</button>
			<button
				type="button"
				on:click={() => filterByStatus('cancelled')}
				class="px-4 py-2 rounded-lg font-semibold transition-colors {data.currentFilter === 'cancelled'
					? 'bg-red-600 text-white'
					: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
			>
				Cancelled
			</button>
		</div>
	</div>

	<!-- Error Message -->
	{#if form?.error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
			<p class="text-red-800">{form.error}</p>
		</div>
	{/if}

	<!-- Success Message -->
	{#if form?.success}
		<div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
			<p class="text-green-800">{form.message}</p>
		</div>
	{/if}

	<!-- Results Count -->
	<div class="mb-4 text-sm text-gray-600">
		Showing {data.orders.length} {data.orders.length === 1 ? 'order' : 'orders'}
		{#if data.searchQuery || data.filters?.startDate || data.filters?.endDate}
			(matching filters)
		{/if}
	</div>

	<!-- Orders List -->
	{#if data.orders && data.orders.length > 0}
		<div class="space-y-4">
			{#each data.orders as order}
				<div class="bg-white rounded-lg shadow-md overflow-hidden">
					<!-- Order Header -->
					<div class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
						<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<div>
								<div class="flex items-center gap-3 mb-2 flex-wrap">
									<h3 class="text-lg font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
									<span class="px-3 py-1 rounded-full text-sm font-semibold border-2 {getStatusColor(order.status)}">
										{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
									</span>
									{#if data.orderRiskScores && data.orderRiskScores[order.id]}
										{@const riskScore = data.orderRiskScores[order.id]}
										<span class="px-3 py-1 rounded-full text-xs font-semibold border {getRiskBadgeClass(riskScore.riskLevel)}" title="Risk Score: {Math.round(riskScore.riskScore * 100)}%">
											⚠️ {riskScore.riskLevel.toUpperCase()} RISK
										</span>
									{/if}
								</div>
								<p class="text-sm text-gray-600">Placed on {formatDate(order.created_at)}</p>
								<p class="text-sm text-gray-600">Customer: {order.customer_name} ({order.customer_email})</p>
								{#if data.orderRiskScores && data.orderRiskScores[order.id]}
									{@const riskScore = data.orderRiskScores[order.id]}
									{#if riskScore.factors && riskScore.factors.length > 0}
										<div class="mt-2 text-xs text-gray-500">
											<span class="font-semibold">Risk factors:</span> {riskScore.factors.join(', ')}
										</div>
									{/if}
								{/if}
							</div>
							<div class="text-right">
								<p class="text-2xl font-bold text-indigo-600">Tk {order.total_amount.toFixed(2)}</p>
								{#if order.tracking_number}
									<p class="text-sm text-gray-600 mt-1">Tracking: {order.tracking_number}</p>
								{/if}
							</div>
						</div>
					</div>

					<!-- Order Details -->
					<div class="p-6">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
							<!-- Order Items -->
							<div>
								<h4 class="font-semibold text-gray-900 mb-3">Order Items</h4>
								<div class="space-y-2">
									{#each order.items || [] as item}
										<div class="flex justify-between text-sm py-2 border-b border-gray-100">
											<span class="text-gray-700">{item.product_name} (×{item.quantity})</span>
											<span class="font-semibold text-gray-900">Tk {item.total_price.toFixed(2)}</span>
										</div>
									{/each}
								</div>
							</div>

							<!-- Shipping Info -->
							<div>
								<h4 class="font-semibold text-gray-900 mb-3">Shipping Information</h4>
								<div class="text-sm space-y-1 text-gray-700">
									{#if order.customer_phone}
										<p><span class="font-semibold">Phone:</span> {order.customer_phone}</p>
									{/if}
									{#if order.customer_address}
										<p><span class="font-semibold">Address:</span> {order.customer_address}</p>
									{/if}
									{#if order.shipping_method}
										<p><span class="font-semibold">Method:</span> {order.shipping_method}</p>
									{/if}
									{#if order.payment_method}
										<p><span class="font-semibold">Payment:</span> {order.payment_method}</p>
									{/if}
								</div>
							</div>
						</div>

						<!-- Actions -->
						<div class="flex gap-3 pt-4 border-t border-gray-200">
							<button
								type="button"
								on:click={() => openStatusModal(order.id, order.status)}
								class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm"
							>
								Update Status
							</button>
							<a
								href="/orders/{order.id}"
								target="_blank"
								class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold text-sm"
							>
								View Details
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow-md p-12 text-center">
			<svg class="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
			</svg>
			<h3 class="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
			<p class="text-gray-600">No orders match the current filter.</p>
		</div>
	{/if}
</div>

<!-- Status Update Modal -->
{#if showStatusModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
		role="dialog"
		aria-modal="true"
		aria-labelledby="status-modal-title"
		tabindex="-1"
		on:click={closeStatusModal}
		on:keydown={(e) => e.key === 'Escape' && closeStatusModal()}
	>
		<div
			class="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4"
			role="document"
			on:click|stopPropagation
			on:keydown|stopPropagation
		>
			<form method="POST" action="?/updateStatus" use:enhance class="p-6">
				<h2 id="status-modal-title" class="text-2xl font-bold text-gray-900 mb-4">Update Order Status</h2>

				<input type="hidden" name="order_id" value={selectedOrderId} />

				<div class="mb-4">
					<label for="status" class="block mb-2 font-medium text-gray-900">Status</label>
					<select
						id="status"
						name="status"
						bind:value={selectedStatus}
						class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
					>
						<option value="pending">Pending</option>
						<option value="processing">Processing</option>
						<option value="shipped">Shipped</option>
						<option value="delivered">Delivered</option>
						<option value="cancelled">Cancelled</option>
						<option value="completed">Completed</option>
					</select>
				</div>

				<div class="mb-4">
					<label for="tracking_number" class="block mb-2 font-medium text-gray-900">
						Tracking Number (Optional)
					</label>
					<input
						type="text"
						id="tracking_number"
						name="tracking_number"
						bind:value={trackingNumber}
						placeholder="Enter tracking number"
						class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
					/>
				</div>

				<div class="mb-6">
					<label for="notes" class="block mb-2 font-medium text-gray-900">Notes (Optional)</label>
					<textarea
						id="notes"
						name="notes"
						bind:value={statusNotes}
						rows="3"
						placeholder="Add any notes about this status change..."
						class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
					></textarea>
				</div>

				<div class="flex gap-3">
					<button
						type="submit"
						class="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
					>
						Update Status
					</button>
					<button
						type="button"
						on:click={closeStatusModal}
						class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}


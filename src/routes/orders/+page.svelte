<!-- VIEW: Customer orders tracking page -->
<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	export let data: PageData;
	// params not used - suppress warning
	// export let params: Record<string, string> = {};

	let searchOrderId = '';

	function getStatusColor(status: string): string {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'processing':
				return 'bg-blue-100 text-blue-800';
			case 'shipped':
				return 'bg-purple-100 text-purple-800';
			case 'delivered':
				return 'bg-green-100 text-green-800';
			case 'cancelled':
				return 'bg-red-100 text-red-800';
			case 'completed':
				return 'bg-gray-100 text-gray-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function getStatusIcon(status: string): string {
		switch (status) {
			case 'pending':
				return '⏳';
			case 'processing':
				return '⚙️';
			case 'shipped':
				return '📦';
			case 'delivered':
				return '✅';
			case 'cancelled':
				return '❌';
			case 'completed':
				return '✓';
			default:
				return '📋';
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

	function trackOrder() {
		if (searchOrderId.trim()) {
			goto(`/orders/${searchOrderId.trim()}`);
		}
	}
</script>

<svelte:head>
	<title>My Orders - TinyTech</title>
</svelte:head>

<div class="max-w-7xl mx-auto p-8">
	<h1 class="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

	<!-- Order Search -->
	<div class="bg-white rounded-lg shadow-md p-6 mb-8">
		<h2 class="text-xl font-semibold text-gray-900 mb-4">Track Your Order</h2>
		<div class="flex gap-3">
			<input
				type="text"
				bind:value={searchOrderId}
				placeholder="Enter Order ID"
				class="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
				on:keydown={(e) => e.key === 'Enter' && trackOrder()}
			/>
			<button
				type="button"
				on:click={trackOrder}
				class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
			>
				Track Order
			</button>
		</div>
	</div>

	<!-- Orders List -->
	{#if data.error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
			<p class="text-red-800">{data.error}</p>
		</div>
	{/if}

	{#if data.orders && data.orders.length > 0}
		<div class="space-y-6">
			{#each data.orders as order}
				<div class="bg-white rounded-lg shadow-md overflow-hidden">
					<!-- Order Header -->
					<div class="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
						<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<div>
								<div class="flex items-center gap-3 mb-2">
									<h3 class="text-lg font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
									<span class="px-3 py-1 rounded-full text-sm font-semibold {getStatusColor(order.status)}">
										{getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
									</span>
								</div>
								<p class="text-sm text-gray-600">Placed on {formatDate(order.created_at)}</p>
							</div>
							<div class="text-right">
								<p class="text-2xl font-bold text-indigo-600">Tk {order.total_amount.toFixed(2)}</p>
								{#if order.tracking_number}
									<p class="text-sm text-gray-600 mt-1">Tracking: {order.tracking_number}</p>
								{/if}
							</div>
						</div>
					</div>

					<!-- Order Items -->
					<div class="p-6">
						<h4 class="font-semibold text-gray-900 mb-4">Order Items</h4>
						<div class="space-y-3">
							{#each order.items || [] as item}
								{@const itemReturn = (order.returnRequests || []).find((r) => r.product_id === item.product_id)}
								<div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
									<div class="flex-1">
										<p class="font-medium text-gray-900">{item.product_name}</p>
										<p class="text-sm text-gray-600">Quantity: {item.quantity} × Tk {item.unit_price.toFixed(2)}</p>
										{#if itemReturn}
											<div class="mt-1">
												<span class="px-2 py-1 rounded text-xs font-semibold {itemReturn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : itemReturn.status === 'approved' ? 'bg-blue-100 text-blue-800' : itemReturn.status === 'refunded' ? 'bg-green-100 text-green-800' : itemReturn.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}">
													Return: {itemReturn.status.charAt(0).toUpperCase() + itemReturn.status.slice(1)}
												</span>
											</div>
										{/if}
									</div>
									<p class="font-semibold text-gray-900">Tk {item.total_price.toFixed(2)}</p>
								</div>
							{/each}
						</div>

						<!-- Shipping Info -->
						<div class="mt-6 pt-6 border-t border-gray-200">
							<h4 class="font-semibold text-gray-900 mb-3">Shipping Information</h4>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								<div>
									<p class="text-gray-600">Name:</p>
									<p class="font-medium text-gray-900">{order.customer_name}</p>
								</div>
								<div>
									<p class="text-gray-600">Email:</p>
									<p class="font-medium text-gray-900">{order.customer_email}</p>
								</div>
								{#if order.customer_phone}
									<div>
										<p class="text-gray-600">Phone:</p>
										<p class="font-medium text-gray-900">{order.customer_phone}</p>
									</div>
								{/if}
								{#if order.customer_address}
									<div>
										<p class="text-gray-600">Address:</p>
										<p class="font-medium text-gray-900">{order.customer_address}</p>
									</div>
								{/if}
							</div>
						</div>

						<!-- Status Timeline -->
						{#if order.status_history && order.status_history.length > 0}
							<div class="mt-6 pt-6 border-t border-gray-200">
								<h4 class="font-semibold text-gray-900 mb-4">Order Status Timeline</h4>
								<div class="space-y-4">
									{#each order.status_history as history, index}
										<div class="flex gap-4">
											<div class="flex flex-col items-center">
												<div class="w-3 h-3 rounded-full {index === order.status_history.length - 1 ? 'bg-indigo-600' : 'bg-gray-300'}"></div>
												{#if index < order.status_history.length - 1}
													<div class="w-0.5 h-8 bg-gray-300"></div>
												{/if}
											</div>
											<div class="flex-1 pb-4">
												<div class="flex items-center gap-2 mb-1">
													<span class="px-2 py-1 rounded text-xs font-semibold {getStatusColor(history.status)}">
														{getStatusIcon(history.status)} {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
													</span>
													<span class="text-xs text-gray-500">{formatDate(history.created_at)}</span>
												</div>
												{#if history.notes}
													<p class="text-sm text-gray-600">{history.notes}</p>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Actions -->
						<div class="mt-6 pt-6 border-t border-gray-200 flex gap-3">
							<a
								href="/orders/{order.id}"
								class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm"
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
			<h3 class="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
			<p class="text-gray-600 mb-6">You haven't placed any orders yet.</p>
			<a
				href="/products"
				class="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
			>
				Start Shopping
			</a>
		</div>
	{/if}
</div>


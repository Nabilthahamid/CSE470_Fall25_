<!-- VIEW: Single order tracking page -->
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	export let params: { id: string };

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

	function formatDate(dateString?: string): string {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Order #{data.order.id.slice(0, 8)} - TinyTech</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-8">
	<div class="mb-6">
		<a href="/orders" class="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2">
			← Back to Orders
		</a>
	</div>

	<div class="bg-white rounded-lg shadow-md overflow-hidden">
		<!-- Order Header -->
		<div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-6">
			<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 class="text-2xl font-bold mb-2">Order #{data.order.id.slice(0, 8)}</h1>
					<p class="text-indigo-100">Placed on {formatDate(data.order.created_at)}</p>
				</div>
				<div class="text-right">
					<span class="px-4 py-2 bg-white bg-opacity-20 rounded-lg text-sm font-semibold">
						{data.order.status.charAt(0).toUpperCase() + data.order.status.slice(1)}
					</span>
					<p class="text-3xl font-bold mt-2">Tk {data.order.total_amount.toFixed(2)}</p>
				</div>
			</div>
		</div>

		<div class="p-6">
			<!-- Order Items -->
			<div class="mb-8">
				<h2 class="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
				<div class="space-y-3">
					{#each data.order.items || [] as item}
						<div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
							<div>
								<p class="font-semibold text-gray-900">{item.product_name}</p>
								<p class="text-sm text-gray-600">Quantity: {item.quantity} × Tk {item.unit_price.toFixed(2)}</p>
							</div>
							<p class="text-lg font-bold text-gray-900">Tk {item.total_price.toFixed(2)}</p>
						</div>
					{/each}
				</div>
			</div>

			<!-- Status Timeline -->
			{#if data.order.status_history && data.order.status_history.length > 0}
				<div class="mb-8">
					<h2 class="text-xl font-bold text-gray-900 mb-4">Order Status Timeline</h2>
					<div class="space-y-4">
						{#each data.order.status_history as history, index}
							<div class="flex gap-4">
								<div class="flex flex-col items-center">
									<div class="w-4 h-4 rounded-full {index === data.order.status_history.length - 1 ? 'bg-indigo-600 ring-4 ring-indigo-200' : 'bg-gray-300'}"></div>
									{#if index < data.order.status_history.length - 1}
										<div class="w-0.5 h-12 bg-gray-300"></div>
									{/if}
								</div>
								<div class="flex-1 pb-4">
									<div class="flex items-center gap-3 mb-2">
										<span class="px-3 py-1 rounded-lg text-sm font-semibold {getStatusColor(history.status)}">
											{history.status.charAt(0).toUpperCase() + history.status.slice(1)}
										</span>
										<span class="text-sm text-gray-500">{formatDate(history.created_at)}</span>
									</div>
									{#if history.notes}
										<p class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{history.notes}</p>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Shipping Information -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<h2 class="text-xl font-bold text-gray-900 mb-4">Shipping Information</h2>
					<div class="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
						<p><span class="font-semibold text-gray-700">Name:</span> {data.order.customer_name}</p>
						<p><span class="font-semibold text-gray-700">Email:</span> {data.order.customer_email}</p>
						{#if data.order.customer_phone}
							<p><span class="font-semibold text-gray-700">Phone:</span> {data.order.customer_phone}</p>
						{/if}
						{#if data.order.customer_address}
							<p><span class="font-semibold text-gray-700">Address:</span> {data.order.customer_address}</p>
						{/if}
						{#if data.order.tracking_number}
							<p><span class="font-semibold text-gray-700">Tracking Number:</span> 
								<span class="font-mono text-indigo-600">{data.order.tracking_number}</span>
							</p>
						{/if}
					</div>
				</div>

				<div>
					<h2 class="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
					<div class="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-gray-700">Subtotal:</span>
							<span class="font-semibold">Tk {(data.order.total_amount - (data.order.shipping_cost || 0)).toFixed(2)}</span>
						</div>
						{#if data.order.shipping_cost}
							<div class="flex justify-between">
								<span class="text-gray-700">Shipping:</span>
								<span class="font-semibold">Tk {data.order.shipping_cost.toFixed(2)}</span>
							</div>
						{/if}
						<div class="flex justify-between pt-2 border-t border-gray-300">
							<span class="font-bold text-gray-900">Total:</span>
							<span class="font-bold text-indigo-600">Tk {data.order.total_amount.toFixed(2)}</span>
						</div>
						{#if data.order.shipping_date}
							<p class="text-xs text-gray-500 mt-2">Shipped: {formatDate(data.order.shipping_date)}</p>
						{/if}
						{#if data.order.delivery_date}
							<p class="text-xs text-gray-500">Delivered: {formatDate(data.order.delivery_date)}</p>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>


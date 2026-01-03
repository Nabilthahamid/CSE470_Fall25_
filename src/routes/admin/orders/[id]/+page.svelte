<!-- VIEW: Admin order details page -->
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	export let params: { id: string };
	
	// Make returnRequests reactive to data changes
	$: returnRequests = data.returnRequests || [];

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

	function getReturnStatusColor(status: string): string {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'approved':
				return 'bg-blue-100 text-blue-800';
			case 'rejected':
				return 'bg-red-100 text-red-800';
			case 'refunded':
				return 'bg-green-100 text-green-800';
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

	function formatText(text: string): string {
		return text.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
	}

	function getReturnRequestForItem(item: any) {
		return returnRequests.find((r: any) => r.product_id === item.product_id);
	}

	// Calculate return statistics
	$: totalRefundAmount = returnRequests
		.filter((r: any) => r.refund_amount && (r.status === 'refunded' || r.status === 'completed'))
		.reduce((sum: number, r: any) => sum + (r.refund_amount || 0), 0);

	$: pendingReturns = returnRequests.filter((r: any) => r.status === 'pending');
	$: approvedReturns = returnRequests.filter((r: any) => r.status === 'approved');
	$: refundedReturns = returnRequests.filter((r: any) => r.status === 'refunded' || r.status === 'completed');
</script>

<svelte:head>
	<title>Order #{data.order.id.slice(0, 8)} - Admin - TinyTech</title>
</svelte:head>

<div class="max-w-5xl mx-auto p-6">
	<div class="mb-6">
		<a href="/admin/orders" class="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2">
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
					{#if data.order.user_id}
						<p class="text-indigo-100 text-sm mt-1">User ID: {data.order.user_id}</p>
					{/if}
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
			<!-- Returns Summary (if any returns exist) -->
			{#if returnRequests.length > 0}
				<div class="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
					<div class="flex items-center justify-between mb-3">
						<h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
							<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
							</svg>
							Return Requests ({returnRequests.length})
						</h2>
						<div class="flex gap-2 text-sm">
							{#if pendingReturns.length > 0}
								<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-semibold">
									{pendingReturns.length} Pending
								</span>
							{/if}
							{#if approvedReturns.length > 0}
								<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
									{approvedReturns.length} Approved
								</span>
							{/if}
							{#if refundedReturns.length > 0}
								<span class="px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">
									{refundedReturns.length} Refunded
								</span>
							{/if}
						</div>
					</div>
					{#if totalRefundAmount > 0}
						<p class="text-sm text-gray-700">
							<strong>Total Refunded:</strong> <span class="text-green-600 font-bold">Tk {totalRefundAmount.toFixed(2)}</span>
						</p>
					{/if}
				</div>
			{/if}

			<!-- Order Items -->
			<div class="mb-8">
				<h2 class="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
				<div class="space-y-3">
					{#each data.order.items || [] as item}
						{@const returnRequest = getReturnRequestForItem(item)}
						<div class="flex items-center justify-between p-4 rounded-lg {returnRequest ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}">
							<div class="flex-1">
								<div class="flex items-center gap-2 mb-1">
									<p class="font-semibold text-gray-900">{item.product_name}</p>
									{#if returnRequest}
										<span class="px-2 py-1 rounded text-xs font-semibold {getReturnStatusColor(returnRequest.status)}">
											{returnRequest.status.charAt(0).toUpperCase() + returnRequest.status.slice(1)}
										</span>
									{/if}
								</div>
								<p class="text-sm text-gray-600">Quantity: {item.quantity} × Tk {item.unit_price.toFixed(2)}</p>
								<p class="text-xs text-gray-500 mt-1">Product ID: {item.product_id}</p>
								{#if returnRequest}
									<div class="mt-2 space-y-1">
										<p class="text-xs text-gray-600">
											<strong>Return Reason:</strong> {formatText(returnRequest.reason)}
										</p>
										{#if returnRequest.notes}
											<p class="text-xs text-gray-600">
												<strong>Customer Notes:</strong> {returnRequest.notes}
											</p>
										{/if}
										{#if returnRequest.refund_amount}
											<p class="text-xs font-semibold text-green-600">
												Refund Amount: Tk {returnRequest.refund_amount.toFixed(2)}
											</p>
										{/if}
										{#if returnRequest.admin_notes}
											<p class="text-xs text-gray-600 italic">
												Admin Notes: {returnRequest.admin_notes}
											</p>
										{/if}
									</div>
								{/if}
							</div>
							<div class="flex items-center gap-3">
								<div class="text-right">
									<p class="text-lg font-bold text-gray-900">Tk {item.total_price.toFixed(2)}</p>
									{#if returnRequest && returnRequest.refund_amount}
										<p class="text-sm text-green-600 font-semibold">
											- Tk {returnRequest.refund_amount.toFixed(2)}
										</p>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Returns Details Section -->
			{#if returnRequests.length > 0}
				<div class="mb-8">
					<h2 class="text-xl font-bold text-gray-900 mb-4">Return Details</h2>
					<div class="space-y-4">
						{#each returnRequests as returnRequest}
							{@const item = data.order.items ? data.order.items.find((i) => i.product_id === returnRequest.product_id) : null}
							<div class="bg-white border-2 border-gray-200 rounded-lg p-4">
								<div class="flex items-start justify-between mb-3">
									<div class="flex-1">
										<div class="flex items-center gap-3 mb-2">
											<h3 class="font-semibold text-gray-900">{item?.product_name || 'Product'}</h3>
											<span class="px-3 py-1 rounded-lg text-sm font-semibold {getReturnStatusColor(returnRequest.status)}">
												{returnRequest.status.charAt(0).toUpperCase() + returnRequest.status.slice(1)}
											</span>
										</div>
										<div class="grid grid-cols-2 gap-2 text-sm text-gray-600">
											<p><strong>Quantity:</strong> {returnRequest.quantity}</p>
											<p><strong>Reason:</strong> {formatText(returnRequest.reason)}</p>
											{#if returnRequest.refund_amount}
												<p><strong>Refund Amount:</strong> <span class="text-green-600 font-bold">Tk {returnRequest.refund_amount.toFixed(2)}</span></p>
											{/if}
											{#if returnRequest.refund_method}
												<p><strong>Refund Method:</strong> {formatText(returnRequest.refund_method)}</p>
											{/if}
										</div>
										{#if returnRequest.notes}
											<p class="text-sm text-gray-600 mt-2">
												<strong>Customer Notes:</strong> {returnRequest.notes}
											</p>
										{/if}
										{#if returnRequest.admin_notes}
											<p class="text-sm text-gray-600 mt-2 italic">
												<strong>Admin Notes:</strong> {returnRequest.admin_notes}
											</p>
										{/if}
									</div>
									<div class="text-right text-xs text-gray-500">
										<p>Requested: {formatDate(returnRequest.created_at)}</p>
										{#if returnRequest.updated_at && returnRequest.updated_at !== returnRequest.created_at}
											<p>Updated: {formatDate(returnRequest.updated_at)}</p>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

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
						{#if data.order.customer_city}
							<p><span class="font-semibold text-gray-700">City:</span> {data.order.customer_city}</p>
						{/if}
						{#if data.order.customer_postal_code}
							<p><span class="font-semibold text-gray-700">Postal Code:</span> {data.order.customer_postal_code}</p>
						{/if}
						{#if data.order.customer_country}
							<p><span class="font-semibold text-gray-700">Country:</span> {data.order.customer_country}</p>
						{/if}
						{#if data.order.shipping_method}
							<p><span class="font-semibold text-gray-700">Shipping Method:</span> {formatText(data.order.shipping_method)}</p>
						{/if}
						{#if data.order.payment_method}
							<p><span class="font-semibold text-gray-700">Payment Method:</span> {formatText(data.order.payment_method)}</p>
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
						{#if data.order.discount_amount && data.order.discount_amount > 0}
							<div class="flex justify-between text-green-600">
								<span>Discount:</span>
								<span class="font-semibold">- Tk {data.order.discount_amount.toFixed(2)}</span>
							</div>
						{/if}
						{#if totalRefundAmount > 0}
							<div class="flex justify-between text-red-600 pt-2 border-t border-gray-300">
								<span class="font-semibold">Refunds:</span>
								<span class="font-bold">- Tk {totalRefundAmount.toFixed(2)}</span>
							</div>
						{/if}
						<div class="flex justify-between pt-2 border-t border-gray-300">
							<span class="font-bold text-gray-900">Total:</span>
							<span class="font-bold text-indigo-600">Tk {data.order.total_amount.toFixed(2)}</span>
						</div>
						{#if totalRefundAmount > 0}
							<div class="flex justify-between pt-2 border-t-2 border-gray-400">
								<span class="font-bold text-gray-900">Amount After Refunds:</span>
								<span class="font-bold text-green-600">Tk {(data.order.total_amount - totalRefundAmount).toFixed(2)}</span>
							</div>
						{/if}
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


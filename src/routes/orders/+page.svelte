<script lang="ts">
	import { Package, Truck, CheckCircle, Clock, XCircle, User, X } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data, form }: { data: PageData; form: any } = $props();

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(price);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'pending':
				return Clock;
			case 'processing':
				return Package;
			case 'shipped':
				return Truck;
			case 'delivered':
				return CheckCircle;
			case 'cancelled':
				return XCircle;
			default:
				return Package;
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'processing':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			case 'shipped':
				return 'bg-purple-100 text-purple-800 border-purple-200';
			case 'delivered':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'cancelled':
				return 'bg-red-100 text-red-800 border-red-200';
			default:
				return 'bg-slate-100 text-slate-800 border-slate-200';
		}
	}

	function getStatusLabel(status: string) {
		return status.charAt(0).toUpperCase() + status.slice(1);
	}
</script>

<svelte:head>
	<title>My Orders - TinyShop</title>
	<meta name="description" content="View your order history and track your purchases" />
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<div class="container mx-auto px-4 py-8 md:px-6 md:py-12">
		<header class="mb-8">
			<h1 class="text-3xl font-bold text-slate-900 md:text-4xl">My Orders</h1>
			<p class="mt-2 text-slate-600">Track and manage your orders</p>
		</header>

		<!-- Customer Information Card -->
		<div class="mb-8 rounded-lg bg-white p-6 shadow-sm border border-slate-200">
			<div class="flex items-center gap-3 mb-4">
				<User class="h-5 w-5 text-slate-600" />
				<h2 class="text-lg font-semibold text-slate-900">Customer Information</h2>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
				<div>
					<span class="text-slate-600">Email:</span>
					<span class="ml-2 font-medium text-slate-900">{data.orders[0]?.customer.email || data.user.email}</span>
				</div>
				<div>
					<span class="text-slate-600">Name:</span>
					<span class="ml-2 font-medium text-slate-900">
						{data.orders[0]?.customer.full_name || 'Not provided'}
					</span>
				</div>
			</div>
		</div>

		<!-- Orders List -->
		{#if data.orders && data.orders.length > 0}
			<div class="space-y-6">
				{#each data.orders as order (order.id)}
					{@const StatusIcon = getStatusIcon(order.status)}
					<div class="rounded-lg bg-white shadow-sm border border-slate-200 overflow-hidden">
						<!-- Order Header -->
						<div class="bg-slate-50 border-b border-slate-200 px-6 py-4">
							<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
								<div class="flex items-center gap-4">
									<div>
										<p class="text-sm text-slate-600">Order ID</p>
										<p class="font-mono text-sm font-medium text-slate-900">
											{order.id.substring(0, 8)}...
										</p>
									</div>
									<div>
										<p class="text-sm text-slate-600">Order Date</p>
										<p class="text-sm font-medium text-slate-900">
											{formatDate(order.created_at)}
										</p>
									</div>
								</div>
								<div class="flex items-center gap-4">
									<div class="text-right">
										<p class="text-sm text-slate-600">Total Amount</p>
										<p class="text-lg font-bold text-slate-900">
											{formatPrice(order.total_amount)}
										</p>
									</div>
									<div class="flex items-center gap-2 rounded-full border px-4 py-2 {getStatusColor(order.status)}">
										<StatusIcon class="h-4 w-4" />
										<span class="text-sm font-semibold">
											{getStatusLabel(order.status)}
										</span>
									</div>
									{#if order.status === 'pending'}
										<form
											method="POST"
											action="?/cancelOrder"
											use:enhance={async ({ result, update, cancel }) => {
												if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
													cancel();
													return;
												}
												
												// Update the form state
												await update();
												
												// Log result for debugging
												console.log('Cancel order result:', result);
												
												// Check if cancellation was successful
												// SvelteKit actions return 'success' when no fail() is called
												// or 'failure' when fail() is called
												if (result.type === 'success') {
													console.log('Order cancelled successfully, refreshing page...');
													// Invalidate all to refresh the page data
													await invalidateAll();
													
													// Force a page reload to ensure fresh data is displayed
													setTimeout(() => {
														window.location.reload();
													}, 300);
												} else if (result.type === 'failure') {
													console.error('Order cancellation failed:', result.data);
													// Error will be shown via form.error in the template
												}
											}}
										>
											<input type="hidden" name="orderId" value={order.id} />
											<button
												type="submit"
												class="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
											>
												<X class="h-4 w-4" />
												Cancel Order
											</button>
										</form>
									{/if}
								</div>
							</div>
						</div>

						<!-- Success/Error Messages -->
						{#if form?.error}
							<div class="mx-6 mt-4 rounded-lg bg-red-50 border border-red-200 p-4">
								<p class="text-sm text-red-700">{form.error}</p>
							</div>
						{/if}
						{#if form?.success && form?.orderId === order.id}
							<div class="mx-6 mt-4 rounded-lg bg-green-50 border border-green-200 p-4">
								<p class="text-sm text-green-700">{form.message || 'Order cancelled successfully'}</p>
							</div>
						{/if}
						
						<!-- Debug info (remove in production) -->
						{#if form && order.status === 'pending'}
							<div class="mx-6 mt-2 text-xs text-slate-400">
								Debug: form exists = {form ? 'yes' : 'no'}, form.success = {form?.success ? 'yes' : 'no'}
							</div>
						{/if}

						<!-- Order Items -->
						<div class="px-6 py-4">
							<h3 class="mb-4 text-sm font-semibold text-slate-900 uppercase tracking-wide">
								Order Items ({order.items.length})
							</h3>
							<div class="space-y-4">
								{#each order.items as item (item.id)}
									<div class="flex items-center gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
										<!-- Product Image -->
										{#if item.product.image_url}
											<img
												src={item.product.image_url}
												alt={item.product.name}
												class="h-16 w-16 rounded-lg object-cover border border-slate-200"
											/>
										{:else}
											<div
												class="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 border border-slate-200"
											>
												<Package class="h-8 w-8 text-slate-400" />
											</div>
										{/if}

										<!-- Product Details -->
										<div class="flex-1 min-w-0">
											<h4 class="font-medium text-slate-900 truncate">
												{item.product.name}
											</h4>
											{#if item.product.description}
												<p class="mt-1 text-sm text-slate-600 line-clamp-2">
													{item.product.description}
												</p>
											{/if}
											<div class="mt-2 flex items-center gap-4 text-sm text-slate-600">
												<span>Quantity: <span class="font-medium text-slate-900">{item.quantity}</span></span>
												<span>Price: <span class="font-medium text-slate-900">{formatPrice(item.price_at_purchase)}</span></span>
											</div>
										</div>

										<!-- Item Total -->
										<div class="text-right">
											<p class="text-sm text-slate-600">Item Total</p>
											<p class="text-lg font-semibold text-slate-900">
												{formatPrice(item.quantity * item.price_at_purchase)}
											</p>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="rounded-lg bg-white border border-slate-200 p-12 text-center shadow-sm">
				<Package class="mx-auto h-12 w-12 text-slate-400 mb-4" />
				<p class="text-lg font-medium text-slate-900 mb-2">No orders yet</p>
				<p class="text-sm text-slate-600 mb-6">
					You haven't placed any orders yet. Start shopping to see your orders here.
				</p>
				<a
					href="/shop"
					class="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
				>
					<Package class="h-4 w-4" />
					Browse Products
				</a>
			</div>
		{/if}
	</div>
</div>

<script lang="ts">
	import { enhance } from "$app/forms";
	import {
		Package,
		Truck,
		CheckCircle,
		Clock,
		XCircle,
		User,
		ArrowLeft,
		ChevronDown,
	} from "lucide-svelte";
	import type { PageData } from "./$types";

	let { data, form }: { data: PageData; form: any } = $props();
	let updatingOrder = $state<string | null>(null);

	function formatPrice(price: number): string {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(price);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case "pending":
				return Clock;
			case "processing":
				return Package;
			case "shipped":
				return Truck;
			case "delivered":
				return CheckCircle;
			case "cancelled":
				return XCircle;
			default:
				return Package;
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "processing":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "shipped":
				return "bg-purple-100 text-purple-800 border-purple-200";
			case "delivered":
				return "bg-green-100 text-green-800 border-green-200";
			case "cancelled":
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-slate-100 text-slate-800 border-slate-200";
		}
	}

	function getStatusLabel(status: string) {
		return status.charAt(0).toUpperCase() + status.slice(1);
	}

	// Enhanced form submission handler
	function handleFormSubmit() {
		return async ({ result, update }: any) => {
			await update();
			if (result.type === "success") {
				updatingOrder = null;
			}
		};
	}
</script>

<svelte:head>
	<title>Manage Orders - Admin - TinyShop</title>
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<!-- Header -->
	<header class="border-b border-slate-200 bg-white">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<a href="/admin" class="text-slate-600 hover:text-slate-900">
						<ArrowLeft class="h-5 w-5" />
					</a>
					<h1 class="text-xl font-bold text-slate-900">Manage Orders</h1>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="container mx-auto px-4 py-8">
		<!-- Success/Error Messages -->
		{#if form?.success}
			<div class="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
				<p class="text-sm text-green-800">
					{form.message || "Operation successful"}
				</p>
			</div>
		{/if}

		{#if form?.error}
			<div class="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
				<p class="text-sm text-red-800">{form.error}</p>
			</div>
		{/if}

		<!-- Orders List -->
		{#if data.orders && data.orders.length > 0}
			<div class="space-y-6">
				{#each data.orders as order (order.id)}
					{@const StatusIcon = getStatusIcon(order.status)}
					<div class="rounded-lg bg-white shadow-sm border border-slate-200 overflow-hidden">
						<!-- Order Header -->
						<div class="bg-slate-50 border-b border-slate-200 px-6 py-4">
							<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
								<div class="flex flex-wrap items-center gap-4">
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
									<div>
										<p class="text-sm text-slate-600">Customer</p>
										<p class="text-sm font-medium text-slate-900">
											{order.customer.email}
										</p>
										{#if order.customer.full_name}
											<p class="text-xs text-slate-500">
												{order.customer.full_name}
											</p>
										{/if}
									</div>
								</div>
								<div class="flex items-center gap-4">
									<div class="text-right">
										<p class="text-sm text-slate-600">Total Amount</p>
										<p class="text-lg font-bold text-slate-900">
											{formatPrice(order.total_amount)}
										</p>
									</div>
									<div class="flex items-center gap-2">
										<form
											method="POST"
											action="?/updateStatus"
											use:enhance={handleFormSubmit}
											class="flex items-center gap-2"
										>
											<input type="hidden" name="orderId" value={order.id} />
											<select
												name="status"
												onchange={(e) => {
													if (e.currentTarget.value !== order.status) {
														updatingOrder = order.id;
														e.currentTarget.form?.requestSubmit();
													}
												}}
												class="rounded-full border px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 {getStatusColor(order.status)}"
												disabled={updatingOrder === order.id}
											>
												<option value="pending" selected={order.status === "pending"}>
													Pending
												</option>
												<option
													value="processing"
													selected={order.status === "processing"}
												>
													Processing
												</option>
												<option value="shipped" selected={order.status === "shipped"}>
													Shipped
												</option>
												<option
													value="delivered"
													selected={order.status === "delivered"}
												>
													Delivered
												</option>
												<option
													value="cancelled"
													selected={order.status === "cancelled"}
												>
													Cancelled
												</option>
											</select>
										</form>
									</div>
								</div>
							</div>
						</div>

						<!-- Order Items -->
						<div class="px-6 py-4">
							<h3 class="mb-4 text-sm font-semibold text-slate-900 uppercase tracking-wide">
								Order Items ({order.items.length})
							</h3>
							<div class="space-y-4">
								{#each order.items as item (item.id)}
									<div
										class="flex items-center gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
									>
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
												<span
													>Quantity: <span class="font-medium text-slate-900"
														>{item.quantity}</span
													></span
												>
												<span
													>Price: <span class="font-medium text-slate-900"
														>{formatPrice(item.price_at_purchase)}</span
													></span
												>
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
				<p class="text-sm text-slate-600">
					No orders have been placed yet. Orders will appear here once customers
					start shopping.
				</p>
			</div>
		{/if}
	</main>
</div>

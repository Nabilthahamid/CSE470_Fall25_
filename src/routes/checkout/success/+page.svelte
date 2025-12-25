<!-- VIEW: Checkout success page -->
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	export let params = {};
</script>

<svelte:head>
	<title>Order Successful - Shop</title>
</svelte:head>

<div class="max-w-3xl mx-auto p-8 text-center">
	{#if data.error || !data.order}
		<div class="bg-red-50 text-red-700 p-6 rounded-lg border border-red-200">
			<h1 class="text-2xl font-bold mb-2">Error</h1>
			<p>{data.error || 'Order not found'}</p>
		</div>
	{:else}
		<div class="bg-white/5 p-8 rounded-lg border border-white/10">
			<div class="mb-6">
				<div class="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg
						class="w-12 h-12 text-white"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						></path>
					</svg>
				</div>
				<h1 class="text-3xl font-bold mb-2">Order Successful!</h1>
				<p class="text-gray-400">Thank you for your purchase</p>
			</div>

			<div class="bg-white/5 p-6 rounded-lg mb-6 text-left">
				<h2 class="mb-4 text-xl font-semibold">Order Details</h2>
				<div class="space-y-2">
					<p><strong>Order ID:</strong> #{data.order.id.substring(0, 8).toUpperCase()}</p>
					<p><strong>Customer:</strong> {data.order.customer_name}</p>
					<p><strong>Email:</strong> {data.order.customer_email}</p>
					<p><strong>Total:</strong> <span class="text-indigo-400 font-bold">${data.order.total_amount.toFixed(2)}</span></p>
					{#if data.order.created_at}
						<p>
							<strong>Date:</strong>
							{new Date(data.order.created_at).toLocaleDateString()}
						</p>
					{/if}
				</div>
			</div>

			<div class="bg-blue-50 text-blue-700 p-4 rounded-lg mb-6 border border-blue-200">
				<p>
					An invoice has been sent to your email address at
					<strong>{data.order.customer_email}</strong>
				</p>
			</div>

			<div class="flex gap-4 justify-center">
				<a
					href="/"
					class="inline-block px-6 py-3 bg-indigo-600 text-white no-underline rounded-lg transition-colors hover:bg-indigo-700"
				>
					Continue Shopping
				</a>
				<a
					href="/"
					class="inline-block px-6 py-3 bg-gray-600 text-white no-underline rounded-lg transition-colors hover:bg-gray-700"
				>
					Go Home
				</a>
			</div>
		</div>
	{/if}
</div>


<script lang="ts">
	import { formatCurrency } from '$lib/utils/formatCurrency';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Order Confirmation - Tinytech</title>
</svelte:head>

<div class="container mx-auto px-4 py-16">
	<div class="max-w-2xl mx-auto text-center">
		<div class="mb-8">
			<div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
				<svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
			</div>
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
			<p class="text-gray-600">Thank you for your order. We'll send you a confirmation email shortly.</p>
		</div>

		<div class="bg-white rounded-lg shadow-md p-6 mb-8 text-left">
			<div class="flex justify-between items-center mb-4 pb-4 border-b">
				<span class="text-gray-600">Order Number:</span>
				<span class="font-semibold text-gray-900">#{data.order.id.slice(0, 8)}</span>
			</div>
			<div class="flex justify-between items-center mb-4 pb-4 border-b">
				<span class="text-gray-600">Total Amount:</span>
				<span class="text-xl font-bold text-gray-900">{formatCurrency(parseFloat(data.order.total))}</span>
			</div>
			<div class="flex justify-between items-center">
				<span class="text-gray-600">Status:</span>
				<span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium capitalize">
					{data.order.status}
				</span>
			</div>
		</div>

		<div class="flex gap-4 justify-center">
			<a
				href="/"
				class="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors font-medium"
			>
				Continue Shopping
			</a>
			<a
				href="/orders"
				class="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium"
			>
				View Orders
			</a>
		</div>
	</div>
</div>


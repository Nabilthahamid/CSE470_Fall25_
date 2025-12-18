<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { formatCurrency } from '$lib/utils/formatCurrency';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="max-w-4xl mx-auto">
	<h1 class="text-3xl font-bold mb-8">Shopping Cart</h1>

	{#if data.cart.items.length === 0}
		<div class="text-center py-16">
			<p class="text-gray-500 mb-4">Your cart is empty</p>
			<a href="/products">
				<Button variant="primary">Continue Shopping</Button>
			</a>
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow-md p-6">
			<!-- Cart Items -->
			<div class="space-y-4 mb-6">
				{#each data.cart.items as item (item.productId)}
					<div class="flex items-center gap-4 border-b pb-4">
						<div class="flex-1">
							<h3 class="font-semibold">{item.product?.name}</h3>
							<p class="text-gray-600">
								{formatCurrency(parseFloat(item.product?.price || '0'))} x {item.quantity}
							</p>
						</div>
						<p class="font-semibold">
							{formatCurrency(parseFloat(item.product?.price || '0') * item.quantity)}
						</p>
					</div>
				{/each}
			</div>

			<!-- Cart Summary -->
			<div class="border-t pt-4 space-y-2">
				<div class="flex justify-between">
					<span>Subtotal:</span>
					<span>{formatCurrency(data.cart.subtotal)}</span>
				</div>
				<div class="flex justify-between">
					<span>Tax:</span>
					<span>{formatCurrency(data.cart.tax)}</span>
				</div>
				<div class="flex justify-between text-xl font-bold pt-2 border-t">
					<span>Total:</span>
					<span>{formatCurrency(data.cart.total)}</span>
				</div>
			</div>

			<div class="mt-6">
				<Button variant="primary" size="lg" class="w-full">Proceed to Checkout</Button>
			</div>
		</div>
	{/if}
</div>


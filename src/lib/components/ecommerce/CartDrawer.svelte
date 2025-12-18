<script lang="ts">
	import Button from '../ui/Button.svelte';
	import { formatCurrency } from '$lib/utils/formatCurrency';
	import type { Product } from '$lib/server/models/products';

	interface CartItem {
		product: Product;
		quantity: number;
	}

	interface CartDrawerProps {
		open?: boolean;
		items?: CartItem[];
		total?: number;
		onClose?: () => void;
		onRemoveItem?: (productId: string) => void;
		onUpdateQuantity?: (productId: string, quantity: number) => void;
		onCheckout?: () => void;
	}

	let {
		open = $bindable(false),
		items = [],
		total = 0,
		onClose,
		onRemoveItem,
		onUpdateQuantity,
		onCheckout
	}: CartDrawerProps = $props();
</script>

{#if open}
	<!-- Backdrop -->
	<div class="fixed inset-0 bg-black bg-opacity-50 z-40" on:click={onClose}></div>

	<!-- Drawer -->
	<div class="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
		<!-- Header -->
		<div class="p-4 border-b flex items-center justify-between">
			<h2 class="text-xl font-semibold">Shopping Cart</h2>
			<button on:click={onClose} class="text-gray-500 hover:text-gray-700">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Items -->
		<div class="flex-1 overflow-y-auto p-4">
			{#if items.length === 0}
				<div class="text-center text-gray-500 py-8">Your cart is empty</div>
			{:else}
				<div class="space-y-4">
					{#each items as item (item.product.id)}
						<div class="flex gap-4 border-b pb-4">
							{#if item.product.imageUrl}
								<img
									src={item.product.imageUrl}
									alt={item.product.name}
									class="w-20 h-20 object-cover rounded"
								/>
							{:else}
								<div class="w-20 h-20 bg-gray-200 rounded"></div>
							{/if}
							<div class="flex-1">
								<h4 class="font-medium">{item.product.name}</h4>
								<p class="text-sm text-gray-600">{formatCurrency(parseFloat(item.product.price))}</p>
								<div class="flex items-center gap-2 mt-2">
									<button
										class="w-6 h-6 rounded border flex items-center justify-center"
										on:click={() => onUpdateQuantity?.(item.product.id, item.quantity - 1)}
									>
										-
									</button>
									<span>{item.quantity}</span>
									<button
										class="w-6 h-6 rounded border flex items-center justify-center"
										on:click={() => onUpdateQuantity?.(item.product.id, item.quantity + 1)}
									>
										+
									</button>
									<button
										class="ml-auto text-red-600 text-sm"
										on:click={() => onRemoveItem?.(item.product.id)}
									>
										Remove
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Footer -->
		{#if items.length > 0}
			<div class="p-4 border-t">
				<div class="flex justify-between text-lg font-semibold mb-4">
					<span>Total:</span>
					<span>{formatCurrency(total)}</span>
				</div>
				<Button variant="primary" class="w-full" on:click={onCheckout}>
					Checkout
				</Button>
			</div>
		{/if}
	</div>
{/if}


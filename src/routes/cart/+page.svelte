<script lang="ts">
	import { formatCurrency } from '$lib/utils/formatCurrency';
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	let couponCode = $state('');
	let showNotification = $state(false);
	let notificationMessage = $state('');

	// Show notification if item was just added (passed via URL params)
	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		if (params.get('added') === 'true') {
			showNotification = true;
			const productName = params.get('product') || 'Product';
			notificationMessage = `"${productName}" has been added to your cart.`;
		}
	});

	function closeNotification() {
		showNotification = false;
	}

	function continueShopping() {
		window.location.href = '/';
	}

	function handleQuantityChange(productId: string, currentQty: number, delta: number) {
		const newQty = Math.max(0, currentQty + delta);
		if (newQty === 0) {
			// Remove item if quantity becomes 0
			const form = document.createElement('form');
			form.method = 'POST';
			form.action = '?/removeItem';
			const input = document.createElement('input');
			input.type = 'hidden';
			input.name = 'productId';
			input.value = productId;
			form.appendChild(input);
			document.body.appendChild(form);
			form.submit();
		} else {
			// Update quantity
			const form = document.createElement('form');
			form.method = 'POST';
			form.action = '?/updateQuantity';
			const productIdInput = document.createElement('input');
			productIdInput.type = 'hidden';
			productIdInput.name = 'productId';
			productIdInput.value = productId;
			const quantityInput = document.createElement('input');
			quantityInput.type = 'hidden';
			quantityInput.name = 'quantity';
			quantityInput.value = newQty.toString();
			form.appendChild(productIdInput);
			form.appendChild(quantityInput);
			document.body.appendChild(form);
			form.submit();
		}
	}

	function applyCoupon() {
		// TODO: Implement coupon functionality
		alert('Coupon functionality coming soon!');
	}

	function updateCart() {
		window.location.reload();
	}
</script>

<svelte:head>
	<title>Cart - Tinytech</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-8">Checkout</h1>

	<!-- Notification Bar -->
	{#if showNotification}
		<div class="bg-gray-100 border border-gray-300 rounded-md p-4 mb-6 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span class="text-xl">🔔</span>
				<p class="text-gray-800">{notificationMessage}</p>
			</div>
			<button
				type="button"
				onclick={() => continueShopping()}
				class="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
			>
				Continue shopping
			</button>
		</div>
	{/if}

	{#if data.cart.items.length === 0}
		<div class="text-center py-16">
			<p class="text-gray-500 mb-4">Your cart is empty</p>
			<a href="/" class="inline-block bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors">
				Continue Shopping
			</a>
		</div>
	{:else}
		<!-- Cart Table -->
		<div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
			<table class="w-full">
				<thead class="bg-gray-50 border-b">
					<tr>
						<th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Product</th>
						<th class="px-6 py-4 text-center text-sm font-medium text-gray-700">Quantity</th>
						<th class="px-6 py-4 text-right text-sm font-medium text-gray-700">Subtotal</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each data.cart.items as item (item.productId)}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4">
								<div class="flex items-center gap-4">
									{#if item.product?.imageUrl && !item.product.imageUrl.startsWith('data:application/pdf')}
										<img
											src={item.product.imageUrl}
											alt={item.product.name}
											class="w-16 h-16 object-cover rounded"
										/>
									{:else}
										<div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
											<span class="text-gray-400 text-xs">No Image</span>
										</div>
									{/if}
									<div>
										<h3 class="font-medium text-gray-900">{item.product?.name}</h3>
										<p class="text-sm text-gray-600">{formatCurrency(parseFloat(item.product?.price || '0'))}</p>
									</div>
								</div>
							</td>
							<td class="px-6 py-4 text-center">
								<div class="flex items-center justify-center gap-2">
									<button
										type="button"
										onclick={() => handleQuantityChange(item.productId, item.quantity, -1)}
										class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
									>
										−
									</button>
									<span class="w-12 text-center font-medium">{item.quantity}</span>
									<button
										type="button"
										onclick={() => handleQuantityChange(item.productId, item.quantity, 1)}
										class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
									>
										+
									</button>
								</div>
							</td>
							<td class="px-6 py-4 text-right">
								<div class="flex items-center justify-end gap-4">
									<span class="font-medium">{formatCurrency(parseFloat(item.product?.price || '0') * item.quantity)}</span>
									<form method="POST" action="?/removeItem" use:enhance>
										<input type="hidden" name="productId" value={item.productId} />
										<button
											type="submit"
											class="text-gray-400 hover:text-red-600 transition-colors"
											title="Remove item"
										>
											🗑️
										</button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Coupon and Actions Row -->
		<div class="flex items-center justify-between mb-6">
			<!-- Coupon Code -->
			<div class="flex items-center gap-2">
				<input
					type="text"
					bind:value={couponCode}
					placeholder="Coupon code"
					class="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-black"
				/>
				<button
					type="button"
					onclick={applyCoupon}
					class="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
				>
					Apply coupon
				</button>
			</div>

			<!-- Update Cart Button -->
			<button
				type="button"
				onclick={updateCart}
				class="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
			>
				Update cart
			</button>
		</div>

		<!-- Proceed to Checkout -->
		<div class="flex justify-end">
			<a
				href="/checkout"
				class="bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition-colors font-medium"
			>
				Proceed to Checkout →
			</a>
		</div>
	{/if}
</div>

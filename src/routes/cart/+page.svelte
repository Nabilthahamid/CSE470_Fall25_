<!-- VIEW: Cart page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	export let params = {};
</script>

<svelte:head>
	<title>Cart - Shop</title>
</svelte:head>

<div class="max-w-7xl mx-auto p-8">
	<h1 class="mb-8 text-3xl font-bold">Shopping Cart</h1>

	{#if data.error}
		<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">
			{data.error}
		</div>
	{/if}

	{#if form?.error}
		<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">
			{form.error}
		</div>
	{/if}

	{#if data.cartItems.length === 0}
		<div class="text-center p-12">
			<p class="text-gray-400 mb-4 text-lg">Your cart is empty</p>
			<a
				href="/"
				class="inline-block px-6 py-3 bg-indigo-600 text-white no-underline rounded-lg transition-colors hover:bg-indigo-700"
			>
				Browse Products
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<div class="lg:col-span-2">
				<div class="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
					<div class="divide-y divide-white/10">
						{#each data.cartItems as item (item.id)}
							<div class="p-6 flex gap-4">
								{#if item.product?.image_url}
									<img
										src={item.product.image_url}
										alt={item.product.name}
										class="w-24 h-24 object-cover rounded-lg"
									/>
								{/if}
								<div class="flex-1">
									<h3 class="m-0 mb-2 text-xl font-semibold">
										{item.product?.name || 'Unknown Product'}
									</h3>
									<p class="text-gray-400 text-sm mb-4">
										{item.product?.description || 'No description'}
									</p>
									<p class="text-indigo-400 text-lg font-bold mb-4">
										${item.product?.price.toFixed(2) || '0.00'}
									</p>
									<div class="flex items-center gap-4">
										<form method="POST" action="?/update" use:enhance class="flex items-center gap-2">
											<input type="hidden" name="item_id" value={item.id} />
											<label class="text-sm">Qty:</label>
											<input
												type="number"
												name="quantity"
												value={item.quantity}
												min="1"
												max={item.product?.stock || 1}
												class="w-20 p-2 border-2 border-white/10 rounded bg-white/5 text-base"
											/>
											<button
												type="submit"
												class="bg-indigo-600 text-white border-none px-4 py-2 rounded cursor-pointer text-sm transition-colors hover:bg-indigo-700"
											>
												Update
											</button>
										</form>
										<form method="POST" action="?/remove" use:enhance>
											<input type="hidden" name="item_id" value={item.id} />
											<button
												type="submit"
												class="bg-red-600 text-white border-none px-4 py-2 rounded cursor-pointer text-sm transition-colors hover:bg-red-700"
											>
												Remove
											</button>
										</form>
									</div>
								</div>
								<div class="text-right">
									<p class="text-xl font-bold">
										${((item.product?.price || 0) * item.quantity).toFixed(2)}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<div class="lg:col-span-1">
				<div class="bg-white/5 p-6 rounded-lg border border-white/10 sticky top-8">
					<h2 class="mb-4 text-xl font-semibold">Order Summary</h2>
					<div class="mb-4 pb-4 border-b border-white/10">
						<div class="flex justify-between mb-2">
							<span>Subtotal:</span>
							<span>${data.total.toFixed(2)}</span>
						</div>
						<div class="flex justify-between">
							<span>Total:</span>
							<span class="text-xl font-bold text-indigo-400">${data.total.toFixed(2)}</span>
						</div>
					</div>
					<a
						href="/checkout"
						class="block w-full text-center bg-green-600 text-white px-6 py-3 rounded-lg no-underline transition-colors hover:bg-green-700"
					>
						Proceed to Checkout
					</a>
					<a
						href="/"
						class="block w-full text-center mt-3 text-indigo-400 no-underline hover:underline"
					>
						Continue Shopping
					</a>
				</div>
			</div>
		</div>
	{/if}
</div>


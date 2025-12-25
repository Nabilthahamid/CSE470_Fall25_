<!-- VIEW: Cart page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
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
				<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
					<div class="divide-y divide-gray-200">
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
									<h3 class="m-0 mb-2 text-xl font-semibold text-gray-900">
										{item.product?.name || 'Unknown Product'}
									</h3>
									<p class="text-gray-600 text-sm mb-4">
										{item.product?.description || 'No description'}
									</p>
									<p class="text-indigo-600 text-lg font-bold mb-4">
										Tk {item.product?.price.toFixed(2) || '0.00'}
									</p>
									<div class="flex items-center gap-4">
										<form method="POST" action="?/update" use:enhance class="flex items-center gap-2">
											<input type="hidden" name="item_id" value={item.id} />
											<label for="quantity-{item.id}" class="text-sm">Qty:</label>
											<input
												id="quantity-{item.id}"
												type="number"
												name="quantity"
												value={item.quantity}
												min="1"
												max={item.product?.stock || 1}
												class="w-20 p-2 border-2 border-gray-300 rounded bg-white text-base"
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
									<p class="text-xl font-bold text-gray-900">
										Tk {((item.product?.price || 0) * item.quantity).toFixed(2)}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<div class="lg:col-span-1">
				<div class="bg-white p-6 rounded-lg border border-gray-200 sticky top-8">
					<h2 class="mb-4 text-xl font-semibold text-gray-900">Order Summary</h2>
					<div class="mb-4 pb-4 border-b border-gray-200">
						<div class="flex justify-between mb-2 text-gray-700">
							<span>Subtotal:</span>
							<span>Tk {data.total.toFixed(2)}</span>
						</div>
						<div class="flex justify-between text-gray-900">
							<span>Total:</span>
							<span class="text-xl font-bold text-indigo-600">Tk {data.total.toFixed(2)}</span>
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
						class="block w-full text-center mt-3 text-indigo-600 no-underline hover:underline"
					>
						Continue Shopping
					</a>
				</div>
			</div>
		</div>
	{/if}
</div>


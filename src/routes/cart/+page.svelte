<!-- VIEW: Cart page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { PageData, ActionData } from './$types';
	import { toast } from '$lib/stores/toast';

	export let data: PageData;
	export let form: ActionData;
	export let params: Record<string, string> = {} as any;

	onMount(() => {
		// Show toast notifications based on URL params or form results
		if (data.success) {
			toast.success(data.success);
		}
		if (data.error) {
			toast.error(data.error);
		}
		if (data.errorMessage) {
			toast.error(data.errorMessage);
		}
		if (form?.success) {
			toast.success('Cart updated successfully!');
		}
		if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

<svelte:head>
	<title>Cart - TinyTech</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
			<p class="text-gray-600">
				{data.cartItems.length} {data.cartItems.length === 1 ? 'item' : 'items'} in your cart
			</p>
		</div>

		{#if data.errorMessage}
			<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border-l-4 border-red-500 shadow-sm">
				<div class="flex items-center">
					<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
					</svg>
					{data.errorMessage}
				</div>
			</div>
		{/if}

		{#if form?.error}
			<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border-l-4 border-red-500 shadow-sm">
				<div class="flex items-center">
					<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
					</svg>
					{form.error}
				</div>
			</div>
		{/if}

		{#if data.cartItems.length === 0}
			<div class="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md mx-auto">
				<div class="mb-6">
					<svg class="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
					</svg>
				</div>
				<h2 class="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
				<p class="text-gray-600 mb-8">Start adding products to see them here</p>
				<a
					href="/"
					class="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white no-underline rounded-lg transition-all hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
					</svg>
					Browse Products
				</a>
			</div>
		{:else}
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<!-- Cart Items -->
				<div class="lg:col-span-2 space-y-4">
					<div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
						<div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
							<h2 class="text-xl font-bold text-white m-0">Cart Items</h2>
						</div>
						<div class="divide-y divide-gray-100">
							{#each data.cartItems as item (item.id)}
								<div class="p-6 hover:bg-gray-50 transition-colors">
									<div class="flex gap-6">
										<!-- Product Image -->
										{#if item.product?.image_url}
											<a href="/products/{item.product.id}" class="flex-shrink-0 group">
												<div class="w-28 h-28 rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-indigo-400 transition-all shadow-md group-hover:shadow-lg">
													<img
														src={item.product.image_url}
														alt={item.product.name}
														class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
													/>
												</div>
											</a>
										{:else}
											<div class="w-28 h-28 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-200 flex items-center justify-center">
												<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
												</svg>
											</div>
										{/if}
										
										<!-- Product Details -->
										<div class="flex-1 min-w-0">
											<a href="/products/{item.product?.id}" class="block hover:text-indigo-600 transition-colors">
												<h3 class="m-0 mb-2 text-xl font-bold text-gray-900 line-clamp-2">
													{item.product?.name || 'Unknown Product'}
												</h3>
											</a>
											{#if item.product?.brand}
												<p class="text-sm text-indigo-600 font-semibold mb-2">{item.product.brand}</p>
											{/if}
											<p class="text-gray-600 text-sm mb-4 line-clamp-2">
												{item.product?.description || 'No description available'}
											</p>
											
											<!-- Price and Quantity Controls -->
											<div class="flex items-center justify-between flex-wrap gap-4">
												<div class="flex items-center gap-6">
													<div>
														<p class="text-sm text-gray-500 mb-1">Unit Price</p>
														<p class="text-lg font-bold text-indigo-600 m-0">
															Tk {item.product?.price.toFixed(2) || '0.00'}
														</p>
													</div>
													<div class="h-12 w-px bg-gray-200"></div>
													<div>
														<p class="text-sm text-gray-500 mb-1">Total</p>
														<p class="text-xl font-bold text-gray-900 m-0">
															Tk {((item.product?.price || 0) * item.quantity).toFixed(2)}
														</p>
													</div>
												</div>
												
												<div class="flex items-center gap-3">
													<form method="POST" action="?/update" use:enhance={({ update }) => {
														return async ({ result, update: updateFn }) => {
															if (updateFn) {
																await updateFn();
															} else if (update) {
																await update();
															}
															if (result.type === 'success') {
																toast.success('Quantity updated successfully!');
															} else if (result.type === 'failure') {
																toast.error(result.data?.error || 'Failed to update quantity');
															}
														};
													}} class="flex items-center gap-2">
														<input type="hidden" name="item_id" value={item.id} />
														<label for="quantity-{item.id}" class="text-sm font-medium text-gray-700">Qty:</label>
														<div class="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
															<button
																type="button"
																class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
																on:click={(e) => {
																	e.preventDefault();
																	const form = e.currentTarget.closest('form');
																	const input = form?.querySelector(`#quantity-${item.id}`);
																	if (input && input instanceof HTMLInputElement) {
																		const currentValue = parseInt(input.value) || 1;
																		if (currentValue > 1) {
																			input.value = (currentValue - 1).toString();
																			form?.requestSubmit();
																		}
																	}
																}}
															>
																<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
																</svg>
															</button>
															<input
																id="quantity-{item.id}"
																type="number"
																name="quantity"
																value={item.quantity}
																min="1"
																max={item.product?.stock || 999}
																class="w-16 p-2 text-center border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-base font-semibold"
																on:change={(e) => {
																	const form = e.currentTarget.form;
																	const value = parseInt(e.currentTarget.value) || 1;
																	const max = parseInt(e.currentTarget.max) || 999;
																	if (value < 1) {
																		e.currentTarget.value = '1';
																	} else if (value > max) {
																		e.currentTarget.value = max.toString();
																	}
																	if (form) {
																		form.requestSubmit();
																	}
																}}
																on:blur={(e) => {
																	const value = parseInt(e.currentTarget.value) || 1;
																	if (value < 1) {
																		e.currentTarget.value = '1';
																		e.currentTarget.form?.requestSubmit();
																	}
																}}
															/>
															<button
																type="button"
																class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
																on:click={(e) => {
																	e.preventDefault();
																	const form = e.currentTarget.closest('form');
																	const input = form?.querySelector(`#quantity-${item.id}`);
																	if (input && input instanceof HTMLInputElement) {
																		const currentValue = parseInt(input.value) || 1;
																		const max = parseInt(input.max) || 999;
																		if (currentValue < max) {
																			input.value = (currentValue + 1).toString();
																			form?.requestSubmit();
																		}
																	}
																}}
															>
																<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
																</svg>
															</button>
														</div>
													</form>
													<form method="POST" action="?/remove" use:enhance={({ update }) => {
														return async ({ result, update: updateFn }) => {
															if (updateFn) {
																await updateFn();
															} else if (update) {
																await update();
															}
															if (result.type === 'success') {
																toast.success('Item removed from cart');
															} else if (result.type === 'failure') {
																toast.error(result.data?.error || 'Failed to remove item');
															}
														};
													}}>
														<input type="hidden" name="item_id" value={item.id} />
														<button
															type="submit"
															class="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border-2 border-red-200 rounded-lg cursor-pointer text-sm font-semibold transition-all hover:bg-red-100 hover:border-red-300"
														>
															<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
															</svg>
															Remove
														</button>
													</form>
												</div>
											</div>
											
											{#if item.product?.stock !== undefined && item.product.stock < 10}
												<div class="mt-3 flex items-center gap-2 text-amber-600 text-sm">
													<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
														<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
													</svg>
													Only {item.product.stock} left in stock
												</div>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Order Summary Sidebar -->
				<div class="lg:col-span-1">
					<div class="bg-white rounded-xl shadow-lg border border-gray-100 sticky top-8 z-10 overflow-hidden">
						<div class="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
							<h2 class="text-xl font-bold text-white m-0 flex items-center gap-2">
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
								</svg>
								Order Summary
							</h2>
						</div>
						<div class="p-6">
							<div class="space-y-4 mb-6">
								<div class="flex justify-between items-center py-2">
									<span class="text-gray-600 font-medium">Subtotal</span>
									<span class="text-lg font-semibold text-gray-900">Tk {data.total.toFixed(2)}</span>
								</div>
								<div class="flex justify-between items-center py-2 border-t border-gray-200">
									<span class="text-base font-semibold text-gray-900">Total</span>
									<span class="text-2xl font-bold text-indigo-600">Tk {data.total.toFixed(2)}</span>
								</div>
							</div>
							
							<a
								href="/checkout"
								class="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg no-underline transition-all hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-lg"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
								</svg>
								Proceed to Checkout
							</a>
							<a
								href="/"
								class="flex items-center justify-center gap-2 w-full text-center mt-4 text-indigo-600 no-underline hover:text-indigo-700 font-medium transition-colors"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
								</svg>
								Continue Shopping
							</a>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>


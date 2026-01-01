<!-- VIEW: Cart page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	export let params: Record<string, string> = {};

	// AI Recommendations
	let recommendations: any = null;
	let loadingRecommendations = false;

	onMount(async () => {
		if (data.cartItems.length > 0) {
			loadRecommendations();
		}
	});

	async function loadRecommendations() {
		loadingRecommendations = true;
		try {
			const response = await fetch('/api/cart/recommendations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ cartItems: data.cartItems })
			});
			if (response.ok) {
				const result = await response.json();
				recommendations = result;
			} else {
				const errorData = await response.json().catch(() => ({}));
				console.error('Failed to load recommendations:', errorData);
			}
		} catch (error) {
			console.error('Error loading recommendations:', error);
		} finally {
			loadingRecommendations = false;
		}
	}
</script>

<svelte:head>
	<title>Cart - TinyTech</title>
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
												on:change={(e) => {
													const form = e.currentTarget.form;
													if (form) form.requestSubmit();
												}}
											/>
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

			<div class="lg:col-span-1 space-y-6">
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

				<!-- AI Recommendations -->
				{#if recommendations || loadingRecommendations}
					<div class="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl border-2 border-indigo-200 shadow-lg p-6 hover:shadow-xl transition-all duration-300">
						<div class="flex items-center gap-3 mb-4">
							<div class="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-lg shadow-md">
								<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
								</svg>
							</div>
							<div>
								<h3 class="text-xl font-bold text-gray-900">AI Recommendations</h3>
								<p class="text-xs text-gray-600 mt-0.5">Personalized for you</p>
							</div>
						</div>
						
						{#if loadingRecommendations}
							<div class="text-center py-8">
								<div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-3">
									<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
								</div>
								<p class="text-gray-600 font-medium">Analyzing your cart...</p>
								<p class="text-xs text-gray-500 mt-1">Finding the perfect products for you</p>
							</div>
						{:else if recommendations}
							<p class="text-gray-700 mb-4 text-sm leading-relaxed bg-white bg-opacity-60 rounded-lg p-3 border border-indigo-100">
								{recommendations.summary}
							</p>
							
							{#if recommendations.recommendations.length > 0}
								<div class="space-y-3">
									{#each recommendations.recommendations as rec, index}
										{@const product = rec.product}
										<div 
											class="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
											style="animation-delay: {index * 100}ms"
										>
											<div class="flex gap-3">
												{#if product.image_url}
													<a href="/products/{product.id}" class="flex-shrink-0 group">
														<div class="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-indigo-400 transition-colors">
															<img
																src={product.image_url}
																alt={product.name}
																class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
															/>
														</div>
													</a>
												{/if}
												<div class="flex-1 min-w-0">
													<a href="/products/{product.id}" class="block hover:text-indigo-600 transition-colors">
														<h4 class="font-semibold text-sm text-gray-900 line-clamp-2 mb-1 group-hover:text-indigo-600">
															{product.name}
														</h4>
													</a>
													<p class="text-sm text-indigo-600 font-bold mb-1.5">
														Tk {product.price.toFixed(2)}
													</p>
													<p class="text-xs text-gray-600 mb-2 line-clamp-1">
														{rec.reason}
													</p>
													{#if rec.category === 'complete_build'}
														<span class="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-semibold mb-2 border border-purple-200">
															<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
																<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
															</svg>
															Complete Build
														</span>
													{:else}
														<span class="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-xs font-semibold mb-2 border border-blue-200">
															<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
																<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
															</svg>
															You Might Also Need
														</span>
													{/if}
													<form method="POST" action="/cart/add" class="inline">
														<input type="hidden" name="product_id" value={product.id} />
														<input type="hidden" name="quantity" value="1" />
														<button
															type="submit"
															class="w-full mt-2 text-xs px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
														>
															+ Add to Cart
														</button>
													</form>
												</div>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>


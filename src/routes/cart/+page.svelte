<script lang="ts">
	import { ShoppingCart, Plus, Minus, X, Package } from "lucide-svelte";
	import { cart } from "$lib/stores/cart";
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

	/** View (UI) - Shopping Cart Page */
	let cartItems = $state<typeof cart extends { subscribe: (v: any) => any } ? ReturnType<typeof cart.subscribe> extends (v: (v: infer T) => any) => any ? T : never : never>([]);
	let unsubscribe: (() => void) | null = null;

	onMount(() => {
		unsubscribe = cart.subscribe((items) => {
			cartItems = items;
		});
		return () => {
			if (unsubscribe) unsubscribe();
		};
	});

	const subtotal = $derived.by(() => {
		return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
	});

	const itemCount = $derived.by(() => {
		return cartItems.reduce((sum, item) => sum + item.quantity, 0);
	});

	function formatPrice(price: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(price);
	}

	function handleQuantityChange(productId: string, newQuantity: number) {
		if (newQuantity <= 0) {
			cart.removeItem(productId);
		} else {
			cart.updateQuantity(productId, newQuantity);
		}
	}

	function handleRemove(productId: string) {
		cart.removeItem(productId);
	}

	function handleCheckout() {
		if (cartItems.length > 0) {
			goto('/checkout');
		}
	}
</script>

<svelte:head>
	<title>Shopping Cart - TinyShop</title>
	<meta name="description" content="Your shopping cart" />
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<div class="container mx-auto px-4 py-8 md:px-6 md:py-12">
		<div class="mx-auto max-w-6xl">
			<h1 class="mb-8 text-3xl font-bold text-slate-900 md:text-4xl">
				Shopping Cart
			</h1>

			{#if cartItems.length === 0}
				<div class="rounded-lg bg-white p-12 text-center shadow-md">
					<ShoppingCart class="mx-auto mb-4 h-16 w-16 text-slate-400" />
					<p class="mb-2 text-lg font-semibold text-slate-900">Your cart is empty</p>
					<p class="mb-6 text-slate-600">Start shopping to add items to your cart</p>
					<a
						href="/shop"
						class="inline-block rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
					>
						Continue Shopping
					</a>
				</div>
			{:else}
				<div class="grid gap-8 lg:grid-cols-3">
					<!-- Cart Items -->
					<div class="lg:col-span-2">
						<div class="rounded-lg bg-white shadow-md">
							<div class="border-b border-slate-200 p-6">
								<h2 class="text-xl font-semibold text-slate-900">Product</h2>
							</div>
							
							<div class="divide-y divide-slate-200">
								{#each cartItems as item (item.product.id)}
									<div class="p-6">
										<div class="flex gap-4">
											<!-- Product Image -->
											<div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200">
												{#if item.product.image_url}
													<img
														src={item.product.image_url}
														alt={item.product.name}
														class="h-full w-full object-cover"
													/>
												{:else}
													<div class="flex h-full w-full items-center justify-center">
														<Package class="h-8 w-8 text-slate-400" />
													</div>
												{/if}
											</div>

											<!-- Product Details -->
											<div class="flex flex-1 flex-col gap-2">
												<h3 class="font-semibold text-slate-900">
													<a href="/shop/{item.product.slug}" class="hover:text-slate-700">
														{item.product.name}
													</a>
												</h3>
												<p class="text-sm text-slate-600">{formatPrice(item.product.price)}</p>

												<!-- Quantity Controls -->
												<div class="flex items-center gap-4">
													<div class="flex items-center gap-2">
														<button
															type="button"
															onclick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
															class="flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
															aria-label="Decrease quantity"
														>
															<Minus class="h-4 w-4" />
														</button>
														<input
															type="number"
															value={item.quantity}
															min="1"
															max={item.product.stock}
															oninput={(e) => {
																const value = parseInt(e.currentTarget.value) || 1;
																handleQuantityChange(item.product.id, value);
															}}
															class="w-16 rounded border border-slate-300 px-2 py-1 text-center text-sm"
														/>
														<button
															type="button"
															onclick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
															disabled={item.quantity >= item.product.stock}
															class="flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
															aria-label="Increase quantity"
														>
															<Plus class="h-4 w-4" />
														</button>
													</div>

													<!-- Subtotal -->
													<div class="ml-auto">
														<p class="text-sm font-semibold text-slate-900">
															Subtotal: {formatPrice(item.product.price * item.quantity)}
														</p>
													</div>

													<!-- Remove Button -->
													<button
														type="button"
														onclick={() => handleRemove(item.product.id)}
														class="ml-2 text-slate-400 hover:text-slate-600"
														aria-label="Remove item"
													>
														<X class="h-5 w-5" />
													</button>
												</div>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>

					<!-- Order Summary -->
					<div class="lg:col-span-1">
						<div class="sticky top-4 rounded-lg bg-white p-6 shadow-md">
							<h2 class="mb-4 text-xl font-semibold text-slate-900">Order Summary</h2>
							
							<div class="mb-4 space-y-2 border-b border-slate-200 pb-4">
								<div class="flex justify-between text-sm">
									<span class="text-slate-600">Items ({itemCount})</span>
									<span class="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
								</div>
							</div>

							<div class="mb-6">
								<div class="flex justify-between text-lg font-bold text-slate-900">
									<span>Total</span>
									<span>{formatPrice(subtotal)}</span>
								</div>
							</div>

							<button
								type="button"
								onclick={handleCheckout}
								class="w-full rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
							>
								Proceed to Checkout
							</button>

							<a
								href="/shop"
								class="mt-4 block text-center text-sm text-slate-600 hover:text-slate-900"
							>
								Continue Shopping
							</a>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

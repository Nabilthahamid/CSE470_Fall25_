<script lang="ts">
	import { onMount } from 'svelte';
	import { cart } from '$lib/stores/cart';
	import { enhance } from '$app/forms';
	import { Package, LogIn } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: any } = $props();

	let cartItems = $state<any[]>([]);
	let unsubscribe: (() => void) | null = null;

	// Form state
	let couponCode = $state('');
	let firstName = $state('');
	let lastName = $state('');
	let companyName = $state('');
	let country = $state('Bangladesh');
	let streetAddress = $state('');
	let apartment = $state('');
	let city = $state('');
	let district = $state('Dhaka');
	let postcode = $state('');
	let phone = $state('');
	let email = $state('');
	let createAccount = $state(false);
	
	// Initialize email from user data
	$effect(() => {
		if (data.user?.email && !email) {
			email = data.user.email;
		}
	});
	let shipToDifferentAddress = $state(false);
	let orderNotes = $state('');
	let shippingMethod = $state('inside_dhaka');
	let paymentMethod = $state('cash_on_delivery');

	// Shipping options
	const shippingOptions = [
		{ value: 'inside_dhaka', label: 'Inside Dhaka', price: 70.00 },
		{ value: 'local_pickup', label: 'Local pickup (Mirpur 6)', price: 0 },
		{ value: 'outside_dhaka', label: 'Outside Dhaka', price: 100.00 }
	];

	// Districts (sample - you can expand this)
	const districts = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'];

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

	const shippingCost = $derived.by(() => {
		const option = shippingOptions.find(opt => opt.value === shippingMethod);
		return option?.price || 0;
	});

	const total = $derived.by(() => {
		return subtotal + shippingCost;
	});

	function formatPrice(price: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2
		}).format(price);
	}

	function handlePlaceOrder() {
		return async ({ result, update }: any) => {
			await update();
			// If successful, clear cart
			if (result.type === 'redirect' || result.type === 'success') {
				cart.clear();
			}
		};
	}
</script>

<svelte:head>
	<title>Checkout - TinyShop</title>
	<meta name="description" content="Complete your order" />
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<div class="container mx-auto px-4 py-8 md:px-6 md:py-12">
		<div class="mx-auto max-w-6xl">
			<h1 class="mb-8 text-3xl font-bold text-slate-900 md:text-4xl">Checkout</h1>

			{#if cartItems.length === 0}
				<div class="rounded-lg bg-white p-12 text-center shadow-md">
					<Package class="mx-auto mb-4 h-16 w-16 text-slate-400" />
					<p class="mb-2 text-lg font-semibold text-slate-900">Your cart is empty</p>
					<p class="mb-6 text-slate-600">Add items to your cart before checkout</p>
					<a
						href="/shop"
						class="inline-block rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
					>
						Continue Shopping
					</a>
				</div>
			{:else}
				<div class="grid gap-8 lg:grid-cols-3">
					<!-- Left Column - Cart Review & Billing -->
					<div class="lg:col-span-2 space-y-6">
						<!-- Product Review -->
						<div class="rounded-lg bg-white p-6 shadow-md">
							<h2 class="mb-4 text-xl font-semibold text-slate-900">Product</h2>
							<div class="space-y-4">
								{#each cartItems as item (item.product.id)}
									<div class="flex items-center gap-4 border-b border-slate-200 pb-4 last:border-0">
										<div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200">
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
										<div class="flex-1">
											<h3 class="font-semibold text-slate-900">{item.product.name}</h3>
											<p class="text-sm text-slate-600">{formatPrice(item.product.price)}</p>
										</div>
										<div class="text-right">
											<p class="text-sm font-semibold text-slate-900">
												Subtotal: {formatPrice(item.product.price * item.quantity)}
											</p>
											<p class="text-xs text-slate-500">Qty: {item.quantity}</p>
										</div>
									</div>
								{/each}
							</div>
						</div>

						<!-- Coupon Code -->
						<div class="rounded-lg bg-white p-6 shadow-md">
							<div class="flex gap-2">
								<input
									type="text"
									bind:value={couponCode}
									placeholder="Coupon code"
									class="flex-1 rounded border border-slate-300 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
								/>
								<button
									type="button"
									class="rounded bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800"
								>
									Apply coupon
								</button>
							</div>
						</div>

						<!-- Returning Customer -->
						<div class="rounded-lg bg-white p-6 shadow-md">
							<p class="text-sm text-slate-600">
								Returning customer? 
								<a href="/auth?tab=login" class="text-slate-900 hover:underline">
									Click here to login
								</a>
							</p>
						</div>

						<!-- Billing Details -->
						<div class="rounded-lg bg-white p-6 shadow-md">
							<h2 class="mb-6 text-xl font-semibold text-slate-900">Billing details</h2>
							
							<div class="space-y-4">
								<!-- First Name & Last Name -->
								<div class="grid gap-4 md:grid-cols-2">
									<div>
										<label for="firstName" class="mb-1 block text-sm font-medium text-slate-700">
											First name <span class="text-red-500">*</span>
										</label>
										<input
											type="text"
											id="firstName"
											name="firstName"
											bind:value={firstName}
											required
											class="w-full rounded border border-slate-300 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
										/>
									</div>
									<div>
										<label for="lastName" class="mb-1 block text-sm font-medium text-slate-700">
											Last name <span class="text-red-500">*</span>
										</label>
										<input
											type="text"
											id="lastName"
											name="lastName"
											bind:value={lastName}
											required
											class="w-full rounded border border-slate-300 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
										/>
									</div>
								</div>

								<!-- Company Name -->
								<div>
									<label for="companyName" class="mb-1 block text-sm font-medium text-slate-700">
										Company name (optional)
									</label>
									<input
										type="text"
										id="companyName"
										name="companyName"
										bind:value={companyName}
										class="w-full rounded border border-slate-300 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
									/>
								</div>

								<!-- Country -->
								<div>
									<label for="country" class="mb-1 block text-sm font-medium text-slate-700">
										Country / Region <span class="text-red-500">*</span>
									</label>
									<select
										id="country"
										name="country"
										bind:value={country}
										required
										class="w-full rounded border border-slate-300 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
									>
										<option value="Bangladesh">Bangladesh</option>
										<option value="India">India</option>
										<option value="Pakistan">Pakistan</option>
									</select>
								</div>

								<!-- Street Address -->
								<div>
									<label for="streetAddress" class="mb-1 block text-sm font-medium text-slate-700">
										Street address <span class="text-red-500">*</span>
									</label>
									<input
										type="text"
										id="streetAddress"
										name="streetAddress"
										bind:value={streetAddress}
										placeholder="House number and street name"
										required
										class="w-full rounded border border-slate-300 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
									/>
								</div>

								<!-- Apartment -->
								<div>
									<label for="apartment" class="mb-1 block text-sm font-medium text-slate-700">
										Apartment, suite, unit, etc. (optional)
									</label>
									<input
										type="text"
										id="apartment"
										name="apartment"
										bind:value={apartment}
										class="w-full rounded border border-slate-300 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
									/>
								</div>

								<!-- Town / City -->
								<div>
									<label for="city" class="mb-1 block text-sm font-medium text-slate-700">
										Town / City <span class="text-red-500">*</span>
									</label>
									<input
										type="text"
										id="city"
										name="city"
										bind:value={city}
										required
										class="w-full rounded border border-slate-300 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
									/>
								</div>

								<!-- District -->
								<div>
									<label for="district" class="mb-1 block text-sm font-medium text-slate-700">
										District <span class="text-red-500">*</span>
									</label>
									<select
										id="district"
										name="district"
										bind:value={district}
										required
										class="w-full rounded border border-slate-300 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
									>
										{#each districts as dist}
											<option value={dist}>{dist}</option>
										{/each}
									</select>
								</div>

								<!-- Postcode -->
								<div>
									<label for="postcode" class="mb-1 block text-sm font-medium text-slate-700">
										Postcode / ZIP (optional)
									</label>
									<input
										type="text"
										id="postcode"
										name="postcode"
										bind:value={postcode}
										class="w-full rounded border border-slate-300 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
									/>
								</div>

								<!-- Phone -->
								<div>
									<label for="phone" class="mb-1 block text-sm font-medium text-slate-700">
										Phone <span class="text-red-500">*</span>
									</label>
									<input
										type="tel"
										id="phone"
										name="phone"
										bind:value={phone}
										required
										class="w-full rounded border border-slate-300 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
									/>
								</div>

								<!-- Email -->
								<div>
									<label for="email" class="mb-1 block text-sm font-medium text-slate-700">
										Email address <span class="text-red-500">*</span>
									</label>
									<input
										type="email"
										id="email"
										name="email"
										bind:value={email}
										required
										class="w-full rounded border border-slate-300 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
									/>
								</div>

								<!-- Create Account Checkbox -->
								<div class="flex items-center">
									<input
										type="checkbox"
										id="createAccount"
										name="createAccount"
										bind:checked={createAccount}
										class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
									/>
									<label for="createAccount" class="ml-2 text-sm text-slate-700">
										Create an account?
									</label>
								</div>

								<!-- Ship to Different Address Checkbox -->
								<div class="flex items-center">
									<input
										type="checkbox"
										id="shipToDifferentAddress"
										name="shipToDifferentAddress"
										bind:checked={shipToDifferentAddress}
										class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
									/>
									<label for="shipToDifferentAddress" class="ml-2 text-sm text-slate-700">
										Ship to a different address?
									</label>
								</div>

								<!-- Order Notes -->
								<div>
									<label for="orderNotes" class="mb-1 block text-sm font-medium text-slate-700">
										Order notes (optional)
									</label>
									<textarea
										id="orderNotes"
										name="orderNotes"
										bind:value={orderNotes}
										placeholder="Notes about your order, e.g. special notes for delivery."
										rows="4"
										class="w-full rounded border border-slate-300 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
									></textarea>
								</div>
							</div>
						</div>
					</div>

					<!-- Right Column - Order Summary -->
					<div class="lg:col-span-1">
						<div class="sticky top-4 rounded-lg bg-white p-6 shadow-md">
							<h2 class="mb-6 text-xl font-semibold text-slate-900">Your order</h2>

							<!-- Product Summary -->
							<div class="mb-4 border-b border-slate-200 pb-4">
								<div class="mb-2 flex justify-between text-sm font-semibold text-slate-900">
									<span>Product</span>
									<span>Subtotal</span>
								</div>
								<div class="space-y-2">
									{#each cartItems as item (item.product.id)}
										<div class="flex justify-between text-sm text-slate-600">
											<span>{item.product.name} x {item.quantity}</span>
											<span>{formatPrice(item.product.price * item.quantity)}</span>
										</div>
									{/each}
								</div>
								<div class="mt-4 flex justify-between border-t border-slate-200 pt-4 text-sm">
									<span class="text-slate-600">Subtotal</span>
									<span class="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
								</div>
							</div>

							<!-- Shipping Options -->
							<div class="mb-4 border-b border-slate-200 pb-4">
								<h3 class="mb-3 text-sm font-semibold text-slate-900">Shipping</h3>
								<div class="space-y-2">
									{#each shippingOptions as option}
										<label class="flex items-center gap-2">
											<input
												type="radio"
												name="shippingMethod"
												value={option.value}
												bind:group={shippingMethod}
												class="h-4 w-4 text-slate-900 focus:ring-slate-900"
											/>
											<span class="text-sm text-slate-700">
												{option.label}
												{#if option.price > 0}
													: {formatPrice(option.price)}
												{/if}
											</span>
										</label>
									{/each}
								</div>
							</div>

							<!-- Total -->
							<div class="mb-6 border-b border-slate-200 pb-4">
								<div class="flex justify-between text-lg font-bold text-slate-900">
									<span>Total</span>
									<span>{formatPrice(total)}</span>
								</div>
							</div>

							<!-- Payment Method -->
							<div class="mb-6">
								<h3 class="mb-3 text-sm font-semibold text-slate-900">Payment Method</h3>
								<label class="flex items-start gap-2">
									<input
										type="radio"
										name="paymentMethod"
										value="cash_on_delivery"
										bind:group={paymentMethod}
										class="mt-1 h-4 w-4 text-slate-900 focus:ring-slate-900"
									/>
									<div>
										<span class="text-sm font-medium text-slate-700">Cash on delivery</span>
										<p class="text-xs text-slate-500">Pay with cash upon delivery</p>
									</div>
								</label>
							</div>

							<!-- Place Order Button -->
							<form method="POST" action="?/placeOrder" use:enhance={handlePlaceOrder}>
								<input type="hidden" name="cartItems" value={JSON.stringify(cartItems)} />
								<input type="hidden" name="firstName" bind:value={firstName} />
								<input type="hidden" name="lastName" bind:value={lastName} />
								<input type="hidden" name="companyName" bind:value={companyName} />
								<input type="hidden" name="country" bind:value={country} />
								<input type="hidden" name="streetAddress" bind:value={streetAddress} />
								<input type="hidden" name="apartment" bind:value={apartment} />
								<input type="hidden" name="city" bind:value={city} />
								<input type="hidden" name="district" bind:value={district} />
								<input type="hidden" name="postcode" bind:value={postcode} />
								<input type="hidden" name="phone" bind:value={phone} />
								<input type="hidden" name="email" bind:value={email} />
								<input type="hidden" name="shippingMethod" bind:value={shippingMethod} />
								<input type="hidden" name="paymentMethod" bind:value={paymentMethod} />
								<input type="hidden" name="orderNotes" bind:value={orderNotes} />
								
								{#if form?.error}
									<div class="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
										{form.error}
									</div>
								{/if}

								<button
									type="submit"
									class="w-full rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
								>
									Place order
								</button>
							</form>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

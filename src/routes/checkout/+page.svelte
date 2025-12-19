<script lang="ts">
	import { formatCurrency } from '$lib/utils/formatCurrency';
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	let shippingMethod = $state('inside_dhaka');
	let paymentMethod = $state('cash_on_delivery');

	// Calculate shipping cost
	const shippingCosts: Record<string, number> = {
		inside_dhaka: 70,
		local_pickup: 0,
		outside_dhaka: 100
	};

	let shippingCost = $derived(shippingCosts[shippingMethod] || 0);
	let total = $derived(() => data.cart.subtotal + shippingCost);

	// Form fields
	let firstName = $state('');
	let lastName = $state('');
	let companyName = $state('');
	let country = $state('Bangladesh');
	let address = $state('');
	let address2 = $state('');
	let city = $state('');
	let district = $state('Dhaka');
	let postcode = $state('');
	let phone = $state('');
	// Initialize email from user data - extract user from data prop to avoid warning
	const userEmail = data.user?.email ?? '';
	let email = $state(userEmail);
	let orderNotes = $state('');
</script>

<svelte:head>
	<title>Checkout - Tinytech</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-8">Checkout</h1>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Left Column: Billing Details -->
		<div class="lg:col-span-2">
			<div class="bg-white rounded-lg shadow-md p-6 mb-6">
				<h2 class="text-2xl font-bold mb-6">Billing details</h2>
				
				<form method="POST" action="?/placeOrder" use:enhance>
					<div class="space-y-4">
						<!-- Name Fields -->
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
									First name <span class="text-red-500">*</span>
								</label>
								<input
									type="text"
									id="firstName"
									name="firstName"
									bind:value={firstName}
									required
									class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-black"
								/>
							</div>
							<div>
								<label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
									Last name <span class="text-red-500">*</span>
								</label>
								<input
									type="text"
									id="lastName"
									name="lastName"
									bind:value={lastName}
									required
									class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-black"
								/>
							</div>
						</div>

						<!-- Company Name -->
						<div>
							<label for="companyName" class="block text-sm font-medium text-gray-700 mb-1">
								Company name (optional)
							</label>
							<input
								type="text"
								id="companyName"
								name="companyName"
								bind:value={companyName}
								class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-black"
							/>
						</div>

						<!-- Country -->
						<div>
							<label for="country" class="block text-sm font-medium text-gray-700 mb-1">
								Country / Region <span class="text-red-500">*</span>
							</label>
							<select
								id="country"
								name="country"
								bind:value={country}
								required
								class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-black"
							>
								<option value="Bangladesh">Bangladesh</option>
							</select>
						</div>

						<!-- Street Address -->
						<div>
							<label for="address" class="block text-sm font-medium text-gray-700 mb-1">
								Street address <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="address"
								name="address"
								bind:value={address}
								placeholder="House number and street name"
								required
								class="w-full px-4 py-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-black focus:border-black"
							/>
							<input
								type="text"
								name="address2"
								bind:value={address2}
								placeholder="Apartment, suite, unit, etc. (optional)"
								class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-black"
							/>
						</div>

						<!-- City and District -->
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="city" class="block text-sm font-medium text-gray-700 mb-1">
									Town / City <span class="text-red-500">*</span>
								</label>
								<input
									type="text"
									id="city"
									name="city"
									bind:value={city}
									required
									class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-black"
								/>
							</div>
							<div>
								<label for="district" class="block text-sm font-medium text-gray-700 mb-1">
									District <span class="text-red-500">*</span>
								</label>
								<select
									id="district"
									name="district"
									bind:value={district}
									required
									class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-black"
								>
									<option value="Dhaka">Dhaka</option>
									<option value="Chittagong">Chittagong</option>
									<option value="Sylhet">Sylhet</option>
									<option value="Rajshahi">Rajshahi</option>
									<option value="Khulna">Khulna</option>
									<option value="Barisal">Barisal</option>
									<option value="Rangpur">Rangpur</option>
								</select>
							</div>
						</div>

						<!-- Postcode -->
						<div>
							<label for="postcode" class="block text-sm font-medium text-gray-700 mb-1">
								Postcode / ZIP (optional)
							</label>
							<input
								type="text"
								id="postcode"
								name="postcode"
								bind:value={postcode}
								class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-black"
							/>
						</div>

						<!-- Phone and Email -->
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
									Phone <span class="text-red-500">*</span>
								</label>
								<input
									type="tel"
									id="phone"
									name="phone"
									bind:value={phone}
									required
									class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-black"
								/>
							</div>
							<div>
								<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
									Email address <span class="text-red-500">*</span>
								</label>
								<input
									type="email"
									id="email"
									name="email"
									bind:value={email}
									required
									class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-black"
								/>
							</div>
						</div>

						<!-- Order Notes -->
						<div>
							<label for="orderNotes" class="block text-sm font-medium text-gray-700 mb-1">
								Order notes (optional)
							</label>
							<textarea
								id="orderNotes"
								name="orderNotes"
								bind:value={orderNotes}
								rows="4"
								placeholder="Notes about your order, e.g. special notes for delivery."
								class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-black"
							></textarea>
						</div>

						<!-- Hidden fields for shipping and payment -->
						<input type="hidden" name="shippingMethod" bind:value={shippingMethod} />
						<input type="hidden" name="paymentMethod" bind:value={paymentMethod} />
					</div>
				</form>
			</div>
		</div>

		<!-- Right Column: Order Summary -->
		<div class="lg:col-span-1">
			<div class="bg-white rounded-lg shadow-md p-6 sticky top-4">
				<h2 class="text-2xl font-bold mb-6">Your order</h2>
				
				<!-- Products -->
				<div class="mb-6">
					<div class="flex justify-between mb-4 pb-2 border-b">
						<span class="font-medium">Product</span>
						<span class="font-medium">Subtotal</span>
					</div>
					{#each data.cart.items as item}
						<div class="flex justify-between mb-2">
							<span>{item.product?.name} x {item.quantity}</span>
							<span>{formatCurrency(parseFloat(item.product?.price || '0') * item.quantity)}</span>
						</div>
					{/each}
					<div class="flex justify-between mt-4 pt-4 border-t">
						<span>Subtotal</span>
						<span>{formatCurrency(data.cart.subtotal)}</span>
					</div>
				</div>

				<!-- Shipping -->
				<div class="mb-6">
					<h3 class="font-semibold mb-3">Shipping</h3>
					<div class="space-y-2">
						<label class="flex items-center cursor-pointer">
							<input
								type="radio"
								value="inside_dhaka"
								bind:group={shippingMethod}
								class="mr-2"
							/>
							<span>Inside Dhaka: {formatCurrency(70)}</span>
						</label>
						<label class="flex items-center cursor-pointer">
							<input
								type="radio"
								value="local_pickup"
								bind:group={shippingMethod}
								class="mr-2"
							/>
							<span>Local pickup (Mirpur 6)</span>
						</label>
						<label class="flex items-center cursor-pointer">
							<input
								type="radio"
								value="outside_dhaka"
								bind:group={shippingMethod}
								class="mr-2"
							/>
							<span>Outside Dhaka: {formatCurrency(100)}</span>
						</label>
					</div>
				</div>

				<!-- Total -->
				<div class="mb-6 pb-6 border-b">
					<div class="flex justify-between text-xl font-bold">
						<span>Total</span>
						<span>{formatCurrency(total)}</span>
					</div>
				</div>

				<!-- Payment Method -->
				<div class="mb-6">
					<label class="flex items-start cursor-pointer">
						<input
							type="radio"
							value="cash_on_delivery"
							bind:group={paymentMethod}
							class="mt-1 mr-2"
							checked
						/>
						<div>
							<span class="font-semibold">Cash on delivery</span>
							<p class="text-sm text-gray-600 mt-1">Pay with cash upon delivery.</p>
						</div>
					</label>
				</div>

				<!-- Place Order Button -->
				<button
					type="button"
					onclick={() => {
						// Update hidden fields and submit form
						const form = document.querySelector('form[method="POST"]') as HTMLFormElement;
						if (form) {
							const shippingInput = form.querySelector('input[name="shippingMethod"]') as HTMLInputElement;
							const paymentInput = form.querySelector('input[name="paymentMethod"]') as HTMLInputElement;
							if (shippingInput) shippingInput.value = shippingMethod;
							if (paymentInput) paymentInput.value = paymentMethod;
							form.requestSubmit();
						}
					}}
					class="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition-colors font-medium"
				>
					Place order
				</button>
			</div>
		</div>
	</div>
</div>

<!-- VIEW: Checkout page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	export let params: Record<string, string> = {};

	// Auto-fill from user profile if available
	let email = form?.customer_email || data.userProfile?.customer_email || data.user?.email || '';
	let firstName = '';
	let lastName = '';
	let country = data.userProfile?.customer_country || 'Bangladesh';
	let address = data.userProfile?.customer_address || '';
	let city = data.userProfile?.customer_city || '';
	let postalCode = data.userProfile?.customer_postal_code || '';
	let phone = data.userProfile?.customer_phone || '';
	let emailNewsletter = false;
	let saveInfo = false;
	let shippingMethod = 'inside_dhaka';
	let paymentMethod = 'cod';
	let couponCode = '';
	let couponLoading = false;
	let couponError = '';
	let appliedCoupon: any = null;
	let discountAmount = 0;
	let freeShipping = false;

	// Parse full name into first and last name if available from profile
	function initializeFromProfile() {
		if (data.userProfile?.customer_name) {
			const nameParts = data.userProfile.customer_name.trim().split(' ');
			if (nameParts.length > 1) {
				lastName = nameParts.pop() || '';
				firstName = nameParts.join(' ');
			} else {
				lastName = nameParts[0] || '';
				firstName = '';
			}
		}
	}

	// Initialize on mount
	initializeFromProfile();

	const shippingMethods = [
		{ value: 'inside_dhaka', label: 'Inside Dhaka', price: 70 },
		{ value: 'gazipur_narayanganj_savar', label: 'Gazipur / Narayanganj / Savar', price: 80 },
		{ value: 'outside_dhaka', label: 'Outside Dhaka', price: 100 }
	];

	async function applyCoupon() {
		if (!couponCode.trim()) {
			couponError = 'Please enter a coupon code';
			return;
		}

		couponLoading = true;
		couponError = '';
		appliedCoupon = null;
		discountAmount = 0;
		freeShipping = false;

		try {
			const response = await fetch('/api/checkout/validate-coupon', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code: couponCode.trim() })
			});

			const result = await response.json();

			if (result.valid && result.discount) {
				appliedCoupon = result.discount;
				discountAmount = result.discount_amount;
				freeShipping = result.discount.free_shipping || false;
				couponError = '';
			} else {
				couponError = result.error || 'Invalid coupon code';
				appliedCoupon = null;
				discountAmount = 0;
				freeShipping = false;
			}
		} catch (error) {
			console.error('Coupon validation error:', error);
			couponError = 'Failed to validate coupon. Please try again.';
			appliedCoupon = null;
			discountAmount = 0;
			freeShipping = false;
		} finally {
			couponLoading = false;
		}
	}

	function removeCoupon() {
		couponCode = '';
		appliedCoupon = null;
		discountAmount = 0;
		freeShipping = false;
		couponError = '';
	}

	$: shippingCost = freeShipping ? 0 : (shippingMethods.find((m) => m.value === shippingMethod)?.price || 0);
	$: totalAmount = data.total - discountAmount + shippingCost;
</script>

<svelte:head>
	<title>Checkout - TinyTech</title>
</svelte:head>

<div class="max-w-6xl mx-auto p-8">
	<h1 class="mb-8 text-3xl font-bold">Checkout</h1>

	{#if form?.error}
		<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
			{form.error}
		</div>
	{/if}

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<div class="lg:col-span-2">
			<form method="POST" use:enhance>
				<!-- Contact Section -->
				<div class="bg-white p-6 rounded-lg border border-gray-200 mb-6">
					<div class="flex justify-between items-center mb-6">
						<h2 class="text-xl font-semibold m-0">Contact</h2>
						<div class="flex items-center gap-4">
							{#if data.userProfile?.customer_name && data.userProfile?.customer_address && data.userProfile?.customer_phone && data.userProfile?.customer_city}
								<span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
									✓ Profile Info Loaded
								</span>
							{/if}
							{#if data.user}
								<a href="/profile" class="text-blue-600 no-underline hover:underline text-sm">
									Edit Profile
								</a>
							{:else}
								<a href="/auth/login" class="text-blue-600 no-underline hover:underline text-sm">
									Sign in
								</a>
							{/if}
						</div>
					</div>

					<div class="mb-4">
						<label for="customer_email" class="block mb-2 text-sm font-medium">
							Email or mobile phone number
						</label>
						<input
							type="text"
							id="customer_email"
							name="customer_email"
							value={email}
							required
							on:input={(e) => (email = e.currentTarget.value)}
							class="w-full p-3 border-2 border-blue-500 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="email@example.com or +8801234567890"
						/>
					</div>

					<div class="flex items-center">
						<input
							type="checkbox"
							id="email_newsletter"
							name="email_newsletter"
							checked={emailNewsletter}
							on:change={(e) => (emailNewsletter = e.currentTarget.checked)}
							class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
						/>
						<label for="email_newsletter" class="ml-2 text-sm text-gray-700">
							Email me with news and offers
						</label>
					</div>
				</div>

				<!-- Delivery Section -->
				<div class="bg-white p-6 rounded-lg border border-gray-200 mb-6">
					<h2 class="text-xl font-semibold mb-6 m-0">Delivery</h2>

					<div class="mb-4">
						<label for="country" class="block mb-2 text-sm font-medium">Country/Region</label>
						<select
							id="country"
							name="customer_country"
							value={country}
							on:change={(e) => (country = e.currentTarget.value)}
							class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="Bangladesh">Bangladesh</option>
							<option value="India">India</option>
							<option value="Pakistan">Pakistan</option>
							<option value="Other">Other</option>
						</select>
					</div>

					<div class="grid grid-cols-2 gap-4 mb-4">
						<div>
							<label for="first_name" class="block mb-2 text-sm font-medium">
								First name <span class="text-gray-500">(optional)</span>
							</label>
							<input
								type="text"
								id="first_name"
								name="first_name"
								value={firstName}
								on:input={(e) => (firstName = e.currentTarget.value)}
								class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label for="last_name" class="block mb-2 text-sm font-medium">Last name</label>
							<input
								type="text"
								id="last_name"
								name="last_name"
								value={lastName}
								required
								on:input={(e) => (lastName = e.currentTarget.value)}
								class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<input
								type="hidden"
								name="customer_name"
								value={firstName ? `${firstName} ${lastName}`.trim() : lastName}
							/>
						</div>
					</div>

					<div class="mb-4">
						<label for="address" class="block mb-2 text-sm font-medium">Address</label>
						<input
							type="text"
							id="address"
							name="customer_address"
							value={address}
							required
							on:input={(e) => (address = e.currentTarget.value)}
							class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Street address, apartment, suite, etc."
						/>
					</div>

					<div class="grid grid-cols-2 gap-4 mb-4">
						<div>
							<label for="city" class="block mb-2 text-sm font-medium">City</label>
							<input
								type="text"
								id="city"
								name="customer_city"
								value={city}
								required
								on:input={(e) => (city = e.currentTarget.value)}
								class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label for="postal_code" class="block mb-2 text-sm font-medium">
								Postal code <span class="text-gray-500">(optional)</span>
							</label>
							<input
								type="text"
								id="postal_code"
								name="customer_postal_code"
								value={postalCode}
								on:input={(e) => (postalCode = e.currentTarget.value)}
								class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>

					<div class="mb-4">
						<label for="phone" class="block mb-2 text-sm font-medium">
							Phone
							<span class="ml-1 text-gray-500 cursor-help" title="Required for delivery">ℹ️</span>
						</label>
						<input
							type="tel"
							id="phone"
							name="customer_phone"
							value={phone}
							required
							on:input={(e) => (phone = e.currentTarget.value)}
							class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="+8801234567890"
						/>
					</div>

					<div class="flex items-center">
						<input
							type="checkbox"
							id="save_info"
							name="save_info"
							checked={saveInfo}
							on:change={(e) => (saveInfo = e.currentTarget.checked)}
							class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
						/>
						<label for="save_info" class="ml-2 text-sm text-gray-700">
							Save this information for next time
						</label>
					</div>
				</div>

				<!-- Shipping Method Section -->
				<div class="bg-white p-6 rounded-lg border border-gray-200 mb-6">
					<h2 class="text-xl font-semibold mb-6 m-0">Shipping method</h2>

					<div class="space-y-4">
						{#each shippingMethods as method}
							<label
								class="flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors {shippingMethod === method.value
									? 'border-blue-500 bg-blue-50'
									: 'border-gray-300 hover:border-gray-400'}"
							>
								<div class="flex items-center">
									<input
										type="radio"
										name="shipping_method"
										value={method.value}
										checked={shippingMethod === method.value}
										on:change={() => (shippingMethod = method.value)}
										class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
									/>
									<span class="ml-3 text-base font-medium">{method.label}</span>
								</div>
								<span class="text-base font-semibold">৳{method.price.toFixed(2)}</span>
							</label>
						{/each}
					</div>
				</div>

				<!-- Coupon Code Section -->
				<div class="bg-white p-6 rounded-lg border border-gray-200 mb-6">
					<h2 class="text-xl font-semibold mb-4 m-0">Coupon Code</h2>
					{#if appliedCoupon}
						<div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
							<div class="flex items-center justify-between">
								<div>
									<p class="font-semibold text-green-800 m-0">
										✓ Coupon "{appliedCoupon.code}" applied
									</p>
									<p class="text-sm text-green-700 m-0 mt-1">
										{#if appliedCoupon.free_shipping}
											Free shipping applied
										{:else if appliedCoupon.discount_type === 'percentage'}
											{appliedCoupon.discount_value}% off
										{:else}
											৳{discountAmount.toFixed(2)} discount
										{/if}
									</p>
								</div>
								<button
									type="button"
									on:click={removeCoupon}
									class="text-red-600 hover:text-red-700 text-sm font-medium"
								>
									Remove
								</button>
							</div>
						</div>
					{:else}
						<div class="flex gap-2">
							<input
								type="text"
								bind:value={couponCode}
								placeholder="Enter coupon code"
								class="flex-1 p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
								on:keydown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										applyCoupon();
									}
								}}
							/>
							<button
								type="button"
								on:click={applyCoupon}
								disabled={couponLoading || !couponCode.trim()}
								class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
							>
								{couponLoading ? 'Applying...' : 'Apply'}
							</button>
						</div>
						{#if couponError}
							<p class="text-red-600 text-sm mt-2 m-0">{couponError}</p>
						{/if}
					{/if}
				</div>

				<!-- Payment Section -->
				<div class="bg-white p-6 rounded-lg border border-gray-200 mb-6">
					<h2 class="text-xl font-semibold mb-2 m-0">Payment</h2>
					<p class="text-sm text-gray-600 mb-6 m-0">
						All transactions are secure and encrypted.
					</p>

					<div class="space-y-4">
						<label
							class="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors {paymentMethod === 'cod'
								? 'border-blue-500 bg-blue-50'
								: 'border-gray-300 hover:border-gray-400'}"
						>
							<input
								type="radio"
								name="payment_method"
								value="cod"
								checked={paymentMethod === 'cod'}
								on:change={() => (paymentMethod = 'cod')}
								class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
							/>
							<div class="ml-3 flex-1">
								<div class="font-medium text-base">Cash on Delivery (COD)</div>
								<div class="text-sm text-gray-600 mt-1">
									Pay with cash on delivery (You may be asked to pay delivery charge in advance.)
								</div>
							</div>
						</label>

						<label
							class="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors {paymentMethod === 'bank'
								? 'border-blue-500 bg-blue-50'
								: 'border-gray-300 hover:border-gray-400'}"
						>
							<input
								type="radio"
								name="payment_method"
								value="bank"
								checked={paymentMethod === 'bank'}
								on:change={() => (paymentMethod = 'bank')}
								class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
							/>
							<span class="ml-3 text-base font-medium">Bank Deposit</span>
						</label>

						<label
							class="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors {paymentMethod === 'mobile'
								? 'border-blue-500 bg-blue-50'
								: 'border-gray-300 hover:border-gray-400'}"
						>
							<input
								type="radio"
								name="payment_method"
								value="mobile"
								checked={paymentMethod === 'mobile'}
								on:change={() => (paymentMethod = 'mobile')}
								class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
							/>
							<span class="ml-3 text-base font-medium">Bkash/Nagad</span>
						</label>
					</div>
				</div>

				<!-- Hidden inputs -->
				<input type="hidden" name="shipping_cost" value={shippingCost} />
				<input type="hidden" name="email_newsletter" value={emailNewsletter ? 'true' : 'false'} />
				{#if appliedCoupon}
					<input type="hidden" name="coupon_code" value={appliedCoupon.code} />
					<input type="hidden" name="coupon_id" value={appliedCoupon.id} />
					<input type="hidden" name="discount_amount" value={discountAmount} />
				{/if}

				<button
					type="submit"
					class="w-full bg-green-600 text-white border-none px-6 py-4 rounded-lg cursor-pointer text-lg font-semibold transition-colors hover:bg-green-700"
				>
					Complete Order
				</button>
			</form>
		</div>

		<!-- Order Summary Sidebar -->
		<div class="lg:col-span-1">
			<div class="bg-white p-6 rounded-lg border border-gray-200 sticky top-8">
				<h2 class="text-xl font-semibold mb-4 m-0">Order Summary</h2>
				<div class="space-y-3 mb-4">
					{#each data.cartItems as item (item.id)}
						<div class="flex justify-between text-sm">
							<span>{item.product?.name || 'Unknown'} × {item.quantity}</span>
							<span>৳{((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
						</div>
					{/each}
				</div>
				<div class="border-t border-gray-200 pt-4 space-y-2">
					<div class="flex justify-between text-sm">
						<span>Subtotal</span>
						<span>৳{data.total.toFixed(2)}</span>
					</div>
					{#if discountAmount > 0}
						<div class="flex justify-between text-sm text-green-600">
							<span>Discount ({appliedCoupon?.code})</span>
							<span>-৳{discountAmount.toFixed(2)}</span>
						</div>
					{/if}
					<div class="flex justify-between text-sm">
						<span>Shipping</span>
						<span>
							{#if freeShipping}
								<span class="text-green-600">Free</span>
							{:else}
								৳{shippingCost.toFixed(2)}
							{/if}
						</span>
					</div>
					<div class="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
						<span>Total</span>
						<span class="text-green-600">৳{totalAmount.toFixed(2)}</span>
					</div>
				</div>
				<a
					href="/cart"
					class="block text-center mt-4 text-blue-600 no-underline hover:underline text-sm"
				>
					← Back to Cart
				</a>
			</div>
		</div>
	</div>
</div>

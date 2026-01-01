<!-- VIEW: User profile page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	export const params = {};

	let customer_name = data.user?.customer_name || '';
	let customer_address = data.user?.customer_address || '';
	let customer_phone = data.user?.customer_phone || '';
	let customer_city = data.user?.customer_city || '';
	let customer_postal_code = data.user?.customer_postal_code || '';
	let customer_country = data.user?.customer_country || 'Bangladesh';

	$: profileComplete = customer_name && customer_address && customer_phone && customer_city;
</script>

<svelte:head>
	<title>Profile - TinyTech</title>
</svelte:head>

<div class="max-w-3xl mx-auto p-8 bg-gray-50 min-h-screen">
	<h1 class="mb-8 text-center text-4xl font-bold text-gray-900">Your Profile</h1>

	{#if data.error}
		<div class="bg-red-50 border-2 border-red-500 text-red-700 p-4 rounded-lg mb-6">
			<p class="font-semibold">Error: {data.error}</p>
		</div>
	{/if}

	{#if form?.error}
		<div class="bg-red-50 border-2 border-red-500 text-red-700 p-4 rounded-lg mb-6">
			{form.error}
		</div>
	{/if}

	{#if form?.success}
		<div class="bg-green-50 border-2 border-green-500 text-green-700 p-4 rounded-lg mb-6">
			{form.message || 'Profile updated successfully!'}
		</div>
	{/if}

	<!-- Account Information -->
	<div class="bg-white p-8 rounded-lg shadow-lg border-2 border-gray-200 mb-6">
		<h2 class="text-2xl font-bold mb-6 text-gray-900">Account Information</h2>
		<div class="space-y-4">
			<div class="py-3 border-b border-gray-200">
				<strong class="inline-block min-w-[150px] text-gray-700 font-semibold">ID:</strong>
				<span class="text-gray-900">{data.user?.id || 'N/A'}</span>
			</div>
			<div class="py-3 border-b border-gray-200">
				<strong class="inline-block min-w-[150px] text-gray-700 font-semibold">Email:</strong>
				<span class="text-gray-900">{data.user?.email || 'N/A'}</span>
			</div>
			<div class="py-3 border-b border-gray-200">
				<strong class="inline-block min-w-[150px] text-gray-700 font-semibold">Name:</strong>
				<span class="text-gray-900">{data.user?.name || data.user?.user_metadata?.name || 'Not set'}</span>
			</div>
		</div>
	</div>

	<!-- Checkout Information Form -->
	<div class="bg-white p-8 rounded-lg shadow-lg border-2 border-gray-200">
		<div class="flex items-center justify-between mb-6">
			<h2 class="text-2xl font-bold text-gray-900">Checkout Information</h2>
			{#if profileComplete}
				<span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
					✓ Profile Complete
				</span>
			{:else}
				<span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
					⚠ Incomplete
				</span>
			{/if}
		</div>

		<p class="text-gray-600 mb-6">
			Complete your profile to automatically fill checkout information when placing orders.
		</p>

		<form method="POST" action="?/update" use:enhance>
			<div class="mb-4">
				<label for="customer_name" class="block mb-2 text-sm font-medium text-gray-700">
					Full Name <span class="text-red-500">*</span>
				</label>
				<input
					type="text"
					id="customer_name"
					name="customer_name"
					bind:value={customer_name}
					required
					class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
					placeholder="Enter your full name"
				/>
			</div>

			<div class="mb-4">
				<label for="customer_address" class="block mb-2 text-sm font-medium text-gray-700">
					Address <span class="text-red-500">*</span>
				</label>
				<input
					type="text"
					id="customer_address"
					name="customer_address"
					bind:value={customer_address}
					required
					class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
					placeholder="Street address, apartment, suite, etc."
				/>
			</div>

			<div class="grid grid-cols-2 gap-4 mb-4">
				<div>
					<label for="customer_city" class="block mb-2 text-sm font-medium text-gray-700">
						City <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="customer_city"
						name="customer_city"
						bind:value={customer_city}
						required
						class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						placeholder="City"
					/>
				</div>
				<div>
					<label for="customer_postal_code" class="block mb-2 text-sm font-medium text-gray-700">
						Postal Code
					</label>
					<input
						type="text"
						id="customer_postal_code"
						name="customer_postal_code"
						bind:value={customer_postal_code}
						class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						placeholder="Postal code"
					/>
				</div>
			</div>

			<div class="mb-4">
				<label for="customer_country" class="block mb-2 text-sm font-medium text-gray-700">
					Country/Region
				</label>
				<select
					id="customer_country"
					name="customer_country"
					bind:value={customer_country}
					class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
				>
					<option value="Bangladesh">Bangladesh</option>
					<option value="India">India</option>
					<option value="Pakistan">Pakistan</option>
					<option value="Other">Other</option>
				</select>
			</div>

			<div class="mb-6">
				<label for="customer_phone" class="block mb-2 text-sm font-medium text-gray-700">
					Phone Number <span class="text-red-500">*</span>
				</label>
				<input
					type="tel"
					id="customer_phone"
					name="customer_phone"
					bind:value={customer_phone}
					required
					class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
					placeholder="+8801234567890"
				/>
			</div>

			<button
				type="submit"
				class="w-full bg-indigo-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer text-base font-semibold transition-colors hover:bg-indigo-700"
			>
				Save Profile Information
			</button>
		</form>
	</div>
</div>


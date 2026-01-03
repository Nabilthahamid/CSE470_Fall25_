<!-- VIEW: Shipping Management Page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { PageData, ActionData } from './$types';
	// Shipping service removed - using form action for rate calculation

	export let data: PageData;
	export let form: ActionData;
	export let params: Record<string, string> = {};

	let activeTab = data.activeTab || 'providers';
	let showProviderForm = false;
	let showZoneForm = false;
	let editingProvider: any = null;
	let editingZone: any = null;
	let calculatedRates: any[] = [];
	let handledSuccess = false;

	// Provider form
	let providerName = '';
	let providerCode = '';
	let providerApiKey = '';
	let providerApiSecret = '';
	let providerIsActive = true;
	let providerBaseRate = 0;
	let providerRatePerKg = 0;
	let providerRatePerKm = 0;
	let providerDaysMin = 1;
	let providerDaysMax = 7;

	// Zone form
	let zoneName = '';
	let zoneDescription = '';
	let zoneCountry = '';
	let zoneRegions = '';
	let zoneBaseRate = 0;
	let zoneRatePerKg = 0;
	let zoneProviderId = '';
	let zoneIsActive = true;
	let zoneDaysMin = 1;
	let zoneDaysMax = 7;

	// Rate calculator
	let calcWeight = 1;
	let calcCountry = 'Bangladesh';
	let calcRegion = '';
	let calcCity = '';
	let calcPostalCode = '';
	let calcValue = 0;

	// Handle calculated rates from form action
	$: if (form?.rates) {
		calculatedRates = form.rates;
	}

	function editProvider(provider: any) {
		editingProvider = provider;
		providerName = provider.name;
		providerCode = provider.code;
		providerApiKey = provider.api_key || '';
		providerApiSecret = provider.api_secret || '';
		providerIsActive = provider.is_active ?? true;
		providerBaseRate = provider.base_rate;
		providerRatePerKg = provider.rate_per_kg || 0;
		providerRatePerKm = provider.rate_per_km || 0;
		providerDaysMin = provider.estimated_days_min;
		providerDaysMax = provider.estimated_days_max;
		showProviderForm = true;
	}

	function editZone(zone: any) {
		editingZone = zone;
		zoneName = zone.name;
		zoneDescription = zone.description || '';
		zoneCountry = zone.country || '';
		zoneRegions = zone.regions?.join(', ') || '';
		zoneBaseRate = zone.base_rate;
		zoneRatePerKg = zone.rate_per_kg || 0;
		zoneProviderId = zone.provider_id || '';
		zoneIsActive = zone.is_active ?? true;
		zoneDaysMin = zone.estimated_days_min;
		zoneDaysMax = zone.estimated_days_max;
		showZoneForm = true;
	}

	function resetProviderForm() {
		editingProvider = null;
		providerName = '';
		providerCode = '';
		providerApiKey = '';
		providerApiSecret = '';
		providerIsActive = true;
		providerBaseRate = 0;
		providerRatePerKg = 0;
		providerRatePerKm = 0;
		providerDaysMin = 1;
		providerDaysMax = 7;
		showProviderForm = false;
	}

	function resetZoneForm() {
		editingZone = null;
		zoneName = '';
		zoneDescription = '';
		zoneCountry = '';
		zoneRegions = '';
		zoneBaseRate = 0;
		zoneRatePerKg = 0;
		zoneProviderId = '';
		zoneIsActive = true;
		zoneDaysMin = 1;
		zoneDaysMax = 7;
		showZoneForm = false;
	}

	// Handle form success
	$: if (form?.success && !handledSuccess) {
		handledSuccess = true;
		resetProviderForm();
		resetZoneForm();
		setTimeout(() => {
			window.location.reload();
		}, 500);
	}

	// Reset handledSuccess when form changes
	$: if (!form?.success) {
		handledSuccess = false;
	}
</script>

<svelte:head>
	<title>Shipping Management - Admin Dashboard</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<h1 class="text-3xl font-bold text-gray-900 mb-8">Shipping Management</h1>

	<!-- Tabs -->
	<div class="mb-6 border-b border-gray-200">
		<div class="flex gap-4">
			<button
				on:click={() => activeTab = 'providers'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'providers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Shipping Providers
			</button>
			<button
				on:click={() => activeTab = 'zones'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'zones' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Shipping Zones
			</button>
			<button
				on:click={() => activeTab = 'calculator'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'calculator' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Rate Calculator
			</button>
		</div>
	</div>

	{#if form?.error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
			{form.error}
		</div>
	{/if}

	{#if form?.success}
		<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
			Operation successful!
		</div>
	{/if}

	<!-- Providers Tab -->
	{#if activeTab === 'providers'}
		<div class="space-y-6">
			<div class="flex justify-between items-center">
				<h2 class="text-2xl font-bold text-gray-900">Shipping Providers</h2>
				<button
					on:click={() => {
						resetProviderForm();
						showProviderForm = true;
					}}
					class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
				>
					+ Add Provider
				</button>
			</div>

			{#if showProviderForm}
				<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
					<h3 class="text-xl font-bold text-gray-900 mb-4">
						{editingProvider ? 'Edit Provider' : 'Create New Provider'}
					</h3>
					<form method="POST" action={editingProvider ? '?/updateProvider' : '?/createProvider'} use:enhance>
						{#if editingProvider}
							<input type="hidden" name="id" value={editingProvider.id} />
						{/if}
						<input type="hidden" name="is_active" value={providerIsActive ? 'true' : 'false'} />
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label class="block mb-2 font-medium">Name *</label>
								<input
									type="text"
									name="name"
									bind:value={providerName}
									required
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Code *</label>
								<input
									type="text"
									name="code"
									bind:value={providerCode}
									required
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
									placeholder="e.g., DHL, FEDEX"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">API Key</label>
								<input
									type="text"
									name="api_key"
									bind:value={providerApiKey}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">API Secret</label>
								<input
									type="password"
									name="api_secret"
									bind:value={providerApiSecret}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Base Rate (Tk) *</label>
								<input
									type="number"
									name="base_rate"
									bind:value={providerBaseRate}
									required
									min="0"
									step="0.01"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Rate per KG (Tk)</label>
								<input
									type="number"
									name="rate_per_kg"
									bind:value={providerRatePerKg}
									min="0"
									step="0.01"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Rate per KM (Tk)</label>
								<input
									type="number"
									name="rate_per_km"
									bind:value={providerRatePerKm}
									min="0"
									step="0.01"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Estimated Days (Min) *</label>
								<input
									type="number"
									name="estimated_days_min"
									bind:value={providerDaysMin}
									required
									min="1"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Estimated Days (Max) *</label>
								<input
									type="number"
									name="estimated_days_max"
									bind:value={providerDaysMax}
									required
									min="1"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="flex items-center gap-2 mt-6">
									<input
										type="checkbox"
										bind:checked={providerIsActive}
										class="w-4 h-4"
									/>
									<span>Active</span>
								</label>
							</div>
						</div>
						<div class="mt-6 flex gap-3">
							<button type="submit" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
								{editingProvider ? 'Update' : 'Create'} Provider
							</button>
							<button type="button" on:click={resetProviderForm} class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">
								Cancel
							</button>
						</div>
					</form>
				</div>
			{/if}

			<!-- Providers List -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h3 class="text-xl font-bold text-gray-900 mb-4">All Providers</h3>
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Rate</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate/KG</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Days</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							{#each data.providers as provider}
								<tr>
									<td class="px-6 py-4 font-medium text-gray-900">{provider.name}</td>
									<td class="px-6 py-4 text-gray-600">{provider.code}</td>
									<td class="px-6 py-4 text-gray-600">Tk {provider.base_rate.toFixed(2)}</td>
									<td class="px-6 py-4 text-gray-600">{provider.rate_per_kg ? `Tk ${provider.rate_per_kg.toFixed(2)}` : 'N/A'}</td>
									<td class="px-6 py-4 text-gray-600">{provider.estimated_days_min}-{provider.estimated_days_max} days</td>
									<td class="px-6 py-4">
										<span class="px-2 py-1 text-xs font-semibold rounded-full {provider.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
											{provider.is_active ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td class="px-6 py-4">
										<div class="flex gap-2">
											<button
												on:click={() => editProvider(provider)}
												class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
											>
												Edit
											</button>
											<form method="POST" action="?/deleteProvider" use:enhance class="inline">
												<input type="hidden" name="id" value={provider.id} />
												<button
													type="submit"
													class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
													on:click={(e) => {
														if (!confirm('Delete this provider?')) e.preventDefault();
													}}
												>
													Delete
												</button>
											</form>
										</div>
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="7" class="px-6 py-8 text-center text-gray-500">No providers found</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}

	<!-- Zones Tab -->
	{#if activeTab === 'zones'}
		<div class="space-y-6">
			<div class="flex justify-between items-center">
				<h2 class="text-2xl font-bold text-gray-900">Shipping Zones</h2>
				<button
					on:click={() => {
						resetZoneForm();
						showZoneForm = true;
					}}
					class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
				>
					+ Add Zone
				</button>
			</div>

			{#if showZoneForm}
				<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
					<h3 class="text-xl font-bold text-gray-900 mb-4">
						{editingZone ? 'Edit Zone' : 'Create New Zone'}
					</h3>
					<form method="POST" action={editingZone ? '?/updateZone' : '?/createZone'} use:enhance>
						{#if editingZone}
							<input type="hidden" name="id" value={editingZone.id} />
						{/if}
						<input type="hidden" name="is_active" value={zoneIsActive ? 'true' : 'false'} />
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label class="block mb-2 font-medium">Name *</label>
								<input
									type="text"
									name="name"
									bind:value={zoneName}
									required
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Country</label>
								<input
									type="text"
									name="country"
									bind:value={zoneCountry}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
									placeholder="e.g., Bangladesh"
								/>
							</div>
							<div class="md:col-span-2">
								<label class="block mb-2 font-medium">Regions (comma-separated) *</label>
								<input
									type="text"
									name="regions"
									bind:value={zoneRegions}
									required
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
									placeholder="e.g., Dhaka, Chittagong, Sylhet"
								/>
							</div>
							<div class="md:col-span-2">
								<label class="block mb-2 font-medium">Description</label>
								<textarea
									name="description"
									bind:value={zoneDescription}
									rows="2"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								></textarea>
							</div>
							<div>
								<label class="block mb-2 font-medium">Base Rate (Tk) *</label>
								<input
									type="number"
									name="base_rate"
									bind:value={zoneBaseRate}
									required
									min="0"
									step="0.01"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Rate per KG (Tk)</label>
								<input
									type="number"
									name="rate_per_kg"
									bind:value={zoneRatePerKg}
									min="0"
									step="0.01"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Provider</label>
								<select
									name="provider_id"
									bind:value={zoneProviderId}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								>
									<option value="">None</option>
									{#each data.providers as provider}
										<option value={provider.id}>{provider.name}</option>
									{/each}
								</select>
							</div>
							<div>
								<label class="block mb-2 font-medium">Estimated Days (Min) *</label>
								<input
									type="number"
									name="estimated_days_min"
									bind:value={zoneDaysMin}
									required
									min="1"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Estimated Days (Max) *</label>
								<input
									type="number"
									name="estimated_days_max"
									bind:value={zoneDaysMax}
									required
									min="1"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="flex items-center gap-2 mt-6">
									<input
										type="checkbox"
										bind:checked={zoneIsActive}
										class="w-4 h-4"
									/>
									<span>Active</span>
								</label>
							</div>
						</div>
						<div class="mt-6 flex gap-3">
							<button type="submit" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
								{editingZone ? 'Update' : 'Create'} Zone
							</button>
							<button type="button" on:click={resetZoneForm} class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">
								Cancel
							</button>
						</div>
					</form>
				</div>
			{/if}

			<!-- Zones List -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h3 class="text-xl font-bold text-gray-900 mb-4">All Zones</h3>
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Regions</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Rate</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Days</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							{#each data.zones as zone}
								<tr>
									<td class="px-6 py-4 font-medium text-gray-900">{zone.name}</td>
									<td class="px-6 py-4 text-gray-600">{zone.country || 'All'}</td>
									<td class="px-6 py-4 text-gray-600">{zone.regions?.join(', ') || 'N/A'}</td>
									<td class="px-6 py-4 text-gray-600">Tk {zone.base_rate.toFixed(2)}</td>
									<td class="px-6 py-4 text-gray-600">{zone.estimated_days_min}-{zone.estimated_days_max} days</td>
									<td class="px-6 py-4">
										<span class="px-2 py-1 text-xs font-semibold rounded-full {zone.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
											{zone.is_active ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td class="px-6 py-4">
										<div class="flex gap-2">
											<button
												on:click={() => editZone(zone)}
												class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
											>
												Edit
											</button>
											<form method="POST" action="?/deleteZone" use:enhance class="inline">
												<input type="hidden" name="id" value={zone.id} />
												<button
													type="submit"
													class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
													on:click={(e) => {
														if (!confirm('Delete this zone?')) e.preventDefault();
													}}
												>
													Delete
												</button>
											</form>
										</div>
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="7" class="px-6 py-8 text-center text-gray-500">No zones found</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}

	<!-- Rate Calculator Tab -->
	{#if activeTab === 'calculator'}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<h2 class="text-2xl font-bold text-gray-900 mb-6">Shipping Rate Calculator</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<h3 class="text-lg font-semibold text-gray-900 mb-4">Calculate Shipping</h3>
					<form method="POST" action="?/calculateRate" use:enhance>
						<div class="space-y-4">
							<div>
								<label class="block mb-2 font-medium">Weight (kg) *</label>
								<input
									type="number"
									name="weight"
									bind:value={calcWeight}
									min="0"
									step="0.1"
									required
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Country *</label>
								<input
									type="text"
									name="country"
									bind:value={calcCountry}
									required
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Region</label>
								<input
									type="text"
									name="region"
									bind:value={calcRegion}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
									placeholder="e.g., Dhaka"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">City</label>
								<input
									type="text"
									name="city"
									bind:value={calcCity}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Postal Code</label>
								<input
									type="text"
									name="postal_code"
									bind:value={calcPostalCode}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Order Value (Tk)</label>
								<input
									type="number"
									name="value"
									bind:value={calcValue}
									min="0"
									step="0.01"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<button
								type="submit"
								class="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
							>
								Calculate Rates
							</button>
						</div>
					</form>
				</div>
				<div>
					<h3 class="text-lg font-semibold text-gray-900 mb-4">Available Rates</h3>
					{#if calculatedRates.length > 0}
						<div class="space-y-3">
							{#each calculatedRates as rate}
								<div class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
									<div class="flex justify-between items-start mb-2">
										<div>
											<p class="font-semibold text-gray-900">{rate.provider}</p>
											<p class="text-sm text-gray-600">{rate.zone}</p>
										</div>
										<p class="text-2xl font-bold text-indigo-600">Tk {rate.rate.toFixed(2)}</p>
									</div>
									<p class="text-sm text-gray-600">Estimated delivery: {rate.estimated_days} days</p>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-12 text-gray-500">
							<p>Enter shipping details and click "Calculate Rates" to see available options.</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>


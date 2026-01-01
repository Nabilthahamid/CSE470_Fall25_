<!-- VIEW: Discount Management Page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	export let params: Record<string, string> = {};

	let activeTab = data.activeTab || 'discounts';
	let showDiscountForm = false;
	let editingDiscount: any = null;
	let handledSuccess = false;
	let startDate = data.startDate || '';
	let endDate = data.endDate || '';

	// Discount form
	let discountCode = '';
	let discountName = '';
	let discountDescription = '';
	let discountType: 'percentage' | 'fixed_amount' | 'free_shipping' = 'percentage';
	let discountValue = 0;
	let minimumPurchase = 0;
	let maximumDiscount = 0;
	let usageLimitTotal = 0;
	let usageLimitPerCustomer = 0;
	let startDateInput = '';
	let endDateInput = '';
	let isActive = true;
	let applicableTo: 'all' | 'categories' | 'products' = 'all';
	let applicableIds = '';

	function editDiscount(discount: any) {
		editingDiscount = discount;
		discountCode = discount.code;
		discountName = discount.name;
		discountDescription = discount.description || '';
		discountType = discount.discount_type;
		discountValue = discount.discount_value;
		minimumPurchase = discount.minimum_purchase || 0;
		maximumDiscount = discount.maximum_discount || 0;
		usageLimitTotal = discount.usage_limit_total || 0;
		usageLimitPerCustomer = discount.usage_limit_per_customer || 0;
		// Convert ISO date to date format (YYYY-MM-DD)
		startDateInput = discount.start_date ? discount.start_date.split('T')[0] : '';
		endDateInput = discount.end_date ? discount.end_date.split('T')[0] : '';
		isActive = discount.is_active ?? true;
		applicableTo = discount.applicable_to || 'all';
		applicableIds = discount.applicable_ids?.join(', ') || '';
		showDiscountForm = true;
	}

	function resetDiscountForm() {
		editingDiscount = null;
		discountCode = '';
		discountName = '';
		discountDescription = '';
		discountType = 'percentage';
		discountValue = 0;
		minimumPurchase = 0;
		maximumDiscount = 0;
		usageLimitTotal = 0;
		usageLimitPerCustomer = 0;
		startDateInput = '';
		endDateInput = '';
		isActive = true;
		applicableTo = 'all';
		applicableIds = '';
		showDiscountForm = false;
	}

	function applyDateFilter() {
		const params = new URLSearchParams();
		if (startDate) params.set('startDate', startDate);
		if (endDate) params.set('endDate', endDate);
		params.set('tab', activeTab);
		window.location.href = `/admin/marketing/discounts?${params.toString()}`;
	}

	function getStatusColor(discount: any): string {
		if (!discount.is_active) return 'bg-gray-100 text-gray-800';
		const now = new Date().toISOString();
		if (discount.start_date && discount.start_date > now) return 'bg-yellow-100 text-yellow-800';
		if (discount.end_date && discount.end_date < now) return 'bg-red-100 text-red-800';
		return 'bg-green-100 text-green-800';
	}

	function getStatusText(discount: any): string {
		if (!discount.is_active) return 'Inactive';
		const now = new Date().toISOString();
		if (discount.start_date && discount.start_date > now) return 'Scheduled';
		if (discount.end_date && discount.end_date < now) return 'Expired';
		return 'Active';
	}

	// Handle form success
	$: if (form?.success && !handledSuccess) {
		handledSuccess = true;
		resetDiscountForm();
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
	<title>Discount Management - Admin Dashboard</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<h1 class="text-3xl font-bold text-gray-900 mb-8">Discount & Coupon Management</h1>

	<!-- Date Filter -->
	<div class="bg-white rounded-xl shadow-lg p-4 border border-gray-200 mb-6">
		<div class="flex flex-wrap items-end gap-4">
			<div>
				<label class="block mb-2 text-sm font-medium">Start Date</label>
				<input
					type="date"
					bind:value={startDate}
					class="p-2 border-2 border-gray-300 rounded-lg"
				/>
			</div>
			<div>
				<label class="block mb-2 text-sm font-medium">End Date</label>
				<input
					type="date"
					bind:value={endDate}
					class="p-2 border-2 border-gray-300 rounded-lg"
				/>
			</div>
			<button
				on:click={applyDateFilter}
				class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
			>
				Apply Filter
			</button>
			<button
				on:click={() => {
					startDate = '';
					endDate = '';
					window.location.href = '/admin/marketing/discounts';
				}}
				class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
			>
				Clear
			</button>
		</div>
	</div>

	<!-- Tabs -->
	<div class="mb-6 border-b border-gray-200">
		<div class="flex gap-4">
			<button
				on:click={() => activeTab = 'discounts'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'discounts' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Discounts
			</button>
			<button
				on:click={() => activeTab = 'analytics'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'analytics' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Analytics
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

	<!-- Discounts Tab -->
	{#if activeTab === 'discounts'}
		<div class="space-y-6">
			<div class="flex justify-between items-center">
				<h2 class="text-2xl font-bold text-gray-900">Discount Codes</h2>
				<button
					on:click={() => {
						resetDiscountForm();
						showDiscountForm = true;
					}}
					class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
				>
					+ Create Discount
				</button>
			</div>

			{#if showDiscountForm}
				<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
					<h3 class="text-xl font-bold text-gray-900 mb-4">
						{editingDiscount ? 'Edit Discount' : 'Create New Discount'}
					</h3>
					<form method="POST" action={editingDiscount ? '?/update' : '?/create'} use:enhance>
						{#if editingDiscount}
							<input type="hidden" name="id" value={editingDiscount.id} />
						{/if}
						<input type="hidden" name="is_active" value={isActive ? 'true' : 'false'} />
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label class="block mb-2 font-medium">Discount Code *</label>
								<input
									type="text"
									name="code"
									bind:value={discountCode}
									required
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
									placeholder="SAVE20"
									style="text-transform: uppercase;"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Name *</label>
								<input
									type="text"
									name="name"
									bind:value={discountName}
									required
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div class="md:col-span-2">
								<label class="block mb-2 font-medium">Description</label>
								<textarea
									name="description"
									bind:value={discountDescription}
									rows="2"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								></textarea>
							</div>
							<div>
								<label class="block mb-2 font-medium">Discount Type *</label>
								<select name="discount_type" bind:value={discountType} class="w-full p-3 border-2 border-gray-300 rounded-lg">
									<option value="percentage">Percentage</option>
									<option value="fixed_amount">Fixed Amount</option>
									<option value="free_shipping">Free Shipping</option>
								</select>
							</div>
							<div>
								<label class="block mb-2 font-medium">Discount Value *</label>
								<input
									type="number"
									name="discount_value"
									bind:value={discountValue}
									required
									min="0"
									step="0.01"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
									placeholder={discountType === 'percentage' ? '20 (for 20%)' : '100 (for Tk 100)'}
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Minimum Purchase</label>
								<input
									type="number"
									name="minimum_purchase"
									bind:value={minimumPurchase}
									min="0"
									step="0.01"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Maximum Discount (for %)</label>
								<input
									type="number"
									name="maximum_discount"
									bind:value={maximumDiscount}
									min="0"
									step="0.01"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Total Usage Limit</label>
								<input
									type="number"
									name="usage_limit_total"
									bind:value={usageLimitTotal}
									min="0"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Usage Limit Per Customer</label>
								<input
									type="number"
									name="usage_limit_per_customer"
									bind:value={usageLimitPerCustomer}
									min="0"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Start Date</label>
								<input
									type="date"
									name="start_date"
									bind:value={startDateInput}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">End Date</label>
								<input
									type="date"
									name="end_date"
									bind:value={endDateInput}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Applicable To</label>
								<select name="applicable_to" bind:value={applicableTo} class="w-full p-3 border-2 border-gray-300 rounded-lg">
									<option value="all">All Products</option>
									<option value="categories">Specific Categories</option>
									<option value="products">Specific Products</option>
								</select>
							</div>
							<div>
								<label class="block mb-2 font-medium">Applicable IDs (comma-separated)</label>
								<input
									type="text"
									name="applicable_ids"
									bind:value={applicableIds}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
									placeholder="Only if applicable to categories/products"
								/>
							</div>
							<div>
								<label class="flex items-center gap-2 mt-6">
									<input
										type="checkbox"
										bind:checked={isActive}
										class="w-4 h-4"
									/>
									<span>Active</span>
								</label>
							</div>
						</div>
						<div class="mt-6 flex gap-3">
							<button type="submit" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
								{editingDiscount ? 'Update' : 'Create'} Discount
							</button>
							<button type="button" on:click={resetDiscountForm} class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">
								Cancel
							</button>
						</div>
					</form>
				</div>
			{/if}

			<!-- Discounts List -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h3 class="text-xl font-bold text-gray-900 mb-4">All Discounts</h3>
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							{#each data.discounts as discount}
								<tr>
									<td class="px-6 py-4 font-mono font-semibold text-gray-900">{discount.code}</td>
									<td class="px-6 py-4 text-gray-600">{discount.name}</td>
									<td class="px-6 py-4 text-gray-600 capitalize">{discount.discount_type.replace('_', ' ')}</td>
									<td class="px-6 py-4 text-gray-600">
										{discount.discount_type === 'percentage' ? `${discount.discount_value}%` : discount.discount_type === 'free_shipping' ? 'Free Shipping' : `Tk ${discount.discount_value.toFixed(2)}`}
									</td>
									<td class="px-6 py-4 text-gray-600">
										{discount.used_count} / {discount.usage_limit_total || '∞'}
									</td>
									<td class="px-6 py-4">
										<span class="px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(discount)}">
											{getStatusText(discount)}
										</span>
									</td>
									<td class="px-6 py-4">
										<div class="flex gap-2">
											<button
												on:click={() => editDiscount(discount)}
												class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
											>
												Edit
											</button>
											<form method="POST" action="?/delete" use:enhance class="inline">
												<input type="hidden" name="id" value={discount.id} />
												<button
													type="submit"
													class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
													on:click={(e) => {
														if (!confirm('Delete this discount?')) e.preventDefault();
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
									<td colspan="7" class="px-6 py-8 text-center text-gray-500">No discounts found. Create your first discount!</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}

	<!-- Analytics Tab -->
	{#if activeTab === 'analytics'}
		<div class="space-y-6">
			<!-- Summary Cards -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
					<h3 class="text-sm font-semibold text-gray-600 mb-2">Total Discounts</h3>
					<p class="text-3xl font-bold text-gray-900">{data.analytics.totalDiscounts}</p>
				</div>
				<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
					<h3 class="text-sm font-semibold text-gray-600 mb-2">Active Discounts</h3>
					<p class="text-3xl font-bold text-indigo-600">{data.analytics.activeDiscounts}</p>
				</div>
				<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
					<h3 class="text-sm font-semibold text-gray-600 mb-2">Total Usage</h3>
					<p class="text-3xl font-bold text-green-600">{data.analytics.totalUsage}</p>
				</div>
				<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
					<h3 class="text-sm font-semibold text-gray-600 mb-2">Revenue Impact</h3>
					<p class="text-3xl font-bold text-red-600">Tk {data.analytics.revenueImpact.toFixed(2)}</p>
				</div>
			</div>

			<!-- Discounts by Type -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Discounts by Type</h2>
				<div class="space-y-3">
					{#each data.analytics.byType as item}
						<div>
							<div class="flex justify-between items-center mb-1">
								<span class="text-gray-700 font-medium capitalize">{item.type.replace('_', ' ')}</span>
								<span class="text-gray-900 font-semibold">{item.count} discounts • Tk {item.totalAmount.toFixed(2)}</span>
							</div>
							<div class="w-full bg-gray-200 rounded-full h-2">
								<div
									class="bg-indigo-600 h-2 rounded-full"
									style="width: {data.analytics.totalDiscountAmount > 0 ? (item.totalAmount / data.analytics.totalDiscountAmount) * 100 : 0}%"
								></div>
							</div>
						</div>
					{:else}
						<p class="text-gray-500 text-center py-4">No discount type data</p>
					{/each}
				</div>
			</div>

			<!-- Top Discounts -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Top Discounts</h2>
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							{#each data.analytics.topDiscounts as discount}
								<tr>
									<td class="px-6 py-4 font-mono font-semibold text-gray-900">{discount.code}</td>
									<td class="px-6 py-4 text-gray-600">{discount.usage} times</td>
									<td class="px-6 py-4 font-semibold text-gray-900">Tk {discount.totalAmount.toFixed(2)}</td>
								</tr>
							{:else}
								<tr>
									<td colspan="3" class="px-6 py-8 text-center text-gray-500">No usage data</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}
</div>


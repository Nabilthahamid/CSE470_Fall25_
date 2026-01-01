<!-- VIEW: Promotional Campaigns Page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	export let params: Record<string, string> = {};

	let showCampaignForm = false;
	let editingCampaign: any = null;
	let handledSuccess = false;

	// Campaign form
	let campaignName = '';
	let campaignDescription = '';
	let campaignType: 'flash_sale' | 'limited_time' | 'buy_x_get_y' | 'seasonal' | 'other' = 'flash_sale';
	let startDate = '';
	let endDate = '';
	let isActive = true;
	let discountId = '';
	let campaignProducts: Array<{ product_id: string; special_price?: number; discount_percentage?: number }> = [];
	let buyXGetYConfig: any = null;
	let imageUrl = '';

	function editCampaign(campaign: any) {
		editingCampaign = campaign;
		campaignName = campaign.name;
		campaignDescription = campaign.description || '';
		campaignType = campaign.campaign_type;
		// Convert ISO date to datetime-local format (YYYY-MM-DDTHH:mm)
		if (campaign.start_date) {
			const start = new Date(campaign.start_date);
			startDate = start.toISOString().slice(0, 16);
		} else {
			startDate = '';
		}
		if (campaign.end_date) {
			const end = new Date(campaign.end_date);
			endDate = end.toISOString().slice(0, 16);
		} else {
			endDate = '';
		}
		isActive = campaign.is_active ?? true;
		discountId = campaign.discount_id || '';
		campaignProducts = campaign.products || [];
		buyXGetYConfig = campaign.buy_x_get_y_config || null;
		imageUrl = campaign.image_url || '';
		showCampaignForm = true;
	}

	function resetCampaignForm() {
		editingCampaign = null;
		campaignName = '';
		campaignDescription = '';
		campaignType = 'flash_sale';
		startDate = '';
		endDate = '';
		isActive = true;
		discountId = '';
		campaignProducts = [];
		buyXGetYConfig = null;
		imageUrl = '';
		showCampaignForm = false;
	}

	function addProduct() {
		campaignProducts.push({ product_id: '', special_price: 0, discount_percentage: 0 });
	}

	function removeProduct(index: number) {
		campaignProducts.splice(index, 1);
	}

	function getStatusColor(campaign: any): string {
		if (!campaign.is_active) return 'bg-gray-100 text-gray-800';
		const now = new Date().toISOString();
		if (campaign.start_date > now) return 'bg-yellow-100 text-yellow-800';
		if (campaign.end_date < now) return 'bg-red-100 text-red-800';
		return 'bg-green-100 text-green-800';
	}

	function getStatusText(campaign: any): string {
		if (!campaign.is_active) return 'Inactive';
		const now = new Date().toISOString();
		if (campaign.start_date > now) return 'Scheduled';
		if (campaign.end_date < now) return 'Ended';
		return 'Active';
	}

	// Handle form success
	$: if (form?.success && !handledSuccess) {
		handledSuccess = true;
		resetCampaignForm();
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
	<title>Promotional Campaigns - Admin Dashboard</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<h1 class="text-3xl font-bold text-gray-900 mb-8">Promotional Campaigns</h1>

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

	<div class="flex justify-between items-center mb-6">
		<p class="text-gray-600">Manage flash sales, limited-time offers, and promotional campaigns</p>
		<button
			on:click={() => {
				resetCampaignForm();
				showCampaignForm = true;
			}}
			class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
		>
			+ Create Campaign
		</button>
	</div>

	{#if showCampaignForm}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6">
			<h2 class="text-xl font-bold text-gray-900 mb-4">
				{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
			</h2>
			<form method="POST" action={editingCampaign ? '?/update' : '?/create'} use:enhance>
				{#if editingCampaign}
					<input type="hidden" name="id" value={editingCampaign.id} />
				{/if}
				<input type="hidden" name="is_active" value={isActive ? 'true' : 'false'} />
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="block mb-2 font-medium">Campaign Name *</label>
						<input
							type="text"
							name="name"
							bind:value={campaignName}
							required
							class="w-full p-3 border-2 border-gray-300 rounded-lg"
						/>
					</div>
					<div>
						<label class="block mb-2 font-medium">Campaign Type *</label>
						<select name="campaign_type" bind:value={campaignType} class="w-full p-3 border-2 border-gray-300 rounded-lg">
							<option value="flash_sale">Flash Sale</option>
							<option value="limited_time">Limited Time Offer</option>
							<option value="buy_x_get_y">Buy X Get Y</option>
							<option value="seasonal">Seasonal Promotion</option>
							<option value="other">Other</option>
						</select>
					</div>
					<div>
						<label class="block mb-2 font-medium">Start Date *</label>
						<input
							type="datetime-local"
							name="start_date"
							bind:value={startDate}
							required
							class="w-full p-3 border-2 border-gray-300 rounded-lg"
						/>
					</div>
					<div>
						<label class="block mb-2 font-medium">End Date *</label>
						<input
							type="datetime-local"
							name="end_date"
							bind:value={endDate}
							required
							class="w-full p-3 border-2 border-gray-300 rounded-lg"
						/>
					</div>
					<div>
						<label class="block mb-2 font-medium">Discount Code</label>
						<select name="discount_id" bind:value={discountId} class="w-full p-3 border-2 border-gray-300 rounded-lg">
							<option value="">None</option>
							{#each data.discounts as discount}
								<option value={discount.id}>{discount.code} - {discount.name}</option>
							{/each}
						</select>
					</div>
					<div>
						<label class="block mb-2 font-medium">Image URL</label>
						<input
							type="url"
							name="image_url"
							bind:value={imageUrl}
							class="w-full p-3 border-2 border-gray-300 rounded-lg"
						/>
					</div>
					<div class="md:col-span-2">
						<label class="block mb-2 font-medium">Description</label>
						<textarea
							name="description"
							bind:value={campaignDescription}
							rows="3"
							class="w-full p-3 border-2 border-gray-300 rounded-lg"
						></textarea>
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
				<input type="hidden" name="products" value={JSON.stringify(campaignProducts)} />
				<input type="hidden" name="buy_x_get_y_config" value={buyXGetYConfig ? JSON.stringify(buyXGetYConfig) : ''} />
				<div class="mt-6 flex gap-3">
					<button type="submit" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
						{editingCampaign ? 'Update' : 'Create'} Campaign
					</button>
					<button type="button" on:click={resetCampaignForm} class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">
						Cancel
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Campaigns List -->
	<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
		<h2 class="text-xl font-bold text-gray-900 mb-4">All Campaigns</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each data.campaigns as campaign}
				<div class="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
					{#if campaign.image_url}
						<img src={campaign.image_url} alt={campaign.name} class="w-full h-32 object-cover rounded mb-3" />
					{/if}
					<h3 class="text-lg font-bold text-gray-900 mb-2">{campaign.name}</h3>
					<p class="text-sm text-gray-600 mb-3">{campaign.description || 'No description'}</p>
					<div class="space-y-1 mb-3 text-sm">
						<p class="text-gray-600"><strong>Type:</strong> <span class="capitalize">{campaign.campaign_type.replace('_', ' ')}</span></p>
						<p class="text-gray-600"><strong>Start:</strong> {new Date(campaign.start_date).toLocaleString()}</p>
						<p class="text-gray-600"><strong>End:</strong> {new Date(campaign.end_date).toLocaleString()}</p>
					</div>
					<div class="flex items-center justify-between">
						<span class="px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(campaign)}">
							{getStatusText(campaign)}
						</span>
						<div class="flex gap-2">
							<button
								on:click={() => editCampaign(campaign)}
								class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
							>
								Edit
							</button>
							<form method="POST" action="?/delete" use:enhance class="inline">
								<input type="hidden" name="id" value={campaign.id} />
								<button
									type="submit"
									class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
									on:click={(e) => {
										if (!confirm('Delete this campaign?')) e.preventDefault();
									}}
								>
									Delete
								</button>
							</form>
						</div>
					</div>
				</div>
			{:else}
				<div class="col-span-full text-center py-12 text-gray-500">
					No campaigns found. Create your first campaign!
				</div>
			{/each}
		</div>
	</div>
</div>


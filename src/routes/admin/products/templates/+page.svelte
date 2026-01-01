<!-- VIEW: Product Templates Page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	export let params: Record<string, string> = {};

	let showTemplateForm = false;
	let showCreateProductModal = false;
	let selectedTemplate: any = null;
	let productName = '';

	function openCreateModal(template: any) {
		selectedTemplate = template;
		productName = '';
		showCreateProductModal = true;
	}
</script>

<svelte:head>
	<title>Product Templates - Admin Dashboard</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<h1 class="text-3xl font-bold text-gray-900 mb-8">Product Templates</h1>

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
		<p class="text-gray-600">Save product templates for quick creation</p>
		<button
			on:click={() => (showTemplateForm = true)}
			class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
		>
			+ Create Template
		</button>
	</div>

	<!-- Templates List -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each data.templates as template}
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h3 class="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
				{#if template.description}
					<p class="text-gray-600 mb-4">{template.description}</p>
				{/if}
				<div class="space-y-2 mb-4">
					<p class="text-sm text-gray-600"><strong>Base Price:</strong> Tk {template.base_price.toFixed(2)}</p>
					<p class="text-sm text-gray-600"><strong>Default Stock:</strong> {template.default_stock}</p>
					{#if template.brand}
						<p class="text-sm text-gray-600"><strong>Brand:</strong> {template.brand}</p>
					{/if}
					{#if template.tags && template.tags.length > 0}
						<div class="flex flex-wrap gap-1">
							{#each template.tags as tag}
								<span class="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">{tag}</span>
							{/each}
						</div>
					{/if}
				</div>
				<div class="flex gap-2">
					<button
						on:click={() => openCreateModal(template)}
						class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
					>
						Create Product
					</button>
					<form method="POST" action="?/delete" use:enhance class="inline">
						<input type="hidden" name="id" value={template.id} />
						<button
							type="submit"
							class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
							on:click={(e) => {
								if (!confirm('Delete this template?')) e.preventDefault();
							}}
						>
							Delete
						</button>
					</form>
				</div>
			</div>
		{:else}
			<div class="col-span-full text-center py-12 text-gray-500">
				No templates found. Create your first template!
			</div>
		{/each}
	</div>

	<!-- Create Product from Template Modal -->
	{#if showCreateProductModal && selectedTemplate}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
			on:click={() => (showCreateProductModal = false)}
		>
			<div
				class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
				on:click|stopPropagation
			>
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Create Product from Template</h2>
				<form method="POST" action="?/createFromTemplate" use:enhance>
					<input type="hidden" name="template_id" value={selectedTemplate.id} />
					<div class="mb-4">
						<label class="block mb-2 font-medium">Product Name *</label>
						<input
							type="text"
							name="product_name"
							bind:value={productName}
							required
							class="w-full p-3 border-2 border-gray-300 rounded-lg"
						/>
					</div>
					<div class="flex gap-3">
						<button type="submit" class="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
							Create Product
						</button>
						<button
							type="button"
							on:click={() => (showCreateProductModal = false)}
							class="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>


<!-- VIEW: Bulk Operations Page -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { toast } from '$lib/stores/toast';

	export let data: PageData;
	// Accept params prop from SvelteKit (even if unused)
	export let params: Record<string, string> = {} as any;

	let selectedProducts = new Set<string>();
	let selectAll = false;
	let activeTab: 'price' | 'stock' | 'category' | 'delete' | 'import' | 'export' = 'price';

	// Price update
	let priceUpdateType: 'percentage' | 'fixed' = 'percentage';
	let priceValue = 0;
	let updatingPrices = false;

	// Stock update
	let stockUpdateType: 'set' | 'add' | 'subtract' = 'set';
	let stockValue = 0;

	// Category assignment
	let selectedCategory = '';

	// Import
	let importFile: File | null = null;
	let importPreview: any[] = [];
	let importing = false;
	let importResult: { success: number; failed: number } | null = null;

	// Export
	let exporting = false;

	onMount(() => {
		// Load products if needed
	});

	function toggleSelectAll() {
		selectAll = !selectAll;
		if (selectAll) {
			selectedProducts = new Set(data.products.map(p => p.id));
		} else {
			selectedProducts = new Set();
		}
	}

	function toggleProduct(id: string) {
		const newSet = new Set(selectedProducts);
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		selectedProducts = newSet;
		selectAll = selectedProducts.size === data.products.length;
	}

	async function handleBulkPriceUpdate() {
		if (selectedProducts.size === 0) {
			toast.error('Please select at least one product');
			return;
		}

		if (priceValue === 0 && priceUpdateType === 'fixed') {
			toast.error('Please enter a value greater than 0');
			return;
		}

		if (isNaN(priceValue)) {
			toast.error('Please enter a valid number');
			return;
		}

		const numericValue = priceValue;

		if (priceUpdateType === 'percentage' && (numericValue < -100 || numericValue > 1000)) {
			toast.error('Percentage must be between -100 and 1000');
			return;
		}

		if (!confirm(`Update price for ${selectedProducts.size} products?`)) return;

		updatingPrices = true;
		try {
			const response = await fetch('/api/admin/bulk-operations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					operation: 'bulk_price_update',
					data: {
						productIds: Array.from(selectedProducts),
						updateType: priceUpdateType,
						value: numericValue
					}
				})
			});

			const result = await response.json();
			if (result.success) {
				toast.success(`Successfully updated ${result.updated} products`);
				// Reset form
				priceValue = 0;
				selectedProducts = new Set();
				selectAll = false;
				// Reload page to show updated prices
				setTimeout(() => {
					goto('/admin/inventory/bulk-operations', { invalidateAll: true });
				}, 1000);
			} else {
				toast.error(result.error || 'Failed to update prices');
			}
		} catch (error: any) {
			console.error('Error updating prices:', error);
			toast.error('Error: ' + (error.message || 'Failed to update prices'));
		} finally {
			updatingPrices = false;
		}
	}

	async function handleBulkStockUpdate() {
		if (selectedProducts.size === 0) {
			alert('Please select at least one product');
			return;
		}

		if (!confirm(`Update stock for ${selectedProducts.size} products?`)) return;

		try {
			const response = await fetch('/api/admin/bulk-operations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					operation: 'bulk_stock_update',
					data: {
						productIds: Array.from(selectedProducts),
						updateType: stockUpdateType,
						value: stockValue
					}
				})
			});

			const result = await response.json();
			if (result.success) {
				alert(`Successfully updated ${result.updated} products`);
				goto('/admin/inventory/bulk-operations');
			} else {
				alert(result.error || 'Failed to update stock');
			}
		} catch (error: any) {
			alert('Error: ' + error.message);
		}
	}

	async function handleBulkCategoryAssign() {
		if (selectedProducts.size === 0) {
			alert('Please select at least one product');
			return;
		}

		if (!confirm(`Assign category to ${selectedProducts.size} products?`)) return;

		try {
			const response = await fetch('/api/admin/bulk-operations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					operation: 'bulk_category_assign',
					data: {
						productIds: Array.from(selectedProducts),
						categoryId: selectedCategory || null
					}
				})
			});

			const result = await response.json();
			if (result.success) {
				alert(`Successfully updated ${result.updated} products`);
				goto('/admin/inventory/bulk-operations');
			} else {
				alert(result.error || 'Failed to assign category');
			}
		} catch (error: any) {
			alert('Error: ' + error.message);
		}
	}

	async function handleBulkDelete() {
		if (selectedProducts.size === 0) {
			alert('Please select at least one product');
			return;
		}

		if (!confirm(`Delete ${selectedProducts.size} products? This action cannot be undone!`)) return;

		try {
			const response = await fetch('/api/admin/bulk-operations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					operation: 'bulk_delete',
					data: {
						productIds: Array.from(selectedProducts)
					}
				})
			});

			const result = await response.json();
			if (result.success) {
				alert(`Successfully deleted ${result.deleted} products`);
				goto('/admin/inventory/bulk-operations');
			} else {
				alert(result.error || 'Failed to delete products');
			}
		} catch (error: any) {
			alert('Error: ' + error.message);
		}
	}

	async function handleExport() {
		exporting = true;
		try {
			const response = await fetch('/api/admin/bulk-operations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					operation: 'export_products'
				})
			});

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		} catch (error: any) {
			alert('Error: ' + error.message);
		} finally {
			exporting = false;
		}
	}

	async function handleImportFile(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		importFile = file;
		const text = await file.text();
		
		// Parse CSV preview (first 5 rows)
		const lines = text.split('\n').slice(0, 6);
		importPreview = lines.map(line => line.split(','));
	}

	async function handleImport() {
		if (!importFile) {
			alert('Please select a file');
			return;
		}

		importing = true;
		importResult = null;

		try {
			const text = await importFile.text();
			const response = await fetch('/api/admin/bulk-operations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					operation: 'import_products',
					data: { csvData: text }
				})
			});

			const result = await response.json();
			if (result.success) {
				importResult = { success: result.imported, failed: result.failed };
				alert(`Import complete: ${result.imported} successful, ${result.failed} failed`);
				goto('/admin/inventory/bulk-operations');
			} else {
				alert(result.error || 'Failed to import products');
			}
		} catch (error: any) {
			alert('Error: ' + error.message);
		} finally {
			importing = false;
		}
	}
</script>

<svelte:head>
	<title>Bulk Operations - Inventory Management</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<h1 class="text-3xl font-bold text-gray-900 mb-8">Bulk Operations</h1>

	<!-- Tabs -->
	<div class="mb-6 border-b border-gray-200">
		<div class="flex gap-4">
			<button
				on:click={() => activeTab = 'price'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'price' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Bulk Price Update
			</button>
			<button
				on:click={() => activeTab = 'stock'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'stock' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Bulk Stock Update
			</button>
			<button
				on:click={() => activeTab = 'category'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'category' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Bulk Category Assignment
			</button>
			<button
				on:click={() => activeTab = 'delete'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'delete' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Bulk Delete
			</button>
			<button
				on:click={() => activeTab = 'import'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'import' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Import Products
			</button>
			<button
				on:click={() => activeTab = 'export'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'export' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Export Products
			</button>
		</div>
	</div>

	<!-- Product Selection -->
	<div class="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-xl font-bold text-gray-900">Select Products</h2>
			<div class="flex items-center gap-4">
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" id="select-all" bind:checked={selectAll} on:change={toggleSelectAll} class="w-4 h-4" />
					<span class="text-sm font-medium">Select All ({data.products.length})</span>
				</label>
				<span class="text-sm text-gray-600">
					{selectedProducts.size} selected
				</span>
			</div>
		</div>
		<div class="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
			<table class="w-full">
				<thead class="bg-gray-50 sticky top-0">
					<tr>
						<th class="p-3 text-left text-sm font-semibold text-gray-700">Select</th>
						<th class="p-3 text-left text-sm font-semibold text-gray-700">Product</th>
						<th class="p-3 text-right text-sm font-semibold text-gray-700">Price</th>
						<th class="p-3 text-right text-sm font-semibold text-gray-700">Stock</th>
					</tr>
				</thead>
				<tbody>
					{#each data.products as product}
						<tr class="border-b border-gray-100 hover:bg-gray-50">
							<td class="p-3">
								<input
									type="checkbox"
									checked={selectedProducts.has(product.id)}
									on:change={() => toggleProduct(product.id)}
									class="w-4 h-4"
								/>
							</td>
							<td class="p-3 font-medium text-gray-900">{product.name}</td>
							<td class="p-3 text-right text-gray-700">Tk {product.price.toFixed(2)}</td>
							<td class="p-3 text-right text-gray-700">{product.stock}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Bulk Price Update -->
	{#if activeTab === 'price'}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<h2 class="text-xl font-bold text-gray-900 mb-4">Bulk Price Update</h2>
			<div class="space-y-4">
				<div>
					<label for="price-update-type" class="block mb-2 font-medium">Update Type</label>
					<select id="price-update-type" bind:value={priceUpdateType} class="w-full p-3 border-2 border-gray-300 rounded-lg">
						<option value="percentage">Percentage Change (%)</option>
						<option value="fixed">Fixed Amount (Tk)</option>
					</select>
				</div>
				<div>
					<label for="price-value" class="block mb-2 font-medium">
						{priceUpdateType === 'percentage' ? 'Percentage' : 'Amount'} ({priceUpdateType === 'percentage' ? '%' : 'Tk'})
					</label>
					<input
						id="price-value"
						type="number"
						bind:value={priceValue}
						step={priceUpdateType === 'percentage' ? '1' : '0.01'}
						placeholder={priceUpdateType === 'percentage' ? 'Enter percentage (e.g., 7 for 7%)' : 'Enter amount (e.g., 10 for Tk 10)'}
						class="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
						required
					/>
				</div>
				<button
					on:click={handleBulkPriceUpdate}
					disabled={selectedProducts.size === 0 || updatingPrices}
					class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{updatingPrices ? 'Updating...' : 'Update Prices'}
				</button>
			</div>
		</div>
	{/if}

	<!-- Bulk Stock Update -->
	{#if activeTab === 'stock'}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<h2 class="text-xl font-bold text-gray-900 mb-4">Bulk Stock Update</h2>
			<div class="space-y-4">
				<div>
					<label for="stock-update-type" class="block mb-2 font-medium">Update Type</label>
					<select id="stock-update-type" bind:value={stockUpdateType} class="w-full p-3 border-2 border-gray-300 rounded-lg">
						<option value="set">Set to Value</option>
						<option value="add">Add Amount</option>
						<option value="subtract">Subtract Amount</option>
					</select>
				</div>
				<div>
					<label for="stock-value" class="block mb-2 font-medium">Quantity</label>
					<input
						id="stock-value"
						type="number"
						bind:value={stockValue}
						min="0"
						class="w-full p-3 border-2 border-gray-300 rounded-lg"
					/>
				</div>
				<button
					on:click={handleBulkStockUpdate}
					disabled={selectedProducts.size === 0}
					class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Update Stock
				</button>
			</div>
		</div>
	{/if}

	<!-- Bulk Category Assignment -->
	{#if activeTab === 'category'}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<h2 class="text-xl font-bold text-gray-900 mb-4">Bulk Category Assignment</h2>
			<div class="space-y-4">
				<div>
					<label for="bulk-category" class="block mb-2 font-medium">Category</label>
					<select id="bulk-category" bind:value={selectedCategory} class="w-full p-3 border-2 border-gray-300 rounded-lg">
						<option value="">None (Remove Category)</option>
						{#each data.categories as category}
							<option value={category.id}>{category.display_name}</option>
						{/each}
					</select>
				</div>
				<button
					on:click={handleBulkCategoryAssign}
					disabled={selectedProducts.size === 0}
					class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Assign Category
				</button>
			</div>
		</div>
	{/if}

	<!-- Bulk Delete -->
	{#if activeTab === 'delete'}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-red-200">
			<h2 class="text-xl font-bold text-red-900 mb-4">Bulk Delete Products</h2>
			<p class="text-red-700 mb-4">Warning: This action cannot be undone!</p>
			<button
				on:click={handleBulkDelete}
				disabled={selectedProducts.size === 0}
				class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Delete Selected Products
			</button>
		</div>
	{/if}

	<!-- Import -->
	{#if activeTab === 'import'}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<h2 class="text-xl font-bold text-gray-900 mb-4">Import Products from CSV</h2>
			<div class="space-y-4">
				<div>
					<label for="csv-file" class="block mb-2 font-medium">CSV File</label>
					<input
						id="csv-file"
						type="file"
						accept=".csv"
						on:change={handleImportFile}
						class="w-full p-3 border-2 border-gray-300 rounded-lg"
					/>
				</div>
				{#if importPreview.length > 0}
					<div>
						<div class="block mb-2 font-medium">Preview (first 5 rows)</div>
						<div class="max-h-48 overflow-auto border border-gray-200 rounded-lg">
							<table class="w-full text-sm">
								{#each importPreview as row}
									<tr>
										{#each row as cell}
											<td class="p-2 border border-gray-200">{cell}</td>
										{/each}
									</tr>
								{/each}
							</table>
						</div>
					</div>
				{/if}
				<button
					on:click={handleImport}
					disabled={!importFile || importing}
					class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{importing ? 'Importing...' : 'Import Products'}
				</button>
				{#if importResult}
					<div class="p-4 bg-green-50 rounded-lg">
						<p class="text-green-700">
							Import complete: {importResult.success} successful, {importResult.failed} failed
						</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Export -->
	{#if activeTab === 'export'}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<h2 class="text-xl font-bold text-gray-900 mb-4">Export Products to CSV</h2>
			<p class="text-gray-600 mb-4">Export all products to a CSV file for backup or editing.</p>
			<button
				on:click={handleExport}
				disabled={exporting}
				class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{exporting ? 'Exporting...' : 'Export Products'}
			</button>
		</div>
	{/if}
</div>


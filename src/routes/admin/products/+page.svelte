<script lang="ts">
	import { enhance } from "$app/forms";
	import { Plus, Edit, Trash2, X, Package, Search, Home } from "lucide-svelte";
	import type { PageData } from "./$types";

	let { data, form }: { data: PageData; form: any } = $props();

	let showAddForm = $state(false);
	let editingProduct = $state<string | null>(null);
	let deletingProduct = $state<string | null>(null);
	let imagePreview = $state<string | null>(null);
	let useFileUpload = $state(true);
	let searchQuery = $state("");

	// Filter products based on search query
	const filteredProducts = $derived.by(() => {
		if (!data.products) return [];
		
		if (!searchQuery.trim()) {
			return data.products;
		}
		
		const query = searchQuery.toLowerCase().trim();
		return data.products.filter((product) => {
			return (
				product.name.toLowerCase().includes(query) ||
				product.slug.toLowerCase().includes(query) ||
				(product.description?.toLowerCase().includes(query) ?? false)
			);
		});
	});

	function formatPrice(price: number): string {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(price);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	}

	function generateSlug(name: string): string {
		return name
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, "")
			.replace(/[\s_-]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}

	function handleNameInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const slugInput = document.getElementById("add-slug") as HTMLInputElement;
		if (slugInput && !slugInput.value) {
			slugInput.value = generateSlug(input.value);
		}
	}

	function handleEditNameInput(event: Event, productId: string) {
		const input = event.target as HTMLInputElement;
		const slugInput = document.getElementById(
			`edit-slug-${productId}`
		) as HTMLInputElement;
		if (slugInput && !slugInput.value) {
			slugInput.value = generateSlug(input.value);
		}
	}

	function closeForms() {
		showAddForm = false;
		editingProduct = null;
		deletingProduct = null;
		imagePreview = null;
		useFileUpload = true;
	}

	function handleImageChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		
		if (file) {
			// Validate file type
			if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
				alert("Please select a JPG or PNG image file.");
				input.value = "";
				imagePreview = null;
				return;
			}
			
			// Validate file size (5MB max)
			if (file.size > 5 * 1024 * 1024) {
				alert("File size must be less than 5MB.");
				input.value = "";
				imagePreview = null;
				return;
			}
			
			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		} else {
			imagePreview = null;
		}
	}

	// Close forms on successful submission
	$effect(() => {
		if (form?.success) {
			closeForms();
		}
	});

	// Enhanced form submission handler
	function handleFormSubmit() {
		return async ({ result, update }: any) => {
			// Always update to show errors or success messages
			await update();
			
			if (result.type === "success") {
				// Close forms on success
				closeForms();
			} else if (result.type === "failure") {
				// Log error for debugging
				console.error("Form submission failed:", result);
			}
			// Errors will be displayed via the form.error in the template
		};
	}
</script>

<svelte:head>
	<title>Manage Products - Admin - TinyShop</title>
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<!-- Header -->
	<header class="border-b border-slate-200 bg-white">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<a href="/admin" class="text-slate-600 hover:text-slate-900">
						← Back to Dashboard
					</a>
					<h1 class="text-xl font-bold text-slate-900">Manage Products</h1>
				</div>
				<div class="flex items-center gap-3">
					<a
						href="/shop"
						class="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
						title="Go to main website"
					>
						<Home class="h-4 w-4" />
						<span class="hidden sm:inline">Home</span>
					</a>
					<button
						type="button"
						onclick={() => {
							showAddForm = true;
							editingProduct = null;
						}}
						class="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
					>
						<Plus class="h-4 w-4" />
						Add Product
					</button>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="container mx-auto px-4 py-8">
		<!-- Success/Error Messages -->
		{#if form?.success}
			<div class="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
				<p class="text-sm font-semibold text-green-800">✓ Success</p>
				<p class="text-sm text-green-800">{form.message || "Operation successful"}</p>
			</div>
		{/if}

		{#if form?.error}
			<div class="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
				<p class="text-sm font-semibold text-red-800">✗ Error</p>
				<p class="text-sm text-red-800">{form.error}</p>
			</div>
		{/if}

		<!-- Add Product Form Modal -->
		{#if showAddForm}
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="add-product-title"
				tabindex="-1"
				class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
				onclick={(e) => {
					if (e.target === e.currentTarget) closeForms();
				}}
				onkeydown={(e) => {
					if (e.key === "Escape") closeForms();
				}}
			>
			<div
				role="presentation"
				class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
			>
					<div class="mb-4 flex items-center justify-between">
						<h2 id="add-product-title" class="text-xl font-bold text-slate-900">Add New Product</h2>
						<button
							type="button"
							onclick={closeForms}
							class="text-slate-400 hover:text-slate-600"
						>
							<X class="h-5 w-5" />
						</button>
					</div>

					<form method="POST" action="?/create" use:enhance={handleFormSubmit} enctype="multipart/form-data">
						<div class="space-y-4">
							<div>
								<label
									for="add-name"
									class="mb-2 block text-sm font-medium text-slate-700"
								>
									Name <span class="text-red-500">*</span>
								</label>
								<input
									id="add-name"
									type="text"
									name="name"
									required
									oninput={handleNameInput}
									class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
								/>
							</div>

							<div>
								<label
									for="add-slug"
									class="mb-2 block text-sm font-medium text-slate-700"
								>
									Slug <span class="text-red-500">*</span>
								</label>
								<input
									id="add-slug"
									type="text"
									name="slug"
									required
									pattern="[a-z0-9-]+"
									class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
								/>
								<p class="mt-1 text-xs text-slate-500">
									URL-friendly identifier (lowercase, hyphens only)
								</p>
							</div>

							<div>
								<label
									for="add-description"
									class="mb-2 block text-sm font-medium text-slate-700"
								>
									Description
								</label>
								<textarea
									id="add-description"
									name="description"
									rows="3"
									class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
								></textarea>
							</div>

							<div class="grid grid-cols-3 gap-4">
								<div>
									<label
										for="add-price"
										class="mb-2 block text-sm font-medium text-slate-700"
									>
										Selling Price ($) <span class="text-red-500">*</span>
									</label>
									<input
										id="add-price"
										type="number"
										name="price"
										required
										min="0"
										step="0.01"
										class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
									/>
								</div>

								<div>
									<label
										for="add-cost-price"
										class="mb-2 block text-sm font-medium text-slate-700"
									>
										Cost Price ($)
									</label>
									<input
										id="add-cost-price"
										type="number"
										name="cost_price"
										min="0"
										step="0.01"
										placeholder="0.00"
										class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
									/>
									<p class="mt-1 text-xs text-slate-500">
										For profit/loss calculation
									</p>
								</div>

								<div>
									<label
										for="add-stock"
										class="mb-2 block text-sm font-medium text-slate-700"
									>
										Stock <span class="text-red-500">*</span>
									</label>
									<input
										id="add-stock"
										type="number"
										name="stock"
										required
										min="0"
										class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
									/>
								</div>
							</div>

							<div>
								<label
									for="add-image-type"
									class="mb-2 block text-sm font-medium text-slate-700"
								>
									Image
								</label>
								<div class="mb-3 flex gap-4">
									<label class="flex items-center gap-2">
										<input
											type="radio"
											name="image_type"
											value="upload"
											checked={useFileUpload}
											onchange={() => {
												useFileUpload = true;
												imagePreview = null;
											}}
											class="text-slate-900"
										/>
										<span class="text-sm text-slate-700">Upload Image</span>
									</label>
									<label class="flex items-center gap-2">
										<input
											type="radio"
											name="image_type"
											value="url"
											checked={!useFileUpload}
											onchange={() => {
												useFileUpload = false;
												imagePreview = null;
											}}
											class="text-slate-900"
										/>
										<span class="text-sm text-slate-700">Image URL</span>
									</label>
								</div>

								{#if useFileUpload}
									<div>
										<input
											id="add-image-file"
											type="file"
											name="image_file"
											accept="image/jpeg,image/jpg,image/png"
											onchange={handleImageChange}
											class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
										/>
										<p class="mt-1 text-xs text-slate-500">
											Upload JPG or PNG image (max 5MB)
										</p>
										{#if imagePreview}
											<div class="mt-3">
												<img
													src={imagePreview}
													alt="Preview"
													class="h-32 w-32 rounded-lg object-cover border border-slate-300"
												/>
											</div>
										{/if}
									</div>
								{:else}
									<input
										id="add-image-url"
										type="url"
										name="image_url"
										placeholder="https://example.com/image.jpg"
										class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
									/>
								{/if}
							</div>
						</div>

						<div class="mt-6 flex justify-end gap-3">
							<button
								type="button"
								onclick={closeForms}
								class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
							>
								Cancel
							</button>
							<button
								type="submit"
								class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
							>
								Create Product
							</button>
						</div>
					</form>
				</div>
			</div>
		{/if}

		<!-- Search Bar -->
		<div class="mb-6">
			<div class="relative">
				<Search class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
				<input
					type="text"
					placeholder="Search products by name, slug, or description..."
					bind:value={searchQuery}
					class="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
				/>
				{#if searchQuery}
					<button
						type="button"
						onclick={() => (searchQuery = "")}
						class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
						title="Clear search"
					>
						<X class="h-4 w-4" />
					</button>
				{/if}
			</div>
			{#if searchQuery && filteredProducts.length !== data.products?.length}
				<p class="mt-2 text-sm text-slate-600">
					Showing {filteredProducts.length} of {data.products?.length || 0} products
				</p>
			{/if}
		</div>

		<!-- Products Table -->
		<div class="rounded-lg bg-white shadow-lg overflow-hidden">
			{#if filteredProducts && filteredProducts.length > 0}
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-slate-50 border-b border-slate-200">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
									Product
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
									Price
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
									Stock
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
									Created
								</th>
								<th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-700">
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-200">
							{#each filteredProducts as product (product.id)}
								<tr class="hover:bg-slate-50">
									<td class="px-6 py-4">
										<div class="flex items-center gap-3">
											{#if product.image_url}
												<img
													src={product.image_url}
													alt={product.name}
													class="h-12 w-12 rounded object-cover"
												/>
											{:else}
												<div
													class="flex h-12 w-12 items-center justify-center rounded bg-slate-200"
												>
													<Package class="h-6 w-6 text-slate-400" />
												</div>
											{/if}
											<div>
												<div class="font-medium text-slate-900">
													{product.name}
												</div>
												<div class="text-sm text-slate-500">
													/{product.slug}
												</div>
											</div>
										</div>
									</td>
									<td class="px-6 py-4 text-sm text-slate-900">
										{formatPrice(product.price)}
									</td>
									<td class="px-6 py-4">
										<span
											class="rounded-full px-2 py-1 text-xs font-semibold"
											class:bg-green-100={product.stock > 0}
											class:text-green-800={product.stock > 0}
											class:bg-red-100={product.stock === 0}
											class:text-red-800={product.stock === 0}
										>
											{product.stock}
										</span>
									</td>
									<td class="px-6 py-4 text-sm text-slate-600">
										{formatDate(product.created_at)}
									</td>
									<td class="px-6 py-4 text-right">
										<div class="flex items-center justify-end gap-2">
											<button
												type="button"
												onclick={() => {
													editingProduct = product.id;
													showAddForm = false;
													deletingProduct = null;
												}}
												class="rounded p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
												title="Edit"
											>
												<Edit class="h-4 w-4" />
											</button>
											<button
												type="button"
												onclick={() => {
													deletingProduct = product.id;
													showAddForm = false;
													editingProduct = null;
												}}
												class="rounded p-2 text-red-600 hover:bg-red-50 hover:text-red-700"
												title="Delete"
											>
												<Trash2 class="h-4 w-4" />
											</button>
										</div>
									</td>
								</tr>

								<!-- Edit Form Modal -->
								{#if editingProduct === product.id}
									<tr>
										<td colspan="5" class="bg-slate-50 px-6 py-4">
											<div class="rounded-lg border border-slate-200 bg-white p-4">
												<div class="mb-4 flex items-center justify-between">
													<h3 class="text-lg font-semibold text-slate-900">
														Edit Product
													</h3>
													<button
														type="button"
														onclick={() => (editingProduct = null)}
														class="text-slate-400 hover:text-slate-600"
													>
														<X class="h-5 w-5" />
													</button>
												</div>

												<form
													method="POST"
													action="?/update"
													use:enhance={handleFormSubmit}
													enctype="multipart/form-data"
												>
													<input
														type="hidden"
														name="productId"
														value={product.id}
													/>

													<div class="space-y-4">
														<div>
															<label
																for="edit-name-{product.id}"
																class="mb-2 block text-sm font-medium text-slate-700"
															>
																Name
															</label>
															<input
																id="edit-name-{product.id}"
																type="text"
																name="name"
																value={product.name}
																oninput={(e) =>
																	handleEditNameInput(e, product.id)}
																class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
															/>
														</div>

														<div>
															<label
																for="edit-slug-{product.id}"
																class="mb-2 block text-sm font-medium text-slate-700"
															>
																Slug
															</label>
															<input
																id="edit-slug-{product.id}"
																type="text"
																name="slug"
																value={product.slug}
																pattern="[a-z0-9-]+"
																class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
															/>
														</div>

														<div>
															<label
																for="edit-description-{product.id}"
																class="mb-2 block text-sm font-medium text-slate-700"
															>
																Description
															</label>
															<textarea
																id="edit-description-{product.id}"
																name="description"
																rows="3"
																class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
															>
																{product.description || ""}
															</textarea>
														</div>

														<div class="grid grid-cols-3 gap-4">
															<div>
																<label
																	for="edit-price-{product.id}"
																	class="mb-2 block text-sm font-medium text-slate-700"
																>
																	Selling Price ($)
																</label>
																<input
																	id="edit-price-{product.id}"
																	type="number"
																	name="price"
																	value={product.price}
																	min="0"
																	step="0.01"
																	class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
																/>
															</div>

															<div>
																<label
																	for="edit-cost-price-{product.id}"
																	class="mb-2 block text-sm font-medium text-slate-700"
																>
																	Cost Price ($)
																</label>
																<input
																	id="edit-cost-price-{product.id}"
																	type="number"
																	name="cost_price"
																	value={(product as any).cost_price || 0}
																	min="0"
																	step="0.01"
																	class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
																/>
																<p class="mt-1 text-xs text-slate-500">
																	For profit/loss calculation
																</p>
															</div>

															<div>
																<label
																	for="edit-stock-{product.id}"
																	class="mb-2 block text-sm font-medium text-slate-700"
																>
																	Stock
																</label>
																<input
																	id="edit-stock-{product.id}"
																	type="number"
																	name="stock"
																	value={product.stock}
																	min="0"
																	class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
																/>
															</div>
														</div>

														<div>
															<label
																for="edit-image-{product.id}"
																class="mb-2 block text-sm font-medium text-slate-700"
															>
																Image
															</label>
															<input
																id="edit-image-file-{product.id}"
																type="file"
																name="image_file"
																accept="image/jpeg,image/jpg,image/png"
																class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
															/>
															<p class="mt-1 text-xs text-slate-500">
																Upload JPG or PNG image (max 5MB)
															</p>
															<p class="mt-2 text-xs text-slate-500">OR</p>
															<input
																id="edit-image-url-{product.id}"
																type="url"
																name="image_url"
																value={product.image_url || ""}
																placeholder="https://example.com/image.jpg"
																class="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
															/>
															<p class="mt-1 text-xs text-slate-500">
																If both are provided, uploaded file takes priority
															</p>
															{#if product.image_url}
																<div class="mt-3">
																	<p class="mb-1 text-xs text-slate-500">Current image:</p>
																	<img
																		src={product.image_url}
																		alt={product.name}
																		class="h-24 w-24 rounded-lg object-cover border border-slate-300"
																	/>
																</div>
															{/if}
														</div>
													</div>

													<div class="mt-4 flex justify-end gap-3">
														<button
															type="button"
															onclick={() => (editingProduct = null)}
															class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
														>
															Cancel
														</button>
														<button
															type="submit"
															class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
														>
															Update Product
														</button>
													</div>
												</form>
											</div>
										</td>
									</tr>
								{/if}

								<!-- Delete Confirmation Modal -->
								{#if deletingProduct === product.id}
									<tr>
										<td colspan="5" class="bg-red-50 px-6 py-4">
											<div class="rounded-lg border border-red-200 bg-white p-4">
												<h3 class="mb-2 text-lg font-semibold text-slate-900">
													Delete Product
												</h3>
												<p class="mb-4 text-sm text-slate-600">
													Are you sure you want to delete "{product.name}"? This
													action cannot be undone.
												</p>
												<form method="POST" action="?/delete" use:enhance={handleFormSubmit}>
													<input
														type="hidden"
														name="productId"
														value={product.id}
													/>
													<div class="flex justify-end gap-3">
														<button
															type="button"
															onclick={() => (deletingProduct = null)}
															class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
														>
															Cancel
														</button>
														<button
															type="submit"
															class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
														>
															Delete Product
														</button>
													</div>
												</form>
											</div>
										</td>
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>
			{:else if searchQuery && filteredProducts.length === 0}
				<div class="p-12 text-center">
					<Search class="mx-auto h-12 w-12 text-slate-400" />
					<p class="mt-4 text-lg font-medium text-slate-900">No products found</p>
					<p class="mt-2 text-sm text-slate-600">
						No products match your search query "{searchQuery}".
					</p>
					<button
						type="button"
						onclick={() => (searchQuery = "")}
						class="mt-4 text-sm text-slate-900 underline hover:text-slate-700"
					>
						Clear search
					</button>
				</div>
			{:else}
				<div class="p-12 text-center">
					<Package class="mx-auto h-12 w-12 text-slate-400" />
					<p class="mt-4 text-lg font-medium text-slate-900">No products yet</p>
					<p class="mt-2 text-sm text-slate-600">
						Get started by adding your first product.
					</p>
				</div>
			{/if}
		</div>
	</main>
</div>

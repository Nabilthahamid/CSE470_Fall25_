<!-- VIEW: PC Builder page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData, ActionData } from './$types';
	import type { ComponentCategory } from '$lib/models/PCBuild';
	import type { Product } from '$lib/models/Product';

	export let data: PageData;
	export let form: ActionData;

	let selectedComponents: Record<string, { product: Product; category: ComponentCategory }> = {};
	let hideUnconfigured = false;
	let showSaveModal = false;
	let buildName = '';
	let buildDescription = '';
	let showProductModal = false;
	let currentCategory: ComponentCategory | null = null;
	let showOverview = false;
	
	// Share to Community
	let showShareModal = false;
	let shareUseCase = 'gaming';
	let shareTags: string[] = [];
	let shareTagInput = '';
	let shareImageUrl = '';
	let savedBuildId: string | null = null;
	
	// AI Features
	let showAIAssistant = false;
	let aiChatMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
	let aiChatInput = '';
	let aiLoading = false;
	let showOptimizeModal = false;
	let optimizationResults: any = null;
	let showPrebuiltModal = false;
	let prebuiltBuilds: any[] = [];
	let prebuiltUseCase = 'gaming';
	let prebuiltBudget = 50000;

	// Energy Efficiency
	let showEnergyModal = false;
	let energyAnalysis: any = null;
	let energyAlternatives: any = null;
	let energyLoading = false;
	let psuRecommendation: any = null;

	// Calculate total price
	$: totalPrice = Object.values(selectedComponents).reduce(
		(sum, comp) => sum + (comp.product.price || 0),
		0
	);

	// Get item count
	$: itemCount = Object.keys(selectedComponents).length;

	// Get configured categories
	$: configuredCategories = Object.keys(selectedComponents);

	function openProductModal(category: ComponentCategory) {
		currentCategory = category;
		showProductModal = true;
	}

	function selectProduct(product: Product, category: ComponentCategory) {
		selectedComponents[category.id] = { product, category };
		showProductModal = false;
		currentCategory = null;
	}

	function removeComponent(categoryId: string) {
		delete selectedComponents[categoryId];
	}

	function getProductsForCategory(categoryId: string): Product[] {
		return data.productsByCategory[categoryId] || [];
	}

	function handleSave() {
		showSaveModal = true;
	}

	function handleShareToCommunity() {
		// Check if build is already saved
		if (savedBuildId) {
			showShareModal = true;
			return;
		}

		// If not saved, prompt user to save first
		if (!buildName || buildName.trim() === '') {
			alert('Please enter a build name and save the build first before sharing.');
			showSaveModal = true;
			return;
		}

		// If we have a name but haven't saved yet, show save modal first
		// After saving, user can click share again
		alert('Please save the build first, then click "Share to Community" again.');
		showSaveModal = true;
	}

	// Handle successful build save - update savedBuildId and close modal
	$: if (form?.success && form?.buildId) {
		savedBuildId = form.buildId;
		showSaveModal = false;
		// If user wanted to share, show share modal now
		if (savedBuildId) {
			// User can now share if they click the button again
		}
	}

	// Handle redirect after successful add to cart
	$: if (form?.success && form?.redirect) {
		setTimeout(() => {
			goto(form.redirect);
		}, 1500);
	}

	function addTag() {
		if (shareTagInput.trim() && !shareTags.includes(shareTagInput.trim())) {
			shareTags = [...shareTags, shareTagInput.trim()];
			shareTagInput = '';
		}
	}

	function removeTag(tag: string) {
		shareTags = shareTags.filter(t => t !== tag);
	}

	async function shareBuild() {
		if (!savedBuildId) return;

		try {
			const response = await fetch(`/api/community-builds/${savedBuildId}/share`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					use_case: shareUseCase,
					tags: shareTags,
					image_url: shareImageUrl || null
				})
			});

			if (response.ok) {
				alert('Build shared to community successfully!');
				showShareModal = false;
				goto(`/community-builds/${savedBuildId}`);
			} else {
				const error = await response.json();
				alert(error.error || 'Failed to share build');
			}
		} catch (error) {
			console.error('Share error:', error);
			alert('Failed to share build');
		}
	}

	// Energy Efficiency Functions
	async function calculateEnergy() {
		if (itemCount === 0) {
			alert('Please add components to your build first');
			return;
		}

		energyLoading = true;
		showEnergyModal = true;

		try {
			const components = Object.entries(selectedComponents).map(([categoryId, comp]) => ({
				product_id: comp.product.id,
				component_category_id: categoryId
			}));

			const response = await fetch('/api/pc-builder/energy/calculate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ components })
			});

			if (response.ok) {
				const data = await response.json();
				energyAnalysis = data.analysis;
				psuRecommendation = data.psu_recommendation;

				// Also get alternatives
				const altResponse = await fetch('/api/pc-builder/energy/alternatives', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ components })
				});

				if (altResponse.ok) {
					const altData = await altResponse.json();
					energyAlternatives = altData;
				}
			} else {
				const error = await response.json();
				alert(error.error || 'Failed to calculate energy consumption');
			}
		} catch (error) {
			console.error('Energy calculation error:', error);
			alert('Failed to calculate energy consumption');
		} finally {
			energyLoading = false;
		}
	}

	function handlePrint() {
		window.print();
	}

	function handleAddToCart() {
		// This will be handled by the form action
	}

	function getRequiredCategories() {
		return data.categories.filter((cat) => cat.is_required);
	}

	function getOptionalCategories() {
		return data.categories.filter((cat) => !cat.is_required);
	}

	function getDisplayCategories() {
		const all = [...getRequiredCategories(), ...getOptionalCategories()];
		if (hideUnconfigured) {
			return all.filter((cat) => selectedComponents[cat.id]);
		}
		return all;
	}

	function getSelectedProduct(categoryId: string): Product | null {
		return selectedComponents[categoryId]?.product || null;
	}

	// AI Assistant Functions
	async function sendAIMessage() {
		if (!aiChatInput.trim() || aiLoading) return;

		const userMessage = aiChatInput.trim();
		aiChatInput = '';
		aiChatMessages = [...aiChatMessages, { role: 'user', content: userMessage }];
		aiLoading = true;

		try {
			// Send user's question directly to the API - it will handle everything
			const response = await fetch('/api/pc-builder/ai-suggest', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					preferences: userMessage 
				})
			});

			if (response.ok) {
				const data = await response.json();
				let assistantMessage = '';

				// Handle Gemini question responses (most common case)
				if (data.isQuestion && data.answer) {
					assistantMessage = data.answer;
					
					// Add product list if available
					if (data.products && data.products.length > 0) {
						assistantMessage += '\n\n**📦 Available Products in Our Store:**\n';
						data.products.forEach((p: any, index: number) => {
							assistantMessage += `${index + 1}. **${p.productName}** - Tk ${p.price.toFixed(2)}\n`;
							if (p.description && p.description.length > 0) {
								const shortDesc = p.description.length > 80 
									? p.description.substring(0, 80) + '...' 
									: p.description;
								assistantMessage += `   ${shortDesc}\n`;
							}
							assistantMessage += '\n';
						});
					}
				} 
				// Handle full build suggestions (only when explicitly requested)
				else if (data.suggestions && data.suggestions.length > 0) {
					assistantMessage = data.explanation || 'I\'ve selected components for your build:\n\n';
					assistantMessage += '**Suggested Components:**\n';
					data.suggestions.forEach((s: any) => {
						assistantMessage += `• **${s.categoryName}**: ${s.productName} - Tk ${s.price.toFixed(2)}\n`;
						assistantMessage += `  Reason: ${s.reason}\n\n`;
					});
					assistantMessage += `\n**Total: Tk ${data.totalPrice.toFixed(2)}**`;
				} 
				// Fallback
				else if (data.answer) {
					assistantMessage = data.answer;
				} else {
					assistantMessage = 'I\'m here to help! Ask me anything about PC components, products, or building a PC.';
				}
				
				aiChatMessages = [...aiChatMessages, { role: 'assistant', content: assistantMessage }];
			} else {
				const errorData = await response.json().catch(() => ({}));
				aiChatMessages = [...aiChatMessages, { 
					role: 'assistant', 
					content: errorData.error || 'Sorry, I encountered an error. Please try again.' 
				}];
			}
		} catch (error) {
			console.error('AI Assistant error:', error);
			aiChatMessages = [...aiChatMessages, { 
				role: 'assistant', 
				content: 'Sorry, I encountered an error. Please try again.' 
			}];
		} finally {
			aiLoading = false;
		}
	}

	async function optimizeBuild() {
		if (Object.keys(selectedComponents).length === 0) {
			alert('Please select some components first');
			return;
		}

		showOptimizeModal = true;
		optimizationResults = null;

		try {
			const build = Object.entries(selectedComponents).map(([categoryId, comp]) => ({
				categoryId,
				productId: comp.product.id,
				price: comp.product.price
			}));

			const response = await fetch('/api/pc-builder/ai-optimize', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ build, optimizationGoal: 'value' })
			});

			if (response.ok) {
				optimizationResults = await response.json();
			}
		} catch (error) {
			console.error('Optimization error:', error);
		}
	}

	async function loadPrebuiltBuilds() {
		showPrebuiltModal = true;
		prebuiltBuilds = [];

		try {
			const response = await fetch('/api/pc-builder/ai-prebuilt', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ useCase: prebuiltUseCase, budget: prebuiltBudget })
			});

			if (response.ok) {
				const data = await response.json();
				prebuiltBuilds = data.builds || [];
			}
		} catch (error) {
			console.error('Pre-built builds error:', error);
		}
	}

	function applyOptimization(opt: any) {
		const product = data.productsByCategory[opt.categoryId]?.find((p: Product) => p.id === opt.suggestedProductId);
		const category = data.categories.find(c => c.id === opt.categoryId);
		if (product && category) {
			selectProduct(product, category);
			showOptimizeModal = false;
		}
	}

	function applyPrebuiltBuild(build: any) {
		build.components.forEach((comp: any) => {
			const product = data.productsByCategory[comp.categoryId]?.find((p: Product) => p.id === comp.productId);
			const category = data.categories.find(c => c.id === comp.categoryId);
			if (product && category) {
				selectedComponents[comp.categoryId] = { product, category };
			}
		});
		showPrebuiltModal = false;
	}
</script>

<svelte:head>
	<title>PC Builder - Build Your Own Computer</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
				PC Builder - Build Your Own Computer
			</h1>
			<p class="text-gray-600">Select components to build your custom PC</p>
		</div>

		<!-- Action Bar -->
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div class="flex items-center gap-4">
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={hideUnconfigured}
							class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
						/>
						<span class="text-sm text-gray-700">Hide Unconfigured Components</span>
					</label>
				</div>
				<div class="flex items-center gap-4 flex-wrap">
					<button
						type="button"
						on:click={() => showAIAssistant = !showAIAssistant}
						class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold flex items-center gap-2"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
						</svg>
						AI Assistant
					</button>
					{#if itemCount > 0}
						<button
							type="button"
							on:click={optimizeBuild}
							class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
						>
							⚡ Optimize Build
						</button>
					{/if}
					<button
						type="button"
						on:click={loadPrebuiltBuilds}
						class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
					>
						📦 Pre-built Builds
					</button>
					<button
						type="button"
						on:click={() => (showOverview = !showOverview)}
						class="relative px-4 py-2 {showOverview ? 'bg-indigo-700' : 'bg-indigo-600'} text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold"
					>
						Overview
						{#if itemCount > 0}
							<span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
								{itemCount}
							</span>
						{/if}
					</button>
					<form 
						method="POST" 
						action="?/addToCart" 
						use:enhance={({ update }) => {
							return async ({ update: updateFn }) => {
								// Update the page to show success/error messages
								if (updateFn) {
									await updateFn();
								} else if (update) {
									await update();
								}
							};
						}}
						class="inline"
					>
						<input
							type="hidden"
							name="components"
							value={JSON.stringify(
								Object.entries(selectedComponents).map(([catId, comp]) => ({
									product_id: comp.product.id,
									component_category_id: catId,
									quantity: 1
								}))
							)}
						/>
						<button
							type="submit"
							disabled={itemCount === 0}
							class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-semibold"
						>
							Add to Cart
						</button>
					</form>
					<button
						type="button"
						on:click={handleSave}
						disabled={itemCount === 0}
						class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-semibold"
					>
						Save PC
					</button>
					<button
						type="button"
						on:click={calculateEnergy}
						disabled={itemCount === 0}
						class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-semibold"
					>
						⚡ Energy Calculator
					</button>
					<button
						type="button"
						on:click={handleShareToCommunity}
						disabled={itemCount === 0}
						class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-semibold"
					>
						Share to Community
					</button>
					<button
						type="button"
						on:click={handlePrint}
						class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold"
					>
						Print
					</button>
				</div>
			</div>
		</div>

		<!-- Messages -->
		{#if form?.error}
			<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
				{form.error}
			</div>
		{/if}

		{#if form?.success}
			<div class="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-200">
				{form.success === true ? 'Operation successful!' : form.success}
			</div>
		{/if}

		<div class="grid grid-cols-1 {showOverview ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6">
			<!-- Main Content -->
			<div class="{showOverview ? 'lg:col-span-2' : 'lg:col-span-1'} space-y-6">
				<!-- Core Components -->
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<h2 class="text-xl font-bold text-gray-900 mb-4">Core Components</h2>
					<div class="space-y-4">
						{#each getRequiredCategories() as category}
							{@const product = getSelectedProduct(category.id)}
							{@const products = getProductsForCategory(category.id)}
							<div class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
								<div class="flex items-center justify-between">
									<div class="flex-1">
										<div class="flex items-center gap-2 mb-2">
											<h3 class="font-semibold text-gray-900">{category.display_name}</h3>
											<span class="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
												Required
											</span>
										</div>
										{#if product}
											<div class="mt-2 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg">
												<div class="flex items-start gap-4">
													{#if product.image_url}
														<img
															src={product.image_url}
															alt={product.name}
															class="w-20 h-20 object-cover rounded-lg border border-gray-200"
														/>
													{:else}
														<div class="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
															<span class="text-gray-400 text-xs">No image</span>
														</div>
													{/if}
													<div class="flex-1">
														<p class="font-bold text-gray-900 text-base mb-1">{product.name}</p>
														{#if product.brand}
															<p class="text-xs text-indigo-600 font-semibold mb-1">{product.brand}</p>
														{/if}
														<p class="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
														<div class="flex items-baseline gap-2">
															<p class="text-2xl font-bold text-indigo-600">
																Tk {product.price.toFixed(2)}
															</p>
															{#if product.stock > 0}
																<span class="text-xs text-green-600 font-medium">
																	({product.stock} in stock)
																</span>
															{:else}
																<span class="text-xs text-red-600 font-medium">(Out of stock)</span>
															{/if}
														</div>
													</div>
													<button
														type="button"
														on:click={() => removeComponent(category.id)}
														class="text-red-600 hover:text-red-700 p-1"
														aria-label="Remove component"
													>
														<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M6 18L18 6M6 6l12 12"
															/>
														</svg>
													</button>
												</div>
											</div>
										{:else}
											<p class="text-sm text-gray-500">No component selected</p>
										{/if}
									</div>
									<button
										type="button"
										on:click={() => openProductModal(category)}
										class="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold whitespace-nowrap"
									>
										{product ? 'Change' : 'Choose'}
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Peripherals & Others -->
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<h2 class="text-xl font-bold text-gray-900 mb-4">Peripherals & Others</h2>
					<div class="space-y-4">
						{#each getOptionalCategories() as category}
							{@const product = getSelectedProduct(category.id)}
							{@const products = getProductsForCategory(category.id)}
							{#if !hideUnconfigured || product}
								<div class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
									<div class="flex items-center justify-between">
										<div class="flex-1">
											<h3 class="font-semibold text-gray-900 mb-2">{category.display_name}</h3>
											{#if product}
												<div class="mt-2 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg">
													<div class="flex items-start gap-4">
														{#if product.image_url}
															<img
																src={product.image_url}
																alt={product.name}
																class="w-20 h-20 object-cover rounded-lg border border-gray-200"
															/>
														{:else}
															<div class="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
																<span class="text-gray-400 text-xs">No image</span>
															</div>
														{/if}
														<div class="flex-1">
															<p class="font-bold text-gray-900 text-base mb-1">{product.name}</p>
															{#if product.brand}
																<p class="text-xs text-indigo-600 font-semibold mb-1">{product.brand}</p>
															{/if}
															<p class="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
															<div class="flex items-baseline gap-2">
																<p class="text-2xl font-bold text-indigo-600">
																	Tk {product.price.toFixed(2)}
																</p>
																{#if product.stock > 0}
																	<span class="text-xs text-green-600 font-medium">
																		({product.stock} in stock)
																	</span>
																{:else}
																	<span class="text-xs text-red-600 font-medium">(Out of stock)</span>
																{/if}
															</div>
														</div>
														<button
															type="button"
															on:click={() => removeComponent(category.id)}
															class="text-red-600 hover:text-red-700 p-1"
															aria-label="Remove component"
														>
															<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path
																	stroke-linecap="round"
																	stroke-linejoin="round"
																	stroke-width="2"
																	d="M6 18L18 6M6 6l12 12"
																/>
															</svg>
														</button>
													</div>
												</div>
											{:else}
												<p class="text-sm text-gray-500">No component selected</p>
											{/if}
										</div>
										<button
											type="button"
											on:click={() => openProductModal(category)}
											class="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold whitespace-nowrap"
										>
											{product ? 'Change' : 'Choose'}
										</button>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			</div>

			<!-- Overview Sidebar -->
			{#if showOverview}
			<div class="lg:col-span-1">
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-xl font-bold text-gray-900">Overview</h2>
						<button
							type="button"
							on:click={() => (showOverview = false)}
							class="text-gray-400 hover:text-gray-600"
							aria-label="Close overview"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
							</svg>
						</button>
					</div>
					<div class="space-y-4">
						<div class="flex justify-between items-center">
							<span class="text-gray-700">Total Items:</span>
							<span class="font-bold text-gray-900">{itemCount}</span>
						</div>
						<div class="border-t border-gray-200 pt-4">
							<div class="flex justify-between items-center mb-2">
								<span class="text-gray-700">Total Price:</span>
								<span class="text-2xl font-bold text-indigo-600">Tk {totalPrice.toFixed(2)}</span>
							</div>
						</div>
						{#if itemCount > 0}
							<div class="pt-4 border-t border-gray-200 space-y-2">
								<h3 class="font-semibold text-gray-900 mb-2">Selected Components:</h3>
								{#each Object.values(selectedComponents) as comp}
									<div class="text-sm">
										<p class="font-medium text-gray-900">{comp.category.display_name}</p>
										<p class="text-gray-600">{comp.product.name}</p>
										<p class="text-indigo-600 font-semibold">Tk {comp.product.price.toFixed(2)}</p>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>
			{/if}
		</div>
	</div>

	<!-- Selected Products Summary (Bottom Section) -->
	{#if itemCount > 0}
		<div class="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<h2 class="text-2xl font-bold text-gray-900 mb-6">Selected Components Summary</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{#each Object.values(selectedComponents) as comp}
					<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
						<div class="flex items-start gap-3 mb-3">
							{#if comp.product.image_url}
								<img
									src={comp.product.image_url}
									alt={comp.product.name}
									class="w-16 h-16 object-cover rounded-lg border border-gray-200"
								/>
							{:else}
								<div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
									<span class="text-gray-400 text-xs">No image</span>
								</div>
							{/if}
							<div class="flex-1 min-w-0">
								<p class="text-xs text-indigo-600 font-semibold mb-1">{comp.category.display_name}</p>
								<p class="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{comp.product.name}</p>
								{#if comp.product.brand}
									<p class="text-xs text-gray-500 mb-1">Brand: {comp.product.brand}</p>
								{/if}
							</div>
							<button
								type="button"
								on:click={() => removeComponent(comp.category.id)}
								class="text-red-600 hover:text-red-700 p-1 flex-shrink-0"
								aria-label="Remove {comp.product.name}"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<div class="border-t border-gray-200 pt-3 mt-3">
							<div class="flex justify-between items-center mb-2">
								<span class="text-xs text-gray-600">Price:</span>
								<span class="text-lg font-bold text-indigo-600">Tk {comp.product.price.toFixed(2)}</span>
							</div>
							{#if comp.product.specifications}
								<div class="mt-2">
									<p class="text-xs text-gray-500 line-clamp-2">{comp.product.specifications}</p>
								</div>
							{/if}
							{#if comp.product.stock > 0}
								<p class="text-xs text-green-600 mt-2 font-medium">
									✓ {comp.product.stock} in stock
								</p>
							{:else}
								<p class="text-xs text-red-600 mt-2 font-medium">✕ Out of stock</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
			<div class="mt-6 pt-6 border-t border-gray-200">
				<div class="flex justify-between items-center">
					<div>
						<p class="text-sm text-gray-600">Total Items: <span class="font-bold text-gray-900">{itemCount}</span></p>
						<p class="text-sm text-gray-600 mt-1">Total Components: <span class="font-bold text-gray-900">{itemCount}</span></p>
					</div>
					<div class="text-right">
						<p class="text-sm text-gray-600 mb-1">Total Price:</p>
						<p class="text-3xl font-bold text-indigo-600">Tk {totalPrice.toFixed(2)}</p>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Product Selection Modal -->
{#if showProductModal && currentCategory}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
		role="dialog"
		aria-modal="true"
		aria-labelledby="product-modal-title"
		tabindex="-1"
		on:click={() => {
			showProductModal = false;
			currentCategory = null;
		}}
		on:keydown={(e) => {
			if (e.key === 'Escape') {
				showProductModal = false;
				currentCategory = null;
			}
		}}
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
			role="document"
			on:click|stopPropagation
			on:keydown|stopPropagation
			aria-label="Modal content"
		>
			<div class="p-6">
				<div class="flex justify-between items-center mb-4">
					<h2 id="product-modal-title" class="text-2xl font-bold text-gray-900">
						Choose {currentCategory.display_name}
					</h2>
					<button
						type="button"
						on:click={() => {
							showProductModal = false;
							currentCategory = null;
						}}
						class="text-gray-400 hover:text-gray-600"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each getProductsForCategory(currentCategory.id) as product}
						<button
							type="button"
							class="w-full text-left border border-gray-200 rounded-lg p-4 hover:border-indigo-500 cursor-pointer transition-colors"
							on:click={() => currentCategory && selectProduct(product, currentCategory)}
						>
							<div class="flex gap-4">
								{#if product.image_url}
									<img
										src={product.image_url}
										alt={product.name}
										class="w-20 h-20 object-cover rounded"
									/>
								{:else}
									<div class="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
										<span class="text-gray-400 text-xs">No image</span>
									</div>
								{/if}
								<div class="flex-1">
									<h3 class="font-semibold text-gray-900 mb-1">{product.name}</h3>
									<p class="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
									<p class="text-lg font-bold text-indigo-600">Tk {product.price.toFixed(2)}</p>
									{#if product.stock > 0}
										<p class="text-xs text-green-600 mt-1">
											{product.stock} in stock
										</p>
									{:else}
										<p class="text-xs text-red-600 mt-1">Out of stock</p>
									{/if}
								</div>
							</div>
						</button>
					{/each}
				</div>
				{#if getProductsForCategory(currentCategory.id).length === 0}
					<div class="text-center py-8 text-gray-500">
						No products available in this category
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Save Build Modal -->
{#if showSaveModal}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
		role="dialog"
		aria-modal="true"
		aria-labelledby="save-modal-title"
		tabindex="-1"
		on:click={() => (showSaveModal = false)}
		on:keydown={(e) => {
			if (e.key === 'Escape') {
				showSaveModal = false;
			}
		}}
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div 
			class="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4" 
			role="document"
			on:click|stopPropagation
			on:keydown|stopPropagation
			aria-label="Modal content"
		>
			<form method="POST" action="?/saveBuild" use:enhance class="p-6">
				<h2 id="save-modal-title" class="text-2xl font-bold text-gray-900 mb-4">Save PC Build</h2>
				<div class="mb-4">
					<label for="build-name" class="block mb-2 font-medium text-gray-900">Build Name *</label>
					<input
						type="text"
						id="build-name"
						name="name"
						bind:value={buildName}
						required
						class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
						placeholder="e.g., Gaming PC 2025"
					/>
				</div>
				<div class="mb-4">
					<label for="build-description" class="block mb-2 font-medium text-gray-900">
						Description (Optional)
					</label>
					<textarea
						id="build-description"
						name="description"
						bind:value={buildDescription}
						rows="3"
						class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
						placeholder="Add a description for this build..."
					></textarea>
				</div>
				<input
					type="hidden"
					name="components"
					value={JSON.stringify(
						Object.entries(selectedComponents).map(([catId, comp]) => ({
							product_id: comp.product.id,
							component_category_id: catId,
							quantity: 1
						}))
					)}
				/>
				<div class="flex gap-4">
					<button
						type="submit"
						class="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
					>
						Save
					</button>
					<button
						type="button"
						on:click={() => (showSaveModal = false)}
						class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Share to Community Modal -->
{#if showShareModal}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
		role="dialog"
		aria-modal="true"
		aria-labelledby="share-modal-title"
		tabindex="-1"
		on:click={() => (showShareModal = false)}
		on:keydown={(e) => {
			if (e.key === 'Escape') {
				showShareModal = false;
			}
		}}
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div 
			class="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4" 
			role="document"
			on:click|stopPropagation
			on:keydown|stopPropagation
			aria-label="Modal content"
		>
			<div class="p-6">
				<h2 id="share-modal-title" class="text-2xl font-bold text-gray-900 mb-4">Share to Community</h2>
				
				<!-- Use Case -->
				<div class="mb-4">
					<label for="share-use-case" class="block mb-2 font-medium text-gray-900">Use Case *</label>
					<select
						id="share-use-case"
						bind:value={shareUseCase}
						class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
					>
						<option value="gaming">Gaming</option>
						<option value="workstation">Workstation</option>
						<option value="streaming">Streaming</option>
						<option value="editing">Video/Photo Editing</option>
						<option value="office">Office Work</option>
						<option value="budget">Budget Build</option>
					</select>
				</div>

				<!-- Tags -->
				<div class="mb-4">
					<label for="share-tags" class="block mb-2 font-medium text-gray-900">Tags</label>
					<div class="flex gap-2 mb-2">
						<input
							type="text"
							id="share-tags"
							bind:value={shareTagInput}
							placeholder="Add a tag..."
							class="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
							on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
						/>
						<button
							type="button"
							on:click={addTag}
							class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
						>
							Add
						</button>
					</div>
					{#if shareTags.length > 0}
						<div class="flex flex-wrap gap-2">
							{#each shareTags as tag}
								<span class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center gap-2">
									{tag}
									<button
										type="button"
										on:click={() => removeTag(tag)}
										class="text-indigo-600 hover:text-indigo-800"
									>
										×
									</button>
								</span>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Image URL (Optional) -->
				<div class="mb-4">
					<label for="share-image" class="block mb-2 font-medium text-gray-900">Build Image URL (Optional)</label>
					<input
						type="url"
						id="share-image"
						bind:value={shareImageUrl}
						placeholder="https://example.com/image.jpg"
						class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
					/>
				</div>

				<!-- Actions -->
				<div class="flex gap-3">
					<button
						type="button"
						on:click={shareBuild}
						class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
					>
						Share to Community
					</button>
					<button
						type="button"
						on:click={() => (showShareModal = false)}
						class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Energy Efficiency Modal -->
{#if showEnergyModal}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
		role="dialog"
		aria-modal="true"
		aria-labelledby="energy-modal-title"
		tabindex="-1"
		on:click={() => (showEnergyModal = false)}
		on:keydown={(e) => {
			if (e.key === 'Escape') {
				showEnergyModal = false;
			}
		}}
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div 
			class="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" 
			role="document"
			on:click|stopPropagation
			on:keydown|stopPropagation
			aria-label="Modal content"
		>
			<div class="p-6">
				<div class="flex justify-between items-center mb-4">
					<h2 id="energy-modal-title" class="text-2xl font-bold text-gray-900">⚡ Energy Efficiency Analysis</h2>
					<button
						type="button"
						on:click={() => (showEnergyModal = false)}
						class="text-gray-400 hover:text-gray-600"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{#if energyLoading}
					<div class="text-center py-12">
						<div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
						<p class="mt-4 text-gray-600">Calculating energy consumption...</p>
					</div>
				{:else if energyAnalysis}
					<!-- Power Consumption Summary -->
					<div class="bg-green-50 rounded-lg p-6 mb-6">
						<h3 class="text-lg font-bold text-gray-900 mb-4">Power Consumption</h3>
						<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div>
								<p class="text-sm text-gray-600">Idle Power</p>
								<p class="text-2xl font-bold text-green-600">{energyAnalysis.total_idle_watts}W</p>
							</div>
							<div>
								<p class="text-sm text-gray-600">Load Power</p>
								<p class="text-2xl font-bold text-orange-600">{energyAnalysis.total_load_watts}W</p>
							</div>
							<div>
								<p class="text-sm text-gray-600">Peak Power</p>
								<p class="text-2xl font-bold text-red-600">{energyAnalysis.total_peak_watts}W</p>
							</div>
							<div>
								<p class="text-sm text-gray-600">Recommended PSU</p>
								<p class="text-2xl font-bold text-blue-600">{energyAnalysis.recommended_psu_watts}W</p>
							</div>
						</div>
					</div>

					<!-- Electricity Costs -->
					<div class="bg-blue-50 rounded-lg p-6 mb-6">
						<h3 class="text-lg font-bold text-gray-900 mb-4">💰 Electricity Costs</h3>
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<p class="text-sm text-gray-600">Daily Cost</p>
								<p class="text-2xl font-bold text-blue-600">৳{energyAnalysis.daily_cost.toFixed(2)}</p>
							</div>
							<div>
								<p class="text-sm text-gray-600">Monthly Cost</p>
								<p class="text-2xl font-bold text-blue-600">৳{energyAnalysis.monthly_electricity_cost.toFixed(2)}</p>
							</div>
							<div>
								<p class="text-sm text-gray-600">Yearly Cost</p>
								<p class="text-2xl font-bold text-blue-600">৳{energyAnalysis.yearly_electricity_cost.toFixed(2)}</p>
							</div>
						</div>
						<p class="text-xs text-gray-500 mt-2">Based on 8 hours load, 16 hours idle per day at ৳6.5/kWh</p>
					</div>

					<!-- Carbon Footprint -->
					<div class="bg-gray-50 rounded-lg p-6 mb-6">
						<h3 class="text-lg font-bold text-gray-900 mb-2">🌱 Environmental Impact</h3>
						<p class="text-2xl font-bold text-gray-700">{energyAnalysis.carbon_footprint_kg.toFixed(2)} kg CO₂/year</p>
						<p class="text-sm text-gray-600 mt-2">Carbon footprint based on Bangladesh grid average</p>
					</div>

					<!-- PSU Recommendation -->
					{#if psuRecommendation}
						<div class="bg-purple-50 rounded-lg p-6 mb-6">
							<h3 class="text-lg font-bold text-gray-900 mb-4">🔌 Power Supply Recommendation</h3>
							<p class="text-gray-700 mb-2">
								<strong>{psuRecommendation.recommended_watts}W {psuRecommendation.recommended_efficiency}</strong>
							</p>
							<p class="text-sm text-gray-600 mb-4">{psuRecommendation.reason}</p>
							{#if psuRecommendation.options && psuRecommendation.options.length > 0}
								<div class="space-y-2">
									<p class="text-sm font-medium text-gray-700">Available Options:</p>
									{#each psuRecommendation.options as option}
										<div class="bg-white rounded p-3 flex justify-between items-center">
											<span class="text-gray-700">{option.wattage}W {option.efficiency}</span>
											{#if option.estimated_cost > 0}
												<span class="font-bold text-purple-600">৳{option.estimated_cost.toFixed(2)}</span>
											{/if}
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/if}

					<!-- Component Breakdown -->
					<div class="mb-6">
						<h3 class="text-lg font-bold text-gray-900 mb-4">Component Power Breakdown</h3>
						<div class="space-y-2">
							{#each energyAnalysis.components as comp}
								<div class="bg-gray-50 rounded p-4 flex justify-between items-center">
									<div>
										<p class="font-medium text-gray-900">{comp.product.name}</p>
										<p class="text-sm text-gray-600">{comp.category}</p>
									</div>
									<div class="text-right">
										<p class="text-sm text-gray-600">Idle: <span class="font-medium">{comp.idle_watts}W</span></p>
										<p class="text-sm text-gray-600">Load: <span class="font-medium">{comp.load_watts}W</span></p>
									</div>
								</div>
							{/each}
						</div>
					</div>

					<!-- Energy-Efficient Alternatives -->
					{#if energyAlternatives && energyAlternatives.alternatives && energyAlternatives.alternatives.length > 0}
						<div class="bg-yellow-50 rounded-lg p-6 mb-6">
							<h3 class="text-lg font-bold text-gray-900 mb-4">💡 Energy-Efficient Alternatives</h3>
							<p class="text-sm text-gray-600 mb-4">
								Save up to <strong>৳{energyAlternatives.savings.yearly_savings_taka.toFixed(2)}/year</strong> by switching to these alternatives!
							</p>
							<div class="space-y-4">
								{#each energyAlternatives.alternatives as alt}
									<div class="bg-white rounded-lg p-4 border border-yellow-200">
										<div class="flex justify-between items-start mb-2">
											<div class="flex-1">
												<p class="font-medium text-gray-900">Replace: {alt.original_product.name}</p>
												<p class="text-sm text-gray-600">With: {alt.alternative_product.name}</p>
											</div>
											<div class="text-right ml-4">
												<p class="text-sm font-medium text-green-600">-{alt.power_savings_watts}W</p>
												<p class="text-xs text-gray-500">Save ৳{alt.monthly_savings_taka.toFixed(2)}/mo</p>
											</div>
										</div>
										<div class="flex justify-between items-center mt-2">
											<span class="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
												Performance Impact: {alt.performance_impact}
											</span>
											<span class="text-xs text-gray-500">{alt.reason}</span>
										</div>
									</div>
								{/each}
							</div>
							{#if energyAlternatives.savings}
								<div class="mt-4 p-4 bg-green-100 rounded-lg">
									<p class="font-bold text-green-800">
										Total Potential Savings: ৳{energyAlternatives.savings.yearly_savings_taka.toFixed(2)}/year
									</p>
									<p class="text-sm text-green-700">
										Carbon Reduction: {energyAlternatives.savings.carbon_reduction_kg.toFixed(2)} kg CO₂/year
									</p>
								</div>
							{/if}
						</div>
					{/if}

					<!-- Close Button -->
					<div class="flex justify-end">
						<button
							type="button"
							on:click={() => (showEnergyModal = false)}
							class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
						>
							Close
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- AI Assistant Modal -->
{#if showAIAssistant}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" 
		role="dialog"
		aria-modal="true"
		aria-labelledby="ai-assistant-title"
		tabindex="-1"
		on:click={() => showAIAssistant = false}
		on:keydown={(e) => e.key === 'Escape' && (showAIAssistant = false)}
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div 
			class="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col m-4" 
			role="document"
			on:click|stopPropagation
			on:keydown|stopPropagation
			aria-label="Modal content"
		>
			<div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
				<div class="flex items-center gap-3">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
					</svg>
					<h2 id="ai-assistant-title" class="text-xl font-bold">AI PC Builder Assistant</h2>
				</div>
				<button on:click={() => showAIAssistant = false} class="text-white hover:text-gray-200">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>
			<div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
				{#if aiChatMessages.length === 0}
					<div class="text-center py-8">
						<p class="text-gray-600 mb-4">Ask me to build a PC! For example:</p>
						<p class="text-sm text-gray-500">"I need a gaming PC for 50000 taka"</p>
						<p class="text-sm text-gray-500">"Build a workstation PC for 80000 taka"</p>
					</div>
				{/if}
				{#each aiChatMessages as message}
					<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
						<div class="max-w-[80%] rounded-lg px-4 py-2 {message.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}">
							<p class="text-sm whitespace-pre-wrap">{message.content}</p>
						</div>
					</div>
				{/each}
				{#if aiLoading}
					<div class="flex justify-start">
						<div class="bg-white rounded-lg px-4 py-2 border border-gray-200">
							<div class="flex gap-1">
								<div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
								<div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
								<div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
							</div>
						</div>
					</div>
				{/if}
			</div>
			<div class="border-t border-gray-200 p-4 bg-white rounded-b-xl">
				<div class="flex gap-2">
					<input
						type="text"
						bind:value={aiChatInput}
						on:keypress={(e) => e.key === 'Enter' && sendAIMessage()}
						placeholder="Ask for a PC build (e.g., 'gaming PC for 50000 taka')..."
						disabled={aiLoading}
						class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
					/>
					<button
						on:click={sendAIMessage}
						disabled={!aiChatInput.trim() || aiLoading}
						class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Send
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Optimize Build Modal -->
{#if showOptimizeModal}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" 
		role="dialog"
		aria-modal="true"
		aria-labelledby="optimize-modal-title"
		tabindex="-1"
		on:click={() => showOptimizeModal = false}
		on:keydown={(e) => e.key === 'Escape' && (showOptimizeModal = false)}
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div 
			class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto m-4" 
			role="document"
			on:click|stopPropagation
			on:keydown|stopPropagation
			aria-label="Modal content"
		>
			<div class="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
				<h2 id="optimize-modal-title" class="text-xl font-bold">⚡ AI Build Optimization</h2>
				<button on:click={() => showOptimizeModal = false} class="text-white hover:text-gray-200">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>
			<div class="p-6">
				{#if optimizationResults}
					<p class="text-gray-700 mb-4">{optimizationResults.explanation}</p>
					{#if optimizationResults.optimizations.length > 0}
						<div class="space-y-4">
							{#each optimizationResults.optimizations as opt}
								<div class="border border-gray-200 rounded-lg p-4">
									<h3 class="font-semibold text-gray-900 mb-2">{opt.categoryName}</h3>
									<div class="grid grid-cols-2 gap-4 mb-3">
										<div>
											<p class="text-sm text-gray-600">Current</p>
											<p class="font-semibold">{opt.currentProductName}</p>
											<p class="text-sm text-gray-500">Tk {opt.currentPrice.toFixed(2)}</p>
										</div>
										<div>
											<p class="text-sm text-gray-600">Suggested</p>
											<p class="font-semibold text-green-600">{opt.suggestedProductName}</p>
											<p class="text-sm text-green-600">Tk {opt.suggestedPrice.toFixed(2)}</p>
										</div>
									</div>
									<p class="text-sm text-gray-700 mb-2">{opt.reason}</p>
									<p class="text-sm font-semibold text-green-600 mb-3">Save: Tk {opt.savings.toFixed(2)}</p>
									<button
										on:click={() => applyOptimization(opt)}
										class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
									>
										Apply This Change
									</button>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-gray-600">No optimizations found. Your build is already well-optimized!</p>
					{/if}
				{:else}
					<div class="text-center py-8">
						<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
						<p class="text-gray-600">Analyzing your build...</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Pre-built Builds Modal -->
{#if showPrebuiltModal}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" 
		role="dialog"
		aria-modal="true"
		aria-labelledby="prebuilt-modal-title"
		tabindex="-1"
		on:click={() => showPrebuiltModal = false}
		on:keydown={(e) => e.key === 'Escape' && (showPrebuiltModal = false)}
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div 
			class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto m-4" 
			role="document"
			on:click|stopPropagation
			on:keydown|stopPropagation
			aria-label="Modal content"
		>
			<div class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
				<h2 id="prebuilt-modal-title" class="text-xl font-bold">📦 AI Pre-built Configurations</h2>
				<button on:click={() => showPrebuiltModal = false} class="text-white hover:text-gray-200">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>
			<div class="p-6">
				<div class="mb-6 flex gap-4">
					<select bind:value={prebuiltUseCase} class="px-4 py-2 border border-gray-300 rounded-lg">
						<option value="gaming">Gaming</option>
						<option value="work">Work/Productivity</option>
						<option value="content-creation">Content Creation</option>
					</select>
					<input
						type="number"
						bind:value={prebuiltBudget}
						placeholder="Budget (Tk)"
						class="px-4 py-2 border border-gray-300 rounded-lg"
					/>
					<button
						on:click={loadPrebuiltBuilds}
						class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
					>
						Generate Builds
					</button>
				</div>
				{#if prebuiltBuilds.length > 0}
					<div class="space-y-6">
						{#each prebuiltBuilds as build}
							<div class="border border-gray-200 rounded-lg p-5">
								<h3 class="text-xl font-bold text-gray-900 mb-2">{build.name}</h3>
								<p class="text-gray-600 mb-4">{build.description}</p>
								<div class="mb-4">
									<h4 class="font-semibold text-gray-900 mb-2">Components:</h4>
									<ul class="space-y-2">
										{#each build.components as comp}
											<li class="text-sm text-gray-700">
												• {comp.productName} - Tk {comp.price.toFixed(2)}
											</li>
										{/each}
									</ul>
								</div>
								<div class="flex items-center justify-between">
									<p class="text-lg font-bold text-blue-600">Total: Tk {build.totalPrice.toFixed(2)}</p>
									<button
										on:click={() => applyPrebuiltBuild(build)}
										class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
									>
										Use This Build
									</button>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-gray-600 text-center py-8">Click "Generate Builds" to see AI-recommended configurations</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

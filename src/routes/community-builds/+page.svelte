<!-- VIEW: Community Builds Gallery -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { PCBuild } from '$lib/models/PCBuild';

	export let data: PageData;

	let searchInput = data.searchQuery || '';
	let showFilters = false;
	let filters = {
		use_case: $page.url.searchParams.get('use_case') || '',
		min_price: $page.url.searchParams.get('min_price') || '',
		max_price: $page.url.searchParams.get('max_price') || '',
		min_rating: $page.url.searchParams.get('min_rating') || '',
		sort_by: $page.url.searchParams.get('sort_by') || 'recent'
	};

	const useCases = [
		{ value: '', label: 'All Use Cases' },
		{ value: 'gaming', label: 'Gaming' },
		{ value: 'workstation', label: 'Workstation' },
		{ value: 'streaming', label: 'Streaming' },
		{ value: 'editing', label: 'Video/Photo Editing' },
		{ value: 'office', label: 'Office Work' },
		{ value: 'budget', label: 'Budget Build' }
	];

	const sortOptions = [
		{ value: 'recent', label: 'Most Recent' },
		{ value: 'popular', label: 'Most Popular' },
		{ value: 'rating', label: 'Highest Rated' },
		{ value: 'price_low', label: 'Price: Low to High' },
		{ value: 'price_high', label: 'Price: High to Low' }
	];

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('en-BD', {
			style: 'currency',
			currency: 'BDT',
			minimumFractionDigits: 0
		}).format(price);
	}

	function applyFilters() {
		const params = new URLSearchParams();
		
		if (searchInput.trim()) params.set('search', searchInput.trim());
		if (filters.use_case) params.set('use_case', filters.use_case);
		if (filters.min_price) params.set('min_price', filters.min_price);
		if (filters.max_price) params.set('max_price', filters.max_price);
		if (filters.min_rating) params.set('min_rating', filters.min_rating);
		if (filters.sort_by && filters.sort_by !== 'recent') params.set('sort_by', filters.sort_by);

		goto(`/community-builds?${params.toString()}`, { replaceState: true });
	}

	function clearFilters() {
		filters = {
			use_case: '',
			min_price: '',
			max_price: '',
			min_rating: '',
			sort_by: 'recent'
		};
		searchInput = '';
		applyFilters();
	}

	function handleSearch() {
		applyFilters();
	}

	async function toggleLike(buildId: string) {
		try {
			const response = await fetch(`/api/community-builds/${buildId}/like`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});

			if (response.ok) {
				// Reload page to update like status
				window.location.reload();
			}
		} catch (error) {
			console.error('Failed to like build:', error);
		}
	}
</script>

<svelte:head>
	<title>Community Builds - TinyTech</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white py-8">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8 text-center">
			<h1 class="text-4xl font-bold mb-2">Community Builds</h1>
			<p class="text-gray-400 text-lg">
				Discover PC builds shared by our community. Get inspired, rate, and share your own!
			</p>
		</div>

		<!-- Search and Filters -->
		<div class="bg-gray-800 rounded-lg p-4 mb-6">
			<div class="flex flex-col md:flex-row gap-4">
				<!-- Search -->
				<div class="flex-1">
					<input
						type="text"
						bind:value={searchInput}
						placeholder="Search builds..."
						class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						on:keydown={(e) => e.key === 'Enter' && handleSearch()}
					/>
				</div>

				<!-- Filter Toggle -->
				<button
					on:click={() => (showFilters = !showFilters)}
					class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
				>
					{showFilters ? 'Hide' : 'Show'} Filters
				</button>

				<!-- Search Button -->
				<button
					on:click={handleSearch}
					class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
				>
					Search
				</button>
			</div>

			<!-- Filters Panel -->
			{#if showFilters}
				<div class="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
					<!-- Use Case -->
					<div>
						<label class="block text-sm font-medium mb-1">Use Case</label>
						<select
							bind:value={filters.use_case}
							class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							{#each useCases as useCase}
								<option value={useCase.value}>{useCase.label}</option>
							{/each}
						</select>
					</div>

					<!-- Min Price -->
					<div>
						<label class="block text-sm font-medium mb-1">Min Price (৳)</label>
						<input
							type="number"
							bind:value={filters.min_price}
							placeholder="0"
							class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<!-- Max Price -->
					<div>
						<label class="block text-sm font-medium mb-1">Max Price (৳)</label>
						<input
							type="number"
							bind:value={filters.max_price}
							placeholder="Any"
							class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<!-- Min Rating -->
					<div>
						<label class="block text-sm font-medium mb-1">Min Rating</label>
						<select
							bind:value={filters.min_rating}
							class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Any</option>
							<option value="4">4+ Stars</option>
							<option value="3">3+ Stars</option>
							<option value="2">2+ Stars</option>
						</select>
					</div>

					<!-- Sort By -->
					<div>
						<label class="block text-sm font-medium mb-1">Sort By</label>
						<select
							bind:value={filters.sort_by}
							class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							{#each sortOptions as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="mt-4 flex gap-2">
					<button
						on:click={applyFilters}
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
					>
						Apply Filters
					</button>
					<button
						on:click={clearFilters}
						class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
					>
						Clear
					</button>
				</div>
			{/if}
		</div>

		<!-- Featured Builds Section -->
		{#if data.featuredBuilds && data.featuredBuilds.length > 0}
			<div class="mb-8">
				<h2 class="text-2xl font-bold mb-4">⭐ Featured Builds</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each data.featuredBuilds as build (build.id)}
						<div class="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition cursor-pointer"
							 on:click={() => goto(`/community-builds/${build.id}`)}>
							<!-- Build Image or Placeholder -->
							<div class="mb-4 h-48 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
								{#if build.image_url}
									<img
										src={build.image_url}
										alt={build.name}
										class="w-full h-full object-cover rounded-lg"
										on:error={(e) => {
											e.currentTarget.style.display = 'none';
											const placeholder = e.currentTarget.nextElementSibling;
											if (placeholder) placeholder.style.display = 'flex';
										}}
									/>
									<div class="hidden text-gray-500 text-4xl w-full h-full items-center justify-center">🖥️</div>
								{:else}
									<div class="text-gray-500 text-4xl">🖥️</div>
								{/if}
							</div>

							<!-- Build Info -->
							<h3 class="text-xl font-bold mb-2">{build.name}</h3>
							{#if build.description}
								<p class="text-gray-400 text-sm mb-3 line-clamp-2">{build.description}</p>
							{/if}

							<!-- Meta Info -->
							<div class="flex flex-wrap gap-2 mb-3">
								{#if build.use_case}
									<span class="px-2 py-1 bg-blue-600 rounded text-xs">{build.use_case}</span>
								{/if}
								{#if build.featured}
									<span class="px-2 py-1 bg-yellow-600 rounded text-xs">⭐ Featured</span>
								{/if}
							</div>

							<!-- Stats -->
							<div class="flex items-center justify-between mb-4">
								<div class="flex items-center gap-4 text-sm text-gray-400">
									<span>❤️ {build.likes_count || 0}</span>
									<span>👁️ {build.views_count || 0}</span>
									{#if build.average_rating}
										<span>⭐ {build.average_rating.toFixed(1)}</span>
									{/if}
								</div>
								<div class="text-lg font-bold text-blue-400">
									{formatPrice(build.total_price)}
								</div>
							</div>

							<!-- User Info -->
							{#if build.user}
								<div class="text-sm text-gray-500">
									by {build.user.name}
								</div>
							{/if}

							<!-- Actions -->
							<div class="mt-4 flex gap-2" on:click|stopPropagation>
								<button
									on:click={() => toggleLike(build.id)}
									class="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition {build.is_liked ? 'text-red-400' : ''}"
								>
									{build.is_liked ? '❤️ Liked' : '🤍 Like'}
								</button>
								<button
									on:click={() => goto(`/community-builds/${build.id}`)}
									class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
								>
									View
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- All Shared Community Builds -->
		<div>
			<h2 class="text-2xl font-bold mb-4">
				All Shared Builds ({data.builds.length})
			</h2>

			{#if data.builds.length === 0}
				<div class="text-center py-12 bg-gray-800 rounded-lg">
					<div class="max-w-md mx-auto">
						<p class="text-gray-400 text-lg mb-4">No shared builds found yet.</p>
						<p class="text-gray-500 text-sm mb-6">
							Be the first to share your PC build with the community!
						</p>
						<a
							href="/pc-builder"
							class="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white font-semibold"
						>
							Create & Share Your Build
						</a>
					</div>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each data.builds as build (build.id)}
						<div class="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition cursor-pointer"
							 on:click={() => goto(`/community-builds/${build.id}`)}>
							<!-- Build Image or Placeholder -->
							<div class="mb-4 h-48 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
								{#if build.image_url}
									<img
										src={build.image_url}
										alt={build.name}
										class="w-full h-full object-cover rounded-lg"
										on:error={(e) => {
											e.currentTarget.style.display = 'none';
											const placeholder = e.currentTarget.nextElementSibling;
											if (placeholder) placeholder.style.display = 'flex';
										}}
									/>
									<div class="hidden text-gray-500 text-4xl w-full h-full items-center justify-center">🖥️</div>
								{:else}
									<div class="text-gray-500 text-4xl">🖥️</div>
								{/if}
							</div>

							<!-- Build Info -->
							<h3 class="text-xl font-bold mb-2">{build.name}</h3>
							{#if build.description}
								<p class="text-gray-400 text-sm mb-3 line-clamp-2">{build.description}</p>
							{/if}

							<!-- Meta Info -->
							<div class="flex flex-wrap gap-2 mb-3">
								{#if build.use_case}
									<span class="px-2 py-1 bg-blue-600 rounded text-xs">{build.use_case}</span>
								{/if}
								{#if build.featured}
									<span class="px-2 py-1 bg-yellow-600 rounded text-xs">⭐ Featured</span>
								{/if}
							</div>

							<!-- Stats -->
							<div class="flex items-center justify-between mb-4">
								<div class="flex items-center gap-4 text-sm text-gray-400">
									<span>❤️ {build.likes_count || 0}</span>
									<span>👁️ {build.views_count || 0}</span>
									{#if build.average_rating}
										<span>⭐ {build.average_rating.toFixed(1)}</span>
									{/if}
								</div>
								<div class="text-lg font-bold text-blue-400">
									{formatPrice(build.total_price)}
								</div>
							</div>

							<!-- User Info -->
							{#if build.user}
								<div class="text-sm text-gray-500">
									by {build.user.name}
								</div>
							{/if}

							<!-- Actions -->
							<div class="mt-4 flex gap-2" on:click|stopPropagation>
								<button
									on:click={() => toggleLike(build.id)}
									class="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition {build.is_liked ? 'text-red-400' : ''}"
								>
									{build.is_liked ? '❤️ Liked' : '🤍 Like'}
								</button>
								<button
									on:click={() => goto(`/community-builds/${build.id}`)}
									class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
								>
									View
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>


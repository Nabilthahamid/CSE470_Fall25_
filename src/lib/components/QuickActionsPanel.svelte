<!-- VIEW: Quick Actions Panel -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let searchQuery = '';
	let showPanel = false;
	let searchResults: any = null;
	let loading = false;
	let recentItems: Array<{ type: string; id: string; name: string; path: string; timestamp: number }> = [];
	let favorites: Array<{ type: string; id: string; name: string; path: string }> = [];
	let activeTab: 'search' | 'recent' | 'favorites' | 'shortcuts' = 'search';

	onMount(() => {
		loadRecentItems();
		loadFavorites();

		// Keyboard shortcut: Ctrl+K or Cmd+K
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
				e.preventDefault();
				showPanel = true;
			}
			if (e.key === 'Escape' && showPanel) {
				showPanel = false;
				searchQuery = '';
				searchResults = null;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	});

	function loadRecentItems() {
		const saved = localStorage.getItem('admin_recent_items');
		if (saved) {
			try {
				recentItems = JSON.parse(saved).slice(0, 10);
			} catch (error) {
				recentItems = [];
			}
		}
	}

	function loadFavorites() {
		const saved = localStorage.getItem('admin_favorites');
		if (saved) {
			try {
				favorites = JSON.parse(saved);
			} catch (error) {
				favorites = [];
			}
		}
	}

	function saveRecentItem(type: string, id: string, name: string, path: string) {
		const item = { type, id, name, path, timestamp: Date.now() };
		const existing = recentItems.filter(i => !(i.type === type && i.id === id));
		recentItems = [item, ...existing].slice(0, 10);
		localStorage.setItem('admin_recent_items', JSON.stringify(recentItems));
	}

	function toggleFavorite(item: { type: string; id: string; name: string; path: string }) {
		const exists = favorites.find(f => f.type === item.type && f.id === item.id);
		if (exists) {
			favorites = favorites.filter(f => !(f.type === item.type && f.id === item.id));
		} else {
			favorites = [...favorites, item];
		}
		localStorage.setItem('admin_favorites', JSON.stringify(favorites));
	}

	function isFavorite(item: { type: string; id: string }): boolean {
		return favorites.some(f => f.type === item.type && f.id === item.id);
	}

	async function performSearch() {
		if (!searchQuery.trim()) {
			searchResults = null;
			return;
		}

		loading = true;
		try {
			const response = await fetch(`/api/admin/quick-search?q=${encodeURIComponent(searchQuery)}`);
			if (response.ok) {
				searchResults = await response.json();
			}
		} catch (error) {
			console.error('Search error:', error);
			searchResults = { error: 'Search failed' };
		} finally {
			loading = false;
		}
	}

	function handleSearchInput() {
		const timer = setTimeout(() => {
			performSearch();
		}, 300);
		return () => clearTimeout(timer);
	}

	function navigateTo(path: string, type?: string, id?: string, name?: string) {
		if (type && id && name) {
			saveRecentItem(type, id, name, path);
		}
		showPanel = false;
		searchQuery = '';
		searchResults = null;
		goto(path);
	}
</script>

<!-- Quick Actions Button -->
<button
	on:click={() => (showPanel = true)}
	class="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 active:bg-indigo-800 transition-all transform hover:scale-110 active:scale-95 touch-manipulation"
	title="Quick Actions (Ctrl+K)"
	aria-label="Quick Actions"
	style="touch-action: manipulation; -webkit-tap-highlight-color: transparent; min-width: 56px; min-height: 56px;"
>
	<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
	</svg>
</button>

<!-- Quick Actions Panel Modal -->
{#if showPanel}
	<div
		class="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black bg-opacity-50"
		on:click={() => {
			showPanel = false;
			searchQuery = '';
			searchResults = null;
		}}
		on:keydown={(e) => {
			if (e.key === 'Escape') {
				showPanel = false;
				searchQuery = '';
				searchResults = null;
			}
		}}
		role="button"
		aria-label="Close panel"
		tabindex="0"
	>
		<div
			class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
			on:click|stopPropagation
			role="dialog"
			aria-modal="true"
			aria-labelledby="quick-actions-title"
		>
			<!-- Tabs -->
			<div class="flex border-b border-gray-200">
				<button
					on:click={() => activeTab = 'search'}
					class="flex-1 px-4 py-3 font-semibold border-b-2 transition-colors {activeTab === 'search' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
				>
					Search
				</button>
				<button
					on:click={() => activeTab = 'recent'}
					class="flex-1 px-4 py-3 font-semibold border-b-2 transition-colors {activeTab === 'recent' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
				>
					Recent
				</button>
				<button
					on:click={() => activeTab = 'favorites'}
					class="flex-1 px-4 py-3 font-semibold border-b-2 transition-colors {activeTab === 'favorites' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
				>
					Favorites
				</button>
				<button
					on:click={() => activeTab = 'shortcuts'}
					class="flex-1 px-4 py-3 font-semibold border-b-2 transition-colors {activeTab === 'shortcuts' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
				>
					Shortcuts
				</button>
			</div>

			<!-- Search Tab -->
			{#if activeTab === 'search'}
				<div class="p-4 border-b border-gray-200">
					<div class="flex items-center gap-3">
						<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
						</svg>
						<input
							type="text"
							bind:value={searchQuery}
							on:input={handleSearchInput}
							placeholder="Search products, orders, users..."
							class="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
						/>
						<button
							on:click={() => {
								showPanel = false;
								searchQuery = '';
								searchResults = null;
							}}
							class="text-gray-400 hover:text-gray-600"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
							</svg>
						</button>
					</div>
				</div>
				<div class="max-h-96 overflow-y-auto">
					{#if loading}
						<div class="p-8 text-center text-gray-500">
							<svg class="animate-spin h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Searching...
						</div>
					{:else if searchResults?.error}
						<div class="p-8 text-center text-red-500">{searchResults.error}</div>
					{:else if searchResults && searchQuery.trim()}
						{#if searchResults.products?.length === 0 && searchResults.orders?.length === 0 && searchResults.users?.length === 0}
							<div class="p-8 text-center text-gray-500">No results found</div>
						{:else}
							{#if searchResults.products && searchResults.products.length > 0}
								<div class="p-2">
									<div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Products</div>
									{#each searchResults.products.slice(0, 5) as product}
										<button
											on:click={() => navigateTo(`/admin/products/${product.id}/edit`, 'product', product.id, product.name)}
											class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between group"
										>
											<div>
												<div class="font-medium text-gray-900">{product.name}</div>
												<div class="text-sm text-gray-500">Tk {product.price.toFixed(2)} • Stock: {product.stock}</div>
											</div>
											<button
												on:click|stopPropagation={() => toggleFavorite({ type: 'product', id: product.id, name: product.name, path: `/admin/products/${product.id}/edit` })}
												class="opacity-0 group-hover:opacity-100 p-1"
											>
												<svg class="w-4 h-4 {isFavorite({ type: 'product', id: product.id }) ? 'text-yellow-500 fill-current' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
												</svg>
											</button>
										</button>
									{/each}
								</div>
							{/if}
							{#if searchResults.orders && searchResults.orders.length > 0}
								<div class="p-2 border-t border-gray-200">
									<div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Orders</div>
									{#each searchResults.orders.slice(0, 5) as order}
										<button
											on:click={() => navigateTo(`/admin/orders/${order.id}`, 'order', order.id, `Order #${order.id.slice(0, 8)}`)}
											class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
										>
											<div class="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</div>
											<div class="text-sm text-gray-500">{order.customer_name} • Tk {order.total_amount.toFixed(2)}</div>
										</button>
									{/each}
								</div>
							{/if}
							{#if searchResults.users && searchResults.users.length > 0}
								<div class="p-2 border-t border-gray-200">
									<div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Users</div>
									{#each searchResults.users.slice(0, 5) as user}
										<button
											on:click={() => navigateTo(`/admin/users/${user.id}`, 'user', user.id, user.name || user.email)}
											class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
										>
											<div class="font-medium text-gray-900">{user.name || user.email}</div>
											<div class="text-sm text-gray-500">{user.email} • {user.role}</div>
										</button>
									{/each}
								</div>
							{/if}
						{/if}
					{:else if searchQuery.trim()}
						<div class="p-8 text-center text-gray-500">Type to search...</div>
					{/if}
				</div>
			{/if}

			<!-- Recent Items Tab -->
			{#if activeTab === 'recent'}
				<div class="max-h-96 overflow-y-auto p-4">
					{#if recentItems.length === 0}
						<div class="text-center py-8 text-gray-500">No recent items</div>
					{:else}
						<div class="space-y-2">
							{#each recentItems as item}
								<button
									on:click={() => navigateTo(item.path)}
									class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
								>
									<div>
										<div class="font-medium text-gray-900">{item.name}</div>
										<div class="text-sm text-gray-500">{item.type} • {new Date(item.timestamp).toLocaleString()}</div>
									</div>
									<button
										on:click|stopPropagation={() => toggleFavorite(item)}
										class="p-1"
									>
										<svg class="w-4 h-4 {isFavorite(item) ? 'text-yellow-500 fill-current' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
										</svg>
									</button>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Favorites Tab -->
			{#if activeTab === 'favorites'}
				<div class="max-h-96 overflow-y-auto p-4">
					{#if favorites.length === 0}
						<div class="text-center py-8 text-gray-500">No favorites yet. Star items to add them here.</div>
					{:else}
						<div class="space-y-2">
							{#each favorites as item}
								<button
									on:click={() => navigateTo(item.path)}
									class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
								>
									<div>
										<div class="font-medium text-gray-900">{item.name}</div>
										<div class="text-sm text-gray-500">{item.type}</div>
									</div>
									<button
										on:click|stopPropagation={() => toggleFavorite(item)}
										class="p-1 text-yellow-500"
									>
										<svg class="w-4 h-4 fill-current" fill="currentColor" viewBox="0 0 24 24">
											<path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
										</svg>
									</button>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Keyboard Shortcuts Tab -->
			{#if activeTab === 'shortcuts'}
				<div class="max-h-96 overflow-y-auto p-4">
					<div class="space-y-4">
						<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<span class="text-gray-700">Open Quick Actions</span>
							<kbd class="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Ctrl+K</kbd>
						</div>
						<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<span class="text-gray-700">Close Panel</span>
							<kbd class="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Esc</kbd>
						</div>
						<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<span class="text-gray-700">Go to Dashboard</span>
							<kbd class="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">g</kbd> + <kbd class="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">d</kbd>
						</div>
						<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<span class="text-gray-700">Go to Products</span>
							<kbd class="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">g</kbd> + <kbd class="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">p</kbd>
						</div>
						<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<span class="text-gray-700">Go to Orders</span>
							<kbd class="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">g</kbd> + <kbd class="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">o</kbd>
						</div>
						<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<span class="text-gray-700">Go to Analytics</span>
							<kbd class="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">g</kbd> + <kbd class="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">a</kbd>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}


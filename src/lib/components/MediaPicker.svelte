<!-- COMPONENT: Media Picker for selecting images from media library -->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { MediaFile } from '$lib/models/Media';

	export let multiple: boolean = false;
	export let selectedUrls: string[] = [];
	export let onSelect: (urls: string[]) => void;
	export let onClose: () => void;

	let mediaFiles: MediaFile[] = [];
	let loading = false;
	let searchQuery = '';
	let filterType: 'image' | 'video' | 'document' | 'other' | 'all' = 'image';
	let selectedCount = 0;
	let selectedMedia: Set<string> = new Set(selectedUrls);
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	onMount(() => {
		loadMedia();
	});

	async function loadMedia() {
		loading = true;
		try {
			const params = new URLSearchParams();
			if (filterType !== 'all') {
				params.set('type', filterType);
			}
			if (searchQuery.trim()) {
				params.set('search', searchQuery.trim());
			}

			const response = await fetch(`/api/media?${params.toString()}`);
			if (response.ok) {
				const data = await response.json();
				mediaFiles = data.media || [];
			} else {
				console.error('Failed to load media:', response.statusText);
				mediaFiles = [];
			}
		} catch (error) {
			console.error('Failed to load media:', error);
			mediaFiles = [];
		} finally {
			loading = false;
		}
	}

	function toggleSelect(url: string) {
		// Create a new Set to trigger reactivity
		const newSelected = new Set(selectedMedia);
		
		if (multiple) {
			if (newSelected.has(url)) {
				newSelected.delete(url);
			} else {
				newSelected.add(url);
			}
		} else {
			newSelected.clear();
			newSelected.add(url);
		}
		
		// Reassign to trigger reactivity
		selectedMedia = newSelected;
		selectedCount = newSelected.size;
	}

	// Update selectedCount when selectedMedia changes
	$: selectedCount = selectedMedia.size;

	function handleSelect() {
		const urls = Array.from(selectedMedia);
		if (urls.length > 0) {
			onSelect(urls);
			onClose();
		}
	}

	function handleSearch() {
		// Debounce search to avoid too many API calls
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}
		searchTimeout = setTimeout(() => {
			loadMedia();
		}, 300);
	}

	function handleFilterChange() {
		loadMedia();
	}
</script>

<!-- Modal Backdrop -->
<div
	class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
	on:click={onClose}
	on:keydown={(e) => e.key === 'Escape' && onClose()}
	role="dialog"
	aria-modal="true"
	aria-labelledby="media-picker-title"
>
	<!-- Modal Content -->
	<div
		class="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
		on:click|stopPropagation
	>
		<!-- Header -->
		<div class="flex justify-between items-center p-6 border-b border-gray-200">
			<h2 id="media-picker-title" class="text-2xl font-bold text-gray-900">Select from Media Library</h2>
			<button
				on:click={onClose}
				class="text-gray-400 hover:text-gray-600 text-2xl font-bold"
				aria-label="Close"
			>
				×
			</button>
		</div>

		<!-- Search and Filter -->
		<div class="p-4 border-b border-gray-200 flex gap-4">
			<div class="flex-1">
				<input
					type="text"
					placeholder="Search media..."
					bind:value={searchQuery}
					on:input={handleSearch}
					class="w-full p-2 border-2 border-gray-300 rounded-lg"
				/>
			</div>
			<select bind:value={filterType} on:change={handleFilterChange} class="p-2 border-2 border-gray-300 rounded-lg">
				<option value="all">All Types</option>
				<option value="image">Images Only</option>
				<option value="video">Videos Only</option>
				<option value="document">Documents Only</option>
			</select>
		</div>

		<!-- Media Grid -->
		<div class="flex-1 overflow-y-auto p-6">
			{#if loading}
				<div class="text-center py-12">
					<p class="text-gray-500">Loading media...</p>
				</div>
			{:else if mediaFiles.length === 0}
				<div class="text-center py-12">
					<p class="text-gray-500">No media files found.</p>
					<p class="text-sm text-gray-400 mt-2">Upload files in the Media Library first.</p>
				</div>
			{:else}
				<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
					{#each mediaFiles as media}
						{#if media.file_type === 'image'}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<div
								class="relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all {selectedMedia.has(media.file_url)
									? 'border-indigo-600 ring-2 ring-indigo-300'
									: 'border-gray-200 hover:border-gray-400'}"
								on:click|stopPropagation={() => toggleSelect(media.file_url)}
								on:mousedown|stopPropagation
								role="button"
								tabindex="0"
								on:keydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										e.stopPropagation();
										toggleSelect(media.file_url);
									}
								}}
							>
								<img
									src={media.file_url}
									alt={media.alt_text || media.original_filename}
									class="w-full h-32 object-cover"
									on:error={(e) => {
										e.currentTarget.style.display = 'none';
									}}
								/>
								{#if selectedMedia.has(media.file_url)}
									<div class="absolute top-2 right-2 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
										✓
									</div>
								{/if}
								<div class="p-2 bg-white">
									<p class="text-xs text-gray-600 truncate" title={media.original_filename}>
										{media.original_filename}
									</p>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<div class="flex justify-between items-center p-6 border-t border-gray-200">
			<div class="text-sm text-gray-600">
				{#if multiple}
					{selectedCount} image{selectedCount !== 1 ? 's' : ''} selected
				{:else}
					{selectedCount > 0 ? '1 image selected' : 'No image selected'}
				{/if}
			</div>
			<div class="flex gap-3">
				<button
					on:click={onClose}
					class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
				>
					Cancel
				</button>
				<button
					on:click={handleSelect}
					disabled={selectedCount === 0}
					class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
				>
					Select
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	:global(body:has(.fixed.inset-0)) {
		overflow: hidden;
	}
</style>


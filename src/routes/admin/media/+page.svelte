<!-- VIEW: Media Library Page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { PageData, ActionData } from './$types';
	import { uploadImage } from '$lib/utils/storage';

	export let data: PageData;
	export let form: ActionData;
	export let params: Record<string, string> = {};

	let showUploadForm = false;
	let selectedMedia: any = null;
	let viewMode: 'grid' | 'list' = 'grid';
	let filterType: string = data.type || 'all';
	let searchQuery = data.search || '';

	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		try {
			const fileUrl = await uploadImage(file, 'product-images');
			// Reload page to show new media
			window.location.reload();
		} catch (error: any) {
			alert('Upload failed: ' + error.message);
		}
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
	}

	function getMediaUsage(media: any) {
		// This would be populated from the media_usage table
		return media.usage_count || 0;
	}
</script>

<svelte:head>
	<title>Media Library - Admin Dashboard</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Media Library</h1>
		<button
			on:click={() => (showUploadForm = !showUploadForm)}
			class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
		>
			+ Upload Media
		</button>
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

	<!-- Statistics -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
		<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
			<h3 class="text-sm font-semibold text-gray-600 mb-2">Total Files</h3>
			<p class="text-3xl font-bold text-gray-900">{data.stats.totalFiles}</p>
		</div>
		<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
			<h3 class="text-sm font-semibold text-gray-600 mb-2">Total Size</h3>
			<p class="text-3xl font-bold text-gray-900">{formatFileSize(data.stats.totalSize)}</p>
		</div>
		<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
			<h3 class="text-sm font-semibold text-gray-600 mb-2">Images</h3>
			<p class="text-3xl font-bold text-gray-900">{data.stats.byType.image || 0}</p>
		</div>
		<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
			<h3 class="text-sm font-semibold text-gray-600 mb-2">Unused Files</h3>
			<p class="text-3xl font-bold text-orange-600">{data.stats.unusedCount}</p>
		</div>
	</div>

	<!-- Upload Form -->
	{#if showUploadForm}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6">
			<h2 class="text-xl font-bold text-gray-900 mb-4">Upload New Media</h2>
			<form method="POST" action="?/upload" use:enhance>
				<div class="space-y-4">
					<div>
						<label class="block mb-2 font-medium">File *</label>
						<input
							type="file"
							name="file"
							required
							accept="image/*,video/*,.pdf"
							on:change={handleFileUpload}
							class="w-full p-3 border-2 border-gray-300 rounded-lg"
						/>
					</div>
					<div>
						<label class="block mb-2 font-medium">Folder</label>
						<input
							type="text"
							name="folder"
							placeholder="general"
							class="w-full p-3 border-2 border-gray-300 rounded-lg"
						/>
					</div>
					<div>
						<label class="block mb-2 font-medium">Alt Text</label>
						<input
							type="text"
							name="alt_text"
							class="w-full p-3 border-2 border-gray-300 rounded-lg"
						/>
					</div>
					<div>
						<label class="block mb-2 font-medium">Description</label>
						<textarea
							name="description"
							rows="3"
							class="w-full p-3 border-2 border-gray-300 rounded-lg"
						></textarea>
					</div>
					<div class="flex gap-3">
						<button type="submit" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
							Upload
						</button>
						<button
							type="button"
							on:click={() => (showUploadForm = false)}
							class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
						>
							Cancel
						</button>
					</div>
				</div>
			</form>
		</div>
	{/if}

	<!-- Filters -->
	<div class="bg-white rounded-xl shadow-lg p-4 border border-gray-200 mb-6">
		<div class="flex flex-wrap items-center gap-4">
			<div class="flex-1 min-w-[200px]">
				<input
					type="text"
					placeholder="Search media..."
					bind:value={searchQuery}
					class="w-full p-3 border-2 border-gray-300 rounded-lg"
					on:keydown={(e) => {
						if (e.key === 'Enter') {
							window.location.href = `/admin/media?search=${encodeURIComponent(searchQuery)}`;
						}
					}}
				/>
			</div>
			<select
				bind:value={filterType}
				class="p-3 border-2 border-gray-300 rounded-lg"
				on:change={() => {
					if (filterType === 'all') {
						window.location.href = '/admin/media';
					} else {
						window.location.href = `/admin/media?type=${filterType}`;
					}
				}}
			>
				<option value="all">All Types</option>
				<option value="image">Images</option>
				<option value="video">Videos</option>
				<option value="document">Documents</option>
				<option value="other">Other</option>
			</select>
			<div class="flex gap-2">
				<button
					on:click={() => (viewMode = 'grid')}
					class="px-4 py-2 rounded-lg {viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}"
				>
					Grid
				</button>
				<button
					on:click={() => (viewMode = 'list')}
					class="px-4 py-2 rounded-lg {viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}"
				>
					List
				</button>
			</div>
		</div>
	</div>

	<!-- Media Grid/List -->
	{#if viewMode === 'grid'}
		<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
			{#each data.media as media}
				<div
					class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
					on:click={() => (selectedMedia = media)}
				>
					{#if media.file_type === 'image'}
						<img src={media.file_url} alt={media.alt_text || media.filename} class="w-full h-32 object-cover" />
					{:else}
						<div class="w-full h-32 bg-gray-100 flex items-center justify-center">
							<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
							</svg>
						</div>
					{/if}
					<div class="p-3">
						<p class="text-sm font-medium text-gray-900 truncate" title={media.filename}>
							{media.filename}
						</p>
						<p class="text-xs text-gray-500">{formatFileSize(media.file_size)}</p>
						<p class="text-xs text-gray-500">Used: {getMediaUsage(media)} times</p>
					</div>
				</div>
			{:else}
				<div class="col-span-full text-center py-12 text-gray-500">
					No media files found. Upload your first file!
				</div>
			{/each}
		</div>
	{:else}
		<div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
			<table class="w-full">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filename</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each data.media as media}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4">
								{#if media.file_type === 'image'}
									<img src={media.file_url} alt={media.alt_text || media.filename} class="w-16 h-16 object-cover rounded" />
								{:else}
									<div class="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
										<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
										</svg>
									</div>
								{/if}
							</td>
							<td class="px-6 py-4">
								<div>
									<p class="font-medium text-gray-900">{media.filename}</p>
									{#if media.folder}
										<p class="text-sm text-gray-500">/{media.folder}</p>
									{/if}
								</div>
							</td>
							<td class="px-6 py-4">
								<span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
									{media.file_type}
								</span>
							</td>
							<td class="px-6 py-4 text-sm text-gray-600">{formatFileSize(media.file_size)}</td>
							<td class="px-6 py-4 text-sm text-gray-600">{getMediaUsage(media)}</td>
							<td class="px-6 py-4">
								<div class="flex gap-2">
									<button
										on:click={() => (selectedMedia = media)}
										class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
									>
										View
									</button>
									<form method="POST" action="?/delete" use:enhance class="inline">
										<input type="hidden" name="id" value={media.id} />
										<input type="hidden" name="file_url" value={media.file_url} />
										<button
											type="submit"
											class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
											on:click={(e) => {
												if (!confirm('Delete this media file?')) e.preventDefault();
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
							<td colspan="6" class="px-6 py-12 text-center text-gray-500">
								No media files found. Upload your first file!
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<!-- Media Detail Modal -->
	{#if selectedMedia}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
			on:click={() => (selectedMedia = null)}
		>
			<div
				class="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
				on:click|stopPropagation
			>
				<div class="flex justify-between items-center mb-4">
					<h2 class="text-2xl font-bold text-gray-900">Media Details</h2>
					<button
						on:click={() => (selectedMedia = null)}
						class="text-gray-400 hover:text-gray-600"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					</button>
				</div>
				{#if selectedMedia.file_type === 'image'}
					<img src={selectedMedia.file_url} alt={selectedMedia.alt_text || selectedMedia.filename} class="w-full rounded-lg mb-4" />
				{/if}
				<div class="space-y-4">
					<div>
						<label class="block mb-2 font-medium">Filename</label>
						<p class="text-gray-700">{selectedMedia.filename}</p>
					</div>
					<div>
						<label for="file-url" class="block mb-2 font-medium">File URL</label>
						<input
							id="file-url"
							type="text"
							value={selectedMedia.file_url}
							readonly
							class="w-full p-3 border-2 border-gray-300 rounded-lg bg-gray-50"
							on:click={(e) => {
								const target = e.currentTarget;
								if (target instanceof HTMLInputElement) {
									target.select();
								}
							}}
						/>
					</div>
					<form method="POST" action="?/update" use:enhance>
						<input type="hidden" name="id" value={selectedMedia.id} />
						<div class="space-y-4">
							<div>
								<label class="block mb-2 font-medium">Alt Text</label>
								<input
									type="text"
									name="alt_text"
									value={selectedMedia.alt_text || ''}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Description</label>
								<textarea
									name="description"
									value={selectedMedia.description || ''}
									rows="3"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								></textarea>
							</div>
							<div>
								<label class="block mb-2 font-medium">Folder</label>
								<input
									type="text"
									name="folder"
									value={selectedMedia.folder || ''}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div class="flex gap-3">
								<button type="submit" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
									Update
								</button>
								<button
									type="button"
									on:click={() => (selectedMedia = null)}
									class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
								>
									Close
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	{/if}
</div>


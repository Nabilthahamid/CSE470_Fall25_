<!-- VIEW: Community Build Detail Page -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { PCBuild, BuildComment } from '$lib/models/PCBuild';

	export let data: PageData;
	export let params: { id: string };

	let build = data.build;
	let comments = data.comments || [];
	let similarBuilds = data.similarBuilds || [];
	let currentUserId = data.currentUserId;

	let newComment = '';
	let rating = 5;
	let isLiked = (build as any).is_liked || false;
	let userRating = (build as any).user_rating || null;

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('en-BD', {
			style: 'currency',
			currency: 'BDT',
			minimumFractionDigits: 0
		}).format(price);
	}

	async function toggleLike() {
		if (!currentUserId) {
			alert('Please login to like builds');
			return;
		}

		try {
			const response = await fetch(`/api/community-builds/${build.id}/like`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});

			if (response.ok) {
				isLiked = !isLiked;
				build.likes_count = isLiked ? build.likes_count + 1 : build.likes_count - 1;
			}
		} catch (error) {
			console.error('Failed to like build:', error);
		}
	}

	async function submitComment() {
		if (!currentUserId) {
			alert('Please login to comment');
			return;
		}

		if (!newComment.trim()) {
			alert('Please enter a comment');
			return;
		}

		try {
			const response = await fetch(`/api/community-builds/${build.id}/comment`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ comment: newComment.trim() })
			});

			if (response.ok) {
				const comment = await response.json();
				comments = [...comments, comment];
				newComment = '';
			}
		} catch (error) {
			console.error('Failed to submit comment:', error);
		}
	}

	async function submitRating() {
		if (!currentUserId) {
			alert('Please login to rate builds');
			return;
		}

		try {
			const response = await fetch(`/api/community-builds/${build.id}/rate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ rating })
			});

			if (response.ok) {
				userRating = rating;
				// Reload to get updated average rating
				window.location.reload();
			}
		} catch (error) {
			console.error('Failed to submit rating:', error);
		}
	}
</script>

<svelte:head>
	<title>{build.name} - Community Builds - TinyTech</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white py-8">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Back Button -->
		<button
			on:click={() => goto('/community-builds')}
			class="mb-6 text-blue-400 hover:text-blue-300 flex items-center gap-2"
		>
			← Back to Community Builds
		</button>

		<!-- Build Header -->
		<div class="bg-gray-800 rounded-lg p-6 mb-6">
			<div class="flex flex-col md:flex-row gap-6">
				<!-- Build Image -->
				<div class="w-full md:w-1/3">
					{#if build.image_url}
						<img
							src={build.image_url}
							alt={build.name}
							class="w-full h-64 object-cover rounded-lg"
							on:error={(e) => {
								e.currentTarget.style.display = 'none';
								const placeholder = e.currentTarget.nextElementSibling;
								if (placeholder) placeholder.style.display = 'flex';
							}}
						/>
						<div class="hidden bg-gray-700 rounded-lg h-64 items-center justify-center text-6xl">
							🖥️
						</div>
					{:else}
						<div class="bg-gray-700 rounded-lg h-64 flex items-center justify-center text-6xl">
							🖥️
						</div>
					{/if}
				</div>

				<!-- Build Info -->
				<div class="flex-1">
					<h1 class="text-3xl font-bold mb-4">{build.name}</h1>
					{#if build.description}
						<p class="text-gray-300 mb-4">{build.description}</p>
					{/if}

					<!-- Stats -->
					<div class="flex flex-wrap gap-4 mb-4">
						<div class="flex items-center gap-2">
							<span class="text-yellow-400">⭐</span>
							<span>{build.avg_rating?.toFixed(1) || 'N/A'}</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="text-red-400">❤️</span>
							<span>{build.likes_count || 0}</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="text-blue-400">👁️</span>
							<span>{build.views_count || 0}</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="text-green-400">💰</span>
							<span>{formatPrice(build.total_price || 0)}</span>
						</div>
					</div>

					<!-- Tags -->
					{#if build.tags && build.tags.length > 0}
						<div class="flex flex-wrap gap-2 mb-4">
							{#each build.tags as tag}
								<span class="px-3 py-1 bg-gray-700 rounded-full text-sm">{tag}</span>
							{/each}
						</div>
					{/if}

					<!-- Actions -->
					<div class="flex gap-4">
						<button
							on:click={toggleLike}
							class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
						>
							{isLiked ? '❤️ Liked' : '🤍 Like'}
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Components List -->
		<div class="bg-gray-800 rounded-lg p-6 mb-6">
			<h2 class="text-2xl font-bold mb-4">Components</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each build.components || [] as component}
					<div class="bg-gray-700 rounded-lg p-4">
						<h3 class="font-semibold mb-2">{component.category}</h3>
						<p class="text-gray-300">{component.product?.name || 'N/A'}</p>
						{#if component.product?.price}
							<p class="text-green-400 mt-2">{formatPrice(component.product.price)}</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Rating Section -->
		{#if currentUserId}
			<div class="bg-gray-800 rounded-lg p-6 mb-6">
				<h2 class="text-2xl font-bold mb-4">Rate this Build</h2>
				<div class="flex items-center gap-4">
					<div class="flex gap-1">
						{#each Array(5) as _, i}
							<button
								on:click={() => (rating = i + 1)}
								class="text-2xl {rating > i ? 'text-yellow-400' : 'text-gray-600'}"
							>
								⭐
							</button>
						{/each}
					</div>
					<button
						on:click={submitRating}
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
					>
						{userRating ? 'Update Rating' : 'Submit Rating'}
					</button>
				</div>
			</div>
		{/if}

		<!-- Comments Section -->
		<div class="bg-gray-800 rounded-lg p-6 mb-6">
			<h2 class="text-2xl font-bold mb-4">Comments ({comments.length})</h2>

			{#if currentUserId}
				<div class="mb-6">
					<textarea
						bind:value={newComment}
						placeholder="Add a comment..."
						class="w-full bg-gray-700 text-white p-3 rounded-lg mb-2"
						rows="3"
					></textarea>
					<button
						on:click={submitComment}
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
					>
						Post Comment
					</button>
				</div>
			{/if}

			<div class="space-y-4">
				{#each comments as comment}
					<div class="bg-gray-700 rounded-lg p-4">
						<div class="flex items-center gap-2 mb-2">
							<span class="font-semibold">{comment.user?.name || 'Anonymous'}</span>
							<span class="text-gray-400 text-sm">
								{new Date(comment.created_at).toLocaleDateString()}
							</span>
						</div>
						<p class="text-gray-300">{comment.comment}</p>
					</div>
				{:else}
					<p class="text-gray-400 text-center py-8">No comments yet. Be the first to comment!</p>
				{/each}
			</div>
		</div>

		<!-- Similar Builds -->
		{#if similarBuilds.length > 0}
			<div class="bg-gray-800 rounded-lg p-6">
				<h2 class="text-2xl font-bold mb-4">Similar Builds</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{#each similarBuilds as similarBuild}
						<div
							class="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition"
							on:click={() => goto(`/community-builds/${similarBuild.id}`)}
						>
							<h3 class="font-semibold mb-2">{similarBuild.name}</h3>
							<p class="text-green-400">{formatPrice(similarBuild.total_price || 0)}</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>


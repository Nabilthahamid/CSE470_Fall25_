<script lang="ts">
	import type { PageData } from './$types';
	import { ShoppingCart, Package, Check, Star, MessageSquare, Edit as EditIcon, Trash2 } from 'lucide-svelte';
	import { cart } from '$lib/stores/cart';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	/** View (UI) - Single Product Detail Page
	 * This component only displays data provided by the data prop
	 * No business logic or database queries here
	 */
	let { data, form }: { data: PageData; form: any } = $props();

	const product = $derived(data.product);
	const isInStock = $derived(product.stock > 0);
	const formattedPrice = $derived(new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format(product.price));

	let quantity = $state(1);
	let addedToCart = $state(false);
	let showReviewForm = $state(false);
	let editingReview = $state(false);
	let selectedRating = $state(0);
	let reviewComment = $state('');

	// Initialize form if user has existing review
	$effect(() => {
		if (data.userReview && !editingReview) {
			selectedRating = data.userReview.rating;
			reviewComment = data.userReview.comment || '';
		}
	});

	function handleAddToCart() {
		if (isInStock && quantity > 0) {
			cart.addItem(product, quantity);
			addedToCart = true;
			setTimeout(() => {
				addedToCart = false;
			}, 2000);
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function handleRatingClick(rating: number) {
		selectedRating = rating;
	}

	function toggleReviewForm() {
		if (data.userReview) {
			editingReview = true;
			selectedRating = data.userReview.rating;
			reviewComment = data.userReview.comment || '';
		}
		showReviewForm = !showReviewForm;
		if (!showReviewForm) {
			selectedRating = data.userReview?.rating || 0;
			reviewComment = data.userReview?.comment || '';
			editingReview = false;
		}
	}

	async function handleReviewSubmit({ result, update }: any) {
		console.log('Form submission started, rating:', selectedRating);
		
		// Always update to show errors or success messages
		if (update && typeof update === 'function') {
			await update();
		}
		
		if (result && result.type === 'success') {
			console.log('Review submitted successfully');
			showReviewForm = false;
			editingReview = false;
			selectedRating = 0;
			reviewComment = '';
			await invalidateAll();
		} else if (result && result.type === 'failure') {
			// Error will be displayed via form.error in the template
			console.error('Review submission failed:', result);
			console.error('Error details:', result.data);
		}
	}
</script>

<svelte:head>
	<title>{product.name} - TinyShop</title>
	<meta name="description" content={product.description || product.name} />
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<div class="container mx-auto px-4 py-8 md:px-6 md:py-12">
		<div class="mx-auto max-w-6xl">
			<!-- Breadcrumb Navigation -->
			<nav class="mb-6 text-sm text-slate-600">
				<a href="/shop" class="hover:text-slate-900">Shop</a>
				<span class="mx-2">/</span>
				<span class="text-slate-900">{product.name}</span>
			</nav>

			<!-- Product Detail Card -->
			<div class="overflow-hidden rounded-lg bg-white shadow-lg md:flex">
				<!-- Product Image -->
				<div class="h-96 w-full bg-slate-200 md:h-auto md:w-1/2">
					{#if product.image_url}
						<img
							src={product.image_url}
							alt={product.name}
							class="h-full w-full object-cover"
						/>
					{:else}
						<div class="flex h-full w-full items-center justify-center">
							<Package class="h-24 w-24 text-slate-400" />
						</div>
					{/if}
				</div>

				<!-- Product Information -->
				<div class="flex flex-1 flex-col p-6 md:p-8">
					<h1 class="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
						{product.name}
					</h1>

					<!-- Rating Display -->
					{#if data.reviewStats && data.reviewStats.total_reviews > 0}
						<div class="mb-4 flex items-center gap-2">
							<div class="flex items-center">
								{#each Array(5) as _, i}
									<Star
										class="h-4 w-4 {i < Math.round(data.reviewStats.average_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}"
									/>
								{/each}
							</div>
							<span class="text-sm font-semibold text-slate-900">
								{data.reviewStats.average_rating.toFixed(1)}
							</span>
							<span class="text-sm text-slate-600">
								({data.reviewStats.total_reviews} {data.reviewStats.total_reviews === 1 ? 'review' : 'reviews'})
							</span>
						</div>
					{/if}

					<div class="mb-6">
						<p class="text-3xl font-bold text-slate-900">{formattedPrice}</p>
					</div>

					{#if product.description}
						<div class="mb-6">
							<h2 class="mb-2 text-lg font-semibold text-slate-900">Description</h2>
							<p class="text-slate-600 whitespace-pre-wrap">{product.description}</p>
						</div>
					{/if}

					<!-- Stock Status -->
					<div class="mb-6 flex items-center gap-2">
						{#if isInStock}
							<Check class="h-5 w-5 text-green-600" />
							<span class="text-green-600 font-medium">
								In Stock ({product.stock} available)
							</span>
						{:else}
							<Package class="h-5 w-5 text-slate-400" />
							<span class="text-slate-400 font-medium">Out of Stock</span>
						{/if}
					</div>

					<!-- Quantity & Add to Cart -->
					<div class="mt-auto space-y-4">
						{#if isInStock}
							<div class="flex items-center gap-4">
								<label for="quantity" class="text-sm font-medium text-slate-700">Quantity:</label>
								<div class="flex items-center gap-2">
									<button
										type="button"
										onclick={() => quantity > 1 && quantity--}
										class="flex h-10 w-10 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
										aria-label="Decrease quantity"
									>
										−
									</button>
									<input
										type="number"
										id="quantity"
										bind:value={quantity}
										min="1"
										max={product.stock}
										class="w-20 rounded border border-slate-300 px-3 py-2 text-center"
									/>
									<button
										type="button"
										onclick={() => quantity < product.stock && quantity++}
										disabled={quantity >= product.stock}
										class="flex h-10 w-10 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
										aria-label="Increase quantity"
									>
										+
									</button>
								</div>
							</div>
						{/if}
						
						<button
							type="button"
							onclick={handleAddToCart}
							class="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:opacity-50 md:w-auto"
							disabled={!isInStock || quantity <= 0}
						>
							<ShoppingCart class="h-5 w-5" />
							{addedToCart ? 'Added to Cart!' : isInStock ? 'Add to Cart' : 'Out of Stock'}
						</button>
					</div>
				</div>
			</div>

			<!-- Reviews Section -->
			<div class="mt-8 rounded-lg bg-white shadow-lg p-6 md:p-8">
				<div class="mb-6 flex items-center justify-between">
					<div>
						<h2 class="text-2xl font-bold text-slate-900">Reviews & Ratings</h2>
						{#if data.reviewStats.total_reviews > 0}
							<div class="mt-2 flex items-center gap-2">
								<div class="flex items-center">
									{#each Array(5) as _, i}
										<Star
											class="h-5 w-5 {i < Math.round(data.reviewStats.average_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}"
										/>
									{/each}
								</div>
								<span class="text-sm font-semibold text-slate-900">
									{data.reviewStats.average_rating.toFixed(1)}
								</span>
								<span class="text-sm text-slate-600">
									({data.reviewStats.total_reviews} {data.reviewStats.total_reviews === 1 ? 'review' : 'reviews'})
								</span>
							</div>
						{:else}
							<p class="mt-2 text-sm text-slate-600">No reviews yet. Be the first to review this product!</p>
						{/if}
					</div>
					{#if data.canReview && !showReviewForm}
						<button
							type="button"
							onclick={toggleReviewForm}
							class="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
						>
							{#if data.userReview}
								<EditIcon class="h-4 w-4" />
								Edit Review
							{:else}
								<MessageSquare class="h-4 w-4" />
								Write a Review
							{/if}
						</button>
					{/if}
				</div>

				<!-- Review Form -->
				{#if showReviewForm && data.canReview}
					<div class="mb-8 rounded-lg border border-slate-200 bg-slate-50 p-6">
						<h3 class="mb-4 text-lg font-semibold text-slate-900">
							{editingReview ? 'Edit Your Review' : 'Write a Review'}
						</h3>
						{#if form?.error}
							<div class="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
								<p class="text-sm text-red-700">{form.error}</p>
							</div>
						{/if}
						{#if form?.success}
							<div class="mb-4 rounded-lg bg-green-50 border border-green-200 p-3">
								<p class="text-sm text-green-700">{form.message || 'Review submitted successfully!'}</p>
							</div>
						{/if}
						<form
							method="POST"
							action={editingReview ? '?/updateReview' : '?/createReview'}
							use:enhance={handleReviewSubmit}
						>
							{#if editingReview}
								<input type="hidden" name="reviewId" value={data.userReview?.id} />
							{/if}
							
							<div class="mb-4">
								<label for="rating" class="mb-2 block text-sm font-medium text-slate-700">Rating *</label>
								<div class="flex items-center gap-2">
									{#each Array(5) as _, i}
										<button
											type="button"
											onclick={() => handleRatingClick(i + 1)}
											class="transition-transform hover:scale-110"
											aria-label={`Rate ${i + 1} out of 5`}
										>
											<Star
												class="h-8 w-8 {i < selectedRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}"
											/>
										</button>
									{/each}
									{#if selectedRating > 0}
										<span class="ml-2 text-sm text-slate-600">{selectedRating} out of 5</span>
									{/if}
								</div>
								<input type="hidden" id="rating" name="rating" value={selectedRating} />
							</div>

							<div class="mb-4">
								<label for="comment" class="mb-2 block text-sm font-medium text-slate-700">
									Review Comment
								</label>
								<textarea
									id="comment"
									name="comment"
									bind:value={reviewComment}
									rows="4"
									placeholder="Share your experience with this product..."
									class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
								></textarea>
							</div>

							<div class="flex gap-3">
								<button
									type="submit"
									disabled={selectedRating === 0}
									class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
								>
									{editingReview ? 'Update Review' : 'Submit Review'}
								</button>
								<button
									type="button"
									onclick={toggleReviewForm}
									class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				{/if}

				<!-- Reviews List -->
				{#if data.reviews && data.reviews.length > 0}
					<div class="space-y-6">
						{#each data.reviews as review (review.id)}
							<div class="border-b border-slate-200 pb-6 last:border-0 last:pb-0">
								<div class="mb-3 flex items-start justify-between">
									<div>
										<div class="mb-1 flex items-center gap-2">
											<span class="font-semibold text-slate-900">
												{review.user.full_name || review.user.email.split('@')[0]}
											</span>
											<span class="text-sm text-slate-500">
												{formatDate(review.created_at)}
											</span>
										</div>
										<div class="flex items-center gap-1">
											{#each Array(5) as _, i}
												<Star
													class="h-4 w-4 {i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}"
												/>
											{/each}
										</div>
									</div>
									{#if data.user && data.user.id === review.user_id}
										<form
											method="POST"
											action="?/deleteReview"
											use:enhance={async ({ result, update }) => {
												if (update && typeof update === 'function') {
													await update();
												}
												if (result && result.type === 'success') {
													await invalidateAll();
												}
											}}
										>
											<input type="hidden" name="reviewId" value={review.id} />
											<button
												type="submit"
												onclick={(e) => {
													if (!confirm('Are you sure you want to delete your review?')) {
														e.preventDefault();
													}
												}}
												class="text-red-600 hover:text-red-700"
												title="Delete review"
											>
												<Trash2 class="h-4 w-4" />
											</button>
										</form>
									{/if}
								</div>
								{#if review.comment}
									<p class="text-slate-700 whitespace-pre-wrap">{review.comment}</p>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<div class="rounded-lg bg-slate-50 border border-slate-200 p-8 text-center">
						<MessageSquare class="mx-auto h-12 w-12 text-slate-400 mb-4" />
						<p class="text-slate-600">No reviews yet.</p>
						{#if !data.canReview && data.user}
							<p class="mt-2 text-sm text-slate-500">
								Purchase this product to leave a review.
							</p>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>


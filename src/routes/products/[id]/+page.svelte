<!-- VIEW: Product detail page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { PageData, ActionData } from './$types';
	import {
		addToComparison,
		removeFromComparison,
		isInComparison
	} from '$lib/utils/comparison';

	export let data: PageData;
	export let form: ActionData;

	let showReviewForm = false;
	let rating = 5;
	let comment = '';
	let quantity = 1;
	let selectedImageIndex = 0;
	let selectedVariant = 'default';
	let showPopup = false;
	let popupMessage = '';
	let popupType: 'success' | 'error' = 'success';
	let popupTimeout: ReturnType<typeof setTimeout> | null = null;
	let isInCompare = false;

	onMount(() => {
		isInCompare = isInComparison(data.product.id);
	});

	function handleCompareToggle() {
		if (isInCompare) {
			removeFromComparison(data.product.id);
			isInCompare = false;
			showPopupMessage('Removed from comparison', 'success');
		} else {
			const result = addToComparison(data.product.id);
			if (result.success) {
				isInCompare = true;
				showPopupMessage(result.message, 'success');
			} else {
				showPopupMessage(result.message, 'error');
			}
		}
	}
	let editingReviewId: string | null = null;
	let editingRating = 5;
	let editingComment = '';

	function showPopupMessage(message: string, type: 'success' | 'error' = 'success') {
		popupMessage = message;
		popupType = type;
		showPopup = true;
		if (popupTimeout) clearTimeout(popupTimeout);
		popupTimeout = setTimeout(() => {
			showPopup = false;
		}, 3000);
	}

	function closePopup() {
		showPopup = false;
		if (popupTimeout) clearTimeout(popupTimeout);
	}

	// Create array of images (main image + thumbnails if available)
	$: productImages = data.product.image_url ? [data.product.image_url] : [];
	$: currentImage = productImages[selectedImageIndex] || null;

	$: if (form?.success) {
		showReviewForm = false;
		rating = 5;
		comment = '';
		editingReviewId = null;
		editingRating = 5;
		editingComment = '';
	}

	function increaseQuantity() {
		if (quantity < data.product.stock) {
			quantity++;
		}
	}

	function decreaseQuantity() {
		if (quantity > 1) {
			quantity--;
		}
	}

	async function buyNow() {
		try {
			const formData = new FormData();
			formData.append('product_id', data.product.id);
			formData.append('quantity', quantity.toString());

			const response = await fetch('/cart/add', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();
			if (result.success) {
				showPopupMessage('Added to cart successfully!', 'success');
				setTimeout(() => {
					window.location.href = '/checkout';
				}, 1500);
			} else {
				showPopupMessage(result.error || 'Failed to add to cart', 'error');
			}
		} catch (error) {
			console.error('Error adding to cart:', error);
			showPopupMessage('Failed to add to cart. Please try again.', 'error');
		}
	}
</script>

<svelte:head>
	<title>{data.product.name} - Product Details</title>
</svelte:head>

<div class="max-w-7xl mx-auto p-4 md:p-8">
	<!-- Popup Modal -->
	{#if showPopup}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" on:click={closePopup} on:keydown={(e) => e.key === 'Escape' && closePopup()}>
			<div class="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all" on:click|stopPropagation>
				<div class="p-6 text-center">
					<div class="mb-4">
						{#if popupType === 'success'}
							<div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
								<svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
								</svg>
							</div>
						{:else}
							<div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
								<svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
								</svg>
							</div>
						{/if}
					</div>
					<h3 class="text-xl font-bold mb-2 {popupType === 'success' ? 'text-green-800' : 'text-red-800'}">
						{popupType === 'success' ? 'Success!' : 'Error!'}
					</h3>
					<p class="text-gray-700 mb-6">{popupMessage}</p>
					<button
						on:click={closePopup}
						class="px-6 py-2 {popupType === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg font-semibold transition-colors"
					>
						OK
					</button>
				</div>
			</div>
		</div>
	{/if}
	{#if data.error}
		<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">
			{data.error}
		</div>
	{/if}

	{#if form?.error}
		<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">
			{form.error}
		</div>
	{/if}

	{#if form?.success}
		<div class="bg-green-50 text-green-700 p-4 rounded-lg mb-4 border border-green-200">
			Review submitted successfully!
		</div>
	{/if}

	<!-- Main Product Section -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 mb-12">
		<!-- Product Image Section -->
		<div>
			<!-- Main Image -->
			<div class="mb-4 rounded-lg overflow-hidden aspect-square border border-gray-200 bg-gray-50">
				{#if currentImage}
					<img
						src={currentImage}
						alt={data.product.name}
						class="w-full h-full object-contain"
						on:error={(e) => {
							e.currentTarget.style.display = 'none';
						}}
					/>
				{:else}
					<div class="w-full h-full bg-gray-200 flex items-center justify-center">
						<span class="text-gray-400">No image available</span>
					</div>
				{/if}
			</div>

			<!-- Thumbnail Gallery -->
			{#if productImages.length > 1}
				<div class="flex gap-2">
					{#each productImages as image, index}
						<button
							type="button"
							on:click={() => (selectedImageIndex = index)}
							class="w-20 h-20 rounded overflow-hidden border-2 transition-colors {selectedImageIndex === index
								? 'border-indigo-600'
								: 'border-gray-200 hover:border-gray-300'}"
						>
							<img src={image} alt="Thumbnail {index + 1}" class="w-full h-full object-cover" />
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Product Info Section -->
		<div>
			<h1 class="text-3xl md:text-4xl font-bold mb-3 text-gray-900">{data.product.name}</h1>

			<!-- Rating Display -->
			<div class="mb-4 flex items-center gap-2">
				{#if data.averageRating > 0}
					<div class="flex items-center">
						{#each Array(5) as _, i}
							<svg
								class="w-5 h-5 {i < Math.round(data.averageRating)
									? 'text-yellow-400'
									: 'text-gray-300'}"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
								/>
							</svg>
						{/each}
					</div>
					<span class="text-gray-600">({data.averageRating.toFixed(1)})</span>
					<span class="text-gray-600">• {data.reviews.length} review(s)</span>
				{:else}
					<span class="text-gray-600">No ratings yet</span>
				{/if}
			</div>

			<!-- Price -->
			<div class="mb-6">
				<p class="text-4xl font-bold text-gray-900 mb-2">Tk {data.product.price.toFixed(2)}</p>
			</div>

			<!-- Variant Selection (Optional - can be customized) -->
			<div class="mb-6">
				<div class="block mb-2 font-semibold text-gray-900">Variant</div>
				<div class="flex gap-2">
					<button
						type="button"
						on:click={() => (selectedVariant = 'default')}
						class="px-4 py-2 border-2 rounded {selectedVariant === 'default'
							? 'bg-black text-white border-black'
							: 'bg-white text-black border-gray-300'} transition-colors"
					>
						Default
					</button>
				</div>
			</div>

			<!-- Quantity Selector -->
			<div class="mb-6">
				<label for="quantity-input" class="block mb-2 font-semibold text-gray-900">Quantity</label>
				<div class="flex items-center gap-3 w-fit">
					<button
						type="button"
						on:click={decreaseQuantity}
						disabled={quantity <= 1}
						class="w-10 h-10 border-2 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:bg-gray-100 transition-colors"
					>
						-
					</button>
					<input
						id="quantity-input"
						type="number"
						bind:value={quantity}
						min="1"
						max={data.product.stock}
						class="w-16 text-center border-2 border-gray-300 rounded py-2 focus:outline-none focus:border-indigo-500"
					/>
					<button
						type="button"
						on:click={increaseQuantity}
						disabled={quantity >= data.product.stock}
						class="w-10 h-10 border-2 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:bg-gray-100 transition-colors"
					>
						+
					</button>
				</div>
			</div>

			<!-- Compare Button -->
			<div class="mb-4">
				<button
					type="button"
					on:click={handleCompareToggle}
					class="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors {isInCompare
						? 'bg-indigo-600 text-white hover:bg-indigo-700'
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
					</svg>
					{isInCompare ? 'Remove from Compare' : 'Add to Compare'}
				</button>
			</div>

			<!-- Action Buttons -->
			<div class="flex gap-4 mb-6">
				{#if data.product.stock > 0}
					<form 
						method="POST" 
						action="/cart/add" 
						use:enhance={({ result }) => {
							return async () => {
								if (result.type === 'success') {
									try {
										const data = await result.json();
										if (data.success) {
														showPopupMessage('Added to cart successfully!', 'success');
										} else {
														showPopupMessage(data.error || 'Failed to add to cart', 'error');
										}
									} catch (e) {
														showPopupMessage('Added to cart successfully!', 'success');
									}
								} else if (result.type === 'failure') {
													showPopupMessage('Failed to add to cart. Please try again.', 'error');
								}
							};
						}}
						class="flex-1"
					>
						<input type="hidden" name="product_id" value={data.product.id} />
						<input type="hidden" name="quantity" bind:value={quantity} />
						<button
							type="submit"
							class="w-full px-6 py-3 rounded font-semibold bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
						>
							Add to cart
						</button>
					</form>
					<button
						type="button"
						on:click={buyNow}
						class="flex-1 px-6 py-3 rounded font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
					>
						Buy it now
					</button>
				{:else}
					<button
						disabled
						class="flex-1 bg-gray-300 text-gray-600 border-2 border-gray-300 px-6 py-3 rounded font-semibold cursor-not-allowed"
					>
						Out of Stock
					</button>
				{/if}
			</div>

			<!-- Stock Info -->
			<p class="text-sm text-gray-600 mb-6">
				Stock: {data.product.stock > 0 ? `${data.product.stock} available` : 'Out of stock'}
			</p>

			<!-- Description -->
			<div class="mb-6">
				<h3 class="font-semibold text-gray-900 mb-2">Description</h3>
				<p class="text-gray-800">{data.product.description}</p>
			</div>

			<!-- Contact Section -->
			<div class="border-t pt-6 mb-6">
				<p class="font-semibold text-gray-900 mb-3">Have a question? Contact us!</p>
				<button
					type="button"
					class="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition-colors"
				>
					<svg
						class="w-5 h-5"
						fill="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"
						/>
					</svg>
					Message on Facebook
				</button>
			</div>

			<!-- Tags -->
			<div class="border-t pt-6">
				<div class="flex flex-wrap gap-2">
					{#if data.product.stock > 0}
						<span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Ready Stock</span>
					{/if}
					<span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">XDA</span>
					<span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Non-Shinethrough</span>
				</div>
			</div>
		</div>
	</div>

	<!-- You may also like Section -->
	{#if data.relatedProducts && data.relatedProducts.length > 0}
		<div class="mb-12">
			<h2 class="text-2xl font-bold mb-6 text-gray-900">You may also like</h2>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				{#each data.relatedProducts as relatedProduct}
					<a
						href="/products/{relatedProduct.id}"
						class="block rounded-lg overflow-hidden bg-white border border-gray-200 hover:shadow-md transition-shadow"
					>
						<div class="overflow-hidden">
							{#if relatedProduct.image_url}
								<img
									src={relatedProduct.image_url}
									alt={relatedProduct.name}
									class="w-full h-32 object-cover"
									on:error={(e) => {
										e.currentTarget.style.display = 'none';
									}}
								/>
							{:else}
								<div class="w-full h-32 bg-gray-200 flex items-center justify-center">
									<span class="text-gray-400 text-xs">No image</span>
								</div>
							{/if}
						</div>
						<div class="p-3">
							<h3 class="font-semibold text-sm mb-1 line-clamp-2 text-gray-900">{relatedProduct.name}</h3>
							<p class="text-lg font-bold text-indigo-600 mb-2">Tk {relatedProduct.price.toFixed(2)}</p>
							<form
								method="POST"
								action="/cart/add"
								use:enhance={({ result }) => {
									return async () => {
										if (result.type === 'success') {
											try {
												const data = await result.json();
												if (data.success) {
														showPopupMessage('Added to cart successfully!', 'success');
												} else {
														showPopupMessage(data.error || 'Failed to add to cart', 'error');
												}
											} catch (e) {
														showPopupMessage('Added to cart successfully!', 'success');
											}
										} else if (result.type === 'failure') {
													showPopupMessage('Failed to add to cart. Please try again.', 'error');
										}
									};
								}}
								on:submit|stopPropagation
								class="mt-2"
							>
								<input type="hidden" name="product_id" value={relatedProduct.id} />
								<input type="hidden" name="quantity" value="1" />
								<button
									type="submit"
									class="w-full text-xs px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors font-medium"
								>
									+ Add to Cart
								</button>
							</form>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Reviews Section -->
	<div class="bg-white rounded-lg p-6 md:p-8 border border-gray-200">
		<div class="flex justify-between items-center mb-6">
			<h2 class="text-2xl font-semibold m-0 text-gray-900">Reviews & Ratings</h2>
			{#if data.canReview && !data.userReview && !showReviewForm}
				<button
					on:click={() => {
						showReviewForm = true;
					}}
					class="bg-indigo-600 text-white border-none px-4 py-2 rounded-lg cursor-pointer transition-colors hover:bg-indigo-700"
				>
					Write a Review
				</button>
			{/if}
		</div>

		{#if !data.canReview && !data.user}
			<p class="text-gray-700 mb-4">You must be logged in and purchase this product to write a review.</p>
		{:else if !data.canReview && data.user}
			<p class="text-gray-700 mb-4">
				You must purchase this product before you can write a review.
			</p>
		{/if}

		<!-- Review Form (only for new reviews) -->
		{#if showReviewForm && data.canReview && !data.userReview}
			<div class="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
				<h3 class="text-xl font-semibold mb-4 text-gray-900">Write a Review</h3>
				<form method="POST" action="?/createReview" use:enhance>
					<div class="mb-4">
						<div class="block mb-2 font-medium">Rating</div>
						<div class="flex gap-2">
							{#each Array(5) as _, i}
								<button
									type="button"
									on:click={() => {
										rating = i + 1;
									}}
									class="bg-transparent border-none cursor-pointer p-0"
								>
									<svg
										class="w-8 h-8 {i < rating ? 'text-yellow-400' : 'text-gray-300'}"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
										/>
									</svg>
								</button>
							{/each}
						</div>
						<input type="hidden" name="rating" value={rating} />
					</div>
					<div class="mb-4">
						<label for="comment" class="block mb-2 font-medium text-gray-900">Comment</label>
						<textarea
							id="comment"
							name="comment"
							value={comment}
							on:input={(e) => (comment = e.currentTarget.value)}
							rows="4"
							class="w-full p-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 text-base focus:outline-none focus:border-indigo-500"
							placeholder="Share your experience..."
						></textarea>
					</div>
					<div class="flex gap-4">
						<button
							type="submit"
							class="bg-indigo-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer transition-colors hover:bg-indigo-700"
						>
							Submit Review
						</button>
						<button
							type="button"
							on:click={() => {
								showReviewForm = false;
								rating = 5;
								comment = '';
							}}
							class="bg-gray-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-700"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		{/if}

		<!-- Reviews List -->
		{#if data.reviews.length === 0}
			<p class="text-center text-gray-700 py-8">No reviews yet. Be the first to review this product!</p>
		{:else}
			<div class="space-y-4">
				{#each data.reviews as review (review.id)}
					<div class="bg-white p-4 rounded-lg border border-gray-200">
						{#if editingReviewId === review.id}
							<!-- Edit Form -->
							<form method="POST" action="?/updateReview" use:enhance={({ result }) => {
								return async () => {
									if (result.type === 'success') {
										editingReviewId = null;
										editingRating = 5;
										editingComment = '';
									}
								};
							}}>
								<input type="hidden" name="review_id" value={review.id} />
								<div class="mb-4">
									<div class="block mb-2 font-medium">Rating</div>
									<div class="flex gap-2">
										{#each Array(5) as _, i}
											<button
												type="button"
												on:click={() => {
													editingRating = i + 1;
												}}
												class="bg-transparent border-none cursor-pointer p-0"
											>
												<svg
													class="w-6 h-6 {i < editingRating ? 'text-yellow-400' : 'text-gray-300'}"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
													/>
												</svg>
											</button>
										{/each}
									</div>
									<input type="hidden" name="rating" value={editingRating} />
								</div>
								<div class="mb-4">
									<label for="comment_edit_{review.id}" class="block mb-2 font-medium text-gray-900">Comment</label>
									<textarea
										id="comment_edit_{review.id}"
										name="comment"
										bind:value={editingComment}
										rows="4"
										class="w-full p-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 text-base focus:outline-none focus:border-indigo-500"
										placeholder="Share your experience..."
									></textarea>
								</div>
								<div class="flex gap-4">
									<button
										type="submit"
										class="bg-indigo-600 text-white border-none px-4 py-2 rounded-lg cursor-pointer text-sm transition-colors hover:bg-indigo-700"
									>
										Save
									</button>
									<button
										type="button"
										on:click={() => {
											editingReviewId = null;
											editingRating = 5;
											editingComment = '';
										}}
										class="bg-gray-600 text-white border-none px-4 py-2 rounded-lg cursor-pointer text-sm transition-colors hover:bg-gray-700"
									>
										Cancel
									</button>
								</div>
							</form>
						{:else}
							<!-- Review Display -->
							<div class="flex justify-between items-start mb-2">
								<div>
									<p class="font-semibold m-0 text-gray-900">{review.user_name || 'Anonymous'}</p>
									<div class="flex items-center gap-2 mt-1">
										{#each Array(5) as _, i}
											<svg
												class="w-4 h-4 {i < review.rating ? 'text-yellow-400' : 'text-gray-300'}"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
												/>
											</svg>
										{/each}
									</div>
								</div>
								{#if review.created_at}
									<span class="text-gray-600 text-sm">
										{new Date(review.created_at).toLocaleDateString()}
									</span>
								{/if}
							</div>
							{#if review.comment}
								<p class="text-gray-800 mt-2 m-0">{review.comment}</p>
							{/if}
							{#if data.user && review.user_id === data.user.id}
								<div class="flex gap-2 mt-4">
									<button
										type="button"
										on:click={() => {
											editingReviewId = review.id;
											editingRating = review.rating;
											editingComment = review.comment || '';
										}}
										class="bg-indigo-600 text-white border-none px-4 py-2 rounded-lg cursor-pointer text-sm transition-colors hover:bg-indigo-700"
									>
										Update
									</button>
									<form method="POST" action="?/deleteReview" use:enhance class="inline">
										<input type="hidden" name="review_id" value={review.id} />
										<button
											type="submit"
											class="bg-red-600 text-white border-none px-4 py-2 rounded-lg cursor-pointer text-sm transition-colors hover:bg-red-700"
											on:click={(e) => {
												if (!confirm('Are you sure you want to delete your review?')) {
													e.preventDefault();
												}
											}}
										>
											Delete
										</button>
									</form>
								</div>
							{/if}
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

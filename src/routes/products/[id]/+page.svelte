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
	export let params: { id: string };

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

	// AI Review Insights
	let reviewSummary: any = null;
	let loadingSummary = false;
	let reviewSentiments: Record<string, any> = {};

	// Multi-language support
	type Language = 'en' | 'bn';
	let currentLang: Language = 'en';
	let translatedProduct: any = null;
	let loadingTranslation = false;

	onMount(async () => {
		isInCompare = isInComparison(data.product.id);
		loadReviewSummary();
		loadReviewSentiments();
		// Detect user's preferred language from browser
		const browserLang = navigator.language || 'en';
		if (browserLang.includes('bn') || browserLang.includes('ben')) {
			currentLang = 'bn';
			await loadTranslation('bn');
		}
	});

	async function loadReviewSummary() {
		if (data.reviews.length === 0) return;
		
		loadingSummary = true;
		try {
			const response = await fetch(`/api/reviews/summary?productId=${data.product.id}`);
			if (response.ok) {
				reviewSummary = await response.json();
			}
		} catch (error) {
			console.error('Error loading review summary:', error);
		} finally {
			loadingSummary = false;
		}
	}

	async function loadReviewSentiments() {
		if (data.reviews.length === 0) return;
		
		for (const review of data.reviews) {
			try {
				const response = await fetch('/api/reviews/analyze-sentiment', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ rating: review.rating, comment: review.comment })
				});
				if (response.ok) {
					reviewSentiments[review.id] = await response.json();
				}
			} catch (error) {
				console.error('Error analyzing sentiment:', error);
			}
		}
	}

	async function loadTranslation(lang: Language) {
		if (lang === 'en') {
			translatedProduct = null;
			return;
		}

		loadingTranslation = true;
		try {
			const response = await fetch(`/api/products/${data.product.id}/translate?lang=${lang}`);
			const result = await response.json();
			
			if (response.ok && result.translatedProduct) {
				translatedProduct = result.translatedProduct;
			} else if (result.needsApiKey) {
				// Show user-friendly message if API keys are missing
				showPopupMessage(
					'Translation requires API configuration. Please set GEMINI_API_KEY or OPENAI_API_KEY in .env file.',
					'error'
				);
				// Switch back to English
				currentLang = 'en';
				translatedProduct = null;
			} else {
				console.error('Failed to load translation:', result.error);
				showPopupMessage('Translation unavailable. Showing original text.', 'error');
				currentLang = 'en';
				translatedProduct = null;
			}
		} catch (error) {
			console.error('Error loading translation:', error);
			showPopupMessage('Translation service error. Showing original text.', 'error');
			currentLang = 'en';
			translatedProduct = null;
		} finally {
			loadingTranslation = false;
		}
	}

	async function switchLanguage(lang: Language) {
		if (currentLang === lang) return;
		currentLang = lang;
		await loadTranslation(lang);
	}

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
		<div 
			class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" 
			role="dialog"
			aria-modal="true"
			aria-labelledby="popup-title"
			tabindex="-1"
			on:click={closePopup} 
			on:keydown={(e) => e.key === 'Escape' && closePopup()}
		>
			<div 
				class="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all" 
				role="document"
				on:click|stopPropagation
				on:keydown|stopPropagation
			>
				<div class="p-6 text-center">
					<h2 id="popup-title" class="sr-only">{popupType === 'success' ? 'Success' : 'Error'}</h2>
					<div class="mb-4">
						{#if popupType === 'success'}
							<div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100" role="img" aria-label="Success icon">
								<svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
								</svg>
							</div>
						{:else}
							<div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100" role="img" aria-label="Error icon">
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
			<!-- Language Toggle -->
			<div class="mb-4 flex items-center gap-2">
				<button
					type="button"
					on:click={() => switchLanguage('en')}
					class="px-3 py-1.5 text-sm rounded-md font-medium transition-colors {currentLang === 'en'
						? 'bg-indigo-600 text-white'
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
				>
					English
				</button>
				<button
					type="button"
					on:click={() => switchLanguage('bn')}
					class="px-3 py-1.5 text-sm rounded-md font-medium transition-colors {currentLang === 'bn'
						? 'bg-indigo-600 text-white'
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
				>
					বাংলা
				</button>
				{#if loadingTranslation}
					<span class="text-sm text-gray-500 ml-2">Translating...</span>
				{/if}
			</div>

			<h1 class="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
				{loadingTranslation
					? 'Loading...'
					: currentLang === 'bn' && translatedProduct?.translatedName
						? translatedProduct.translatedName
						: data.product.name}
			</h1>

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
				<h3 class="font-semibold text-gray-900 mb-2">
					{currentLang === 'bn' ? 'বিবরণ' : 'Description'}
				</h3>
				<p class="text-gray-800">
					{loadingTranslation
						? 'Loading translation...'
						: currentLang === 'bn' && translatedProduct?.translatedDescription
							? translatedProduct.translatedDescription
							: data.product.description}
				</p>
				{#if currentLang === 'bn' && translatedProduct?.translatedSpecs}
					<div class="mt-4">
						<h4 class="font-semibold text-gray-900 mb-2">স্পেসিফিকেশন</h4>
						<p class="text-gray-800 whitespace-pre-line">{translatedProduct.translatedSpecs}</p>
					</div>
				{:else if data.product.specifications}
					<div class="mt-4">
						<h4 class="font-semibold text-gray-900 mb-2">Specifications</h4>
						<p class="text-gray-800 whitespace-pre-line">{data.product.specifications}</p>
					</div>
				{/if}
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
		</div>

		<!-- Fancy Review CTA for Purchased Users -->
		{#if data.canReview && !data.userReview && !showReviewForm}
			<div class="mb-6 p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl border-2 border-indigo-200 shadow-sm">
				<div class="flex items-start gap-4">
					<div class="bg-indigo-600 p-3 rounded-full flex-shrink-0">
						<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
					<div class="flex-1">
						<div class="flex items-center gap-2 mb-2">
							<h3 class="text-lg font-bold text-gray-900">You Own This Product!</h3>
							<span class="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
								✓ Verified Purchase
							</span>
						</div>
						<p class="text-gray-700 mb-4">Share your experience and help other customers make informed decisions.</p>
						<button
							on:click={() => {
								showReviewForm = true;
							}}
							class="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer font-semibold transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
							</svg>
							Write Your Review
						</button>
					</div>
				</div>
			</div>
		{:else if !data.canReview && data.user}
			<div class="mb-6 p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200">
				<div class="flex items-start gap-4">
					<div class="bg-gray-400 p-3 rounded-full flex-shrink-0">
						<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
						</svg>
					</div>
					<div class="flex-1">
						<h3 class="text-lg font-bold text-gray-900 mb-2">Purchase Required</h3>
						<p class="text-gray-700">You need to purchase this product before you can write a review. This ensures authentic feedback from verified customers.</p>
					</div>
				</div>
			</div>
		{:else if !data.canReview && !data.user}
			<div class="mb-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
				<div class="flex items-start gap-4">
					<div class="bg-blue-500 p-3 rounded-full flex-shrink-0">
						<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
						</svg>
					</div>
					<div class="flex-1">
						<h3 class="text-lg font-bold text-gray-900 mb-2">Join the Conversation</h3>
						<p class="text-gray-700">Please <a href="/login" class="text-blue-600 hover:text-blue-700 font-semibold underline">log in</a> and purchase this product to share your review.</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- AI Review Summary - "What customers love" -->
		{#if data.reviews.length > 0 && (reviewSummary || loadingSummary)}
			<div class="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6">
				<div class="flex items-center gap-3 mb-4">
					<div class="bg-green-600 p-2.5 rounded-lg">
						<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
						</svg>
					</div>
					<h3 class="text-xl font-bold text-gray-900">What Customers Love</h3>
				</div>
				{#if loadingSummary}
					<div class="text-center py-4">
						<div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
					</div>
				{:else if reviewSummary}
					<p class="text-gray-700 mb-4 leading-relaxed">{reviewSummary.summary}</p>
					{#if reviewSummary.positiveAspects.length > 0}
						<div class="mb-4">
							<h4 class="font-semibold text-gray-900 mb-2">Most Praised Features:</h4>
							<div class="flex flex-wrap gap-2">
								{#each reviewSummary.positiveAspects as aspect}
									<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
										✓ {aspect}
									</span>
								{/each}
							</div>
						</div>
					{/if}
					{#if reviewSummary.negativeAspects.length > 0}
						<div>
							<h4 class="font-semibold text-gray-900 mb-2">Areas for Improvement:</h4>
							<div class="flex flex-wrap gap-2">
								{#each reviewSummary.negativeAspects as aspect}
									<span class="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
										⚠ {aspect}
									</span>
								{/each}
							</div>
						</div>
					{/if}
				{/if}
			</div>
		{/if}

		<!-- Review Form (only for new reviews) -->
		{#if showReviewForm && data.canReview && !data.userReview}
			<div class="mb-6 p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-indigo-200 shadow-md">
				<div class="flex items-center gap-3 mb-6">
					<div class="bg-indigo-600 p-2 rounded-lg">
						<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
						</svg>
					</div>
					<div>
						<h3 class="text-xl font-bold text-gray-900">Write Your Review</h3>
						<p class="text-sm text-gray-600 mt-0.5">Share your experience with this product</p>
					</div>
				</div>
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
							<div class="mb-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-300 shadow-md">
								<div class="flex items-center gap-3 mb-6">
									<div class="bg-indigo-600 p-2 rounded-lg">
										<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
										</svg>
									</div>
									<div>
										<h3 class="text-xl font-bold text-gray-900">Update Your Review</h3>
										<p class="text-sm text-gray-600 mt-0.5">Edit your rating and comments</p>
									</div>
								</div>
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
								<div class="flex gap-3">
									<button
										type="submit"
										class="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none px-5 py-2.5 rounded-lg cursor-pointer text-sm font-semibold transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
										</svg>
										Save Changes
									</button>
									<button
										type="button"
										on:click={() => {
											editingReviewId = null;
											editingRating = 5;
											editingComment = '';
										}}
										class="inline-flex items-center gap-2 bg-gray-200 text-gray-700 border-none px-5 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-all hover:bg-gray-300"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
										</svg>
										Cancel
									</button>
								</div>
							</form>
							</div>
						{:else}
							<!-- Review Display -->
							<div class="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 {data.user && review.user_id === data.user.id ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-200'} p-5 transition-all hover:shadow-md">
								<div class="flex justify-between items-start mb-3">
									<div class="flex-1">
										<div class="flex items-center gap-2 mb-2 flex-wrap">
											<div class="flex items-center gap-2">
												<p class="font-bold m-0 text-gray-900 text-lg">{review.user_name || 'Anonymous'}</p>
												<span class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
													✓ Verified Purchase
												</span>
											</div>
											{#if reviewSentiments[review.id]}
												{@const sentiment = reviewSentiments[review.id]}
												<span class="px-2.5 py-1 rounded-full text-xs font-semibold {sentiment.sentiment === 'positive' ? 'bg-green-100 text-green-700' : sentiment.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}">
													{sentiment.sentiment}
												</span>
												{#if sentiment.isFakeRisk}
													<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700" title={sentiment.fakeRiskReason}>
														⚠ Flagged
													</span>
												{/if}
											{/if}
										</div>
										<div class="flex items-center gap-2 mb-2">
											{#each Array(5) as _, i}
												<svg
													class="w-5 h-5 {i < review.rating ? 'text-yellow-400' : 'text-gray-300'}"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
													/>
												</svg>
											{/each}
											{#if review.created_at}
												<span class="text-gray-500 text-sm ml-2">
													{new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
												</span>
											{/if}
										</div>
									</div>
								</div>
								{#if review.comment}
									<p class="text-gray-800 mt-3 mb-3 leading-relaxed">{review.comment}</p>
								{/if}
								{#if reviewSentiments[review.id]?.keyFeatures.length > 0}
									<div class="mt-3 mb-3 flex flex-wrap gap-2">
										{#each reviewSentiments[review.id].keyFeatures as feature}
											<span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
												{feature}
											</span>
										{/each}
									</div>
								{/if}
								{#if data.user && review.user_id === data.user.id}
									<div class="mt-4 pt-4 border-t-2 border-indigo-200">
										<div class="flex items-center gap-2 mb-3">
											<svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
											</svg>
											<p class="text-sm font-semibold text-indigo-900 m-0">This is your review. You can update or delete it anytime.</p>
										</div>
										<div class="flex gap-3">
											<button
												type="button"
												on:click={() => {
													editingReviewId = review.id;
													editingRating = review.rating;
													editingComment = review.comment || '';
												}}
												class="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none px-5 py-2.5 rounded-lg cursor-pointer text-sm font-semibold transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5"
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
												</svg>
												Update Review
											</button>
											<form method="POST" action="?/deleteReview" use:enhance class="inline">
												<input type="hidden" name="review_id" value={review.id} />
												<button
													type="submit"
													class="inline-flex items-center gap-2 bg-red-500 text-white border-none px-5 py-2.5 rounded-lg cursor-pointer text-sm font-semibold transition-all hover:bg-red-600 hover:shadow-lg transform hover:-translate-y-0.5"
													on:click={(e) => {
														if (!confirm('Are you sure you want to delete your review? This action cannot be undone.')) {
															e.preventDefault();
														}
													}}
												>
													<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
													</svg>
													Delete Review
												</button>
											</form>
										</div>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

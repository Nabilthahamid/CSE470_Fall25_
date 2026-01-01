<!-- VIEW: Content Management Page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { PageData, ActionData } from './$types';
	import { uploadImage } from '$lib/utils/storage';

	export let data: PageData;
	export let form: ActionData;
	export let params: Record<string, string> = {};

	let activeTab = data?.activeTab || 'homepage';
	let showBannerForm = false;
	let showPageForm = false;
	let showFAQForm = false;
	let editingBanner: any = null;
	let editingPage: any = null;
	let editingFAQ: any = null;

	// Homepage form
	let heroTitle = data?.homepageContent?.hero_title || '';
	let heroSubtitle = data?.homepageContent?.hero_subtitle || '';
	let heroImageUrl = data?.homepageContent?.hero_image_url || '';
	let featuredTitle = data?.homepageContent?.featured_section_title || '';
	let featuredContent = data?.homepageContent?.featured_section_content || '';
	let heroImageFile: File | null = null;

	// Banner form
	let bannerTitle = '';
	let bannerImageUrl = '';
	let bannerLinkUrl = '';
	let bannerLinkText = '';
	let bannerPosition: 'top' | 'middle' | 'bottom' = 'top';
	let bannerOrder = 0;
	let bannerIsActive = true;
	let bannerStartDate = '';
	let bannerEndDate = '';
	let bannerImageFile: File | null = null;

	// Page form
	let pageSlug = '';
	let pageTitle = '';
	let pageContent = '';
	let pageMetaTitle = '';
	let pageMetaDescription = '';
	let pageIsPublished = true;

	// FAQ form
	let faqQuestion = '';
	let faqAnswer = '';
	let faqCategory = '';
	let faqOrder = 0;
	let faqIsPublished = true;

	async function handleHeroImageUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		try {
			heroImageUrl = await uploadImage(file, 'product-images');
		} catch (error: any) {
			alert('Image upload failed: ' + error.message);
		}
	}

	async function handleBannerImageUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		try {
			bannerImageUrl = await uploadImage(file, 'product-images');
		} catch (error: any) {
			alert('Image upload failed: ' + error.message);
		}
	}

	function editBanner(banner: any) {
		editingBanner = banner;
		bannerTitle = banner.title;
		bannerImageUrl = banner.image_url;
		bannerLinkUrl = banner.link_url || '';
		bannerLinkText = banner.link_text || '';
		bannerPosition = banner.position;
		bannerOrder = banner.order;
		bannerIsActive = banner.is_active;
		bannerStartDate = banner.start_date ? banner.start_date.split('T')[0] : '';
		bannerEndDate = banner.end_date ? banner.end_date.split('T')[0] : '';
		showBannerForm = true;
	}

	function editPage(page: any) {
		editingPage = page;
		pageSlug = page.slug;
		pageTitle = page.title;
		pageContent = page.content;
		pageMetaTitle = page.meta_title || '';
		pageMetaDescription = page.meta_description || '';
		pageIsPublished = page.is_published;
		showPageForm = true;
	}

	function editFAQ(faq: any) {
		editingFAQ = faq;
		faqQuestion = faq.question;
		faqAnswer = faq.answer;
		faqCategory = faq.category || '';
		faqOrder = faq.order;
		faqIsPublished = faq.is_published;
		showFAQForm = true;
	}

	function resetBannerForm() {
		editingBanner = null;
		bannerTitle = '';
		bannerImageUrl = '';
		bannerLinkUrl = '';
		bannerLinkText = '';
		bannerPosition = 'top';
		bannerOrder = 0;
		bannerIsActive = true;
		bannerStartDate = '';
		bannerEndDate = '';
		showBannerForm = false;
	}

	function resetPageForm() {
		editingPage = null;
		pageSlug = '';
		pageTitle = '';
		pageContent = '';
		pageMetaTitle = '';
		pageMetaDescription = '';
		pageIsPublished = true;
		showPageForm = false;
	}

	function resetFAQForm() {
		editingFAQ = null;
		faqQuestion = '';
		faqAnswer = '';
		faqCategory = '';
		faqOrder = 0;
		faqIsPublished = true;
		showFAQForm = false;
	}
</script>

<svelte:head>
	<title>Content Management - Admin Dashboard</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<h1 class="text-3xl font-bold text-gray-900 mb-8">Content Management</h1>

	<!-- Tabs -->
	<div class="mb-6 border-b border-gray-200">
		<div class="flex gap-4">
			<button
				on:click={() => activeTab = 'homepage'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'homepage' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Homepage
			</button>
			<button
				on:click={() => activeTab = 'banners'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'banners' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Banners
			</button>
			<button
				on:click={() => activeTab = 'pages'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'pages' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Static Pages
			</button>
			<button
				on:click={() => activeTab = 'faqs'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'faqs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				FAQs
			</button>
		</div>
	</div>

	{#if form?.error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
			{form.error}
		</div>
	{/if}

	{#if form?.success}
		<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
			Saved successfully!
		</div>
	{/if}

	<!-- Homepage Tab -->
	{#if activeTab === 'homepage'}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<h2 class="text-2xl font-bold text-gray-900 mb-6">Homepage Content</h2>
			<form method="POST" action="?/updateHomepage" use:enhance>
				<div class="space-y-6">
					<div>
						<label class="block mb-2 font-medium">Hero Title</label>
						<input
							type="text"
							name="hero_title"
							bind:value={heroTitle}
							class="w-full p-3 border-2 border-gray-300 rounded-lg"
							placeholder="Welcome to TinyTech"
						/>
					</div>
					<div>
						<label class="block mb-2 font-medium">Hero Subtitle</label>
						<input
							type="text"
							name="hero_subtitle"
							bind:value={heroSubtitle}
							class="w-full p-3 border-2 border-gray-300 rounded-lg"
							placeholder="Your one-stop shop for tech products"
						/>
					</div>
					<div>
						<label class="block mb-2 font-medium">Hero Image URL</label>
						<div class="flex gap-2">
							<input
								type="text"
								name="hero_image_url"
								bind:value={heroImageUrl}
								class="flex-1 p-3 border-2 border-gray-300 rounded-lg"
								placeholder="https://example.com/image.jpg"
							/>
							<input
								type="file"
								accept="image/*"
								on:change={handleHeroImageUpload}
								class="p-3 border-2 border-gray-300 rounded-lg"
							/>
						</div>
						{#if heroImageUrl}
							<img src={heroImageUrl} alt="Hero" class="mt-2 max-w-md rounded-lg" />
						{/if}
					</div>
					<div>
						<label class="block mb-2 font-medium">Featured Section Title</label>
						<input
							type="text"
							name="featured_section_title"
							bind:value={featuredTitle}
							class="w-full p-3 border-2 border-gray-300 rounded-lg"
						/>
					</div>
					<div>
						<label class="block mb-2 font-medium">Featured Section Content</label>
						<textarea
							name="featured_section_content"
							bind:value={featuredContent}
							rows="6"
							class="w-full p-3 border-2 border-gray-300 rounded-lg"
						></textarea>
					</div>
					<button type="submit" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
						Save Homepage Content
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Banners Tab -->
	{#if activeTab === 'banners'}
		<div class="space-y-6">
			<div class="flex justify-between items-center">
				<h2 class="text-2xl font-bold text-gray-900">Banner Management</h2>
				<button
					on:click={() => {
						resetBannerForm();
						showBannerForm = true;
					}}
					class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
				>
					+ Add Banner
				</button>
			</div>

			{#if showBannerForm}
				<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
					<h3 class="text-xl font-bold text-gray-900 mb-4">
						{editingBanner ? 'Edit Banner' : 'Create New Banner'}
					</h3>
					<form
						method="POST"
						action={editingBanner ? '?/updateBanner' : '?/createBanner'}
						use:enhance
					>
						{#if editingBanner}
							<input type="hidden" name="id" value={editingBanner.id} />
						{/if}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label class="block mb-2 font-medium">Title *</label>
								<input
									type="text"
									name="title"
									bind:value={bannerTitle}
									required
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Position</label>
								<select name="position" bind:value={bannerPosition} class="w-full p-3 border-2 border-gray-300 rounded-lg">
									<option value="top">Top</option>
									<option value="middle">Middle</option>
									<option value="bottom">Bottom</option>
								</select>
							</div>
							<div>
								<label class="block mb-2 font-medium">Image URL *</label>
								<div class="flex gap-2">
									<input
										type="text"
										name="image_url"
										bind:value={bannerImageUrl}
										required
										class="flex-1 p-3 border-2 border-gray-300 rounded-lg"
									/>
									<input
										type="file"
										accept="image/*"
										on:change={handleBannerImageUpload}
										class="p-3 border-2 border-gray-300 rounded-lg"
									/>
								</div>
							</div>
							<div>
								<label class="block mb-2 font-medium">Order</label>
								<input
									type="number"
									name="order"
									bind:value={bannerOrder}
									min="0"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Link URL</label>
								<input
									type="url"
									name="link_url"
									bind:value={bannerLinkUrl}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Link Text</label>
								<input
									type="text"
									name="link_text"
									bind:value={bannerLinkText}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label for="banner-start-date" class="block mb-2 font-medium">Start Date</label>
								<input
									id="banner-start-date"
									type="date"
									name="start_date"
									bind:value={bannerStartDate}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label for="banner-end-date" class="block mb-2 font-medium">End Date</label>
								<input
									id="banner-end-date"
									type="date"
									name="end_date"
									bind:value={bannerEndDate}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
						</div>
						<div class="mt-4">
							<label class="flex items-center gap-2">
								<input
									type="checkbox"
									name="is_active"
									bind:checked={bannerIsActive}
									class="w-4 h-4"
								/>
								<span>Active</span>
							</label>
						</div>
						<div class="mt-6 flex gap-3">
							<button type="submit" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
								{editingBanner ? 'Update' : 'Create'} Banner
							</button>
							<button type="button" on:click={resetBannerForm} class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">
								Cancel
							</button>
						</div>
					</form>
				</div>
			{/if}

			<!-- Banners List -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h3 class="text-xl font-bold text-gray-900 mb-4">All Banners</h3>
				<div class="space-y-4">
					{#each (data?.banners || []) as banner}
						<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
							<div class="flex items-center gap-4">
								{#if banner.image_url}
									<img src={banner.image_url} alt={banner.title} class="w-24 h-16 object-cover rounded" />
								{/if}
								<div>
									<h4 class="font-semibold text-gray-900">{banner.title}</h4>
									<p class="text-sm text-gray-600">
										Position: {banner.position} • Order: {banner.order} • 
										<span class={banner.is_active ? 'text-green-600' : 'text-gray-400'}>
											{banner.is_active ? 'Active' : 'Inactive'}
										</span>
									</p>
								</div>
							</div>
							<div class="flex gap-2">
								<button
									on:click={() => editBanner(banner)}
									class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
								>
									Edit
								</button>
								<form method="POST" action="?/deleteBanner" use:enhance class="inline">
									<input type="hidden" name="id" value={banner.id} />
									<button
										type="submit"
										class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
										on:click={(e) => {
											if (!confirm('Delete this banner?')) e.preventDefault();
										}}
									>
										Delete
									</button>
								</form>
							</div>
						</div>
					{:else}
						<p class="text-gray-500 text-center py-8">No banners yet. Create your first banner!</p>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Static Pages Tab -->
	{#if activeTab === 'pages'}
		<div class="space-y-6">
			<div class="flex justify-between items-center">
				<h2 class="text-2xl font-bold text-gray-900">Static Pages</h2>
				<button
					on:click={() => {
						resetPageForm();
						showPageForm = true;
					}}
					class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
				>
					+ Add Page
				</button>
			</div>

			{#if showPageForm}
				<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
					<h3 class="text-xl font-bold text-gray-900 mb-4">
						{editingPage ? 'Edit Page' : 'Create New Page'}
					</h3>
					<form method="POST" action={editingPage ? '?/updatePage' : '?/createPage'} use:enhance>
						{#if editingPage}
							<input type="hidden" name="id" value={editingPage.id} />
						{/if}
						<div class="space-y-4">
							<div>
								<label class="block mb-2 font-medium">Slug * (e.g., about, terms, privacy)</label>
								<input
									type="text"
									name="slug"
									bind:value={pageSlug}
									required
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
									placeholder="about"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Title *</label>
								<input
									type="text"
									name="title"
									bind:value={pageTitle}
									required
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Content *</label>
								<textarea
									name="content"
									bind:value={pageContent}
									required
									rows="10"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								></textarea>
							</div>
							<div>
								<label class="block mb-2 font-medium">Meta Title (SEO)</label>
								<input
									type="text"
									name="meta_title"
									bind:value={pageMetaTitle}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Meta Description (SEO)</label>
								<textarea
									name="meta_description"
									bind:value={pageMetaDescription}
									rows="3"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								></textarea>
							</div>
							<div>
								<label class="flex items-center gap-2">
									<input
										type="checkbox"
										name="is_published"
										bind:checked={pageIsPublished}
										class="w-4 h-4"
									/>
									<span>Published</span>
								</label>
							</div>
							<div class="flex gap-3">
								<button type="submit" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
									{editingPage ? 'Update' : 'Create'} Page
								</button>
								<button type="button" on:click={resetPageForm} class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">
									Cancel
								</button>
							</div>
						</div>
					</form>
				</div>
			{/if}

			<!-- Pages List -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h3 class="text-xl font-bold text-gray-900 mb-4">All Pages</h3>
				<div class="space-y-4">
					{#each (data?.pages || []) as page}
						<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
							<div>
								<h4 class="font-semibold text-gray-900">{page.title}</h4>
								<p class="text-sm text-gray-600">
									Slug: /{page.slug} • 
									<span class={page.is_published ? 'text-green-600' : 'text-gray-400'}>
										{page.is_published ? 'Published' : 'Draft'}
									</span>
								</p>
							</div>
							<div class="flex gap-2">
								<button
									on:click={() => editPage(page)}
									class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
								>
									Edit
								</button>
								<form method="POST" action="?/deletePage" use:enhance class="inline">
									<input type="hidden" name="id" value={page.id} />
									<button
										type="submit"
										class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
										on:click={(e) => {
											if (!confirm('Delete this page?')) e.preventDefault();
										}}
									>
										Delete
									</button>
								</form>
							</div>
						</div>
					{:else}
						<p class="text-gray-500 text-center py-8">No pages yet. Create your first page!</p>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- FAQs Tab -->
	{#if activeTab === 'faqs'}
		<div class="space-y-6">
			<div class="flex justify-between items-center">
				<h2 class="text-2xl font-bold text-gray-900">FAQ Management</h2>
				<button
					on:click={() => {
						resetFAQForm();
						showFAQForm = true;
					}}
					class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
				>
					+ Add FAQ
				</button>
			</div>

			{#if showFAQForm}
				<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
					<h3 class="text-xl font-bold text-gray-900 mb-4">
						{editingFAQ ? 'Edit FAQ' : 'Create New FAQ'}
					</h3>
					<form method="POST" action={editingFAQ ? '?/updateFAQ' : '?/createFAQ'} use:enhance>
						{#if editingFAQ}
							<input type="hidden" name="id" value={editingFAQ.id} />
						{/if}
						<div class="space-y-4">
							<div>
								<label class="block mb-2 font-medium">Question *</label>
								<input
									type="text"
									name="question"
									bind:value={faqQuestion}
									required
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label class="block mb-2 font-medium">Answer *</label>
								<textarea
									name="answer"
									bind:value={faqAnswer}
									required
									rows="6"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								></textarea>
							</div>
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="block mb-2 font-medium">Category</label>
									<input
										type="text"
										name="category"
										bind:value={faqCategory}
										class="w-full p-3 border-2 border-gray-300 rounded-lg"
										placeholder="e.g., Shipping, Returns"
									/>
								</div>
								<div>
									<label class="block mb-2 font-medium">Order</label>
									<input
										type="number"
										name="order"
										bind:value={faqOrder}
										min="0"
										class="w-full p-3 border-2 border-gray-300 rounded-lg"
									/>
								</div>
							</div>
							<div>
								<label class="flex items-center gap-2">
									<input
										type="checkbox"
										name="is_published"
										bind:checked={faqIsPublished}
										class="w-4 h-4"
									/>
									<span>Published</span>
								</label>
							</div>
							<div class="flex gap-3">
								<button type="submit" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
									{editingFAQ ? 'Update' : 'Create'} FAQ
								</button>
								<button type="button" on:click={resetFAQForm} class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">
									Cancel
								</button>
							</div>
						</div>
					</form>
				</div>
			{/if}

			<!-- FAQs List -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h3 class="text-xl font-bold text-gray-900 mb-4">All FAQs</h3>
				<div class="space-y-4">
					{#each (data?.faqs || []) as faq}
						<div class="p-4 border border-gray-200 rounded-lg">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<h4 class="font-semibold text-gray-900 mb-2">{faq.question}</h4>
									<p class="text-gray-600 mb-2">{faq.answer}</p>
									<div class="flex items-center gap-4 text-sm text-gray-500">
										{#if faq.category}
											<span>Category: {faq.category}</span>
										{/if}
										<span>Order: {faq.order}</span>
										<span class={faq.is_published ? 'text-green-600' : 'text-gray-400'}>
											{faq.is_published ? 'Published' : 'Draft'}
										</span>
									</div>
								</div>
								<div class="flex gap-2 ml-4">
									<button
										on:click={() => editFAQ(faq)}
										class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
									>
										Edit
									</button>
									<form method="POST" action="?/deleteFAQ" use:enhance class="inline">
										<input type="hidden" name="id" value={faq.id} />
										<button
											type="submit"
											class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
											on:click={(e) => {
												if (!confirm('Delete this FAQ?')) e.preventDefault();
											}}
										>
											Delete
										</button>
									</form>
								</div>
							</div>
						</div>
					{:else}
						<p class="text-gray-500 text-center py-8">No FAQs yet. Create your first FAQ!</p>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>


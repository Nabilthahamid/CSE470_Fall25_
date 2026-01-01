<!-- VIEW: FAQ Page -->
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Frequently Asked Questions - TinyTech</title>
	<meta name="description" content="Find answers to frequently asked questions about TinyTech" />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<div class="text-center mb-12">
		<h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
			Frequently Asked Questions
		</h1>
		<p class="text-gray-600 text-lg">Find answers to common questions about our products and services</p>
	</div>

	{#if data.error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
			{data.error}
		</div>
	{/if}

	{#if Object.keys(data.faqsByCategory).length > 0}
		<!-- FAQs by Category -->
		{#each Object.entries(data.faqsByCategory) as [category, faqs]}
			<div class="mb-12">
				<h2 class="text-2xl font-bold text-gray-900 mb-6">{category}</h2>
				<div class="space-y-4">
					{#each faqs as faq}
						<details class="group bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors shadow-sm">
							<summary class="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:text-indigo-600 transition-colors list-none flex items-center justify-between">
								<span>{faq.question}</span>
								<svg class="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
								</svg>
							</summary>
							<div class="px-6 pb-4 text-gray-700 prose prose-sm max-w-none">
								{@html faq.answer}
							</div>
						</details>
					{/each}
				</div>
			</div>
		{/each}
	{/if}

	{#if data.uncategorizedFAQs.length > 0}
		<!-- Uncategorized FAQs -->
		<div class="mb-12">
			{#if Object.keys(data.faqsByCategory).length > 0}
				<h2 class="text-2xl font-bold text-gray-900 mb-6">General</h2>
			{/if}
			<div class="space-y-4">
				{#each data.uncategorizedFAQs as faq}
					<details class="group bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors shadow-sm">
						<summary class="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:text-indigo-600 transition-colors list-none flex items-center justify-between">
							<span>{faq.question}</span>
							<svg class="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
							</svg>
						</summary>
						<div class="px-6 pb-4 text-gray-700 prose prose-sm max-w-none">
							{@html faq.answer}
						</div>
					</details>
				{/each}
			</div>
		</div>
	{/if}

	{#if data.faqs.length === 0}
		<div class="bg-white rounded-xl shadow-lg p-12 text-center">
			<div class="text-6xl mb-4">❓</div>
			<h3 class="text-2xl font-bold text-gray-800 mb-2">No FAQs Available</h3>
			<p class="text-gray-600">Check back soon for frequently asked questions.</p>
		</div>
	{/if}
</div>


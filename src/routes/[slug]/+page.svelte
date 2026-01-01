<!-- VIEW: Static Page -->
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.page.meta_title || data.page.title} - TinyTech</title>
	<meta name="description" content={data.page.meta_description || ''} />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<article class="bg-white rounded-xl shadow-lg p-8 md:p-12">
		<h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
			{data.page.title}
		</h1>
		<div class="prose prose-lg max-w-none text-gray-700">
			{@html data.page.content}
		</div>
	</article>
</div>


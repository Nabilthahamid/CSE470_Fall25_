<!-- COMPONENT: Safe Image with error handling -->
<script lang="ts">
	export let src: string | null | undefined;
	export let alt: string = '';
	export let class: string = '';
	export let fallbackSrc: string = '/placeholder-image.png'; // Default placeholder

	let imageError = false;
	let currentSrc = src;

	function handleError() {
		if (!imageError) {
			imageError = true;
			currentSrc = fallbackSrc;
		}
	}

	$: {
		if (src && !imageError) {
			currentSrc = src;
		}
	}
</script>

{#if currentSrc}
	<img
		src={currentSrc}
		alt={alt}
		class={class}
		on:error={handleError}
		loading="lazy"
	/>
{:else}
	<div class="bg-gray-200 dark:bg-gray-700 flex items-center justify-center {class}">
		<svg
			class="w-12 h-12 text-gray-400"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
			/>
		</svg>
	</div>
{/if}


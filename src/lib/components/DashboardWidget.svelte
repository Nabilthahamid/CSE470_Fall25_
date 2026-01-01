<!-- VIEW: Reusable Dashboard Widget Component -->
<script lang="ts">
	export let widgetId: string;
	export let title: string;
	export let visible: boolean = true;
	export let draggable: boolean = true;
</script>

{#if visible}
	<div
		class="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all"
		data-widget-id={widgetId}
		draggable={draggable}
	>
		<h3 class="text-lg font-bold text-gray-900 mb-4">{title}</h3>
		<slot />
	</div>
{/if}


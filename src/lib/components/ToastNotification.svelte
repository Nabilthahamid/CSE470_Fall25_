<!-- COMPONENT: Toast Notification Container -->
<script lang="ts">
	import { toast } from '$lib/stores/toast';
	import type { Toast } from '$lib/stores/toast';

	function getIcon(type: Toast['type']) {
		switch (type) {
			case 'success':
				return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
			case 'error':
				return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
			case 'warning':
				return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
			case 'info':
				return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
			default:
				return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
		}
	}

	function getColors(type: Toast['type']) {
		switch (type) {
			case 'success':
				return {
					bg: 'bg-green-50',
					border: 'border-green-200',
					text: 'text-green-800',
					icon: 'text-green-400',
					button: 'hover:bg-green-100'
				};
			case 'error':
				return {
					bg: 'bg-red-50',
					border: 'border-red-200',
					text: 'text-red-800',
					icon: 'text-red-400',
					button: 'hover:bg-red-100'
				};
			case 'warning':
				return {
					bg: 'bg-yellow-50',
					border: 'border-yellow-200',
					text: 'text-yellow-800',
					icon: 'text-yellow-400',
					button: 'hover:bg-yellow-100'
				};
			case 'info':
				return {
					bg: 'bg-blue-50',
					border: 'border-blue-200',
					text: 'text-blue-800',
					icon: 'text-blue-400',
					button: 'hover:bg-blue-100'
				};
			default:
				return {
					bg: 'bg-gray-50',
					border: 'border-gray-200',
					text: 'text-gray-800',
					icon: 'text-gray-400',
					button: 'hover:bg-gray-100'
				};
		}
	}
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
	{#each $toast as item (item.id)}
		{@const colors = getColors(item.type)}
		<div
			class="pointer-events-auto animate-slide-in-right {colors.bg} {colors.border} border-2 rounded-lg shadow-lg p-4 flex items-start gap-3 transform transition-all duration-300"
			role="alert"
		>
			<!-- Icon -->
			<svg
				class="w-6 h-6 flex-shrink-0 {colors.icon} mt-0.5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getIcon(item.type)}></path>
			</svg>
			
			<!-- Message -->
			<div class="flex-1 min-w-0">
				<p class="m-0 {colors.text} font-medium text-sm leading-relaxed break-words">
					{item.message}
				</p>
			</div>
			
			<!-- Close Button -->
			<button
				type="button"
				on:click={() => toast.remove(item.id)}
				class="flex-shrink-0 {colors.text} {colors.button} rounded p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
				aria-label="Close notification"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>
		</div>
	{/each}
</div>

<style>
	@keyframes slide-in-right {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.animate-slide-in-right {
		animation: slide-in-right 0.3s ease-out;
	}
</style>


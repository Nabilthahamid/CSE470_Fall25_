<script lang="ts">
	import type { Snippet } from 'svelte';

	interface ButtonProps {
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		type = 'button',
		class: className = '',
		onclick,
		children
	}: ButtonProps = $props();

	const variants = {
		primary: 'bg-blue-600 hover:bg-blue-700 text-white',
		secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
		outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
		ghost: 'hover:bg-gray-100 text-gray-700'
	};

	const sizes = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-6 py-3 text-lg'
	};
</script>

<button
	{type}
	{disabled}
	{onclick}
	class="rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed {variants[variant]} {sizes[size]} {className}"
>
	{#if children}
		{@render children()}
	{/if}
</button>


<script lang="ts">
	interface InputProps {
		type?: string;
		placeholder?: string;
		value?: string;
		disabled?: boolean;
		required?: boolean;
		class?: string;
		name?: string;
		id?: string;
	}

	let {
		type = 'text',
		placeholder = '',
		value = $bindable(),
		disabled = false,
		required = false,
		class: className = '',
		name,
		id
	}: InputProps = $props();
</script>

<input
	{type}
	{placeholder}
	bind:value
	{disabled}
	{required}
	{name}
	{id}
	class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed {className}"
/>


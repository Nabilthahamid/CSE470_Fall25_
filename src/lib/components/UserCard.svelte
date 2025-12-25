<!-- VIEW: Reusable user card component -->
<script lang="ts">
	import type { User } from '$lib/models/User';

	export let user: User;
</script>

<a href="/users/{user.id}" class="block p-6 border border-white/10 rounded-lg bg-white/5 no-underline text-inherit transition-all hover:bg-white/10 hover:border-indigo-400 hover:-translate-y-0.5 hover:shadow-lg">
	<h3 class="m-0 mb-2 text-white text-xl font-semibold">{user.name}</h3>
	<p class="text-gray-400 my-1">{user.email}</p>
	{#if user.created_at}
		<p class="text-sm text-gray-500 mt-2 mb-0">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
	{/if}
</a>


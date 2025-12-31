<!-- VIEW: Reusable user card component -->
<script lang="ts">
	import type { User } from '$lib/models/User';

	export let user: User;
</script>

<a href="/users/{user.id}" class="block p-6 border-2 border-gray-300 rounded-lg bg-white shadow-md no-underline text-inherit transition-all hover:bg-gray-50 hover:border-indigo-500 hover:-translate-y-1 hover:shadow-xl">
	<h3 class="m-0 mb-3 text-gray-900 text-xl font-bold">{user.name}</h3>
	<p class="text-gray-700 my-2 text-base font-medium">{user.email}</p>
	{#if user.created_at}
		<p class="text-sm text-gray-600 mt-3 mb-0 pt-3 border-t border-gray-200">
			<span class="font-semibold">Joined:</span> {new Date(user.created_at).toLocaleDateString()}
		</p>
	{/if}
</a>


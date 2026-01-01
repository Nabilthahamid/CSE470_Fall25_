<!-- VIEW: Logout page (redirects immediately) -->
<script lang="ts">
	import { enhance } from '$app/forms';
	
	export let params: Record<string, string> = {};
</script>

<form method="POST" use:enhance>
	<button type="submit">Logging out...</button>
</form>


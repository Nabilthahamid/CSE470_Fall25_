<script lang="ts">
	import { User, ShoppingCart, LogOut, LogIn, Home, Package } from "lucide-svelte";
	import type { User as SupabaseUser } from "@supabase/supabase-js";
	import { cart } from "$lib/stores/cart";
	import { onMount } from "svelte";
	import { enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";

	interface Props {
		user: SupabaseUser | null;
		role: "user" | "admin" | null;
	}

	let { user, role }: Props = $props();

	let cartItems = $state<any[]>([]);
	let unsubscribe: (() => void) | null = null;

	onMount(() => {
		unsubscribe = cart.subscribe((items) => {
			cartItems = items;
		});
		
		return () => {
			if (unsubscribe) unsubscribe();
		};
	});

	const cartItemCount = $derived.by(() => {
		return cartItems.reduce((sum, item) => sum + item.quantity, 0);
	});

	// Handle logout form submission
	async function handleLogout({ result, update }: any) {
		// Clear cart
		cart.clear();
		
		// Update the form state (this calls the server action which deletes cookies)
		if (update && typeof update === 'function') {
			await update();
		}
		
		// Force a full page reload to ensure user data is cleared from the UI
		// This ensures the email and profile dropdown disappear immediately
		window.location.href = '/auth';
	}
</script>

<header class="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
	<nav class="container mx-auto px-4 py-4">
		<div class="flex items-center justify-between">
			<!-- Logo/Brand -->
			<a href="/" class="flex items-center gap-2 text-xl font-bold text-slate-900">
				<ShoppingCart class="h-6 w-6" />
				<span>TinyShop</span>
			</a>

			<!-- Right Side Actions -->
			<div class="flex items-center gap-4">
				<!-- Home Button -->
				<a
					href="/"
					class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
					title="Home"
				>
					<Home class="h-5 w-5" />
					<span class="hidden sm:inline">Home</span>
				</a>
				{#if user}
					<!-- Orders Button (Logged In Users) -->
					<a
						href="/orders"
						class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
						title="My Orders"
					>
						<Package class="h-5 w-5" />
						<span class="hidden sm:inline">Orders</span>
					</a>
				{/if}
				{#if user && role === "user"}
					<!-- Cart Button (Only for regular users, not admins) -->
					<a
						href="/cart"
						class="relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
						title="Shopping Cart"
					>
						<ShoppingCart class="h-5 w-5" />
						<span class="hidden sm:inline">Cart</span>
						{#if cartItemCount > 0}
							<span class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
								{cartItemCount}
							</span>
						{/if}
					</a>
				{/if}

				{#if user}
					<!-- Profile Dropdown (Logged In) -->
					<div class="relative group">
						<button
							type="button"
							class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
							title="Profile"
						>
							<User class="h-5 w-5" />
							<span class="hidden sm:inline">
								{user.email?.split("@")[0] || "Profile"}
							</span>
						</button>

						<!-- Dropdown Menu -->
						<div
							class="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
						>
							<div class="p-2">
								<div class="px-3 py-2 text-sm text-slate-600 border-b border-slate-100">
									<p class="font-medium text-slate-900">{user.email}</p>
									{#if role === "admin"}
										<p class="text-xs text-slate-500 mt-1">Admin</p>
									{/if}
								</div>
								{#if role === "admin"}
									<a
										href="/admin"
										class="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded"
									>
										Admin Dashboard
									</a>
								{/if}
								<form method="POST" action="/auth?/logout" use:enhance={handleLogout} class="w-full">
									<button
										type="submit"
										class="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded flex items-center gap-2"
									>
										<LogOut class="h-4 w-4" />
										Logout
									</button>
								</form>
							</div>
						</div>
					</div>
				{:else}
					<!-- Login Button (Not Logged In) - Shows where email was -->
					<a
						href="/auth?tab=login"
						class="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
					>
						<LogIn class="h-5 w-5" />
						<span class="hidden sm:inline">Login</span>
					</a>
				{/if}
			</div>
		</div>
	</nav>
</header>

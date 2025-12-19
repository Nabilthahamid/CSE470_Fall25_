<script lang="ts">
	import { User, ShoppingCart, LogOut, LogIn, Home, Package } from "lucide-svelte";
	import type { User as SupabaseUser } from "@supabase/supabase-js";
	import { cart } from "$lib/stores/cart";
	import { onMount } from "svelte";

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

	// Handle logout - use fetch to submit logout request
	async function handleLogout() {
		cart.clear();
		
		try {
			// Submit logout request
			const response = await fetch('/auth?/logout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				credentials: 'same-origin'
			});
			
			// Redirect to login page after logout
			if (response.redirected) {
				window.location.href = response.url;
			} else {
				window.location.href = '/auth?tab=login';
			}
		} catch (error) {
			// If fetch fails, still redirect to login page
			console.error('Logout error:', error);
			window.location.href = '/auth?tab=login';
		}
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
				<!-- Login Button (Always Visible) -->
				{#if !user}
					<a
						href="/auth?tab=login"
						class="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
						title="Login"
					>
						<LogIn class="h-5 w-5" />
						<span class="hidden sm:inline">Login</span>
					</a>
				{/if}
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
					
					<!-- Logout Button (Always Visible) -->
					<button
						type="button"
						onclick={handleLogout}
						class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
						title="Logout"
					>
						<LogOut class="h-5 w-5" />
						<span class="hidden sm:inline">Logout</span>
					</button>
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
								<button
									type="button"
									onclick={handleLogout}
									class="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded flex items-center gap-2"
								>
									<LogOut class="h-4 w-4" />
									Logout
								</button>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</nav>
</header>

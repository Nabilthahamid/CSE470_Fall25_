<script lang="ts">
  import "../app.css";
  import { supabase } from "$lib/db/client";
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  let session = $state<any>(null);
  let connectionHealth = $state<number | null>(null);
  let showConnectionTooltip = $state(false);

  onMount(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      session = session;
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, newSession) => {
      session = newSession;
    });

    // Check connection health
    checkHealth();
  });

  async function checkHealth() {
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        const data = await response.json();
        connectionHealth = data.health || 0;
      } else {
        connectionHealth = 0;
      }
    } catch {
      connectionHealth = 0;
    }
  }

  function getHealthColor(health: number | null) {
    if (health === null) return "gray";
    if (health >= 80) return "green";
    if (health >= 60) return "yellow";
    return "red";
  }

  function getHealthStatus(health: number | null) {
    if (health === null) return "Checking...";
    if (health >= 80) return "All systems operational";
    if (health >= 60) return "Some issues detected";
    return "Setup required";
  }
</script>

<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="bg-white shadow-sm border-b">
    <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <a href="/" class="text-2xl font-bold text-blue-600">E-Commerce</a>

        <!-- Connection Status Indicator -->
        <div class="relative">
          <a
            href="/test-connection"
            class="flex items-center gap-2 px-3 py-1 rounded-full border-2 transition-all hover:shadow-md {getHealthColor(
              connectionHealth
            ) === 'green'
              ? 'border-green-300 bg-green-50 hover:bg-green-100'
              : getHealthColor(connectionHealth) === 'yellow'
                ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100'
                : getHealthColor(connectionHealth) === 'red'
                  ? 'border-red-300 bg-red-50 hover:bg-red-100'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}"
            onmouseenter={() => (showConnectionTooltip = true)}
            onmouseleave={() => (showConnectionTooltip = false)}
            title="Check Supabase Connection"
          >
            <span class="text-sm">
              {#if connectionHealth === null}
                ⏳
              {:else if connectionHealth >= 80}
                ✅
              {:else if connectionHealth >= 60}
                ⚠️
              {:else}
                ❌
              {/if}
            </span>
            <span
              class="text-xs font-medium {getHealthColor(connectionHealth) ===
              'green'
                ? 'text-green-700'
                : getHealthColor(connectionHealth) === 'yellow'
                  ? 'text-yellow-700'
                  : getHealthColor(connectionHealth) === 'red'
                    ? 'text-red-700'
                    : 'text-gray-700'}"
            >
              {connectionHealth !== null ? `${connectionHealth}%` : "..."}
            </span>
          </a>

          <!-- Tooltip -->
          {#if showConnectionTooltip}
            <div
              class="absolute top-full left-0 mt-2 bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap z-50 shadow-lg"
            >
              <div class="font-semibold">Supabase Status</div>
              <div class="text-gray-300">
                {getHealthStatus(connectionHealth)}
              </div>
              <div class="text-gray-400 mt-1">Click to view details</div>
              <!-- Tooltip arrow -->
              <div
                class="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"
              ></div>
            </div>
          {/if}
        </div>
      </div>

      <div class="flex items-center gap-4">
        <a href="/products" class="text-gray-700 hover:text-blue-600"
          >Products</a
        >
        <a href="/cart" class="text-gray-700 hover:text-blue-600">Cart</a>
        {#if session}
          <span class="text-gray-700">{session.user.email}</span>
          <form method="POST" action="/auth/logout">
            <button type="submit" class="text-gray-700 hover:text-blue-600">
              Sign Out
            </button>
          </form>
        {:else}
          <a href="/auth/login" class="text-gray-700 hover:text-blue-600"
            >Sign In</a
          >
          <a
            href="/auth/signup"
            class="text-gray-700 hover:text-blue-600 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Sign Up
          </a>
        {/if}
      </div>
    </nav>
  </header>

	<!-- Main Content -->
	<main class="flex-1 container mx-auto px-4 py-8">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="bg-gray-100 border-t mt-auto">
		<div class="container mx-auto px-4 py-6 text-center text-gray-600">
			<p>&copy; 2024 E-Commerce Store. All rights reserved.</p>
		</div>
	</footer>
</div>

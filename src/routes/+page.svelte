<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import Button from "$lib/components/ui/Button.svelte";

  let healthStatus = $state<{
    loading: boolean;
    health: number;
    message: string;
    error: string | null;
  }>({
    loading: true,
    health: 0,
    message: "Checking connection...",
    error: null,
  });

  onMount(async () => {
    await checkConnection();
  });

  async function checkConnection() {
    healthStatus.loading = true;
    healthStatus.error = null;

    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        const data = await response.json();
        healthStatus = {
          loading: false,
          health: data.health || 0,
          message: data.message || "Unknown status",
          error: null,
        };
      } else {
        healthStatus = {
          loading: false,
          health: 0,
          message: "Health check failed",
          error: "Could not fetch status",
        };
      }
    } catch (error) {
      healthStatus = {
        loading: false,
        health: 0,
        message: "Connection error",
        error: "Cannot reach server",
      };
    }
  }

  function getStatusColor(health: number) {
    if (health >= 80) return "green";
    if (health >= 60) return "yellow";
    return "red";
  }

  function getStatusEmoji(health: number) {
    if (health >= 80) return "✅";
    if (health >= 60) return "⚠️";
    return "❌";
  }
</script>

<div class="text-center py-16">
  <h1 class="text-4xl font-bold mb-4">Welcome to Our Store</h1>
  <p class="text-xl text-gray-600 mb-8">
    Discover amazing products at great prices
  </p>
  <Button variant="primary" size="lg" on:click={() => goto("/products")}>
    Shop Now
  </Button>

  <!-- Supabase Connection Status Card -->
  <div class="mt-16 max-w-2xl mx-auto">
    <div class="bg-white rounded-lg shadow-md border-2 border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span>🔌</span> Supabase Connection Status
        </h2>
        <button
          onclick={checkConnection}
          disabled={healthStatus.loading}
          class="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {healthStatus.loading ? "Checking..." : "🔄 Refresh"}
        </button>
      </div>

      {#if healthStatus.loading}
        <div class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Checking connection...</p>
        </div>
      {:else}
        <div class="space-y-4">
          <!-- Health Score -->
          <div
            class="flex items-center justify-between p-4 rounded-lg {getStatusColor(
              healthStatus.health
            ) === 'green'
              ? 'bg-green-50 border border-green-200'
              : getStatusColor(healthStatus.health) === 'yellow'
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-red-50 border border-red-200'}"
          >
            <div class="flex items-center gap-3">
              <span class="text-3xl">
                {getStatusEmoji(healthStatus.health)}
              </span>
              <div class="text-left">
                <div
                  class="font-bold text-xl {getStatusColor(
                    healthStatus.health
                  ) === 'green'
                    ? 'text-green-700'
                    : getStatusColor(healthStatus.health) === 'yellow'
                      ? 'text-yellow-700'
                      : 'text-red-700'}"
                >
                  Health: {healthStatus.health}%
                </div>
                <div class="text-sm text-gray-600">{healthStatus.message}</div>
              </div>
            </div>
            <div>
              {#if healthStatus.health >= 80}
                <span
                  class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  Connected
                </span>
              {:else if healthStatus.health >= 60}
                <span
                  class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  Partial
                </span>
              {:else}
                <span
                  class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  Disconnected
                </span>
              {/if}
            </div>
          </div>

          <!-- Status Message -->
          {#if healthStatus.health < 80}
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p class="text-sm text-blue-800">
                {#if healthStatus.health === 0}
                  <strong>⚠️ Setup Required:</strong> Supabase is not configured.
                  Please set up your environment variables and database.
                {:else}
                  <strong>⚠️ Partial Connection:</strong> Some features may not work
                  properly. Check the full diagnostics for details.
                {/if}
              </p>
            </div>
          {/if}

          <!-- Actions -->
          <div class="flex gap-3 justify-center">
            <button
              onclick={() => goto("/test-connection")}
              class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              📊 Full Diagnostics
            </button>
            {#if healthStatus.health < 80}
              <a
                href="https://app.supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                class="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium"
              >
                Open Supabase ↗
              </a>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

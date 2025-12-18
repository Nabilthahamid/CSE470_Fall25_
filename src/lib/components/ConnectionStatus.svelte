<script lang="ts">
  import { onMount } from "svelte";

  let status = $state<{
    health: number;
    message: string;
    color: string;
  }>({
    health: 0,
    message: "Checking...",
    color: "gray",
  });

  let expanded = $state(false);
  let loading = $state(true);

  onMount(async () => {
    await checkStatus();
  });

  async function checkStatus() {
    loading = true;
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        const data = await response.json();
        status = {
          health: data.health || 0,
          message: data.message || "Unknown",
          color: data.health >= 80 ? "green" : data.health >= 60 ? "yellow" : "red",
        };
      } else {
        status = {
          health: 0,
          message: "Health check failed",
          color: "red",
        };
      }
    } catch (error) {
      status = {
        health: 0,
        message: "Cannot reach server",
        color: "red",
      };
    }
    loading = false;
  }
</script>

<div class="fixed bottom-4 right-4 z-50">
  {#if expanded}
    <div class="bg-white border-2 border-gray-200 rounded-lg shadow-xl p-4 w-64">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-sm">Connection Status</h3>
        <button
          onclick={() => (expanded = false)}
          class="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm">Health:</span>
          <span class="font-bold text-{status.color}-600">{status.health}%</span>
        </div>
        <div class="text-xs text-gray-600">{status.message}</div>

        <div class="pt-3 border-t space-y-2">
          <a
            href="/test-connection"
            class="block w-full bg-blue-600 text-white text-center px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Full Diagnostics
          </a>
          <button
            onclick={checkStatus}
            disabled={loading}
            class="block w-full bg-gray-100 text-gray-700 text-center px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? "Checking..." : "Refresh"}
          </button>
        </div>
      </div>
    </div>
  {:else}
    <button
      onclick={() => (expanded = true)}
      class="bg-{status.color}-500 hover:bg-{status.color}-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-colors"
      title="Connection Status: {status.health}%"
    >
      <span class="text-xl">
        {#if loading}
          ⏳
        {:else if status.health >= 80}
          ✓
        {:else if status.health >= 60}
          ⚠
        {:else}
          ✕
        {/if}
      </span>
    </button>
  {/if}
</div>

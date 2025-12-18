<script lang="ts">
  import type { PageData } from "./$types";
  import { invalidateAll } from "$app/navigation";

  let { data }: { data: PageData } = $props();

  let testing = $state(false);

  async function retest() {
    testing = true;
    await invalidateAll();
    testing = false;
  }

  function getHealthColor(score: number) {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  }

  function getHealthBg(score: number) {
    if (score >= 80) return "bg-green-100 border-green-300";
    if (score >= 60) return "bg-yellow-100 border-yellow-300";
    return "bg-red-100 border-red-300";
  }
</script>

<svelte:head>
  <title>Connection Checker - Supabase Status</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-8">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-4xl font-bold mb-2">🔌 Supabase Connection Checker</h1>
    <p class="text-gray-600">
      Comprehensive diagnostic tool for your Supabase and database connections
    </p>
  </div>

  <!-- Health Score -->
  <div class="mb-6 {getHealthBg(data.healthScore)} border-2 rounded-lg p-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold {getHealthColor(data.healthScore)}">
          Health Score: {data.healthScore}%
        </h2>
        <p class="text-sm text-gray-600 mt-1">
          {#if data.healthScore >= 80}
            🎉 All systems operational!
          {:else if data.healthScore >= 60}
            ⚠️ Some features may not work properly
          {:else}
            ❌ Critical issues detected - setup required
          {/if}
        </p>
      </div>
      <button
        onclick={retest}
        disabled={testing}
        class="bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        {testing ? "Testing..." : "🔄 Re-test"}
      </button>
    </div>
    <div class="mt-3 text-xs text-gray-500">
      Last tested: {new Date(data.timestamp).toLocaleString()}
    </div>
  </div>

  <!-- Environment Variables -->
  <div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
      <span>📝</span> Environment Variables
    </h2>
    <div class="space-y-3">
      <div class="flex items-start justify-between border-b pb-2">
        <div class="flex-1">
          <div class="font-medium text-sm">PUBLIC_SUPABASE_URL</div>
          <div class="text-xs text-gray-500 font-mono mt-1">
            {data.connectionStatus.supabaseUrl}
          </div>
        </div>
        <span
          class="px-3 py-1 rounded text-sm {data.connectionStatus
            .supabaseConfigured
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'}"
        >
          {data.connectionStatus.supabaseConfigured ? "✅ Set" : "❌ Missing"}
        </span>
      </div>

      <div class="flex items-start justify-between border-b pb-2">
        <div class="flex-1">
          <div class="font-medium text-sm">PUBLIC_SUPABASE_ANON_KEY</div>
          <div class="text-xs text-gray-500 font-mono mt-1">
            {data.connectionStatus.supabaseAnonKey}
          </div>
        </div>
        <span
          class="px-3 py-1 rounded text-sm {data.connectionStatus
            .supabaseConfigured
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'}"
        >
          {data.connectionStatus.supabaseConfigured ? "✅ Set" : "❌ Missing"}
        </span>
      </div>

      <div class="flex items-start justify-between border-b pb-2">
        <div class="flex-1">
          <div class="font-medium text-sm">SUPABASE_SERVICE_ROLE_KEY</div>
          <div class="text-xs text-gray-500 font-mono mt-1">
            {data.connectionStatus.serviceRoleKey}
          </div>
        </div>
        <span
          class="px-3 py-1 rounded text-sm {data.connectionStatus
            .serviceRoleConfigured
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'}"
        >
          {data.connectionStatus.serviceRoleConfigured
            ? "✅ Set"
            : "⚠️ Optional"}
        </span>
      </div>

      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="font-medium text-sm">DATABASE_URL</div>
          <div class="text-xs text-gray-500 font-mono mt-1 break-all">
            {data.connectionStatus.databaseUrl}
          </div>
        </div>
        <span
          class="px-3 py-1 rounded text-sm {data.connectionStatus
            .databaseConfigured
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'}"
        >
          {data.connectionStatus.databaseConfigured
            ? "✅ Set"
            : "⚠️ Optional"}
        </span>
      </div>
    </div>
  </div>

  <!-- Connection Tests -->
  <div class="grid md:grid-cols-2 gap-6 mb-6">
    <!-- Auth Test -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
        <span>🔐</span> Supabase Auth
      </h3>
      {#if data.authTest.connected}
        <div class="bg-green-50 border border-green-200 text-green-800 p-3 rounded">
          <div class="font-semibold">✅ Connected</div>
          <div class="text-sm mt-1">{data.authTest.details}</div>
        </div>
      {:else}
        <div class="bg-red-50 border border-red-200 text-red-800 p-3 rounded">
          <div class="font-semibold">❌ Failed</div>
          <div class="text-sm mt-1">{data.authTest.details}</div>
          {#if data.authTest.error}
            <div class="text-xs mt-2 font-mono">{data.authTest.error}</div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Supabase DB Test -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
        <span>🗄️</span> Supabase Database
      </h3>
      {#if data.supabaseTest.connected}
        <div class="bg-green-50 border border-green-200 text-green-800 p-3 rounded">
          <div class="font-semibold">✅ Connected</div>
          <div class="text-sm mt-1">{data.supabaseTest.details}</div>
          {#if data.supabaseTest.productCount === 0}
            <div class="text-xs mt-2 text-yellow-700 bg-yellow-50 p-2 rounded">
              ⚠️ No products found. Run SQL schema to add sample products.
            </div>
          {/if}
        </div>
      {:else}
        <div class="bg-red-50 border border-red-200 text-red-800 p-3 rounded">
          <div class="font-semibold">❌ Failed</div>
          <div class="text-sm mt-1">{data.supabaseTest.details}</div>
          {#if data.supabaseTest.error}
            <div class="text-xs mt-2 font-mono">{data.supabaseTest.error}</div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Drizzle Test -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
        <span>⚡</span> Drizzle ORM
      </h3>
      {#if data.drizzleTest.connected}
        <div class="bg-green-50 border border-green-200 text-green-800 p-3 rounded">
          <div class="font-semibold">✅ Connected</div>
          <div class="text-sm mt-1">{data.drizzleTest.details}</div>
        </div>
      {:else}
        <div class="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded">
          <div class="font-semibold">⚠️ Not Available</div>
          <div class="text-sm mt-1">{data.drizzleTest.details}</div>
          {#if data.drizzleTest.error}
            <div class="text-xs mt-2 font-mono">{data.drizzleTest.error}</div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Admin Test -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
        <span>👑</span> Service Role (Admin)
      </h3>
      {#if data.adminTest.connected}
        <div class="bg-green-50 border border-green-200 text-green-800 p-3 rounded">
          <div class="font-semibold">✅ Connected</div>
          <div class="text-sm mt-1">{data.adminTest.details}</div>
        </div>
      {:else}
        <div class="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded">
          <div class="font-semibold">⚠️ Not Available</div>
          <div class="text-sm mt-1">{data.adminTest.details}</div>
          {#if data.adminTest.error}
            <div class="text-xs mt-2 font-mono">{data.adminTest.error}</div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Schema Test -->
  <div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
      <span>📊</span> Database Schema
    </h3>
    {#if data.schemaTest.connected}
      <div class="bg-green-50 border border-green-200 text-green-800 p-3 rounded">
        <div class="font-semibold">✅ {data.schemaTest.details}</div>
        <div class="mt-3 grid grid-cols-2 gap-2">
          {#each data.schemaTest.tables as table}
            <div class="text-sm bg-white border border-green-300 px-3 py-1 rounded">
              ✓ {table}
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded">
        <div class="font-semibold">⚠️ Schema Not Verified</div>
        <div class="text-sm mt-1">{data.schemaTest.details}</div>
        {#if data.schemaTest.tables.length > 0}
          <div class="mt-3">
            <div class="text-sm mb-2">Found tables:</div>
            <div class="grid grid-cols-2 gap-2">
              {#each data.schemaTest.tables as table}
                <div class="text-sm bg-white border border-yellow-300 px-3 py-1 rounded">
                  ✓ {table}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Quick Actions -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
    <h3 class="text-lg font-semibold mb-3">🚀 Quick Actions</h3>
    <div class="grid md:grid-cols-3 gap-4">
      <a
        href="/auth/signup"
        class="bg-white border border-blue-300 text-blue-700 px-4 py-3 rounded-md hover:bg-blue-50 transition-colors text-center font-medium"
      >
        Test Sign Up
      </a>
      <a
        href="/products"
        class="bg-white border border-blue-300 text-blue-700 px-4 py-3 rounded-md hover:bg-blue-50 transition-colors text-center font-medium"
      >
        View Products
      </a>
      <a
        href="https://app.supabase.com"
        target="_blank"
        rel="noopener noreferrer"
        class="bg-white border border-blue-300 text-blue-700 px-4 py-3 rounded-md hover:bg-blue-50 transition-colors text-center font-medium"
      >
        Open Supabase ↗
      </a>
    </div>
  </div>

  <!-- Setup Help -->
  {#if data.healthScore < 80}
    <div class="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
      <h3 class="text-lg font-semibold mb-3">💡 Setup Help</h3>
      <div class="space-y-2 text-sm">
        {#if !data.connectionStatus.supabaseConfigured}
          <div class="flex items-start gap-2">
            <span class="text-red-600">❌</span>
            <div>
              <strong>Add Supabase credentials to .env file</strong>
              <div class="text-xs text-gray-600 mt-1">
                Get them from: Settings → API in your Supabase project
              </div>
            </div>
          </div>
        {/if}
        {#if !data.supabaseTest.connected && data.connectionStatus.supabaseConfigured}
          <div class="flex items-start gap-2">
            <span class="text-red-600">❌</span>
            <div>
              <strong>Run SQL schema in Supabase</strong>
              <div class="text-xs text-gray-600 mt-1">
                Copy supabase-schema.sql → Supabase SQL Editor → Run
              </div>
            </div>
          </div>
        {/if}
        {#if !data.connectionStatus.databaseConfigured}
          <div class="flex items-start gap-2">
            <span class="text-yellow-600">⚠️</span>
            <div>
              <strong>Add DATABASE_URL for Drizzle ORM (optional)</strong>
              <div class="text-xs text-gray-600 mt-1">
                Get it from: Settings → Database → Connection string
              </div>
            </div>
          </div>
        {/if}
        {#if data.supabaseTest.connected && data.supabaseTest.productCount === 0}
          <div class="flex items-start gap-2">
            <span class="text-yellow-600">⚠️</span>
            <div>
              <strong>No products found</strong>
              <div class="text-xs text-gray-600 mt-1">
                The SQL schema includes 5 sample products. Make sure you ran the complete schema.
              </div>
            </div>
          </div>
        {/if}
      </div>
      <div class="mt-4">
        <a
          href="/QUICK_START.md"
          class="text-blue-600 hover:underline text-sm font-medium"
        >
          📖 Read Setup Guide
        </a>
      </div>
    </div>
  {/if}

  <!-- Navigation -->
  <div class="text-center space-x-4">
    <a href="/" class="text-blue-600 hover:underline">← Back to Home</a>
    <span class="text-gray-400">|</span>
    <a href="/products" class="text-blue-600 hover:underline">View Products →</a>
  </div>
</div>

